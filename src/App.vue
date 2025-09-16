<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import GameView from '@/views/GameView.vue';
import HelpModal from '@/components/modals/HelpModal.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import { buildControlBindings } from '@/game/controlBindings';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';

const showSettings = ref(false);
const showHelp = ref(false);

const gameStore = useGameStore();
const settingsStore = useSettingsStore();
const { isIdle, isRunning, isPaused, isGameOver } = storeToRefs(gameStore);
const { jkRotationReversed } = storeToRefs(settingsStore);

const primaryActionLabel = computed(() => {
  if (isIdle.value || isGameOver.value) {
    return 'Start Game';
  }
  if (isRunning.value) {
    return 'Pause';
  }
  if (isPaused.value) {
    return 'Resume';
  }
  return 'Start';
});

const helpBindings = computed(() =>
  buildControlBindings({ swapJk: jkRotationReversed.value }).map((binding) => ({
    action: binding.description,
    keysLabel: binding.display.join(' / '),
  })),
);

function handlePrimaryAction(): void {
  if (isIdle.value || isGameOver.value) {
    gameStore.start();
    return;
  }
  if (isRunning.value) {
    gameStore.pause();
    return;
  }
  if (isPaused.value) {
    gameStore.resume();
  }
}

function openSettings(): void {
  showSettings.value = true;
}

function openHelp(): void {
  showHelp.value = true;
}
</script>

<template>
  <div class="app-shell">
    <aside class="app-shell__sidebar">
      <header class="app-shell__header">
        <h1>Tetris Nova</h1>
        <p>Stack, spin, and chase the perfect clear.</p>
      </header>
      <div class="app-shell__controls">
        <button type="button" @click="handlePrimaryAction">{{ primaryActionLabel }}</button>
        <button type="button" @click="gameStore.reset">Reset</button>
        <button type="button" @click="openSettings">Settings</button>
        <button type="button" @click="openHelp">Help</button>
      </div>
    </aside>
    <main class="app-shell__main">
      <GameView />
    </main>
    <SettingsModal :open="showSettings" @close="showSettings = false" />
    <HelpModal :open="showHelp" :bindings="helpBindings" @close="showHelp = false" />
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: minmax(220px, 300px) 1fr;
  gap: clamp(1.25rem, 2vw, 2rem);
  height: 100%;
  align-items: stretch;
}

.app-shell__sidebar {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.app-shell__header {
  background: rgba(11, 18, 35, 0.85);
  padding: clamp(1.1rem, 2vw, 1.8rem) clamp(1rem, 2.3vw, 2.1rem);
  border-radius: 24px;
  box-shadow:
    0 20px 40px rgba(6, 10, 22, 0.45),
    inset 0 0 0 1px rgba(90, 120, 200, 0.2);
}

.app-shell__header h1 {
  margin: 0 0 0.4rem 0;
  font-size: clamp(1.9rem, 3vw, 2.5rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.app-shell__header p {
  margin: 0;
  color: rgba(198, 211, 255, 0.78);
  font-size: clamp(0.9rem, 1vw + 0.7rem, 1.05rem);
}

.app-shell__controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(0.6rem, 1.6vw, 0.9rem);
}

.app-shell__controls button {
  width: 100%;
  justify-self: stretch;
  min-height: clamp(46px, 7vh, 56px);
}

.app-shell__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 960px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .app-shell__sidebar {
    flex-direction: row;
    align-items: flex-start;
    gap: 1rem;
  }

  .app-shell__header {
    flex: 1 1 60%;
  }

  .app-shell__controls {
    flex: 1 1 40%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .app-shell__controls button {
    min-height: clamp(44px, 6vh, 54px);
  }
}

@media (max-width: 600px) {
  .app-shell__sidebar {
    flex-direction: column;
  }

  .app-shell__controls {
    grid-template-columns: 1fr;
  }

  .app-shell__controls button {
    min-height: 48px;
  }
}
</style>
