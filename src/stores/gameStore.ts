import { computed, reactive, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

import {
  calculateGhostBlocks,
  createInitialState,
  getDropInterval,
  getPieceBlocks,
  hardDrop,
  holdPiece,
  resetState,
  softDrop,
  tick,
  tryMove,
  tryRotate,
} from '@/game/engine';
import { BOARD_WIDTH, BUFFER_ROWS, VISIBLE_ROWS } from '@/game/constants';
import type { GameAction, GameStatistics, GameStatus, RenderCell } from '@/game/types';
import type { TetrominoKey } from '@/game/tetrominoes';
import { useSettingsStore } from './settingsStore';

const BEST_SCORE_KEY = 'tetris-best-score';

function loadBestScore(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  const raw = window.localStorage.getItem(BEST_SCORE_KEY);
  return raw ? Number(raw) || 0 : 0;
}

function persistBestScore(score: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(BEST_SCORE_KEY, String(score));
}

export const useGameStore = defineStore('game', () => {
  const settingsStore = useSettingsStore();
  const initialBestScore = loadBestScore();
  const state = reactive(createInitialState(initialBestScore));
  const { ghostPieceEnabled, hardDropEnabled } = storeToRefs(settingsStore);

  const status = computed(() => state.status);
  const queuePreview = computed(() => state.queue.slice(0, 5));
  const ghostBlocks = computed(() => (ghostPieceEnabled.value ? calculateGhostBlocks(state) : []));

  const visibleMatrix = computed<RenderCell[][]>(() => {
    const rows: RenderCell[][] = [];

    const ghostMap = new Map<string, TetrominoKey | null>();
    ghostBlocks.value.forEach((block) => {
      ghostMap.set(`${block.x}:${block.y}`, state.activePiece?.id ?? null);
    });

    const activeMap = new Map<string, TetrominoKey | null>();
    if (state.activePiece) {
      getPieceBlocks(state.activePiece).forEach((block) => {
        activeMap.set(`${block.x}:${block.y}`, state.activePiece?.id ?? null);
      });
    }

    for (let displayRow = 0; displayRow < VISIBLE_ROWS; displayRow += 1) {
      const boardRow = displayRow - BUFFER_ROWS;
      const rowCells: RenderCell[] = [];
      for (let columnIndex = 0; columnIndex < BOARD_WIDTH; columnIndex += 1) {
        const key = `${columnIndex}:${boardRow}`;
        if (activeMap.has(key)) {
          rowCells.push({
            value: activeMap.get(key) ?? null,
            isActive: true,
            isGhost: false,
          });
          continue;
        }
        const hasGhost = ghostMap.has(key);
        const playfieldValue = boardRow >= 0 ? state.playfield[boardRow][columnIndex] : null;
        if (hasGhost && playfieldValue === null) {
          rowCells.push({
            value: ghostMap.get(key) ?? null,
            isActive: false,
            isGhost: true,
          });
          continue;
        }
        rowCells.push({ value: playfieldValue, isActive: false, isGhost: false });
      }
      rows.push(rowCells);
    }

    return rows;
  });

  const bestScore = ref(initialBestScore);

  watch(
    () => state.bestScore,
    (value) => {
      if (value > bestScore.value) {
        bestScore.value = value;
        persistBestScore(value);
      }
    },
  );

  let frameId: number | null = null;
  let lastTimestamp = 0;
  let accumulator = 0;

  function startLoop(): void {
    if (typeof window === 'undefined' || frameId !== null) {
      return;
    }
    lastTimestamp = window.performance.now();
    frameId = window.requestAnimationFrame(step);
  }

  function stopLoop(): void {
    if (typeof window === 'undefined' || frameId === null) {
      return;
    }
    window.cancelAnimationFrame(frameId);
    frameId = null;
  }

  function step(timestamp: number): void {
    if (state.status !== 'running') {
      stopLoop();
      return;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const interval = getDropInterval(state.level);
    accumulator += delta;

    if (accumulator >= interval) {
      accumulator = 0;
      tick(state);
      const statusAfterTick = state.status as GameStatus;
      if (statusAfterTick === 'over') {
        stopLoop();
        return;
      }
    }

    frameId = window.requestAnimationFrame(step);
  }

  function start(): void {
    const previousBest = state.bestScore;
    resetState(state, previousBest);
    state.status = 'running';
    accumulator = 0;
    startLoop();
  }

  function pause(): void {
    if (state.status !== 'running') {
      return;
    }
    state.status = 'paused';
    stopLoop();
  }

  function resume(): void {
    if (state.status !== 'paused') {
      return;
    }
    state.status = 'running';
    startLoop();
  }

  function reset(): void {
    const previousBest = Math.max(state.bestScore, bestScore.value);
    resetState(state, previousBest);
    state.status = 'idle';
    stopLoop();
  }

  function handleAction(action: GameAction): void {
    switch (action) {
      case 'pause':
        pause();
        return;
      case 'resume':
        if (state.status === 'paused') {
          resume();
        }
        return;
      default:
        break;
    }

    if (state.status !== 'running') {
      return;
    }

    const statusBeforeAction = state.status;
    let acted = false;

    switch (action) {
      case 'move-left':
        acted = tryMove(state, { x: -1, y: 0 });
        break;
      case 'move-right':
        acted = tryMove(state, { x: 1, y: 0 });
        break;
      case 'soft-drop':
        acted = softDrop(state);
        accumulator = 0;
        break;
      case 'hard-drop':
        if (hardDropEnabled.value) {
          hardDrop(state);
          accumulator = 0;
          acted = true;
        }
        break;
      case 'rotate-cw':
        acted = tryRotate(state, 'cw');
        break;
      case 'rotate-ccw':
        acted = tryRotate(state, 'ccw');
        break;
      case 'rotate-180':
        acted = tryRotate(state, '180');
        break;
      case 'hold':
        acted = holdPiece(state);
        accumulator = 0;
        break;
      default:
        break;
    }

    if (!acted) {
      return;
    }

    if (state.status !== statusBeforeAction && state.status === 'over') {
      stopLoop();
    }
  }

  const isIdle = computed(() => state.status === 'idle');
  const isRunning = computed(() => state.status === 'running');
  const isPaused = computed(() => state.status === 'paused');
  const isGameOver = computed(() => state.status === 'over');

  const statistics = computed<GameStatistics>(() => ({
    score: state.score,
    bestScore: bestScore.value,
    level: state.level,
    lines: state.lines,
    lastClearedLines: state.lastClearedLines,
  }));

  const activePiece = computed(() => state.activePiece);
  const holdPieceState = computed(() => state.hold);
  const playfield = computed(() => state.playfield);

  return {
    status,
    queuePreview,
    visibleMatrix,
    statistics,
    activePiece,
    holdPiece: holdPieceState,
    playfield,
    ghostBlocks,
    isIdle,
    isRunning,
    isPaused,
    isGameOver,
    start,
    pause,
    resume,
    reset,
    handleAction,
  };
});
