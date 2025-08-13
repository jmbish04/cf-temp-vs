import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Profile from '../pages/Profile.vue';
import Chatbot from '../pages/Chatbot.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/profile', component: Profile },
  { path: '/chatbot', component: Chatbot }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
