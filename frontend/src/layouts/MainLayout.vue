<template>
  <div class="flex h-screen">
    <aside class="w-64 bg-white shadow-md">
      <nav class="p-4 space-y-2">
        <RouterLink class="block" to="/">Dashboard</RouterLink>
        <RouterLink class="block" to="/profile">Profile</RouterLink>
        <RouterLink class="block" to="/chatbot">Chatbot</RouterLink>
      </nav>
    </aside>
    <div class="flex-1 flex flex-col">
      <header class="bg-white shadow p-4">Cloudflare Worker Template</header>
      <main class="p-4 overflow-y-auto flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>
