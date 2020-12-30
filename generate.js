let seed;
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
let riverSpots = [];

function getSettingsFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const w = urlParams.get('w');
  const h = urlParams.get('h');
  const seed = urlParams.get('seed');

  document.getElementById('width').value = w;
  document.getElementById('height').value = h;
  document.getElementById('seed-input').value = seed;

  if (w || h || seed) {
    generate();
    document.getElementById('seed-input').value = '';
  }
}

function copyUrl() {
  const { protocol, hostname } = window.location;
  const url = `${protocol}//${hostname}/?w=${width - 1}&h=${
    height - 1
  }&seed=${seed}`;
  navigator.clipboard.writeText(url).then(
    function () {},
    function () {
      alert(`Failed to copy to the clipboard. The URL is: ${url}`);
    }
  );
}

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
  seed = userSeed || timeSeed;
  random = new Math.seedrandom(seed);
  updateSeedDisplay();

  document.getElementById('meta').classList.remove('hidden');

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

  canvas.onclick = function (event) {
    const { left: canvasLeft, top: canvasTop } = canvas.getBoundingClientRect();
    const { clientX: clickX, clientY: clickY } = event;

    const startX = Math.floor((clickX - canvasLeft) / stitchSize);
    const startY = Math.floor((clickY - canvasTop) / stitchSize);

    addRiver(startX, startY);
  };
}

function doStep({ river } = { river: false }) {
  const d4 = Math.floor(random() * 4) + 1;
  const d8 = Math.floor(random() * 8) + 1;
  const coin = random() < 0.5 ? -1 : 1;

  if (d4 === 1 && d8 === 1 && !river) {
    doTurn(coin);
  }

  // Drift based on coin
  if (dx !== 0) {
    y += coin;
  } else {
    x += coin;
  }
  addStitch({ river });

  for (let i = 0; i < d4; i++) {
    x += dx;
    y += dy;
    addStitch({ river });
  }
}

function doTurn(coin) {
  if (dx !== 0) {
    dx = 0;
    dy = coin;

    let tempX = x;
    let tempY = y;
    for (let i = 0; i < height / 3; i++) {
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
    for (let i = 0; i < width / 3; i++) {
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

function addRiver(startX, startY) {
  removeRiver();
  x = startX;
  y = startY;

  document.getElementById('remove-river').classList.remove('hidden');

  if (random() < 0.5) {
    dx = random() < 0.5 ? 1 : -1;
    dy = 0;
  } else {
    dy = random() < 0.5 ? 1 : -1;
    dx = 0;
  }

  const riverSegments = Math.floor(random() * 25) + 15;
  for (let i = 0; i < riverSegments; i++) {
    doStep({ river: true });
  }
}

function removeRiver() {
  for (let i = 0; i < riverSpots.length; i++) {
    const spot = riverSpots[i];
    const isCoastline = visitedSpots.some(
      (visitedSpot) => visitedSpot.x === spot.x && visitedSpot.y === spot.y
    );
    ctx.fillStyle = isCoastline ? '#0e82e8' : '#ffffff';
    ctx.fillRect(
      spot.x * stitchSize,
      spot.y * stitchSize,
      stitchSize,
      stitchSize
    );
  }

  riverSpots = [];
  document.getElementById('remove-river').classList.add('hidden');
}

function updateSeedDisplay() {
  const seedDisplay = document.getElementById('seed-display');
  seedDisplay.innerText = `Seed: ${seed}`;
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
}

function drawBorder() {
  ctx.strokeStyle = '#cccccc';
  ctx.strokeRect(0, 0, width * stitchSize, height * stitchSize);
}

function addStitch({ river } = { river: false }) {
  ctx.fillStyle = river ? '#51b6ed' : '#0e82e8';
  ctx.fillRect(x * stitchSize, y * stitchSize, stitchSize, stitchSize);
  if (river) {
    riverSpots.push({ x, y });
  } else {
    visitedSpots.push({ x, y });
  }
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
