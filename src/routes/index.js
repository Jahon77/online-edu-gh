// 导入需要的模块
import { createRouter, createWebHashHistory } from 'vue-router';
import homeView from '../views/login.vue'
import CourseList from '../views/CourseList.vue'
import CourseDetail from '../views/CourseDetail.vue'


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
        path: '/courses', 
        name: 'CourseList',
        component: CourseList 
    },
    { 
        path: '/courses/:id', 
        name: 'CourseDetail', 
        component: CourseDetail,
        props: true 
    },
    {
        path: '/course',
        name: 'CoursePage',
        component: ()=> import('../views/CoursePage.vue')
    },
    {
        path: '/create',
        name: 'create',
        component: ()=> import('../views/CreateCourse.vue')
    },
    {
        path: '/teacherCourseList',
        name: 'teacherCourseList',
        component: ()=> import('../views/TeacherCourseList.vue')
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
    }
];


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router; 