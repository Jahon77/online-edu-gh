<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <!-- <div class="vertical-title">草稿箱管理</div> -->
      <div class="content-container">
        <div class="header-banner">
          <h2>课程草稿箱</h2>
          <p>管理和发布您未完成的课程草稿</p>
        </div>
        <div class="course-selector">
          <label>筛选分区：</label>
          <select v-model="filterType">
            <option v-for="option in filterOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <!-- 下面是课程分区和卡片内容 -->
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else>
          <div v-for="(courses, statusLabel) in filteredCourseGroups" :key="statusLabel" class="status-section">
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
                    <span>状态：{{ statusLabel }}    |    创建于：{{ formatDate(course.createdAt) }}</span>
                    <!-- <span class="divider">|</span>
                    <span>创建于：{{ formatDate(course.createdAt) }}</span> -->
                  </p>
                  <p class="intro">{{ getCourseIntro(course) }}</p>
                  <div v-if="statusLabel === '拒绝'" class="reject-notice">
                    <span>⚠ 审核被拒绝，可编辑后重新提交</span>
                  </div>
                  <div class="action-buttons">
                    <button class="edit-btn" @click="editCourse(course.id)" v-if="canEditCourse(statusLabel)">编辑</button>
                    <button class="publish-btn" @click="publishCourse(course.id)" v-if="statusLabel === '草稿'">发布</button>
                    <button class="resubmit-btn" @click="resubmitCourse(course.id)" v-if="statusLabel === '拒绝'">重新提交</button>
                    <div v-if="!canEditCourse(statusLabel)" class="status-tip" :class="getStatusTipClass(statusLabel)">
                      <span v-if="statusLabel === '审核中'">审核中，暂不可编辑</span>
                      <!-- <span v-else-if="statusLabel === '已发布'">已发布，不可编辑</span> -->
                      <span v-else-if="statusLabel === '下架'">已下架，不可编辑</span>
                    </div>
                  </div>
                </div>
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
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'

function getCurrentUserId() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; userid=`);
  if (parts.length === 2) return parseInt(parts.pop().split(";").shift());
  return null;
}

const router = useRouter()
const teacherId = getCurrentUserId()
const courseGroups = ref({})
const loading = ref(false)
const showBackToTop = ref(false)
const filterType = ref('草稿')

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

const editCourse = async (courseId) => {
  // 获取当前课程信息
  const courseToEdit = Object.values(courseGroups.value)
    .flat()
    .find(course => course.id === courseId)
  
  if (!courseToEdit) {
    alert('课程信息获取失败')
    return
  }
  
  // 如果是拒绝的课程，先将其状态改为草稿
  if (courseToEdit.status === 4) { // 假设4是拒绝的状态值
    try {
      const updatedCourse = {
        ...courseToEdit,
        status: 0 // 草稿状态
      }
      
      await axios.post('http://localhost:8080/api/teacher/course/update', updatedCourse)
      console.log('拒绝课程状态已更新为草稿')
    } catch (error) {
      console.error('更新课程状态失败:', error)
      // 即使状态更新失败，也继续跳转到编辑页面
    }
  }
  
  // 跳转到编辑页面
  router.push(`/teacher/edit-course/${courseId}`)
}

// 判断课程是否可编辑
const canEditCourse = (statusLabel) => {
  return statusLabel === '草稿' || statusLabel === '拒绝'
}

// 获取课程简介内容
const getCourseIntro = (course) => {
  return course.introMd || course.description || '暂无简介'
}

// 获取状态提示样式类
const getStatusTipClass = (statusLabel) => {
  switch (statusLabel) {
    case '审核中':
      return 'status-tip-pending'
    // case '已发布':
    //   return 'status-tip-published'
    case '下架':
      return 'status-tip-offline'
    case '拒绝':
      return 'status-tip-rejected'
    default:
      return ''
  }
}

const publishCourse = async (courseId) => {
  if (!confirm('确定要发布这个课程吗？发布后需要管理员审核。')) {
    return
  }
  
  try {
    // 获取当前课程信息
    const courseToPublish = Object.values(courseGroups.value)
      .flat()
      .find(course => course.id === courseId)
    
    if (!courseToPublish) {
      alert('课程信息获取失败')
      return
    }
    
    // 更新课程状态为审核中（状态值3）
    const updatedCourse = {
      ...courseToPublish,
      status: 3 // 审核中
    }
    
    // 调用后端发布接口
    await axios.post('http://localhost:8080/api/teacher/course/update', updatedCourse)
    
    alert('课程发布成功！已提交审核，请等待管理员审核。')
    
    // 重新加载草稿箱数据
    await loadDraftBox()
    
  } catch (error) {
    console.error('发布课程失败:', error)
    alert('发布失败，请重试')
  }
}

const resubmitCourse = async (courseId) => {
  if (!confirm('确定要重新提交这个课程吗？提交后需要管理员重新审核。')) {
    return
  }
  
  try {
    // 获取当前课程信息
    const courseToResubmit = Object.values(courseGroups.value)
      .flat()
      .find(course => course.id === courseId)
    
    if (!courseToResubmit) {
      alert('课程信息获取失败')
      return
    }
    
    // 更新课程状态为审核中（状态值3）
    const updatedCourse = {
      ...courseToResubmit,
      status: 3 // 审核中
    }
    
    // 调用后端更新接口
    await axios.post('http://localhost:8080/api/teacher/course/update', updatedCourse)
    
    alert('课程重新提交成功！已提交审核，请等待管理员审核。')
    
    // 重新加载草稿箱数据
    await loadDraftBox()
    
  } catch (error) {
    console.error('重新提交课程失败:', error)
    alert('重新提交失败，请重试')
  }
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

const orderedCourseGroups = computed(() => {
  if (!courseGroups.value) return {}
  const groups = courseGroups.value
  const ordered = {}
  if (groups['草稿']) ordered['草稿'] = groups['草稿']
  Object.keys(groups).forEach(key => {
    if (key !== '草稿') ordered[key] = groups[key]
  })
  return ordered
})

const filterOptions = computed(() => {
  const keys = Object.keys(courseGroups.value || {})
  return ['全部', ...keys]
})

const filteredCourseGroups = computed(() => {
  if (filterType.value === '全部') return orderedCourseGroups.value
  const group = orderedCourseGroups.value[filterType.value]
  return group ? { [filterType.value]: group } : {}
})

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
.page {
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
  font-size: 1.8rem;
  font-weight: 700;
  color: #374151;
  margin-top: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}

/* 状态分组标题 */
.status-section {
  margin-bottom: 2.5rem;
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}

.status-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.2rem;
  background: none;
  padding: 0;
}

/* 空状态提示 */
.empty-tip {
  color: #6b7280;
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px dashed #e5e7eb;
  font-size: 1rem;
}

/* 课程网格布局 - 一行四个，分区展示 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* 课程卡片样式 */
.course-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
  min-height: 240px;
  max-width: 340px;
  margin: 0 auto;
}

.course-card:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  transform: translateY(-2px) scale(1.02);
}

/* 卡片头部 */
.card-header {
  position: relative;
  height: 120px;
  background: #f3f4f6;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  overflow: hidden;
}

.index {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  background-color: #3b82f6;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.card-body {
  padding: 1.5rem 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meta {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  display: flex;
  gap: 1rem;
}

.intro {
  color: #4b5563;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  flex: 1;
  line-height: 1.5;
  min-height: 2.5em;
}

.reject-notice {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #d97706;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.edit-btn, .publish-btn, .resubmit-btn {
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #3b82f6;
  color: white;
}
.edit-btn:hover {
  background-color: #2563eb;
}

.publish-btn {
  background-color: #f58b3b;
  color: white;
}
.publish-btn:hover {
  background-color: #f7a059;
}

.resubmit-btn {
  background-color: #8b5cf6;
  color: white;
}
.resubmit-btn:hover {
  background-color: #7c3aed;
}

/* 状态提示样式 */
.status-tip {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-tip span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-tip span::before {
  content: "ℹ";
  font-size: 1rem;
  color: #3b82f6;
}

/* 不同状态的提示样式 */
.status-tip-pending {
  background-color: #fef3c7;
  border-color: #f59e0b;
  color: #d97706;
}

.status-tip-pending span::before {
  content: "⏳";
  color: #f59e0b;
}

.status-tip-published {
  background-color: #d1fae5;
  border-color: #10b981;
  color: #059669;
}

.status-tip-published span::before {
  content: "✓";
  color: #10b981;
}

.status-tip-offline {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.status-tip-offline span::before {
  content: "⏸";
  color: #ef4444;
}

.status-tip-rejected {
  background-color: #fef3c7;
  border-color: #f59e0b;
  color: #d97706;
}

.status-tip-rejected span::before {
  content: "⚠";
  color: #f59e0b;
}

/* 加载状态 */
.loading {
  margin-top: 2rem;
  font-size: 1.2rem;
  color: #6b7280;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .main-content {
    flex-direction: column;
    padding: 1rem;
  }
  .vertical-title {
    writing-mode: horizontal-tb;
    margin: 0 0 1rem 0;
    text-align: center;
  }
  .content-container {
    padding: 1rem;
  }
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

.course-selector {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.course-selector label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
}

.course-selector select {
  flex: 1;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.main-content {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1500px;
  margin-top: 2rem;
  flex-direction: row;
  align-items: flex-start;
}

.vertical-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 2rem;
  font-weight: 700;
  color: #4a4a4a;
  letter-spacing: 2px;
  white-space: nowrap;
  margin-right: 2rem;
  margin-top: 10rem;
  display: flex;
  align-items: center;
  height: 100%;
}

.content-container {
  flex: 1;
  background-color: #f8faff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  min-height: 500px;
}

.header-banner {
  background: #d7e7b9;
  border-radius: 12px;
  padding: 2.5rem 2rem 2rem 2rem;
  margin-bottom: 2rem;
  text-align: center;
  height: 245px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.header-banner h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
}

.header-banner p {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.course-selector {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.course-selector label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
}

.course-selector select {
  flex: 1;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}
</style>
  