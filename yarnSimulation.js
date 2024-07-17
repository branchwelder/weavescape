import { yarnRenderer } from "./yarnRenderer";

const yarnDiameter = 1;

function initializeGrid(width, height) {
  const nodes = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      nodes.push({
        pos: [x, y, 0],
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
  path.push(fx - 2, fy, fz);
  path.push(fx - 1, fy, fz);

  for (let row = 0; row < height; row++) {
    const [x, y, z] = nodes[width * row + col].pos;

    if (drawDown[row][col] == 1) {
      path.push(x, y, z + yarnDiameter / 2);
    } else {
      path.push(x, y, z - yarnDiameter / 2);
    }
  }

  const [lx, ly, lz] = nodes[width * (height - 1) + col].pos;
  path.push(lx + 1, ly, lz);
  path.push(lx + 2, ly, lz);

  return path;
}

function weftPath(row, drawDown, nodes) {
  const path = [];
  const width = drawDown[0].length;

  const [fx, fy, fz] = nodes[width * row].pos;
  path.push(fx, fy - 2, fz);
  path.push(fx, fy - 1, fz);

  for (let col = 0; col < width; col++) {
    const [x, y, z] = nodes[width * row + col].pos;

    if (drawDown[row][col] == 0) {
      path.push(x, y, z + yarnDiameter / 2);
    } else {
      path.push(x, y, z - yarnDiameter / 2);
    }
  }

  const [lx, ly, lz] = nodes[width * row + width - 1].pos;
  path.push(lx, ly + 1, lz);
  path.push(lx, ly + 2, lz);

  return path;
}

export function initializeSim(simCanvas) {
  const yarnPalette = [
    [0.9, 0.5, 0.3],
    [0.6, 0.7, 0.3],
    [0.3, 0.1, 0.95],
    [0.9, 0.2, 0.3],
  ];

  const warp = [0, 0, 1, 1, 0, 0, 1, 1];
  const weft = [2, 2, 2, 2, 3, 3, 3, 3];

  const drawdown = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 1],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
  ];

  const nodes = initializeGrid(drawdown[0].length, drawdown.length);

  const warpYarns = warp.map((yarn, index) => warpPath(index, drawdown, nodes));
  const weftYarns = weft.map((yarn, index) => weftPath(index, drawdown, nodes));
  const yarnData = [];

  warpYarns.forEach((pointArray, index) => {
    const yarnIndex = warp[index];
    yarnData.push({
      yarnIndex: yarnIndex,
      pts: pointArray,
      diameter: yarnDiameter,
      color: yarnPalette[yarnIndex],
    });
  });

  weftYarns.forEach((pointArray, index) => {
    const yarnIndex = weft[index];
    yarnData.push({
      yarnIndex: yarnIndex,
      pts: pointArray,
      diameter: yarnDiameter,
      color: yarnPalette[yarnIndex],
    });
  });

  console.log(yarnData);
  yarnRenderer.init(yarnData, simCanvas);
  yarnRenderer.draw();
}
