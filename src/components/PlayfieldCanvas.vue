<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';

import { BOARD_WIDTH, TETROMINO_COLORS, VISIBLE_ROWS } from '@/game/constants';
import type { GameStatus, RenderCell } from '@/game/types';

const props = defineProps<{
  matrix: RenderCell[][];
  status: GameStatus;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let observer: ResizeObserver | null = null;
let pixelRatio = 1;
const cellSize = ref(32);

const overlayText = computed(() => {
  switch (props.status) {
    case 'idle':
      return 'Press Start';
    case 'paused':
      return 'Paused';
    case 'over':
      return 'Game Over';
    default:
      return '';
  }
});

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }
  pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  ctx = canvas.getContext('2d');
  setupResizeObserver();
  draw();
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

watch(
  () => props.matrix,
  () => {
    draw();
  },
  { deep: true },
);

watch(cellSize, () => {
  draw();
});

function setupResizeObserver(): void {
  if (typeof window === 'undefined' || !containerRef.value) {
    return;
  }
  observer = new ResizeObserver(() => {
    resizeCanvas();
  });
  observer.observe(containerRef.value);
  resizeCanvas();
}

function resizeCanvas(): void {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) {
    return;
  }
  const availableWidth = container.clientWidth;
  const availableHeight = container.clientHeight;
  const size = Math.max(
    14,
    Math.min(
      Math.floor(availableWidth / BOARD_WIDTH),
      availableHeight ? Math.floor(availableHeight / VISIBLE_ROWS) : Infinity,
    ),
  );

  cellSize.value = size;

  const width = BOARD_WIDTH * size;
  const height = VISIBLE_ROWS * size;

  container.style.height = `${height}px`;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);

  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(pixelRatio, pixelRatio);
  }

  draw();
}

function draw(): void {
  const canvas = canvasRef.value;
  if (!ctx || !canvas) {
    return;
  }

  const width = BOARD_WIDTH * cellSize.value;
  const height = VISIBLE_ROWS * cellSize.value;

  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawCells();
  drawGrid();
}

function drawBackground(width: number, height: number): void {
  const gradient = ctx!.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#151d2d');
  gradient.addColorStop(1, '#10192a');
  ctx!.fillStyle = gradient;
  ctx!.fillRect(0, 0, width, height);
}

function drawCells(): void {
  const size = cellSize.value;
  props.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      const startX = x * size;
      const startY = y * size;
      if (cell.value) {
        const color = TETROMINO_COLORS[cell.value];
        ctx!.fillStyle = cell.isGhost ? withAlpha(color, 0.25) : color;
        ctx!.fillRect(startX + 1, startY + 1, size - 2, size - 2);

        if (!cell.isGhost) {
          ctx!.strokeStyle = withAlpha('#ffffff', 0.25);
          ctx!.lineWidth = 1;
          ctx!.strokeRect(startX + 1, startY + 1, size - 2, size - 2);
        }
      } else {
        ctx!.fillStyle = 'rgba(24, 32, 56, 0.35)';
        ctx!.fillRect(startX + 1, startY + 1, size - 2, size - 2);
      }
    });
  });
}

function drawGrid(): void {
  const size = cellSize.value;
  ctx!.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx!.lineWidth = 1;

  for (let x = 0; x <= BOARD_WIDTH; x += 1) {
    ctx!.beginPath();
    ctx!.moveTo(x * size, 0);
    ctx!.lineTo(x * size, VISIBLE_ROWS * size);
    ctx!.stroke();
  }

  for (let y = 0; y <= VISIBLE_ROWS; y += 1) {
    ctx!.beginPath();
    ctx!.moveTo(0, y * size);
    ctx!.lineTo(BOARD_WIDTH * size, y * size);
    ctx!.stroke();
  }
}

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
</script>

<template>
  <div class="playfield" ref="containerRef">
    <canvas ref="canvasRef" aria-label="Tetris playfield"></canvas>
    <div v-if="status !== 'running'" class="playfield__overlay">
      <span>{{ overlayText }}</span>
    </div>
  </div>
</template>

<style scoped>
.playfield {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  box-shadow:
    0 24px 48px rgba(12, 18, 40, 0.65),
    inset 0 0 0 1px rgba(91, 115, 182, 0.25);
}

canvas {
  display: block;
  width: 100%;
  height: auto;
}

.playfield__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(6, 10, 22, 0.68);
  backdrop-filter: blur(6px);
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #edf2ff;
}

@media (max-width: 600px) {
  .playfield {
    border-radius: 16px;
  }
}
</style>
