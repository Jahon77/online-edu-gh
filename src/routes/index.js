// 导入需要的模块
import { createRouter, createWebHashHistory } from 'vue-router';
import homeView from '../views/login.vue'

import Index from '../views/index.vue'
import Login from '../views/login.vue'
import About from '../views/about.vue'
import Use from '../views/use.vue'
import Notice from '../views/notice.vue'
import Chat from '../views/chat.vue'
import { getCookie } from '../utils/authUtils';

import FaceTest from '../views/FaceTest.vue'

//import FaceTest from '../views/FaceTest.vue'
import CourseList from '../views/Course/CourseList.vue'
import CourseDetail from '../views/Course/CourseDetail.vue'
import StudentCenterCourseList from '@/views/Course/StudentCenterCourseList.vue'

const routes = [
    {
        path: '/',
        name: 'root',
        redirect: '/index'
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
        component: Index,
        meta: {
            requiresAuth: false
        }
    },
    { 
        path: '/courses', 
        name: 'CourseList',
        component: CourseList,
        meta: {
            requiresAuth: true,
            roles: [1]
        }
    },
    { 
        path: '/courses/:id', 
        name: 'CourseDetail', 
        component: CourseDetail,
        props: true,
        meta: {
            requiresAuth: true,
            roles: [1]
        }
    },
    {
        path: '/courses/explore',
        name: 'CoursePage',
        component: ()=> import('../views/Course/CoursePage.vue'),
        meta: {
            requiresAuth: true,
            roles: [1]
        }
    },
    {
        path: '/courses/filter',
        name: 'CourseFilterPage',
        component: () => import('../views/Course/CourseFilterPage.vue'),
        meta: {
            requiresAuth: true,
            roles: [1]
        }
    },
    {
        path: '/student/video/:lessonId',
        name: 'StudentCoursePlayer',
        component: () => import('../views/Course/StudentCoursePlayer.vue'),
        props: route => ({
            lessonId: Number(route.params.lessonId),
            courseId: Number(route.query.courseId),
            studentId: Number(route.query.studentId || 1)
        }),
        meta: {
            requiresAuth: true,
            roles: [1] // 学生和管理员可访问
        }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: ()=> import('../views/Course/Dashboard.vue'),
        meta: {
            requiresAuth: true,
            roles: [1] 
        }
    },
    {
        path: '/teacher/create',
        name: 'create',
        component: ()=> import('../views/CreateCourse.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/teacher/courseList',
        name: 'teacherCourseList',
        component: ()=> import('../views/TeacherCourseList.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/teacher/edit-course/:id',
        name: 'editCourse',
        component: ()=> import('../views/EditCourse.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/teacher/question-manager/:courseId',
        name: 'questionManager',
        component: ()=> import('../views/QuestionManager.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/teacher/student-management',
        name: 'studentManagement',
        component: ()=> import('../views/StudentManagement.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/teacher/comment-management',
        name: 'commentManagement',
        component: ()=> import('../views/CommentManagement.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/teacher/course-draft-box',
        name: 'courseDraftBox',
        component: ()=> import('../views/CourseDraftBox.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/teacher/profile',
        name: 'teacherProfile',
        component: ()=> import('../views/TeacherProfile.vue'),
        meta: {
            requiresAuth: true,
            roles: [2] // 教师和管理员可访问
        }
    },
    {
        path: '/forum',
        name: 'forum',
        component: ()=> import('../views/Forum.vue')
    },
    {
        path: '/forum/post/:id',
        name: 'forumPostDetail',
        component: ()=> import('../views/ForumPostDetail.vue')
    },
    {
        path: '/forum/profile',
        name: 'forumProfile',
        component: ()=> import('../views/ForumProfile.vue')
    },
    {
        path: '/forum/notifications',
        name: 'forumNotifications',
        component: ()=> import('../views/ForumNotifications.vue')
    },
    {
        path: '/notice',
        name: 'notice',
        component: Notice,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/use',
        name: 'use',
        component: Use,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/about',
        name: 'about',
        component: About,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/aichat',
        name: 'aichat',
        meta: {
            requiresAuth: true,
            roles: [1, 2, 3]
        },
        component: ()=> import('../views/aichat.vue')
    },
    // {
    //     path: '/face-test',
    //     name: 'face-test',
    //     component: FaceTest
    // },
    {
        path: '/face-test',
        name: 'face-test',
        component: FaceTest,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/chat-test',
        component: () => import('../views/chatTest.vue'),
        name: 'ChatTest',
        meta: {
            requiresAuth: true,
            roles: [1, 2, 3] // 所有登录用户可访问
        }
    },
    {
        path: '/chat',
        name: 'Chat',
        component: Chat,
        meta: {
            requiresAuth: true,
            roles: [1, 2, 3] // 所有登录用户可访问
        }
    },
    {
        path: '/survey-text',
        name: 'SurveyText',
        component: () => import('../views/survey_text.vue'),
        meta: {
            requiresAuth: true,
            roles: [1, 2, 3] // 所有登录用户可访问
        }
    },
    {
        path: '/admin',
        component: () => import('@/views/admin/admin_layout.vue'),
        meta: {
            requiresAuth: true,
            roles: [3] // 只有管理员可访问
        },
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
            },
            {
                path: 'teacherDetail/:id',
                component: () => import('@/views/admin/teacher_detail.vue')
            },
            {
                path: 'studentDetail/:id',
                component: () => import('@/views/admin/student_detail.vue')
            },
            {
                path: 'courseDetail/:id',
                component: () => import('@/views/admin/course_detail.vue')
            }
        ]
    },
    {  
        path: '/course/list',
        name: 'StudentCenterCourseList',
        component: StudentCenterCourseList,
        meta: {
            requiresAuth: true,
            roles: [1] 
        }
    },
    {
        path: '/unauthorized',
        name: 'Unauthorized',
        component: () => import('../views/Unauthorized.vue'),
        meta: {
            requiresAuth: false
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 获取用户角色
    const userRole = parseInt(getCookie('role'));
    
    // 如果页面需要认证
    if (to.meta.requiresAuth) {
        // 检查是否已登录
        const token = getCookie('satoken');
        if (!token) {
            // 未登录，保存目标路径并重定向到登录页
            localStorage.setItem('redirectPath', to.fullPath);
            next('/login');
            return;
        }
        
        // 检查角色权限
        if (to.meta.roles && !to.meta.roles.includes(userRole)) {
            // 无权限访问
            console.log(`用户角色 ${userRole} 无权访问 ${to.path}`);
            next('/unauthorized');
            return;
        }
    }
    
    // 允许访问
    next();
});

export default router 