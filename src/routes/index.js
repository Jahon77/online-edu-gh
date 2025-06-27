// �����Ҫ��ģ��
import { createRouter, createWebHashHistory } from 'vue-router';
import homeView from '../views/login.vue'



const routes = [
    {
        path: '/',
        name: 'login',
        component: homeView
    },
    {
        path: '/login',
        name: 'login',
        component: ()=> import('../views/login.vue')
    },
    {
        path: '/index',
        name: 'index',
        component: ()=> import('../views/index.vue')
    },
    {
        path: '/notice',
        name: 'notice',
        component: ()=> import('../views/notice.vue')
    },
    {
        path: '/use',
        name: 'use',
        component: ()=> import('../views/use.vue')
    },
    {
        path: '/about',
        name: 'about',
        component: ()=> import('../views/about.vue')
    },
    {
        path: '/chat',
        name: 'chat',
        component: ()=> import('../views/chat.vue')
    },
    {
        path: '/admin/home',
        component: () => import('@/views/admin/admin_home.vue')
    }
];


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
