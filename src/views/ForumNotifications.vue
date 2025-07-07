<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <!-- <div class="vertical-title">通知</div> -->
      <div class="content-container">
        <div class="back-section">
          <button @click="goBack" class="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回论坛
          </button>
        </div>

        <!-- <div class="page-header">
          <h2>論壇通知</h2>
          <p>查看您的論壇活動通知</p>
        </div> -->

        <!-- 加載狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 通知列表 -->
        <div v-else-if="notifications.length > 0" class="notifications-section">
          <div class="notifications-header">
            <h3>未读通知 ({{ unreadCount }})</h3>
            <button @click="markAllAsRead" class="mark-all-btn">
              全部标记为已读
            </button>
          </div>
          
          <div class="notifications-list">
            <div v-for="notification in notifications" :key="notification.id" 
                 :class="['notification-item', { unread: !notification.isRead }]">
              <div class="notification-icon">
                <svg v-if="notification.type === 'LIKE'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <svg v-else-if="notification.type === 'COMMENT'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-else-if="notification.type === 'FOLLOW'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-2-2"/>
                  <path d="M16 16h6"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              
              <div class="notification-content" @click="handleNotificationClick(notification)">
                <div class="notification-text">
                  <span class="notification-message">{{ getNotificationMessage(notification) }}</span>
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
                <div v-if="notification.postTitle" class="notification-post">
                  {{ notification.postTitle }}
                </div>
              </div>
              
              <div class="notification-actions">
                <button v-if="!notification.isRead" @click="markAsRead(notification.id)" class="mark-read-btn">
                  标记已读
                </button>
                <button @click="deleteNotification(notification.id)" class="delete-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 分頁 -->
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage <= 1" class="page-btn">
              上一页
            </button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage >= totalPages" class="page-btn">
              下一页
            </button>
          </div>
        </div>

        <!-- 空狀態 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3>暂无通知</h3>
          <p>当您有新的论坛活动时，通知会出现在这里</p>
          <button @click="goToForum" class="forum-btn">去论坛看看</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

// 響應式數據
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)
const currentUserId = ref(null) // 當前用戶ID

// 获取cookie的辅助函数
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// 获取当前用户ID
const getCurrentUserId = () => {
  // 从cookie中获取用户ID
  const userIdFromCookie = getCookie('userid');
  
  if (userIdFromCookie) {
    // 转换为整数
    currentUserId.value = parseInt(userIdFromCookie);
    console.log('当前用户ID:', currentUserId.value);
  } else {
    // 如果未找到用户ID，可能未登录
    console.warn('未找到用户ID，可能未登录');
    currentUserId.value = null;
    
    // 可以选择跳转到登录页面
    // router.push('/login');
  }
}

// 方法
const loadNotifications = async () => {
  // 檢查用戶是否已登錄
  if (!currentUserId.value) {
    alert('请先登录再查看通知');
    return;
  }
  
  loading.value = true
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/notification/user/${currentUserId.value}`)
    notifications.value = response.data.data || []
    unreadCount.value = notifications.value.filter(n=>n.isRead===0).length

    // 解析發送者名稱，避免重複請求使用 Map 緩存
    const senderCache = {}
    await Promise.all(notifications.value.map(async (n) => {
      if (!senderCache[n.senderId]) {
        try {
          const resp = await axios.get(`http://localhost:8080/user/${n.senderId}`)
          senderCache[n.senderId] = resp.data.data.name || resp.data.data.username || '未知用戶'
        } catch {
          senderCache[n.senderId] = '未知用戶'
        }
      }
      n.senderName = senderCache[n.senderId]
    }))
  } catch (error) {
    console.error('加载通知失败:', error)
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notificationId) => {
  if (!currentUserId.value) {
    alert('请先登录');
    return;
  }
  
  try {
    await axios.put(`http://localhost:8080/api/forum/notification/${notificationId}/read`, null, {
      params: { userId: currentUserId.value }
    })
    
    // 更新通知列表
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value-1)
    }
  } catch (error) {
    console.error('标记通知失败:', error)
  }
}

const markAllAsRead = async () => {
  if (!currentUserId.value) return
  try {
    await axios.post(`http://localhost:8080/api/forum/notification/readAll/${currentUserId.value}`)
    
    notifications.value.forEach(n => n.isRead = 1)
    unreadCount.value = 0
  } catch (error) {
    console.error('标记全部已读失败:', error)
  }
}

const deleteNotification = async (notificationId) => {
  if (!currentUserId.value) return
  try {
    await axios.delete(`http://localhost:8080/api/forum/notification/${notificationId}`)
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

const handleNotificationClick = (notification) => {
  if (!notification.isRead) markAsRead(notification.id)
  // 跳轉
  if (notification.targetType === 1) {
    router.push(`/forum/post/${notification.targetId}`)
  } else if (notification.targetType === 2) {
    // 跳至帖子並錨點評論，簡化為帖子
    router.push(`/forum/post/${notification.targetId}`)
  }
}

const getNotificationMessage = (n) => {
  const namePart = n.senderName || '有人'
  switch (n.type) {
    case 1:
      return `${namePart} 点赞了您的帖子`
    case 2:
      return `${namePart} 评论了您的帖子`
    case 3:
      return `${namePart} 收藏了您的帖子`
    case 4:
      return `${namePart} 回复了您的评论`
    default:
      return '您有新的通知'
  }
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadNotifications()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadNotifications()
  }
}

const goToForum = () => {
  router.push('/forum')
}

const goBack = () => {
  router.push('/forum')

  //router.replace({ path: '/forum' })
}

onMounted(() => {
  // 在组件挂载时获取当前用户ID
  getCurrentUserId()
  loadNotifications()
})
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

.back-section {
  margin-bottom: 2rem;
  text-align: left;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
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

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notifications-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.notifications-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.2rem;
  font-weight: 600;
}

.mark-all-btn {
  padding: 0.5rem 1rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-all-btn:hover {
  background-color: #5a67d8;
}

.notifications-list {
  max-height: 600px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item.unread {
  background-color: #f0f9ff;
  border-left: 4px solid #667eea;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.notification-content {
  flex: 1;
  cursor: pointer;
}

.notification-text {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-message {
  color: #374151;
  font-size: 1rem;
  line-height: 1.5;
}

.notification-time {
  color: #6b7280;
  font-size: 0.8rem;
  margin-left: 1rem;
}

.notification-post {
  color: #6b7280;
  font-size: 0.9rem;
  font-style: italic;
  background-color: #f9fafb;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #e5e7eb;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.mark-read-btn {
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #6b7280;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-read-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.delete-btn {
  padding: 0.25rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-weight: 500;
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
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.forum-btn {
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

/* 響應式設計 */
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
  
  .notifications-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .notification-item {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .notification-text {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .notification-time {
    margin-left: 0;
  }
  
  .notification-actions {
    align-self: flex-end;
  }
}
</style> 