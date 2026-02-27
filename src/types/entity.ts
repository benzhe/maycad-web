import type { Point } from './geometry';

export type EntityType = 'line' | 'circle' | 'arc' | 'rectangle' | 'polyline' | 'text';
export type LineType = 'solid' | 'dashed' | 'dotted';

export interface BaseEntity {
  id: string;
  type: EntityType;
  layerId: string;
  color: string;
  lineType: LineType;
  lineWeight: number;
  selected: boolean;
}

export interface LineEntity extends BaseEntity {
  type: 'line';
  startPoint: Point;
  endPoint: Point;
}

export interface CircleEntity extends BaseEntity {
  type: 'circle';
  center: Point;
  radius: number;
}

export interface ArcEntity extends BaseEntity {
  type: 'arc';
  center: Point;
  radius: number;
  startAngle: number;
  endAngle: number;
}

export interface RectangleEntity extends BaseEntity {
  type: 'rectangle';
  topLeft: Point;
  width: number;
  height: number;
}

export interface PolylineEntity extends BaseEntity {
  type: 'polyline';
  points: Point[];
  closed: boolean;
}

export interface TextEntity extends BaseEntity {
  type: 'text';
  position: Point;
  content: string;
  fontSize: number;
  rotation: number;
}

export type Entity = LineEntity | CircleEntity | ArcEntity | RectangleEntity | PolylineEntity | TextEntity;

export interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  lineType: LineType;
  lineWeight: number;
}
