<template>
  <div class="draft-box-page">
    <TeacherHeader />
    <h2 class="page-title">课程草稿箱</h2>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else>
      <div v-for="(courses, statusLabel) in courseGroups" :key="statusLabel" class="status-section">
        <h3 class="status-title">{{ statusLabel }}（{{ courses.length }}）</h3>
        
        <div v-if="courses.length === 0" class="empty-tip">暂无{{ statusLabel }}课程</div>
        
        <div v-else class="course-grid">
          <div 
            v-for="(course, index) in courses" 
            :key="course.id" 
            class="course-card"
          >
            <div class="card-header">
              <div class="index">{{ index + 1 }}</div>
              <img :src="course.coverUrl || '/default-course-cover.jpg'" alt="课程封面" class="cover" />
              <!-- 标题覆盖层 -->
              <div class="title-overlay">
                <h3 class="course-title">{{ course.title }}</h3>
              </div>
            </div>
            <div class="card-body">
              <!-- 基本信息单行显示 -->
              <p class="meta">
                <span>状态：{{ statusLabel }}</span>
                <span class="divider">|</span>
                <span>创建于：{{ formatDate(course.createdAt) }}</span>
              </p>
              <p class="intro">{{ course.description || '暂无简介' }}</p>
              <div class="action-buttons">
                <button class="edit-btn" @click="editCourse(course.id)">编辑</button>
                <button class="publish-btn" @click="publishCourse(course.id)" v-if="statusLabel === '草稿'">发布</button>
              </div>
            </div>
          </div>
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

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'

function getCurrentUserId() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; userid=`);
  if (parts.length === 2) return parseInt(parts.pop().split(";").shift());
  return null;
}

const teacherId = getCurrentUserId()
const courseGroups = ref({})
const loading = ref(false)
const showBackToTop = ref(false)

const loadDraftBox = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8080/api/teacher/course/draftbox', {
      params: { teacherId }
    })
    courseGroups.value = res.data || {}
  } catch (e) {
    console.error('加载草稿箱失败', e)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const editCourse = (courseId) => {
  // 跳转到编辑页面
  window.location.href = `/teacher/edit-course/${courseId}`
}

const publishCourse = (courseId) => {
  // 发布课程逻辑
  console.log('发布课程:', courseId)
  // 这里可以添加发布课程的API调用
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 0
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  if (teacherId) loadDraftBox()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 页面基础布局 */
.draft-box-page {
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
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}

/* 状态分组标题 */
.status-section {
  margin-bottom: 3rem;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}

.status-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f58b3b 0%, #f7a059 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(245, 139, 59, 0.3);
}

/* 空状态提示 */
.empty-tip {
  color: #999;
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px dashed #e5e7eb;
  font-size: 16px;
}

/* 课程网格布局 - 一行四个，分区展示 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
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
  height: 160px;
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
  height: 50%;
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
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 基本信息单行显示 */
.meta {
  color: #666;
  font-size: 12px;
  margin: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta .divider {
  margin: 0 8px;
  color: #ddd;
}

.intro {
  color: #555;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .publish-btn {
  flex: 1;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.edit-btn {
  background-color: #ABD7FB;
  color: white;
}

.edit-btn:hover {
  background-color: #9BC7EB;
}

.publish-btn {
  background-color: #f58b3b;
  color: white;
}

.publish-btn:hover {
  background-color: #f7a059;
}

/* 加载状态 */
.loading {
  margin-top: 2rem;
  font-size: 1.2rem;
  color: #666;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .course-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .status-section {
    padding: 0 15px;
  }
}

@media (max-width: 900px) {
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .status-section {
    padding: 0 15px;
  }
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .status-section {
    padding: 0 10px;
  }
  
  .page-title {
    font-size: 24px;
    padding: 0 10px;
  }
  
  .status-title {
    font-size: 20px;
    padding: 10px 12px;
  }
}

@media (max-width: 576px) {
  .course-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .status-section {
    padding: 0 10px;
  }
  
  .page-title {
    font-size: 22px;
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
  