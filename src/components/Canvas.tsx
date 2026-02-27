import { useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useKeyboard } from '../hooks/useKeyboard';
import { useCadStore } from '../store/cadStore';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { handleMouseMove, handleMouseDown, handleMouseUp, handleDoubleClick, handleContextMenu } = useCanvas(canvasRef);
  useKeyboard();

  const activeTool = useCadStore(s => s.activeTool);

  const getCursor = () => {
    switch (activeTool) {
      case 'pan': return 'grab';
      case 'select': return 'default';
      case 'move': return 'move';
      default: return 'crosshair';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', cursor: getCursor(), display: 'block' }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    />
  );
}
