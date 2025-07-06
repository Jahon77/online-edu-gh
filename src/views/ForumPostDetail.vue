<template>
  <div class="page">
    <TeacherHeader />
    <div class="main-content">
      <div class="vertical-title">論壇</div>
      <div class="content-container">
        <!-- 返回按鈕 -->
        <div class="back-section">
          <button @click="goBack" class="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回論壇
          </button>
        </div>

        <!-- 加載狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加載中...</p>
        </div>

        <!-- 帖子詳情 -->
        <div v-else-if="post" class="post-detail">
          <!-- 帖子頭部 -->
          <div class="post-header">
            <div class="user-info">
              <img :src="post.userAvatar || '/default-avatar.png'" :alt="post.userName" class="user-avatar" />
              <div class="user-details">
                <h4 class="user-name">{{ post.userName }}</h4>
                <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              </div>
            </div>
            <div class="post-actions">
              <button v-if="isPostAuthor" @click="confirmDeletePost" class="delete-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                删除
              </button>
              <button @click="handleLike" :class="['action-btn', { active: isLiked }]" :disabled="likeInProgress">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {{ post.likeCount || 0 }}
              </button>
              <button @click="handleFavorite" :class="['action-btn', { active: isFavorited }]" :disabled="favoriteInProgress">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {{ post.favoriteCount || 0 }}
              </button>
            </div>
          </div>

          <!-- 帖子標籤 -->
          <div v-if="post.tags && post.tags.length > 0" class="post-tags">
            <span v-for="tag in post.tags" :key="tag.id" class="tag">
              {{ tag.name }}
            </span>
          </div>

          <!-- 帖子內容 -->
          <div class="post-content">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-text">{{ post.content }}</div>
            <div v-if="post.imagesUrl && post.imagesUrl.length > 0" class="post-images">
              <img v-for="(image, index) in post.imagesUrl" 
                   :key="index" :src="image" :alt="`圖片${index + 1}`" 
                   class="post-image" @click="viewImage(image)" />
            </div>
          </div>

          <!-- 評論區域 -->
          <div class="comments-section">
            <h3>評論 ({{ post.commentCount || 0 }})</h3>
            
            <!-- 發表評論 -->
            <div class="comment-form">
              <textarea v-model="newComment" placeholder="寫下你的評論..." class="comment-input" rows="3"></textarea>
              <button @click="submitComment" :disabled="submitting" class="comment-btn">
                {{ submitting ? '發表中...' : '發表評論' }}
              </button>
            </div>

            <!-- 評論列表 -->
            <div v-if="comments.length > 0" class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <div class="comment-user">
                    <img :src="comment.userAvatar || '/default-avatar.png'" :alt="comment.userName" class="comment-avatar" />
                    <div class="comment-user-info">
                      <h5 class="comment-user-name">{{ comment.userName }}</h5>
                      <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="comment-actions">
                    <button v-if="isCommentAuthor(comment)" @click="confirmDeleteComment(comment)" class="comment-delete-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                    <button @click="likeComment(comment.id)" :class="['comment-action-btn', { active: comment.isLiked }]" v-if="false">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {{ comment.likeCount || 0 }}
                    </button>
                    <button @click="replyToComment(comment)" class="comment-action-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      回復
                    </button>
                  </div>
                </div>
                <div class="comment-content">
                  <p>{{ comment.content }}</p>
                </div>
                
                <!-- 回復列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <div class="reply-header">
                      <div class="reply-user">
                        <img :src="reply.userAvatar || '/default-avatar.png'" :alt="reply.userName" class="reply-avatar" />
                        <div class="reply-user-info">
                          <h6 class="reply-user-name">
                            {{ reply.userName }}
                            <span class="reply-to">回復</span>
                            <span class="replied-user">{{ reply.replyToUserName }}</span>
                          </h6>
                          <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="reply-actions">
                        <button v-if="isCommentAuthor(reply)" @click="confirmDeleteComment(reply)" class="comment-delete-btn">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      <button @click="likeReply(reply.id)" :class="['reply-action-btn', { active: reply.isLiked }]" v-if="false">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {{ reply.likeCount || 0 }}
                      </button>
                        <button @click="replyToReply(comment, reply)" class="reply-action-btn">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          回復
                        </button>
                      </div>
                    </div>
                    <div class="reply-content">
                      <p>{{ reply.content }}</p>
                    </div>
                  </div>
                </div>

                <!-- 回復表單 -->
                <div v-if="replyingTo === comment.id" class="reply-form">
                  <div class="reply-form-header">
                    <span class="replying-to">回復 <strong>{{ replyingToReply ? replyingToReply.userName : comment.userName }}</strong>：</span>
                  </div>
                  <textarea v-model="replyContent" placeholder="寫下你的回復..." class="reply-input" rows="2"></textarea>
                  <div class="reply-form-actions">
                    <button @click="cancelReply" class="cancel-reply-btn">取消</button>
                    <button @click="submitReply(comment.id)" :disabled="submitting" class="submit-reply-btn">
                      {{ submitting ? '發表中...' : '發表回復' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空評論狀態 -->
            <div v-else class="empty-comments">
              <p>暫無評論，成為第一個評論的用戶吧！</p>
            </div>
          </div>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else class="error-state">
          <h3>帖子不存在或已被刪除</h3>
          <button @click="goBack" class="back-btn">返回論壇</button>
        </div>
      </div>
    </div>

    <!-- 圖片預覽模態框 -->
    <div v-if="showImageModal" class="image-modal" @click="showImageModal = false">
      <img :src="selectedImage" alt="預覽圖片" class="modal-image" @click.stop />
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-confirm" @click.stop>
        <div class="modal-header">
          <h3>{{ deleteType === 'post' ? '删除帖子' : '删除评论' }}</h3>
          <button @click="cancelDelete" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ deleteType === 'post' ? '确定要删除这个帖子吗？此操作不可恢复，帖子下的所有评论也会被删除。' : '确定要删除这条评论吗？此操作不可恢复，评论下的所有回复也会被删除。' }}</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="cancel-btn">取消</button>
          <button @click="confirmDelete" class="delete-confirm-btn">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TeacherHeader from '@/components/commen/header/TeacherHeader.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// 響應式數據
const post = ref(null)
const comments = ref([])
const loading = ref(false)
const submitting = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)
const newComment = ref('')
const replyingTo = ref(null)
const replyingToReply = ref(null)
const replyContent = ref('')
const showImageModal = ref(false)
const selectedImage = ref('')
const likeInProgress = ref(false) // 新增：專門用於點讚操作
const favoriteInProgress = ref(false) // 新增：專門用於收藏操作
const currentUserId = ref(null) // 当前用户ID
const showDeleteConfirm = ref(false)
const deleteType = ref('') // 'post' 或 'comment'
const deleteItemId = ref(null) // 要删除的帖子或评论ID

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
const loadPost = async () => {
  loading.value = true
  try {
    // 确保已获取用户ID
    if (!currentUserId.value) {
      getCurrentUserId();
    }
    
    // 如果用户未登录，可以选择显示提示或跳转到登录页
    if (!currentUserId.value) {
      console.warn('用户未登录，部分功能可能不可用');
      // 可以选择是否跳转
      // return router.push('/login');
    }
    
    // 1. 加载帖子详情
    const response = await axios.get(`http://localhost:8080/api/forum/post/detail/${route.params.id}`, {
      timeout: 5000
    })
    post.value = response.data
    
    // 加載帖子作者信息
    try {
      const userResponse = await axios.get(`http://localhost:8080/user/${post.value.userId}`)
      post.value.userName = userResponse.data.data.name || userResponse.data.data.username || '未知用戶'
      post.value.userAvatar = userResponse.data.data.avatar || '/default-avatar.png'
    } catch (error) {
      console.error(`加載帖子作者信息失敗:`, error)
      post.value.userName = '未知用戶'
      post.value.userAvatar = '/default-avatar.png'
    }
    
    // 2. 同时加载各种状态和数据
    await Promise.all([
      loadLikeStatus(),
      loadFavoriteStatus(),
      loadLikeCount(),
      loadFavoriteCount(),
      loadCommentCount()
    ])
  } catch (error) {
    console.error('加載帖子失敗:', error)
    post.value = null
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/comment/list`, {
      params: {
        pageNum: 1,
        pageSize: 50,
        postId: route.params.id
      }
    })
    
    // 處理評論數據，組織成樹形結構
    const commentsList = response.data.records || []
    
    // 將評論分為頂層評論和回復
    const topLevelComments = commentsList.filter(comment => !comment.parentId)
    const replies = commentsList.filter(comment => comment.parentId)
    
    // 收集所有用戶ID，以便批量獲取用戶信息
    const userIds = new Set()
    commentsList.forEach(comment => {
      userIds.add(comment.userId)
    })
    
    // 創建用戶ID到用戶信息的映射
    const userInfoMap = {}
    
    // 獲取所有用戶信息
    for (const userId of userIds) {
      try {
        const userResponse = await axios.get(`http://localhost:8080/user/${userId}`)
        if (userResponse.data && userResponse.data.data) {
          userInfoMap[userId] = {
            userName: userResponse.data.data.name || userResponse.data.data.username || `用戶${userId}`,
            userAvatar: userResponse.data.data.avatar || '/default-avatar.png'
          }
        } else {
          userInfoMap[userId] = {
            userName: `用戶${userId}`,
            userAvatar: '/default-avatar.png'
          }
        }
      } catch (error) {
        console.error(`加載用戶${userId}信息失敗:`, error)
        userInfoMap[userId] = {
          userName: `用戶${userId}`,
          userAvatar: '/default-avatar.png'
        }
      }
    }
    
    // 創建評論ID到評論對象的映射，方便查找
    const commentMap = new Map()
    commentsList.forEach(comment => {
      commentMap.set(comment.id, comment)
    })
    
    // 為每個評論添加用戶信息
    topLevelComments.forEach(comment => {
      const userInfo = userInfoMap[comment.userId] || { userName: `用戶${comment.userId}`, userAvatar: '/default-avatar.png' }
      comment.userName = userInfo.userName
      comment.userAvatar = userInfo.userAvatar
      comment.replies = []
    })
    
    // 為每個回復添加用戶信息和被回復者信息
    replies.forEach(reply => {
      const userInfo = userInfoMap[reply.userId] || { userName: `用戶${reply.userId}`, userAvatar: '/default-avatar.png' }
      reply.userName = userInfo.userName
      reply.userAvatar = userInfo.userAvatar
      
      // 找到被回復的評論或回復
      const parent = commentMap.get(reply.parentId)
      if (parent) {
        // 為回復添加被回復者的信息
        const parentUserInfo = userInfoMap[parent.userId] || { userName: `用戶${parent.userId}` }
        reply.replyToUserName = parentUserInfo.userName
        
        // 如果父級是頂層評論，直接添加到其回復列表
        if (!parent.parentId) {
          parent.replies.push(reply)
        } else {
          // 如果父級是回復，找到對應的頂層評論
          const topLevelComment = topLevelComments.find(comment => {
            return comment.id === parent.parentId || comment.replies.some(r => r.id === parent.id)
          })
          if (topLevelComment) {
            topLevelComment.replies.push(reply)
          }
        }
      }
    })
    
    comments.value = topLevelComments
    
    // 如果用户已登录，加载评论的点赞状态
    if (currentUserId.value) {
      await loadCommentsLikeStatus()
    }
  } catch (error) {
    console.error('加載評論失敗:', error)
    comments.value = []
  }
}

// 加载评论的点赞状态
const loadCommentsLikeStatus = async () => {
  if (!currentUserId.value || comments.value.length === 0) return
  
  try {
    // 为每个评论加载点赞状态
    for (const comment of comments.value) {
      try {
        const response = await axios.get(`http://localhost:8080/api/forum/like/isLiked`, {
          params: {
            userId: currentUserId.value,
            commentId: comment.id
          }
        })
        comment.isLiked = response.data
        
        // 如果评论有回复，也加载回复的点赞状态
        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            try {
              const replyResponse = await axios.get(`http://localhost:8080/api/forum/like/isLiked`, {
                params: {
                  userId: currentUserId.value,
                  commentId: reply.id
                }
              })
              reply.isLiked = replyResponse.data
  } catch (error) {
              console.error(`加載回復${reply.id}點贊狀態失敗:`, error)
  }
}
        }
      } catch (error) {
        console.error(`加載評論${comment.id}點贊狀態失敗:`, error)
      }
    }
  } catch (error) {
    console.error('加載評論點贊狀態失敗:', error)
  }
}

// 加載點贊狀態
const loadLikeStatus = async () => {
  // 如果用户未登录，不检查点赞状态
  if (!currentUserId.value) {
    isLiked.value = false;
    return;
  }
  
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/like/isLiked`, {
      params: {
        userId: currentUserId.value,
        postId: route.params.id
      }
    })
    isLiked.value = response.data.data === true
  } catch (error) {
    console.error('加載點贊狀態失敗:', error)
    isLiked.value = false
  }
}

// 加載收藏狀態
const loadFavoriteStatus = async () => {
  // 如果用户未登录，不检查收藏状态
  if (!currentUserId.value) {
    isFavorited.value = false;
    return;
  }
  
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/favorite/isFavorited`, {
      params: {
        userId: currentUserId.value,
        postId: route.params.id
      }
    })
    isFavorited.value = response.data.data === true
  } catch (error) {
    console.error('加載收藏狀態失敗:', error)
    isFavorited.value = false
  }
}

// 加載點贊數量
const loadLikeCount = async () => {
  try {
    const postId = route.params.id
    const response = await axios.get(`http://localhost:8080/api/forum/like/postCount/${postId}`)
    if (post.value) {
      post.value.likeCount = response.data.data
    }
  } catch (error) {
    console.error('加載點贊數量失敗:', error)
  }
}

// 加載收藏數量
const loadFavoriteCount = async () => {
  try {
    const postId = route.params.id
    const favoriteResponse = await axios.get(`http://localhost:8080/api/forum/favorite/count/${postId}`)
    if (post.value) {
      post.value.favoriteCount = favoriteResponse.data.data
    }
  } catch (error) {
    console.error('加載收藏數量失敗:', error)
  }
}

// 加載評論數量
const loadCommentCount = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/forum/comment/count/${route.params.id}`)
    if (post.value) {
      post.value.commentCount = response.data
    }
  } catch (error) {
    console.error('加載評論數量失敗:', error)
  }
}

// 處理點讚
const handleLike = async () => {
  // 检查用户是否已登录
  if (!currentUserId.value) {
    alert('請先登錄再進行點讚操作');
    return;
  }
  
  if (likeInProgress.value) return
  
  likeInProgress.value = true
  try {
    let response;
    // 根據當前狀態決定操作
    if (isLiked.value) {
      // 取消點讚使用 DELETE 請求
      response = await axios.delete(`http://localhost:8080/api/forum/like`, {
        params: {
          userId: currentUserId.value,
          postId: post.value.id
        }
      });
    } else {
      // 點讚使用 POST 請求
      response = await axios.post(`http://localhost:8080/api/forum/like`, null, {
        params: {
          userId: currentUserId.value,
          postId: post.value.id
        }
      });
    }
    
    // 檢查響應是否成功
    if (response.data.status === 0) {
      // 更新點讚狀態
      isLiked.value = !isLiked.value;
      
      // 更新點讚數量
      if (isLiked.value) {
        post.value.likeCount = (post.value.likeCount || 0) + 1;
      } else {
        post.value.likeCount = Math.max(0, (post.value.likeCount || 0) - 1);
      }
      
      // 為了確保數據準確性，從服務器重新加載點讚數量
      await loadLikeCount();
    }
  } catch (error) {
    console.error('點讚操作失敗:', error);
  } finally {
    likeInProgress.value = false;
  }
}

// 處理收藏
const handleFavorite = async () => {
  // 检查用户是否已登录
  if (!currentUserId.value) {
    alert('請先登錄再進行收藏操作');
    return;
  }
  
  if (favoriteInProgress.value) return
  
  favoriteInProgress.value = true
  try {
    let response;
    // 根據當前狀態決定操作
    if (isFavorited.value) {
      response = await axios.post(`http://localhost:8080/api/forum/favorite/unfavorite`, null, {
        params: {
          userId: currentUserId.value,
          postId: post.value.id
        }
      });
    } else {
      response = await axios.post(`http://localhost:8080/api/forum/favorite/favorite`, null, {
        params: {
          userId: currentUserId.value,
          postId: post.value.id
        }
      });
    }
    
    // 檢查響應是否成功
    if (response.data.status === 0) {
      // 更新收藏狀態
      isFavorited.value = !isFavorited.value;
      
      // 更新收藏數量
      if (isFavorited.value) {
        post.value.favoriteCount = (post.value.favoriteCount || 0) + 1;
      } else {
        post.value.favoriteCount = Math.max(0, (post.value.favoriteCount || 0) - 1);
      }
      
      // 為了確保數據準確性，從服務器重新加載收藏數量
      await loadFavoriteCount();
    }
  } catch (error) {
    console.error('收藏操作失敗:', error);
  } finally {
    favoriteInProgress.value = false;
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  if (submitting.value) return
  
  submitting.value = true
  try {
    const response = await axios.post('http://localhost:8080/api/forum/comment/create', {
      postId: post.value.id,
      userId: currentUserId.value,
      content: newComment.value.trim()
    })
    
    if (response.data === true) {
    newComment.value = ''
    await loadComments()
      await loadCommentCount() // 更新評論數量
    }
  } catch (error) {
    console.error('發表評論失敗:', error)
  } finally {
    submitting.value = false
  }
}

// 回复评论
const replyToComment = (comment) => {
  replyingTo.value = comment.id
  replyingToReply.value = null
  replyContent.value = ''
}

// 回复某条回复
const replyToReply = (comment, reply) => {
  replyingTo.value = comment.id
  replyingToReply.value = reply
  replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  replyingToReply.value = null
  replyContent.value = ''
}

// 提交回復後更新評論數量
const submitReply = async (parentIdParam) => {
  if (!replyContent.value.trim()) return
  if (submitting.value) return
  
  submitting.value = true
  try {
    const parentIdToUse = replyingToReply.value ? replyingToReply.value.id : parentIdParam
    const response = await axios.post('http://localhost:8080/api/forum/comment/create', {
      postId: post.value.id,
      userId: currentUserId.value,
      parentId: parentIdToUse,
      content: replyContent.value.trim()
    })
    
    if (response.data === true) {
      replyContent.value = ''
      replyingTo.value = null
      replyingToReply.value = null
    await loadComments()
      await loadCommentCount() // 更新評論數量
    }
  } catch (error) {
    console.error('發表回復失敗:', error)
  } finally {
    submitting.value = false
  }
}

const likeComment = async (commentId) => {
  // 检查用户是否已登录
  if (!currentUserId.value) {
    alert('请先登录再进行点赞操作');
    // 可以选择跳转到登录页面
    // router.push('/login');
    return;
  }
  
  try {
    const comment = comments.value.find(c => c.id === commentId)
    if (comment.isLiked) {
      await axios.delete(`http://localhost:8080/api/forum/like/comment/${commentId}?userId=${currentUserId.value}`)
      comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1)
    } else {
      await axios.post(`http://localhost:8080/api/forum/like/comment/${commentId}?userId=${currentUserId.value}`)
      comment.likeCount = (comment.likeCount || 0) + 1
    }
    comment.isLiked = !comment.isLiked
  } catch (error) {
    console.error('點贊評論失敗:', error)
  }
}

const likeReply = async (replyId) => {
  // 检查用户是否已登录
  if (!currentUserId.value) {
    alert('请先登录再进行点赞操作');
    // 可以选择跳转到登录页面
    // router.push('/login');
    return;
  }
  
  try {
    // 在評論列表中查找回復
    for (const comment of comments.value) {
      if (comment.replies) {
        const reply = comment.replies.find(r => r.id === replyId)
        if (reply) {
          if (reply.isLiked) {
            await axios.delete(`http://localhost:8080/api/forum/like/comment/${replyId}?userId=${currentUserId.value}`)
            reply.likeCount = Math.max(0, (reply.likeCount || 0) - 1)
          } else {
            await axios.post(`http://localhost:8080/api/forum/like/comment/${replyId}?userId=${currentUserId.value}`)
            reply.likeCount = (reply.likeCount || 0) + 1
          }
          reply.isLiked = !reply.isLiked
          break
        }
      }
    }
  } catch (error) {
    console.error('點贊回復失敗:', error)
  }
}

const viewImage = (imageUrl) => {
  selectedImage.value = imageUrl
  showImageModal.value = true
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

const goBack = () => {
  router.push('/forum')
}

// 计算属性 - 判断当前用户是否为帖子作者
const isPostAuthor = computed(() => {
  return post.value && currentUserId.value && post.value.userId === currentUserId.value
})

// 方法 - 判断当前用户是否为评论作者
const isCommentAuthor = (comment) => {
  return currentUserId.value && comment.userId === currentUserId.value
}

// 确认删除帖子
const confirmDeletePost = () => {
  deleteType.value = 'post'
  deleteItemId.value = post.value.id
  showDeleteConfirm.value = true
}

// 确认删除评论
const confirmDeleteComment = (comment) => {
  deleteType.value = 'comment'
  deleteItemId.value = comment.id
  showDeleteConfirm.value = true
}

// 取消删除
const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteType.value = ''
  deleteItemId.value = null
}

// 确认删除
const confirmDelete = async () => {
  if (deleteType.value === 'post') {
    await deletePost()
  } else {
    await deleteComment()
  }
}

// 删除帖子
const deletePost = async () => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/forum/post/delete/${deleteItemId.value}`, {
      params: {
        userId: currentUserId.value
      }
    })
    
    if (response.data === true) {
      alert('帖子删除成功')
      // 返回论坛首页
      router.push('/forum')
    } else {
      alert('删除失败，您可能没有权限删除此帖子')
    }
  } catch (error) {
    console.error('删除帖子失败:', error)
    alert('删除失败，请重试')
  }
}

// 删除评论
const deleteComment = async () => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/forum/comment/delete/${deleteItemId.value}`, {
      params: {
        userId: currentUserId.value
      }
    })
    
    if (response.data === true) {
      await loadComments()
      await loadCommentCount() // 更新評論數量
      showDeleteConfirm.value = false
      deleteItemId.value = null
      deleteType.value = ''
    }
  } catch (error) {
    console.error('刪除評論失敗:', error)
  }
}

onMounted(() => {
  // 在组件挂载时获取当前用户ID
  getCurrentUserId()
  loadPost()
  loadComments()
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

.post-detail {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.post-time {
  font-size: 0.9rem;
  color: #6b7280;
}

.post-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
}

.action-btn.active:hover {
  background-color: #5a67d8;
}

.action-btn svg {
  transition: transform 0.2s ease;
}

.action-btn:hover:not(:disabled) svg {
  transform: scale(1.1);
}

.action-btn.active svg {
  fill: currentColor;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
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
  margin-bottom: 2rem;
}

.post-title {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.post-text {
  margin: 0 0 1.5rem 0;
  color: #374151;
  line-height: 1.7;
  font-size: 1rem;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.post-image:hover {
  transform: scale(1.02);
}

.comments-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 2rem;
}

.comments-section h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.3rem;
  font-weight: 600;
}

.comment-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
}

.comment-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
}

.comment-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comment-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.comment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-user-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.comment-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.8rem;
  transition: color 0.2s ease;
}

.comment-action-btn:hover {
  color: #374151;
}

.comment-action-btn.active {
  color: #667eea;
}

.comment-content {
  margin-bottom: 1rem;
}

.comment-content p {
  margin: 0;
  color: #374151;
  line-height: 1.6;
}

.replies-list {
  margin-top: 1rem;
  margin-left: 2rem;
  border-left: 2px solid #e5e7eb;
  padding-left: 1rem;
}

.reply-item {
  margin-bottom: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reply-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.reply-user-info {
  display: flex;
  flex-direction: column;
}

.reply-user-name {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reply-to {
  color: #6b7280;
  font-weight: normal;
  font-size: 0.8rem;
}

.replied-user {
  color: #4b5563;
  font-weight: 500;
}

.reply-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
}

.reply-action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.8rem;
  transition: color 0.2s;
}

.reply-action-btn:hover {
  color: #4b5563;
}

.reply-action-btn.active {
  color: #ef4444;
}

.reply-content {
  margin-left: 2.75rem;
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
}

.reply-form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.reply-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 0.75rem;
}

.reply-input:focus {
  outline: none;
  border-color: #667eea;
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-reply-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.9rem;
}

.submit-reply-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
}

.submit-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
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

/* 圖片預覽模態框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
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
  
  .post-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .post-actions {
    align-self: flex-start;
  }
  
  .post-title {
    font-size: 1.5rem;
  }
  
  .replies-list {
    margin-left: 1rem;
  }
}

/* 删除按钮样式 */
.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
}

.delete-btn:hover {
  background-color: #fecaca;
  transform: translateY(-1px);
}

.comment-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
}

.comment-delete-btn:hover {
  background-color: #fecaca;
  transform: translateY(-1px);
}

/* 删除确认对话框样式 */
.delete-confirm {
  max-width: 400px;
}

.delete-confirm-btn {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.delete-confirm-btn:hover {
  background-color: #dc2626;
}

/* 模态框样式 */
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
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  color: #4b5563;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #f3f4f6;
}

.reply-form-header {
  margin-bottom: 0.5rem;
}

.replying-to {
  font-size: 0.85rem;
  color: #6b7280;
}

.replying-to strong {
  color: #4b5563;
}
</style> 