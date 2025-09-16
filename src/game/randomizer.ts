import { TETROMINO_KEYS } from './tetrominoes';
import type { TetrominoKey } from './tetrominoes';

export type RandomGenerator = () => number;

export function createBag(generator: RandomGenerator = Math.random): TetrominoKey[] {
  const bag = [...TETROMINO_KEYS];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(generator() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}
