<!-- CommentManagement.vue -->
<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <div class="vertical-title">评论管理</div>
      <div class="content-container">
        <div class="page-header">
          <h2>学生评价管理</h2>
          <p>查看选修您课程的学生评价和反馈</p>
        </div>

        <!-- 课程选择器 -->
        <div class="course-selector">
          <label>选择课程：</label>
          <select v-model="selectedCourseId" @change="loadComments" :disabled="loading">
            <option value="">请选择课程</option>
            <option v-for="course in teacherCourses" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
          <label style="margin-left: 1rem;">筛选：</label>
          <select v-model="filterType" style="width: 100px;">
            <option value="all">全部</option>
            <option value="good">好评</option>
            <option value="normal">一般</option>
            <option value="bad">差评</option>
          </select>
          <div v-if="loading" class="loading-indicator">
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            加载中...
          </div>
        </div>

        <!-- 课程统计信息 -->
        <div v-if="selectedCourseId && courseStats" class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ courseStats.totalStudents }}</div>
                <div class="stat-label">总学生数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ isNaN(courseStats.averageRating) ? 0 : courseStats.averageRating.toFixed(1) }}</div>
                <div class="stat-label">平均评分</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ courseStats.totalComments }}</div>
                <div class="stat-label">评价总数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                  <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ courseStats.satisfactionRate }}%</div>
                <div class="stat-label">满意度</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学生评价列表 -->
        <div v-if="selectedCourseId && filteredComments.length > 0" class="comments-section">
          <h3>学生评价列表 ({{ filteredComments.length }}条)</h3>
          <div class="comments-grid">
            <div v-for="comment in filteredComments" :key="comment.id" class="comment-card">
              <div class="comment-header">
                <div class="student-info">
                  <div class="student-avatar">
                    <img :src="comment.userAvatar || '/default-avatar.png'" :alt="comment.studentName" />
                  </div>
                  <div class="student-details">
                    <div style="display: flex; justify-content: flex-start; gap: 3rem; align-items: center;">
                      <h4 style="margin: 0;">{{ comment.username }}</h4>
                      <p style="margin: 0; color: #6b7280; font-size: 0.95rem;">{{ comment.studentPhone }}</p>
                    </div>
                    <p>评价时间：{{ formatDate(comment.createdAt) }}</p>
                  </div>
                </div>
                <div class="comment-actions" style="display: flex; gap: 10px; align-items: center;">
                  <button class="action-btn chat-btn" @click="openChat(comment.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    聊天
                  </button>
                  <button class="action-btn block-btn" @click="blockComment(comment.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18"/>
                        <path d="M6 6l12 12"/>
                    </svg>
                    拉黑
                </button>
                </div>
              </div>

              <div class="comment-content">
                <div class="rating-section">
                  <div class="rating-display">
                    <span class="rating-label">评分：</span>
                    <div class="stars">
                      <span 
                        v-for="star in 5" 
                        :key="star" 
                        class="star"
                        :class="{ 'filled': star <= Number(comment.stars), 'empty': star > Number(comment.stars) }"
                      >
                        ★
                      </span>
                    </div>
                    <span class="rating-value">{{ Number(comment.stars) || 0 }}/5</span>
                  </div>
                </div>
                
                <div class="comment-text">
                  <h5>评价内容：</h5>
                  <p>{{ comment.content || '该学生暂未填写评价内容' }}</p>
                </div>

                <div v-if="comment.reply" class="reply-section">
                  <h5>回复内容：</h5>
                  <p>{{ comment.reply }}</p>
                </div>

                <div class="comment-footer">
                  <div class="comment-tags">
                    <span v-if="Number(comment.stars) >= 4" class="tag positive">好评</span>
                    <span v-else-if="Number(comment.stars) >= 3" class="tag neutral">一般</span>
                    <span v-else class="tag negative">差评</span>
                  </div>
                </div>
              </div>

              <div class="reply-tree" style="margin-top: 12px;">
                <ReplyNode
                  v-for="reply in repliesMap[comment.id] || []"
                  :key="reply.id"
                  :reply="reply"
                  :level="0"
                  :current-user-id="teacherId"
                  @reply="payload => handleReply(comment.id, payload)"
                  @deleted="emitDeleted"
                />
                <!-- 回复根评论的输入框 -->
                <div class="root-reply-box">
                  <input v-model="rootReplyInput[comment.id]" placeholder="回复该评论..." />
                  <button @click="submitRootReply(comment.id)">回复</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="selectedCourseId && filteredComments.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>暂无评价</h3>
          <p>该课程目前还没有学生评价</p>
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
    <ChatModal
      v-if="isChatModalVisible"
      :student="selectedStudentForChat"
      :is-visible="isChatModalVisible"
      @close="closeChatModal"
    />
  </div>
</template>

<script setup>
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'

import { ref, onMounted, computed, watch } from 'vue'
import ChatModal from '@/components/ChatModal.vue'

import axios from 'axios'
import ReplyNode from '@/components/ReplyNode.vue'

function getCurrentUserId() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; userid=`);
  if (parts.length === 2) {
    const userId = parts.pop().split(";").shift();
    return userId ? parseInt(userId) : null;
  }
  return null;
}

const teacherId = getCurrentUserId()
const selectedCourseId = ref('')
const teacherCourses = ref([])
const comments = ref([])
const courseStats = ref(null)
const loading = ref(false)
const filterType = ref('all')

const repliesMap = ref({})
const rootReplyInput = ref({})

const isChatModalVisible = ref(false)
const selectedStudentForChat = ref(null)


const filteredComments = computed(() => {
  if (filterType.value === 'all') return comments.value
  if (filterType.value === 'good') return comments.value.filter(c => c.stars >= 4)
  if (filterType.value === 'normal') return comments.value.filter(c => c.stars === 3)
  if (filterType.value === 'bad') return comments.value.filter(c => c.stars <= 2)
  return comments.value
})
const blockComment = async (commentId) => {
  if (!confirm('确定要屏蔽该条评论吗？')) return;
  try {
    await axios.post(`http://localhost:8080/api/teacher/course/comment/${commentId}/block`);
    alert('评论已成功屏蔽');
    loadComments(); // 重新加载评论
  } catch (e) {
    alert('屏蔽失败，请重试');
    console.error(e);
  }
};

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

const loadComments = async () => {
  if (!selectedCourseId.value) return
  loading.value = true
  try {
    // 获取课程评价列表
    const commentsRes = await axios.get(`http://localhost:8080/api/teacher/course/${selectedCourseId.value}/comments`, {
      params: { teacherId }
    })
    console.log('后端原始返回数据:', commentsRes.data)
    const arr = Array.isArray(commentsRes.data) ? commentsRes.data : commentsRes.data.data
    arr.forEach((c, i) => {
      console.log(`第${i+1}条: rating=`, c.stars, '类型:', typeof c.stars)
    })
    comments.value = (commentsRes.data || []).map(c => ({
      ...c,
      stars: Number(c.stars) || 0
    }))
    
    // 计算统计信息
    if (comments.value.length > 0) {
      const totalComments = comments.value.length
      const sumRating = comments.value.reduce((sum, comment) => sum + (Number(comment.stars) || 0), 0)
      const averageRating = totalComments > 0 ? (sumRating / totalComments) : 0
      const satisfiedComments = comments.value.filter(comment => Number(comment.stars) >= 4).length
      const satisfactionRate = Math.round((satisfiedComments / totalComments) * 100)
      
      courseStats.value = {
        totalStudents: comments.value.length,
        averageRating: averageRating,
        totalComments: totalComments,
        satisfactionRate: satisfactionRate
      }
    } else {
      courseStats.value = {
        totalStudents: 0,
        averageRating: 0,
        totalComments: 0,
        satisfactionRate: 0
      }
    }

    // 加载每条评论的回复树
    await loadAllReplies()
  } catch (e) {
    console.error('加载评价失败:', e)
    comments.value = []
    courseStats.value = {
      totalStudents: 0,
      averageRating: 0,
      totalComments: 0,
      satisfactionRate: 0
    }
  } finally {
    loading.value = false
  }
}

const openChat = (studentId) => {
  const comment = comments.value.find(c => c.id === studentId);
  if (comment) {
    console.log('Current user ID:', getCurrentUserId());
    console.log('Comment object:', comment);
    
    selectedStudentForChat.value = {
      id: comment.studentId,
      name: comment.username,
      avatar: comment.userAvatar || '/default-avatar.png',
      role: 1
    };
    isChatModalVisible.value = true;
  } else {
    alert('无法找到该学生信息');
  }
}

const closeChatModal = () => {
  isChatModalVisible.value = false;
  selectedStudentForChat.value = null;
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { hour12: false })
}

// 加载根评论后，加载每条评论的回复树
const loadReplies = async (commentId) => {
  const res = await axios.get(`http://localhost:8080/api/comment/${commentId}/replies`)
  repliesMap.value[commentId] = res.data
}

const loadAllReplies = async () => {
  for (const comment of comments.value) {
    await loadReplies(comment.id)
  }
}

// 在loadComments后调用
watch(comments, () => {
  loadAllReplies()
})

const submitRootReply = async (commentId) => {
  const content = rootReplyInput.value[commentId]
  if (!content) return
  await axios.post('http://localhost:8080/api/comment/reply', {
    commentId,
    parentReplyId: null,
    userId: teacherId,
    content
  })
  rootReplyInput.value[commentId] = ''
  await loadReplies(commentId)
}

const handleReply = async (commentId, { parentReplyId, content }) => {
  await axios.post('http://localhost:8080/api/comment/reply', {
    commentId,
    parentReplyId,
    userId: teacherId,
    content
  })
  await loadReplies(commentId)
}

const emitDeleted = () => {
  loadAllReplies();
}

onMounted(() => loadTeacherCourses())
</script>

<style scoped>
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

.course-selector {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
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

/* 统计信息样式 */
.stats-section {
  margin-bottom: 2rem;
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
  color: #3b82f6;
  background-color: #eff6ff;
  padding: 0.75rem;
  border-radius: 8px;
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

/* 评价列表样式 */
.comments-section h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.4rem;
  font-weight: 600;
}

.comments-grid {
  display: grid;
  gap: 1.5rem;
}

.comment-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
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

/* 通用操作按钮样式 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* 聊天按钮特定样式 */
.chat-btn {
  background-color: #3b82f6;
}
.chat-btn:hover {
  background-color: #2563eb;
}

/* 屏蔽按钮特定样式 */
.block-btn {
  background-color: #f87171;
}
.block-btn:hover {
  background-color: #ef4444;
}


.comment-content {
  font-size: 0.9rem;
}

.rating-section {
  margin-bottom: 1rem;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-label {
  color: #6b7280;
  font-weight: 500;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  cursor: default;
}

.star.filled {
  color: #fbbf24;
}

.star.empty {
  color: #e5e7eb;
}

.rating-value {
  color: #374151;
  font-weight: 600;
}

.comment-text {
  margin-bottom: 1rem;
}

.comment-text h5 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.comment-text p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.reply-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.reply-section h5 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 600;
}

.reply-section p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
}

.comment-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag.positive {
  background-color: #d1fae5;
  color: #059669;
}

.tag.neutral {
  background-color: #fef3c7;
  color: #d97706;
}

.tag.negative {
  background-color: #fee2e2;
  color: #dc2626;
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

.root-reply-box {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.7rem;
  margin-left: 0.5rem;
  background: #f7f9fb;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.root-reply-box input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background: #f8fafc;
  transition: border 0.2s;
}

.root-reply-box input:focus {
  border-color: #3b82f6;
  outline: none;
  background: #fff;
}

.root-reply-box button {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.root-reply-box button:hover {
  background: #1749b1;
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
  
  .comment-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .student-info {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
