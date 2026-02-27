
import { useCadStore } from '../store/cadStore';

export function StatusBar() {
  const { cursorPosition, snapType, currentLayerId, layers, zoom, showGrid, gridSnap, activeTool, entities } = useCadStore();
  const currentLayer = layers.find(l => l.id === currentLayerId);
  const selectedCount = entities.filter(e => e.selected).length;

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">X:</span>
        <span className="status-value mono">{cursorPosition.x.toFixed(2)}</span>
      </div>
      <div className="status-item">
        <span className="status-label">Y:</span>
        <span className="status-value mono">{cursorPosition.y.toFixed(2)}</span>
      </div>
      <div className="status-separator" />
      <div className="status-item">
        <span className="status-label">Tool:</span>
        <span className="status-value">{activeTool.toUpperCase()}</span>
      </div>
      {selectedCount > 0 && (
        <>
          <div className="status-separator" />
          <div className="status-item">
            <span className="status-label">Selected:</span>
            <span className="status-value status-highlight">{selectedCount}</span>
          </div>
        </>
      )}
      <div className="status-separator" />
      <div
        className={`status-toggle ${showGrid ? 'active' : ''}`}
        onClick={() => useCadStore.getState().setShowGrid(!showGrid)}
        title="Toggle Grid (F7)"
      >
        GRID
      </div>
      <div
        className={`status-toggle ${gridSnap ? 'active' : ''}`}
        onClick={() => useCadStore.getState().setGridSnap(!gridSnap)}
        title="Toggle Snap (F8)"
      >
        SNAP
      </div>
      <div className="status-separator" />
      <div className="status-item">
        <span className="status-label">Snap:</span>
        <span className={`status-value snap-indicator snap-${snapType}`}>{snapType.toUpperCase()}</span>
      </div>
      <div className="status-separator" />
      <div className="status-item">
        <span className="status-label">Layer:</span>
        <span className="status-value" style={{ color: currentLayer?.color }}>
          {currentLayer?.name ?? '0'}
        </span>
      </div>
      <div className="status-separator" />
      <div className="status-item">
        <span className="status-label">Zoom:</span>
        <span className="status-value mono">{(zoom * 100).toFixed(0)}%</span>
      </div>
      <div className="status-separator" />
      <div className="status-item">
        <span className="status-label">Entities:</span>
        <span className="status-value mono">{entities.length}</span>
      </div>
    </div>
  );
}
