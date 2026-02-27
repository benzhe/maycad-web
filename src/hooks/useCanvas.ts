import { type RefObject, type MouseEvent, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCadStore } from '../store/cadStore';
import type { Entity, LineEntity, CircleEntity, ArcEntity, RectangleEntity, PolylineEntity, TextEntity } from '../types/entity';
import type { Point } from '../types/geometry';
import { screenToWorld, isEntityInBounds, hitTestEntity, distance } from '../utils/geometry';
import { findSnap } from '../utils/snap';
import { renderCanvas } from '../utils/canvasRenderer';

export function useCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const isPanning = useRef(false);
  const panStart = useRef<Point>({ x: 0, y: 0 });
  const panOrigin = useRef<Point>({ x: 0, y: 0 });
  const isSelecting = useRef(false);
  const selectionStart = useRef<Point>({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  const getWorldPoint = useCallback((e: MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const { pan, zoom } = useCadStore.getState();
    return screenToWorld(screenPt, pan, zoom);
  }, [canvasRef]);

  const getSnappedPoint = useCallback((worldPt: Point): Point => {
    const { entities, zoom, gridSize, gridSnap, setSnapPoint } = useCadStore.getState();
    const snapRadius = 15 / zoom;
    const result = findSnap(worldPt, entities, snapRadius, gridSize, gridSnap);
    setSnapPoint(result.point, result.type);
    return result.point;
  }, []);

  const createEntity = useCallback((points: Point[]): Entity | null => {
    const { activeTool, currentLayerId } = useCadStore.getState();
    const baseProps = {
      id: uuidv4(),
      layerId: currentLayerId,
      color: 'bylayer',
      lineType: 'solid' as const,
      lineWeight: 1,
      selected: false,
    };

    switch (activeTool) {
      case 'line':
        if (points.length < 2) return null;
        return { ...baseProps, type: 'line', startPoint: points[0], endPoint: points[1] } as LineEntity;

      case 'circle':
        if (points.length < 2) return null;
        return { ...baseProps, type: 'circle', center: points[0], radius: distance(points[0], points[1]) } as CircleEntity;

      case 'arc':
        if (points.length < 3) return null;
        return {
          ...baseProps,
          type: 'arc',
          center: points[0],
          radius: distance(points[0], points[1]),
          startAngle: Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x),
          endAngle: Math.atan2(points[2].y - points[0].y, points[2].x - points[0].x),
        } as ArcEntity;

      case 'rectangle':
        if (points.length < 2) return null;
        return {
          ...baseProps,
          type: 'rectangle',
          topLeft: { x: Math.min(points[0].x, points[1].x), y: Math.min(points[0].y, points[1].y) },
          width: Math.abs(points[1].x - points[0].x),
          height: Math.abs(points[1].y - points[0].y),
        } as RectangleEntity;

      default:
        return null;
    }
  }, []);

  const getPreviewEntity = useCallback((points: Point[], currentPoint: Point): Entity | null => {
    const { activeTool, currentLayerId } = useCadStore.getState();
    if (activeTool === 'polyline' && points.length >= 1) {
      return {
        id: 'preview',
        type: 'polyline',
        layerId: currentLayerId,
        color: 'bylayer',
        lineType: 'solid',
        lineWeight: 1,
        selected: false,
        points: [...points, currentPoint],
        closed: false,
      } as PolylineEntity;
    }
    return createEntity([...points, currentPoint]);
  }, [createEntity]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const state = useCadStore.getState();
      const { entities, layers, pan, zoom, showGrid, gridSize, darkTheme, selectionBox, snapPoint, snapType, drawingState } = state;

      let previewEntity: Entity | null = null;
      if (drawingState.isDrawing && drawingState.previewPoint) {
        previewEntity = getPreviewEntity(drawingState.points, drawingState.previewPoint);
      }

      renderCanvas(
        ctx, entities, layers,
        { pan, zoom, showGrid, gridSize, darkTheme, selectionBox },
        previewEntity, snapPoint, snapType
      );
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [canvasRef, getPreviewEntity]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const worldPt = getWorldPoint(e);
    useCadStore.getState().setCursorPosition(worldPt);

    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      useCadStore.getState().setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
      return;
    }

    const snapped = getSnappedPoint(worldPt);
    const state = useCadStore.getState();

    if (state.drawingState.isDrawing) {
      state.setDrawingState({ previewPoint: snapped });
    }

    if (isSelecting.current && state.activeTool === 'select') {
      const { pan, zoom } = useCadStore.getState();
      const worldStart = screenToWorld(selectionStart.current, pan, zoom);
      state.setSelectionBox({ start: worldStart, end: worldPt });
    }
  }, [getWorldPoint, getSnappedPoint, canvasRef]);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = useCadStore.getState();

    if (e.button === 1 || state.activeTool === 'pan') {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { ...state.pan };
      e.preventDefault();
      return;
    }

    if (e.button !== 0) return;

    const worldPt = getWorldPoint(e);
    const snapped = getSnappedPoint(worldPt);
    const { activeTool, drawingState } = state;

    if (activeTool === 'select') {
      const threshold = 8 / state.zoom;
      const clickedEntity = state.entities.find(en => {
        const layer = state.layers.find(l => l.id === en.layerId);
        if (!layer?.visible || layer?.locked) return false;
        return hitTestEntity(en, worldPt, threshold);
      });

      if (clickedEntity) {
        if (e.shiftKey) {
          state.selectEntities([clickedEntity.id], true);
        } else {
          state.selectEntities([clickedEntity.id]);
        }
      } else {
        if (!e.shiftKey) state.deselectAll();
        isSelecting.current = true;
        const rect = canvas.getBoundingClientRect();
        selectionStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
      return;
    }

    if (activeTool === 'line') {
      if (!drawingState.isDrawing) {
        state.setDrawingState({ isDrawing: true, points: [snapped] });
      } else {
        const entity = createEntity([drawingState.points[0], snapped]);
        if (entity) state.addEntity(entity);
        state.setDrawingState({ points: [snapped] }); // chain lines
        state.pushCommand(`Line (${drawingState.points[0].x.toFixed(1)}, ${drawingState.points[0].y.toFixed(1)}) → (${snapped.x.toFixed(1)}, ${snapped.y.toFixed(1)})`);
      }
      return;
    }

    if (activeTool === 'circle') {
      if (!drawingState.isDrawing) {
        state.setDrawingState({ isDrawing: true, points: [snapped] });
      } else {
        const entity = createEntity([drawingState.points[0], snapped]);
        if (entity) state.addEntity(entity);
        state.setDrawingState({ points: [], isDrawing: false });
        state.pushCommand(`Circle at (${drawingState.points[0].x.toFixed(1)}, ${drawingState.points[0].y.toFixed(1)}), r=${distance(drawingState.points[0], snapped).toFixed(1)}`);
      }
      return;
    }

    if (activeTool === 'arc') {
      if (!drawingState.isDrawing) {
        state.setDrawingState({ isDrawing: true, points: [snapped] });
      } else if (drawingState.points.length === 1) {
        state.setDrawingState({ points: [...drawingState.points, snapped] });
      } else {
        const entity = createEntity([drawingState.points[0], drawingState.points[1], snapped]);
        if (entity) state.addEntity(entity);
        state.setDrawingState({ points: [], isDrawing: false });
        state.pushCommand('Arc created');
      }
      return;
    }

    if (activeTool === 'rectangle') {
      if (!drawingState.isDrawing) {
        state.setDrawingState({ isDrawing: true, points: [snapped] });
      } else {
        const entity = createEntity([drawingState.points[0], snapped]);
        if (entity) state.addEntity(entity);
        state.setDrawingState({ points: [], isDrawing: false });
        state.pushCommand('Rectangle created');
      }
      return;
    }

    if (activeTool === 'polyline') {
      if (!drawingState.isDrawing) {
        state.setDrawingState({ isDrawing: true, points: [snapped] });
      } else {
        state.setDrawingState({ points: [...drawingState.points, snapped] });
      }
      return;
    }

    if (activeTool === 'text') {
      const content = prompt('Enter text:');
      if (content) {
        const textEntity: TextEntity = {
          id: uuidv4(),
          type: 'text',
          layerId: state.currentLayerId,
          color: 'bylayer',
          lineType: 'solid',
          lineWeight: 1,
          selected: false,
          position: snapped,
          content,
          fontSize: 12,
          rotation: 0,
        };
        state.addEntity(textEntity);
        state.pushCommand(`Text "${content}" added`);
      }
      return;
    }
  }, [getWorldPoint, getSnappedPoint, createEntity, canvasRef]);

  const handleMouseUp = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }

    if (e.button !== 0) return;

    if (isSelecting.current) {
      isSelecting.current = false;
      const state = useCadStore.getState();
      const selBox = state.selectionBox;
      if (selBox) {
        const bounds = {
          minX: Math.min(selBox.start.x, selBox.end.x),
          minY: Math.min(selBox.start.y, selBox.end.y),
          maxX: Math.max(selBox.start.x, selBox.end.x),
          maxY: Math.max(selBox.start.y, selBox.end.y),
        };
        const idsInBox = state.entities
          .filter(en => {
            const layer = state.layers.find(l => l.id === en.layerId);
            if (!layer?.visible || layer?.locked) return false;
            return isEntityInBounds(en, bounds);
          })
          .map(e => e.id);
        state.selectEntities(idsInBox);
      }
      state.setSelectionBox(null);
    }
  }, []);

  const handleDoubleClick = useCallback((_e: MouseEvent<HTMLCanvasElement>) => {
    const state = useCadStore.getState();
    const { activeTool, drawingState } = state;
    if (activeTool === 'line') {
      state.setDrawingState({ points: [], isDrawing: false });
      state.setActiveTool('select');
    } else if (activeTool === 'polyline' && drawingState.points.length >= 2) {
      const entity: PolylineEntity = {
        id: uuidv4(),
        type: 'polyline',
        layerId: state.currentLayerId,
        color: 'bylayer',
        lineType: 'solid',
        lineWeight: 1,
        selected: false,
        points: drawingState.points,
        closed: false,
      };
      state.addEntity(entity);
      state.pushCommand(`Polyline with ${drawingState.points.length} points created`);
      state.setDrawingState({ points: [], isDrawing: false });
      state.setActiveTool('select');
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { zoom, pan } = useCadStore.getState();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newZoom = Math.max(0.01, Math.min(100, zoom * zoomFactor));

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    useCadStore.getState().setZoom(newZoom);
    useCadStore.getState().setPan({ x: mouseX - worldX * newZoom, y: mouseY - worldY * newZoom });
  }, [canvasRef]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const state = useCadStore.getState();
    const { activeTool, drawingState } = state;
    if (activeTool === 'line') {
      state.setDrawingState({ points: [], isDrawing: false });
      state.setActiveTool('select');
    } else if (activeTool === 'polyline' && drawingState.points.length >= 2) {
      const entity: PolylineEntity = {
        id: uuidv4(),
        type: 'polyline',
        layerId: state.currentLayerId,
        color: 'bylayer',
        lineType: 'solid',
        lineWeight: 1,
        selected: false,
        points: drawingState.points,
        closed: false,
      };
      state.addEntity(entity);
      state.pushCommand(`Polyline with ${drawingState.points.length} points created`);
      state.setDrawingState({ points: [], isDrawing: false });
      state.setActiveTool('select');
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel, canvasRef]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  return { handleMouseMove, handleMouseDown, handleMouseUp, handleDoubleClick, handleContextMenu };
}
