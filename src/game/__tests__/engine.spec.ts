import { describe, expect, it } from 'vitest';

import { createInitialState, hardDrop, softDrop, tryMove } from '@/game/engine';
import { BOARD_HEIGHT, BOARD_WIDTH, SOFT_DROP_POINTS } from '@/game/constants';

describe('game engine', () => {
  it('creates an initialized state with active piece and queued pieces', () => {
    const state = createInitialState();

    expect(state.playfield).toHaveLength(BOARD_HEIGHT);
    expect(state.playfield[0]).toHaveLength(BOARD_WIDTH);
    expect(state.activePiece).toBeTruthy();
    expect(state.queue.length).toBeGreaterThanOrEqual(5);
  });

  it('moves the piece left when space is free', () => {
    const state = createInitialState();
    const originalX = state.activePiece!.position.x;

    const moved = tryMove(state, { x: -1, y: 0 });

    expect(moved).toBe(true);
    expect(state.activePiece!.position.x).toBe(originalX - 1);
  });

  it('awards points on soft drop', () => {
    const state = createInitialState();
    const initialScore = state.score;
    const initialY = state.activePiece!.position.y;

    const moved = softDrop(state);

    expect(moved).toBe(true);
    expect(state.activePiece!.position.y).toBe(initialY + 1);
    expect(state.score).toBe(initialScore + SOFT_DROP_POINTS);
  });

  it('hard drop locks the piece and yields score', () => {
    const state = createInitialState();
    const dropDistance = hardDrop(state);

    expect(dropDistance).toBeGreaterThan(0);
    const filledCells = state.playfield.flat().filter((cell) => cell !== null);
    expect(filledCells.length).toBeGreaterThan(0);
  });
});
