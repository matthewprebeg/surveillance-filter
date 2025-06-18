let video;
let faceMesh;
let camera;
let results;

function setup() {
    const w = min(windowWidth - 40, 640);
    const h = (w * 3) / 4; // Keep 4:3 aspect ratio
    let canvas = createCanvas(w, h);
    canvas.parent(document.querySelector('.canvas-container'));
    video = createCapture(VIDEO);
    video.size(w, h);
    video.hide();
    faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onResults);

  camera = new Camera(video.elt, {
    onFrame: async () => {
      await faceMesh.send({ image: video.elt });
    },
    width: width,
    height: height
  });
  camera.start();
}

function windowResized() {
  const w = min(windowWidth - 40, 640);
  const h = (w * 3) / 4;
  resizeCanvas(w, h);
  video.size(w, h);
}


function onResults(res) {
  results = res;
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  if (results && results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      let leftIrisX = 0, leftIrisY = 0;
      for (let i = 468; i <= 472; i++) {
        leftIrisX += landmarks[i].x;
        leftIrisY += landmarks[i].y;
      }
      leftIrisX /= 5;
      leftIrisY /= 5;

      let rightIrisX = 0, rightIrisY = 0;
      for (let i = 473; i <= 477; i++) {
        rightIrisX += landmarks[i].x;
        rightIrisY += landmarks[i].y;
      }
      rightIrisX /= 5;
      rightIrisY /= 5;

      let leftEyeOuterX = landmarks[33].x;
      let leftEyeInnerX = landmarks[133].x;
      let leftEyeTopY = landmarks[159].y;
      let leftEyeBottomY = landmarks[145].y;

      let rightEyeOuterX = landmarks[362].x;
      let rightEyeInnerX = landmarks[263].x;
      let rightEyeTopY = landmarks[386].y;
      let rightEyeBottomY = landmarks[374].y;

      let denomLeft = leftEyeInnerX - leftEyeOuterX;
      let denomRight = rightEyeInnerX - rightEyeOuterX;

      if (denomLeft !== 0 && denomRight !== 0) {
        let leftIrisPos = constrain((leftIrisX - leftEyeOuterX) / denomLeft, 0, 1);
        let rightIrisPos = constrain((rightIrisX - rightEyeOuterX) / denomRight, 0, 1);

        const centerThreshold = 0.1;
        let leftLookingCenter = leftIrisPos > 0.5 - centerThreshold && leftIrisPos < 0.5 + centerThreshold;
        let rightLookingCenter = rightIrisPos > 0.5 - centerThreshold && rightIrisPos < 0.5 + centerThreshold;

        let isLookingCenter = leftLookingCenter && rightLookingCenter;
        let boxColor = isLookingCenter ? '#F44336' : '#2196F3'; // red or blue
        let label = isLookingCenter ? 'Subject is noticing' : 'Subject is looking away';

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let pt of landmarks) {
          let x = pt.x * width;
          let y = pt.y * height;
          minX = min(minX, x);
          minY = min(minY, y);
          maxX = max(maxX, x);
          maxY = max(maxY, y);
        }

        stroke(boxColor);
        strokeWeight(2);
        noFill();
        rect(minX, minY, maxX - minX, maxY - minY);

        noStroke();
        fill(boxColor);
        textSize(16);
        textAlign(CENTER, BOTTOM);
        text(label, (minX + maxX) / 2, minY - 5);

        if (isLookingCenter) {
          let barX = leftEyeOuterX * width - 5;
          let barY = Math.min(leftEyeTopY, rightEyeTopY) * height - 5;
          let barW = (rightEyeInnerX * width + 5) - barX;
          let barH = (Math.max(leftEyeBottomY, rightEyeBottomY) * height) - barY + 10;
          pixelateArea(barX, barY, barW, barH, 10);
        }
      }
    }
  }
}

function pixelateArea(x, y, w, h, pixelSize) {
  video.loadPixels();
  noStroke();

  for (let px = x; px < x + w; px += pixelSize) {
    for (let py = y; py < y + h; py += pixelSize) {
      let r = 0, g = 0, b = 0, count = 0;

      for (let dx = 0; dx < pixelSize; dx++) {
        for (let dy = 0; dy < pixelSize; dy++) {
          let sx = floor(px + dx);
          let sy = floor(py + dy);
          if (sx < 0 || sx >= video.width || sy < 0 || sy >= video.height) continue;
          let idx = 4 * (sy * video.width + sx);
          r += video.pixels[idx];
          g += video.pixels[idx + 1];
          b += video.pixels[idx + 2];
          count++;
        }
      }

      if (count > 0) {
        fill(r / count, g / count, b / count);
        rect(px, py, pixelSize, pixelSize);
      }
    }
  }
}
