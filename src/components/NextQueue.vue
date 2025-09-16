<script setup lang="ts">
import PiecePreview from './PiecePreview.vue';
import type { TetrominoKey } from '@/game/tetrominoes';

defineProps<{
  queue: TetrominoKey[];
}>();
</script>

<template>
  <section class="next-queue">
    <h2 class="next-queue__title">Next</h2>
    <ul class="next-queue__list">
      <li v-for="(piece, index) in queue" :key="`${piece}-${index}`">
        <PiecePreview :piece="piece" size="small" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.next-queue {
  background: rgba(18, 25, 44, 0.9);
  border-radius: 16px;
  padding: clamp(0.85rem, 2vw, 1.1rem);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  box-shadow: inset 0 0 0 1px rgba(82, 98, 150, 0.25);
}

.next-queue__title {
  margin: 0;
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6d7aa0;
}

.next-queue__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
}

.next-queue__list li {
  display: flex;
  justify-content: center;
}
</style>
