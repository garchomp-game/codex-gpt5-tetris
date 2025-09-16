import { computed, reactive, watch } from 'vue';
import { defineStore } from 'pinia';

interface SettingsState {
  ghostPieceEnabled: boolean;
  hardDropEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  touchControls: boolean;
  jkRotationReversed: boolean;
}

const STORAGE_KEY = 'tetris-settings';

const DEFAULT_SETTINGS: SettingsState = {
  ghostPieceEnabled: true,
  hardDropEnabled: true,
  musicVolume: 0.6,
  sfxVolume: 0.7,
  muted: false,
  touchControls: true,
  jkRotationReversed: false,
};

function loadSettings(): SettingsState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('Failed to load settings', error);
    return { ...DEFAULT_SETTINGS };
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const state = reactive<SettingsState>(loadSettings());

  watch(
    state,
    (value) => {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
    { deep: true },
  );

  const ghostPieceEnabled = computed(() => state.ghostPieceEnabled);
  const hardDropEnabled = computed(() => state.hardDropEnabled);
  const musicVolume = computed(() => (state.muted ? 0 : state.musicVolume));
  const sfxVolume = computed(() => (state.muted ? 0 : state.sfxVolume));

  const isMuted = computed(() => state.muted);
  const touchControls = computed(() => state.touchControls);
  const jkRotationReversed = computed(() => state.jkRotationReversed);

  function toggleMute(): void {
    state.muted = !state.muted;
  }

  function updateMusicVolume(volume: number): void {
    state.musicVolume = clamp(volume, 0, 1);
  }

  function updateSfxVolume(volume: number): void {
    state.sfxVolume = clamp(volume, 0, 1);
  }

  function toggleGhostPiece(): void {
    state.ghostPieceEnabled = !state.ghostPieceEnabled;
  }

  function toggleHardDrop(): void {
    state.hardDropEnabled = !state.hardDropEnabled;
  }

  function toggleTouchControls(): void {
    state.touchControls = !state.touchControls;
  }

  function toggleJkRotation(): void {
    state.jkRotationReversed = !state.jkRotationReversed;
  }

  return {
    ghostPieceEnabled,
    hardDropEnabled,
    musicVolume,
    sfxVolume,
    isMuted,
    touchControls,
    jkRotationReversed,
    toggleMute,
    updateMusicVolume,
    updateSfxVolume,
    toggleGhostPiece,
    toggleHardDrop,
    toggleTouchControls,
    toggleJkRotation,
  };
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
