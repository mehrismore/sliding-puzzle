export const GRID_SIZE = 3;
export const BLOCK_COUNT = GRID_SIZE * GRID_SIZE;

export const SOLVED_BOARD = Array.from({ length: BLOCK_COUNT }, (_, index) =>
  index === BLOCK_COUNT - 1 ? 0 : index + 1
);

export const DOG_IMAGE_URL = "/dog.jpg";

export const BLOCK_SIZE = 72;
export const BLOCK_GAP = 12;

export const BOARD_SIZE = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE - 1) * BLOCK_GAP;
