
import { useCadStore } from '../store/cadStore';
import type { Tool } from '../store/cadStore';

interface ToolButton {
  tool: Tool;
  label: string;
  icon: string;
  shortcut: string;
}

const tools: ToolButton[] = [
  { tool: 'select', label: 'Select', icon: '↖', shortcut: 'Esc' },
  { tool: 'pan', label: 'Pan', icon: '✋', shortcut: 'Mid' },
  { tool: 'line', label: 'Line', icon: '╱', shortcut: 'L' },
  { tool: 'circle', label: 'Circle', icon: '○', shortcut: 'C' },
  { tool: 'arc', label: 'Arc', icon: '◜', shortcut: 'A' },
  { tool: 'rectangle', label: 'Rect', icon: '▭', shortcut: 'R' },
  { tool: 'polyline', label: 'Polyline', icon: '⌇', shortcut: 'P' },
  { tool: 'text', label: 'Text', icon: 'T', shortcut: 'T' },
  { tool: 'move', label: 'Move', icon: '✥', shortcut: 'M' },
];

export function Toolbar() {
  const { activeTool, setActiveTool, undo, redo, zoom, setZoom, setPan, pan } = useCadStore();

  const handleZoomIn = () => {
    const nz = zoom * 1.25;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setPan({ x: cx - (cx - pan.x) * 1.25, y: cy - (cy - pan.y) * 1.25 });
    setZoom(nz);
  };

  const handleZoomOut = () => {
    const nz = zoom / 1.25;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setPan({ x: cx - (cx - pan.x) / 1.25, y: cy - (cy - pan.y) / 1.25 });
    setZoom(nz);
  };

  return (
    <div className="toolbar">
      {tools.map(({ tool, label, icon, shortcut }) => (
        <button
          key={tool}
          className={`tool-btn ${activeTool === tool ? 'active' : ''}`}
          onClick={() => setActiveTool(tool)}
          title={`${label} (${shortcut})`}
        >
          <span className="tool-icon">{icon}</span>
          <span className="tool-label">{label}</span>
        </button>
      ))}
      <div className="toolbar-separator" />
      <button className="tool-btn" onClick={undo} title="Undo (Ctrl+Z)">
        <span className="tool-icon">↩</span>
        <span className="tool-label">Undo</span>
      </button>
      <button className="tool-btn" onClick={redo} title="Redo (Ctrl+Y)">
        <span className="tool-icon">↪</span>
        <span className="tool-label">Redo</span>
      </button>
      <div className="toolbar-separator" />
      <button className="tool-btn" onClick={handleZoomIn} title="Zoom In">
        <span className="tool-icon">⊕</span>
        <span className="tool-label">Zoom+</span>
      </button>
      <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out">
        <span className="tool-icon">⊖</span>
        <span className="tool-label">Zoom-</span>
      </button>
    </div>
  );
}
