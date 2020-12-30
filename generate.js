let random;

let canvas;
let ctx;

let width;
let height;

let stitchSize;

let x;
let y;
let dx;
let dy;

let visitedSpots = [];

function generate() {
  visitedSpots = [];

  const enteredWidth = parseInt(document.getElementById('width').value);
  const enteredHeight = parseInt(document.getElementById('height').value);

  width =
    !enteredWidth || isNaN(enteredWidth) ? 300 : Math.abs(enteredWidth) + 1;
  height =
    !enteredHeight || isNaN(enteredHeight) ? 200 : Math.abs(enteredHeight) + 1;

  canvas = document.getElementById('canvas');
  canvas.classList.remove('hidden');

  stitchSize = calculateStitchSize();
  canvas.width = width * stitchSize;
  canvas.height = height * stitchSize;

  ctx = canvas.getContext('2d');

  const userSeed = document.getElementById('seed-input').value;
  const timeSeed = new Date().getTime().toString(36);
  const seed = userSeed || timeSeed;
  updateSeedDisplay(seed);
  random = new Math.seedrandom(seed);

  drawBorder();

  const { startX, startY } = chooseStartPosition();
  x = startX;
  y = startY;

  displayStartPosition();
  addStitch();

  if (y === 0) {
    dx = 0;
    dy = 1;
  } else {
    dx = 0;
    dy = -1;
  }

  // Draw initial 4 stitches
  for (let i = 0; i < 5; i++) {
    x += dx;
    y += dy;
    addStitch();
  }

  while (x >= 0 && x < width && y >= 0 && y < height) {
    doStep();
  }
}

function doStep() {
  const d4 = Math.floor(random() * 4) + 1;
  const d8 = Math.floor(random() * 8) + 1;
  const coin = random() < 0.5 ? -1 : 1;

  if (d4 === 1 && d8 === 1) {
    doTurn(coin);
  }

  // Drift based on coin
  if (dx !== 0) {
    y += coin;
  } else {
    x += coin;
  }
  addStitch();

  for (let i = 0; i < d4; i++) {
    x += dx;
    y += dy;
    addStitch();
  }
}

function doTurn(coin) {
  if (dx !== 0) {
    dx = 0;
    dy = coin;

    let tempX = x;
    let tempY = y;
    for (let i = 0; i < 25; i++) {
      tempY += dy;

      const crossesPath = visitedSpots.some(
        (spot) => spot.x === tempX && spot.y === tempY
      );
      const reachesEdge = tempY < 0 || tempY >= height;

      if (crossesPath || reachesEdge) {
        dy = -coin;
        break;
      }
    }
  } else {
    dx = coin;
    dy = 0;

    let tempX = x;
    let tempY = y;
    for (let i = 0; i < 25; i++) {
      tempX += dx;

      const crossesPath = visitedSpots.some(
        (spot) => spot.x === tempX && spot.y === tempY
      );
      const reachesEdge = tempY < 0 || tempY >= height;

      if (crossesPath || reachesEdge) {
        dx = -coin;
        break;
      }
    }
  }
}

function updateSeedDisplay(seed) {
  const seedDisplay = document.getElementById('seed-display');
  seedDisplay.innerText = `Seed: ${seed}`;
  seedDisplay.classList.remove('hidden');
}

function chooseStartPosition() {
  const rangeDifference = width / 12;
  const ranges = [
    {
      from: width / 4 - rangeDifference,
      to: width / 4 + rangeDifference,
    },
    {
      from: (3 * width) / 4 - rangeDifference,
      to: (3 * width) / 4 + rangeDifference,
    },
  ];

  const range = random() < 0.5 ? ranges[0] : ranges[1];
  const startX = Math.floor(random() * (range.to - range.from) + range.from);

  const startY = random() < 0.5 ? 0 : height - 1;

  return { startX, startY };
}

function displayStartPosition() {
  const startPositionDisplay = document.getElementById('start-position');
  startPositionDisplay.innerText = `Start position: (${x + 1}, ${y + 1})`;
  startPositionDisplay.classList.remove('hidden');
}

function drawBorder() {
  ctx.strokeStyle = '#cccccc';
  ctx.strokeRect(0, 0, width * stitchSize, height * stitchSize);
}

function addStitch() {
  ctx.fillStyle = '#0e82e8';
  ctx.fillRect(x * stitchSize, y * stitchSize, stitchSize, stitchSize);
  visitedSpots.push({ x, y });
}

function drawStartPosition() {
  ctx.fillStyle = '#000000';
  ctx.fillText(x, x * stitchSize, y * stitchSize);
}

function calculateStitchSize() {
  const { width: availableWidth } = document
    .getElementById('root')
    .getBoundingClientRect();

  return Math.floor(availableWidth / width);
}

function printState() {
  console.log({
    width,
    height,
    x,
    y,
    stitchSize,
  });
}
