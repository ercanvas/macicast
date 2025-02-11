import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/stream-management',
    name: 'StreamManagement',
    component: () => import('../views/StreamManagement.vue')
  },
  // ...other routes...
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
