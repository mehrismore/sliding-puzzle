export const GRID_SIZE = 3;
export const BLOCK_COUNT = GRID_SIZE * GRID_SIZE;

export const SOLVED_BOARD = Array.from({ length: BLOCK_COUNT }, (_, index) =>
  index === BLOCK_COUNT - 1 ? 0 : index + 1
);

export const DOG_IMAGE_URL = "/dog.jpg";

export const BLOCK_GAP = 12;
export const MIN_BLOCK_SIZE = 68;
export const DEFAULT_BLOCK_SIZE = 96;
export const MAX_BLOCK_SIZE = 140;
export const BOARD_HORIZONTAL_PADDING = 32;
export const BOARD_MAX_EDGE = 520;
