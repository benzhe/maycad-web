import { useState } from 'react';
import { useCadStore } from '../store/cadStore';

export function LayerPanel() {
  const { layers, currentLayerId, setCurrentLayer, addLayer, removeLayer, updateLayer } = useCadStore();
  const [newLayerName, setNewLayerName] = useState('');

  const handleAddLayer = () => {
    const name = newLayerName.trim() || `Layer ${layers.length}`;
    addLayer(name);
    setNewLayerName('');
  };

  return (
    <div className="panel layer-panel">
      <div className="panel-header">
        <span>Layers</span>
        <span className="panel-count">{layers.length}</span>
      </div>
      <div className="layer-list">
        {layers.map(layer => (
          <div
            key={layer.id}
            className={`layer-item ${currentLayerId === layer.id ? 'current' : ''}`}
            onClick={() => setCurrentLayer(layer.id)}
          >
            <button
              className="layer-icon-btn"
              onClick={e => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? '👁' : '🚫'}
            </button>
            <button
              className="layer-icon-btn"
              onClick={e => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
              title={layer.locked ? 'Unlock layer' : 'Lock layer'}
            >
              {layer.locked ? '🔒' : '🔓'}
            </button>
            <input
              type="color"
              className="layer-color-swatch"
              value={layer.color}
              onChange={e => updateLayer(layer.id, { color: e.target.value })}
              onClick={e => e.stopPropagation()}
              title="Layer color"
            />
            <span className="layer-name" style={{ opacity: layer.visible ? 1 : 0.4 }}>
              {layer.name}
            </span>
            {layer.id !== 'layer-0' && (
              <button
                className="layer-delete-btn"
                onClick={e => {
                  e.stopPropagation();
                  if (confirm(`Delete layer "${layer.name}"?`)) removeLayer(layer.id);
                }}
                title="Delete layer"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="layer-add">
        <input
          type="text"
          placeholder="Layer name..."
          value={newLayerName}
          onChange={e => setNewLayerName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddLayer()}
        />
        <button onClick={handleAddLayer} title="Add layer">+</button>
      </div>
    </div>
  );
}
