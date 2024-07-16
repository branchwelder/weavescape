import { html, render } from "lit-html";
import Split from "split.js";

// let GLOBAL_STATE = {
//   cellSize: 10,
//   draft: {
//     threading: [],
//     tieup: [],
//     treadling: [],
//   },
// };

function view() {
  return html` <div class="toolbar"><span>weavescape</span></div>
    <div class="page-content">
      <div id="drafting-pane">
        <div class="draft-layout">
          <div class="warp-color">warp color</div>
          <div></div>
          <div></div>
          <div class="threading">threading</div>
          <div class="tie-up">tieup</div>
          <div></div>
          <div class="chart">draft</div>
          <div class="treadling">treadling</div>
          <div class="weft-color">weft color</div>
        </div>
      </div>
      <div id="sim-pane"></div>
    </div>`;
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
}

window.onload = init;
