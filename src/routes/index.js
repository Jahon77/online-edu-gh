// 导入需要的模块
import { createRouter, createWebHashHistory } from 'vue-router';
import homeView from '../views/login.vue'

import Index from '../views/index.vue'
import Login from '../views/login.vue'
import About from '../views/about.vue'
import Use from '../views/use.vue'
import Notice from '../views/notice.vue'
import Chat from '../views/chat.vue'
// import FaceTest from '../views/FaceTest.vue'
import CourseList from '../views/Course/CourseList.vue'
import CourseDetail from '../views/Course/CourseDetail.vue'


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
        path: '/courses/explore',
        name: 'CoursePage',
        component: ()=> import('../views/Course/CoursePage.vue')
    },
    {
        path: '/teacher/create',
        name: 'create',
        component: ()=> import('../views/CreateCourse.vue')
    },
    {
        path: '/teacher/courseList',
        name: 'teacherCourseList',
        component: ()=> import('../views/TeacherCourseList.vue')
    },
    {
        path: '/teacher/edit-course/:id',
        name: 'editCourse',
        component: ()=> import('../views/EditCourse.vue')
    },
    {
        path: '/teacher/student-management',
        name: 'studentManagement',
        component: ()=> import('../views/StudentManagement.vue')
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
        //component: ()=> import('../views/chat.vue')
    },
    // {
    //     path: '/face-test',
    //     name: 'face-test',
    //     component: FaceTest
    // },
    // {
    //     path: '/admin',
    //     component: () => import('@/views/admin/admin_layout.vue'),
    //     children: [
    //         {
    //             path: 'home',
    //             component: () => import('@/views/admin/admin_home.vue')
    //         },
    //         {
    //             path: 'teacher',
    //             component: () => import('@/views/admin/teacher.vue')
    //         },
    //         {
    //             path: 'student',
    //             component: () => import('@/views/admin/student.vue')
    //         },
    //         {
    //             path: 'course',
    //             component: () => import('@/views/admin/course.vue')
    //         },
    //         {
    //             path: 'chat',
    //             component: () => import('@/views/admin/chat.vue')
    //         }
    //     ]
    // }
];


const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router; 