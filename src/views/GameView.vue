<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import ControlPanel from '@/components/ControlPanel.vue';
import HoldPanel from '@/components/HoldPanel.vue';
import NextQueue from '@/components/NextQueue.vue';
import PlayfieldCanvas from '@/components/PlayfieldCanvas.vue';
import StatusPanel from '@/components/StatusPanel.vue';
import { buildControlBindings, createKeyMap, normalizeKey } from '@/game/controlBindings';
import type { GameAction } from '@/game/types';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';

const gameStore = useGameStore();
const settingsStore = useSettingsStore();

const {
  visibleMatrix,
  queuePreview,
  statistics,
  holdPiece,
  status,
  isRunning,
  isPaused,
  isGameOver,
  isIdle,
} = storeToRefs(gameStore);

const { touchControls, hardDropEnabled, jkRotationReversed } = storeToRefs(settingsStore);

const controlBindings = computed(() => buildControlBindings({ swapJk: jkRotationReversed.value }));

const keyMap = computed(() => createKeyMap(controlBindings.value));

function handleKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null;
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
    return;
  }
  const action = keyMap.value[normalizeKey(event.key)];
  if (!action) {
    return;
  }
  event.preventDefault();

  if (action === 'start') {
    if (isIdle.value || isGameOver.value) {
      startGame();
    }
    return;
  }

  if (action === 'toggle-pause') {
    togglePause();
    return;
  }

  gameStore.handleAction(action);
}

function startGame(): void {
  gameStore.start();
}

function pauseGame(): void {
  gameStore.pause();
}

function resumeGame(): void {
  gameStore.resume();
}

function togglePause(): void {
  if (isRunning.value) {
    pauseGame();
  } else if (isPaused.value) {
    resumeGame();
  }
}

function forwardAction(action: GameAction): void {
  if (action === 'pause') {
    pauseGame();
    return;
  }
  if (action === 'resume') {
    resumeGame();
    return;
  }
  gameStore.handleAction(action);
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return;
  }
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  if (typeof window === 'undefined') {
    return;
  }
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <section class="game-view">
    <div class="game-view__layout">
      <div class="game-view__hold">
        <HoldPanel :piece="holdPiece" :disabled="!isRunning" />
      </div>
      <div class="game-view__board">
        <PlayfieldCanvas :matrix="visibleMatrix" :status="status" />
      </div>
      <aside class="game-view__info">
        <StatusPanel :statistics="statistics" :status="status" />
        <NextQueue :queue="queuePreview" />
      </aside>
    </div>
    <ControlPanel
      v-if="touchControls"
      class="game-view__control-panel"
      :disabled="!isRunning && !isPaused"
      :hard-drop-enabled="hardDropEnabled"
      :is-running="isRunning"
      :is-paused="isPaused"
      @action="forwardAction"
    />
  </section>
</template>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  gap: clamp(1.2rem, 2vw, 1.6rem);
  flex: 1;
  min-height: 0;
}

.game-view__layout {
  display: grid;
  grid-template-columns: minmax(110px, 150px) minmax(0, 1fr) minmax(220px, 280px);
  gap: clamp(0.9rem, 1.8vw, 1.4rem);
  min-height: 0;
  height: 100%;
  align-items: stretch;
}

.game-view__hold {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 0;
}

.game-view__board {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  max-width: clamp(360px, 62vw, 560px);
  min-height: 0;
}

.game-view__info {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.1rem);
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.3rem;
}

.game-view__control-panel {
  display: none;
}

@media (max-width: 1024px) {
  .game-view__layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    gap: 1rem;
  }

  .game-view__hold {
    justify-content: flex-start;
  }

  .game-view__info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    overflow: visible;
    padding-right: 0;
  }

  .game-view__control-panel {
    display: block;
  }
}

@media (max-width: 768px) {
  .game-view__control-panel {
    position: sticky;
    bottom: 0.5rem;
    z-index: 5;
  }
}

@media (max-width: 480px) {
  .game-view {
    gap: 0.9rem;
  }

  .game-view__board {
    margin: 0;
  }

  .game-view__control-panel {
    width: 100%;
    border-radius: 18px;
  }
}
</style>
