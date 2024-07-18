import { GLOBAL_STATE, dispatch } from "./state";
import { html } from "lit-html";
import { drawAll } from "./drawing";
import { getRandomColor, shuffle } from "./utils";

function deleteColor(index) {
  const { draft, yarnPalette } = GLOBAL_STATE;

  if (yarnPalette.length == 1) {
    alert("you need some color in your life");
    return;
  }

  const newPalette = yarnPalette.filter((color, i) => i != index);

  const newWarp = draft.warpColorSequence.map((bit) => {
    if (bit == index) return 0;
    if (bit > index) return bit - 1;
    return bit;
  });
  const newWeft = draft.weftColorSequence.map((bit) => {
    if (bit == index) return 0;
    if (bit > index) return bit - 1;
    return bit;
  });

  draft.weftColorSequence = newWeft;
  draft.warpColorSequence = newWarp;
  GLOBAL_STATE.yarnPalette = newPalette;
  drawAll();
}

function editYarnColor(e, index) {
  GLOBAL_STATE.yarnPalette[index] = e.target.value;
  drawAll();
}

function addRandomYarn() {
  GLOBAL_STATE.yarnPalette.push(getRandomColor());
}

function shufflePalette() {
  GLOBAL_STATE.yarnPalette = [...shuffle(GLOBAL_STATE.yarnPalette)];

  drawAll();
}

function randomizePalette() {
  GLOBAL_STATE.yarnPalette = Array.from(
    Array(GLOBAL_STATE.yarnPalette.length),
    () => getRandomColor()
  );

  drawAll();
}

export function yarnPicker() {
  return html`<div id="yarn-picker">
    <label>Yarns</label>
    <div>
      <button
        class="btn icon ${GLOBAL_STATE.editingPalette ? "selected" : ""}"
        @click=${() => {
          GLOBAL_STATE.editingPalette = !GLOBAL_STATE.editingPalette;
        }}>
        <i class="fa-solid fa-pen"></i>
      </button>
      <button class="btn icon" @click=${() => addRandomYarn()}>
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
    ${GLOBAL_STATE.yarnPalette.map(
      (hex, index) =>
        html`<button
          class="btn solid color-select ${index == GLOBAL_STATE.activeYarn
            ? "selected"
            : ""}"
          @click=${() => dispatch({ activeYarn: index })}>
          <div class="color-label">${index + 1}</div>
          <div class="color-preview" style="--current: ${hex};">
            ${GLOBAL_STATE.editingPalette
              ? html`
                  <button
                    class="delete-color-button"
                    @click=${() => deleteColor(index)}>
                    <i class="fa-solid fa-circle-xmark"></i>
                  </button>
                  <input
                    class="color-input"
                    type="color"
                    value="${hex}"
                    @change=${(e) => editYarnColor(e, index)} />
                  <div class="edit-color-icon">
                    <i class="fa-solid fa-pen"></i>
                  </div>
                `
              : ""}
          </div>
        </button>`
    )}

    <div>
      <button class="btn icon" @click=${() => shufflePalette()}>
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
      <button class="btn icon" @click=${() => randomizePalette()}>
        <i class="fa-solid fa-dice"></i>
      </button>
    </div>
  </div>`;
}
