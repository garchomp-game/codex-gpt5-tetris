<script setup lang="ts">
import { computed } from 'vue';

import type { GameAction } from '@/game/types';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    hardDropEnabled?: boolean;
    isRunning?: boolean;
    isPaused?: boolean;
  }>(),
  {
    disabled: false,
    hardDropEnabled: true,
    isRunning: false,
    isPaused: false,
  },
);

const emit = defineEmits<{ action: [GameAction] }>();

function send(action: GameAction): void {
  if (props.disabled) {
    return;
  }
  emit('action', action);
}

function togglePause(): void {
  if (props.isRunning) {
    send('pause');
  } else if (props.isPaused) {
    send('resume');
  }
}

const pauseLabel = computed(() => {
  if (props.isRunning) {
    return 'Pause';
  }
  if (props.isPaused) {
    return 'Resume';
  }
  return 'Paused';
});

const pauseDisabled = computed(() => props.disabled || (!props.isRunning && !props.isPaused));
</script>

<template>
  <div class="control-panel">
    <div class="control-panel__row">
      <button type="button" @click="send('hold')">Hold</button>
      <button type="button" @click="send('rotate-ccw')">⟲</button>
      <button type="button" @click="send('rotate-cw')">⟳</button>
    </div>
    <div class="control-panel__row">
      <button type="button" @click="send('move-left')">←</button>
      <button type="button" @click="send('soft-drop')">↓</button>
      <button type="button" @click="send('move-right')">→</button>
    </div>
    <div class="control-panel__row">
      <button type="button" @click="send('rotate-180')">180°</button>
      <button type="button" :disabled="!hardDropEnabled" @click="send('hard-drop')">
        Hard Drop
      </button>
      <button type="button" :disabled="pauseDisabled" @click="togglePause()">
        {{ pauseLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: rgba(12, 18, 33, 0.92);
  padding: clamp(0.85rem, 2vw, 1.1rem);
  border-radius: 20px;
  box-shadow: inset 0 0 0 1px rgba(74, 92, 150, 0.28);
}

.control-panel__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

button {
  min-height: clamp(56px, 7vh, 64px);
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  font-weight: 600;
  background: linear-gradient(135deg, rgba(70, 105, 226, 0.85), rgba(120, 78, 235, 0.95));
  border: none;
  border-radius: 14px;
  color: #fff;
  box-shadow: 0 6px 16px rgba(49, 64, 128, 0.45);
}

button:disabled {
  background: rgba(70, 105, 226, 0.3);
  color: rgba(255, 255, 255, 0.6);
  box-shadow: none;
}

@media (max-width: 480px) {
  .control-panel {
    padding: 1rem;
  }

  .control-panel__row {
    gap: 0.5rem;
  }

  button {
    min-height: 60px;
    border-radius: 16px;
  }
}
</style>
