function drawTurtle() {
  // shell
  let shell = new Cube();
  shell.color = [0.0, 0.6, 0.2, 1.0]; // green shell
  // shell.textureNum = 0;
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
}
