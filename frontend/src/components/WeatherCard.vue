<template>
  <div class="p-4 bg-white rounded shadow">
    <h3 class="font-bold">Weather in {{ message.data.city }}</h3>
    <p>{{ message.data.temp }}°C and {{ message.data.description }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ message: { data: { city: string; temp: number; description: string } } }>();
</script>
