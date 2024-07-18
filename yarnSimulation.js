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

export function initializeSim(simCanvas, draft) {
  const yarnPalette = GLOBAL_STATE.yarnPalette.map((hex) => {
    let [r, g, b] = hexToRgb(hex);
    return [r / 255, g / 255, b / 255];
  });
  const yarnDiameter = parseFloat(
    document.getElementById("input-yarn-diameter").value
  );

  const { drawdown, warpColorSequence: warp, weftColorSequence: weft } = draft;

  const nodes = initializeGrid(drawdown[0].length, drawdown.length);

  const warpYarns = warp.map((yarn, index) => warpPath(index, drawdown, nodes));
  const weftYarns = weft.map((yarn, index) => weftPath(index, drawdown, nodes));
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

  function r() {
    yarnRenderer.draw();
    requestAnimationFrame(r);
  }

  r();
}
