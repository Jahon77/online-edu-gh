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
        path: '/admin',
        component: () => import('@/views/admin/admin_layout.vue'),
        children: [
            {
                path: 'home',
                component: () => import('@/views/admin/admin_home.vue')
            },
            {
                path: 'teacher',
                component: () => import('@/views/admin/teacher.vue')
            },
            {
                path: 'student',
                component: () => import('@/views/admin/student.vue')
            },
            {
                path: 'course',
                component: () => import('@/views/admin/course.vue')
            },
            {
                path: 'chat',
                component: () => import('@/views/admin/chat.vue')
            }
        ]
    }
];


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
