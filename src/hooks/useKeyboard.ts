import { useEffect } from 'react';
import { useCadStore } from '../store/cadStore';

export function useKeyboard() {
  const store = useCadStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) store.redo();
            else store.undo();
            break;
          case 'y':
            e.preventDefault();
            store.redo();
            break;
          case 'c':
            e.preventDefault();
            store.copySelected();
            break;
          case 'v':
            e.preventDefault();
            store.paste();
            break;
          case 'a':
            e.preventDefault();
            store.selectEntities(store.entities.map(e => e.id));
            break;
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          store.setActiveTool('select');
          store.deselectAll();
          store.setDrawingState({ points: [], isDrawing: false, previewPoint: null });
          break;
        case 'Delete':
        case 'Backspace':
          store.deleteSelected();
          break;
        case 'F8':
          e.preventDefault();
          store.setGridSnap(!store.gridSnap);
          break;
        case 'F7':
          e.preventDefault();
          store.setShowGrid(!store.showGrid);
          break;
        case 'l': case 'L': store.setActiveTool('line'); break;
        case 'c': case 'C': store.setActiveTool('circle'); break;
        case 'a': case 'A': store.setActiveTool('arc'); break;
        case 'r': case 'R': store.setActiveTool('rectangle'); break;
        case 'p': case 'P': store.setActiveTool('polyline'); break;
        case 't': case 'T': store.setActiveTool('text'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);
}
