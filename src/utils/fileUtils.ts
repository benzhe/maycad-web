import type { Entity, Layer } from '../types/entity';

export interface DrawingFile {
  version: string;
  entities: Entity[];
  layers: Layer[];
}

export function saveDrawing(entities: Entity[], layers: Layer[]): void {
  const data: DrawingFile = { version: '1.0', entities, layers };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'drawing.maycad';
  a.click();
  URL.revokeObjectURL(url);
}

export function loadDrawing(file: File): Promise<DrawingFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as DrawingFile;
        resolve(data);
      } catch {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function exportToSVG(entities: Entity[], layers: Layer[]): void {
  const layerMap = new Map(layers.map(l => [l.id, l]));

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const svgElements: string[] = [];

  for (const entity of entities) {
    const layer = layerMap.get(entity.layerId);
    if (!layer?.visible) continue;

    const color = entity.color === 'bylayer' ? (layer?.color ?? '#000000') : entity.color;
    const strokeWidth = entity.lineWeight > 0 ? entity.lineWeight : 1;

    let svgEl = '';

    switch (entity.type) {
      case 'line':
        svgEl = `<line x1="${entity.startPoint.x}" y1="${entity.startPoint.y}" x2="${entity.endPoint.x}" y2="${entity.endPoint.y}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"/>`;
        minX = Math.min(minX, entity.startPoint.x, entity.endPoint.x);
        minY = Math.min(minY, entity.startPoint.y, entity.endPoint.y);
        maxX = Math.max(maxX, entity.startPoint.x, entity.endPoint.x);
        maxY = Math.max(maxY, entity.startPoint.y, entity.endPoint.y);
        break;
      case 'circle':
        svgEl = `<circle cx="${entity.center.x}" cy="${entity.center.y}" r="${entity.radius}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"/>`;
        minX = Math.min(minX, entity.center.x - entity.radius);
        minY = Math.min(minY, entity.center.y - entity.radius);
        maxX = Math.max(maxX, entity.center.x + entity.radius);
        maxY = Math.max(maxY, entity.center.y + entity.radius);
        break;
      case 'rectangle':
        svgEl = `<rect x="${entity.topLeft.x}" y="${entity.topLeft.y}" width="${entity.width}" height="${entity.height}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"/>`;
        minX = Math.min(minX, entity.topLeft.x);
        minY = Math.min(minY, entity.topLeft.y);
        maxX = Math.max(maxX, entity.topLeft.x + entity.width);
        maxY = Math.max(maxY, entity.topLeft.y + entity.height);
        break;
      case 'text':
        svgEl = `<text x="${entity.position.x}" y="${entity.position.y}" font-size="${entity.fontSize}" fill="${color}">${entity.content}</text>`;
        break;
    }

    if (svgEl) svgElements.push(svgEl);
  }

  if (svgElements.length === 0) {
    alert('No visible entities to export');
    return;
  }

  const padding = 20;
  const vbX = isFinite(minX) ? minX - padding : -100;
  const vbY = isFinite(minY) ? minY - padding : -100;
  const vbW = isFinite(maxX) ? maxX - vbX + padding : 200;
  const vbH = isFinite(maxY) ? maxY - vbY + padding : 200;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}">
  <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="white"/>
  ${svgElements.join('\n  ')}
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'drawing.svg';
  a.click();
  URL.revokeObjectURL(url);
}
