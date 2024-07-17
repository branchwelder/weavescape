import { GLOBAL_STATE, dispatch } from "./state";
import jscolor from "@eastdesire/jscolor";
import { html } from "lit-html";
import { getRandomColor, shuffle } from "./utils";

function deleteColor(index) {
  if (GLOBAL_STATE.yarnPalette.length == 1) {
    alert("you need some color in your life");
    return;
  }
  const newPalette = GLOBAL_STATE.yarnPalette.filter((color, i) => i != index);

  const newBitmap = GLOBAL_STATE.yarnSequence.pixels.map((bit) => {
    if (bit == index) return 0;
    if (bit > index) return bit - 1;
    return bit;
  });

  dispatch({
    yarnPalette: newPalette,
    yarnSequence: new Bimp(
      GLOBAL_STATE.yarnSequence.width,
      GLOBAL_STATE.yarnSequence.height,
      newBitmap
    ),
  });
}

function editColor(index) {
  const target = document.getElementById(`color-${index}`);
  if (!target.jscolor) {
    const picker = new jscolor(target, {
      preset: "dark large",
      format: "hexa",
      value: GLOBAL_STATE.yarnPalette[index],
      onInput: () => {
        const newPalette = [...GLOBAL_STATE.yarnPalette];
        newPalette[index] = picker.toRGBAString();
        dispatch({
          yarnPalette: newPalette,
          yarnSequence: GLOBAL_STATE.yarnSequence,
        });
      },
      previewElement: null,
    });
  }
  target.jscolor.show();
}

export function yarnPicker() {
  return html`<div id="yarn-picker">
    <label>Yarns</label>
    <div>
      <button
        class="btn icon ${GLOBAL_STATE.editingPalette ? "selected" : ""}"
        @click=${() =>
          dispatch({ editingPalette: !GLOBAL_STATE.editingPalette })}>
        <i class="fa-solid fa-pen"></i>
      </button>
      <button
        class="btn icon"
        @click=${() => {
          let newPalette = [...GLOBAL_STATE.yarnPalette];
          newPalette.push(getRandomColor());
          dispatch({ yarnPalette: newPalette });
        }}>
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
    ${GLOBAL_STATE.yarnPalette.map(
      (hexa, index) =>
        html`<button
          class="btn solid color-select ${index == GLOBAL_STATE.activeYarn
            ? "selected"
            : ""}"
          @click=${() => dispatch({ activeYarn: index })}>
          <div class="color-label">${index + 1}</div>
          <div class="color-preview" style="--current: ${hexa};">
            ${GLOBAL_STATE.editingPalette
              ? html`
                  <button
                    class="delete-color-button"
                    @click=${() => deleteColor(index)}>
                    <i class="fa-solid fa-circle-xmark"></i>
                  </button>
                  <button
                    id="color-${index}"
                    class="edit-color-btn"
                    @click=${(e) => editColor(index)}></button>
                  <div
                    class="edit-color-icon"
                    @click=${(e) => editColor(index)}>
                    <i class="fa-solid fa-pen"></i>
                  </div>
                `
              : ""}
          </div>
        </button>`
    )}

    <div>
      <button
        class="btn icon"
        @click=${() => {
          dispatch({
            yarnPalette: [...shuffle(GLOBAL_STATE.yarnPalette)],
          });
        }}>
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
      <button
        class="btn icon"
        @click=${() => {
          dispatch({
            yarnPalette: Array.from(
              Array(GLOBAL_STATE.yarnPalette.length),
              () => getRandomColor()
            ),
          });
        }}>
        <i class="fa-solid fa-dice"></i>
      </button>
    </div>
  </div>`;
}
