// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
  }`

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

function setupWebGL() {
  // retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // get the rendering context for webgl
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVarsToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }
  let identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false,identityM.elements);
}

// paint shape
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
// paint
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedNumSegments = 10;
// turtle
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_yellowAnimation = false;
// fps
let g_lastFrameTime = performance.now();
let g_fps = 0;
let g_seconds = 0;
let g_startTime;
// camera angle
let g_camera;
let g_isDragging = false;
let g_lastX = 0;
let g_lastY = 0;
let g_cameraAngleX = 0;
let g_cameraAngleY = 0; 
// map
let g_map;
let g_mouseMoved = false;
// normals
let g_normalOn = false;

function main() {
  setupWebGL();
  connectVarsToGLSL();
  initCubeBuffers();
  initTextures();
  document.onkeydown = keydown;
  g_camera = new Camera();
  g_map = initMap(32);
  
  document.getElementById('normalOn').onclick = function() { g_normalOn = true; };
  document.getElementById('normalOff').onclick = function() { g_normalOn = false; };

  canvas.onmousedown = function(ev) {
    g_isDragging = true;
    g_mouseMoved = false;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
    if (ev.button == 0 && !g_mouseMoved) {
      deleteCube();
    }
    g_isDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (!g_isDragging) return;
    g_mouseMoved = true;
    let dx = ev.clientX - g_lastX;
    let dy = ev.clientY - g_lastY;
    g_camera.yaw += dx * 0.5;
    g_camera.pitch -= dy * 0.5;
    g_camera.pitch = Math.max(-89, Math.min(89, g_camera.pitch));
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
  };

  canvas.oncontextmenu = function(ev) {
    ev.preventDefault();
    placeCube();
  };

  // specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderWorld();
  g_startTime = performance.now()/1000.0;
  requestAnimationFrame(tick);
}

function tick() {
  let now = performance.now();
  let delta = now - g_lastFrameTime;
  g_fps = 1000 / delta;
  g_lastFrameTime = now;
  g_seconds = performance.now() / 1000.0 - g_startTime;
  document.getElementById("fpsDisplay").innerHTML =
    "FPS: " + g_fps.toFixed(1);
  renderWorld();
  requestAnimationFrame(tick);
}

function initMap(size) {
  // init 3d array
  let map = [];
  for (let x = 0; x < size; x++) {
    map[x] = [];
    for (let y = 0; y < size; y++) {
      map[x][y] = new Int8Array(size);
    }
  }
  // add walls
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < 2; y++) {
      map[x][y][0] = 1;        // front wall
      map[x][y][size-1] = 1;   // back wall
      map[0][y][x] = 1;        // left wall
      map[size-1][y][x] = 1;   // right wall
    }
  }
  // add floor
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      map[x][0][z] = 1;
    }
  }
  map[8][1][8]   = 1;
  map[8][2][8]   = 1;  
  map[12][1][10] = 1;
  map[10][1][15] = 1;
  map[6][1][20]  = 1;
  map[6][2][20]  = 1;
  map[20][1][8]  = 1;
  map[18][1][18] = 1;
  map[15][1][6]  = 1;
  return map;
}

function drawMap() {
  let wall = new Cube();
  wall.color = [1.0, 1.0, 1.0, 1.0];
  let offset = g_map.length / 2;
  for (let x = 0; x < g_map.length; x++) {
    for (let y = 0; y < g_map[x].length; y++) {
      for (let z = 0; z < g_map[x][y].length; z++) {
        if (g_map[x][y][z] == 1) {
          wall.textureNum = (y === 0) ? 2 : 1; 
          wall.matrix.setTranslate(x - offset, y - 1.75, z - offset);
          wall.renderFast();
        }
      }
    }
  }
}

function renderWorld() {
  let projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  g_camera.updateLookAt();

  let viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
    
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let identity = new Matrix4();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identity.elements);

  // clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw sky
  let sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  if (g_normalOn) sky.textureNum = -3;
  // sky.textureNum = 0;
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  let sphere = new Sphere();
  // sphere.color = [1.0, 1.0, 1.0, 1.0];
  if (g_normalOn) sphere.textureNum = -3;
  sphere.render();

  drawTurtle();
  drawMap();
} 

function deleteCube() {
  const MAX_DIST = 8.0;
  const STEP = 0.1;
  const offset = g_map.length / 2;

  let yaw   = g_camera.yaw   * Math.PI / 180.0;
  let pitch = g_camera.pitch * Math.PI / 180.0;

  let dx = Math.sin(yaw)  * Math.cos(pitch);
  let dy = Math.sin(pitch);
  let dz = -Math.cos(yaw) * Math.cos(pitch);

  let ex = g_camera.eye.elements[0];
  let ey = g_camera.eye.elements[1];
  let ez = g_camera.eye.elements[2];

  for (let t = STEP; t < MAX_DIST; t += STEP) {
    let wx = ex + dx * t;
    let wy = ey + dy * t;
    let wz = ez + dz * t;

    let mx = Math.floor(wx + offset);
    let my = Math.floor(wy + 1.75);
    let mz = Math.floor(wz + offset);

    const S = g_map.length;
    if (mx < 0 || mx >= S || my < 0 || my >= S || mz < 0 || mz >= S) continue;

    if (g_map[mx][my][mz] === 1) {
      if (my === 0) return;                          
      if (mx === 0 || mx === S-1) return;            
      if (mz === 0 || mz === S-1) return;            
      g_map[mx][my][mz] = 0;
      renderWorld();
      return;
    }
  }
}

function placeCube() {
  const MAX_DIST = 8.0;
  const STEP = 0.1;
  const offset = g_map.length / 2;

  let yaw   = g_camera.yaw   * Math.PI / 180.0;
  let pitch = g_camera.pitch * Math.PI / 180.0;

  let dx = Math.sin(yaw)  * Math.cos(pitch);
  let dy = Math.sin(pitch);
  let dz = -Math.cos(yaw) * Math.cos(pitch);
  let ex = g_camera.eye.elements[0];
  let ey = g_camera.eye.elements[1];
  let ez = g_camera.eye.elements[2];

  let lastMx = -1, lastMy = -1, lastMz = -1;

  for (let t = STEP; t < MAX_DIST; t += STEP) {
    let wx = ex + dx * t;
    let wy = ey + dy * t;
    let wz = ez + dz * t;

    let mx = Math.floor(wx + offset);
    let my = Math.floor(wy + 1.75);
    let mz = Math.floor(wz + offset);

    const S = g_map.length;
    if (mx < 0 || mx >= S || my < 0 || my >= S || mz < 0 || mz >= S) continue;
    if (g_map[mx][my][mz] === 1) {
      if (lastMx === -1) return;

      if (lastMy <= 0) return;
      if (lastMx <= 0 || lastMx >= S-1) return;
      if (lastMz <= 0 || lastMz >= S-1) return;

      g_map[lastMx][lastMy][lastMz] = 1;
      renderWorld();
      return;
    }
    lastMx = mx;
    lastMy = my;
    lastMz = mz;
  }
}
