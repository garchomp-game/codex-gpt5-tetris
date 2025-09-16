<script setup lang="ts">
import { computed } from 'vue';

import type { GameStatus } from '@/game/types';
import type { GameStatistics } from '@/game/types';

const props = defineProps<{
  statistics: GameStatistics;
  status: GameStatus;
}>();

const statusMessage = computed(() => {
  switch (props.status) {
    case 'paused':
      return 'Paused';
    case 'over':
      return 'Game Over';
    case 'idle':
      return 'Ready';
    case 'running':
    default:
      return 'In Progress';
  }
});

const clearedInfo = computed(() =>
  props.statistics.lastClearedLines > 0 ? `${props.statistics.lastClearedLines} Lines!` : '--',
);
</script>

<template>
  <section class="status-panel">
    <header class="status-panel__header">
      <h2>Status</h2>
      <span class="status-panel__tag" :data-state="status">{{ statusMessage }}</span>
    </header>
    <dl class="status-panel__stats">
      <div>
        <dt>Score</dt>
        <dd>{{ statistics.score.toLocaleString() }}</dd>
      </div>
      <div>
        <dt>Best</dt>
        <dd>{{ statistics.bestScore.toLocaleString() }}</dd>
      </div>
      <div>
        <dt>Level</dt>
        <dd>{{ statistics.level }}</dd>
      </div>
      <div>
        <dt>Lines</dt>
        <dd>{{ statistics.lines }}</dd>
      </div>
      <div>
        <dt>Last Clear</dt>
        <dd>{{ clearedInfo }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.status-panel {
  background: rgba(18, 25, 44, 0.9);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.3rem) clamp(1.1rem, 2vw, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-shadow: inset 0 0 0 1px rgba(82, 98, 150, 0.25);
}

.status-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.status-panel__header h2 {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #6d7aa0;
}

.status-panel__tag {
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(97, 120, 203, 0.25);
  color: #c5d1ff;
}

.status-panel__tag[data-state='over'] {
  background: rgba(255, 116, 116, 0.3);
  color: #ffc5c5;
}

.status-panel__tag[data-state='paused'] {
  background: rgba(255, 207, 120, 0.3);
  color: #ffe9b0;
}

.status-panel__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.4rem;
  margin: 0;
}

.status-panel__stats div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

dt {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6d7aa0;
}

dd {
  margin: 0;
  font-size: clamp(1.15rem, 2vw, 1.35rem);
  font-weight: 600;
  color: #f5f7ff;
}

@media (max-width: 600px) {
  .status-panel__stats {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
}
</style>
