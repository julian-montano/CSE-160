class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }
  render() {
    let rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // front
    drawTriangle3DUVNormal(
      [0,0,0, 1,1,0, 1,0,0],
      [0,0, 1,1, 1,0],
      [0,0,-1, 0,0,-1, 0,0,-1]);
    drawTriangle3DUVNormal(
      [0,0,0, 0,1,0, 1,1,0],
      [0,0, 0,1, 1,1],
      [0,0,-1, 0,0,-1, 0,0,-1]);
    // top
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3DUVNormal(
      [0,1,0, 0,1,1, 1,1,1],
      [0,0, 0,1, 1,1],
      [0,1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal(
      [0,1,0, 1,1,1, 1,1,0],
      [0,0, 1,1, 1,0],
      [0,1,0, 0,1,0, 0,1,0]);
    // right
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3DUVNormal(
      [1,0,0, 1,1,1, 1,0,1],
      [0,0, 1,1, 1,0],
      [1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal(
      [1,0,0, 1,1,0, 1,1,1],
      [0,0, 0,1, 1,1],
      [1,0,0, 1,0,0, 1,0,0]);
    // left
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3DUVNormal(
      [0,0,0, 0,0,1, 0,1,1],
      [0,0, 1,0, 1,1],
      [-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal(
      [0,0,0, 0,1,1, 0,1,0],
      [0,0, 1,1, 0,1],
      [-1,0,0, -1,0,0, -1,0,0]);
    // bottom
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3DUVNormal(
      [0,0,0, 1,0,1, 0,0,1],
      [0,0, 1,1, 0,1],
      [0,-1,0, 0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal(
      [0,0,0, 1,0,0, 1,0,1],
      [0,0, 1,0, 1,1],
      [0,-1,0, 0,-1,0, 0,-1,0]);
    // back
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3DUVNormal(
      [0,0,1, 1,1,1, 1,0,1],
      [1,0, 0,1, 0,0],
      [0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal(
      [0,0,1, 0,1,1, 1,1,1],
      [1,0, 1,1, 0,1],
      [0,0,1, 0,0,1, 0,0,1]);
  }
  renderFast() {
    let rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    drawCube();
  }
}

const g_cubeVerts = new Float32Array([
  0,0,0,  1,0,0,  1,1,0,   0,0,0,  1,1,0,  0,1,0,   // front
  1,0,1,  0,0,1,  0,1,1,   1,0,1,  0,1,1,  1,1,1,   // back
  0,0,1,  0,0,0,  0,1,0,   0,0,1,  0,1,0,  0,1,1,   // left
  1,0,0,  1,0,1,  1,1,1,   1,0,0,  1,1,1,  1,1,0,   // right
  0,1,0,  1,1,0,  1,1,1,   0,1,0,  1,1,1,  0,1,1,   // top
  0,0,1,  1,0,1,  1,0,0,   0,0,1,  1,0,0,  0,0,0,   // bottom
]);

const g_cubeUVs = new Float32Array([
  0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // front
  0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // back
  0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // left
  0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // right
  0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // top
  0,0, 1,0, 1,1,  0,0, 1,1, 0,1,  // bottom
]);

const g_cubeNormals = new Float32Array([
  // front face (0,0,-1)
  0,0,-1, 0,0,-1, 0,0,-1,  0,0,-1, 0,0,-1, 0,0,-1,
  // back face (0,0,1)
  0,0,1, 0,0,1, 0,0,1,  0,0,1, 0,0,1, 0,0,1,
  // left face (-1,0,0)
  -1,0,0, -1,0,0, -1,0,0,  -1,0,0, -1,0,0, -1,0,0,
  // right face (1,0,0)
  1,0,0, 1,0,0, 1,0,0,  1,0,0, 1,0,0, 1,0,0,
  // top face (0,1,0)
  0,1,0, 0,1,0, 0,1,0,  0,1,0, 0,1,0, 0,1,0,
  // bottom face (0,-1,0)
  0,-1,0, 0,-1,0, 0,-1,0,  0,-1,0, 0,-1,0, 0,-1,0,
]);

let g_cubeVertBuffer = null;
let g_cubeUVBuffer = null;
let g_cubeNormalBuffer = null;

function initCubeBuffers() {
  g_cubeVertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeVerts, gl.STATIC_DRAW);

  g_cubeUVBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeUVs, gl.STATIC_DRAW);

  g_cubeNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeNormals, gl.STATIC_DRAW);
}

function drawCube() {
  if (!g_cubeVertBuffer) initCubeBuffers();

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeNormalBuffer);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
