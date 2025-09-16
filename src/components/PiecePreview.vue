<script setup lang="ts">
import { computed } from 'vue';

import { TETROMINO_COLORS } from '@/game/constants';
import { TETROMINOES, type TetrominoKey } from '@/game/tetrominoes';

const props = withDefaults(
  defineProps<{
    piece: TetrominoKey | null;
    label?: string;
    size?: 'small' | 'medium';
  }>(),
  {
    size: 'medium',
  },
);

const cells = computed(() => {
  if (!props.piece) {
    return new Set<string>();
  }
  const blocks = TETROMINOES[props.piece].rotations[0];
  const minX = Math.min(...blocks.map((block) => block.x));
  const maxX = Math.max(...blocks.map((block) => block.x));
  const minY = Math.min(...blocks.map((block) => block.y));
  const maxY = Math.max(...blocks.map((block) => block.y));

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const offsetX = Math.floor((4 - width) / 2) - minX;
  const offsetY = Math.floor((4 - height) / 2) - minY;

  return new Set(blocks.map((block) => `${block.x + offsetX}:${block.y + offsetY}`));
});

const color = computed(() => (props.piece ? TETROMINO_COLORS[props.piece] : '#2d3348'));

const filledCells = computed(() => cells.value);

function isFilled(index: number): boolean {
  const x = index % 4;
  const y = Math.floor(index / 4);
  return filledCells.value.has(`${x}:${y}`);
}
</script>

<template>
  <div class="piece-preview" :class="[`piece-preview--${size}`]">
    <header v-if="label" class="piece-preview__header">
      <span>{{ label }}</span>
    </header>
    <div class="piece-preview__grid" :style="{ '--preview-color': color }">
      <div
        v-for="index in 16"
        :key="index"
        class="piece-preview__cell"
        :class="{ 'piece-preview__cell--filled': piece && isFilled(index - 1) }"
      ></div>
      <span v-if="!piece" class="piece-preview__empty">--</span>
    </div>
  </div>
</template>

<style scoped>
.piece-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #a9b4d0;
  gap: 0.5rem;
}

.piece-preview__header {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6d7aa0;
}

.piece-preview__grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 2px;
  background: rgba(19, 27, 49, 0.65);
  border-radius: 10px;
  padding: clamp(0.3rem, 1vw, 0.4rem);
  box-shadow: inset 0 0 0 1px rgba(101, 130, 200, 0.18);
}

.piece-preview__cell {
  width: clamp(12px, 2vw, 18px);
  height: clamp(12px, 2vw, 18px);
  border-radius: 4px;
  background: rgba(38, 48, 75, 0.7);
}

.piece-preview__cell--filled {
  background: var(--preview-color);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.piece-preview__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  color: #4f5875;
}

.piece-preview--small .piece-preview__grid {
  transform: scale(0.88);
}
</style>
