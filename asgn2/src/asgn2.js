// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVarsToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
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

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
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
let g_isDragging = false;
let g_lastX = 0;
let g_lastY = 0;
// up down
let g_cameraAngleX = 0;
// left right
let g_cameraAngleY = 0; 

function addActionsForHtmlUI() {
  // document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  // document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  // document.getElementById('clear').onclick = function() { g_shapesList = []; renderAllShapes(); };
  // document.getElementById('shark').onclick = function() { drawShark(); };

  // document.getElementById('point').onclick = function() { g_selectedType=POINT };
  // document.getElementById('triangle').onclick = function() { g_selectedType=TRIANGLE };
  // document.getElementById('circle').onclick = function() { g_selectedType=CIRCLE };

  // document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  // document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  // document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('animationOn').onclick = function() { g_yellowAnimation = true; };
  document.getElementById('animationOff').onclick = function() { g_yellowAnimation = false; };

  // document.getElementById('jointSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });

  // document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  // document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedNumSegments = this.value; });
  // document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function main() {
  setupWebGL();
  connectVarsToGLSL();
  addActionsForHtmlUI();
  
  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = function(ev){ click(ev) };
  // canvas.onmousemove = function(ev){ if(ev.buttons == 1) { click(ev); } };

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

    // Adjust sensitivity here
    g_cameraAngleY -= dx * 0.5;
    g_cameraAngleX += dy * 0.5;

    g_lastX = ev.clientX;
    g_lastY = ev.clientY;

    renderAllShapes();
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // drawShark();
  renderAllShapes();
  requestAnimationFrame(tick);
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  let now = performance.now();

  let delta = now - g_lastFrameTime;
  g_fps = 1000 / delta;
  g_lastFrameTime = now;
  
  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(g_seconds);
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

  // let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);

  let globalRotMat = new Matrix4()
    .rotate(g_cameraAngleY, 0, 1, 0)
    .rotate(g_cameraAngleX, 1, 0, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0] );

  // shell
  let shell = new Cube();
  shell.color = [0.0, 0.6, 0.2, 1.0]; // green shell
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
  
  /*
  let body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.matrix.translate(-0.25,-0.75,0.0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5,0.3,0.5);
  body.render();

  let leftArm = new Cube();
  leftArm.color = [1.0, 1.0, 0.0, 1.0];
  leftArm.matrix.setTranslate(0.0, -0.5, 0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);

  if (g_yellowAnimation) {
    leftArm.matrix.rotate(45*Math.sin(g_seconds), 0.0, 0.0, 1.0);
  } else {
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  }
  
  let yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0, 0);
  leftArm.render();

  let box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0.0,0.65,0.0);
  box.matrix.rotate(0,1,0,0);
  box.matrix.scale(0.3,0.3,0.3);
  box.matrix.translate(-0.5, 0, -0.001);
  box.render();

  */

  // var len = g_shapesList.length;
  // for(var i = 0; i < len; i++) {
  //   g_shapesList[i].render();
  // }
} 
