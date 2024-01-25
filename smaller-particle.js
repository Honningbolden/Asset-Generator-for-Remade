class smallerParticle extends Particle {
  constructor(pos, id, r, life, vel) {
    super(pos.x, pos.y, id, r);

    this.vel = vel;
    this.life = life;
  }
}