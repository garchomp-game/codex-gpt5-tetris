import type { GameAction } from './types';

export type ExtraControlAction = 'start' | 'toggle-pause';
export type ControlAction = GameAction | ExtraControlAction;

export interface ControlBinding {
  action: ControlAction;
  description: string;
  keys: string[];
  display: string[];
}

export interface ControlBindingOptions {
  swapJk?: boolean;
}

export function buildControlBindings(options: ControlBindingOptions = {}): ControlBinding[] {
  const rotateCcwLetters = options.swapJk ? ['k'] : ['j'];
  const rotateCwLetters = options.swapJk ? ['j'] : ['k'];

  const bindings: ControlBinding[] = [
    {
      action: 'move-left',
      description: 'Move Left',
      keys: ['ArrowLeft', 'a'],
      display: ['←', 'A'],
    },
    {
      action: 'move-right',
      description: 'Move Right',
      keys: ['ArrowRight', 'd'],
      display: ['→', 'D'],
    },
    {
      action: 'soft-drop',
      description: 'Soft Drop',
      keys: ['ArrowDown', 's'],
      display: ['↓', 'S'],
    },
    {
      action: 'hard-drop',
      description: 'Hard Drop',
      keys: [' '],
      display: ['Space'],
    },
    {
      action: 'rotate-ccw',
      description: 'Rotate Counter-Clockwise',
      keys: ['z', ...rotateCcwLetters],
      display: ['Z', ...(options.swapJk ? ['K'] : ['J'])],
    },
    {
      action: 'rotate-cw',
      description: 'Rotate Clockwise',
      keys: ['ArrowUp', 'x', ...rotateCwLetters],
      display: ['↑', 'X', ...(options.swapJk ? ['J'] : ['K'])],
    },
    {
      action: 'rotate-180',
      description: 'Rotate 180°',
      keys: ['c'],
      display: ['C'],
    },
    {
      action: 'hold',
      description: 'Hold Piece',
      keys: ['Shift'],
      display: ['Shift'],
    },
    {
      action: 'toggle-pause',
      description: 'Pause / Resume',
      keys: ['p', 'Escape'],
      display: ['P', 'Esc'],
    },
    {
      action: 'start',
      description: 'Start New Game',
      keys: ['Enter'],
      display: ['Enter'],
    },
  ];

  return bindings;
}

export function createKeyMap(bindings: ControlBinding[]): Record<string, ControlAction> {
  const map: Record<string, ControlAction> = {};
  for (const binding of bindings) {
    for (const key of binding.keys) {
      map[normalizeKey(key)] = binding.action;
    }
  }
  return map;
}

export function normalizeKey(key: string): string {
  if (key.length === 1) {
    return key.toLowerCase();
  }
  return key;
}
