// 导入需要的模块
import { createRouter, createWebHashHistory } from 'vue-router';
import homeView from '../views/login.vue'

import Index from '../views/index.vue'
import Login from '../views/login.vue'
import About from '../views/about.vue'
import Use from '../views/use.vue'
import Notice from '../views/notice.vue'
import Chat from '../views/chat.vue'
<<<<<<< HEAD

import FaceTest from '../views/FaceTest.vue'
=======
//import FaceTest from '../views/FaceTest.vue'
>>>>>>> 172193e (学生课程与学生个人中心)
import CourseList from '../views/Course/CourseList.vue'
import CourseDetail from '../views/Course/CourseDetail.vue'
import StudentCenterCourseList from '@/views/Course/StudentCenterCourseList.vue'

const routes = [
    {
        path: '/',
        name: 'root',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            requiresAuth: false
        }
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
        path: '/courses/filter',
        name: 'CourseFilterPage',
        component: () => import('../views/Course/CourseFilterPage.vue')
    },
    {
        path: '/student/video/:lessonId',
        name: 'StudentCoursePlayer',
        component: () => import('../views/Course/StudentCoursePlayer.vue'),
        props: route => ({
            lessonId: Number(route.params.lessonId),
            courseId: Number(route.query.courseId),
            studentId: Number(route.query.studentId || 1)
        })
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: ()=> import('../views/Course/Dashboard.vue')
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
        path: '/teacher/question-manager/:courseId',
        name: 'questionManager',
        component: ()=> import('../views/QuestionManager.vue')
    },
    {
        path: '/teacher/student-management',
        name: 'studentManagement',
        component: ()=> import('../views/StudentManagement.vue')
    },
    {
        path: '/teacher/comment-management',
        name: 'commentManagement',
        component: ()=> import('../views/CommentManagement.vue')
    },
    {
        path: '/teacher/course-draft-box',
        name: 'courseDraftBox',
        component: ()=> import('../views/CourseDraftBox.vue')
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
        path: '/aichat',
        name: 'aichat',
        meta: {
            requiresAuth: true
        },
        component: ()=> import('../views/aichat.vue')
    },
    // {
    //     path: '/face-test',
    //     name: 'face-test',
    //     component: FaceTest
    // },
    {
<<<<<<< HEAD
        path: '/face-test',
        name: 'face-test',
        component: FaceTest
    },
    {
        path: '/chat-test',
        component: () => import('../views/chatTest.vue'),
        name: 'ChatTest',
        
    },
    {
        path: '/chat',
        name: 'Chat',
        component: Chat,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/survey-text',
        name: 'SurveyText',
        component: () => import('../views/survey_text.vue'),
        meta: {
            requiresAuth: true
        }
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
            },
            {
                path: 'log',
                component: () => import('@/views/admin/log.vue')
            },
            {
                path: 'setting',
                component: () => import('@/views/admin/setting.vue')
            },
            {
                path: 'notice',
                component: () => import('@/views/admin/notice.vue')
            }
        ]
=======
        path: '/course/list',
        name: 'StudentCenterCourseList',
        component: StudentCenterCourseList
>>>>>>> 172193e (学生课程与学生个人中心)
    }
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

// 修改路由守卫
router.beforeEach((to, from, next) => {
    // 如果目标路由是登录页，直接放行
    if (to.path === '/login') {
        next();
        return;
    }
    
    // 检查页面是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
    
    // 如果页面不需要认证，直接放行
    if (!requiresAuth) {
        next();
        return;
    }
    
    // 检查用户是否已登录
    const token = document.cookie.split('; ').find(row => row.startsWith('satoken='));
    const username = document.cookie.split('; ').find(row => row.startsWith('username='));
    
    if (token && username) {
        // 已登录，放行
        next();
    } else {
        // 未登录，重定向到登录页面
        console.log('用户未登录，重定向到登录页面');
        next('/login');
    }
});

export default router; 