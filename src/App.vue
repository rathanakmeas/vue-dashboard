<template>
    <ErrorBoundary>
        <router-view />
    </ErrorBoundary>
    <Toast position="top-right" />
</template>

<script setup>
import Toast from 'primevue/toast';
import ErrorBoundary from './components/ErrorBoundary.vue';
</script>
