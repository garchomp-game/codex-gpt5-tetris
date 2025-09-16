export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const SPAWN_POSITION_X = 3;
export const SPAWN_POSITION_Y = -2;
export const BUFFER_ROWS = 1;
export const VISIBLE_ROWS = BOARD_HEIGHT + BUFFER_ROWS;

export const LINES_PER_LEVEL = 10;

export const LEVEL_SPEEDS_MS: number[] = [1000, 793, 618, 473, 355, 262, 190, 135, 94, 64];

export const LINE_CLEAR_POINTS: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const SOFT_DROP_POINTS = 1;
export const HARD_DROP_POINTS = 2;

export const QUEUE_MIN_LENGTH = 5;

export const TETROMINO_COLORS: Record<string, string> = {
  I: '#7de7f9',
  O: '#f9e86f',
  T: '#c38bff',
  S: '#7dfa9f',
  Z: '#ff7d7d',
  J: '#869bff',
  L: '#ffb46d',
};
