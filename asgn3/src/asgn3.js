// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
  }`

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
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
  // init shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // get storage location of a_Position
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

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_FragColor
  // u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  // if (!u_FragColor) {
  //   console.log('Failed to get the storage location of u_FragColor');
  //   return;
  // }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
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
  
  let identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false,identityM.elements);

  // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  // if (!u_Size) {
  //   console.log('Failed to get the storage location of u_Size');
  //   return;
  // }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

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
// camera angle
let g_camera;
let g_isDragging = false;
let g_lastX = 0;
let g_lastY = 0;
// up down
let g_cameraAngleX = 0;
// left right
let g_cameraAngleY = 0; 

function addActionsForHtmlUI() {
  document.getElementById('animationOn').onclick = function() { g_yellowAnimation = true; };
  document.getElementById('animationOff').onclick = function() { g_yellowAnimation = false; };
}

function initTextures() {
  let image0 = new Image();
  let image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  image0.onload = function() { sendImageToTEXTURE0(image0); }
  image0.src = 'sky.jpg';

  image1.onload = function() { sendImageToTEXTURE1(image1); };
  image1.src = 'floor.jpg';
  
  return true;
}

function sendImageToTEXTURE0(image) {
  let texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  let texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log('finished loadTexture');
}


function main() {
  setupWebGL();
  connectVarsToGLSL();
  addActionsForHtmlUI();
  document.onkeydown = keydown;
  g_camera = new Camera();
  initTextures();
  
  canvas.onmousedown = function(ev) {
    g_isDragging = true;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
  };

  canvas.onmouseup = function() {
    g_isDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (!g_isDragging) return;

    let dx = ev.clientX - g_lastX;
    let dy = ev.clientY - g_lastY;

    g_cameraAngleY -= dx * 0.5;
    g_cameraAngleX += dy * 0.5;

    g_lastX = ev.clientX;
    g_lastY = ev.clientY;

    renderAllShapes();
  };

  // specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderAllShapes();
  requestAnimationFrame(tick);
}

function keydown(ev) {
  if (ev.keyCode == 87) {
    g_camera.forward();
  } else if (ev.keyCode == 83) {
    g_camera.back();
  }
  renderAllShapes();
  console.log(ev.keyCode);
}


let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  let now = performance.now();

  let delta = now - g_lastFrameTime;
  g_fps = 1000 / delta;
  g_lastFrameTime = now;
  
  g_seconds = performance.now()/1000.0 - g_startTime;
  // console.log(g_seconds);
  document.getElementById("fpsDisplay").innerHTML =
    "FPS: " + g_fps.toFixed(1);
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedNumSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function renderAllShapes() {
  let projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  let viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
    
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let globalRotMat = new Matrix4()
    .rotate(g_cameraAngleY, 0, 1, 0)
    .rotate(g_cameraAngleX, 1, 0, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw floor
  let floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(10, 0, 10);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  
  // draw sky
  let sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();
  

  // shell
  let shell = new Cube();
  shell.color = [0.0, 0.6, 0.2, 1.0]; // green shell
  shell.textureNum = 0;
  shell.matrix.translate(-0.3, -0.3, -0.2);
  shell.matrix.scale(0.6, 0.3, 0.8);
  shell.render();

  // belly
  let body = new Cube();
  body.color = [0.8, 0.7, 0.5, 1.0]; // tan
  body.matrix.translate(-0.25, -0.35, -0.15);
  body.matrix.scale(0.5, 0.2, 0.7);
  body.render();

  // head
  let head = new Cube();
  head.color = [0.0, 0.7, 0.3, 1.0];
  head.matrix.translate(-0.1, -0.2, 0.6);
  head.matrix.scale(0.2, 0.15, 0.2);
  head.render();

  let headMatrix = new Matrix4(head.matrix);

  // jaw
  let jaw = new Cube();
  jaw.color = [0.0, 0.7, 0.3, 1.0];
  jaw.matrix = headMatrix;
  jaw.matrix.translate(0, -0.075, 0.6);
  jaw.matrix.translate(0, 0, -0.5);
  let jawAngle = 0;
  if (g_yellowAnimation) {
    jawAngle = 25 * Math.abs(Math.sin(g_seconds * 3));
  }
  jaw.matrix.rotate(jawAngle, 1, 0, 0);
  jaw.matrix.translate(0, -0.1, -0.5);
  jaw.matrix.scale(1, 0.2, 1.4);
  jaw.render();
  
  // eyes
  let leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix.translate(-0.05, -0.1, 0.8);
  leftEye.matrix.scale(0.05, 0.05, 0.05);
  leftEye.render();

  let rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix.translate(0.05, -0.1, 0.8);
  rightEye.matrix.scale(0.05, 0.05, 0.05);
  rightEye.render();

  function createLeg(x, z, offset) {
    let leg = new Cube();
    leg.color = [0.0, 0.7, 0.3, 1.0];
    leg.matrix.translate(x, -0.35, z);

    let angle = 0;
    if (g_yellowAnimation) {
      angle = 30 * Math.sin(g_seconds * 3 + offset);
    }
    leg.matrix.rotate(angle, 1, 0, 0);

    leg.matrix.translate(0, -0.1, 0);
    leg.matrix.scale(0.15, 0.2, 0.15);
    leg.render();
  }

  // front legs
  createLeg(-0.35, 0.35, 0);
  createLeg(0.2, 0.35, Math.PI);

  // back legs
  createLeg(-0.35, -0.1, Math.PI);
  createLeg(0.2, -0.1, 0);

  // tail 1
  let tailBase = new Cube();
  tailBase.color = [0.0, 0.7, 0.3, 1.0];

  tailBase.matrix.translate(-0.05, -0.3, -0.3);

  let baseAngle = 0;
  if (g_yellowAnimation) {
    baseAngle = 20 * Math.sin(g_seconds * 3);
  }
  tailBase.matrix.rotate(baseAngle, 0, 1, 0); // swing side-to-side

  let tailBaseMatrix = new Matrix4(tailBase.matrix);

  tailBase.matrix.translate(0, 0, -0.1);
  tailBase.matrix.scale(0.1, 0.1, 0.2);
  tailBase.render();

  // tail 2
  let tailTip = new Cube();
  tailTip.color = [0.0, 0.7, 0.3, 1.0];

  tailTip.matrix = tailBaseMatrix;

  tailTip.matrix.translate(0, 0, -0.2);

  let tipAngle = 0;
  if (g_yellowAnimation) {
    tipAngle = 30 * Math.sin(g_seconds * 3 + Math.PI / 4);
  }
  tailTip.matrix.rotate(tipAngle, 0, 1, 0);

  tailTip.matrix.translate(0, 0, -0.1);
  tailTip.matrix.scale(0.08, 0.08, 0.2);
  tailTip.render();

  let donut = new Torus();
  donut.color = [0.76, 0.47, 0.2, 1.0];
  donut.matrix.translate(0.0, -0.15, 1.0);
  donut.matrix.rotate(90, 1, 0, 0);
  donut.matrix.scale(0.15, 0.15, 0.15);
  donut.render(); 
} 
