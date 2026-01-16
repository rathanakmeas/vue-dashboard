<template>
  <div class="skeleton-wrapper">
    <div v-if="variant === 'card'" class="skeleton-card">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton-content">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    </div>

    <div v-else-if="variant === 'table'" class="skeleton-table">
      <div class="skeleton skeleton-table-header"></div>
      <div v-for="n in rows" :key="n" class="skeleton-table-row">
        <div class="skeleton skeleton-cell"></div>
        <div class="skeleton skeleton-cell"></div>
        <div class="skeleton skeleton-cell"></div>
        <div class="skeleton skeleton-cell short"></div>
      </div>
    </div>

    <div v-else-if="variant === 'detail'" class="skeleton-detail">
      <div class="skeleton skeleton-header"></div>
      <div class="skeleton-grid">
        <div v-for="n in 6" :key="n" class="skeleton-field">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-input"></div>
        </div>
      </div>
    </div>

    <div v-else-if="variant === 'list'" class="skeleton-list">
      <div v-for="n in rows" :key="n" class="skeleton-list-item">
        <div class="skeleton skeleton-circle"></div>
        <div class="skeleton-list-content">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>
    </div>

    <div v-else class="skeleton-default">
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line short"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'table', 'detail', 'list'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  }
});
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Card Skeleton */
.skeleton-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.skeleton-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-title {
  height: 24px;
  width: 60%;
}

.skeleton-text {
  height: 16px;
  width: 100%;
}

.skeleton-text.short {
  width: 70%;
}

/* Table Skeleton */
.skeleton-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.skeleton-table-header {
  height: 48px;
  margin-bottom: 1px;
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.skeleton-cell {
  height: 20px;
}

.skeleton-cell.short {
  width: 60%;
}

/* Detail Skeleton */
.skeleton-detail {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.skeleton-header {
  height: 32px;
  width: 40%;
  margin-bottom: 2rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.skeleton-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-label {
  height: 14px;
  width: 40%;
}

.skeleton-input {
  height: 40px;
}

/* List Skeleton */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-list-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Default Skeleton */
.skeleton-default {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.skeleton-line {
  height: 20px;
}

.skeleton-line.short {
  width: 60%;
}
</style>
