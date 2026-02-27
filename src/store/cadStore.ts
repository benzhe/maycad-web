import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Entity, Layer } from '../types/entity';
import type { Point } from '../types/geometry';

export type Tool = 'select' | 'line' | 'circle' | 'arc' | 'rectangle' | 'polyline' | 'text' | 'pan' | 'move' | 'rotate' | 'scale';

export interface DrawingState {
  points: Point[];
  isDrawing: boolean;
  previewPoint: Point | null;
}

export interface CADState {
  entities: Entity[];
  layers: Layer[];
  currentLayerId: string;
  activeTool: Tool;
  zoom: number;
  pan: Point;
  showGrid: boolean;
  gridSize: number;
  gridSnap: boolean;
  darkTheme: boolean;
  cursorPosition: Point;
  snapPoint: Point | null;
  snapType: string;
  drawingState: DrawingState;
  selectionBox: { start: Point; end: Point } | null;
  commandHistory: string[];
  commandInput: string;
  undoStack: Entity[][];
  redoStack: Entity[][];
  clipboard: Entity[];

  addEntity: (entity: Entity) => void;
  removeEntities: (ids: string[]) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  selectEntities: (ids: string[], addToSelection?: boolean) => void;
  deselectAll: () => void;
  getSelectedEntities: () => Entity[];

  addLayer: (name: string) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  setCurrentLayer: (id: string) => void;

  setActiveTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  setShowGrid: (show: boolean) => void;
  setGridSnap: (snap: boolean) => void;
  setDarkTheme: (dark: boolean) => void;
  setCursorPosition: (pos: Point) => void;
  setSnapPoint: (point: Point | null, type: string) => void;
  setDrawingState: (state: Partial<DrawingState>) => void;
  setSelectionBox: (box: { start: Point; end: Point } | null) => void;

  pushCommand: (cmd: string) => void;
  setCommandInput: (input: string) => void;
  executeCommand: (cmd: string) => void;

  undo: () => void;
  redo: () => void;
  pushUndo: () => void;

  copySelected: () => void;
  paste: () => void;
  deleteSelected: () => void;
  moveSelected: (delta: Point) => void;

  newDrawing: () => void;
}

const defaultLayer: Layer = {
  id: 'layer-0',
  name: '0',
  color: '#ffffff',
  visible: true,
  locked: false,
  lineType: 'solid',
  lineWeight: 1,
};

export const useCadStore = create<CADState>((set, get) => ({
  entities: [],
  layers: [defaultLayer],
  currentLayerId: 'layer-0',
  activeTool: 'select',
  zoom: 1,
  pan: { x: 400, y: 300 },
  showGrid: true,
  gridSize: 10,
  gridSnap: true,
  darkTheme: true,
  cursorPosition: { x: 0, y: 0 },
  snapPoint: null,
  snapType: 'none',
  drawingState: { points: [], isDrawing: false, previewPoint: null },
  selectionBox: null,
  commandHistory: ['Welcome to MayCAD Web', 'Type a command or use the toolbar'],
  commandInput: '',
  undoStack: [],
  redoStack: [],
  clipboard: [],

  addEntity: (entity) => {
    get().pushUndo();
    set(state => ({ entities: [...state.entities, entity] }));
  },

  removeEntities: (ids) => {
    get().pushUndo();
    set(state => ({ entities: state.entities.filter(e => !ids.includes(e.id)) }));
  },

  updateEntity: (id, updates) => {
    set(state => ({
      entities: state.entities.map(e => e.id === id ? { ...e, ...updates } as Entity : e),
    }));
  },

  selectEntities: (ids, addToSelection = false) => {
    set(state => ({
      entities: state.entities.map(e => ({
        ...e,
        selected: addToSelection ? (ids.includes(e.id) ? true : e.selected) : ids.includes(e.id),
      })),
    }));
  },

  deselectAll: () => {
    set(state => ({
      entities: state.entities.map(e => ({ ...e, selected: false })),
    }));
  },

  getSelectedEntities: () => get().entities.filter(e => e.selected),

  addLayer: (name) => {
    const newLayer: Layer = {
      id: uuidv4(),
      name,
      color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
      visible: true,
      locked: false,
      lineType: 'solid',
      lineWeight: 1,
    };
    set(state => ({ layers: [...state.layers, newLayer] }));
  },

  removeLayer: (id) => {
    if (id === 'layer-0') return;
    set(state => ({
      layers: state.layers.filter(l => l.id !== id),
      entities: state.entities.filter(e => e.layerId !== id),
      currentLayerId: state.currentLayerId === id ? 'layer-0' : state.currentLayerId,
    }));
  },

  updateLayer: (id, updates) => {
    set(state => ({
      layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l),
    }));
  },

  setCurrentLayer: (id) => set({ currentLayerId: id }),

  setActiveTool: (tool) => {
    set({
      activeTool: tool,
      drawingState: { points: [], isDrawing: false, previewPoint: null },
    });
  },

  setZoom: (zoom) => set({ zoom: Math.max(0.01, Math.min(100, zoom)) }),
  setPan: (pan) => set({ pan }),
  setShowGrid: (show) => set({ showGrid: show }),
  setGridSnap: (snap) => set({ gridSnap: snap }),
  setDarkTheme: (dark) => set({ darkTheme: dark }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setSnapPoint: (point, type) => set({ snapPoint: point, snapType: type }),
  setDrawingState: (s) => set(state => ({ drawingState: { ...state.drawingState, ...s } })),
  setSelectionBox: (box) => set({ selectionBox: box }),

  pushCommand: (cmd) => {
    set(state => ({
      commandHistory: [...state.commandHistory.slice(-50), cmd],
    }));
  },

  setCommandInput: (input) => set({ commandInput: input }),

  executeCommand: (cmd) => {
    const { pushCommand, setActiveTool, undo, redo, deleteSelected } = get();
    const upper = cmd.trim().toUpperCase();
    pushCommand(`> ${cmd}`);

    const toolMap: Record<string, Tool> = {
      LINE: 'line', L: 'line',
      CIRCLE: 'circle', C: 'circle',
      ARC: 'arc', A: 'arc',
      RECT: 'rectangle', REC: 'rectangle', RECTANGLE: 'rectangle',
      POLYLINE: 'polyline', PL: 'polyline',
      TEXT: 'text', T: 'text',
      SELECT: 'select', S: 'select',
      MOVE: 'move', M: 'move',
      PAN: 'pan',
    };

    if (toolMap[upper]) {
      setActiveTool(toolMap[upper]);
      pushCommand(`Switched to ${toolMap[upper]} tool`);
    } else if (upper === 'UNDO' || upper === 'U') {
      undo();
    } else if (upper === 'REDO') {
      redo();
    } else if (upper === 'DELETE' || upper === 'ERASE' || upper === 'E') {
      deleteSelected();
    } else if (upper === 'ZOOM' || upper === 'Z') {
      set({ zoom: 1, pan: { x: 400, y: 300 } });
      pushCommand('Zoom reset');
    } else {
      pushCommand(`Unknown command: ${cmd}`);
    }

    set({ commandInput: '' });
  },

  pushUndo: () => {
    const entities = get().entities;
    set(state => ({
      undoStack: [...state.undoStack.slice(-50), JSON.parse(JSON.stringify(entities))],
      redoStack: [],
    }));
  },

  undo: () => {
    const { undoStack, entities } = get();
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    set(state => ({
      entities: previous,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, JSON.parse(JSON.stringify(entities))],
    }));
  },

  redo: () => {
    const { redoStack, entities } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set(state => ({
      entities: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, JSON.parse(JSON.stringify(entities))],
    }));
  },

  copySelected: () => {
    const selected = get().getSelectedEntities();
    set({ clipboard: JSON.parse(JSON.stringify(selected)) });
    get().pushCommand(`Copied ${selected.length} entities`);
  },

  paste: () => {
    const { clipboard, currentLayerId } = get();
    if (clipboard.length === 0) return;
    get().pushUndo();
    const offset = { x: 10, y: 10 };
    const newEntities = clipboard.map(e => {
      const base = { ...JSON.parse(JSON.stringify(e)), id: uuidv4(), selected: true, layerId: currentLayerId };
      switch (base.type) {
        case 'line':
          return { ...base, startPoint: { x: base.startPoint.x + offset.x, y: base.startPoint.y + offset.y }, endPoint: { x: base.endPoint.x + offset.x, y: base.endPoint.y + offset.y } };
        case 'circle':
        case 'arc':
          return { ...base, center: { x: base.center.x + offset.x, y: base.center.y + offset.y } };
        case 'rectangle':
          return { ...base, topLeft: { x: base.topLeft.x + offset.x, y: base.topLeft.y + offset.y } };
        case 'polyline':
          return { ...base, points: base.points.map((p: Point) => ({ x: p.x + offset.x, y: p.y + offset.y })) };
        case 'text':
          return { ...base, position: { x: base.position.x + offset.x, y: base.position.y + offset.y } };
        default:
          return base;
      }
    });
    set(state => ({
      entities: [...state.entities.map(e => ({ ...e, selected: false })), ...newEntities],
    }));
    get().pushCommand(`Pasted ${newEntities.length} entities`);
  },

  deleteSelected: () => {
    const selected = get().getSelectedEntities();
    if (selected.length === 0) return;
    get().pushUndo();
    set(state => ({ entities: state.entities.filter(e => !e.selected) }));
    get().pushCommand(`Deleted ${selected.length} entities`);
  },

  moveSelected: (delta) => {
    set(state => ({
      entities: state.entities.map(e => {
        if (!e.selected) return e;
        switch (e.type) {
          case 'line':
            return { ...e, startPoint: { x: e.startPoint.x + delta.x, y: e.startPoint.y + delta.y }, endPoint: { x: e.endPoint.x + delta.x, y: e.endPoint.y + delta.y } };
          case 'circle':
          case 'arc':
            return { ...e, center: { x: e.center.x + delta.x, y: e.center.y + delta.y } };
          case 'rectangle':
            return { ...e, topLeft: { x: e.topLeft.x + delta.x, y: e.topLeft.y + delta.y } };
          case 'polyline':
            return { ...e, points: e.points.map(p => ({ x: p.x + delta.x, y: p.y + delta.y })) };
          case 'text':
            return { ...e, position: { x: e.position.x + delta.x, y: e.position.y + delta.y } };
          default:
            return e;
        }
      }),
    }));
  },

  newDrawing: () => {
    if (!confirm('Create new drawing? Unsaved changes will be lost.')) return;
    set({
      entities: [],
      undoStack: [],
      redoStack: [],
      drawingState: { points: [], isDrawing: false, previewPoint: null },
    });
    get().pushCommand('New drawing created');
  },
}));
