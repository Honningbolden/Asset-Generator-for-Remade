let canvas = {
  template: null,
  width: null,
  height: null,
  textContent: null,
  textSize: null,
  textPos: null,
  box: null,
};

let displayFont;
//let priceFont;
let remadeBy;
let fontSize;
let signatureImg;

let capture;
let manualCapture;
let recording = false;
let logomode = false;

function preload() {
  displayFont = loadFont("FuturaPassata-Trial.otf");
  //priceFont = loadFont("BEAUX Trial.otf");
  signatureImg = loadImage("Signatures/Signature_5.png");
}

// Utilities for logomode
let logomodeIntervalId;
let currentPalette;

let logomodeCheckbox,
  debugCheckbox,
  logotypeCheckbox,
  targetDistributionSetting,
  targetMode,
  colorPalette,
  canvasMenu,
  saveButton,
  restartButton,
  customTimeframe,
  boundarySetting;
let foregroundColor, backgroundColor, textColor;

function initializeDomElements() {
  logomodeCheckbox = select("#logomode-checkbox");
  particleAmountSelecter = select("#num-particle-selection");
  setParticleAmount();
  boundarySetting = select("#boundary-setting");
  debugCheckbox = select("#debug-checkbox");
  targetMode = select("#target-mode-selection");
  targetDistributionSetting = select("#target-distribution-setting");
  logotypeCheckbox = select("#text-checkbox");
  customTimeframe = select("#timeframe-selection");
  colorPalette = select("#palette-selection");
  canvasMenu = select("#template-selection");
  exportSettings = select("#export-settings");
  saveButton = select("#save-button");
  restartButton = select("#restart-button");

  currentPalette = colorPalette.value();

  // Logomode
  logomodeCheckbox.changed(() => {
    if (logomodeCheckbox.checked()) {
      startLogomode();
    } else {
      clearInterval(logomodeIntervalId);
      currentPalette = "Remade";
      colorPalette.value(currentPalette);
      resetSketch();
    }
  });

  // Save-button
  saveButton.mousePressed(saveCanvasAsPNG);
  exportSettings.changed(() => {
    if (exportSettings.value() == "png" && recording == false) {
      document.getElementById("save-button").innerText = "Screenshot";
    } else if (exportSettings.value() == "mp4" && recording == false) {
      document.getElementById("save-button").innerText = "Optag";
    }
  });

  // Color palette
  colorPalette.changed(() => {
    currentPalette = colorPalette.value();
  });
  colorSelection();

  // Canvas size
  defineCanvas();
  canvasMenu.changed(defineCanvas);

  // Restart
  restartButton.mousePressed(resetSketch);
}

function colorSelection() {
  switch (currentPalette) {
    case "logomode":
      foregroundColor = "#ffffff";
      backgroundColor = "#131315";
      textColor = "#ffffff";
      break;
    case "Karla Karlsen":
      foregroundColor = "#c05200";
      backgroundColor = "#ebd999";
      textColor = "#ffffff";
      break;
    case "Anne-Sofie Annesen":
      foregroundColor = "#008aa1";
      backgroundColor = "#ffab00";
      textColor = "#ffffff";
      break;
    case "Daniel Danielsen":
      foregroundColor = "#a90636";
      backgroundColor = "#e6adcf";
      textColor = "#ffffff";
      break;
    case "Ulrik Ulriksen":
      foregroundColor = "#405416";
      backgroundColor = "#d99e73";
      textColor = "#ffffff";
      break;
    case "Remade":
      foregroundColor = [];
      foregroundColor.push("#F58E84");
      foregroundColor.push("#13354E");
      backgroundColor = "#ffffff";
      textColor = "#131315";
      break;
  }
}

function saveCanvasAsPNG() {
  manualCapture = P5Capture.getInstance();
  capture = P5Capture.getInstance();

  console.log("saved");
  if (exportSettings.value() == "png") {
    saveFrames("export", exportSettings.value());
  } else if (exportSettings.value() == "mp4") {
    if (manualCapture.state === "idle" && capture.state === "idle") {
      recording = true;
      console.log("gif")

      manualCapture.start({
        format: "mp4",
        framerate: 60,
        bitrate: 24000,
        width: canvas.width,
      });

      document.getElementById("save-button").innerText = "Stop";
    } else {
      capture.stop();
      recording = false;
      manualCapture.stop();

      document.getElementById("save-button").innerText = "Optag";
    }
  }
}

function resetSketch() {
  return new Promise((resolve, reject) => {
  // Clear the arrays
  targets = [];
  repellers = [];
  particles = [];

  let timeDelay;
  if (totalCircles < 1000) {
    timeDelay = 12;
    totalCircles = 0;
  } else {
    timeDelay = 4;
    totalCircles = 0;
  }

  intervalId = setInterval(() => {
    for (let j = 0; j < trail.length; j++) {
      if (trail[j].length > 0 && logomodeCheckbox.checked()) {
        trail[j].shift();
        trail[j].pop();
        trail[j].pop();
      } else if (trail[j].length > 0) {
        trail[j].shift();
        trail[j].shift();
        trail[j].shift();
        trail[j].pop();
        trail[j].pop();
        trail[j].pop();
        trail[j].pop();
      } else {
        clearInterval(intervalId); // stop the interval
        resolve();

        if (currentPalette != "logomode") {
          setParticleAmount();
        } else {
          numParticles = 0;
        }

        if (canvas.template == "price-tag" || canvas.template == "postcard") {
          remadeBy = true;
        } else {
          remadeBy = false;
        }
        resizeCanvas(canvas.width, canvas.height);
        colorSelection();
        fontSize = canvas.textSize;
        fontPos = canvas.textPos;
        fontContent = canvas.textContent;

        // Spawn targets/repellers (Only if text is checked)
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
          trail.length = numParticles;
          trail[i] = [];
          particles[i] = new Particle(origins[i].x, origins[i].y, i, radius, color);
        }
      }
    }
  }, 2); // 500ms delay between each shift

  killAnimation();
});
}

function defineCanvas() {
  switch (canvasMenu.value()) {
    case "squared":
      canvas.template = "squared";
      canvas.width = 1000;
      canvas.height = 1000;
      canvas.textContent = "remaDe";
      canvas.textSize = 172;
      canvas.textPos = createVector(canvas.width * (1 / 2), canvas.height * (1 / 2));
      canvas.box = {
        x: 200,
        y: 480,
        w: 600,
        h: 420,
      };
      break;
    case "landscape":
      canvas.template = "landscape";
      canvas.width = 1500;
      canvas.height = 634;
      canvas.textContent = "remaDe";
      canvas.textSize = 256;
      canvas.textPos = createVector(canvas.width * (1 / 2), canvas.height * (1 / 2));
      canvas.box = {
        x: 200,
        y: 150,
        w: 1100,
        h: 335,
      };
      break;
    case "portrait":
      canvas.template = "landscape";
      canvas.width = 828;
      canvas.height = 1792;
      canvas.textContent = "remaDe";
      canvas.textSize = 172;
      canvas.textPos = createVector(canvas.width * (1 / 2), canvas.height * (2 / 5));
      canvas.box = {
        x: 100,
        y: 700,
        w: 628,
        h: 350,
      };
      break;
    case "price-tag":
      canvas.template = "price-tag";
      canvas.width = 472;
      canvas.height = 850;
      canvas.textContent = "remaDe";
      canvas.textSize = 64;
      canvas.textPos = createVector(canvas.width * (1 / 2), canvas.height * (1 / 3));
      canvas.box = {
        x: 100,
        y: 250,
        w: 272,
        h: 130,
      };
      break;
    case "postcard":
      canvas.template = "postcard";
      canvas.width = 1398;
      canvas.height = 992;
      canvas.textContent = "remaDe";
      canvas.textSize = 256;
      canvas.textPos = createVector(canvas.width * (1 / 2), canvas.height * (1 / 2) - 90);
      canvas.box = {
        x: 200,
        y: 200,
        w: 998,
        h: 692,
      };
  }
}

let points = [];
let boundingBox = [];

function drawText(boolean) {
  if (boolean) {
    textFont(displayFont);
    fill(textColor);
    textSize(fontSize);
    textAlign(CENTER, CENTER);
    text(fontContent, fontPos.x, fontPos.y - 25);
    if (remadeBy == true && canvas.template == "price-tag") {
      textFont(displayFont);
      fill(textColor);
      textSize((fontSize * 2) / 5);
      textAlign(CENTER, BASELINE);
      text("BY", fontPos.x + 120, fontPos.y + 2);

      // Draw picture
      imageMode(CENTER);
      image(signatureImg, width / 2, 350, signatureImg.width * 0.7, signatureImg.height * 0.7);
    } else if (remadeBy == true && canvas.template == "postcard") {
      textFont(displayFont);
      fill(textColor);
      textSize(fontSize * 2/5);
      textAlign(CENTER, BASELINE);
      text("BY", fontPos.x - boundingBox.w/2 + 120, fontPos.y + boundingBox.h);

      // Draw picture
      imageMode(CENTER);
      image(signatureImg, width / 2 + 80, fontPos.y + boundingBox.h - 50, signatureImg.width * 1, signatureImg.height * 1);
    }
  }
}

function spawnTargets(boolean) {
  points = [];
  boundingBox = [];

  boundingBox = displayFont.textBounds(fontContent, fontPos.x, fontPos.y, fontSize);
  boundingBox.y -= (canvas.textSize * 22) / 172;

  points = [];
  if (targetDistributionSetting.value() == "text") {
    for (let i = 0; i < 1000; i++) {
      points[i] = {
        x: boundingBox.x + random(boundingBox.w),
        y: boundingBox.y + random(boundingBox.h),
      };
    }
  } else if (targetDistributionSetting.value() == "box") {
    for (let i = 0; i < 1000; i++) {
      points[i] = {
        x: canvas.box.x + random(canvas.box.w),
        y: canvas.box.y + random(canvas.box.h),
      };
    }
  }

  /* // Perhaps use this if I ever need to draw logo outline using particles
  if (targetDistributionSetting.value() == "text") {
    points = displayFont.textToPoints(fontContent, fontPos.x, fontPos.y, fontSize, {sampleFactor: 1});
    for (let point of points) {
      point.x -= boundingBox.w/2 + 7;
      point.y += boundingBox.h/2 - 20;
    }
    */

  if (targetMode.value() == "seek" && boolean) {
    repellers = [];
    for (let i = points.length - 1; i >= 0; i--) {
      targets.push(new Target(i, points[i].x, points[i].y));
    }
  } else if (targetMode.value() == "avoid" && boolean) {
    targets = [];
    for (let i = points.length - 1; i >= 0; i--) {
      repellers.push(new Target(i, points[i].x, points[i].y));
    }
  } else if (targetMode.value() == "wander") {
    targets = [];
    repellers = [];
  }
}

let timeoutId; // Declare timeoutId outside killAnimation()

function killAnimation() {
  let timeframe = parseInt(customTimeframe.value()) * 1000;
  let altTimeframe = 16000;

  // Clear the previous timeout
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (!logotypeCheckbox.checked() && points.length == 0) {
    timeoutId = setTimeout(() => {
      for (let particle of particles) {
        particle.life = 0;
      }
    }, timeframe);
  } else if (points.length > 0) {
    timeoutId = setTimeout(() => {
      for (let particle of particles) {
        particle.life = 0;
      }
    }, altTimeframe);
  }
}

function setParticleAmount() {
  numParticles = parseFloat(particleAmountSelecter.value());
}

function startLogomode() {
  capture = P5Capture.getInstance();
  // Setting timeframe for every reload
  let timeframe = 2500;

  // Turn on text
  targetMode.value("avoid");
  logotypeCheckbox.checked(true);
  particleAmountSelecter.value(9);
  targetDistributionSetting.value("text");

  // Defining the color palettes to cycle through
  let colorPalettes = ["logomode", "Remade", "Karla Karlsen", "Anne-Sofie Annesen", "Daniel Danielsen", "Ulrik Ulriksen", "Remade", "logomode"];

  resetSketch();

  // If there's an existing interval, clear it
  if (logomodeIntervalId) {
    clearInterval(logomodeIntervalId);
  }

  // Ask the user if they want to record a GIF
  let recordGif = window.confirm("Vil du optage en sekvens i logomode?");

  
  // After the first time frame, start cycling through the color palettes
  let index = 0;
  console.log(timeframe);
  logomodeIntervalId = setInterval(async () => {
    currentPalette = colorPalettes[index];
    index = (index + 1) % colorPalettes.length;
    
    randomSeed(index);
    await resetSketch();

    console.log(capture.state);
    if (recordGif && capture.state == "idle" && !recording) {
      recording = true;
      logomode = true; 
  
      // Start the capturer
      capture.start({
        format: "mp4",
        framerate: 60,
        bitrate: 24000,
        duration: timeframe * colorPalettes,
        width: width,
      });
    }

    if (recordGif && index === 0) {
      capture.stop();
      recording = false;
      logomode = false;
    }
  }, timeframe);
}
