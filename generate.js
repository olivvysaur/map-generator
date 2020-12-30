let random;

let canvas;
let ctx;

let width;
let height;

let stitchSize;

let x;
let y;

function generate() {
  const enteredWidth = parseInt(document.getElementById('width').value);
  const enteredHeight = parseInt(document.getElementById('height').value);

  width =
    !enteredWidth || isNaN(enteredWidth) ? 300 : Math.abs(enteredWidth) + 1;
  height =
    !enteredHeight || isNaN(enteredHeight) ? 200 : Math.abs(enteredHeight) + 1;

  canvas = document.getElementById('canvas');

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
  drawStitch();

  printState();
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

function drawStitch() {
  ctx.fillStyle = '#0e82e8';
  ctx.fillRect(x * stitchSize, y * stitchSize, stitchSize, stitchSize);
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
