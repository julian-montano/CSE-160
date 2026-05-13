class Camera {
  constructor() {
    this.eye   = new Vector3([0, 0, 3]);
    this.at    = new Vector3([0, 0, -100]);
    this.up    = new Vector3([0, 1, 0]);
  } 
  forward() {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    this.eye.add(f);
    this.at.add(f);
  }  
  back() {
    let f = new Vector3(this.eye.elements);
    f.sub(this.at);
    f.normalize();
    this.eye.add(f);
    this.at.add(f);
  }  
}  
