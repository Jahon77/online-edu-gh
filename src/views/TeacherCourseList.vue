<template>
  <div class="course-list-page">
    <TeacherHeader />
    <h2 class="page-title">我的课程</h2>
    <div v-if="courses.length === 0" class="empty-tip">暂无课程</div>
    <div v-else class="course-grid">
      <div 
        v-for="(course, index) in courses" 
        :key="course.id" 
        class="course-card"
      >
        <div class="card-header">
          <div class="index">{{ index + 1 }}</div>
          <img :src="course.coverUrl" alt="课程封面" class="cover" />
          <!-- 标题覆盖层 -->
          <div class="title-overlay">
            <h3 class="course-title">{{ course.title }}</h3>
          </div>
        </div>
        <div class="card-body">
          <!-- 基本信息单行显示 -->
          <p class="meta">
            <span>分类：{{ course.category }}</span>
            <span class="divider">|</span>
            <span>难度：{{ course.level }}</span>
            <span class="divider">|</span>
            <span class="price">¥{{ course.price }}</span>
          </p>
          <p class="intro">{{ course.introMd }}</p>
          <button class="edit-btn" @click="editCourse(course.id)">编辑</button>
        </div>
      </div>
    </div>
    <!-- 返回顶部按钮 -->
    <transition name="fade">
      <button 
        v-show="showBackToTop" 
        class="back-to-top"
        @click="scrollToTop"
      >
        ↑
      </button>
    </transition>
  </div>
</template>

<script>
import TeacherHeader from 'src/components/commen/header/TeacherHeader.vue'
export default {
  name: "TeacherCourseList",
  data() {
    return {
      teacherId: null,
      courses: [],
      showBackToTop: false
    };
  },
  mounted() {
    this.initTeacherId();
    this.$nextTick(() => {
      if (this.teacherId) {
    this.fetchCourses();
      }
    });
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    getCurrentUserId() {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; userid=`);
      if (parts.length === 2) {
        const userId = parts.pop().split(';').shift();
        return userId ? parseInt(userId) : null;
      }
      return null;
    },
    initTeacherId() {
      const userId = this.getCurrentUserId();
      if (userId) {
        this.teacherId = userId;
        console.log('当前教师ID:', userId);
      } else {
        console.error('无法获取当前用户ID，请确保已登录');
        alert('无法获取用户信息，请重新登录');
      }
    },
    fetchCourses() {
      if (!this.teacherId) {
        console.error('教师ID未设置，无法获取课程列表');
        return;
      }

      fetch(`http://localhost:8080/api/teacher/course/list?teacherId=${this.teacherId}`)
        .then(res => res.json())
        .then(data => {
          this.courses = data;
        })
        .catch(error => {
          console.error('获取课程列表失败:', error);
        });
    },
    editCourse(courseId) {
      this.$router.push(`/teacher/edit-course/${courseId}`);
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 0;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
};
</script>

<style scoped>
/* 页面基础布局 */
.course-list-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F9F2EF;
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

/* 头部组件 */
TeacherHeader {
  width: 100%;
  max-width: 1500px;
}

/* 页面标题 */
.page-title {
  font-size: 25px;
  font-weight: 600;
  color: #333;
  margin-top: 10px;
  margin-bottom: 24px;
  align-self: flex-start;
  margin-left: 170px;
}

/* 空状态提示 */
.empty-tip {
  color: #999;
  text-align: center;
  padding: 40px 0;
  background: #fff;
  width: 100%;
  max-width: 1200px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* 课程网格布局 - 一行四个 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1200px;
}

/* 课程卡片样式 */
.course-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #f9e6d2;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: all 0.2s ease;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.05);
}

/* 卡片头部 */
.card-header {
  position: relative;
  height: 160px; /* 增加图片高度 */
}

.index {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  background-color: #f58b3b;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 标题覆盖层 */
.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%; /* 覆盖图片下半部分 */
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: 12px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* 卡片主体 */
.card-body {
  padding: 12px 16px; /* 减少上下内边距 */
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 基本信息单行显示 */
.meta {
  color: #666;
  font-size: 12px;
  margin: 4px 0;
  white-space: nowrap; /* 强制单行 */
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta .divider {
  margin: 0 8px;
  color: #ddd;
}

.meta .price {
  color: #f58b3b;
  font-weight: 500;
}

.intro {
  color: #555;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
  flex: 1;
}

.edit-btn {
  width: 100%;
  background-color: #ABD7FB;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.edit-btn:hover {
  background-color: #f7a059;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 900px) {
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
}

/* 返回顶部按钮样式 */
.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f58b3b;
  color: white;
  font-size: 20px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.back-to-top:hover {
  background-color: #f7a059;
  transform: scale(1.1);
}

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>