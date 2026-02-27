
import { useCadStore } from '../store/cadStore';
import type { Entity, LineType } from '../types/entity';

export function PropertiesPanel() {
  const { entities, layers, updateEntity } = useCadStore();
  const selected = entities.filter(e => e.selected);

  if (selected.length === 0) {
    return (
      <div className="panel properties-panel">
        <div className="panel-header"><span>Properties</span></div>
        <div className="no-selection">No selection</div>
      </div>
    );
  }

  const entity = selected[0];
  const multiSelect = selected.length > 1;

  const handleChange = (field: string, value: unknown) => {
    selected.forEach(e => updateEntity(e.id, { [field]: value } as Partial<Entity>));
  };

  return (
    <div className="panel properties-panel">
      <div className="panel-header">
        <span>Properties</span>
        {multiSelect && <span className="panel-count">{selected.length}</span>}
      </div>

      <div className="prop-group">
        <div className="prop-label">Type</div>
        <div className="prop-value">{multiSelect ? 'Multiple' : entity.type}</div>
      </div>

      <div className="prop-group">
        <div className="prop-label">Layer</div>
        <select
          className="prop-select"
          value={entity.layerId}
          onChange={e => handleChange('layerId', e.target.value)}
        >
          {layers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <div className="prop-group">
        <div className="prop-label">Color</div>
        <div className="prop-row">
          <select
            className="prop-select"
            value={entity.color === 'bylayer' ? 'bylayer' : 'custom'}
            onChange={e => {
              if (e.target.value === 'bylayer') handleChange('color', 'bylayer');
            }}
          >
            <option value="bylayer">ByLayer</option>
            <option value="custom">Custom</option>
          </select>
          {entity.color !== 'bylayer' && (
            <input
              type="color"
              value={entity.color}
              onChange={e => handleChange('color', e.target.value)}
              className="prop-color"
            />
          )}
          {entity.color === 'bylayer' && (
            <button
              className="prop-btn"
              onClick={() => handleChange('color', '#ff0000')}
              title="Set custom color"
            >
              Custom
            </button>
          )}
        </div>
      </div>

      <div className="prop-group">
        <div className="prop-label">Line Type</div>
        <select
          className="prop-select"
          value={entity.lineType}
          onChange={e => handleChange('lineType', e.target.value as LineType)}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>

      <div className="prop-group">
        <div className="prop-label">Line Weight</div>
        <input
          type="number"
          className="prop-input"
          value={entity.lineWeight}
          min={0.5}
          max={10}
          step={0.5}
          onChange={e => handleChange('lineWeight', parseFloat(e.target.value))}
        />
      </div>

      {!multiSelect && entity.type === 'text' && (
        <>
          <div className="prop-group">
            <div className="prop-label">Content</div>
            <input
              type="text"
              className="prop-input"
              value={entity.content}
              onChange={e => handleChange('content', e.target.value)}
            />
          </div>
          <div className="prop-group">
            <div className="prop-label">Font Size</div>
            <input
              type="number"
              className="prop-input"
              value={entity.fontSize}
              min={6}
              max={200}
              onChange={e => handleChange('fontSize', parseInt(e.target.value))}
            />
          </div>
        </>
      )}

      {!multiSelect && entity.type === 'circle' && (
        <div className="prop-group">
          <div className="prop-label">Radius</div>
          <input
            type="number"
            className="prop-input"
            value={entity.radius.toFixed(2)}
            step={0.1}
            onChange={e => handleChange('radius', parseFloat(e.target.value))}
          />
        </div>
      )}

      {!multiSelect && entity.type === 'line' && (
        <>
          <div className="prop-group">
            <div className="prop-label">Start X</div>
            <input type="number" className="prop-input" value={entity.startPoint.x.toFixed(2)} step={0.1}
              onChange={e => handleChange('startPoint', { ...entity.startPoint, x: parseFloat(e.target.value) })} />
          </div>
          <div className="prop-group">
            <div className="prop-label">Start Y</div>
            <input type="number" className="prop-input" value={entity.startPoint.y.toFixed(2)} step={0.1}
              onChange={e => handleChange('startPoint', { ...entity.startPoint, y: parseFloat(e.target.value) })} />
          </div>
        </>
      )}
    </div>
  );
}
