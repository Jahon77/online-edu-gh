<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <div class="vertical-title">个人中心</div>
      <div class="content-container">
        <div class="header-banner">
          <h2>教师个人中心</h2>
          <p>管理您的个人信息和教学数据</p>
        </div>

        <!-- 个人信息卡片 -->
        <div class="profile-section">
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar-section">
                <img :src="teacherInfo.avatar || '/default-avatar.png'" alt="教师头像" class="avatar" />
                <button class="change-avatar-btn" @click="changeAvatar">更换头像</button>
              </div>
              <div class="basic-info">
                <h3>{{ teacherInfo.name || '未设置姓名' }}</h3>
                <p class="teacher-id">教师ID: {{ teacherInfo.id }}</p>
                <p class="join-date">加入时间: {{ formatDate(teacherInfo.createdAt) }}</p>
              </div>
            </div>
            
            <div class="profile-details">
              <div class="detail-row">
                <label>姓名:</label>
                <span>{{ teacherInfo.name || '未设置' }}</span>
                <button class="edit-btn" @click="editField('name')">编辑</button>
              </div>
              <div class="detail-row">
                <label>账号:</label>
                <span>{{ teacherInfo.username || '未设置' }}</span>
                <button class="edit-btn" @click="editField('username')">编辑</button>
              </div>
              <div class="detail-row">
                <label>手机:</label>
                <span>{{ teacherInfo.phone || '未设置' }}</span>
                <button class="edit-btn" @click="editField('phone')">编辑</button>
              </div>
              <!-- <div class="detail-row">
                <label>专业领域:</label>
                <span>{{ teacherInfo.specialty || '未设置' }}</span>
                <button class="edit-btn" @click="editField('specialty')">编辑</button>
              </div>
              <div class="detail-row">
                <label>个人简介:</label>
                <span>{{ teacherInfo.bio || '未设置' }}</span>
                <button class="edit-btn" @click="editField('bio')">编辑</button>
              </div> -->
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <h3>教学统计</h3>
          <div class="stats-grid">
            <div class="stat-card" @click="goToCourseList" style="cursor:pointer;">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalCourses }}</div>
                <div class="stat-label">总课程数</div>
              </div>
            </div>
            <div class="stat-card" @click="goToStudentManagement" style="cursor:pointer;">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalStudents }}</div>
                <div class="stat-label">总学生数</div>
              </div>
            </div>
            <div class="stat-card" @click="goToCommentManagement" style="cursor:pointer;">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.averageRating.toFixed(1) }}</div>
                <div class="stat-label">平均评分</div>
              </div>
            </div>
            <div class="stat-card" @click="goToCommentManagement" style="cursor:pointer;">
              <div class="stat-icon">💬</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalComments }}</div>
                <div class="stat-label">评价总数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近课程 -->
        <div class="recent-courses-section">
          <h3>最近课程</h3>
          <div v-if="recentCourses.length === 0" class="empty-state">
            <div class="empty-icon">📚</div>
            <h4>暂无课程</h4>
            <p>您还没有创建任何课程</p>
            <button class="create-course-btn" @click="createCourse">创建第一个课程</button>
          </div>
          <div v-else class="courses-grid">
            <div v-for="course in recentCourses" :key="course.id" class="course-card">
              <img :src="course.coverUrl || '/default-course-cover.jpg'" alt="课程封面" class="course-cover" />
              <div class="course-info">
                <h4>{{ course.title }}</h4>
                <p class="course-category">{{ course.category }}</p>
                <div class="course-stats">
                  <span>{{ course.subscriberCount }} 学生</span>
                  <span>评分 ：{{ course.rating !== null && course.rating !== undefined ? course.rating.toFixed(1) : '暂无' }}</span>
                </div>
                <div class="course-status" :class="getStatusClass(course.status)">
                  {{ getStatusText(course.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑对话框 -->
        <div v-if="showEditDialog" class="edit-dialog-overlay" @click="closeEditDialog">
          <div class="edit-dialog" @click.stop>
            <h3>编辑{{ getFieldLabel(editingField) }}</h3>
            <div class="edit-form">
              <label>{{ getFieldLabel(editingField) }}:</label>
              <textarea v-if="editingField === 'bio'" v-model="editValue" rows="4" placeholder="请输入个人简介"></textarea>
              <input v-else v-model="editValue" :type="getFieldType(editingField)" :placeholder="`请输入${getFieldLabel(editingField)}`" />
            </div>
            <div class="dialog-actions">
              <button class="cancel-btn" @click="closeEditDialog">取消</button>
              <button class="save-btn" @click="saveField">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'

const router = useRouter()

// 获取当前用户ID
function getCurrentUserId() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; userid=`);
  if (parts.length === 2) return parseInt(parts.pop().split(";").shift());
  return null;
}

const teacherId = getCurrentUserId()
const teacherInfo = ref({})
const stats = ref({
  totalCourses: 0,
  totalStudents: 0,
  averageRating: 0,
  totalComments: 0
})
const recentCourses = ref([])
const loading = ref(false)

// 编辑对话框相关
const showEditDialog = ref(false)
const editingField = ref('')
const editValue = ref('')

// 加载教师信息
const loadTeacherInfo = async () => {
  if (!teacherId) return
  
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:8080/api/teacher/profile/${teacherId}`)
    if (res.data.status === 0) {
      teacherInfo.value = {
        id: res.data.data.id,
        name: res.data.data.name,
        username: res.data.data.username,
        phone: res.data.data.phone,
        avatar: res.data.data.avatar,
        createdAt: res.data.data.createdAt
      }
    } else {
      teacherInfo.value = {}
    }
  } catch (error) {
    console.error('加载教师信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  if (!teacherId) return
  try {
    const res = await axios.get(`http://localhost:8080/api/teacher/stats/${teacherId}`)
    stats.value = res.data.data || {
      totalCourses: 0,
      totalStudents: 0,
      averageRating: 0,
      totalComments: 0
    }
    console.log('教师统计数据', stats.value)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最近课程
const loadRecentCourses = async () => {
  if (!teacherId) return
  
  try {
    const res = await axios.get(`http://localhost:8080/api/teacher/recent-courses/${teacherId}`)
    recentCourses.value = res.data.data.map(item => ({
      id: item.id,
      coverUrl: item.coverUrl || item.cover_url,
      title: item.title,
      category: item.category,
      subscriberCount: item.subscriberCount || item.subscriber_count,
      rating: item.rating,
      status: item.status
    }))
    console.log('最近课程', recentCourses.value)
  } catch (error) {
    console.error('加载最近课程失败:', error)
  }
}

// 编辑字段
const editField = (field) => {
  editingField.value = field
  editValue.value = teacherInfo.value[field] || ''
  showEditDialog.value = true
}

// 保存字段
const saveField = async () => {
  try {
    await axios.put(`http://localhost:8080/api/teacher/profile/${teacherId}`, {
      [editingField.value]: editValue.value
    })
    
    teacherInfo.value[editingField.value] = editValue.value
    closeEditDialog()
    alert('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  }
}

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false
  editingField.value = ''
  editValue.value = ''
}

// 更换头像
const changeAvatar = () => {
  alert('头像上传功能开发中...')
}

// 创建课程
const createCourse = () => {
  router.push('/teacher/create')
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 获取字段标签
const getFieldLabel = (field) => {
  const labels = {
    name: '姓名',
    username: '账号',
    phone: '手机'
  }
  return labels[field] || field
}

// 获取字段类型
const getFieldType = (field) => {
  const types = {
    username: 'text',
    phone: 'tel',
    name: 'text'
  }
  return types[field] || 'text'
}

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-draft'
    case 1: return 'status-published'
    case 2: return 'status-offline'
    case 3: return 'status-pending'
    case 4: return 'status-rejected'
    default: return 'status-draft'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '草稿'
    case 1: return '已发布'
    case 2: return '已下架'
    case 3: return '审核中'
    case 4: return '拒绝'
    default: return '未知'
  }
}

const goToCourseList = () => {
  router.push('/teacher/courseList')
}

const goToStudentManagement = () => {
  router.push('/teacher/student-management')
}

const goToCommentManagement = () => {
  router.push('/teacher/comment-management')
}

onMounted(() => {
  if (teacherId) {
    loadTeacherInfo()
    loadStats()
    loadRecentCourses()
  }
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

/* 个人信息卡片 */
.profile-section {
  margin-bottom: 2rem;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e5e7eb;
}

.change-avatar-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.change-avatar-btn:hover {
  background-color: #2563eb;
}

.basic-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #374151;
}

.teacher-id, .join-date {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
}

.detail-row label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
}

.detail-row span {
  flex: 1;
  color: #4b5563;
}

.edit-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: #2563eb;
}

/* 统计信息 */
.stats-section {
  margin-bottom: 2rem;
}

.stats-section h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.4rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  color: #3b82f6;
  background-color: #eff6ff;
  padding: 0.75rem;
  border-radius: 8px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 最近课程 */
.recent-courses-section {
  margin-bottom: 2rem;
}

.recent-courses-section h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.4rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #9ca3af;
  font-size: 4rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.2rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.create-course-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-course-btn:hover {
  background-color: #2563eb;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
}

.course-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-info {
  padding: 1.5rem;
}

.course-info h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
}

.course-category {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.course-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.course-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-draft {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-published {
  background-color: #d1fae5;
  color: #059669;
}

.status-offline {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-rejected {
  background-color: #fef2f2;
  color: #dc2626;
}

/* 编辑对话框 */
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-dialog {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.edit-dialog h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.3rem;
  font-weight: 600;
}

.edit-form {
  margin-bottom: 1.5rem;
}

.edit-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.edit-form input,
.edit-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.edit-form textarea {
  resize: vertical;
  min-height: 100px;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.save-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: #2563eb;
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
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style> 