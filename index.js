import { html, render } from "lit-html";
import Split from "split.js";

let GLOBAL_STATE = {
  cellSize: 20,
  draft: {
    threading: [
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    ],
    tieUp: [
      [0, 0, 0, 1],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [1, 0, 0, 0],
    ],
    treadling: [
      [0, 0, 0, 1],
      [0, 0, 1, 0],
      [0, 1, 0, 0],
      [1, 0, 0, 0],
    ],
  },
};

function view() {
  return html`<div class="toolbar"><span>weavescape</span></div>
    <div class="page-content">
      <div id="drafting-pane">
        <div class="draft-layout">
          <div class="warp-color"></div>
          <div></div>
          <div></div>
          <div class="threading"><canvas id="threading-canvas"></canvas></div>
          <div class="tie-up"><canvas id="tie-up-canvas"></canvas></div>
          <div></div>
          <div class="draft">draft</div>
          <div class="treadling"><canvas id="treadling-canvas"></canvas></div>
          <div class="weft-color"></div>
        </div>
      </div>
      <div id="sim-pane"></div>
    </div>`;
}

function drawBitmap(canvas, arrayData) {
  const ctx = canvas.getContext("2d");
  const { cellSize } = GLOBAL_STATE;

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

function drawAll() {
  const threading = document.getElementById("threading-canvas");
  const tieUp = document.getElementById("tie-up-canvas");
  const treadling = document.getElementById("treadling-canvas");

  drawBitmap(threading, GLOBAL_STATE.draft.threading);
  drawBitmap(tieUp, GLOBAL_STATE.draft.tieUp);
  drawBitmap(treadling, GLOBAL_STATE.draft.treadling);
}

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function init() {
  r();

  Split(["#drafting-pane", "#sim-pane"], {
    sizes: [70, 30],
    minSize: 100,
    gutterSize: 8,
  });

  drawAll();
}

window.onload = init;
