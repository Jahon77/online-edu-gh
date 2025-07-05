<!-- StudentProgress.vue -->
<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <div class="vertical-title">学生管理</div>
      <div class="content-container">
        <div class="page-header">
          <h2>学生管理与互动</h2>
          <p>查看选修您课程的学生列表和观看进度</p>
          <!-- 論壇入口按鈕 -->
          <div class="forum-entry">
            <button @click="goToForum" class="forum-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              進入論壇
            </button>
          </div>
        </div>

        <!-- 课程选择器 -->
        <div class="course-selector">
          <label>选择课程：</label>
          <select v-model="selectedCourseId" @change="loadStudents" :disabled="loading">
            <option value="">请选择课程</option>
            <option v-for="course in teacherCourses" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
          <div v-if="loading" class="loading-indicator">
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            加载中...
          </div>
        </div>

        <!-- 学生列表 -->
        <div v-if="selectedCourseId && students.length > 0" class="students-section">
          <h3>学生列表 ({{ students.length }}人)</h3>
          <div class="students-grid">
            <div v-for="student in students" :key="student.id" class="student-card">
              <div class="student-info">
                <div class="student-avatar">
                  <img :src="student.avatar || '/default-avatar.png'" :alt="student.name" />
                </div>
                <div class="student-details">
                  <div style="display: flex; justify-content: flex-start; gap: 3rem; align-items: center;">
  <h4 style="margin: 0;">{{ student.name }}</h4>
  <p style="margin: 0; color: #6b7280; font-size: 0.95rem;">{{ student.phone }}</p>
</div>

                  <p>订阅时间：{{ formatDate(student.subscribeTime) }}</p>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-item">
                  <span>总进度：</span>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: student.totalProgress + '%' }"></div>
                  </div>
                  <span>{{ student.totalProgress }}%</span>
                </div>
                <div class="progress-item">
                  <span>已完成课时：</span>
                  <span>{{ student.completedLessons }}/{{ student.totalLessons }}</span>
                </div>
                <div class="toggle-detail" @click="toggleDetails(student.id)">
                  <span>{{ expandedIds.includes(student.id) ? '收起课时详情' : '展开课时详情' }}</span>
                </div>

                <!-- 按章节分组展示课时详情 -->
                <div
                  v-if="expandedIds.includes(student.id)"
                  class="chapter-detail-card"
                  v-for="(lessons, chapterTitle) in groupByChapter(student.lessonProgressDetails)"
                  :key="chapterTitle"
                >
                  <div class="chapter-header">
                    <strong>{{ chapterTitle }}</strong>
                    <span class="chapter-progress">
                      {{ Math.floor(lessons.reduce((acc, l) => acc + l.progress, 0) / lessons.length) }}%
                    </span>
                  </div>
                  <div class="lesson-row" v-for="lesson in lessons" :key="lesson.lessonId">
                    <div class="lesson-name">{{ lesson.lessonTitle }}</div>
                    <div class="lesson-duration">{{ lesson.duration || '--:--' }}</div>
                    <div class="lesson-progress-bar">
                      <div class="fill" :style="{ width: lesson.progress + '%' }"></div>
                    </div>
                    <div class="lesson-status">
                      <span v-if="lesson.progress === 0" class="status not-started">未开始</span>
                      <span v-else-if="lesson.progress >= 100" class="status completed">已完成</span>
                      <span v-else class="status learning">学习中</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- 空状态和未选择提示略，可复用原有代码 -->
         <!-- 空状态 -->
        <div v-else-if="selectedCourseId && students.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3>暂无学生</h3>
          <p>该课程目前还没有学生订阅</p>
        </div>

        <!-- 未选择课程提示 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <h3>请选择课程</h3>
          <p>从上方下拉列表中选择要查看的课程</p>
    </div>
  </div>
    </div>
  </div>
</template>

<script setup>
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const teacherId = 3
const selectedCourseId = ref('')
const teacherCourses = ref([])
const students = ref([])
const loading = ref(false)
const expandedIds = ref([])

const loadTeacherCourses = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8080/api/teacher/course/list', {
      params: { teacherId }
    })
    teacherCourses.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('获取课程失败:', e)
  } finally {
    loading.value = false
  }
}

const loadStudents = async () => {
  if (!selectedCourseId.value) return
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:8080/api/teacher/course/${selectedCourseId.value}/students`, {
      params: { teacherId }
    })
    students.value = res.data || []
    expandedIds.value = []
  } catch (e) {
    console.error('加载学生失败:', e)
    students.value = []
  } finally {
    loading.value = false
  }
}

const toggleDetails = (studentId) => {
  const index = expandedIds.value.indexOf(studentId)
  if (index === -1) expandedIds.value.push(studentId)
  else expandedIds.value.splice(index, 1)
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('zh-CN')

const groupByChapter = (lessonList) => {
  if (!lessonList) return {}
  return lessonList.reduce((acc, item) => {
    const key = item.chapterTitle || '未分组章节'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

const goToForum = () => {
  router.push('/forum')
}

onMounted(() => loadTeacherCourses())
</script>

<style scoped>
.chapter-detail-card {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-top: 1rem;
  padding: 1rem;
}

.chapter-header {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  display: flex;
  justify-content: space-between;
  color: #111827;
}

.chapter-progress {
  color: #10b981;
}

.lesson-row {
  display: grid;
  grid-template-columns: 2fr 1fr 3fr 1fr;
  align-items: center;
  padding: 0.5rem 0;
  border-top: 1px dashed #e5e7eb;
  font-size: 0.9rem;
  color: #374151;
}

.lesson-row:first-child {
  border-top: none;
}

.lesson-duration {
  color: #6b7280;
  font-size: 0.85rem;
}

.lesson-progress-bar {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin: 0 0.5rem;
}

.lesson-progress-bar .fill {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}

.lesson-status {
  text-align: right;
}

.status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

.status.not-started {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status.learning {
  background-color: #fef3c7;
  color: #d97706;
}

.status.completed {
  background-color: #d1fae5;
  color: #059669;
}

.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F9F2EF;
  min-height: 100vh;
  padding: 0;
  margin: 0;
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

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h2 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.8rem;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

.forum-entry {
  margin-top: 1rem;
}

.forum-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.forum-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.forum-btn:active {
  transform: translateY(0);
}

.course-selector {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
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

.students-section h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.4rem;
  font-weight: 600;
}

.students-grid {
  display: grid;
  gap: 1.5rem;
}

.student-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.student-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.student-details h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.2rem;
  font-weight: 600;
}

.student-details p {
  margin: 0 0 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.progress-section {
  font-size: 0.9rem;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.progress-item span:first-child {
  min-width: 120px;
  color: #6b7280;
  font-size: 0.9rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #888;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #9ca3af;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.4rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}
.toggle-detail {
  cursor: pointer;
  color: #3b82f6;
  font-weight: 500;
  margin-top: 1rem;
  transition: color 0.2s;
}

.toggle-detail:hover {
  color: #2563eb;
}

.lesson-detail-list {
  margin-top: 1rem;
  border-top: 1px dashed #e5e7eb;
  padding-top: 1rem;
}

.lesson-detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: #374151;
}

.lesson-title {
  flex: 2;
}

.lesson-progress-bar {
  flex: 5;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.lesson-progress-bar .progress-fill {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}

.progress-value {
  flex: 1;
  text-align: right;
  color: #6b7280;
}
/* 响应式设计 */
@media (max-width: 768px) {
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
  
  .course-selector {
    flex-direction: column;
    align-items: stretch;
  }
  
  .student-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>