import type { Point } from '../types/geometry';
import type { Entity } from '../types/entity';
import { distance, midpoint } from './geometry';

export type SnapType = 'none' | 'grid' | 'endpoint' | 'midpoint' | 'center' | 'nearest';

export interface SnapResult {
  point: Point;
  type: SnapType;
}

export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export function findSnap(
  worldPoint: Point,
  entities: Entity[],
  snapRadius: number,
  gridSize: number,
  gridSnap: boolean
): SnapResult {
  // Endpoint snap
  for (const entity of entities) {
    const endpoints = getEntityEndpoints(entity);
    for (const ep of endpoints) {
      if (distance(worldPoint, ep) < snapRadius) {
        return { point: ep, type: 'endpoint' };
      }
    }
  }

  // Midpoint snap
  for (const entity of entities) {
    const mids = getEntityMidpoints(entity);
    for (const mp of mids) {
      if (distance(worldPoint, mp) < snapRadius) {
        return { point: mp, type: 'midpoint' };
      }
    }
  }

  // Center snap
  for (const entity of entities) {
    if (entity.type === 'circle' || entity.type === 'arc') {
      if (distance(worldPoint, entity.center) < snapRadius) {
        return { point: entity.center, type: 'center' };
      }
    }
  }

  // Grid snap
  if (gridSnap) {
    return { point: snapToGrid(worldPoint, gridSize), type: 'grid' };
  }

  return { point: worldPoint, type: 'none' };
}

function getEntityEndpoints(entity: Entity): Point[] {
  switch (entity.type) {
    case 'line':
      return [entity.startPoint, entity.endPoint];
    case 'arc': {
      const startPt = {
        x: entity.center.x + entity.radius * Math.cos(entity.startAngle),
        y: entity.center.y + entity.radius * Math.sin(entity.startAngle),
      };
      const endPt = {
        x: entity.center.x + entity.radius * Math.cos(entity.endAngle),
        y: entity.center.y + entity.radius * Math.sin(entity.endAngle),
      };
      return [startPt, endPt];
    }
    case 'rectangle':
      return [
        entity.topLeft,
        { x: entity.topLeft.x + entity.width, y: entity.topLeft.y },
        { x: entity.topLeft.x, y: entity.topLeft.y + entity.height },
        { x: entity.topLeft.x + entity.width, y: entity.topLeft.y + entity.height },
      ];
    case 'polyline':
      return [...entity.points];
    default:
      return [];
  }
}

function getEntityMidpoints(entity: Entity): Point[] {
  switch (entity.type) {
    case 'line':
      return [midpoint(entity.startPoint, entity.endPoint)];
    case 'rectangle':
      return [
        midpoint(entity.topLeft, { x: entity.topLeft.x + entity.width, y: entity.topLeft.y }),
        midpoint(entity.topLeft, { x: entity.topLeft.x, y: entity.topLeft.y + entity.height }),
        midpoint(
          { x: entity.topLeft.x + entity.width, y: entity.topLeft.y },
          { x: entity.topLeft.x + entity.width, y: entity.topLeft.y + entity.height }
        ),
        midpoint(
          { x: entity.topLeft.x, y: entity.topLeft.y + entity.height },
          { x: entity.topLeft.x + entity.width, y: entity.topLeft.y + entity.height }
        ),
      ];
    case 'polyline': {
      const mids: Point[] = [];
      for (let i = 0; i < entity.points.length - 1; i++) {
        mids.push(midpoint(entity.points[i], entity.points[i + 1]));
      }
      return mids;
    }
    default:
      return [];
  }
}
