import { GLOBAL_STATE } from "./state";
import { hexToRgb } from "./utils";

function getWarpColor(draft, x) {
  const yarnIndex = draft.warpColorSequence[x % draft.warpColorSequence.length];
  return GLOBAL_STATE.yarnPalette[yarnIndex];
}

function getWeftColor(draft, x) {
  const yarnIndex = draft.weftColorSequence[x % draft.weftColorSequence.length];
  return GLOBAL_STATE.yarnPalette[yarnIndex];
}

function drawGrid(ctx, cellSize, width, height) {
  ctx.beginPath();

  for (let y = 0; y < height; y++) {
    const yVal = y * cellSize - 0.5;
    ctx.moveTo(0, yVal);
    ctx.lineTo(width * cellSize, yVal);
  }

  for (let x = 0; x < width; x++) {
    const xVal = x * cellSize - 0.5;
    ctx.moveTo(xVal, 0);
    ctx.lineTo(xVal, height * cellSize);
  }

  ctx.stroke();
}

export function drawBitmap(canvas, arrayData, cellSize) {
  const ctx = canvas.getContext("2d");

  const height = arrayData.length;
  const width = arrayData[0].length;

  canvas.height = height * cellSize;
  canvas.width = width * cellSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = arrayData[y][x];
      if (val === 0) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "black";
      }

      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  ctx.lineStyle = "black";
  ctx.lineWidth = 1;

  drawGrid(ctx, cellSize, width, height);
}

export function drawWarp(canvas, draft, cellSize) {
  const ctx = canvas.getContext("2d");

  const width = draft.warpColorSequence.length;

  canvas.height = cellSize;
  canvas.width = width * cellSize;

  for (let x = 0; x < width; x++) {
    ctx.fillStyle = getWarpColor(draft, x);

    ctx.fillRect(x * cellSize, 0, cellSize, cellSize);
  }

  ctx.lineStyle = "black";
  ctx.lineWidth = 1;

  drawGrid(ctx, cellSize, width, 1);
}

export function drawWeft(canvas, draft, cellSize) {
  const ctx = canvas.getContext("2d");

  const height = draft.weftColorSequence.length;

  canvas.height = height * cellSize;
  canvas.width = cellSize;

  for (let y = 0; y < height; y++) {
    ctx.fillStyle = getWeftColor(draft, y);

    ctx.fillRect(0, y * cellSize, cellSize, cellSize);
  }

  ctx.lineStyle = "black";
  ctx.lineWidth = 1;

  drawGrid(ctx, cellSize, 1, height);
}

function getWarpYarn(draft, x) {
  return draft.warpColorSequence[x % draft.warpColorSequence.length];
}

function getWeftYarn(draft, y) {
  return draft.weftColorSequence[y % draft.weftColorSequence.length];
}

export function drawDrawdown(canvas, draft, cellSize) {
  const ctx = canvas.getContext("2d");

  const width = draft.threading[0].length;
  const height = draft.treadling.length;

  canvas.height = height;
  canvas.width = width;

  canvas.style.width = `${cellSize * width}px`;
  canvas.style.height = `${cellSize * height}px`;

  // for (let y = 0; y < height; y++) {
  //   for (let x = 0; x < width; x++) {
  //     let cell = draft.drawdown[y][x];
  //     if (cell === 0) {
  //       ctx.fillStyle = getWarpColor(draft, x);
  //     } else {
  //       ctx.fillStyle = getWeftColor(draft, y);
  //     }

  //     ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  //   }
  // }

  const yarnPalette = GLOBAL_STATE.yarnPalette.map((hex) => hexToRgb(hex));

  const imageData = ctx.getImageData(0, 0, width, height);

  const data = imageData.data;

  for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {
      let yarnIndex =
        draft.drawdown[y][x] === 0
          ? getWarpYarn(draft, x)
          : getWeftYarn(draft, y);

      let rgb = yarnPalette[yarnIndex];

      let i = (y * width + x) * 4;

      data[i] = rgb[0]; // red
      data[i + 1] = rgb[1]; // green
      data[i + 2] = rgb[2]; // blue
      data[i + 3] = 255;
    }
  }

  // ctx.scale(cellSize, cellSize);

  ctx.putImageData(imageData, 0, 0);

  // ctx.putImageData(imageData, 0, 0);

  // drawGrid(ctx, cellSize, width, height);
}
