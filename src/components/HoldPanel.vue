<script setup lang="ts">
import PiecePreview from './PiecePreview.vue';
import type { TetrominoKey } from '@/game/tetrominoes';

defineProps<{
  piece: TetrominoKey | null;
  disabled?: boolean;
}>();
</script>

<template>
  <section class="hold-panel" :class="{ 'hold-panel--disabled': disabled }">
    <PiecePreview :piece="piece" label="Hold" />
  </section>
</template>

<style scoped>
.hold-panel {
  background: rgba(18, 25, 44, 0.9);
  border-radius: 16px;
  padding: clamp(0.85rem, 2vw, 1.1rem);
  box-shadow: inset 0 0 0 1px rgba(82, 98, 150, 0.2);
}

.hold-panel--disabled {
  opacity: 0.5;
}
</style>
