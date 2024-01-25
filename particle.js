class Particle {
  constructor(x, y, id, r, color) {
    // Core properties
    this.particleId = id;
    this.noiseDecimal = random(500, 1000) + 100 * this.particleId;
    this.pos = createVector(x, y);
    this.vel = createVector(width / 2, height / 2).sub(this.pos); // When particle is created, it moves towards the center
    this.acc = createVector(0, 0);
    this.maxSpeed = 3 + noise(this.noiseDecimal) / 10;
    this.maxForce = 0.3;
    this.r = r;
    this.color = color;

    // Utility properties
    this.perceptionRadius = radius;
    this.rangeOfPrediction = radius;

    this.life = numTargets + 100;
    this.futurePos = this.calculateFuturePos();

    this.collisionStatus = false;

    trail[this.particleId].push(new Circle(this.pos, this.r, this.color, frameCount));

    this.targetId;
    if (targets.length > 0) {
      this.findTarget();
    }
    this.lastLocation = this.pos.copy();

    this.angleSaves = [];
    this.sampleRate = 128;
    this.newAngleThreshold = 90;
    this.lastMarkedAngle = this.vel.heading();

    // Color array for utility
    this.colorVal = 0;
    this.colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "cyan",
      "blue",
      "indigo",
      "violet",
      "purple",
      "pink",
      "magenta",
      "brown",
      "teal",
      "lime",
    ];

    // Wander mechanics (Simple – Perlin noise based)
    this.wanderTheta = PI;
    this.xoff = 100 * this.particleId;

    // Wander mechanics
    this.wanderTheta = PI / 2;
    this.wanderDistance = radius * 4;
    this.wanderRadius = minRadius * 4;

    this.wanderPoint = this.vel.copy().setMag(this.wanderDistance);
    this.wanderPoint.add(this.pos);

    this.wanderTarget = this.wanderPoint.copy();
    this.wanderTarget.add(this.wanderRadius, 0);
  }

  behaviour() {
    let forces = [this.collisionAvoidance(particles), this.avoidTrail(trail)];

    // Sort forces by magnitude
    forces.sort((a, b) => b.mag() - a.mag());

    // Limit strongest force to this.maxForce and calculate decrease percentage
    let strongestForce = forces[0];
    let originalMagnitude = strongestForce.mag();
    strongestForce.limit(this.maxForce);
    let decreasePercentage = strongestForce.mag() / originalMagnitude;

    let escapeForce = createVector(0, 0);

    // Add forces to array
    for (let i = 0; i < forces.length; i++) {
      //escapeForce.add(forces[i]).limit(this.maxForce); //.limit(this.maxForce));
    }

    let force = escapeForce;

    let distanceToTarget;
    if (targets.length > 0) {
      if (targets[this.targetId]) {
        distanceToTarget = p5.Vector.dist(this.pos, targets[this.targetId].pos);
      }
    }

    if (targets.length > 0) {
      if (force < this.maxForce) {
        force.normalize();
        force.add(this.arrive(targets[this.targetId].pos));
      } else {
        force.add(this.arrive(targets[this.targetId].pos));
      }
    } else {
      force.add(this.arrive(createVector(width/2 + random(-500, 500), height/2 + random(-500, 500))));
    }

    force.add(this.separate(particles));
    force.add(this.avoidRepeller());
    force.add(this.avoidTrail(trail));

    // Wander forces are only active when other forces aren't active
    if (this.collisionStatus) {
      this.r -= 1 / numParticles;
      force.add(this.wanderAdvanced(debugCheckbox.checked()).mult(0.2));
      force.add(this.wanderSimple().mult(0.2));
    } else {
      force.add(this.wanderAdvanced(debugCheckbox.checked()));
      force.add(this.wanderSimple());
    }

    this.applyForce(force);
  }

  // Avoid repeller mechanics (Not limited by this.maxForce)
  avoidRepeller() {
    let desiredSeparation = this.r * 2;
    let force = createVector();
    let total = 0;

    // Find and create unit vector towards closest target
    for (let object of repellers) {
      let d = p5.Vector.dist(this.pos, object.pos);
      let diff = p5.Vector.sub(this.pos, object.pos);

      if (d < desiredSeparation) {
        diff.limit(this.maxForce);
        force.add(diff);
        total++;
      }
    }
    if (total > 0) {
      force.setMag(this.maxSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce * 4);
      return force;
    } else {
      return createVector(0, 0);
    }
  }

  wanderAdvanced(displayGuides = false) {
    // Move wander point
    this.wanderPoint = this.vel.copy().setMag(this.wanderDistance);
    this.wanderPoint.add(this.pos);

    // Move target
    let offset = 32;
    let vOffset = p5.Vector.random2D().setMag(offset * 0.1);
    this.wanderTarget.add(vOffset);

    let v = p5.Vector.sub(this.wanderTarget, this.wanderPoint);
    v.setMag(this.wanderRadius);
    this.wanderTarget = p5.Vector.add(this.wanderPoint, v);

      // Check for proximity to repellers
  let repulsionThreshold = 50; // Change this to whatever distance you consider "too close"
  for (let repeller of repellers) {
    let d = p5.Vector.dist(this.pos, repeller.pos);
    if (d < repulsionThreshold) {
      let repulsion = p5.Vector.sub(this.pos, repeller.pos);
      repulsion.setMag(this.maxSpeed);
      repulsion.setHeading(random(-PI/8, PI/8));
      this.wanderTarget.add(repulsion);
    }
  }

    let center = this.wanderPoint.copy();
    if (displayGuides) {
      stroke(255);
      strokeWeight(0.5);
      noFill();
      circle(center.x, center.y, this.wanderRadius * 2);
      stroke(255);
      line(this.pos.x, this.pos.y, center.x, center.y);

      stroke("green");
      fill(0, 255, 0, 100);
      circle(this.wanderTarget.x, this.wanderTarget.y, offset);
      fill("green");
      circle(this.wanderTarget.x, this.wanderTarget.y, 8);

      noStroke();
      fill(255, 0, 0);
      circle(center.x, center.y, 8);
    }

    let force = p5.Vector.sub(this.wanderTarget, this.pos);
    force.setMag(this.maxForce);
    return force;
  }

  wanderSimple() {
    let angle = noise(this.xoff) * TWO_PI * 2;
    let steer = p5.Vector.fromAngle(angle);
    steer.setMag(this.maxForce);
    this.xoff += 0.01;
    return steer;
  }

  collisionAvoidance(particles) {
    let avoidanceForce = createVector(0, 0);

    for (let other of particles) {
      if (other !== this) {
        // Predict the future positions of this particle and the other particles
        let futurePos = this.futurePos;
        let otherFuturePos = other.futurePos;

        let futureDist = p5.Vector.dist(futurePos, otherFuturePos);

        if (futureDist < this.rangeOfPrediction * 2) {
          let avoidance = p5.Vector.sub(this.pos, other.pos);
          avoidance.setMag(1 / (futureDist / 2));
          avoidanceForce.add(avoidance);
          this.collisionStatus = true;
        } else {
          this.collisionStatus = false;
        }
      }
    }
    //avoidanceForce.limit(this.maxForce);
    return avoidanceForce;
  }

  avoidTrail(trail) {
    let avoidanceForce = createVector(0, 0);

    for (let i = 0; i < trail.length; i++) {
      if (i != this.particleId) {
        for (let obstacle of trail[i]) {
          // Predict the future positions of this particle and the other particles
          let futurePos = this.futurePos;
          let obstaclePos = obstacle.pos;
          let futureDist = p5.Vector.dist(futurePos, obstaclePos);

          if (futureDist < this.rangeOfPrediction * 2) {
            let avoidance = p5.Vector.sub(this.pos, obstacle.pos);
            avoidance.setMag(this.maxSpeed); //(2 / futureDist);
            avoidanceForce.add(avoidance);
            this.collisionStatus = true;
          } else {
            this.collisionStatus = false;
          }
        }
      }
    }

    return avoidanceForce;
  }

  arrive(target) {
    let force = this.seek(target, true); // "true" means that it's running the seek function in "arrival mode"
    return force;
  }

  flee(target) {
    return this.seek(target).mult(-1); // Flee is the mechanic same as seek but negative (in the other direction)
  }

  separate(targets) {
    let desiredSeparation = this.r * 2;
    let force = createVector();
    let total = 0;

    let lineOfSight = PI / 4;

    for (let other of targets) {
      let d = p5.Vector.dist(this.pos, other.pos);
      let diff = p5.Vector.sub(this.pos, other.pos);
      let angle = p5.Vector.angleBetween(this.vel, diff);

      if (this !== other && d < desiredSeparation && angle < lineOfSight) {
        diff.setMag(1 / d);
        force.add(diff);
        total++;
      }
    }

    if (total > 0) {
      force.setMag(this.maxSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    } else {
      return createVector(0, 0);
    }
  }

  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;

    // If arriaval == true, decrease speed at this gets closer to target
    if (arrival) {
      let slowRadius = this.r;
      let distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }

    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  checkDirectionForDivide(allowSplit = true) {
    let currentDir = this.vel.copy();
    let targetDir = p5.Vector.sub(targets[this.targetId].pos, this.pos);
    targetDir.limit(this.maxSpeed);

    let angle = p5.Vector.angleBetween(currentDir, targetDir);

    this.angleSaves.push(angle);

    if (this.angleSaves.length > this.sampleRate) {
      let averageAngle = 0;

      for (let savedAngle of this.angleSaves) {
        averageAngle += savedAngle;
      }
      averageAngle = averageAngle / this.angleSaves.length;

      let difference = averageAngle - this.lastMarkedAngle;

      if ((difference > radians(this.newAngleThreshold) && allowSplit) || (difference < radians(-this.newAngleThreshold) && allowSplit)) {
        this.split();
        this.colorVal++;
      }
      // Resetting this.angleSaves array and updating this.lastMarkedAngle
      this.angleSaves = [];
    }
  }

  split() {

    let childPos = this.pos.copy();
    let childId = particles.length;
    let childRadius;
    let childLife;
    let childVelocity = this.vel.copy().mult(1);
    if (this.r > minRadius * 1.5) {
      childRadius = this.r / 2;
      childLife = this.life * (childRadius / this.r);
      particles.push(new smallerParticle(childPos, childId, childRadius, childLife, childVelocity));

      this.r -= childRadius;
      this.life -= childLife;
    }
  }

  update() {
    this.edges(boundarySetting.checked());
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    this.noiseDecimal += 0.001;


    // Update future position
    this.futurePos = this.calculateFuturePos();

    // Decrease this.r if this.r is greater than life
    if (this.r > this.life) {
      this.r -= particleDecay / numParticles;

      trail[this.particleId].push(new Circle(this.pos, this.r, this.color, frameCount));
    } else {
      trail[this.particleId].push(new Circle(this.pos, this.r, this.color, frameCount));
    }

    // If there are no more targets or repellers, then slowly kill all
    if (points.length <= numParticles && logotypeCheckbox.checked()) {
      this.life--;
    }

    // If this.r is less that minRadius, this.life = 0
    if (this.r <= minRadius) {
      this.life = 0;
    }
  }

  calculateFuturePos() {
    let futurePos = this.pos.copy();
    futurePos.add(this.vel.copy().mult(this.rangeOfPrediction));
    return futurePos;
  }

  edges(boolean) {
    if (this.pos.x > width + this.r) {
      // Right edge
      if (boolean) {
        this.pos.x = -this.r;
      } else {
        this.vel.mult(-1);
        this.applyForce(this.vel);
      }
    } else if (this.pos.x < -this.r) {
      // Left edge
      if (boolean) {
        this.pos.x = width + this.r;
      } else {
        this.vel.mult(-1);
        this.applyForce(this.vel);
      }
    }
    if (this.pos.y > height + this.r) {
      // Bottom edge
      if (boolean) {
        this.pos.y = -this.r;
      } else {
        this.vel.mult(-1);
        this.applyForce(this.vel);
      }
    } else if (this.pos.y < -this.r) {
      // Top edge
      if (boolean) {
        this.pos.y = height + this.r;
      } else {
        this.vel.mult(-1);
        this.applyForce(this.vel);
      }
    }
  }

  show() {
    if (debugCheckbox.checked()) {
      noStroke();
      fill(this.colors[this.colorVal]);
      circle(this.pos.x, this.pos.y, this.r);
    }

    // Draw future pos
    if (debugCheckbox.checked()) {
      stroke("grey");
      strokeWeight(2);
      line(this.pos.x, this.pos.y, this.futurePos.x, this.futurePos.y);
      stroke("green");
      strokeWeight(8);
      point(this.futurePos.x, this.futurePos.y);
    }
  }

  findTarget() {
    let id = targets.length - 1;
    let target = targets[id].pos.copy();
    let closestDist = p5.Vector.dist(this.pos, target);

    // Find and create unit vector towards closest target

    for (let i = targets.length - 1; i >= 0; i--) {
      target = targets[i].pos.copy();
      let d = p5.Vector.dist(this.pos, target);

      if (d < closestDist) {
        id = i;
        target = targets[i].pos.copy();
        closestDist = d;
      }
    }
    this.targetId = id;
    targets[id].isTargeted = true;
  }

  // This is a mechanism to be used later for spawning a new circle every "spacing"
  checkLast() {
    let d = p5.Vector.dist(this.pos, this.lastLocation);
    if (d > spacing) {
      console.log("lastLocation updated.");
      this.lastLocation = this.pos.copy();
      this.vel = this.findTarget();
    }
  }
}
