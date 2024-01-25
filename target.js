class Target {
  constructor(id, x, y) {
    this.id = id;
    this.pos = createVector(x, y);
    this.reached = false;
    this.isTargeted = false;
  }

  show() {
    if (!this.isTargeted) {
      fill("blue");
    } else {
      fill("red");
    }
    stroke("black");
    point(this.pos.x, this.pos.y);
    //circle(this.pos.x, this.pos.y, 10);
  }

  checkLife() {
    for (let i = particles.length - 1; i >= 0; i--) {
      let d = p5.Vector.dist(this.pos, particles[i].pos);
      if (d < particles[i].r / 2 && targets.length > numParticles) {
        this.reached = true;
        particles[i].life -= 1;
      }
    }
  }
}