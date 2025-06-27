// �����Ҫ��ģ��
import { createRouter, createWebHashHistory } from 'vue-router';
import homeView from '../views/login.vue'
import Index from '../views/index.vue'
import Login from '../views/login.vue'
import About from '../views/about.vue'
import Use from '../views/use.vue'
import Notice from '../views/notice.vue'
import Chat from '../views/chat.vue'
import FaceTest from '../views/FaceTest.vue'

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
        component: Index
    },
    {
        path: '/notice',
        name: 'notice',
        component: Notice
    },
    {
        path: '/use',
        name: 'use',
        component: Use
    },
    {
        path: '/about',
        name: 'about',
        component: About
    },
    {
        path: '/chat',
        name: 'chat',
        component: Chat
    },
    {
        path: '/face-test',
        name: 'face-test',
        component: FaceTest
    }
];


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
