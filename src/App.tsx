
import { MenuBar } from './components/MenuBar';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { LayerPanel } from './components/LayerPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CommandLine } from './components/CommandLine';
import { StatusBar } from './components/StatusBar';
import './index.css';

export default function App() {
  return (
    <div className="app">
      <MenuBar />
      <Toolbar />
      <div className="main-area">
        <LayerPanel />
        <div className="canvas-container">
          <Canvas />
        </div>
        <PropertiesPanel />
      </div>
      <CommandLine />
      <StatusBar />
    </div>
  );
}
