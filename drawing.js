function drawGrid(ctx, cellSize, width, height) {
  ctx.beginPath();

  for (let y = 0; y < height; y++) {
    const yVal = y * cellSize - 0.5;
    ctx.moveTo(0, yVal);
    ctx.lineTo(width * cellSize, yVal);
  }

  for (let x = 0; x < width; x++) {
    const xVal = x * cellSize - 0.5;
    ctx.moveTo(xVal, 0);
    ctx.lineTo(xVal, height * cellSize);
  }

  ctx.stroke();
}

export function drawBitmap(canvas, arrayData, cellSize) {
  const ctx = canvas.getContext("2d");

  const height = arrayData.length;
  const width = arrayData[0].length;

  canvas.height = height * cellSize;
  canvas.width = width * cellSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = arrayData[y][x];
      if (val === 0) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "black";
      }

      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  ctx.lineStyle = "black";
  ctx.lineWidth = 1;

  drawGrid(ctx, cellSize, width, height);
}

export function drawWarp(canvas, sequence, cellSize) {
  const ctx = canvas.getContext("2d");

  const width = sequence.length;

  canvas.height = cellSize;
  canvas.width = width * cellSize;

  for (let x = 0; x < width; x++) {
    ctx.fillStyle = sequence[x];

    ctx.fillRect(x * cellSize, 0, cellSize, cellSize);
  }

  ctx.lineStyle = "black";
  ctx.lineWidth = 1;

  drawGrid(ctx, cellSize, width, 1);
}

export function drawWeft(canvas, sequence, cellSize) {
  const ctx = canvas.getContext("2d");

  const height = sequence.length;

  canvas.height = height * cellSize;
  canvas.width = cellSize;

  for (let y = 0; y < height; y++) {
    ctx.fillStyle = sequence[y];

    ctx.fillRect(0, y * cellSize, cellSize, cellSize);
  }

  ctx.lineStyle = "black";
  ctx.lineWidth = 1;

  drawGrid(ctx, cellSize, 1, height);
}

function getWarpColor(draft, x) {
  const warpColor = draft.warpColorSequence[x % draft.warpColorSequence.length];
  return warpColor;
}

function getWeftColor(draft, x) {
  const weftColor = draft.weftColorSequence[x % draft.weftColorSequence.length];
  return weftColor;
}

export function drawDrawdown(canvas, draft, cellSize) {
  const ctx = canvas.getContext("2d");

  const width = draft.threading[0].length;
  const height = draft.treadling.length;

  canvas.height = height * cellSize;
  canvas.width = width * cellSize;

  draft.treadling.forEach((row, i) => {
    let combined = new Array(draft.threading[0].length).fill(0);

    row.forEach((cell, j) => {
      if (cell === 1) {
        // if treadling cell is on, get correspondin tie-up column
        draft.tieUp[j].forEach((tuCell, k) => {
          if (tuCell === 1) {
            // if tie-up cell is on, get corresponding threading row
            draft.threading[k].forEach((thread, x) => {
              if (thread === 1) {
                combined[x] = 1;
              }
            })
          }
        })
      }
    })

    combined.forEach((cell, x) => {
      if (cell === 1) {
        ctx.fillStyle = getWeftColor(draft, i);
        ctx.fillRect(x * cellSize, i * cellSize, cellSize, cellSize);
      } else {
        ctx.fillStyle = getWarpColor(draft, x);
        ctx.fillRect(x * cellSize, i * cellSize, cellSize, cellSize);
      }
    })
  })

  drawGrid(ctx, cellSize, width, height);
}
