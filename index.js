import { html, render } from "lit-html";
import Split from "split.js";
import {
  drawDrawdown,
  drawThreading,
  drawTreadling,
  drawAll,
  drawTieUp,
  drawGrid,
  drawDrawdownOverlay,
} from "./drawing";
import { initializeSim } from "./yarnSimulation";
import patterns from "./patterns.json";
import { GLOBAL_STATE } from "./state";
import { yarnPicker } from "./yarnPicker";

function view() {
  return html`<div class="toolbar"><span>weavescape</span></div>
    <div class="page-content">
      <div id="drafting-pane">
        <div class="draft-controls">
          <div>
            <label for="select-preset-pattern"> Preset </label>
            <select
              id="select-preset-pattern"
              @change=${(e) => setDraft(patterns[e.target.value])}>
              ${patterns.map(
                (draft, i) =>
                  html`<option value=${i}>${draft.name || i + 1}</option>`
              )}
            </select>

            <label for="input-number-harnesses"> Harnesses </label>
            <input
              id="input-number-harnesses"
              type="number"
              .value=${String(GLOBAL_STATE.draft.threading.length)}
              @change=${(e) => updateNumberOfHarnesses(e.target.value)} />
            <label for="input-number-warp-threads"> Warp </label>
            <input
              id="input-number-warp-threads"
              type="number"
              .value=${String(GLOBAL_STATE.draft.threading[0].length)}
              @change=${(e) => updateWarpThreads(e.target.value)} />
            <label for="input-number-weft-threads"> Weft </label>
            <input
              id="input-number-weft-threads"
              type="number"
              .value=${String(GLOBAL_STATE.draft.treadling.length)}
              @change=${(e) => updateWeftThreads(e.target.value)} />
            <label> Yarn Diameter </label>
            <input
              id="input-yarn-diameter"
              type="range"
              min="0.1"
              max="1.3"
              step="0.01"
              value="1"
              @change=${() =>
                initializeSim(
                  document.getElementById("sim-canvas"),
                  GLOBAL_STATE.draft
                )} />
          </div>
          ${yarnPicker()}
          <div class="zoom-container">
            <button class="btn icon" @click=${() => zoomOut()}>
              <i class="fa-solid fa-magnifying-glass-minus"></i>
            </button>
            <button class="btn icon" @click=${() => zoomIn()}>
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </button>
          </div>
        </div>
        <div class="draft-layout">
          <div id="warp-color-container" class="scroller">
            <div class="spacer"></div>
            <canvas id="warp-color" @click=${(e) => editWarp(e)}></canvas>
          </div>
          <div></div>
          <div></div>
          <div id="threading-container" class="scroller">
            <div class="spacer"></div>
            <canvas
              id="threading"
              @click=${editThreading}
              @mousemove=${(e) => handleHoverCell(e, "threading")}
              @mouseleave=${resetHighlight}></canvas>
          </div>
          <div id="tie-up-container">
            <canvas
              id="tie-up"
              @click=${editTieup}
              @mousemove=${(e) => handleHoverCell(e, "tie-up")}
              @mouseleave=${resetHighlight}></canvas>
          </div>
          <div></div>
          <div id="drawdown-container" class="scroller">
            <div class="spacer"></div>
            <div id="drawdown-repeat-container">
              <canvas id="drawdown-repeat"></canvas>
            </div>
            <canvas id="drawdown"></canvas>
            <canvas id="drawdown-overlay"></canvas>
          </div>
          <div id="treadling-container" class="scroller">
            <canvas
              id="treadling"
              @click=${editTreadling}
              @mousemove=${(e) => highlightDraft(e, "treadling")}
              @mouseleave=${resetHighlight}></canvas>
          </div>
          <div id="weft-color-container" class="scroller">
            <canvas id="weft-color" @click=${(e) => editWeft(e)}></canvas>
          </div>
        </div>
      </div>
      <div id="sim-pane">
        <canvas id="sim-canvas"></canvas>
      </div>
    </div>`;
}

function zoomOut() {
  GLOBAL_STATE.cellSize = GLOBAL_STATE.cellSize - 1;
  drawAll();
}

function zoomIn() {
  GLOBAL_STATE.cellSize = GLOBAL_STATE.cellSize + 1;
  drawAll();
}

function editWarp(e) {
  const { row, col } = getCell(e);
  const { draft, activeYarn } = GLOBAL_STATE;

  draft.warpColorSequence[col] = activeYarn;

  updateDrawdown();
  drawAll();
}

function editWeft(e) {
  const { row, col } = getCell(e);
  const { draft, activeYarn } = GLOBAL_STATE;

  draft.weftColorSequence[row] = activeYarn;

  updateDrawdown();
  drawAll();
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
        // if treadling cell is on, get corresponding tie-up column
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

function setDraft(draft) {
  const { yarnPalette } = GLOBAL_STATE;
  GLOBAL_STATE.draft = draft;
  console.log(yarnPalette.slice(0, Math.floor(yarnPalette.length/2)))
  GLOBAL_STATE.draft.warpColorSequence = draft.threading[0].map((d, i) =>
    0
  );
  GLOBAL_STATE.draft.weftColorSequence = draft.treadling.map((d, i) =>
    yarnPalette.length > 1 ? 1 : 0
  );

  updateDrawdown();
  drawAll();
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

function updateNumberOfHarnesses(num) {
  const { draft } = GLOBAL_STATE;

  if (num < draft.threading.length) {
    draft.threading = draft.threading.slice(0, num);
    draft.tieUp = draft.tieUp.slice(0, num);
    draft.tieUp = draft.tieUp.map((row) => row.splice(1, num));
    draft.treadling = draft.treadling.map((row) => row.splice(1, num));
  } else {
    const diff = num - draft.threading.length;
    for (let i = 0; i < diff; i += 1) {
      draft.threading.push(new Array(draft.threading[0].length).fill(0));
      draft.tieUp.forEach((row) => row.unshift(0));
      draft.tieUp.push(new Array(draft.tieUp[0].length).fill(0));
      draft.treadling.forEach((row) => row.unshift(0));
    }
  }

  updateDrawdown();
  drawAll();
}

function updateWeftThreads(num) {
  const { draft } = GLOBAL_STATE;

  if (num < draft.treadling.length) {
    draft.treadling = draft.treadling.slice(0, num);
    draft.weftColorSequence = draft.weftColorSequence.slice(0, num);
  } else {
    const diff = num - draft.treadling.length;
    for (let i = 0; i < diff; i += 1) {
      draft.treadling.push(new Array(draft.treadling[0].length).fill(0));
      draft.weftColorSequence.push(draft.weftColorSequence[0]);
    }
  }

  updateDrawdown();
  drawAll();
}

function updateWarpThreads(num) {
  const { draft } = GLOBAL_STATE;

  if (num < draft.threading[0].length) {
    draft.threading = draft.threading.map((row) => row.splice(1, num));
    draft.warpColorSequence = draft.warpColorSequence.splice(1, num);
  } else {
    const diff = num - draft.threading[0].length;
    for (let i = 0; i < diff; i += 1) {
      draft.threading.forEach((row) => row.unshift(0));
      draft.warpColorSequence.unshift(draft.warpColorSequence[0]);
    }
  }

  updateDrawdown();
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

  updateDrawdown();
  drawTreadling();

  highlightDraft(e, "treadling");
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

function highlightDraft(e, type) {
  const { row, col } = getCell(e);
  const { cellSize, draft } = GLOBAL_STATE;
  const tieUp = document.getElementById("tie-up");
  const ctx = tieUp.getContext("2d");
  const threading = document.getElementById("threading");
  const ctx2 = threading.getContext("2d");
  const treadling = document.getElementById("treadling");
  const ctx3 = treadling.getContext("2d");
  const drawdownOverlay = document.getElementById("drawdown-overlay");
  const ctx4 = drawdownOverlay.getContext("2d");

  handleHoverCell(e, type);
  drawDrawdownOverlay();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "hsla(317, 82%, 74%, 0.8)";
  ctx.fillStyle = "rgba(50,50,50,0.7)";
  ctx2.lineWidth = 2;
  ctx2.strokeStyle = "hsla(317, 82%, 74%, 0.8)";
  ctx2.fillStyle = "rgba(50,50,50,0.7)";
  ctx3.lineWidth = 2;
  ctx3.strokeStyle = "hsla(317, 82%, 74%, 0.8)";
  ctx3.fillStyle = "rgba(50,50,50,0.7)";
  ctx4.lineWidth = 2;
  ctx4.strokeStyle = "hsla(317, 82%, 74%, 0.8)";
  ctx4.fillStyle = "rgba(0,0,0,0.4)";

  const treadlingRow = draft.treadling[row];
  let highlightThreadingRows = new Array(draft.threading.length).fill(0);

  treadlingRow.forEach((cell, i) => {
    const tieUpCol = getTieUpColumn(draft, i);
    if (cell === 1) {
      ctx.strokeRect(i * cellSize, 0, cellSize, tieUpCol.length * cellSize);

      tieUpCol.forEach((cell, j) => {
        if (cell === 1) {
          highlightThreadingRows[j] = 1;
        }
      });
    } else {
      ctx.fillRect(i * cellSize, 0, cellSize, tieUpCol.length * cellSize);
    }
  });

  highlightThreadingRows.forEach((cell, i) => {
    if (cell === 1) {
      ctx2.strokeRect(
        0,
        i * cellSize,
        draft.threading[0].length * cellSize,
        cellSize
      );
    } else {
      ctx2.fillRect(
        0,
        i * cellSize,
        draft.threading[0].length * cellSize,
        cellSize
      );
    }
  });

  draft.treadling.forEach((_, i) => {
    if (i === row) {
      ctx3.strokeRect(
        0,
        i * cellSize,
        draft.treadling[0].length * cellSize,
        cellSize
      );
      ctx4.strokeRect(
        0,
        i * cellSize,
        draft.threading[0].length * cellSize,
        cellSize
      );
    } else {
      ctx3.fillRect(
        0,
        i * cellSize,
        draft.treadling[0].length * cellSize,
        cellSize
      );
      ctx4.fillRect(
        0,
        i * cellSize,
        draft.threading[0].length * cellSize,
        cellSize
      );
    }
  });
}

function resetHighlight() {
  drawTieUp();
  drawThreading();
  drawTreadling();
  drawDrawdownOverlay();
}

function handleHoverCell(e, id) {
  const { row, col } = getCell(e);
  const { cellSize } = GLOBAL_STATE;
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");

  drawTieUp();
  drawThreading();
  drawTreadling();

  ctx.fillStyle = "hsla(317, 82%, 74%, 0.448)";
  ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
}

function updateDrawdown() {
  const { draft, cellSize } = GLOBAL_STATE;
  draft.drawdown = makeDrawdown(draft);
  const drawdown = document.getElementById("drawdown");

  drawDrawdown(drawdown, draft, cellSize);

  GLOBAL_STATE.staleDrawdown = true;
}

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);

  if (GLOBAL_STATE.staleDrawdown) {
    window.setTimeout(() => {
      initializeSim(document.getElementById("sim-canvas"), GLOBAL_STATE.draft);
      GLOBAL_STATE.staleDrawdown = false;
    });
  }
}

function addScrollSync() {
  const drawdownContainer = document.getElementById("drawdown-container");
  const treadlingContainer = document.getElementById("treadling-container");
  const threadingContainer = document.getElementById("threading-container");
  const warpColorSequenceContainer = document.getElementById(
    "warp-color-container"
  );
  const weftColorSequenceContainer = document.getElementById(
    "weft-color-container"
  );

  let isSyncingTreadlingScroll = false;
  let isSyncingThreadingScroll = false;
  let isSyncingDrawdownScroll = false;
  let isSyncingWarpScroll = false;
  let isSyncingWeftScroll = false;

  drawdownContainer.onscroll = function () {
    if (!isSyncingDrawdownScroll) {
      isSyncingTreadlingScroll = true;
      isSyncingThreadingScroll = true;
      isSyncingWarpScroll = true;
      isSyncingWeftScroll = true;
      treadlingContainer.scrollTop = this.scrollTop;
      threadingContainer.scrollLeft = this.scrollLeft;
      warpColorSequenceContainer.scrollLeft = this.scrollLeft;
      weftColorSequenceContainer.scrollTop = this.scrollTop;
    }

    isSyncingDrawdownScroll = false;
  };

  threadingContainer.onscroll = function () {
    if (!isSyncingThreadingScroll) {
      isSyncingDrawdownScroll = true;
      isSyncingWarpScroll = true;
      drawdownContainer.scrollLeft = this.scrollLeft;
      warpColorSequenceContainer.scrollLeft = this.scrollLeft;
    }

    isSyncingThreadingScroll = false;
  };

  warpColorSequenceContainer.onscroll = function () {
    if (!isSyncingWarpScroll) {
      isSyncingThreadingScroll = true;
      isSyncingDrawdownScroll = true;
      drawdownContainer.scrollLeft = this.scrollLeft;
      threadingContainer.scrollLeft = this.scrollLeft;
    }

    isSyncingWarpScroll = false;
  };

  weftColorSequenceContainer.onscroll = function () {
    if (!isSyncingWeftScroll) {
      isSyncingTreadlingScroll = true;
      isSyncingDrawdownScroll = true;
      drawdownContainer.scrollTop = this.scrollTop;
      treadlingContainer.scrollTop = this.scrollTop;
    }

    isSyncingWeftScroll = false;
  };

  treadlingContainer.onscroll = function () {
    if (!isSyncingTreadlingScroll) {
      isSyncingTreadlingScroll = true;
      isSyncingDrawdownScroll = true;
      drawdownContainer.scrollTop = this.scrollTop;
      weftColorSequenceContainer.scrollTop = this.scrollTop;
    }

    isSyncingTreadlingScroll = false;
  };
}

function init() {
  r();

  Split(["#drafting-pane", "#sim-pane"], {
    sizes: [50, 50],
    minSize: 100,
    gutterSize: 8,
    onDrag: () => {
      drawDrawdown(
        document.getElementById("drawdown"),
        GLOBAL_STATE.draft,
        GLOBAL_STATE.cellSize
      );
    },
  });

  updateDrawdown();

  drawAll();

  addScrollSync();
}

window.onload = init;
