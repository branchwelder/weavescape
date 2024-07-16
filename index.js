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
            <canvas id="threading"></canvas>
          </div>
          <div class="tie-up"><canvas id="tie-up"></canvas></div>
          <div></div>
          <div class="drawdown-container">
            <canvas id="drawdown"></canvas>
          </div>
          <div class="treadling-container">
            <canvas id="treadling"></canvas>
          </div>
          <div class="weft-color">
            <canvas id="weft-color"></canvas>
          </div>
        </div>
      </div>
      <div id="sim-pane"></div>
    </div>`;
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
