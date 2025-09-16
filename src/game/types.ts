import type { TetrominoKey, Vector2D } from './tetrominoes';

export type Cell = TetrominoKey | null;
export type Playfield = Cell[][];

export type GameStatus = 'idle' | 'running' | 'paused' | 'over';

export interface ActivePiece {
  id: TetrominoKey;
  rotationIndex: number;
  position: Vector2D;
}

export interface GameState {
  playfield: Playfield;
  activePiece: ActivePiece | null;
  queue: TetrominoKey[];
  hold: TetrominoKey | null;
  canHold: boolean;
  score: number;
  bestScore: number;
  level: number;
  lines: number;
  lastClearedLines: number;
  status: GameStatus;
}

export type RotationDirection = 'cw' | 'ccw' | '180';

export type GameAction =
  | 'move-left'
  | 'move-right'
  | 'soft-drop'
  | 'hard-drop'
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'rotate-180'
  | 'hold'
  | 'pause'
  | 'resume';

export interface GhostPiece {
  id: TetrominoKey;
  blocks: Vector2D[];
}

export interface RenderCell {
  value: TetrominoKey | null;
  isActive: boolean;
  isGhost: boolean;
}

export interface GameStatistics {
  score: number;
  bestScore: number;
  level: number;
  lines: number;
  lastClearedLines: number;
}
