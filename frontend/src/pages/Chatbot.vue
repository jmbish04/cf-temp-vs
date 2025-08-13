<template>
  <div class="flex flex-col h-full max-h-screen">
    <div class="flex-1 overflow-y-auto space-y-2">
      <div v-for="m in messages" :key="m.id" class="p-2 rounded" :class="m.role === 'user' ? 'text-right bg-blue-100' : 'bg-gray-100'">
        <component :is="resolveComponent(m)" :message="m" />
      </div>
    </div>
    <form @submit.prevent="handleSubmit" class="flex gap-2">
      <input v-model="input" class="flex-1 border rounded p-2" />
      <button class="px-4 py-2 bg-blue-600 text-white rounded" :disabled="isLoading">Send</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useChat } from 'ai/vue';
import WeatherCard from '../components/WeatherCard.vue';

const { messages, input, handleSubmit, isLoading } = useChat({ api: '/api/chat' });

function resolveComponent(m: import('ai/vue').Message & { component?: string }) {
  if (m.component === 'weather-card') return WeatherCard;
  return 'p';
}
</script>
