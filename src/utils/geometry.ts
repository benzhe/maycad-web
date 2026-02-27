import type { Point, Bounds } from '../types/geometry';
import type { Entity } from '../types/entity';

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export function midpoint(p1: Point, p2: Point): Point {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function polarPoint(origin: Point, angleDeg: number, dist: number): Point {
  return {
    x: origin.x + dist * Math.cos(angleDeg),
    y: origin.y + dist * Math.sin(angleDeg),
  };
}

export function screenToWorld(screenPt: Point, pan: Point, zoom: number): Point {
  return {
    x: (screenPt.x - pan.x) / zoom,
    y: (screenPt.y - pan.y) / zoom,
  };
}

export function worldToScreen(worldPt: Point, pan: Point, zoom: number): Point {
  return {
    x: worldPt.x * zoom + pan.x,
    y: worldPt.y * zoom + pan.y,
  };
}

export function pointOnLine(p: Point, p1: Point, p2: Point, threshold: number): boolean {
  const d = distance(p1, p2);
  if (d === 0) return distance(p, p1) < threshold;
  const t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / (d * d);
  const tClamped = Math.max(0, Math.min(1, t));
  const nearest = {
    x: p1.x + tClamped * (p2.x - p1.x),
    y: p1.y + tClamped * (p2.y - p1.y),
  };
  return distance(p, nearest) < threshold;
}

export function getEntityBounds(entity: Entity): Bounds {
  switch (entity.type) {
    case 'line':
      return {
        minX: Math.min(entity.startPoint.x, entity.endPoint.x),
        minY: Math.min(entity.startPoint.y, entity.endPoint.y),
        maxX: Math.max(entity.startPoint.x, entity.endPoint.x),
        maxY: Math.max(entity.startPoint.y, entity.endPoint.y),
      };
    case 'circle':
      return {
        minX: entity.center.x - entity.radius,
        minY: entity.center.y - entity.radius,
        maxX: entity.center.x + entity.radius,
        maxY: entity.center.y + entity.radius,
      };
    case 'arc':
      return {
        minX: entity.center.x - entity.radius,
        minY: entity.center.y - entity.radius,
        maxX: entity.center.x + entity.radius,
        maxY: entity.center.y + entity.radius,
      };
    case 'rectangle':
      return {
        minX: entity.topLeft.x,
        minY: entity.topLeft.y,
        maxX: entity.topLeft.x + entity.width,
        maxY: entity.topLeft.y + entity.height,
      };
    case 'polyline': {
      const xs = entity.points.map(p => p.x);
      const ys = entity.points.map(p => p.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    case 'text':
      return {
        minX: entity.position.x,
        minY: entity.position.y - entity.fontSize,
        maxX: entity.position.x + entity.content.length * entity.fontSize * 0.6,
        maxY: entity.position.y,
      };
  }
}

export function isEntityInBounds(entity: Entity, bounds: Bounds): boolean {
  const eb = getEntityBounds(entity);
  return eb.minX >= bounds.minX && eb.minY >= bounds.minY && eb.maxX <= bounds.maxX && eb.maxY <= bounds.maxY;
}

export function hitTestEntity(entity: Entity, point: Point, threshold: number): boolean {
  switch (entity.type) {
    case 'line':
      return pointOnLine(point, entity.startPoint, entity.endPoint, threshold);
    case 'circle': {
      const d = distance(point, entity.center);
      return Math.abs(d - entity.radius) < threshold;
    }
    case 'arc': {
      const d = distance(point, entity.center);
      if (Math.abs(d - entity.radius) > threshold) return false;
      let a = Math.atan2(point.y - entity.center.y, point.x - entity.center.x);
      let start = entity.startAngle;
      let end = entity.endAngle;
      while (a < start) a += Math.PI * 2;
      while (end < start) end += Math.PI * 2;
      return a <= end;
    }
    case 'rectangle': {
      const { topLeft, width, height } = entity;
      const onTop = pointOnLine(point, topLeft, { x: topLeft.x + width, y: topLeft.y }, threshold);
      const onBottom = pointOnLine(point, { x: topLeft.x, y: topLeft.y + height }, { x: topLeft.x + width, y: topLeft.y + height }, threshold);
      const onLeft = pointOnLine(point, topLeft, { x: topLeft.x, y: topLeft.y + height }, threshold);
      const onRight = pointOnLine(point, { x: topLeft.x + width, y: topLeft.y }, { x: topLeft.x + width, y: topLeft.y + height }, threshold);
      return onTop || onBottom || onLeft || onRight;
    }
    case 'polyline': {
      for (let i = 0; i < entity.points.length - 1; i++) {
        if (pointOnLine(point, entity.points[i], entity.points[i + 1], threshold)) return true;
      }
      if (entity.closed && entity.points.length > 1) {
        return pointOnLine(point, entity.points[entity.points.length - 1], entity.points[0], threshold);
      }
      return false;
    }
    case 'text': {
      const b = getEntityBounds(entity);
      return point.x >= b.minX && point.x <= b.maxX && point.y >= b.minY && point.y <= b.maxY;
    }
  }
}

export function normalizeAngle(a: number): number {
  while (a < 0) a += Math.PI * 2;
  while (a >= Math.PI * 2) a -= Math.PI * 2;
  return a;
}
