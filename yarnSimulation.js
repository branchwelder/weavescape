import { GLOBAL_STATE } from "./state";
import { yarnRenderer } from "./yarnRenderer";
import { hexToRgb } from "./utils";

export let staleDrawdown = false;

const yarnDiameter = 1;
const yarnRadius = yarnDiameter / 2;

const spacingFactor = 1.3;
const nodeSpacing = yarnDiameter * spacingFactor;

function initializeGrid(width, height) {
  const nodes = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      nodes.push({
        pos: [x * nodeSpacing, (height - y) * nodeSpacing, 0],
        f: [0, 0],
        v: [0, 0],
      });
    }
  }
  return nodes;
}

function warpPath(col, drawDown, nodes) {
  const path = [];
  const width = drawDown[0].length;
  const height = drawDown.length;

  const [fx, fy, fz] = nodes[col].pos;
  path.push(fx, fy + 2, fz);
  path.push(fx, fy + 1, fz);

  for (let row = 0; row < height; row++) {
    const [x, y, z] = nodes[width * row + col].pos;

    if (drawDown[row][col] == 1) {
      path.push(x, y, z - yarnRadius);
    } else {
      path.push(x, y, z + yarnRadius);
    }
  }

  const [lx, ly, lz] = nodes[width * (height - 1) + col].pos;
  path.push(lx, ly - 1, lz);
  path.push(lx, ly - 2, lz);

  return path;
}

function weftPath(row, drawDown, nodes) {
  const path = [];
  const width = drawDown[0].length;

  const [fx, fy, fz] = nodes[width * row].pos;
  path.push(fx - 2, fy, fz);
  path.push(fx - 1, fy, fz);

  for (let col = 0; col < width; col++) {
    const [x, y, z] = nodes[width * row + col].pos;

    if (drawDown[row][col] == 0) {
      path.push(x, y, z - yarnRadius);
    } else {
      path.push(x, y, z + yarnRadius);
    }
  }

  const [lx, ly, lz] = nodes[width * row + width - 1].pos;
  path.push(lx + 1, ly, lz);
  path.push(lx + 2, ly, lz);

  return path;
}

function computeSwatchFit() {
  const { cellSize } = GLOBAL_STATE;

  const canvas = document.getElementById("drawdown");
  const container = document.getElementById("drawdown-container");

  const containerRepeatSize = [
    Math.max(
      canvas.width / cellSize,
      Math.floor(container.offsetWidth / cellSize) - 1
    ),
    Math.max(
      canvas.height / cellSize,
      Math.floor(container.offsetHeight / cellSize) - 1
    ),
  ];

  return containerRepeatSize;
}

function repeatArray(arr, length) {
  let result = [];
  let i = 0;

  while (result.length < length) {
    result.push(arr[i]);
    i = (i + 1) % arr.length; // Loop back to the start of the array
  }

  return result;
}

function buildSwatchData() {
  const { draft, cellSize } = GLOBAL_STATE;

  const dims = computeSwatchFit();

  const ddHeight = draft.drawdown.length;
  const ddWidth = draft.drawdown[0].length;

  let swatch = [];

  for (let y = 0; y < dims[1]; y++) {
    const row = Array(dims[0]);
    for (let x = 0; x < dims[0]; x++) {
      row[dims[0] - 1 - x] =
        draft.drawdown[y % ddHeight][ddWidth - 1 - (x % ddWidth)];
    }
    swatch.push(row);
  }

  const warp = repeatArray(draft.warpColorSequence, dims[0]);

  const weft = repeatArray(draft.weftColorSequence, dims[1]);

  return { swatch, warp, weft };
}

export function initializeSim(simCanvas, draft) {
  if (GLOBAL_STATE.stopSim) {
    GLOBAL_STATE.stopSim();
    GLOBAL_STATE.stopSim = null;
  }

  const yarnPalette = GLOBAL_STATE.yarnPalette.map((hex) => {
    let [r, g, b] = hexToRgb(hex);
    return [r / 255, g / 255, b / 255];
  });
  const yarnDiameter = parseFloat(
    document.getElementById("input-yarn-diameter").value
  );

  const { swatch, warp, weft } = buildSwatchData(draft);

  const nodes = initializeGrid(swatch[0].length, swatch.length);

  const warpYarns = warp.map((yarn, index) => warpPath(index, swatch, nodes));
  const weftYarns = weft.map((yarn, index) => weftPath(index, swatch, nodes));
  const yarnData = [];

  warpYarns.forEach((pointArray, index) => {
    const yarnIndex = warp[index];
    yarnData.push({
      // yarnIndex: yarnIndex,
      pts: pointArray,
      diameter: yarnDiameter,
      color: yarnPalette[yarnIndex],
    });
  });

  weftYarns.forEach((pointArray, index) => {
    const yarnIndex = weft[index];
    yarnData.push({
      // yarnIndex: yarnIndex,
      pts: pointArray,
      diameter: yarnDiameter,
      color: yarnPalette[yarnIndex],
    });
  });

  yarnRenderer.init(yarnData, simCanvas);

  let stopped = false;

  function r() {
    if (stopped) return;
    yarnRenderer.draw();
    requestAnimationFrame(r);
  }

  r();

  function stop() {
    stopped = true;
  }

  GLOBAL_STATE.stopSim = stop;
}
