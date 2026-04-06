function main() {  
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 
  const v1 = new Vector3([2, 2, 0]);
  clearCanvas();
  drawVector(v1, 'red');
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  const scale = 20;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const x = v.elements[0] * scale;
  const y = v.elements[1] * scale;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + x, cy - y);
  ctx.stroke();

}

function handleDrawEvent() {
  const v1x = parseFloat(document.getElementById('v1x').value) || 0;
  const v1y = parseFloat(document.getElementById('v1y').value) || 0;  
  const v2x = parseFloat(document.getElementById('v2x').value) || 0;
  const v2y = parseFloat(document.getElementById('v2y').value) || 0;
  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);
  clearCanvas();
  drawVector(v1, "red");
  drawVector(v2, "blue")
}

function handleDrawOperationEvent() {
  const v1x = parseFloat(document.getElementById('v1x').value) || 0;
  const v1y = parseFloat(document.getElementById('v1y').value) || 0;
  const v2x = parseFloat(document.getElementById('v2x').value) || 0;
  const v2y = parseFloat(document.getElementById('v2y').value) || 0;
  
  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);

  const operation = document.getElementById('ops').value;
  const scalar = parseFloat(document.getElementById('scalar').value) || 1;

  clearCanvas();
  drawVector(v1, "red");
  drawVector(v2, "blue");

  if (operation === 'angl') {
    const angle = angleBetween(v1, v2);
    console.log('Angle:', angle.toFixed(2), 'degrees');
  } else if (operation === 'area') {
    const area = areaTriangle(v1, v2);
    console.log('Area:', area.toFixed(2));
  } else if (operation === 'mag') {
    const mag1 = v1.magnitude();
    const mag2 = v2.magnitude();
    console.log('Magnitude v1:', mag1);
    console.log('Magnitude v2:', mag2);
  } else if (operation === 'norm') {
    let v3 = new Vector3([v1x, v1y, 0]);
    let v4 = new Vector3([v2x, v2y, 0]);
    
    v3.normalize();
    v4.normalize();
   
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation === 'add' || operation === 'sub') {
    let v3 = new Vector3([v1x, v1y, 0]);
    
    if (operation === 'add') {
      v3.add(v2);
    } else {
      v3.sub(v2);
    }
    drawVector(v3, "green");
  } else {

    let v3 = new Vector3([v1x, v1y, 0]);
    let v4 = new Vector3([v2x, v2y, 0]);
    
    if (operation === 'mul') {
      v3.mul(scalar);
      v4.mul(scalar);
    } else {
      v3.div(scalar);
      v4.div(scalar);
    }
    
    drawVector(v3, "green");
    drawVector(v4, "green");
  }
}

function clearCanvas() {
  const canvas = document.getElementById('example');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function angleBetween(v1, v2) {
  const dot = Vector3.dot(v1, v2);
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();
  let cos = Math.min(1, dot / (mag1 * mag2));
  cos = Math.max(-1, cos);
  const angl = Math.acos(cos);
  return (angl * 180) / Math.PI;
}

function areaTriangle(v1, v2) {
  const cross = Vector3.cross(v1, v2);
  return cross.magnitude() / 2;
}
