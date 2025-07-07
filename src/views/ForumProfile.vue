<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <div class="vertical-title">個人資料</div>
      <div class="content-container">
        <div class="back-section">
          <button @click="$router.push({ name: 'forum' })" class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回論壇
          </button>
        </div>

        <div class="page-header">
          <h2>論壇個人資料</h2>
          <p>查看您的論壇活動和統計數據</p>
        </div>

        <!-- 加載狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加載中...</p>
        </div>

        <!-- 用戶資料 -->
        <div v-else-if="userStats" class="profile-content">
          <!-- 用戶基本信息 -->
          <div class="user-info-card">
            <div class="user-avatar-section">
              <img :src="userStats.avatar || '/default-avatar.png'" :alt="userStats.username" class="user-avatar" />
              <h3 class="user-name">{{ userStats.username }}</h3>
            </div>
            <div class="user-stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ userStats.forumPostCount || 0 }}</div>
                <div class="stat-label">發帖數</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.forumLikeCount || 0 }}</div>
                <div class="stat-label">獲贊數</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.forumCommentCount || 0 }}</div>
                <div class="stat-label">評論數</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.forumFollowingCount || 0 }}</div>
                <div class="stat-label">關注數</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.forumFollowerCount || 0 }}</div>
                <div class="stat-label">粉絲數</div>
              </div>
            </div>
          </div>

          <!-- 標籤頁 -->
          <div class="tabs-section">
            <div class="tabs-header">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="['tab-btn', { active: activeTab === tab.id }]"
              >
                {{ tab.name }}
              </button>
            </div>

            <!-- 我的帖子 -->
            <div v-if="activeTab === 'posts'" class="tab-content">
              <div v-if="myPosts.length > 0" class="posts-list">
                <div v-for="post in paginatedMyPosts" :key="post.id" class="post-item" @click="viewPost(post.id)">
                  <div class="post-header">
                    <h4 class="post-title">{{ post.title }}</h4>
                    <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                  </div>
                  <p class="post-preview">{{ truncateText(post.content, 100) }}</p>
                  <div class="post-stats">
                    <span class="stat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {{ post.likeCount || 0 }}
                    </span>
                    <span class="stat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {{ post.commentCount || 0 }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>您還沒有發佈過帖子</p>
                <button @click="goToForum" class="post-btn">去發帖</button>
              </div>
              <BasePager
                v-model="currentPagePosts"
                :total-items="myPosts.length"
                :page-size="pageSize"
              />
            </div>

            <!-- 我的收藏 -->
            <div v-if="activeTab === 'favorites'" class="tab-content">
              <div v-if="favorites.length > 0" class="posts-list">
                <div v-for="post in paginatedFavorites" :key="post.id" class="post-item" @click="viewPost(post.id)">
                  <div class="post-header">
                    <h4 class="post-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      {{ post.title }}
                    </h4>
                    <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                  </div>
                  <p class="post-preview">{{ truncateText(post.content, 100) }}</p>
                  <div class="post-author">
                    <img :src="post.userAvatar || '/default-avatar.png'" :alt="post.userName" class="author-avatar" />
                    <span class="author-name">{{ post.userName }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>您還沒有收藏任何帖子</p>
                <button @click="goToForum" class="post-btn">去發現</button>
              </div>
              <BasePager
                v-model="currentPageFavorites"
                :total-items="favorites.length"
                :page-size="pageSize"
              />
            </div>

            <!-- 我的點贊 -->
            <div v-if="activeTab === 'likes'" class="tab-content">
              <div v-if="likes.length > 0" class="posts-list">
                <div v-for="post in paginatedLikes" :key="post.id" class="post-item" @click="viewPost(post.id)">
                  <div class="post-header">
                    <h4 class="post-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {{ post.title }}
                    </h4>
                    <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                  </div>
                  <p class="post-preview">{{ truncateText(post.content, 100) }}</p>
                  <div class="post-author">
                    <img :src="post.userAvatar || '/default-avatar.png'" :alt="post.userName" class="author-avatar" />
                    <span class="author-name">{{ post.userName }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>您還沒有給任何帖子點贊</p>
                <button @click="goToForum" class="post-btn">去發現</button>
              </div>
              <BasePager
                v-model="currentPageLikes"
                :total-items="likes.length"
                :page-size="pageSize"
              />
            </div>

            <!-- 我的關注 -->
            <div v-if="activeTab === 'following'" class="tab-content">
              <div v-if="following.length > 0" class="users-list">
                <div v-for="user in following" :key="user.id" class="user-item">
                  <div class="user-info">
                    <img :src="user.followingAvatar || '/default-avatar.png'" :alt="user.followingName" class="user-avatar-small" />
                    <div class="user-details">
                      <h5 class="user-name">{{ user.followingName }}</h5>
                      <span class="follow-time">關注於 {{ formatTime(user.createdAt) }}</span>
                    </div>
                  </div>
                  <button @click="unfollowUser(user.followingId)" class="unfollow-btn">取消關注</button>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>您還沒有關注任何用戶</p>
                <button @click="goToForum" class="post-btn">去發現</button>
              </div>
            </div>

            <!-- 我的粉絲 -->
            <div v-if="activeTab === 'followers'" class="tab-content">
              <div v-if="followers.length > 0" class="users-list">
                <div v-for="user in followers" :key="user.id" class="user-item">
                  <div class="user-info">
                    <img :src="user.followerAvatar || '/default-avatar.png'" :alt="user.followerName" class="user-avatar-small" />
                    <div class="user-details">
                      <h5 class="user-name">{{ user.followerName }}</h5>
                      <span class="follow-time">關注於 {{ formatTime(user.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>您還沒有粉絲</p>
                <button @click="goToForum" class="post-btn">去發帖</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else class="error-state">
          <h3>無法加載用戶資料</h3>
          <button @click="loadUserStats" class="retry-btn">重試</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import BasePager from '@/components/BasePager.vue'

const router = useRouter()

// 響應式數據
const loading = ref(false)
const userStats = ref(null)
const myPosts = ref([])
const favorites = ref([])
const likes = ref([]) // 我的點贊
const following = ref([])
const followers = ref([])
const activeTab = ref('posts')
const currentUserId = ref(null) // 當前用戶ID

// 分頁設定
const pageSize = ref(5)
const currentPagePosts = ref(1)
const currentPageFavorites = ref(1)
const currentPageLikes = ref(1)

// 分頁後的資料
const paginatedMyPosts = computed(() => {
  const start = (currentPagePosts.value - 1) * pageSize.value
  return myPosts.value.slice(start, start + pageSize.value)
})

const paginatedFavorites = computed(() => {
  const start = (currentPageFavorites.value - 1) * pageSize.value
  return favorites.value.slice(start, start + pageSize.value)
})

const paginatedLikes = computed(() => {
  const start = (currentPageLikes.value - 1) * pageSize.value
  return likes.value.slice(start, start + pageSize.value)
})

// 當列表更新時重置頁碼
watch(myPosts, () => { currentPagePosts.value = 1 })
watch(favorites, () => { currentPageFavorites.value = 1 })
watch(likes, () => { currentPageLikes.value = 1 })

const tabs = [
  { id: 'posts', name: '我的帖子' },
  { id: 'favorites', name: '我的收藏' },
  { id: 'likes', name: '我的點贊' },
  { id: 'following', name: '我的關注' },
  { id: 'followers', name: '我的粉絲' }
]

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
const loadUserStats = async () => {
  if (!currentUserId.value) {
    alert('請先登錄再查看個人資料')
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    // 加載用戶基本信息
    const userResponse = await axios.get(`http://localhost:8080/user/${currentUserId.value}`)
    const userData = userResponse.data.data
    
    // 加載用戶的發帖數
    const postCountResponse = await axios.get(`http://localhost:8080/api/forum/post/count/${currentUserId.value}`)
    const postCount = postCountResponse.data.data || 0
    
    // 加載用戶收到的點贊數
    const receivedLikesResp = await axios.get(`http://localhost:8080/api/forum/like/receivedCount/${currentUserId.value}`)
    const receivedLikes = receivedLikesResp.data.data || 0

    // 加載用戶帖子收到的評論數
    const receivedCommentsResp = await axios.get(`http://localhost:8080/api/forum/comment/receivedCount/${currentUserId.value}`)
    const receivedComments = receivedCommentsResp.data.data || 0

    // 合併用戶信息和統計數據
    userStats.value = {
      username: userData.name || userData.username || '未知用戶',
      avatar: userData.avatar || '/default-avatar.png',
      forumPostCount: postCount,
      forumLikeCount: receivedLikes,
      forumCommentCount: receivedComments,
      forumFollowingCount: 0,
      forumFollowerCount: 0
    }
  } catch (error) {
    console.error('加載用戶統計失敗:', error)
  } finally {
    loading.value = false
  }
}

const loadMyPosts = async () => {
  if (!currentUserId.value) return
  
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/post/user/${currentUserId.value}`)
    const posts = response.data || []
    
    // 為每個帖子加載統計數據
    const mappedPosts = await Promise.all(posts.map(async (post) => {
      try {
        // 加載點贊數量
        const likeResponse = await axios.get(`http://localhost:8080/api/forum/like/postCount/${post.id}`)
        post.likeCount = likeResponse.data.data

        // 加載評論數量
        const commentResponse = await axios.get(`http://localhost:8080/api/forum/comment/count/${post.id}`)
        post.commentCount = commentResponse.data

        return post
      } catch (error) {
        console.error(`加載帖子 ${post.id} 的統計數據失敗:`, error)
        return {
          ...post,
          likeCount: 0,
          commentCount: 0
        }
      }
    }))
    // 按帖子創建時間降序排序
    myPosts.value = mappedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('加載我的帖子失敗:', error)
    myPosts.value = []
  }
}

const loadFavorites = async () => {
  if (!currentUserId.value) return
  
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/favorite/user/${currentUserId.value}`)
    // 確保response.data是數組
    const favoritesData = response.data.data || []
    
    // 為每個收藏的帖子加載作者信息
    const mappedFavorites = await Promise.all(favoritesData.map(async (favorite) => {
      try {
        // 加載帖子詳情
        const postResponse = await axios.get(`http://localhost:8080/api/forum/post/detail/${favorite.postId}`)
        const post = postResponse.data
        
        // 加載作者信息
        const userResponse = await axios.get(`http://localhost:8080/user/${post.userId}`)
        const userData = userResponse.data.data
        
        return {
          ...post,
          userName: userData.name || userData.username || '未知用戶',
          userAvatar: userData.avatar || '/default-avatar.png',
          favoriteTime: favorite.createdAt
        }
      } catch (error) {
        console.error(`加載帖子 ${favorite.postId} 的信息失敗:`, error)
        return {
          id: favorite.postId,
          title: '無法加載帖子',
          content: '該帖子可能已被刪除',
          userName: '未知用戶',
          userAvatar: '/default-avatar.png',
          favoriteTime: favorite.createdAt
        }
      }
    }))
    // 按收藏時間降序排序
    favorites.value = mappedFavorites.sort((a, b) => new Date(b.favoriteTime) - new Date(a.favoriteTime))
  } catch (error) {
    console.error('加載收藏失敗:', error)
    favorites.value = []
  }
}

const loadLikes = async () => {
  if (!currentUserId.value) return
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/like/user/${currentUserId.value}`)
    const likesData = response.data.data || []

    // 對於每個點贊紀錄，加載帖子和作者信息
    const mappedLikes = await Promise.all(likesData.map(async (like) => {
      try {
        // 加載帖子詳情
        const postResponse = await axios.get(`http://localhost:8080/api/forum/post/detail/${like.postId}`)
        const post = postResponse.data

        // 加載作者信息
        const userResponse = await axios.get(`http://localhost:8080/user/${post.userId}`)
        const userData = userResponse.data.data

        return {
          ...post,
          userName: userData.name || userData.username || '未知用戶',
          userAvatar: userData.avatar || '/default-avatar.png',
          likeTime: like.createdAt,
        }
      } catch (error) {
        console.error(`加載帖子 ${like.postId} 的信息失敗:`, error)
        return {
          id: like.postId,
          title: '無法加載帖子',
          content: '該帖子可能已被刪除',
          userName: '未知用戶',
          userAvatar: '/default-avatar.png',
          likeTime: like.createdAt
        }
      }
    }))
    // 按點贊時間降序排序
    likes.value = mappedLikes.sort((a, b) => new Date(b.likeTime) - new Date(a.likeTime))
  } catch (error) {
    console.error('加載點贊列表失敗:', error)
    likes.value = []
  }
}

const loadFollowing = async () => {
  if (!currentUserId.value) return
  
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/follow/following/${currentUserId.value}`)
    const followingList = response.data || []
    
    // 為每個關注的用戶加載詳細信息
    following.value = await Promise.all(followingList.map(async (follow) => {
      try {
        const userResponse = await axios.get(`http://localhost:8080/user/${follow.followingId}`)
        const userData = userResponse.data.data
        return {
          ...follow,
          followingName: userData.name || userData.username || '未知用戶',
          followingAvatar: userData.avatar || '/default-avatar.png'
        }
      } catch (error) {
        console.error(`加載用戶 ${follow.followingId} 的信息失敗:`, error)
        return {
          ...follow,
          followingName: '未知用戶',
          followingAvatar: '/default-avatar.png'
        }
      }
    }))
  } catch (error) {
    console.error('加載關注列表失敗:', error)
    following.value = []
  }
}

const loadFollowers = async () => {
  if (!currentUserId.value) return
  
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/follow/followers/${currentUserId.value}`)
    const followersList = response.data || []
    
    // 為每個粉絲加載詳細信息
    followers.value = await Promise.all(followersList.map(async (follow) => {
      try {
        const userResponse = await axios.get(`http://localhost:8080/user/${follow.followerId}`)
        const userData = userResponse.data.data
        return {
          ...follow,
          followerName: userData.name || userData.username || '未知用戶',
          followerAvatar: userData.avatar || '/default-avatar.png'
        }
      } catch (error) {
        console.error(`加載用戶 ${follow.followerId} 的信息失敗:`, error)
        return {
          ...follow,
          followerName: '未知用戶',
          followerAvatar: '/default-avatar.png'
        }
      }
    }))
  } catch (error) {
    console.error('加載粉絲列表失敗:', error)
    followers.value = []
  }
}

const unfollowUser = async (followingId) => {
  // 檢查用戶是否已登錄
  if (!currentUserId.value) {
    alert('請先登錄');
    return;
  }
  
  try {
    await axios.delete(`http://localhost:8080/api/forum/follow/${followingId}?followerId=${currentUserId.value}`)
    
    // 重新加載關注列表和統計
    await Promise.all([
      loadFollowing(),
      loadUserStats()
    ])
  } catch (error) {
    console.error('取消關注失敗:', error)
    alert('取消關注失敗，請重試')
  }
}

const viewPost = (postId) => {
  router.push(`/forum/post/${postId}`)
}

const goToForum = () => {
  router.push('/forum')
}

const goBack = () => {
  router.push('/forum')
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
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleLike = async (post) => {
  try {
    const response = await axios.post(`http://localhost:8080/api/forum/like?userId=${currentUserId.value}&postId=${post.id}`)
    
    if (response.data.status === 0) { // 成功
      post.isLiked = true
      post.likeCount = response.data.data
    } else {
      ElMessage.error(response.data.message || '點贊失敗')
    }
  } catch (error) {
    console.error('點贊失敗:', error)
    ElMessage.error('點贊失敗')
  }
}

const handleUnlike = async (post) => {
  try {
    const response = await axios.post(`http://localhost:8080/api/forum/like/unlike?userId=${currentUserId.value}&postId=${post.id}`)
    
    if (response.data.status === 0) { // 成功
      post.isLiked = false
      post.likeCount = response.data.data
    } else {
      ElMessage.error(response.data.message || '取消點贊失敗')
    }
  } catch (error) {
    console.error('取消點贊失敗:', error)
    ElMessage.error('取消點贊失敗')
  }
}

onMounted(async () => {
  getCurrentUserId()
  if (currentUserId.value) {
    loading.value = true
    try {
      await Promise.all([
        loadUserStats(),
        loadMyPosts(),
        loadFavorites(),
        loadLikes(),
        loadFollowing(),
        loadFollowers()
      ])
    } catch (error) {
      console.error('加載數據失敗:', error)
    } finally {
      loading.value = false
    }
  }
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-info-card {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.user-avatar-section {
  text-align: center;
  margin-bottom: 2rem;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 4px solid #f3f4f6;
}

.user-name {
  margin: 0;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.tabs-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.tab-btn.active {
  background-color: #667eea;
  color: white;
}

.tab-content {
  padding: 2rem;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-item:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.post-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.post-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.post-preview {
  margin: 0 0 1rem 0;
  color: #6b7280;
  line-height: 1.5;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 0.8rem;
  color: #6b7280;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.follow-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.unfollow-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.unfollow-btn:hover {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.post-btn {
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

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.error-state h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.4rem;
  font-weight: 600;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background-color: #e5e7eb;
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
  
  .user-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tabs-header {
    flex-direction: column;
  }
  
  .tab-btn {
    border-bottom: 1px solid #e5e7eb;
  }
  
  .user-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style> 