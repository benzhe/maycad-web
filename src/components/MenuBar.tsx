import { useRef, useState, type ChangeEvent } from 'react';
import { useCadStore } from '../store/cadStore';
import { saveDrawing, loadDrawing, exportToSVG } from '../utils/fileUtils';
import type { DrawingFile } from '../utils/fileUtils';

export function MenuBar() {
  const store = useCadStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus = [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: () => store.newDrawing() },
        { label: 'Open...', shortcut: 'Ctrl+O', action: () => fileInputRef.current?.click() },
        { label: 'Save', shortcut: 'Ctrl+S', action: () => saveDrawing(store.entities, store.layers) },
        { separator: true },
        { label: 'Export SVG', action: () => exportToSVG(store.entities, store.layers) },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => store.undo() },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => store.redo() },
        { separator: true },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => store.copySelected() },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => store.paste() },
        { label: 'Delete', shortcut: 'Del', action: () => store.deleteSelected() },
        { separator: true },
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => store.selectEntities(store.entities.map(e => e.id)) },
      ],
    },
    {
      label: 'View',
      items: [
        { label: store.showGrid ? '✓ Grid' : 'Grid', shortcut: 'F7', action: () => store.setShowGrid(!store.showGrid) },
        { label: store.gridSnap ? '✓ Snap' : 'Snap', shortcut: 'F8', action: () => store.setGridSnap(!store.gridSnap) },
        { separator: true },
        { label: store.darkTheme ? '✓ Dark Theme' : 'Dark Theme', action: () => store.setDarkTheme(!store.darkTheme) },
        { separator: true },
        {
          label: 'Zoom In', shortcut: '+', action: () => {
            const nz = store.zoom * 1.25;
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            store.setPan({ x: cx - (cx - store.pan.x) * 1.25, y: cy - (cy - store.pan.y) * 1.25 });
            store.setZoom(nz);
          }
        },
        {
          label: 'Zoom Out', shortcut: '-', action: () => {
            const nz = store.zoom / 1.25;
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            store.setPan({ x: cx - (cx - store.pan.x) / 1.25, y: cy - (cy - store.pan.y) / 1.25 });
            store.setZoom(nz);
          }
        },
        { label: 'Zoom Reset', action: () => { store.setZoom(1); store.setPan({ x: 400, y: 300 }); } },
      ],
    },
    {
      label: 'Draw',
      items: [
        { label: 'Line', shortcut: 'L', action: () => store.setActiveTool('line') },
        { label: 'Circle', shortcut: 'C', action: () => store.setActiveTool('circle') },
        { label: 'Arc', shortcut: 'A', action: () => store.setActiveTool('arc') },
        { label: 'Rectangle', shortcut: 'R', action: () => store.setActiveTool('rectangle') },
        { label: 'Polyline', shortcut: 'P', action: () => store.setActiveTool('polyline') },
        { label: 'Text', shortcut: 'T', action: () => store.setActiveTool('text') },
      ],
    },
    {
      label: 'Modify',
      items: [
        { label: 'Move', shortcut: 'M', action: () => store.setActiveTool('move') },
        { label: 'Delete', shortcut: 'Del', action: () => store.deleteSelected() },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => store.copySelected() },
      ],
    },
    {
      label: 'Help',
      items: [
        {
          label: 'Keyboard Shortcuts', action: () => alert(
            'L = Line\nC = Circle\nA = Arc\nR = Rectangle\nP = Polyline\nT = Text\n' +
            'Esc = Select\nDel = Delete\nCtrl+Z = Undo\nCtrl+Y = Redo\n' +
            'F7 = Toggle Grid\nF8 = Toggle Snap\n' +
            'Right-click or double-click to end polyline/line chain\n' +
            'Middle mouse = Pan\nScroll = Zoom'
          )
        },
        { label: 'About MayCAD', action: () => alert('MayCAD Web v1.0\nA professional 2D CAD application\nBuilt with React + TypeScript + Canvas') },
      ],
    },
  ];

  const handleFileOpen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data: DrawingFile = await loadDrawing(file);
      store.pushUndo();
      store.pushCommand(`Opened ${file.name}`);
      // Use a small timeout to allow the store to update
      setTimeout(() => {
        useCadStore.setState({ entities: data.entities, layers: data.layers });
      }, 0);
    } catch (err) {
      alert('Failed to open file: ' + (err as Error).message);
    }
    e.target.value = '';
  };

  return (
    <div className="menu-bar" onMouseLeave={() => setOpenMenu(null)}>
      {menus.map(menu => (
        <div
          key={menu.label}
          className={`menu-item ${openMenu === menu.label ? 'active' : ''}`}
          onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
          onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
        >
          {menu.label}
          {openMenu === menu.label && (
            <div className="dropdown">
              {menu.items.map((item, i) =>
                (item as { separator?: boolean }).separator ? (
                  <div key={i} className="dropdown-separator" />
                ) : (
                  <button
                    key={i}
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      (item as { action?: () => void }).action?.();
                      setOpenMenu(null);
                    }}
                  >
                    <span>{(item as { label: string }).label}</span>
                    {(item as { shortcut?: string }).shortcut && (
                      <span className="shortcut">{(item as { shortcut?: string }).shortcut}</span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
      <div className="menu-bar-title">MayCAD Web</div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".maycad,.json"
        style={{ display: 'none' }}
        onChange={handleFileOpen}
      />
    </div>
  );
}
