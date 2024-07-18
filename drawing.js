import { GLOBAL_STATE } from "./state";

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

  for (let y = 0; y < height + 1; y++) {
    const yVal = y * cellSize - 0.5;
    ctx.moveTo(0, yVal);
    ctx.lineTo(width * cellSize, yVal);
  }

  for (let x = 0; x < width + 1; x++) {
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

  canvas.height = cellSize * height;
  canvas.width = cellSize * width;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let yarnIndex =
        draft.drawdown[y][x] === 0
          ? getWarpYarn(draft, x)
          : getWeftYarn(draft, y);

      ctx.fillStyle = GLOBAL_STATE.yarnPalette[yarnIndex];

      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  const canvasRepeat = document.getElementById("drawdown-repeat");
  const container = document.getElementById("drawdown-container");
  const ctx2 = canvasRepeat.getContext("2d");
  const img = document.getElementById("drawdown");
  const pat = ctx2.createPattern(img, "repeat");
  canvasRepeat.width =
    Math.ceil(container.offsetWidth / canvas.width) * canvas.width;
  canvasRepeat.height =
    Math.ceil(container.offsetHeight / canvas.height) * canvas.height;
  ctx2.rect(0, 0, canvasRepeat.width, canvasRepeat.height);
  ctx2.fillStyle = pat;
  ctx2.fill();
}

export function drawThreading() {
  const { cellSize, draft } = GLOBAL_STATE;

  const threading = document.getElementById("threading");
  drawBitmap(threading, draft.threading, cellSize);
}

export function drawTreadling() {
  const { cellSize, draft } = GLOBAL_STATE;

  const treadling = document.getElementById("treadling");
  drawBitmap(treadling, draft.treadling, cellSize);
}

export function drawTieUp() {
  const { cellSize, draft } = GLOBAL_STATE;

  const tieUp = document.getElementById("tie-up");
  drawBitmap(tieUp, draft.tieUp, cellSize);
}

export function drawAll() {
  const { cellSize, draft } = GLOBAL_STATE;
  drawThreading();
  drawTreadling();
  drawTieUp();

  const warpColor = document.getElementById("warp-color");
  const weftColor = document.getElementById("weft-color");

  drawWarp(warpColor, draft, cellSize);
  drawWeft(weftColor, draft, cellSize);

  const drawdown = document.getElementById("drawdown");

  drawDrawdown(drawdown, draft, cellSize);

  GLOBAL_STATE.staleDrawdown = true;
}
