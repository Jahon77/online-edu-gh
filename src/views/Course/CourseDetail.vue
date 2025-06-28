<template>
  <Layout>
    <div class="course-detail">
      <div v-if="loading" class="loading">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>加载失败: {{ error }}</p>
        <button @click="fetchCourseDetail">重试</button>
      </div>
      
      <div v-else class="course-content">
        <!-- 课程封面和基本信息 -->
        <div class="course-header">
          <div class="course-cover-container">
            <img :src="course.coverUrl || 'https://via.placeholder.com/800x450'" alt="课程封面" class="course-cover">
            <div class="course-teacher" v-if="course.teacherName">
              <span class="teacher-label">主讲老师: </span>
              <span class="teacher-name">{{ course.teacherName }}</span>
            </div>
          </div>
          
          <div class="course-info">
            <h1 class="course-title">{{ course.title || '课程详情' }}</h1>
            
            <div class="course-meta">
              <span class="category">{{ course.category || '未分类' }}</span>
              <span class="level" :class="`level-${getLevelClass(course.level)}`">{{ course.level || '基础' }}</span>
              <span class="price" :class="{ free: course.price === 0 }">
                {{ course.price === 0 ? '免费' : '￥' + course.price }}
              </span>
              <span class="subscribers">{{ course.subscriberCount || 0 }}人已订阅</span>
            </div>
            
            <div class="course-actions">
              <button class="btn preview" @click="previewCourse">
                <i class="icon-play"></i>立即试看
              </button>
              <button 
                class="btn bookmark" 
                :class="{ active: course.isBookmarked }"
                @click="toggleBookmark"
              >
                <i :class="course.isBookmarked ? 'icon-bookmark-filled' : 'icon-bookmark'"></i>
                {{ course.isBookmarked ? '已收藏' : '收藏课程' }}
              </button>
              <button 
                class="btn subscribe" 
                :class="{ subscribed: course.isSubscribed }"
                @click="subscribeCourse"
                :disabled="course.isSubscribed"
              >
                {{ course.isSubscribed ? '已订阅' : '订阅课程' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 视频播放器 (当打开试看或已订阅时显示) -->
        <div v-if="showPlayer" class="video-player-container">
          <div class="video-player">
            <video 
              ref="videoPlayer" 
              controls 
              :src="currentVideo.videoUrl" 
              @timeupdate="onTimeUpdate"
              @ended="onVideoEnded"
            ></video>
            
            <!-- 试看提示 -->
            <div v-if="isPreviewMode && !course.isSubscribed" class="preview-overlay" :style="previewStyle">
              <div class="preview-message">
                <h3>试看结束</h3>
                <p>订阅课程后可观看完整内容</p>
                <button class="btn subscribe" @click="subscribeCourse">立即订阅</button>
              </div>
            </div>
          </div>
          
          <div class="video-info">
            <h3>{{ currentVideo.title }}</h3>
            <p>{{ currentVideo.description }}</p>
          </div>
        </div>
        
        <!-- 课程内容标签页 -->
        <div class="course-tabs">
          <div class="tab-header">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'intro' }"
              @click="activeTab = 'intro'"
            >
              课程介绍
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'chapters' }"
              @click="activeTab = 'chapters'"
            >
              课程章节
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'comments' }"
              @click="fetchComments(); activeTab = 'comments'"
            >
              学员评价
            </button>
          </div>
          
          <div class="tab-content">
            <!-- 课程介绍 -->
            <div v-if="activeTab === 'intro'" class="intro-content">
              <div class="markdown-content">
                {{ course.introMd || '暂无课程介绍' }}
              </div>
            </div>
            
            <!-- 课程章节 -->
            <div v-if="activeTab === 'chapters'" class="chapters">
              <div v-if="!course.chapters || course.chapters.length === 0" class="empty">
                暂无章节内容
              </div>
              <div v-else class="chapter-list">
                <div 
                  v-for="(chapter, index) in course.chapters" 
                  :key="index" 
                  class="chapter-item"
                  :class="{ 'active': currentChapterIndex === index, 'locked': !chapter.isPreviewable && !course.isSubscribed }"
                  @click="playChapter(index)"
                >
                  <div class="chapter-info">
                    <h3>{{ chapter.title }}</h3>
                    <p>{{ chapter.description }}</p>
                  </div>
                  <div class="chapter-meta">
                    <span class="duration">{{ formatDuration(chapter.duration) }}</span>
                    <span v-if="!course.isSubscribed && !chapter.isPreviewable" class="lock-icon">
                      <i class="icon-lock"></i>
                    </span>
                    <span v-else-if="chapter.isPreviewable" class="preview-badge">可试看</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 学员评价 -->
            <div v-if="activeTab === 'comments'" class="comments">
              <div v-if="loadingComments" class="loading-comments">
                <p>加载评论中...</p>
              </div>
              <div v-else-if="comments.length === 0" class="empty">
                暂无评价
              </div>
              <div v-else class="comment-list">
                <div v-for="comment in comments" :key="comment.id" class="comment-item">
                  <div class="comment-header">
                    <div class="comment-user">
                      <img :src="comment.studentAvatar || 'https://via.placeholder.com/40'" alt="用户头像" class="user-avatar">
                      <span class="user-name">{{ comment.studentName }}</span>
                    </div>
                    <div class="comment-rating">
                      <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= comment.rating }">
                        ★
                      </span>
                    </div>
                  </div>
                  <div class="comment-content">
                    {{ comment.content }}
                  </div>
                  <div class="comment-time">
                    {{ formatDate(comment.createdAt) }}
                  </div>
                </div>
              </div>
              
              <!-- 添加评价表单 (仅订阅用户可见) -->
              <div v-if="course.isSubscribed" class="add-comment">
                <h3>添加评价</h3>
                <div class="rating-select">
                  <span>评分: </span>
                  <span 
                    v-for="i in 5" 
                    :key="i" 
                    class="star" 
                    :class="{ 'filled': i <= newComment.rating }"
                    @click="newComment.rating = i"
                  >
                    ★
                  </span>
                </div>
                <textarea 
                  v-model="newComment.content" 
                  placeholder="分享你的学习体验..." 
                  rows="4"
                ></textarea>
                <button class="btn submit-comment" @click="submitComment">提交评价</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from 'src/components/commen/layout.vue';
import axios from 'src/utils/http';
export default {
  name: 'CourseDetail',
  components: { Layout },
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      course: {},
      loading: true,
      error: null,
      activeTab: 'intro',
      showPlayer: false,
      currentChapterIndex: 0,
      currentVideo: {},
      isPreviewMode: false,
      previewPercentage: 15, // 默认试看百分比
      comments: [],
      loadingComments: false,
      newComment: {
        rating: 5,
        content: ''
      },
      // 模拟用户信息，实际应从登录状态获取
      currentUser: {
        id: 1,
        name: '测试用户'
      }
    };
  },
  computed: {
    previewStyle() {
      // 计算试看覆盖层的样式
      if (!this.isPreviewMode || this.course.isSubscribed) return {};
      return {
        opacity: this.videoProgress > (this.previewPercentage / 100) ? 1 : 0,
        pointerEvents: this.videoProgress > (this.previewPercentage / 100) ? 'auto' : 'none'
      };
    }
  },
  mounted() {
    this.fetchCourseDetail();
  },
  methods: {
    async fetchCourseDetail() {
      this.loading = true;
      this.error = null;
      
      try {
        // 获取课程详情
        const response = await axios.get(`/api/courses/${this.id}`, {
          params: {
            studentId: this.currentUser.id
          }
        });
        
        this.course = response.data.data;
        
        // 设置预览百分比
        this.previewPercentage = this.course.previewPercent || 15;
        
        this.loading = false;
      } catch (err) {
        console.error('获取课程详情失败:', err);
        this.error = '获取课程详情失败，请稍后重试';
        this.loading = false;
      }
    },
    
    async fetchComments() {
      if (this.comments.length > 0) return; // 已加载过评论
      
      this.loadingComments = true;
      try {
        const response = await axios.get(`/api/courses/${this.id}/comments`);
        this.comments = response.data.data.records || [];
        this.loadingComments = false;
      } catch (err) {
        console.error('获取评论失败:', err);
        this.loadingComments = false;
      }
    },
    
    async submitComment() {
      if (!this.newComment.content.trim()) {
        alert('请输入评价内容');
        return;
      }
      
      try {
        await axios.post(`/api/courses/${this.id}/comments`, null, {
          params: {
            studentId: this.currentUser.id,
            content: this.newComment.content,
            rating: this.newComment.rating
          }
        });
        
        // 重新加载评论
        this.comments = [];
        this.fetchComments();
        
        // 清空表单
        this.newComment.content = '';
        this.newComment.rating = 5;
        
        alert('评价提交成功');
      } catch (err) {
        console.error('提交评价失败:', err);
        alert('评价提交失败，请稍后重试');
      }
    },
    
    async toggleBookmark() {
      try {
        if (this.course.isBookmarked) {
          // 取消收藏
          await axios.delete(`/api/courses/${this.id}/bookmark`, {
            params: { studentId: this.currentUser.id }
          });
          this.course.isBookmarked = false;
        } else {
          // 添加收藏
          await axios.post(`/api/courses/${this.id}/bookmark`, null, {
            params: { studentId: this.currentUser.id }
          });
          this.course.isBookmarked = true;
        }
      } catch (err) {
        console.error('收藏操作失败:', err);
        alert('操作失败，请稍后重试');
      }
    },
    
    async subscribeCourse() {
      if (this.course.isSubscribed) return;
      
      try {
        await axios.post(`/api/courses/${this.id}/subscribe`, null, {
          params: {
            studentId: this.currentUser.id,
            level: this.course.level,
            isFree: this.course.price === 0
          }
        });
        
        this.course.isSubscribed = true;
        alert('订阅成功，现在可以观看完整课程内容了！');
        
        // 如果当前在试看模式，重新加载视频
        if (this.showPlayer && this.isPreviewMode) {
          this.playChapter(this.currentChapterIndex);
        }
      } catch (err) {
        console.error('订阅失败:', err);
        alert('订阅失败，请稍后重试');
      }
    },
    
    previewCourse() {
      // 默认播放第一个章节
      if (this.course.chapters && this.course.chapters.length > 0) {
        this.playChapter(0, true);
      }
    },
    
    playChapter(index, preview = false) {
      // 检查是否可以播放
      const chapter = this.course.chapters[index];
      if (!chapter) return;
      
      // 如果未订阅且不是可试看章节，则提示
      if (!this.course.isSubscribed && !chapter.isPreviewable) {
        alert('请先订阅课程');
        return;
      }
      
      this.currentChapterIndex = index;
      this.currentVideo = chapter;
      this.showPlayer = true;
      this.isPreviewMode = preview || (!this.course.isSubscribed && chapter.isPreviewable);
      
      // 切换到章节标签页
      this.activeTab = 'chapters';
      
      // 等待DOM更新后初始化视频播放器
      this.$nextTick(() => {
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.currentTime = 0;
          this.$refs.videoPlayer.play();
        }
      });
    },
    
    onTimeUpdate(event) {
      if (!this.isPreviewMode || this.course.isSubscribed) return;
      
      const video = event.target;
      this.videoProgress = video.currentTime / video.duration;
      
      // 如果超过试看百分比，暂停视频
      if (this.videoProgress > (this.previewPercentage / 100)) {
        video.pause();
      }
    },
    
    onVideoEnded() {
      // 视频结束时的逻辑
      console.log('视频播放结束');
    },
    
    formatDuration(seconds) {
      if (!seconds) return '00:00';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    
    getLevelClass(level) {
      if (!level) return 'basic';
      
      switch (level.toLowerCase()) {
        case '基础':
          return 'basic';
        case '目标':
          return 'target';
        case '菁英':
          return 'elite';
        default:
          return 'basic';
      }
    }
  }
}
</script>

<style scoped>
.course-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 加载状态 */
.loading, .error {
  text-align: center;
  padding: 40px 0;
}

.loading p {
  font-size: 18px;
  color: #757575;
}

.error p {
  font-size: 18px;
  color: #D32F2F;
  margin-bottom: 15px;
}

.error button {
  padding: 8px 16px;
  background-color: #F44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 课程头部 */
.course-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.course-cover-container {
  flex: 0 0 500px;
  position: relative;
}

.course-cover {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-teacher {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.teacher-name {
  font-weight: bold;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 28px;
  margin-bottom: 15px;
  color: #333;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.course-meta span {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.category {
  background-color: #ABD7FB;
  color: #1976D2;
}

.level {
  background-color: #D2E0AA;
  color: #388E3C;
}

.level-elite {
  background-color: #FCCEB4;
  color: #D84315;
}

.level-target {
  background-color: #F9F2EF;
  color: #5D4037;
}

.level-basic {
  background-color: #D2E0AA;
  color: #388E3C;
}

.price {
  background-color: #FCCEB4;
  color: #F98C53;
  font-weight: bold;
}

.price.free {
  background-color: #D2E0AA;
  color: #388E3C;
}

.subscribers {
  background-color: #F9F2EF;
  color: #5D4037;
}

.course-actions {
  margin-top: auto;
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn.preview {
  background-color: #F98C53;
  color: white;
}

.btn.preview:hover {
  background-color: #E67E45;
}

.btn.bookmark {
  background-color: #F9F2EF;
  color: #5D4037;
}

.btn.bookmark:hover {
  background-color: #F0E5E0;
}

.btn.bookmark.active {
  background-color: #FCCEB4;
  color: #F98C53;
}

.btn.subscribe {
  background-color: #ABD7FB;
  color: #1976D2;
}

.btn.subscribe:hover {
  background-color: #9CC5E8;
}

.btn.subscribe.subscribed {
  background-color: #D2E0AA;
  color: #388E3C;
  cursor: default;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 视频播放器 */
.video-player-container {
  margin-bottom: 30px;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  position: relative;
  width: 100%;
  background-color: #000;
}

.video-player video {
  width: 100%;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.preview-message {
  text-align: center;
  color: white;
  padding: 20px;
}

.preview-message h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.preview-message p {
  margin-bottom: 20px;
}

.video-info {
  padding: 15px;
}

.video-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.video-info p {
  margin: 0;
  color: #666;
}

/* 标签页 */
.course-tabs {
  margin-bottom: 30px;
}

.tab-header {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #757575;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #F98C53;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #F98C53;
}

.tab-content {
  min-height: 300px;
}

/* 课程介绍 */
.intro-content {
  line-height: 1.6;
  color: #333;
}

.markdown-content {
  white-space: pre-line;
}

/* 章节列表 */
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chapter-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.chapter-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.chapter-item.active {
  border-color: #ABD7FB;
  background-color: #F0F7FF;
}

.chapter-item.locked {
  opacity: 0.7;
}

.chapter-info {
  flex: 1;
}

.chapter-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.chapter-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.chapter-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.duration {
  font-size: 14px;
  color: #757575;
}

.lock-icon {
  color: #F98C53;
}

.preview-badge {
  background-color: #ABD7FB;
  color: #1976D2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* 评论区 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-weight: 500;
}

.comment-rating {
  display: flex;
}

.star {
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
}

.star.filled {
  color: #F98C53;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.5;
}

.comment-time {
  text-align: right;
  font-size: 12px;
  color: #757575;
}

.add-comment {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.add-comment h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.rating-select {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.add-comment textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 15px;
}

.submit-comment {
  background-color: #F98C53;
  color: white;
}

.submit-comment:hover {
  background-color: #E67E45;
}

.empty, .loading-comments {
  text-align: center;
  padding: 40px 0;
  color: #757575;
  font-style: italic;
}

/* 图标样式 */
[class^="icon-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
}

.icon-play:before {
  content: "▶";
}

.icon-bookmark:before {
  content: "☆";
}

.icon-bookmark-filled:before {
  content: "★";
}

.icon-lock:before {
  content: "🔒";
}
</style>