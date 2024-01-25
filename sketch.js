let targets = [];
let numTargets = 5000;

let repellers = [];
let numRepellers = 5000;

let particles = [];
let numParticles = 1;

let trail = [];
let totalCircles = 0;
let jitter = 4;

let particleDecay = 0.1;
let spacing = 50;
let minDist = 5;
let maxDist = 100;
let radius = 40;
let minRadius = 20;

function setup() {
  frameRate(60);
  ellipseMode(CENTER);
  initializeDomElements();
  defineCanvas();

  fontSize = canvas.textSize;
  fontPos = canvas.textPos;
  fontContent = canvas.textContent;

  createCanvas(canvas.width, canvas.height);
  spawnTargets(logotypeCheckbox.checked());

  let origins = generateOrigins();
  for (let i = 0; i < numParticles; i++) {
    let color;

    if (Array.isArray(foregroundColor)) {
      // If foregroundColor is an array, alternate between the two colors
      color = foregroundColor[i % 2];
    } else {
      // If foregroundColor is not an array, use it as the color
      color = foregroundColor;
    }

    trail[i] = [];
    particles[i] = new Particle(origins[i].x, origins[i].y, i, radius, color);
  }

  killAnimation();
}

function draw() {
  if (backgroundColor == "#ffffff" && recording == false) {
    clear();
  } else {
    background(backgroundColor);
  }

  // Update targets
  for (let i = targets.length - 1; i >= 0; i--) {
    targets[i].checkLife();

    if (debugCheckbox.checked()) {
      targets[i].show();
    }

    if (targets[i].reached && targets[i].isTargeted && targets.length > numParticles + 1) {
      targets.splice(i, 1);
      for (let particle of particles) {
        // Update targetId of particles if necessary
        if (particle.targetId > i) {
          particle.targetId--;
        }
        if (targets.length > 0) {
          particle.findTarget();
        }
      }
    } else if (targets[i].reached && targets.length > particles.length) {
      targets.splice(i, 1);
      // Update targetId of particles if necessary
      for (let particle of particles) {
        if (particle.targetId > i) {
          particle.targetId--;
        }
      }
    }
  }

  // Update repellers
  for (let i = repellers.length - 1; i >= 0; i--) {
    if (debugCheckbox.checked()) {
      repellers[i].show();
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];

    particle.behaviour();

    //Check for split before updating
    if (targets.length > numParticles) {
      particle.checkDirectionForDivide(false);
    }

    particle.update();

    if (debugCheckbox.checked()) {
      particle.show();
    }

    // Check if particle.life is less than one
    if (particle.life < 1) {
      particles.splice(i, 1);
    }
  }
  for (let i = 0; i < trail.length; i++) {
    for (let circle of trail[i]) {
      circle.show();
    }
  }

  // Draw text
  drawText(logotypeCheckbox.checked());
}

function generateOrigins() {
  let boundaryLength = 2 * width + 2 * height;
  let origins = [];

  if (numParticles <= 1) {
    let randomPoint = random(boundaryLength);
    origins.push(getPointOnBoundary(randomPoint));
  } else if (numParticles == 2) {
    let rightEdge = createVector(width + radius, height / 2);
    let leftEdge = createVector(-radius, height / 2);
    origins.push(rightEdge);
    origins.push(leftEdge);
  } else if (numParticles == 3) {
    let rightEdge = createVector(width + radius, height / 2);
    let leftEdge = createVector(-radius, height / 2);
    let bottomEdge = createVector(width / 2, height + radius);
    origins.push(rightEdge);
    origins.push(leftEdge);
    origins.push(bottomEdge);
  } else if (numParticles == 4) {
    let rightEdge = createVector(width + radius, height / 2);
    let leftEdge = createVector(-radius, height / 2);
    let bottomEdge = createVector(width / 2, height + radius);
    let topEdge = createVector(width / 2, -radius);
    origins.push(rightEdge);
    origins.push(leftEdge);
    origins.push(bottomEdge);
    origins.push(topEdge);
  } else {
    let distanceBetweenOrigins = boundaryLength / (numParticles + 1);

    for (let i = 1; i < numParticles + 2; i++) {
      let pointOnBoundary = i * distanceBetweenOrigins;
      origins.push(getPointOnBoundary(pointOnBoundary));
    }
  }
  return origins;
}

function getPointOnBoundary(distance) {
  let x, y;

  if (distance < width) {
    // Top edge
    x = distance;
    y = -radius;
  } else if (distance < width + height) {
    // Right edge
    x = width + radius;
    y = distance - width;
  } else if (distance < 2 * width + height) {
    // Bottom edge
    x = distance - (width + height);
    y = height + radius;
  } else {
    // Left edge
    x = -radius;
    y = distance - (2 * width + height);
  }
  return createVector(x, y);
}
