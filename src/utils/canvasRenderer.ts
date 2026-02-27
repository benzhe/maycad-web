import type { Entity, Layer } from '../types/entity';
import type { Point } from '../types/geometry';
import { worldToScreen } from './geometry';

export interface RenderOptions {
  pan: Point;
  zoom: number;
  showGrid: boolean;
  gridSize: number;
  darkTheme: boolean;
  selectionBox: { start: Point; end: Point } | null;
}

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  entities: Entity[],
  layers: Layer[],
  options: RenderOptions,
  previewEntity: Entity | null,
  snapPoint: Point | null,
  snapType: string
): void {
  const { pan, zoom, showGrid, gridSize, darkTheme, selectionBox } = options;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Background
  ctx.fillStyle = darkTheme ? '#1a1a2e' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (showGrid) {
    drawGrid(ctx, pan, zoom, gridSize, darkTheme, width, height);
  }

  drawAxes(ctx, pan, zoom, width, height, darkTheme);

  const layerMap = new Map(layers.map(l => [l.id, l]));
  for (const entity of entities) {
    const layer = layerMap.get(entity.layerId);
    if (layer && !layer.visible) continue;
    drawEntity(ctx, entity, layer, pan, zoom, darkTheme);
  }

  if (previewEntity) {
    const layer = layerMap.get(previewEntity.layerId);
    ctx.globalAlpha = 0.7;
    drawEntity(ctx, previewEntity, layer, pan, zoom, darkTheme);
    ctx.globalAlpha = 1.0;
  }

  if (selectionBox) {
    const sp1 = worldToScreen(selectionBox.start, pan, zoom);
    const sp2 = worldToScreen(selectionBox.end, pan, zoom);
    const x = Math.min(sp1.x, sp2.x);
    const y = Math.min(sp1.y, sp2.y);
    const w = Math.abs(sp2.x - sp1.x);
    const h = Math.abs(sp2.y - sp1.y);
    ctx.strokeStyle = '#0080ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = 'rgba(0, 128, 255, 0.1)';
    ctx.fillRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  if (snapPoint && snapType !== 'none') {
    drawSnapIndicator(ctx, snapPoint, snapType, pan, zoom);
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  pan: Point,
  zoom: number,
  gridSize: number,
  darkTheme: boolean,
  width: number,
  height: number
): void {
  const screenGridSize = gridSize * zoom;
  if (screenGridSize < 4) return;

  const startX = (((-pan.x) / zoom / gridSize) | 0) * screenGridSize + (pan.x % screenGridSize);
  const startY = (((-pan.y) / zoom / gridSize) | 0) * screenGridSize + (pan.y % screenGridSize);

  ctx.strokeStyle = darkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;

  if (screenGridSize >= 10) {
    ctx.beginPath();
    for (let x = startX; x < width; x += screenGridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y < height; y += screenGridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  // Major grid every 10 units
  const majorGridSize = gridSize * 10;
  const screenMajorGridSize = majorGridSize * zoom;
  if (screenMajorGridSize >= 20) {
    const majorStartX = (((-pan.x) / zoom / majorGridSize) | 0) * screenMajorGridSize + (pan.x % screenMajorGridSize);
    const majorStartY = (((-pan.y) / zoom / majorGridSize) | 0) * screenMajorGridSize + (pan.y % screenMajorGridSize);
    ctx.strokeStyle = darkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    for (let x = majorStartX; x < width; x += screenMajorGridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = majorStartY; y < height; y += screenMajorGridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  pan: Point,
  _zoom: number,
  width: number,
  height: number,
  darkTheme: boolean
): void {
  const originX = pan.x;
  const originY = pan.y;

  ctx.lineWidth = 1;

  if (originY >= 0 && originY <= height) {
    ctx.strokeStyle = darkTheme ? 'rgba(255,80,80,0.4)' : 'rgba(255,0,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
  }

  if (originX >= 0 && originX <= width) {
    ctx.strokeStyle = darkTheme ? 'rgba(80,255,80,0.4)' : 'rgba(0,180,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
  }
}

function getEntityColor(entity: Entity, layer: Layer | undefined, darkTheme: boolean): string {
  if (entity.color === 'bylayer') {
    return layer?.color ?? (darkTheme ? '#ffffff' : '#000000');
  }
  return entity.color;
}

function setLineDash(ctx: CanvasRenderingContext2D, lineType: string): void {
  switch (lineType) {
    case 'dashed':
      ctx.setLineDash([10, 5]);
      break;
    case 'dotted':
      ctx.setLineDash([2, 4]);
      break;
    default:
      ctx.setLineDash([]);
  }
}

function drawEntity(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  layer: Layer | undefined,
  pan: Point,
  zoom: number,
  darkTheme: boolean
): void {
  const color = getEntityColor(entity, layer, darkTheme);
  const lineType = entity.lineType !== 'solid' ? entity.lineType : (layer?.lineType ?? 'solid');
  const lineWeight = entity.lineWeight > 0 ? entity.lineWeight : (layer?.lineWeight ?? 1);

  ctx.strokeStyle = entity.selected ? '#00aaff' : color;
  ctx.fillStyle = entity.selected ? '#00aaff' : color;
  ctx.lineWidth = lineWeight * zoom * 0.5 + 0.5;
  setLineDash(ctx, lineType);

  switch (entity.type) {
    case 'line': {
      const sp1 = worldToScreen(entity.startPoint, pan, zoom);
      const sp2 = worldToScreen(entity.endPoint, pan, zoom);
      ctx.beginPath();
      ctx.moveTo(sp1.x, sp1.y);
      ctx.lineTo(sp2.x, sp2.y);
      ctx.stroke();
      if (entity.selected) {
        drawHandle(ctx, sp1);
        drawHandle(ctx, sp2);
      }
      break;
    }
    case 'circle': {
      const sc = worldToScreen(entity.center, pan, zoom);
      const sr = entity.radius * zoom;
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, sr, 0, Math.PI * 2);
      ctx.stroke();
      if (entity.selected) {
        drawHandle(ctx, sc);
        drawHandle(ctx, { x: sc.x + sr, y: sc.y });
        drawHandle(ctx, { x: sc.x - sr, y: sc.y });
        drawHandle(ctx, { x: sc.x, y: sc.y + sr });
        drawHandle(ctx, { x: sc.x, y: sc.y - sr });
      }
      break;
    }
    case 'arc': {
      const sc = worldToScreen(entity.center, pan, zoom);
      const sr = entity.radius * zoom;
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, sr, entity.startAngle, entity.endAngle);
      ctx.stroke();
      if (entity.selected) {
        drawHandle(ctx, sc);
      }
      break;
    }
    case 'rectangle': {
      const sp = worldToScreen(entity.topLeft, pan, zoom);
      const sw = entity.width * zoom;
      const sh = entity.height * zoom;
      ctx.beginPath();
      ctx.rect(sp.x, sp.y, sw, sh);
      ctx.stroke();
      if (entity.selected) {
        drawHandle(ctx, sp);
        drawHandle(ctx, { x: sp.x + sw, y: sp.y });
        drawHandle(ctx, { x: sp.x, y: sp.y + sh });
        drawHandle(ctx, { x: sp.x + sw, y: sp.y + sh });
      }
      break;
    }
    case 'polyline': {
      if (entity.points.length < 2) break;
      ctx.beginPath();
      const first = worldToScreen(entity.points[0], pan, zoom);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < entity.points.length; i++) {
        const sp = worldToScreen(entity.points[i], pan, zoom);
        ctx.lineTo(sp.x, sp.y);
      }
      if (entity.closed) ctx.closePath();
      ctx.stroke();
      if (entity.selected) {
        entity.points.forEach(pt => drawHandle(ctx, worldToScreen(pt, pan, zoom)));
      }
      break;
    }
    case 'text': {
      const sp = worldToScreen(entity.position, pan, zoom);
      const fontSize = entity.fontSize * zoom;
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = entity.selected ? '#00aaff' : color;
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(entity.rotation);
      ctx.fillText(entity.content, 0, 0);
      ctx.restore();
      break;
    }
  }

  ctx.setLineDash([]);
}

function drawHandle(ctx: CanvasRenderingContext2D, point: Point): void {
  const size = 5;
  ctx.fillStyle = '#00aaff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
  ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
}

function drawSnapIndicator(
  ctx: CanvasRenderingContext2D,
  worldPoint: Point,
  snapType: string,
  pan: Point,
  zoom: number
): void {
  const sp = worldToScreen(worldPoint, pan, zoom);
  const size = 10;

  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  switch (snapType) {
    case 'endpoint':
      ctx.strokeStyle = '#ff4444';
      ctx.strokeRect(sp.x - size / 2, sp.y - size / 2, size, size);
      break;
    case 'midpoint':
      ctx.strokeStyle = '#44ff44';
      ctx.beginPath();
      ctx.moveTo(sp.x - size / 2, sp.y + size / 2);
      ctx.lineTo(sp.x, sp.y - size / 2);
      ctx.lineTo(sp.x + size / 2, sp.y + size / 2);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'center':
      ctx.strokeStyle = '#4444ff';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sp.x - size / 2 - 2, sp.y);
      ctx.lineTo(sp.x + size / 2 + 2, sp.y);
      ctx.moveTo(sp.x, sp.y - size / 2 - 2);
      ctx.lineTo(sp.x, sp.y + size / 2 + 2);
      ctx.stroke();
      break;
    case 'grid':
      ctx.strokeStyle = '#888888';
      ctx.beginPath();
      ctx.moveTo(sp.x - size / 2, sp.y);
      ctx.lineTo(sp.x + size / 2, sp.y);
      ctx.moveTo(sp.x, sp.y - size / 2);
      ctx.lineTo(sp.x, sp.y + size / 2);
      ctx.stroke();
      break;
  }
}
