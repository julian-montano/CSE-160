class Torus {
  constructor() {
    this.type = 'torus';
    this.color = [0.76, 0.47, 0.2, 1.0];
    this.matrix = new Matrix4();

    this.majorRadius = 0.5;
    this.minorRadius = 0.2;

    this.majorSegments = 24;
    this.minorSegments = 16;
  }

  render() {
    let rgba = this.color;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let R = this.majorRadius;
    let r = this.minorRadius;
    let n = this.majorSegments;
    let m = this.minorSegments;

    for (let i = 0; i < n; i++) {
      let theta = (i / n) * 2 * Math.PI;
      let thetaNext = ((i + 1) / n) * 2 * Math.PI;

      for (let j = 0; j < m; j++) {
        let phi = (j / m) * 2 * Math.PI;
        let phiNext = ((j + 1) / m) * 2 * Math.PI;

        let p1 = this.getPoint(R, r, theta, phi);
        let p2 = this.getPoint(R, r, thetaNext, phi);
        let p3 = this.getPoint(R, r, thetaNext, phiNext);
        let p4 = this.getPoint(R, r, theta, phiNext);

        let shade = 0.7 + 0.3 * Math.cos(phi);
        gl.uniform4f(
          u_FragColor,
          rgba[0] * shade,
          rgba[1] * shade,
          rgba[2] * shade,
          rgba[3]
        );

        drawTriangle3D([...p1, ...p2, ...p3]);
        drawTriangle3D([...p1, ...p3, ...p4]);
      }
    }
  }

  getPoint(R, r, theta, phi) {
    let x = (R + r * Math.cos(phi)) * Math.cos(theta);
    let y = (R + r * Math.cos(phi)) * Math.sin(theta);
    let z = r * Math.sin(phi);
    return [x, y, z];
  }
}
