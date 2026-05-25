class Camera {
  constructor() {
    this.eye   = new Vector3([0, 0, 3]);
    this.at    = new Vector3([0, 0, -1]);
    this.up    = new Vector3([0, 1, 0]);
    this.yaw = 0;
    this.pitch = 0;
  }
  updateLookAt() {
    let yaw = this.yaw * Math.PI / 180.0;
    let pitch = this.pitch * Math.PI / 180.0;
  
    let fx = Math.sin(yaw) * Math.cos(pitch);
    let fy = Math.sin(pitch);
    let fz = -Math.cos(yaw) * Math.cos(pitch);
  
    let dir = new Vector3([
      this.eye.elements[0] + fx,
      this.eye.elements[1] + fy,
      this.eye.elements[2] + fz
    ]);
    this.at = dir;
  }
  forward() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();

    let stepX = this.eye.elements[0] + f.elements[0];
    let stepZ = this.eye.elements[2] + f.elements[2];

    if (isNotSolid(stepX, stepZ)) {
      this.eye.add(f);
      this.at.add(f);
    }
  }  
  back() {
    let f = new Vector3(this.eye.elements);
    f.sub(this.at);
    f.normalize();
  
    let stepX = this.eye.elements[0] + f.elements[0];
    let stepZ = this.eye.elements[2] + f.elements[2];
    
    if (isNotSolid(stepX, stepZ)) {
      this.eye.add(f);
      this.at.add(f);
    }
  }
  left() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();

    let s = Vector3.cross(this.up, f);
    s.normalize();

    let stepX = this.eye.elements[0] + s.elements[0];
    let stepZ = this.eye.elements[2] + s.elements[2];

    if (isNotSolid(stepX, stepZ)) {
      this.eye.add(s);
      this.at.add(s);
    }
  }
  right() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();

    let s = Vector3.cross(f, this.up);
    s.normalize();

    let stepX = this.eye.elements[0] + s.elements[0];
    let stepZ = this.eye.elements[2] + s.elements[2];

    if (isNotSolid(stepX, stepZ)) {
      this.eye.add(s);
      this.at.add(s);
    }
  }
  turnLeft() {
    this.yaw -= 3;
  }
  turnRight() {
    this.yaw += 3;
  }
}  

function keydown(ev) {
  if (ev.keyCode == 87) {
    g_camera.forward();
  } else if (ev.keyCode == 83) {
    g_camera.back();
  } else if (ev.keyCode == 65) {
    g_camera.left();
  } else if (ev.keyCode == 68) {
    g_camera.right();
  } else if (ev.keyCode == 81) {
    g_camera.turnLeft();
  } else if (ev.keyCode == 69) {
    g_camera.turnRight();
  }
  renderWorld();
  console.log(g_camera.eye.elements);
}

function isNotSolid(x, z) {
  const MAP_SIZE = 32;
  const offset = MAP_SIZE / 2;

  let mx = Math.floor(x + offset);
  let mz = Math.floor(z + offset);

  if (mx < 0 || mx >= MAP_SIZE || mz < 0 || mz >= MAP_SIZE) return false;

  if (g_map[mx][1][mz] === 1) return false;

  return true;
}
