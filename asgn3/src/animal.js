function drawColoredTriangle(vertices, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  drawTriangle(vertices);
}

function drawRectangle(x1, y1, x2, y2, color) {
  drawColoredTriangle([x1, y1, x2, y1, x2, y2], color);
  drawColoredTriangle([x1, y1, x2, y2, x1, y2], color);
}

function drawShark() {
  gl.clearColor(0.0, 0.2, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const bodyColor = [0.6, 0.7, 0.8, 1.0];   // blue gray
  const bellyColor = [0.9, 0.9, 0.95, 1.0]; // white
  const finColor = [0.5, 0.6, 0.7, 1.0];    // gray
  const eyeColor = [0.0, 0.0, 0.0, 1.0];    // black

  // top
  drawColoredTriangle([
    -0.9,  0.0,
    -0.2,  0.2,
     0.1,  0.0
  ], bodyColor);

  drawColoredTriangle([
    -0.2,  0.2,
     0.1,  0.2,
    0.1, 0.0
  ], bodyColor);

  drawColoredTriangle([
    0.5, 0.0,
    0.1, 0.0,
    0.1, 0.2
  ], bodyColor);

  // bottom
  drawColoredTriangle([
    -0.9,  0.0,
    -0.1, -0.2,
     0.5,  0.0
  ], bellyColor);

  // tail
  drawColoredTriangle([
     0.5,  0.0,
     0.9,  0.2,
     0.75,  0.0
  ], bodyColor);

  drawColoredTriangle([
     0.5,  0.0,
     0.9, -0.2,
     0.75,  0.0
  ], bodyColor);

  // top fin
  drawColoredTriangle([
    0.05, 0.15,
    0.05, 0.35,
     -0.2, 0.15
  ], finColor);

  // fin
  drawColoredTriangle([
    -0.1, -0.05,
     0.1, -0.25,
    -0.25, -0.15
  ], finColor);

  // eye
  drawRectangle(-0.6, 0.05, -0.55, 0.10, eyeColor);

  // mouth
  drawColoredTriangle([
    -0.8, 0.0,
    -0.55, -0.0,
    -0.55, -0.04
  ], [0.8, 0.1, 0.1, 1.0]);

  const hookColor = [0.75, 0.75, 0.75, 1.0]; 
  const jCx = -0.45;    // center x
  const jCy = -0.0;    // center y 
  const jThickness = 0.02;
  const jHeight = 0.06;
  const jHookW = 0.03;

  drawColoredTriangle([
    jCx - jThickness/2, jCy + jHeight/2,  
    jCx + jThickness/2, jCy + jHeight/2,   
    jCx - jThickness/2, jCy - jHeight/6    
  ], hookColor);
  drawColoredTriangle([
    jCx + jThickness/2, jCy + jHeight/2,   
    jCx + jThickness/2, jCy - jHeight/6,   
    jCx - jThickness/2, jCy - jHeight/6   
  ], hookColor);

  drawColoredTriangle([
    jCx - jThickness/2 - jHookW, jCy - jHeight/6,
    jCx - jThickness/2 + 0.0,      jCy - jHeight/6,
    jCx - jThickness/2 - jHookW, jCy - jHeight/2
  ], hookColor);

  drawColoredTriangle([
    jCx - jThickness/2 - jHookW, jCy - jHeight/2,
    jCx - jThickness/2 + 0.0,     jCy - jHeight/2,
    jCx - jThickness/2 + 0.0,     jCy - jHeight/6 + jHookW/2
  ], hookColor);

  drawColoredTriangle([
    jCx - jThickness, jCy + jHeight/2 + jThickness/2,
    jCx + jThickness, jCy + jHeight/2 + jThickness/2,
    jCx - jThickness, jCy + jHeight/2 - jThickness/2
  ], hookColor);
  drawColoredTriangle([
    jCx + jThickness, jCy + jHeight/2 + jThickness/2,
    jCx + jThickness, jCy + jHeight/2 - jThickness/2,
    jCx - jThickness, jCy + jHeight/2 - jThickness/2
  ], hookColor);

  const letterColor = [0.0, 0.0, 0.0, 1.0];
  const mCx = jCx + 0.07; // center x
  const mCy = jCy;        // center y
  const mHeight = 0.06;   // 'm' height
  const mStrokeW = 0.01; // stroke thickness
  const mGap = 0.02;     // gap between vertical

  // left vertical of 'm'
  drawColoredTriangle([
    mCx - mGap - mStrokeW/2, mCy + mHeight/2,
    mCx - mGap + mStrokeW/2, mCy + mHeight/2,
    mCx - mGap - mStrokeW/2, mCy - mHeight/2
  ], letterColor);
  drawColoredTriangle([
    mCx - mGap + mStrokeW/2, mCy + mHeight/2,
    mCx - mGap + mStrokeW/2, mCy - mHeight/2,
    mCx - mGap - mStrokeW/2, mCy - mHeight/2
  ], letterColor);

  // middle vertical of 'm'
  drawColoredTriangle([
    mCx - mStrokeW/2, mCy + mHeight/2,
    mCx + mStrokeW/2, mCy + mHeight/2,
    mCx - mStrokeW/2, mCy - mHeight/2 + mHeight*0.2
  ], letterColor);
  drawColoredTriangle([
    mCx + mStrokeW/2, mCy + mHeight/2,
    mCx + mStrokeW/2, mCy - mHeight/2 + mHeight*0.2,
    mCx - mStrokeW/2, mCy - mHeight/2 + mHeight*0.2
  ], letterColor);

  // right vertical of 'm'
  drawColoredTriangle([
    mCx + mGap - mStrokeW/2, mCy + mHeight/2,
    mCx + mGap + mStrokeW/2, mCy + mHeight/2,
    mCx + mGap - mStrokeW/2, mCy - mHeight/2
  ], letterColor);
  drawColoredTriangle([
    mCx + mGap + mStrokeW/2, mCy + mHeight/2,
    mCx + mGap + mStrokeW/2, mCy - mHeight/2,
    mCx + mGap - mStrokeW/2, mCy - mHeight/2
  ], letterColor);

  const stringColor = [0.95, 0.95, 0.95, 1.0];
  const stringTopX = jCx;
  const stringTopY = 1.0;
  const stringBottomY = jCy + jHeight/2 + jThickness/2;
  const stringW = 0.003;

  drawColoredTriangle([
    stringTopX - stringW/2, stringTopY,
    stringTopX + stringW/2, stringTopY,
    stringTopX - stringW/2, stringBottomY
  ], stringColor);
  drawColoredTriangle([
    stringTopX + stringW/2, stringTopY,
    stringTopX + stringW/2, stringBottomY,
    stringTopX - stringW/2, stringBottomY
  ], stringColor);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
}
