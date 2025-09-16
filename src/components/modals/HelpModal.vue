<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  open: boolean;
  bindings: Array<{
    keysLabel: string;
    action: string;
  }>;
}>();
const isOpen = computed(() => props.open);
const shortcutItems = computed(() => props.bindings);
const emit = defineEmits(['close']);

function close(): void {
  emit('close');
}

function handleBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    close();
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal" role="dialog" aria-modal="true" aria-label="How to play">
    <div class="modal__backdrop" @click="handleBackdropClick">
      <section class="modal__content">
        <header class="modal__header">
          <h2>How to Play</h2>
          <button type="button" class="modal__close" aria-label="Close help" @click="close">
            ×
          </button>
        </header>
        <div class="modal__body">
          <p>
            Clear horizontal lines by stacking Tetromino blocks. Each cleared line grants points and
            advances the level, increasing fall speed.
          </p>
          <h3>Controls</h3>
          <ul class="shortcut-list">
            <li v-for="item in shortcutItems" :key="item.action">
              <span>{{ item.keysLabel }}</span>
              <span>{{ item.action }}</span>
            </li>
          </ul>
          <h3>Scoring</h3>
          <ul class="rules">
            <li>Single Line: 100 × level</li>
            <li>Double Line: 300 × level</li>
            <li>Triple Line: 500 × level</li>
            <li>Tetris (4 lines): 800 × level</li>
            <li>Soft Drop: +1 per cell</li>
            <li>Hard Drop: +2 per cell</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 10, 20, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.modal__content {
  position: relative;
  width: min(100%, 520px);
  max-height: min(90vh, 640px);
  background: rgba(12, 18, 33, 0.95);
  border-radius: 20px;
  padding: clamp(1.2rem, 3vw, 1.6rem);
  color: #d7e2ff;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(90, 120, 210, 0.2);
  overflow-y: auto;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal__header h2 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8ba4ff;
}

.modal__close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: clamp(0.9rem, 1vw + 0.7rem, 1rem);
  line-height: 1.6;
}

.shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.shortcut-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-family: 'Fira Code', monospace;
  background: rgba(20, 28, 49, 0.7);
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  box-shadow: inset 0 0 0 1px rgba(120, 140, 210, 0.2);
}

.rules {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.3rem;
}
</style>
