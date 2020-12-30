let random;

let width;
let height;

let x;
let y;

function generate() {
  const enteredWidth = parseInt(document.getElementById('width').value);
  const enteredHeight = parseInt(document.getElementById('height').value);

  width = !enteredWidth || isNaN(enteredWidth) ? 300 : Math.abs(enteredWidth);
  height =
    !enteredHeight || isNaN(enteredHeight) ? 200 : Math.abs(enteredHeight);

  const userSeed = document.getElementById('seed-input').value;
  const timeSeed = new Date().getTime().toString(36);
  const seed = userSeed || timeSeed;
  updateSeedDisplay(seed);
  random = new Math.seedrandom(seed);

  const { startX, startY } = chooseStartPosition();
  x = startX;
  y = startY;

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

function printState() {
  console.log({
    width,
    height,
    x,
    y,
  });
}
