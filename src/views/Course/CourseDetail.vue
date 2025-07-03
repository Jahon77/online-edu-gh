<template>
  <div class="course-detail-page">
    <!-- 顶部导航栏 - 与课程列表页一致 -->
    <header class="site-header">
      <div class="header-container">
        <div class="logo">
          <h1>智学通</h1>
        </div>
        <nav class="main-nav">
          <ul>
            <li class="active"><router-link to="/courses">课程中心</router-link></li>
            <li><router-link to="/index">首页</router-link></li>
            <li><router-link to="/notice">通知公告</router-link></li>
            <li><router-link to="/about">关于我们</router-link></li>
            <li><router-link to="/use">使用指南</router-link></li>
          </ul>
        </nav>
        <div class="user-actions">
          <button class="btn-download">APP下载</button>
          <div class="user-avatar">
            <img src="https://via.placeholder.com/36" alt="用户头像">
          </div>
        </div>
      </div>
    </header>
    
    <div class="course-detail">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
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
            <img :src="course.coverImage || 'https://via.placeholder.com/800x450'" alt="课程封面" class="course-cover">
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
            
            <div class="course-stats">
              <div class="stat-item">
                <div class="stat-value">{{ course.totalComments || 0 }}</div>
                <div class="stat-label">学员评价</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ course.averageRating || 0 }}</div>
                <div class="stat-label">平均评分</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ course.chapters ? course.chapters.length : 0 }}</div>
                <div class="stat-label">课程章节</div>
              </div>
            </div>
            
            <div class="course-actions">
              <button class="btn preview" @click="previewCourse">
                <i class="icon-play"></i>立即试看
              </button>
              
              <button 
                class="btn like" 
                :class="{ active: course.isLiked }"
                @click="toggleLike"
              >
                <i :class="course.isLiked ? 'icon-like-filled' : 'icon-like'"></i>
                {{ course.isLiked ? '已收藏' : '收藏' }}
              </button>
              
              <button 
                v-if="!course.isPurchased"
                class="btn subscribe" 
                :class="{ subscribed: course.isPurchased }"
                @click="subscribeCourse"
              >
                订阅课程
              </button>
              
              <button 
                v-if="course.isPurchased"
                class="btn unsubscribe"
                @click="unsubscribeCourse"
              >
                取消订阅
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
            <div v-if="isPreviewMode && !course.isPurchased" class="preview-overlay" :style="previewStyle">
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
                  v-for="(chapter, chapterIndex) in course.chapters" 
                  :key="'chapter-' + chapterIndex" 
                  class="chapter-item"
                >
                  <div class="chapter-header" @click="toggleChapter(chapterIndex)">
                    <div class="chapter-title-container">
                      <span class="chapter-toggle">
                        <i class="toggle-icon" v-if="expandedChapters.includes(chapterIndex)">▼</i>
                        <i class="toggle-icon" v-else>▶</i>
                      </span>
                      <h3 class="chapter-title">{{ chapter.chapter ? chapter.chapter.title : chapter.title }}</h3>
                    </div>
                    <div class="chapter-info">
                      <span class="lesson-count">{{ chapter.lessons ? chapter.lessons.length : 0 }}课时</span>
                    </div>
                  </div>
                  <div class="lesson-list" v-show="expandedChapters.includes(chapterIndex)">
                    <div 
                      v-for="(lesson, lessonIndex) in chapter.lessons" 
                      :key="'lesson-' + lessonIndex" 
                      class="lesson-item"
                      :class="{ 'locked': !lesson.isPreview && !course.isPurchased }"
                      @click="navigateToVideoPlayer(lesson.id, course.id)"
                    >
                      <div class="lesson-info">
                        <i class="icon-video">▶</i>
                        <h4>{{ lesson.title }}</h4>
                      </div>
                      <div class="lesson-meta">
                        <span class="duration">{{ formatDuration(lesson.duration) }}</span>
                        <span v-if="!course.isPurchased && !lesson.isPreview" class="lock-icon">
                          <i class="icon-lock"></i>
                        </span>
                        <span v-else-if="lesson.isPreview" class="preview-badge">可试看</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 学员评价 -->
            <div v-if="activeTab === 'comments'" class="comments">
              <div v-if="loadingComments" class="loading-comments">
                <div class="loading-spinner small"></div>
                <p>加载评论中...</p>
              </div>
              <div v-else>
                <!-- 评价列表 -->
                <div v-if="comments.length > 0" class="comment-list">
                <div v-for="comment in comments" :key="comment.id" class="comment-item">
                  <div class="comment-header">
                    <div class="comment-user">
                        <img :src="comment.userAvatar || 'https://via.placeholder.com/40'" alt="用户头像" class="user-avatar">
                        <span class="user-name">{{ comment.username }}</span>
                    </div>
                    <div class="comment-rating">
                        <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= comment.stars }">
                        ★
                      </span>
                    </div>
                  </div>
                  <div class="comment-content">
                    {{ comment.content }}
                  </div>
                    <div class="comment-meta">
                  <div class="comment-time">
                    {{ formatDate(comment.createdAt) }}
                      </div>
                      <div class="comment-likes" v-if="comment.likeCount && comment.likeCount > 0">
                        <i class="icon-like"></i> {{ comment.likeCount }}
                      </div>
                  </div>
                </div>
              </div>
              
                <!-- 暂无评价提示 -->
                <div v-else class="empty">
                  暂无评价
                </div>
                
                <!-- 添加评价表单 -->
                <div class="add-comment">
                <h3>添加评价</h3>
                  <div v-if="!course.isPurchased" class="subscription-notice">
                    <p>您需要先订阅课程才能发表评价</p>
                    <button class="btn subscribe-notice" @click="subscribeCourse">订阅课程</button>
                  </div>
                  <div v-else>
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
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'src/utils/http';
export default {
  name: 'CourseDetail',
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
        id: 7,
        name: '测试用户'
      },
      videoProgress: 0,
      expandedChapters: [] // 存储已展开的章节索引
    };
  },
  computed: {
    previewStyle() {
      // 计算试看覆盖层的样式
      if (!this.isPreviewMode || this.course.isPurchased) return {};
      return {
        opacity: this.videoProgress > (this.previewPercentage / 100) ? 1 : 0,
        pointerEvents: this.videoProgress > (this.previewPercentage / 100) ? 'auto' : 'none'
      };
    }
  },
  mounted() {
    console.log('CourseDetail组件挂载，路由参数ID:', this.id);
    console.log('路由参数完整信息:', this.$route.params);
    
    // 如果没有通过props获取到id，则尝试从路由参数获取
    const courseId = this.id || this.$route.params.id;
    if (!courseId) {
      this.error = '课程ID不存在，无法获取课程详情';
      this.loading = false;
      return;
    }
    
    console.log('最终使用的课程ID:', courseId);
    // 将courseId保存到组件实例中，以便后续使用
    this.courseId = courseId;
    this.fetchCourseDetail();
  },
  methods: {
    async fetchCourseDetail() {
      this.loading = true;
      this.error = null;
      console.log('开始获取课程详情，课程ID:', this.courseId);
      
      // 最大重试次数
      const maxRetries = 3;
      let retryCount = 0;
      
      const fetchData = async () => {
        try {
          // 直接使用标准API
          const res = await axios.get(`/api/courses/${this.courseId}`, {
            params: {
              studentId: this.currentUser.id
            },
            timeout: 15000 // 更长的超时时间
          });
          
          console.log('获取课程详情成功:', res.data);
          
          // 正确检查业务状态码和数据
          if (res.data.status === 0 && res.data.data) {
            // 处理路径中的额外引号问题
            const courseData = res.data.data;
            console.log('处理前的课程数据:', JSON.stringify(courseData));
            
            // 处理所有可能包含引号的路径字段
            if (courseData.coverImage) {
              // 移除开头和结尾的引号，以及转义字符
              courseData.coverImage = courseData.coverImage.replace(/^"|"$/g, "").replace(/\\\\/g, "\\");
            }
            if (courseData.teacherAvatar) {
              courseData.teacherAvatar = courseData.teacherAvatar.replace(/^"|"$/g, "").replace(/\\\\/g, "\\");
            }
            
            console.log('处理后的课程数据:', JSON.stringify(courseData));
            this.course = courseData;
            
            // 设置预览百分比
            this.previewPercentage = this.course.previewPercent || 15;
            
            // 获取订阅状态 - 在课程详情成功后单独获取
            this.fetchSubscriptionStatus();
            
            // 获取收藏状态 - 在课程详情成功后单独获取
            this.fetchLikeStatus();
            
            // 获取章节和课时信息
            this.fetchChapters();
            
            this.loading = false;
          } else {
            console.error('获取课程详情失败:', res.data.message);
            this.error = res.data.message || '获取课程详情失败，请稍后重试';
            this.loading = false;
          }
        } catch (err) {
          console.error(`获取课程详情失败 (尝试 ${retryCount + 1}/${maxRetries}):`, err);
          
          if (retryCount < maxRetries - 1) {
            // 重试
            retryCount++;
            console.log(`正在重试获取课程详情 (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
            return fetchData(); // 递归调用
          } else {
            // 达到最大重试次数
            this.error = '获取课程详情失败，请稍后重试';
            this.loading = false;
          }
        }
      };
      
      await fetchData();
    },
    
    async fetchSubscriptionStatus() {
      try {
        if (!this.currentUser || !this.currentUser.id) {
          console.warn('未登录，无法获取订阅状态');
          return;
        }
        
        console.log('开始获取订阅状态，课程ID:', this.courseId, '学生ID:', this.currentUser.id);
        
        // 添加错误计数和重试
        let retries = 0;
        const maxRetries = 3;
        let success = false;
        
        while (!success && retries < maxRetries) {
          try {
            // 使用直接针对course_subscribe表的接口
            const response = await axios.get(`/api/courses/${this.courseId}/subscribe`, {
              params: { studentId: this.currentUser.id },
              timeout: 15000 // 增加超时时间
            });
            
            console.log('订阅状态API响应数据:', JSON.stringify(response.data));
            
            if (response.data && response.data.status === 0) {
              console.log('获取订阅状态成功:', response.data.data);
              
              // 更新订阅状态
              this.course.isBookmarked = response.data.data;
              this.course.isPurchased = response.data.data;
              success = true;
              
              // 获取订阅人数 - 从课程详情中获取
              if (this.course && (typeof this.course.subscriberCount === 'undefined' || this.course.subscriberCount === 0)) {
                try {
                  // 如果订阅人数未定义，尝试从数据库中获取
                  const courseRes = await axios.get(`/api/courses/${this.courseId}`);
                  console.log('课程详情API响应数据:', JSON.stringify(courseRes.data));
                  
                  if (courseRes.data && courseRes.data.status === 0 && courseRes.data.data) {
                    this.course.subscriberCount = courseRes.data.data.subscriberCount || courseRes.data.data.totalStudents || 0;
                    console.log('从课程详情获取订阅人数:', this.course.subscriberCount);
                  }
                } catch (err) {
                  console.error('获取课程详情失败:', err);
                  this.course.subscriberCount = 0; // 默认值
                }
              }
            } else {
              console.warn('获取订阅状态返回非成功状态码:', response.data);
              retries++;
              
              // 默认设置为未订阅
              this.course.isBookmarked = false;
              this.course.isPurchased = false;
              
              if (retries >= maxRetries) {
                console.error('获取订阅状态失败，达到最大重试次数');
              } else {
                console.log(`订阅状态查询失败，重试第 ${retries} 次`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒再重试
              }
            }
          } catch (error) {
            console.error('获取订阅状态请求异常:', error);
            retries++;
            
            // 出错时设置默认值
            this.course.isBookmarked = false;
            this.course.isPurchased = false;
            
            if (retries >= maxRetries) {
              console.error('获取订阅状态失败，达到最大重试次数');
            } else {
              console.log(`订阅状态查询失败，重试第 ${retries} 次`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒再重试
            }
          }
        }
      } catch (err) {
        console.error('获取订阅状态总体异常:', err);
        // 最终出错时设置默认值，避免UI显示错误
        this.course.isBookmarked = false;
        this.course.isPurchased = false;
        
        console.warn('订阅状态查询失败，设置为默认值（未订阅）');
      }
    },
    
    async fetchLikeStatus() {
      try {
        console.log('开始获取收藏状态，课程ID:', this.courseId);
        const likeRes = await axios.get(`/api/courses/${this.courseId}/like`, {
          params: { studentId: this.currentUser.id },
          timeout: 10000
        });
        
        if (likeRes.data && likeRes.data.status === 0) {
          console.log('获取收藏状态成功:', likeRes.data.data);
          this.course.isLiked = likeRes.data.data;
        } else {
          console.warn('获取收藏状态返回非成功状态码:', likeRes.data);
          this.course.isLiked = false;
        }
      } catch (err) {
        console.error('获取收藏状态失败:', err);
        this.course.isLiked = false;
      }
    },
    
    async fetchChapters() {
      try {
        const chaptersRes = await axios.get(`/api/teacher/courses/${this.courseId}/chapters`);
        if (chaptersRes.data && Array.isArray(chaptersRes.data)) {
          console.log('获取章节和课时成功:', chaptersRes.data);
          // 打印第一个章节的数据结构，以便查看
          if (chaptersRes.data.length > 0) {
            console.log('第一个章节的数据结构:', JSON.stringify(chaptersRes.data[0]));
          }
          this.course.chapters = chaptersRes.data;
        } else {
          console.error('获取章节和课时失败: 返回数据格式不正确');
          this.course.chapters = [];
        }
      } catch (err) {
        console.error('获取章节和课时失败:', err);
        this.course.chapters = [];
      }
      
      console.log('课程详情设置完成，chapters长度:', this.course.chapters.length);
    },
    
    toggleChapter(chapterIndex) {
      const index = this.expandedChapters.indexOf(chapterIndex);
      if (index === -1) {
        // 如果章节未展开，则展开它
        this.expandedChapters.push(chapterIndex);
      } else {
        // 如果章节已展开，则折叠它
        this.expandedChapters.splice(index, 1);
      }
    },
    
    async fetchComments() {
      if (this.comments.length > 0) return; // 已加载过评论
      
      this.loadingComments = true;
      console.log('开始获取课程评论，课程ID:', this.courseId);
      
      try {
        const response = await axios.get(`/api/courses/${this.courseId}/comments`);
        console.log('获取评论成功:', response.data);
        
        if (response.data.status === 0 && response.data.data) {
          // 处理评论数据
          const commentsData = response.data.data.records || [];
          console.log('评论数据详情:', JSON.stringify(commentsData));
          
          // 处理头像URL中的引号
          commentsData.forEach(comment => {
            if (comment.userAvatar) {
              comment.userAvatar = comment.userAvatar.replace(/^"|"$/g, "").replace(/\\\\/g, "\\");
            }
            // 确保前端显示正确
            console.log(`评论ID ${comment.id} 的星级:`, comment.stars);
            
            // 如果后端返回的是rating而不是stars，进行转换
            if (comment.rating !== undefined && comment.stars === undefined) {
              comment.stars = comment.rating;
            }
          });
          
          this.comments = commentsData;
        } else {
          console.error('获取评论失败:', response.data.message);
          this.comments = [];
        }
        
        this.loadingComments = false;
      } catch (err) {
        console.error('获取评论失败:', err);
        this.loadingComments = false;
        this.comments = [];
      }
    },
    
    async submitComment() {
      if (!this.newComment.content.trim()) {
        alert('请输入评价内容');
        return;
      }
      
      console.log('提交评价:', this.newComment);
      
      try {
        // 后端接口参数名为rating，而不是stars
        const response = await axios.post(`/api/studentcourse/${this.courseId}/comments`, null, {
          params: {
            studentId: this.currentUser.id,
            content: this.newComment.content,
            rating: this.newComment.rating
          }
        });
        
        console.log('提交评价响应:', response.data);
        
        if (response.data && response.data.status === 0) {
          // 重新加载评论
          this.comments = [];
          await this.fetchComments();
          
          // 更新课程平均评分
          if (this.updateAverageRating) {
            this.updateAverageRating();
          }
          
          // 清空表单
          this.newComment.content = '';
          this.newComment.rating = 5;
          
          alert('评价提交成功');
        } else {
          alert('评价提交失败: ' + (response.data?.msg || '未知错误'));
        }
      } catch (err) {
        console.error('提交评价失败:', err);
        alert('评价提交失败: ' + (err.response?.data?.msg || '请稍后重试'));
      }
    },
    
    async toggleLike() {
      try {
        console.log('开始收藏操作，课程ID:', this.courseId, '学生ID:', this.currentUser.id);
        
        if (this.course.isLiked) {
          // 取消收藏
          console.log('执行取消收藏');
          const response = await axios.delete(`/api/courses/${this.courseId}/like`, {
            params: { studentId: this.currentUser.id }
          });
          
          console.log('取消收藏响应:', response.data);
          if (response.data && response.data.status === 0) {
            this.course.isLiked = false;
            alert('已取消收藏');
          } else {
            alert('取消收藏失败: ' + (response.data?.msg || '未知错误'));
          }
        } else {
          // 添加收藏
          console.log('执行添加收藏');
          const response = await axios.post(`/api/courses/${this.courseId}/like`, null, {
            params: { studentId: this.currentUser.id }
          });
          
          console.log('添加收藏响应:', response.data);
          if (response.data && response.data.status === 0) {
            this.course.isLiked = true;
            alert('收藏成功');
          } else {
            alert('收藏失败: ' + (response.data?.msg || '未知错误'));
          }
        }
      } catch (err) {
        console.error('收藏操作失败:', err);
        alert('操作失败，请稍后重试');
      }
    },
    
    async subscribeCourse() {
      if (!this.currentUser || !this.currentUser.id) {
        alert('请先登录');
        return;
      }
      
      if (this.course.isPurchased) {
        console.log('用户已订阅课程，无需重复订阅');
        return;
      }
      
      console.log('开始订阅课程，课程ID:', this.courseId, '学生ID:', this.currentUser.id);
      
      try {
        // 使用原生fetch API - 最简单的方式
        const url = `/api/studentcourse/${this.courseId}/subscribe?studentId=${this.currentUser.id}`;
        console.log('订阅课程请求URL:', url);
        
        // 显示加载中
        alert('正在订阅课程，请稍候...');
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        console.log('订阅课程API响应状态:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('订阅课程API响应数据:', data);
          
          if (data && data.status === 0) {
            console.log('订阅课程成功');
            // 更新课程状态
            this.course.isPurchased = true;
            this.course.isBookmarked = true;
            
            // 更新订阅人数 - 直接+1
            if (typeof this.course.subscriberCount === 'number') {
              this.course.subscriberCount += 1;
              console.log('更新订阅人数为:', this.course.subscriberCount);
            } else {
              // 如果订阅人数不是数字，设为1
              this.course.subscriberCount = 1;
            }
            
            alert('订阅成功，现在可以观看完整课程内容了！');
            
            // 如果当前在试看模式，重新加载视频
            if (this.showPlayer && this.isPreviewMode) {
              this.playChapter(this.currentChapterIndex);
            }
          } else {
            alert('订阅失败: ' + (data?.message || '请稍后重试'));
          }
        } else {
          // 尝试读取错误响应
          let errorText = '';
          try {
            const errorData = await response.text();
            console.error('错误响应内容:', errorData);
            errorText = errorData;
          } catch (e) {
            errorText = '无法读取错误详情';
          }
          
          alert(`订阅失败: HTTP状态码 ${response.status}; ${errorText}`);
        }
      } catch (err) {
        console.error('订阅课程请求异常:', err);
        alert('订阅失败: ' + err.message);
      }
    },
    
    async unsubscribeCourse() {
      if (!this.course.isPurchased) return;
      
      if (!this.currentUser || !this.currentUser.id) {
        alert('请先登录');
        return;
      }
      
      if (!confirm('确定要取消订阅该课程吗？')) {
        return;
      }
      
      try {
        console.log('开始取消订阅课程 - 课程ID:', this.courseId, '学生ID:', this.currentUser.id);
        
        // 显示加载状态
        this.$message = this.$message || {};
        const loadingMessage = this.$message.loading ? 
          this.$message.loading('正在取消订阅...', 0) : 
          { close: () => console.log('关闭加载提示') };
        
        // 使用统一的DELETE API端点
        const params = new URLSearchParams();
        params.append('studentId', this.currentUser.id);
        
        const response = await axios.delete(`/api/studentcourse/${this.courseId}/unsubscribe`, {
          params: { studentId: this.currentUser.id },
          timeout: 15000
        });
        
        // 关闭加载状态
        loadingMessage.close();
        
        console.log('取消订阅响应:', JSON.stringify(response.data));
        
        if (response.data && response.data.status === 0) {
          this.course.isPurchased = false;
          this.course.isBookmarked = false;
          
          // 更新订阅人数 - 直接-1，但不小于0
          if (typeof this.course.subscriberCount === 'number' && this.course.subscriberCount > 0) {
            this.course.subscriberCount -= 1;
            console.log('更新订阅人数为:', this.course.subscriberCount);
          } else {
            this.course.subscriberCount = 0;
          }
          
          alert('取消订阅成功');
          
          // 如果当前在视频播放模式，关闭播放器
          if (this.showPlayer && !this.isPreviewMode) {
            this.showPlayer = false;
          }
        } else {
          console.error('取消订阅失败:', response.data);
          alert('取消订阅失败: ' + (response.data?.message || '请稍后重试'));
        }
      } catch (err) {
        console.error('取消订阅失败:', err);
        alert('取消订阅失败: ' + (err.response?.data?.message || '网络错误，请稍后重试'));
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
      
      // 修改：无论订阅与否，都可以试看第一个章节
      if (!this.course.isPurchased && index > 0 && !chapter.isPreviewable) {
        alert('请先订阅课程');
        return;
      }
      
      this.currentChapterIndex = index;
      this.currentVideo = chapter;
      this.showPlayer = true;
      this.isPreviewMode = preview || (!this.course.isPurchased && (chapter.isPreviewable || index === 0));
      
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
      if (!this.isPreviewMode || this.course.isPurchased) return;
      
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
    },
    
    navigateToVideoPlayer(lessonId, courseId) {
      // 检查是否可以访问该视频
      const canAccess = this.course.isPurchased || this.isLessonPreviewable(lessonId);
      
      if (canAccess) {
        console.log(`跳转到视频播放页 - 课时ID: ${lessonId}, 课程ID: ${courseId}`);
        this.$router.push({
          name: 'StudentCoursePlayer',
          params: { lessonId: lessonId },
          query: { 
            courseId: courseId,
            studentId: this.currentUser.id
          }
        });
      } else {
        alert('请先订阅课程以观看完整内容');
      }
    },
    
    isLessonPreviewable(lessonId) {
      // 检查课时是否可试看
      for (const chapterWithLessons of this.course.chapters) {
        for (const lesson of chapterWithLessons.lessons) {
          if (lesson.id === lessonId) {
            return lesson.isPreview;
          }
        }
      }
      return false;
    },
    
    async updateAverageRating() {
      try {
        // 获取最新的课程详情，以更新平均评分
        const response = await axios.get(`/api/courses/${this.courseId}/rating`, {
          params: { studentId: this.currentUser.id }
        });
        
        if (response.data && response.data.status === 0) {
          // 更新平均评分
          if (response.data.data && typeof response.data.data.averageRating !== 'undefined') {
            this.course.averageRating = response.data.data.averageRating;
            console.log('更新课程平均评分成功:', this.course.averageRating);
          }
          
          // 更新评论总数
          if (response.data.data && typeof response.data.data.totalComments !== 'undefined') {
            this.course.totalComments = response.data.data.totalComments;
            console.log('更新课程评论总数成功:', this.course.totalComments);
          }
        } else {
          console.error('获取课程评分信息失败:', response.data);
        }
      } catch (err) {
        console.error('更新课程平均评分失败:', err);
      }
    }
  }
}
</script>

<style scoped>
/* 整体页面样式 */
.course-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 顶部导航栏样式 */
.site-header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  color: #F98C53;
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav li {
  margin: 0 15px;
}

.main-nav a {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 10px 0;
  position: relative;
  transition: color 0.3s;
}

.main-nav a:hover,
.main-nav li.active a {
  color: #F98C53;
}

.main-nav li.active a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #F98C53;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-download {
  background-color: #F98C53;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-download:hover {
  background-color: #e67e45;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 课程详情页样式 */
.course-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  min-height: calc(100vh - 60px);
}

/* 加载状态 */
.loading, .error {
  text-align: center;
  padding: 60px 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ABD7FB;
  border-radius: 50%;
  border-top-color: #F98C53;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  transition: background-color 0.3s;
}

.error button:hover {
  background-color: #d32f2f;
}

/* 课程内容 */
.course-content {
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin-top: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

/* 课程头部 */
.course-header {
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  height: 480px;
  background: white;
}

.course-cover-container {
  flex: 1;
  position: relative;
}

.course-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-teacher {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 16px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.teacher-name {
  font-weight: bold;
  margin-left: 5px;
}

.course-info {
  width: 50%;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.course-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.course-title {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
  line-height: 1.2;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
}

.course-meta span {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-meta span:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category {
  background-color: #ABD7FB;
  color: #1976D2;
}

.level {
  background-color: #D2E0AA;
  color: #4a6741;
}

.level-elite {
  background-color: #FCCEB4;
  color: #F98C53;
}

.level-target {
  background-color: #F9F2EF;
  color: #5D4037;
}

.level-basic {
  background-color: #D2E0AA;
  color: #4a6741;
}

.price {
  background-color: #FCCEB4;
  color: #F98C53;
  font-weight: bold;
}

.price.free {
  background-color: #D2E0AA;
  color: #4a6741;
}

.subscribers {
  background-color: #F9F2EF;
  color: #5D4037;
}

/* 课程统计信息 */
.course-stats {
  display: flex;
  margin-bottom: 30px;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 12px;
  flex: 1;
  transition: transform 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item:hover {
  transform: translateY(-5px);
  background-color: #f0f7ff;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #F98C53;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.course-actions {
  display: flex;
  flex-direction: row; /* 改为水平排列 */
  flex-wrap: wrap; /* 允许按钮换行 */
  gap: 8px; /* 减小间距 */
  margin-top: 20px;
  width: 100%;
  max-width: 100%; /* 允许占满整个宽度 */
  align-self: center;
  justify-content: center; /* 居中对齐 */
}

.btn {
  padding: 10px 15px; /* 减小垂直内边距 */
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  width: auto; /* 根据内容自适应宽度 */
  min-width: 120px; /* 设置最小宽度 */
  flex: 0 1 auto; /* 不拉伸，可缩小，基于内容大小 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.btn.preview {
  background-color: #F98C53;
  color: white;
  margin-bottom: 5px;
}

.btn.preview:hover {
  background-color: #f87b3a;
}

.btn.like {
  background-color: #F9F2EF;
  color: #F98C53;
  border: 2px solid #FCCEB4;
}

.btn.like.active {
  background-color: #FCCEB4;
  border-color: #F98C53;
  color: #F98C53;
}

.btn.subscribe {
  background-color: #D2E0AA;
  color: #4a6741;
}

.btn.subscribe:hover {
  background-color: #c5d695;
}

.btn.subscribe.subscribed {
  background-color: #ABD7FB;
  color: #1976D2;
}

.btn.unsubscribe {
  background-color: #ff6b6b;
  color: white;
}

.btn.unsubscribe:hover {
  background-color: #ff5252;
}

/* 视频播放器 */
.video-player-container {
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s;
}

.preview-message {
  text-align: center;
  color: white;
  padding: 30px 50px;
  background: rgba(249, 140, 83, 0.2);
  border: 2px solid #F98C53;
  border-radius: 15px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.preview-message h3 {
  font-size: 28px;
  margin-bottom: 15px;
}

.preview-message p {
  margin-bottom: 25px;
  font-size: 16px;
}

.video-info {
  padding: 20px;
}

.video-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #333;
}

.video-info p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* 标签页 */
.course-tabs {
  padding: 0 30px 30px;
}

.tab-header {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 25px;
}

.tab-btn {
  padding: 15px 30px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #757575;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-btn:hover {
  color: #F98C53;
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
  animation: growWidth 0.3s ease-out;
}

@keyframes growWidth {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.tab-content {
  min-height: 300px;
  animation: fadeIn 0.4s ease-out;
}

/* 课程介绍 */
.intro-content {
  line-height: 1.8;
  color: #333;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 15px;
  overflow: hidden;
  transition: all 0.3s;
  display: block; /* 修改为块级显示 */
  cursor: default; /* 移除整体的指针样式 */
}

.chapter-item:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  border-color: #ABD7FB;
  transform: none; /* 移除整体的悬停效果 */
}

.chapter-item.active {
  border-color: #ABD7FB;
  background-color: #F0F7FF;
  box-shadow: 0 4px 12px rgba(171, 215, 251, 0.3);
}

.chapter-item.locked {
  opacity: 0.8;
  position: relative;
}

.chapter-item.locked::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.03),
    rgba(0, 0, 0, 0.03) 10px,
    rgba(0, 0, 0, 0.06) 10px,
    rgba(0, 0, 0, 0.06) 20px
  );
  border-radius: 8px;
  pointer-events: none;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: all 0.3s;
  border-left: 3px solid #F98C53;
}

.chapter-header:hover {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.chapter-title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chapter-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.lesson-count {
  font-size: 14px;
  color: #666;
  background-color: #e8e8e8;
  padding: 2px 8px;
  border-radius: 12px;
}

.chapter-toggle {
  font-size: 14px;
  color: #F98C53;
  transition: transform 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.toggle-icon {
  transition: transform 0.3s;
}

.lesson-list {
  padding: 0 15px 15px 35px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.lesson-item {
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eee;
}

.lesson-item:hover {
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.lesson-item.locked {
  opacity: 0.7;
  background-color: #f9f9f9;
}

.lesson-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lesson-info h4 {
  margin: 0;
  font-size: 15px;
  color: #333;
}

.icon-video {
  color: #F98C53;
  font-size: 14px;
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.duration {
  font-size: 14px;
  color: #757575;
  font-weight: 500;
}

.lock-icon {
  color: #F98C53;
  font-size: 18px;
}

.preview-badge {
  background-color: #ABD7FB;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 评论区 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.3s, box-shadow 0.3s;
}

.comment-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #F9F2EF;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.comment-rating {
  display: flex;
}

.star {
  color: #ddd;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}

.star:hover {
  transform: scale(1.2);
}

.star.filled {
  color: #F98C53;
}

.comment-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #333;
  font-size: 15px;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
}

.comment-time {
  font-size: 13px;
}

.comment-likes {
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-comment {
  margin-top: 40px;
  padding: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.add-comment h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.subscription-notice {
  text-align: center;
  padding: 20px;
  background-color: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 15px;
}

.subscription-notice p {
  margin-bottom: 15px;
  color: #1976D2;
}

.btn.subscribe-notice {
  background-color: #ABD7FB;
  color: #1976D2;
  margin: 0 auto;
}

.btn.subscribe-notice:hover {
  background-color: #9CC5E8;
}

.rating-select {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.add-comment textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 20px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.add-comment textarea:focus {
  outline: none;
  border-color: #ABD7FB;
  box-shadow: 0 0 0 2px rgba(171, 215, 251, 0.3);
}

.submit-comment {
  background-color: #F98C53;
  color: white;
  font-weight: 600;
}

.submit-comment:hover {
  background-color: #E67E45;
}

.empty, .loading-comments {
  text-align: center;
  padding: 50px 0;
  color: #757575;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.loading-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
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

.icon-like:before {
  content: "☆";
}

.icon-like-filled:before {
  content: "★";
  color: #F98C53;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .course-header {
    flex-direction: column;
    height: auto;
  }
  
  .course-info {
    width: 100%;
    border-left: none;
    padding: 25px;
  }
  
  .course-cover {
    height: 400px;
  }
  
  .course-actions {
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .course-detail {
    padding: 15px;
  }
  
  .course-content {
    padding: 20px;
  }
  
  .course-info {
    padding: 20px;
  }
  
  .course-title {
    font-size: 1.8em;
  }
  
  .course-meta span {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .btn {
    padding: 10px 12px;
    font-size: 14px;
  }
}
</style>