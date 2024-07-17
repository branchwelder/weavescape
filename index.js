import { html, render } from "lit-html";
import Split from "split.js";
import { drawBitmap, drawDrawdown, drawWarp, drawWeft } from "./drawing";
import { initializeSim } from "./yarnSimulation";

let GLOBAL_STATE = {
  cellSize: 20,
  draft: {
    warpColorSequence: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    weftColorSequence: [2, 2, 3, 3],
    yarnPalette: ["#d31b1b", "#3374a9", "#d69d21", "#56c246"],
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
    drawdown: [],
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
      <div id="sim-pane">
        <canvas id="sim-canvas"></canvas>
      </div>
    </div>`;
}

function getTieUpColumn(draft, colIndex) {
  const column = [];

  draft.tieUp.forEach((row) => {
    column.push(row[colIndex]);
  });

  return column;
}

function makeDrawdown(draft) {
  const dd = [];

  draft.treadling.forEach((row, i) => {
    let combined = new Array(draft.threading[0].length).fill(0);

    row.forEach((cell, j) => {
      if (cell === 1) {
        // if treadling cell is on, get correspondin tie-up column
        getTieUpColumn(draft, j).forEach((tuCell, k) => {
          if (tuCell === 1) {
            // if tie-up cell is on, get corresponding threading row
            draft.threading[k].forEach((thread, x) => {
              if (thread === 1) {
                combined[x] = 1;
              }
            });
          }
        });
      }
    });

    dd.push(combined);
  });

  return dd;
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

  updateDrawdown();
  drawThreading();
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

  updateDrawdown();
  drawTreadling();
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

  updateDrawdown();
  drawTieUp();
}

function updateDrawdown() {
  const { draft, cellSize } = GLOBAL_STATE;
  draft.drawdown = makeDrawdown(draft);
  const drawdown = document.getElementById("drawdown");

  drawDrawdown(drawdown, draft, cellSize);

  initializeSim(document.getElementById("sim-canvas"), draft);
}

function drawThreading() {
  const { cellSize, draft } = GLOBAL_STATE;

  const threading = document.getElementById("threading");
  drawBitmap(threading, draft.threading, cellSize);
}

function drawTreadling() {
  const { cellSize, draft } = GLOBAL_STATE;

  const treadling = document.getElementById("treadling");
  drawBitmap(treadling, draft.treadling, cellSize);
}

function drawTieUp() {
  const { cellSize, draft } = GLOBAL_STATE;

  const tieUp = document.getElementById("tie-up");
  drawBitmap(tieUp, draft.tieUp, cellSize);
}

function drawAll() {
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
}

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function init() {
  r();

  Split(["#drafting-pane", "#sim-pane"], {
    sizes: [50, 50],
    minSize: 100,
    gutterSize: 8,
  });

  updateDrawdown();

  drawAll();
}

window.onload = init;
