<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <!-- <div class="vertical-title">论坛</div> -->
      <div class="content-container">
        <!-- <div class="page-header">
          <h2>学习论坛</h2>
          <p>与同学们分享学习心得，讨论课程内容</p>
        </div> -->

        <!-- 操作欄 -->
        <div class="action-bar">
          <div class="left-actions">
            <button @click="goToProfile" class="profile-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              个人资料
            </button>
            <button @click="goToNotifications" class="notification-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              通知
               <span v-if="unreadCount>0" class="badge">{{ unreadCount }}</span>
            </button>
            <button @click="showPostModal = true" class="post-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              发布帖子
            </button>
          </div>
          <div class="right-actions">
            <div class="filter-group">
              <select v-model="selectedTag" @change="loadPosts" class="filter-select">
                <option value="">全部标签</option>
                <option v-for="tag in tags" :key="tag.id" :value="tag.id">
                  {{ tag.name }}
                </option>
              </select>
              <select v-model="sortBy" @change="loadPosts" class="filter-select">
                <option value="latest">最新发布</option>
                <option value="hot">最热门</option>
                <option value="likes">最多点赞</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 帖子列表 -->
        <div v-if="posts.length > 0" class="posts-section">
          <div class="posts-grid">
            <div v-for="post in posts" :key="post.id" class="post-card" @click="viewPost(post.id)">
              <div class="post-header">
                <div class="user-info">
                  <img :src="post.userAvatar || '/default-avatar.png'" :alt="post.userName" class="user-avatar" />
                  <div class="user-details">
                    <h4 class="user-name">{{ post.userName }}</h4>
                    <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-tags" v-if="post.tags && post.tags.length > 0">
                  <span v-for="tag in post.tags" :key="tag.id" class="tag">
                    {{ tag.name }}
                  </span>
                </div>
              </div>
              
              <div class="post-content">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-text">{{ truncateText(post.content, 150) }}</p>
                <div v-if="post.imagesUrl && post.imagesUrl.length > 0" class="post-images">
                  <img v-for="(image, index) in post.imagesUrl.slice(0, 3)" 
                       :key="index" :src="image" :alt="`圖片${index + 1}`" class="post-image" />
                  <div v-if="post.imagesUrl.length > 3" class="more-images">
                    +{{ post.imagesUrl.length - 3 }}
                  </div>
                </div>
              </div>
              
              <div class="post-footer">
                <div class="post-stats">
                  <div class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>{{ post.likeCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>{{ post.commentCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>{{ post.favoriteCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分頁 -->
          <BasePager v-model="currentPage" :total-items="totalItems" :page-size="pageSize" />
        </div>

        <!-- 空狀態 -->
        <div v-else-if="!loading" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>暂无帖子</h3>
          <p>成为第一个发布帖子的用户吧！</p>
          <button @click="showPostModal = true" class="post-btn">
            发布帖子
          </button>
        </div>

        <!-- 加載狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    </div>

    <!-- 發帖模態框 -->
    <div v-if="showPostModal" class="modal-overlay" @click="showPostModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>发布新帖子</h3>
          <button @click="showPostModal = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input v-model="newPost.title" type="text" placeholder="输入帖子标题" class="form-input" />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="newPost.content" placeholder="分享你的想法..." class="form-textarea" rows="6"></textarea>
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="tag-selector">
              <span v-for="tag in tags" :key="tag.id" 
                    :class="['tag-option', { active: selectedTags.includes(tag.id) }]"
                    @click="toggleTag(tag.id)">
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showPostModal = false" class="cancel-btn">取消</button>
          <button @click="submitPost" :disabled="submitting" class="submit-btn">
            {{ submitting ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BasePager from '@/components/BasePager.vue'

const router = useRouter()

// 響應式數據
const posts = ref([])
const tags = ref([])
const loading = ref(false)
const submitting = ref(false)
const showPostModal = ref(false)
const selectedTag = ref('')
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(5)
const totalPages = ref(1)
const currentUserId = ref(null) // 添加當前用戶ID
const unreadCount = ref(0)
const totalItems = ref(0)

const newPost = ref({
  title: '',
  content: '',
  tags: []
})

const selectedTags = ref([])

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
  }
}

// 方法
const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (selectedTag.value) {
      params.tagId = selectedTag.value
    }
    
    // 1. 加載帖子列表
    const response = await axios.get('http://localhost:8080/api/forum/post/list', { params })
    const postsList = response.data.records || []
    totalItems.value = response.data.total || 0
    totalPages.value = Math.ceil(totalItems.value / pageSize.value)

    // 2. 為每個帖子加載額外信息
    const postsWithDetails = await Promise.all(postsList.map(async (post) => {
      try {
        // 加載用戶信息
        const userResponse = await axios.get(`http://localhost:8080/user/${post.userId}`)
        post.userName = userResponse.data.data.name || userResponse.data.data.username || '未知用戶'
        post.userAvatar = userResponse.data.data.avatar || '/default-avatar.png'

        // 加載點贊數量
        const likeResponse = await axios.get(`http://localhost:8080/api/forum/like/postCount/${post.id}`)
        post.likeCount = likeResponse.data.data

        // 加載評論數量
        const commentResponse = await axios.get(`http://localhost:8080/api/forum/comment/count/${post.id}`)
        post.commentCount = commentResponse.data

        // 加載收藏數量
        const favoriteResponse = await axios.get(`http://localhost:8080/api/forum/favorite/count/${post.id}`)
        post.favoriteCount = favoriteResponse.data.data

        // 加載標籤信息
        if (post.tagId) {
          const tagResponse = await axios.get(`http://localhost:8080/api/forum/tag/${post.tagId}`)
          post.tags = tagResponse.data ? [tagResponse.data] : []
        } else {
          post.tags = []
        }

        return post
      } catch (error) {
        console.error(`加載帖子 ${post.id} 的詳細信息失敗:`, error)
        return {
          ...post,
          userName: '未知用戶',
          userAvatar: '/default-avatar.png',
          likeCount: 0,
          commentCount: 0,
          favoriteCount: 0,
          tags: []
        }
      }
    }))

    // 3. 根據排序方式對帖子進行排序
    posts.value = postsWithDetails.sort((a, b) => {
      switch (sortBy.value) {
        case 'hot':
          return (b.commentCount + b.likeCount) - (a.commentCount + a.likeCount)
        case 'likes':
          return b.likeCount - a.likeCount
        case 'latest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  } catch (error) {
    console.error('加載帖子失敗:', error)
    posts.value = []
  } finally {
    loading.value = false
  }
}

const loadTags = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/forum/tag/list')
    tags.value = response.data || []
  } catch (error) {
    console.error('加載標籤失敗:', error)
  }
}

const viewPost = (postId) => {
  router.push(`/forum/post/${postId}`)
}

const goToProfile = () => {
  router.push('/forum/profile')
}

const goToNotifications = () => {
  router.push('/forum/notifications')
}

const submitPost = async () => {
  // 检查用户是否已登录
  if (!currentUserId.value) {
    alert('请先登录再发布帖子');
    // 可以选择跳转到登录页面
    // router.push('/login');
    return;
  }
  
  if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
    alert('請填寫標題和內容')
    return
  }
  
  submitting.value = true
  try {
    const postData = {
      userId: currentUserId.value, // 使用當前用戶ID
      title: newPost.value.title,
      content: newPost.value.content,
      status: 'active'
    }
    // 如果有標籤，且只支持單標籤
    if (selectedTags.value.length > 0) {
      postData.tagId = selectedTags.value[0]
    }
    await axios.post('http://localhost:8080/api/forum/post/create', postData)
    
    // 重置表單
    newPost.value = { title: '', content: '', tags: [] }
    selectedTags.value = []
    showPostModal.value = false
    
    // 重新加載帖子
    await loadPosts()
  } catch (error) {
    console.error('發佈帖子失敗:', error)
    alert('發佈失敗，請重試')
  } finally {
    submitting.value = false
  }
}

const toggleTag = (tagId) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagId)
  }
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '剛剛'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const loadUnread = async () => {
  if(!currentUserId.value) return
  try{
    const resp = await axios.get(`http://localhost:8080/api/forum/notification/unreadCount/${currentUserId.value}`)
    unreadCount.value = resp.data.data || 0
  }catch{}
}

watch(currentPage, () => {
  loadPosts()
})

onMounted(() => {
  // 在组件挂载时获取当前用户ID
  getCurrentUserId()
  loadPosts()
  loadTags()
  loadUnread()
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.left-actions {
  display: flex;
  gap: 1rem;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-btn:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.notification-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notification-btn:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.post-btn {
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

.post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.posts-grid {
  display: grid;
  gap: 1.5rem;
}

.post-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.post-time {
  font-size: 0.85rem;
  color: #6b7280;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.post-content {
  margin-bottom: 1rem;
}

.post-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #111827;
}

.post-text {
  margin: 0 0 1rem 0;
  color: #6b7280;
  line-height: 1.6;
}

.post-images {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.post-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.more-images {
  width: 80px;
  height: 80px;
  background-color: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-weight: 600;
}

.post-footer {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}

.post-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
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

/* 模態框樣式 */
.modal-overlay {
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

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-option {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.tag-option:hover {
  background-color: #f3f4f6;
}

.tag-option.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover {
  background-color: #f3f4f6;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  
  .action-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .post-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .post-tags {
    align-self: flex-start;
  }
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: #ef4444;
  color: #fff;
  font-size: 12px;
  line-height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #fff;
}
</style> 