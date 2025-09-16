<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useSettingsStore } from '@/stores/settingsStore';

defineProps<{ open: boolean }>();
const emit = defineEmits(['close']);

const settingsStore = useSettingsStore();
const {
  ghostPieceEnabled,
  hardDropEnabled,
  touchControls,
  isMuted,
  musicVolume,
  sfxVolume,
  jkRotationReversed,
} = storeToRefs(settingsStore);

function close(): void {
  emit('close');
}

function handleBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    close();
  }
}

function onMusicVolumeChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  settingsStore.updateMusicVolume(Number(target.value));
}

function onSfxVolumeChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  settingsStore.updateSfxVolume(Number(target.value));
}
</script>

<template>
  <div v-if="open" class="modal" role="dialog" aria-modal="true" aria-label="Settings">
    <div class="modal__backdrop" @click="handleBackdropClick">
      <section class="modal__content">
        <header class="modal__header">
          <h2>Settings</h2>
          <button type="button" class="modal__close" @click="close" aria-label="Close settings">
            ×
          </button>
        </header>
        <div class="modal__body">
          <div class="setting">
            <label class="setting__label">
              <input
                type="checkbox"
                :checked="ghostPieceEnabled"
                @change="settingsStore.toggleGhostPiece"
              />
              Ghost Piece
            </label>
            <p class="setting__caption">Toggle the translucent landing preview.</p>
          </div>
          <div class="setting">
            <label class="setting__label">
              <input
                type="checkbox"
                :checked="hardDropEnabled"
                @change="settingsStore.toggleHardDrop"
              />
              Hard Drop
            </label>
            <p class="setting__caption">Disable to prevent instant drops.</p>
          </div>
          <div class="setting">
            <label class="setting__label">
              <input
                type="checkbox"
                :checked="jkRotationReversed"
                @change="settingsStore.toggleJkRotation"
              />
              Swap J/K Rotation
            </label>
            <p class="setting__caption">
              When enabled, J rotates clockwise and K rotates counter-clockwise.
            </p>
          </div>
          <div class="setting">
            <label class="setting__label">
              <input
                type="checkbox"
                :checked="touchControls"
                @change="settingsStore.toggleTouchControls"
              />
              Touch Controls
            </label>
            <p class="setting__caption">Show mobile friendly controls below the board.</p>
          </div>
          <div class="setting">
            <label class="setting__label">
              <input type="checkbox" :checked="isMuted" @change="settingsStore.toggleMute" />
              Mute All Audio
            </label>
          </div>
          <div class="setting">
            <label class="setting__label setting__label--slider" for="music-volume"
              >Music Volume</label
            >
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="musicVolume"
              @input="onMusicVolumeChange"
            />
          </div>
          <div class="setting">
            <label class="setting__label setting__label--slider" for="sfx-volume"
              >Effects Volume</label
            >
            <input
              id="sfx-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="sfxVolume"
              @input="onSfxVolumeChange"
            />
          </div>
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
  z-index: 1000;
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(6, 12, 24, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.modal__content {
  position: relative;
  width: min(100%, 420px);
  max-height: min(88vh, 560px);
  background: rgba(12, 18, 33, 0.95);
  border-radius: 20px;
  padding: clamp(1.1rem, 3vw, 1.5rem);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(90, 120, 210, 0.2);
  color: #d7e2ff;
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
}

.setting {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.setting__label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  font-size: clamp(0.9rem, 1vw + 0.6rem, 1rem);
}

.setting__label--slider {
  justify-content: space-between;
}

.setting__caption {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(186, 199, 238, 0.7);
}

input[type='range'] {
  width: 100%;
  accent-color: #869bff;
}
</style>
