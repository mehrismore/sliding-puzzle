import {
  DOG_IMAGE_URL,
  GRID_SIZE,
  SOLVED_BOARD,
  BLOCK_GAP,
  DEFAULT_BLOCK_SIZE,
} from "../puzzleConstants";

export const getNeighborIndices = (index: number) => {
  const neighbors: number[] = [];
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  if (row > 0) neighbors.push(index - GRID_SIZE);
  if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
  if (col > 0) neighbors.push(index - 1);
  if (col < GRID_SIZE - 1) neighbors.push(index + 1);

  return neighbors;
};

export const canSlideBlock = (emptyIndex: number, targetIndex: number) =>
  getNeighborIndices(emptyIndex).includes(targetIndex);

export const generateShuffledBoard = (): number[] => {
  const board = [...SOLVED_BOARD];

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const emptyIndex = board.indexOf(0);
    const neighbors = getNeighborIndices(emptyIndex);
    const swapIndex = neighbors[Math.floor(Math.random() * neighbors.length)];

    [board[emptyIndex], board[swapIndex]] = [
      board[swapIndex],
      board[emptyIndex],
    ];
  }

  const solved = board.every((value, index) => value === SOLVED_BOARD[index]);

  if (solved) {
    return generateShuffledBoard();
  }

  return board;
};

export const isSolvedBoard = (board: number[]) =>
  board.every((value, index) => value === SOLVED_BOARD[index]);

export const createBlockBackground = (value: number) => {
  if (value === 0) return undefined;

  const solvedIndex = value - 1;
  const row = Math.floor(solvedIndex / GRID_SIZE);
  const col = solvedIndex % GRID_SIZE;
  const denominator = GRID_SIZE - 1;

  const backgroundPositionX =
    denominator === 0 ? "50%" : `${(col / denominator) * 100}%`;
  const backgroundPositionY =
    denominator === 0 ? "50%" : `${(row / denominator) * 100}%`;

  return {
    backgroundImage: `url(${DOG_IMAGE_URL})`,
    backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
    backgroundPosition: `${backgroundPositionX} ${backgroundPositionY}`,
    backgroundRepeat: "no-repeat",
  };
};

export const getBlockPosition = (
  index: number,
  blockSize: number = DEFAULT_BLOCK_SIZE
) => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  return {
    x: col * (blockSize + BLOCK_GAP),
    y: row * (blockSize + BLOCK_GAP),
  };
};
