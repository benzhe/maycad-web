import Toolbar from './components/Toolbar'
import ProfileLibrary from './components/ProfileLibrary'
import Scene3D from './components/viewport/Scene3D'
import RightPanel from './components/RightPanel'
import StatusBar from './components/StatusBar'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ProfileLibrary />
        <Scene3D />
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  )
}
