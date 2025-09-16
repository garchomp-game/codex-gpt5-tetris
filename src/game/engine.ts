import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  HARD_DROP_POINTS,
  LINES_PER_LEVEL,
  LEVEL_SPEEDS_MS,
  LINE_CLEAR_POINTS,
  QUEUE_MIN_LENGTH,
  SOFT_DROP_POINTS,
  SPAWN_POSITION_X,
  SPAWN_POSITION_Y,
} from './constants';
import { createBag } from './randomizer';
import type { TetrominoKey, Vector2D } from './tetrominoes';
import { TETROMINOES } from './tetrominoes';
import type { ActivePiece, GameState, RotationDirection } from './types';

const BASIC_KICKS: Vector2D[] = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
];

const I_KICKS: Vector2D[] = [
  { x: 0, y: 0 },
  { x: -2, y: 0 },
  { x: 1, y: 0 },
  { x: -2, y: -1 },
  { x: 1, y: 2 },
];

export function createEmptyPlayfield(): (TetrominoKey | null)[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array<TetrominoKey | null>(BOARD_WIDTH).fill(null),
  );
}

export function createInitialState(bestScore = 0): GameState {
  const playfield = createEmptyPlayfield();
  const queue = createBag();

  const state: GameState = {
    playfield,
    activePiece: null,
    queue,
    hold: null,
    canHold: true,
    score: 0,
    bestScore,
    level: 1,
    lines: 0,
    lastClearedLines: 0,
    status: 'idle',
  };

  spawnNextPiece(state);
  return state;
}

export function resetState(state: GameState, bestScore = 0): void {
  const next = createInitialState(bestScore);
  Object.assign(state, next);
}

export function spawnNextPiece(state: GameState): boolean {
  ensureQueue(state);
  const next = state.queue.shift();
  if (!next) {
    return false;
  }

  const piece = createActivePiece(next);
  if (!canPlacePiece(piece, state.playfield)) {
    state.activePiece = piece;
    return false;
  }
  state.activePiece = piece;
  state.canHold = true;
  return true;
}

export function holdPiece(state: GameState): boolean {
  if (!state.activePiece || !state.canHold) {
    return false;
  }

  const current = state.activePiece.id;
  const hold = state.hold;
  state.canHold = false;
  if (hold) {
    const replacement = createActivePiece(hold);
    if (!canPlacePiece(replacement, state.playfield)) {
      state.status = 'over';
      state.activePiece = null;
      return false;
    }
    state.hold = current;
    state.activePiece = replacement;
    return true;
  }

  state.hold = current;
  const success = spawnNextPiece(state);
  if (!success) {
    state.activePiece = null;
    state.status = 'over';
  }
  return success;
}

export function tryMove(state: GameState, offset: Vector2D): boolean {
  if (!state.activePiece) {
    return false;
  }
  const candidate: ActivePiece = {
    ...state.activePiece,
    position: {
      x: state.activePiece.position.x + offset.x,
      y: state.activePiece.position.y + offset.y,
    },
  };

  if (canPlacePiece(candidate, state.playfield)) {
    state.activePiece = candidate;
    return true;
  }

  return false;
}

export function tryRotate(state: GameState, direction: RotationDirection): boolean {
  if (!state.activePiece) {
    return false;
  }

  const rotationDelta = direction === '180' ? 2 : direction === 'cw' ? 1 : -1;
  const nextRotation = (state.activePiece.rotationIndex + rotationDelta + 4) % 4;
  const kicks = state.activePiece.id === 'I' ? I_KICKS : BASIC_KICKS;

  for (const kick of kicks) {
    const candidate: ActivePiece = {
      id: state.activePiece.id,
      rotationIndex: nextRotation,
      position: {
        x: state.activePiece.position.x + kick.x,
        y: state.activePiece.position.y + kick.y,
      },
    };

    if (canPlacePiece(candidate, state.playfield)) {
      state.activePiece = candidate;
      return true;
    }
  }
  return false;
}

export function softDrop(state: GameState): boolean {
  const moved = tryMove(state, { x: 0, y: 1 });
  if (moved) {
    state.score += SOFT_DROP_POINTS;
  }
  return moved;
}

export function hardDrop(state: GameState): number {
  if (!state.activePiece) {
    return 0;
  }

  let distance = 0;
  while (tryMove(state, { x: 0, y: 1 })) {
    distance += 1;
  }
  if (distance > 0) {
    state.score += distance * HARD_DROP_POINTS;
  }
  lockPiece(state);
  return distance;
}

export function tick(state: GameState): boolean {
  if (!state.activePiece) {
    return false;
  }
  const moved = tryMove(state, { x: 0, y: 1 });
  if (!moved) {
    return lockPiece(state);
  }
  return true;
}

export function getDropInterval(level: number): number {
  if (level <= 0) {
    return LEVEL_SPEEDS_MS[0];
  }
  if (level > LEVEL_SPEEDS_MS.length) {
    return LEVEL_SPEEDS_MS[LEVEL_SPEEDS_MS.length - 1];
  }
  return LEVEL_SPEEDS_MS[level - 1];
}

export function calculateGhostBlocks(state: GameState): Vector2D[] {
  if (!state.activePiece) {
    return [];
  }
  const ghost: ActivePiece = {
    id: state.activePiece.id,
    rotationIndex: state.activePiece.rotationIndex,
    position: { ...state.activePiece.position },
  };

  while (
    canPlacePiece(
      { ...ghost, position: { x: ghost.position.x, y: ghost.position.y + 1 } },
      state.playfield,
    )
  ) {
    ghost.position = {
      x: ghost.position.x,
      y: ghost.position.y + 1,
    };
  }

  return getPieceBlocks(ghost);
}

export function getPieceBlocks(piece: ActivePiece): Vector2D[] {
  return TETROMINOES[piece.id].rotations[piece.rotationIndex].map((block) => ({
    x: block.x + piece.position.x,
    y: block.y + piece.position.y,
  }));
}

function lockPiece(state: GameState): boolean {
  if (!state.activePiece) {
    return false;
  }

  const blocks = getPieceBlocks(state.activePiece);
  let gameOver = false;

  blocks.forEach((block) => {
    if (block.y < 0) {
      gameOver = true;
      return;
    }
    state.playfield[block.y][block.x] = state.activePiece?.id ?? null;
  });

  const cleared = clearCompletedLines(state.playfield);
  state.lastClearedLines = cleared;
  if (cleared > 0) {
    const base = LINE_CLEAR_POINTS[cleared] ?? 0;
    state.score += base * state.level;
    state.lines += cleared;
    updateLevel(state);
  }
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
  }

  const spawned = spawnNextPiece(state);
  if (!spawned) {
    state.status = 'over';
    state.activePiece = null;
  }
  return !gameOver;
}

function clearCompletedLines(playfield: (TetrominoKey | null)[][]): number {
  let cleared = 0;
  for (let row = playfield.length - 1; row >= 0; row -= 1) {
    if (playfield[row].every((cell) => cell !== null)) {
      playfield.splice(row, 1);
      playfield.unshift(Array<TetrominoKey | null>(BOARD_WIDTH).fill(null));
      cleared += 1;
      row += 1;
    }
  }
  return cleared;
}

function updateLevel(state: GameState): void {
  const nextLevel = Math.min(LEVEL_SPEEDS_MS.length, Math.floor(state.lines / LINES_PER_LEVEL) + 1);
  state.level = Math.max(1, nextLevel);
}

function ensureQueue(state: GameState): void {
  while (state.queue.length < QUEUE_MIN_LENGTH) {
    state.queue.push(...createBag());
  }
}

function canPlacePiece(piece: ActivePiece, playfield: (TetrominoKey | null)[][]): boolean {
  const blocks = getPieceBlocks(piece);
  return blocks.every((block) => {
    if (block.x < 0 || block.x >= BOARD_WIDTH) {
      return false;
    }
    if (block.y >= BOARD_HEIGHT) {
      return false;
    }
    if (block.y < 0) {
      return true;
    }
    return playfield[block.y][block.x] === null;
  });
}

function createActivePiece(id: TetrominoKey): ActivePiece {
  return {
    id,
    rotationIndex: 0,
    position: { x: SPAWN_POSITION_X, y: SPAWN_POSITION_Y },
  };
}
