import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

const MM = 0.001
const GRID_STEP_MM = 10
const AUTO_SAVE_KEY = 'maycad-web-autosave-v1'

document.querySelector('#app').innerHTML = `
  <div class="layout">
    <header class="topbar">
      <div class="group">
        <button data-action="new">新建</button>
        <button data-action="save">另存为</button>
        <button data-action="open">打开</button>
        <input id="open-file" type="file" accept=".json" hidden />
      </div>
      <div class="group">
        <button data-action="undo">撤销</button>
        <button data-action="redo">重做</button>
        <button data-action="copy">复制</button>
        <button data-action="paste">粘贴</button>
        <button data-action="delete">删除</button>
      </div>
      <div class="group">
        <button data-action="view-top">顶</button>
        <button data-action="view-bottom">底</button>
        <button data-action="view-front">前</button>
        <button data-action="view-back">后</button>
        <button data-action="view-left">左</button>
        <button data-action="view-right">右</button>
        <button data-action="view-iso">等轴</button>
        <button data-action="projection">切换正交/透视</button>
      </div>
      <div class="group">
        <button data-action="mode-select">选择</button>
        <button data-action="mode-draw">绘制型材</button>
        <button data-action="mode-measure">测量</button>
        <button data-action="mode-move">移动</button>
        <button data-action="mode-rotate">旋转</button>
        <button data-action="material">真实/性能材质</button>
        <button data-action="demo">演示模式</button>
      </div>
    </header>
    <aside class="sidebar left">
      <h3>零件库</h3>
      <div class="catalog-block">
        <h4>型材库</h4>
        <button data-action="add-profile" data-series="20">20 轻型</button>
        <button data-action="add-profile" data-series="30">30 重型</button>
        <button data-action="add-profile" data-series="40">40 圆角</button>
      </div>
      <div class="catalog-block">
        <h4>配件库</h4>
        <button data-action="add-accessory" data-type="corner">角件</button>
        <button data-action="add-accessory" data-type="foot">地脚</button>
        <button data-action="add-accessory" data-type="hinge">铰链</button>
      </div>
      <div class="catalog-block">
        <h4>板材库</h4>
        <button data-action="add-panel" data-type="acrylic">亚克力板</button>
        <button data-action="add-panel" data-type="metal">钣金件</button>
        <button data-action="auto-panel">智能板材生成</button>
      </div>
      <div class="catalog-block">
        <h4>检测与导出</h4>
        <button data-action="collision">干涉检查</button>
        <button data-action="export-csv">导出 BOM(CSV)</button>
        <button data-action="export-stl">导出 STL</button>
        <button data-action="export-obj">导出 OBJ</button>
        <button data-action="export-gltf">导出 GLTF</button>
        <button data-action="export-png">导出视图 PNG</button>
      </div>
    </aside>
    <main class="viewport-wrap">
      <div id="viewport"></div>
      <div id="selection-box"></div>
      <div id="measure-overlay"></div>
    </main>
    <aside class="sidebar right">
      <h3>属性</h3>
      <label>类型<input id="prop-type" readonly /></label>
      <label>X(mm)<input id="prop-x" type="number" /></label>
      <label>Y(mm)<input id="prop-y" type="number" /></label>
      <label>Z(mm)<input id="prop-z" type="number" /></label>
      <label>旋转Y(°)<input id="prop-ry" type="number" /></label>
      <label>长度(mm)<input id="prop-length" type="number" min="1" /></label>
      <button data-action="apply-prop">应用属性</button>
    </aside>
    <footer class="bottombar">
      <div class="status" id="status"></div>
      <table>
        <thead><tr><th>类型</th><th>规格</th><th>数量</th><th>总长(mm)</th><th>6米料</th></tr></thead>
        <tbody id="bom-body"></tbody>
      </table>
    </footer>
  </div>
`

const viewport = document.getElementById('viewport')
const statusEl = document.getElementById('status')
const bomBody = document.getElementById('bom-body')
const selectionBox = document.getElementById('selection-box')
const fileInput = document.getElementById('open-file')

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x11161f)

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(viewport.clientWidth, viewport.clientHeight)
viewport.appendChild(renderer.domElement)

const perspectiveCamera = new THREE.PerspectiveCamera(60, viewport.clientWidth / viewport.clientHeight, 0.01, 1000)
perspectiveCamera.position.set(1.6, 1.3, 1.6)
let orthoSpan = 1.6
const orthographicCamera = createOrthographicCamera()
let camera = perspectiveCamera

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.target.set(0, 0.2, 0)

const transformControls = new TransformControls(camera, renderer.domElement)
scene.add(transformControls.getHelper())
transformControls.addEventListener('dragging-changed', (e) => {
  controls.enabled = !e.value
})

const ambient = new THREE.AmbientLight(0xffffff, 0.55)
const keyLight = new THREE.DirectionalLight(0xffffff, 0.8)
keyLight.position.set(2, 4, 2)
const fillLight = new THREE.PointLight(0x88aaff, 0.5)
fillLight.position.set(-2, 1, -1)
scene.add(ambient, keyLight, fillLight)

scene.add(new THREE.GridHelper(200, 200, 0x666666, 0x2f2f2f))
scene.add(new THREE.AxesHelper(0.5))

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const tmpVec = new THREE.Vector3()

const state = {
  mode: 'select',
  materialMode: 'pbr',
  selectable: [],
  selected: [],
  clipboard: [],
  drawStart: null,
  measureStart: null,
  measureObjects: [],
  undoStack: [],
  redoStack: [],
  boxSelectStart: null,
  transformBefore: null,
}

const profileDims = {
  20: { size: 20, color: 0xa5adb7 },
  30: { size: 30, color: 0xa8afba },
  40: { size: 40, color: 0xb0b6be },
}

const materials = {
  profilePBR: (color) => new THREE.MeshStandardMaterial({ color, metalness: 0.68, roughness: 0.28 }),
  accessoryPBR: new THREE.MeshStandardMaterial({ color: 0x4b90e2, metalness: 0.45, roughness: 0.3 }),
  panelPBR: new THREE.MeshStandardMaterial({ color: 0xa58f72, metalness: 0.1, roughness: 0.72, side: THREE.DoubleSide }),
}

function createOrthographicCamera() {
  const aspect = viewport.clientWidth / viewport.clientHeight
  const c = new THREE.OrthographicCamera(-orthoSpan * aspect, orthoSpan * aspect, orthoSpan, -orthoSpan, -100, 100)
  c.position.copy(perspectiveCamera.position)
  c.lookAt(0, 0, 0)
  return c
}

function setStatus(text) {
  statusEl.textContent = text
}

function makeMaterial(type, color) {
  if (state.materialMode === 'wire') {
    return new THREE.MeshBasicMaterial({ color: color ?? 0xcccccc, wireframe: type !== 'panel' })
  }
  if (type === 'profile') return materials.profilePBR(color)
  if (type === 'accessory') return materials.accessoryPBR.clone()
  return materials.panelPBR.clone()
}

function updateAllMaterials() {
  for (const mesh of state.selectable) {
    const old = mesh.material
    mesh.material = makeMaterial(mesh.userData.kind, mesh.userData.color)
    if (Array.isArray(old)) old.forEach((m) => m.dispose())
    else old.dispose()
  }
}

function executeCommand(command) {
  command.do()
  state.undoStack.push(command)
  state.redoStack.length = 0
  updateBom()
  saveAuto()
}

function undo() {
  const command = state.undoStack.pop()
  if (!command) return
  command.undo()
  state.redoStack.push(command)
  updateBom()
}

function redo() {
  const command = state.redoStack.pop()
  if (!command) return
  command.do()
  state.undoStack.push(command)
  updateBom()
}

function addSelectable(mesh) {
  state.selectable.push(mesh)
  scene.add(mesh)
}

function removeSelectable(mesh) {
  const idx = state.selectable.indexOf(mesh)
  if (idx >= 0) state.selectable.splice(idx, 1)
  scene.remove(mesh)
  clearSelection()
}

function createProfile({ series = '20', start, end }) {
  const cfg = profileDims[series] ?? profileDims[20]
  const s = (start ?? new THREE.Vector3(-0.1, 0.2, 0)).clone()
  const e = (end ?? new THREE.Vector3(0.1, 0.2, 0)).clone()
  const direction = e.clone().sub(s)
  const length = Math.max(direction.length(), 30 * MM)
  const geometry = new THREE.BoxGeometry(length, cfg.size * MM, cfg.size * MM)
  const mesh = new THREE.Mesh(geometry, makeMaterial('profile', cfg.color))
  mesh.position.copy(s.clone().add(e).multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction.normalize())
  mesh.userData = {
    kind: 'profile',
    series,
    lengthMm: Math.round(length / MM),
    color: cfg.color,
    baseSizeMm: cfg.size,
  }
  return mesh
}

function createAccessory(type = 'corner', at = new THREE.Vector3()) {
  const geometry = new THREE.BoxGeometry(25 * MM, 25 * MM, 25 * MM)
  const mesh = new THREE.Mesh(geometry, makeMaterial('accessory', 0x4b90e2))
  mesh.position.copy(at)
  mesh.userData = { kind: 'accessory', accessoryType: type, color: 0x4b90e2 }
  return mesh
}

function createPanel(type = 'acrylic', widthMm = 400, heightMm = 300, at = new THREE.Vector3()) {
  const geometry = new THREE.PlaneGeometry(widthMm * MM, heightMm * MM)
  const mesh = new THREE.Mesh(geometry, makeMaterial('panel', 0xa58f72))
  mesh.position.copy(at)
  mesh.rotation.x = -Math.PI / 2
  mesh.userData = { kind: 'panel', panelType: type, widthMm, heightMm, color: 0xa58f72 }
  return mesh
}

function select(mesh, additive = false) {
  if (!additive) clearSelection()
  if (!mesh || state.selected.includes(mesh)) return
  state.selected.push(mesh)
  mesh.userData.prevEmissive = mesh.material.emissive?.getHex?.() ?? 0
  if (mesh.material.emissive) mesh.material.emissive.setHex(0x2f8fff)
  transformControls.attach(mesh)
  updatePropertyPanel()
}

function clearSelection() {
  state.selected = state.selected.filter((mesh) => {
    if (mesh.material?.emissive) mesh.material.emissive.setHex(mesh.userData.prevEmissive ?? 0)
    return false
  })
  transformControls.detach()
  updatePropertyPanel()
}

function updatePropertyPanel() {
  const first = state.selected[0]
  const get = (id) => document.getElementById(id)
  if (!first) {
    get('prop-type').value = ''
    get('prop-x').value = ''
    get('prop-y').value = ''
    get('prop-z').value = ''
    get('prop-ry').value = ''
    get('prop-length').value = ''
    return
  }
  get('prop-type').value = first.userData.kind
  get('prop-x').value = Math.round(first.position.x / MM)
  get('prop-y').value = Math.round(first.position.y / MM)
  get('prop-z').value = Math.round(first.position.z / MM)
  get('prop-ry').value = Math.round(THREE.MathUtils.radToDeg(first.rotation.y))
  get('prop-length').value = first.userData.lengthMm ?? ''
}

function applyProperties() {
  const first = state.selected[0]
  if (!first) return
  const prevPosition = first.position.clone()
  const prevRotationY = first.rotation.y
  const prevLengthMm = first.userData.lengthMm
  const nx = Number(document.getElementById('prop-x').value) * MM
  const ny = Number(document.getElementById('prop-y').value) * MM
  const nz = Number(document.getElementById('prop-z').value) * MM
  const nry = THREE.MathUtils.degToRad(Number(document.getElementById('prop-ry').value || 0))
  const lengthMm = Number(document.getElementById('prop-length').value)
  const applyLength = (targetLengthMm) => {
    first.userData.lengthMm = Math.round(targetLengthMm)
    first.geometry.dispose()
    first.geometry = new THREE.BoxGeometry(targetLengthMm * MM, first.userData.baseSizeMm * MM, first.userData.baseSizeMm * MM)
  }
  executeCommand({
    do: () => {
      first.position.set(nx, ny, nz)
      first.rotation.y = nry
      if (first.userData.kind === 'profile' && Number.isFinite(lengthMm) && lengthMm > 0) {
        applyLength(lengthMm)
      }
    },
    undo: () => {
      first.position.copy(prevPosition)
      first.rotation.y = prevRotationY
      if (first.userData.kind === 'profile' && Number.isFinite(prevLengthMm) && prevLengthMm > 0) {
        applyLength(prevLengthMm)
      }
    },
  })
}

function screenPointToWorld(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hit = new THREE.Vector3()
  raycaster.ray.intersectPlane(groundPlane, hit)
  const snapped = snapPoint(hit)

  const objectHits = raycaster.intersectObjects(state.selectable, false)
  if (objectHits[0]) {
    snapped.copy(snapPoint(objectHits[0].point))
  }
  return snapped
}

function snapPoint(point) {
  const snapped = point.clone()
  snapped.x = Math.round(snapped.x / (GRID_STEP_MM * MM)) * GRID_STEP_MM * MM
  snapped.y = Math.round(snapped.y / (GRID_STEP_MM * MM)) * GRID_STEP_MM * MM
  snapped.z = Math.round(snapped.z / (GRID_STEP_MM * MM)) * GRID_STEP_MM * MM

  const candidates = []
  for (const mesh of state.selectable) {
    if (mesh.userData.kind !== 'profile') continue
    const half = (mesh.userData.lengthMm * MM) / 2
    const left = new THREE.Vector3(-half, 0, 0).applyQuaternion(mesh.quaternion).add(mesh.position)
    const right = new THREE.Vector3(half, 0, 0).applyQuaternion(mesh.quaternion).add(mesh.position)
    candidates.push(left, right, left.clone().add(right).multiplyScalar(0.5))
  }

  let best = snapped
  let bestDist = 25 * MM
  for (const c of candidates) {
    const d = c.distanceTo(point)
    if (d < bestDist) {
      best = c
      bestDist = d
    }
  }
  return best.clone()
}

function pickMesh(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  return raycaster.intersectObjects(state.selectable, false)[0]?.object
}

function beginBoxSelection(x, y) {
  state.boxSelectStart = { x, y }
  selectionBox.style.display = 'block'
  selectionBox.style.left = `${x}px`
  selectionBox.style.top = `${y}px`
  selectionBox.style.width = '0px'
  selectionBox.style.height = '0px'
}

function updateBoxSelection(x, y) {
  if (!state.boxSelectStart) return
  const { x: sx, y: sy } = state.boxSelectStart
  selectionBox.style.left = `${Math.min(x, sx)}px`
  selectionBox.style.top = `${Math.min(y, sy)}px`
  selectionBox.style.width = `${Math.abs(x - sx)}px`
  selectionBox.style.height = `${Math.abs(y - sy)}px`
}

function finishBoxSelection(x, y, additive) {
  if (!state.boxSelectStart) return
  const { x: sx, y: sy } = state.boxSelectStart
  selectionBox.style.display = 'none'
  const minX = Math.min(x, sx)
  const maxX = Math.max(x, sx)
  const minY = Math.min(y, sy)
  const maxY = Math.max(y, sy)

  if (!additive) clearSelection()
  for (const mesh of state.selectable) {
    tmpVec.copy(mesh.position).project(camera)
    const px = ((tmpVec.x + 1) / 2) * viewport.clientWidth
    const py = ((-tmpVec.y + 1) / 2) * viewport.clientHeight
    if (px >= minX && px <= maxX && py >= minY && py <= maxY) select(mesh, true)
  }
  state.boxSelectStart = null
}

function addProfileBySeries(series = '20') {
  const mesh = createProfile({ series })
  executeCommand({ do: () => addSelectable(mesh), undo: () => removeSelectable(mesh) })
  setStatus(`已添加 ${series} 系列型材`)
  detectAutoConnection(mesh)
}

function detectAutoConnection(newProfile) {
  if (newProfile.userData.kind !== 'profile') return
  const half = (newProfile.userData.lengthMm * MM) / 2
  const npA = new THREE.Vector3(-half, 0, 0).applyQuaternion(newProfile.quaternion).add(newProfile.position)
  const npB = new THREE.Vector3(half, 0, 0).applyQuaternion(newProfile.quaternion).add(newProfile.position)
  const newDir = npB.clone().sub(npA).normalize()

  for (const mesh of state.selectable) {
    if (mesh === newProfile || mesh.userData.kind !== 'profile') continue
    const h = (mesh.userData.lengthMm * MM) / 2
    const a = new THREE.Vector3(-h, 0, 0).applyQuaternion(mesh.quaternion).add(mesh.position)
    const b = new THREE.Vector3(h, 0, 0).applyQuaternion(mesh.quaternion).add(mesh.position)
    const dir = b.clone().sub(a).normalize()
    const dot = Math.abs(dir.dot(newDir))
    const closePoint = [a, b].find((p) => p.distanceTo(npA) < 15 * MM || p.distanceTo(npB) < 15 * MM)
    if (closePoint && dot < 0.2) {
      const corner = createAccessory('corner', closePoint)
      executeCommand({ do: () => addSelectable(corner), undo: () => removeSelectable(corner) })
      setStatus('检测到 90° 连接，已自动插入角件')
      return
    }
  }
}

function generatePanelFromSelection() {
  const profiles = state.selected.filter((m) => m.userData.kind === 'profile')
  if (profiles.length < 2) return setStatus('请选择至少两根型材以生成板材')
  const box = new THREE.Box3()
  profiles.forEach((p) => box.expandByObject(p))
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  const panel = createPanel('auto', Math.max(size.x / MM, 100), Math.max(size.z / MM, 100), new THREE.Vector3(center.x, box.min.y + 1 * MM, center.z))
  executeCommand({ do: () => addSelectable(panel), undo: () => removeSelectable(panel) })
  setStatus('已根据选中型材区域生成板材')
}

function createMeasurement(start, end) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x2ee87a }))
  const distanceMm = Math.round(start.distanceTo(end) / MM)
  const sprite = makeTextSprite(`${distanceMm} mm`)
  sprite.position.copy(start.clone().add(end).multiplyScalar(0.5).add(new THREE.Vector3(0, 15 * MM, 0)))
  state.measureObjects.push(line, sprite)
  scene.add(line, sprite)
  setStatus(`测量距离: ${distanceMm} mm`)
}

function makeTextSprite(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(20, 20, 20, 0.8)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.font = '24px sans-serif'
  ctx.fillText(text, 14, 40)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.18, 0.045, 1)
  return sprite
}

function checkCollision() {
  let count = 0
  for (const mesh of state.selectable) {
    if (mesh.material?.emissive) mesh.material.emissive.setHex(mesh.userData.prevEmissive ?? 0)
  }

  for (let i = 0; i < state.selectable.length; i += 1) {
    for (let j = i + 1; j < state.selectable.length; j += 1) {
      const a = state.selectable[i]
      const b = state.selectable[j]
      const ba = new THREE.Box3().setFromObject(a)
      const bb = new THREE.Box3().setFromObject(b)
      if (ba.intersectsBox(bb)) {
        count += 1
        if (a.material?.emissive) a.material.emissive.setHex(0xff2a2a)
        if (b.material?.emissive) b.material.emissive.setHex(0xff2a2a)
      }
    }
  }
  setStatus(count ? `发现 ${count} 处干涉` : '未发现干涉')
}

function getBomRows() {
  const rows = new Map()
  for (const mesh of state.selectable) {
    const spec = mesh.userData.series ?? mesh.userData.accessoryType ?? mesh.userData.panelType ?? '-'
    const key = `${mesh.userData.kind}:${spec}`
    const prev = rows.get(key) ?? { kind: mesh.userData.kind, spec, count: 0, totalLength: 0 }
    prev.count += 1
    prev.totalLength += mesh.userData.lengthMm ?? 0
    rows.set(key, prev)
  }
  return [...rows.values()]
}

function updateBom() {
  const rows = getBomRows()
  bomBody.innerHTML = rows
    .map((row) => {
      const stock = row.totalLength ? Math.ceil(row.totalLength / 6000) : '-'
      return `<tr><td>${row.kind}</td><td>${row.spec}</td><td>${row.count}</td><td>${row.totalLength || '-'}</td><td>${stock}</td></tr>`
    })
    .join('')
}

function saveAsJson() {
  const payload = {
    camera: {
      mode: camera === perspectiveCamera ? 'perspective' : 'orthographic',
      position: camera.position.toArray(),
      target: controls.target.toArray(),
    },
    objects: state.selectable.map((m) => ({
      kind: m.userData.kind,
      userData: m.userData,
      position: m.position.toArray(),
      quaternion: m.quaternion.toArray(),
      rotation: [m.rotation.x, m.rotation.y, m.rotation.z],
    })),
  }
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'project.maycad.json')
  setStatus('工程已导出为本地 JSON')
}

function openFromJson(file) {
  const reader = new FileReader()
  reader.onload = () => {
    const payload = JSON.parse(String(reader.result || '{}'))
    resetScene()
    for (const item of payload.objects ?? []) {
      let mesh = null
      if (item.kind === 'profile') {
        const start = new THREE.Vector3(-((item.userData.lengthMm ?? 100) * MM) / 2, 0, 0)
        const end = new THREE.Vector3(((item.userData.lengthMm ?? 100) * MM) / 2, 0, 0)
        mesh = createProfile({ series: item.userData.series ?? '20', start, end })
      }
      if (item.kind === 'accessory') mesh = createAccessory(item.userData.accessoryType)
      if (item.kind === 'panel') mesh = createPanel(item.userData.panelType, item.userData.widthMm, item.userData.heightMm)
      if (!mesh) continue
      mesh.userData = { ...mesh.userData, ...item.userData }
      mesh.position.fromArray(item.position)
      mesh.quaternion.fromArray(item.quaternion)
      addSelectable(mesh)
    }
    if (payload.camera) {
      const cam = payload.camera.mode === 'orthographic' ? orthographicCamera : perspectiveCamera
      switchProjection(cam === orthographicCamera)
      camera.position.fromArray(payload.camera.position)
      controls.target.fromArray(payload.camera.target)
    }
    updateBom()
    setStatus('已打开本地工程文件')
  }
  reader.readAsText(file)
}

function saveAuto() {
  const payload = {
    objects: state.selectable.map((m) => ({
      kind: m.userData.kind,
      userData: m.userData,
      position: m.position.toArray(),
      quaternion: m.quaternion.toArray(),
    })),
  }
  localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(payload))
}

function loadAuto() {
  const raw = localStorage.getItem(AUTO_SAVE_KEY)
  if (!raw) return
  try {
    const payload = JSON.parse(raw)
    if (!payload.objects?.length) return
    for (const item of payload.objects) {
      let mesh = null
      if (item.kind === 'profile') {
        const half = ((item.userData.lengthMm ?? 100) * MM) / 2
        mesh = createProfile({ series: item.userData.series ?? '20', start: new THREE.Vector3(-half, 0, 0), end: new THREE.Vector3(half, 0, 0) })
      }
      if (item.kind === 'accessory') mesh = createAccessory(item.userData.accessoryType)
      if (item.kind === 'panel') mesh = createPanel(item.userData.panelType, item.userData.widthMm, item.userData.heightMm)
      if (!mesh) continue
      mesh.userData = { ...mesh.userData, ...item.userData }
      mesh.position.fromArray(item.position)
      mesh.quaternion.fromArray(item.quaternion)
      addSelectable(mesh)
    }
    updateBom()
    setStatus('已恢复自动保存工程')
  } catch {
    setStatus('自动保存数据损坏，已跳过恢复')
  }
}

function resetScene() {
  [...state.selectable].forEach((m) => removeSelectable(m))
  state.undoStack.length = 0
  state.redoStack.length = 0
  state.measureObjects.forEach((obj) => scene.remove(obj))
  state.measureObjects.length = 0
}

function exportCsv() {
  const rows = getBomRows()
  const csv = ['kind,spec,count,totalLengthMm,stock6m']
  for (const row of rows) {
    csv.push(`${row.kind},${row.spec},${row.count},${row.totalLength},${row.totalLength ? Math.ceil(row.totalLength / 6000) : ''}`)
  }
  downloadBlob(new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' }), 'bom.csv')
  setStatus('BOM 已导出为 CSV')
}

function exportScene(format) {
  let exporter
  if (format === 'stl') exporter = new STLExporter()
  if (format === 'obj') exporter = new OBJExporter()
  if (format === 'gltf') exporter = new GLTFExporter()

  if (format === 'gltf') {
    exporter.parse(
      scene,
      (gltf) => {
        const text = JSON.stringify(gltf)
        downloadBlob(new Blob([text], { type: 'model/gltf+json' }), 'scene.gltf')
        setStatus('GLTF 导出完成')
      },
      () => {},
      { binary: false },
    )
    return
  }

  const output = exporter.parse(scene)
  const content = typeof output === 'string' ? output : new TextDecoder().decode(output)
  downloadBlob(new Blob([content], { type: 'text/plain' }), `scene.${format}`)
  setStatus(`${format.toUpperCase()} 导出完成`)
}

function exportPng() {
  renderer.render(scene, camera)
  renderer.domElement.toBlob((blob) => {
    if (blob) downloadBlob(blob, 'view.png')
  })
  setStatus('PNG 视图截图已导出')
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

function switchProjection(forceOrtho = camera === perspectiveCamera) {
  const target = controls.target.clone()
  const from = camera
  camera = forceOrtho ? orthographicCamera : perspectiveCamera
  camera.position.copy(from.position)
  camera.lookAt(target)
  controls.object = camera
  transformControls.camera = camera
  onResize()
}

function setView(view) {
  const distance = 2.2
  const t = controls.target
  if (view === 'top') camera.position.set(t.x, t.y + distance, t.z)
  if (view === 'bottom') camera.position.set(t.x, t.y - distance, t.z)
  if (view === 'front') camera.position.set(t.x, t.y + 0.3, t.z + distance)
  if (view === 'back') camera.position.set(t.x, t.y + 0.3, t.z - distance)
  if (view === 'left') camera.position.set(t.x - distance, t.y + 0.3, t.z)
  if (view === 'right') camera.position.set(t.x + distance, t.y + 0.3, t.z)
  if (view === 'iso') camera.position.set(t.x + 1.6, t.y + 1.2, t.z + 1.5)
  camera.lookAt(t)
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (state.mode === 'select') {
    const hit = pickMesh(e.clientX, e.clientY)
    if (hit) {
      select(hit, e.ctrlKey || e.shiftKey)
      state.transformBefore = hit.position.clone()
      return
    }
    beginBoxSelection(e.offsetX, e.offsetY)
  }
})

renderer.domElement.addEventListener('pointermove', (e) => {
  if (state.boxSelectStart) updateBoxSelection(e.offsetX, e.offsetY)
})

renderer.domElement.addEventListener('pointerup', (e) => {
  if (state.boxSelectStart) {
    finishBoxSelection(e.offsetX, e.offsetY, e.ctrlKey || e.shiftKey)
    return
  }
  if (state.mode === 'draw') {
    const p = screenPointToWorld(e.clientX, e.clientY)
    if (!state.drawStart) {
      state.drawStart = p
      return setStatus('已确定起点，点击第二个点完成型材绘制')
    }
    const profile = createProfile({ series: '30', start: state.drawStart, end: p })
    executeCommand({ do: () => addSelectable(profile), undo: () => removeSelectable(profile) })
    detectAutoConnection(profile)
    state.drawStart = null
    return setStatus('已创建型材')
  }
  if (state.mode === 'measure') {
    const p = screenPointToWorld(e.clientX, e.clientY)
    if (!state.measureStart) {
      state.measureStart = p
      return setStatus('测量起点已确定，请点击终点')
    }
    createMeasurement(state.measureStart, p)
    state.measureStart = null
  }
})

transformControls.addEventListener('mouseUp', () => {
  if (!state.selected[0] || !state.transformBefore) return
  const mesh = state.selected[0]
  const before = state.transformBefore.clone()
  const after = mesh.position.clone()
  if (before.distanceTo(after) < 0.000001) return
  executeCommand({
    do: () => mesh.position.copy(after),
    undo: () => mesh.position.copy(before),
  })
  state.transformBefore = null
})

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    return undo()
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    return redo()
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'c') {
    e.preventDefault()
    state.clipboard = state.selected.map((m) => ({
      kind: m.userData.kind,
      userData: { ...m.userData },
      position: m.position.toArray(),
      quaternion: m.quaternion.toArray(),
    }))
    return setStatus(`已复制 ${state.clipboard.length} 个对象`)
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'v') {
    e.preventDefault()
    for (const item of state.clipboard) {
      let mesh = null
      if (item.kind === 'profile') {
        const half = (item.userData.lengthMm * MM) / 2
        mesh = createProfile({ series: item.userData.series, start: new THREE.Vector3(-half, 0, 0), end: new THREE.Vector3(half, 0, 0) })
      }
      if (item.kind === 'accessory') mesh = createAccessory(item.userData.accessoryType)
      if (item.kind === 'panel') mesh = createPanel(item.userData.panelType, item.userData.widthMm, item.userData.heightMm)
      if (!mesh) continue
      mesh.userData = { ...mesh.userData, ...item.userData }
      mesh.position.fromArray(item.position).add(new THREE.Vector3(20 * MM, 0, 20 * MM))
      mesh.quaternion.fromArray(item.quaternion)
      executeCommand({ do: () => addSelectable(mesh), undo: () => removeSelectable(mesh) })
    }
    return setStatus('已粘贴对象')
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const toRemove = [...state.selected]
    clearSelection()
    for (const mesh of toRemove) {
      executeCommand({ do: () => removeSelectable(mesh), undo: () => addSelectable(mesh) })
    }
    setStatus(`已删除 ${toRemove.length} 个对象`)
  }
})

async function runDemo() {
  const click = (selector) => document.querySelector(selector)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  const pointer = (x, y) => {
    const payload = { bubbles: true, clientX: x, clientY: y, pointerId: 1 }
    renderer.domElement.dispatchEvent(new PointerEvent('pointerdown', payload))
    renderer.domElement.dispatchEvent(new PointerEvent('pointerup', payload))
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))

  click('button[data-action="add-profile"][data-series="20"]')
  await wait(250)
  click('button[data-action="mode-draw"]')
  await wait(250)
  const rect = renderer.domElement.getBoundingClientRect()
  pointer(rect.left + rect.width * 0.45, rect.top + rect.height * 0.58)
  await wait(250)
  pointer(rect.left + rect.width * 0.65, rect.top + rect.height * 0.45)
  await wait(250)
  click('button[data-action="mode-measure"]')
  await wait(250)
  pointer(rect.left + rect.width * 0.45, rect.top + rect.height * 0.58)
  await wait(250)
  pointer(rect.left + rect.width * 0.65, rect.top + rect.height * 0.45)
  await wait(250)
  click('button[data-action="collision"]')
  await wait(250)
  click('button[data-action="export-csv"]')
  setStatus('演示完成：已模拟键鼠并验证核心流程')
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]')
  if (!btn) return
  const action = btn.dataset.action
  if (action === 'new') return resetScene()
  if (action === 'save') return saveAsJson()
  if (action === 'open') return fileInput.click()
  if (action === 'undo') return undo()
  if (action === 'redo') return redo()
  if (action === 'copy') return window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }))
  if (action === 'paste') return window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true }))
  if (action === 'delete') return window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }))
  if (action === 'view-top') return setView('top')
  if (action === 'view-bottom') return setView('bottom')
  if (action === 'view-front') return setView('front')
  if (action === 'view-back') return setView('back')
  if (action === 'view-left') return setView('left')
  if (action === 'view-right') return setView('right')
  if (action === 'view-iso') return setView('iso')
  if (action === 'projection') return switchProjection()
  if (action === 'mode-select') return (state.mode = 'select')
  if (action === 'mode-draw') return (state.mode = 'draw')
  if (action === 'mode-measure') return (state.mode = 'measure')
  if (action === 'mode-move') return transformControls.setMode('translate')
  if (action === 'mode-rotate') return transformControls.setMode('rotate')
  if (action === 'material') {
    state.materialMode = state.materialMode === 'pbr' ? 'wire' : 'pbr'
    return updateAllMaterials()
  }
  if (action === 'demo') return runDemo()
  if (action === 'add-profile') return addProfileBySeries(btn.dataset.series)
  if (action === 'add-accessory') {
    const mesh = createAccessory(btn.dataset.type, new THREE.Vector3(0, 20 * MM, 0))
    return executeCommand({ do: () => addSelectable(mesh), undo: () => removeSelectable(mesh) })
  }
  if (action === 'add-panel') {
    const mesh = createPanel(btn.dataset.type, 500, 300, new THREE.Vector3(0, 1 * MM, 0))
    return executeCommand({ do: () => addSelectable(mesh), undo: () => removeSelectable(mesh) })
  }
  if (action === 'auto-panel') return generatePanelFromSelection()
  if (action === 'collision') return checkCollision()
  if (action === 'export-csv') return exportCsv()
  if (action === 'export-stl') return exportScene('stl')
  if (action === 'export-obj') return exportScene('obj')
  if (action === 'export-gltf') return exportScene('gltf')
  if (action === 'export-png') return exportPng()
  if (action === 'apply-prop') return applyProperties()
})

fileInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0]
  if (file) openFromJson(file)
  e.target.value = ''
})

function onResize() {
  renderer.setSize(viewport.clientWidth, viewport.clientHeight)
  perspectiveCamera.aspect = viewport.clientWidth / viewport.clientHeight
  perspectiveCamera.updateProjectionMatrix()
  const aspect = viewport.clientWidth / viewport.clientHeight
  orthographicCamera.left = -orthoSpan * aspect
  orthographicCamera.right = orthoSpan * aspect
  orthographicCamera.top = orthoSpan
  orthographicCamera.bottom = -orthoSpan
  orthographicCamera.updateProjectionMatrix()
}

window.addEventListener('resize', onResize)

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  for (const m of state.measureObjects) {
    if (m.isSprite) m.quaternion.copy(camera.quaternion)
  }
  renderer.render(scene, camera)
}

loadAuto()
setInterval(saveAuto, 7000)
updateBom()
setStatus('MayCAD Web Demo 已就绪')
animate()
