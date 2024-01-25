class Circle {
  constructor(pos, r, color, timestamp) {
    this.pos = pos;
    
    this.x = pos.x;
    this.y = pos.y;
    this.r = r;
    this.timestamp = timestamp;
    this.color = color;

    this.markForDeletion = false;
    totalCircles++;
  }
  
  show() {
    noStroke();
    fill(this.color);
    //if ((this.x < boundingBox.x - this.r || this.x > boundingBox.x + boundingBox.w + this.r) || (this.y < boundingBox.y - this.r || this.y > boundingBox.y + boundingBox.h + this.r)) {
    circle(this.x + noise(this.timestamp), this.y + noise(this.timestamp), this.r);
  //}
  }
}