import { html, render } from "lit-html";
import Split from "split.js";
import { drawBitmap, drawDrawdown, drawWarp, drawWeft } from "./drawing";

let GLOBAL_STATE = {
  cellSize: 20,
  draft: {
    warpColorSequence: [
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
    ],
    weftColorSequence: ["green", "green", "yellow", "yellow"],
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
          <div class="warp-color-container">
            <canvas id="warp-color"></canvas>
          </div>
          <div></div>
          <div></div>
          <div class="threading-container">
            <canvas id="threading" @click=${editThreading}></canvas>
          </div>
          <div class="tie-up">
            <canvas id="tie-up" @click=${editTieup}></canvas>
          </div>
          <div></div>
          <div class="drawdown-container">
            <canvas id="drawdown"></canvas>
          </div>
          <div class="treadling-container">
            <canvas id="treadling" @click=${editTreadling}></canvas>
          </div>
          <div class="weft-color">
            <canvas id="weft-color"></canvas>
          </div>
        </div>
      </div>
      <div id="sim-pane"></div>
    </div>`;
}

function getCell(event) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const { cellSize } = GLOBAL_STATE;

  let x = Math.floor((event.clientX - bounds.x) / cellSize);
  let y = Math.floor((event.clientY - bounds.y) / cellSize);
  x = x < 0 ? 0 : x;
  y = y < 0 ? 0 : y;

  return { row: y, col: x };
}

function editThreading(e) {
  const { row, col } = getCell(e);
  const { cellSize, draft } = GLOBAL_STATE;

  let curr = draft.threading[row][col];

  if (curr == 0) {
    draft.threading[row][col] = 1;
  } else {
    draft.threading[row][col] = 0;
  }

  const threading = document.getElementById("threading");
  // drawBitmap(threading, draft.threading, cellSize);
  drawAll();
}

function editTreadling(e) {
  const { row, col } = getCell(e);
  const { cellSize, draft } = GLOBAL_STATE;

  let curr = draft.treadling[row][col];

  if (curr == 0) {
    draft.treadling[row][col] = 1;
  } else {
    draft.treadling[row][col] = 0;
  }

  const treadling = document.getElementById("treadling");
  // drawBitmap(treadling, draft.treadling, cellSize);
  drawAll();
}

function editTieup(e) {
  const { row, col } = getCell(e);
  const { cellSize, draft } = GLOBAL_STATE;

  let curr = draft.tieUp[row][col];

  if (curr == 0) {
    draft.tieUp[row][col] = 1;
  } else {
    draft.tieUp[row][col] = 0;
  }

  const tieUp = document.getElementById("tie-up");
  // drawBitmap(tieUp, draft.tieUp, cellSize);
  drawAll();
}

function drawAll() {
  const { cellSize, draft } = GLOBAL_STATE;

  const threading = document.getElementById("threading");
  const tieUp = document.getElementById("tie-up");
  const treadling = document.getElementById("treadling");

  drawBitmap(threading, draft.threading, cellSize);
  drawBitmap(tieUp, draft.tieUp, cellSize);
  drawBitmap(treadling, draft.treadling, cellSize);

  const warpColor = document.getElementById("warp-color");
  const weftColor = document.getElementById("weft-color");

  drawWarp(warpColor, draft.warpColorSequence, cellSize);
  drawWeft(weftColor, draft.weftColorSequence, cellSize);

  const drawdown = document.getElementById("drawdown");

  drawDrawdown(drawdown, draft, cellSize);
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
