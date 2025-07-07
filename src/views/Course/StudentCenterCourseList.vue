<template>
  <div>
    <!-- 添加统一的顶部导航栏 -->
    <SiteHeader />
    
    <div class="student-center-course-list">
      <!-- 使用新的StudentSidebar组件 -->
      <StudentSidebar activePage="course-list" :showUpgrade="true" />
      
      <!-- 主内容区 -->
      <div class="main-content">
        <div class="page-header">
          <h1>我的课程列表</h1>
        </div>
        
        <!-- 1. 订阅且未完成观看所有课时的课程 -->
        <div class="course-section">
          <div class="section-header">
            <h2>进行中的课程</h2>
            <div class="view-all" @click="showAllUncompletedCourses">查看全部</div>
          </div>
          
          <div class="courses-grid">
            <div v-for="course in displayedUncompletedCourses" :key="course.id" class="today-course-card">
              <div class="course-header">
                <div class="course-icon">
                  <img :src="course.coverUrl || '/src/assets/pictures/logo.png'" alt="课程封面">
                </div>
                <div class="course-info">
                  <h3>{{ course.title }}</h3>
                  <div class="course-meta">
                    <div class="meta-item">
                      <span class="meta-icon">📚</span>
                      <span>{{ course.lessonsCompleted || 0 }}/{{ course.totalLessons || 0 }} 课时</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-icon">⏱️</span>
                      <span>{{ course.duration || '0分钟' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="progress-container">
                <div class="progress-circle">
                  <svg viewBox="0 0 36 36" class="circular-chart">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#F98C53;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#ABD7FB;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#D2E0AA;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <path class="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="circle"
                      :stroke-dasharray="`${course.progress}, 100`"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" class="percentage">{{ course.progress }}%</text>
                  </svg>
                </div>
              </div>
              
              <div class="course-actions">
                <button class="info-btn" @click="goToCourseDetail(course.id)">Info</button>
                <button class="continue-btn" @click="continueCourse(course.id, course.lastLessonId)">Continue</button>
              </div>
            </div>
            
            <!-- 添加更多课程按钮 -->
            <div v-if="!showAllUncompleted && uncompletedCourses.length > 4" class="add-more-btn" @click="showAllUncompletedCourses">
              <div class="add-icon">+</div>
              <div class="add-text">查看更多</div>
            </div>
          </div>
        </div>
        
        <!-- 2. 订阅且完成观看所有课时的课程 -->
        <div class="course-section">
          <div class="section-header">
            <h2>已完成的课程</h2>
            <div class="view-all" @click="toggleCompletedCourses">
              {{ showAllCompleted ? '收起' : '查看更多' }}
            </div>
          </div>
          
          <div class="courses-grid">
            <div v-for="course in displayedCompletedCourses" :key="course.id" class="completed-course-card">
              <div class="completion-badge">
                <div class="check-icon">✓</div>
                <span>100%</span>
              </div>
              <div class="course-header">
                <div class="course-icon">
                  <img :src="course.coverUrl || '/src/assets/pictures/logo.png'" alt="课程封面">
                </div>
                <div class="course-info">
                  <h3>{{ course.title }}</h3>
                  <div class="course-meta">
                    <div class="meta-item">
                      <span class="meta-icon">📚</span>
                      <span>{{ course.totalLessons || 0 }} 课时</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-icon">⏱️</span>
                      <span>{{ course.duration || '0分钟' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
              </div>
              
              <div class="course-actions">
                <button class="info-btn" @click="goToCourseDetail(course.id)">Info</button>
                <button class="review-btn" @click="goToCourseDetail(course.id)">Review</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 3. 收藏的课程 -->
        <div class="course-section">
          <div class="section-header">
            <h2>收藏的课程</h2>
          </div>
          
          <div class="courses-grid">
            <div v-for="course in likedCourses" :key="course.id" class="liked-course-card" :style="getRandomGradient()">
              <!-- 添加装饰性元素 -->
              <div class="card-decoration">
                <div class="decoration-circle circle-1"></div>
                <div class="decoration-circle circle-2"></div>
              </div>
              
              <div class="card-header">
                <div class="card-number">{{ course.id.toString().padStart(4, '0') }}</div>
                <div class="card-date">{{ formatCardDate(course.createdAt) }}</div>
              </div>
              
              <div class="card-body">
                <div class="card-title">{{ course.title }}</div>
                <div class="card-amount">¥ {{ course.price || 0 }}</div>
              </div>
              
              <div class="card-footer">
                <div class="like-icon">
                  <span class="heart-icon">❤️</span>
                </div>
                <div class="course-actions">
                  <button class="card-info-btn" @click="goToCourseDetail(course.id)">详情</button>
                  <button class="card-continue-btn" @click="continueCourse(course.id)">学习</button>
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
import axios from 'axios';
import StudentCenterService from '@/utils/studentCenterService';
import SiteHeader from '@/components/commen/header/SiteHeader.vue';
import StudentSidebar from '@/components/studentCenter/StudentSidebar.vue';

export default {
  name: 'StudentCenterCourseList',
  components: {
    SiteHeader,
    StudentSidebar
  },
  data() {
    return {
      userId: null, // 用户ID将从登录信息中获取
      username: '',
      name: '',
      userAvatar: '/src/assets/pictures/logo.png',
      uncompletedCourses: [],
      completedCourses: [],
      likedCourses: [],
      showAllUncompleted: false,
      showAllCompleted: false,
      gradients: [
        'linear-gradient(120deg, #F98C53, #FCCEB4)', // 橙色渐变
        'linear-gradient(120deg, #ABD7FB, #D2E0AA)', // 蓝绿渐变
        'linear-gradient(120deg, #D2E0AA, #F9F2EF)', // 绿粉渐变
        'linear-gradient(120deg, #FCCEB4, #F9F2EF)'  // 橙粉渐变
      ]
    };
  },
  computed: {
    displayedUncompletedCourses() {
      return this.showAllUncompleted 
        ? this.uncompletedCourses 
        : this.uncompletedCourses.slice(0, 4);
    },
    displayedCompletedCourses() {
      return this.showAllCompleted 
        ? this.completedCourses 
        : this.completedCourses.slice(0, 3);
    }
  },
  mounted() {
    // 获取当前登录用户的ID
    this.getUserId();
  },
  methods: {
    // 获取当前登录用户ID
    getUserId() {
      // 首先尝试从localStorage中获取用户信息
      const userStr = localStorage.getItem('user');
      let userId;
      
      if (userStr) {
        // 如果localStorage中有用户信息，则从中获取
        try {
          const userData = JSON.parse(userStr);
          userId = userData.userId;
          this.username = userData.username || '';
          this.name = userData.name || '';
        } catch (error) {
          console.error('解析用户数据失败:', error);
        }
      } 
      
      // 如果localStorage中没有，则尝试从cookie中获取
      if (!userId) {
        userId = this.getCookie('userid');
        this.username = this.getCookie('username') || '';
        this.name = this.getCookie('name') || '';
      }
      
      // 如果仍然没有获取到，则尝试从localStorage中的userId获取
      if (!userId) {
        userId = localStorage.getItem('userId');
      }
      
      // 如果都没有找到，则使用默认值
      if (!userId) {
        console.warn('未找到用户ID，使用默认值');
        userId = 1;
      }
      
      this.userId = userId;
      console.log('StudentCenterCourseList 当前用户ID:', userId);
      
      // 存储用户ID到localStorage
      localStorage.setItem('userId', userId);
      
      // 加载数据
      this.loadAllData();
      
      // 获取更多用户信息
      this.fetchUserData();
    },
    
    // 获取cookie的方法
    getCookie(name) {
      const cookieArr = document.cookie.split(';');
      for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=');
        const cookieName = cookiePair[0].trim();
        if (cookieName === name) {
          return decodeURIComponent(cookiePair[1]);
        }
      }
      return null;
    },
    
    async loadAllData() {
      try {
        // 获取未完成课程
        const uncompletedCoursesData = await StudentCenterService.getAllSubscribedUncompletedCourses(this.userId);
        this.uncompletedCourses = uncompletedCoursesData;
        
        // 获取已完成课程
        const completedCoursesData = await StudentCenterService.getSubscribedCompletedCourses(this.userId);
        this.completedCourses = completedCoursesData;
        
        // 获取收藏课程
        const likedCoursesData = await StudentCenterService.getLikedCourses(this.userId);
        this.likedCourses = likedCoursesData;
      } catch (error) {
        console.error('加载课程数据失败:', error);
      }
    },
    
    fetchUserData() {
      // 获取用户信息
      axios.get(`http://localhost:8080/api/user/${this.userId}`)
      // axios.get(`http://localhost:8080/api/user/${this.userId}`)
     // axios.get(`/user/user-info`)
        .then(response => {
          if (response.data.status === 200) {
            const userData = response.data.data;
            if (userData) {
              this.username = userData.username || this.username || '用户';
              this.name = userData.name || this.name || '用户';
              this.userAvatar = userData.avatarUrl || '/src/assets/pictures/logo.png';
            }
          }
        })
        .catch(error => {
          console.error('获取用户数据失败:', error);
        });
    },
    
    showAllUncompletedCourses() {
      this.showAllUncompleted = true;
    },
    
    toggleCompletedCourses() {
      this.showAllCompleted = !this.showAllCompleted;
    },
    
    goToCourseDetail(courseId) {
      // 跳转到课程详情页面 - 使用正确的路径 "/courses/:id"
      this.$router.push(`/courses/${courseId}`);
    },
    
    async continueCourse(courseId, lastLessonId) {
      console.log(`尝试继续课程，课程ID: ${courseId}`);
      
      // 如果已经知道最后观看的课时，直接跳转
      if (lastLessonId) {
        console.log(`跳转到视频播放页 - 课时ID: ${lastLessonId}, 课程ID: ${courseId}`);
        this.$router.push({
          name: 'StudentCoursePlayer',
          params: { lessonId: lastLessonId },
          query: { 
            courseId: courseId,
            studentId: this.userId
          }
        });
        return;
      }
      
      // 否则尝试获取最后一个章节的最后一个课时
      try {
        console.log(`请求API: /api/courses/${courseId}/chapters`);
        const response = await axios.get(`/api/courses/${courseId}/chapters`);
        console.log('API响应:', response);
        
        if (response.data && (response.data.code === 200 || response.data.status === 0)) {
          // 兼容两种可能的API响应格式
          const chapters = response.data.data || [];
          console.log('获取到章节数据:', chapters);
          
          // 找到最后一章和最后一个课时
          if (chapters && chapters.length > 0) {
            const lastChapter = chapters[chapters.length - 1];
            console.log('最后一章:', lastChapter);
            
            if (lastChapter.lessons && lastChapter.lessons.length > 0) {
              const lastLesson = lastChapter.lessons[lastChapter.lessons.length - 1];
              console.log('最后一个课时:', lastLesson);
              
              // 使用命名路由方式导航
              this.$router.push({
                name: 'StudentCoursePlayer',
                params: { lessonId: lastLesson.id },
                query: { 
                  courseId: courseId,
                  studentId: this.userId
                }
              });
              return;
            } else {
              console.warn('找不到课时数据');
              alert('该课程暂无课时内容，请联系管理员');
            }
          } else {
            console.warn('找不到章节数据');
            alert('该课程暂无章节内容，请联系管理员');
          }
        } else {
          console.error('API返回错误:', response.data);
          alert(`获取课程章节失败: ${response.data ? response.data.message || '未知错误' : '服务器无响应'}`);
        }
        
        // 如果获取失败或没有章节课时信息，就跳转到课程详情页
        const fallbackUrl = `/courses/${courseId}`;
        console.log('跳转到详情页面:', fallbackUrl);
        this.$router.push(fallbackUrl);
      } catch (error) {
        console.error('获取课程章节信息失败:', error);
        alert(`获取课程章节信息失败: ${error.message || '未知错误'}`);
        
        // 出错时跳转到课程详情页
        const fallbackUrl = `/courses/${courseId}`;
        console.log('跳转到详情页面:', fallbackUrl);
        this.$router.push(fallbackUrl);
      }
    },
    
    navigateTo(path) {
      this.$router.push(path);
    },
    
    getRandomGradient() {
      const randomGradient = this.gradients[Math.floor(Math.random() * this.gradients.length)];
      return { background: randomGradient };
    },
    
    formatCardDate(dateString) {
      if (!dateString) return '01/22';
      
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(2);
      
      return `${month}/${year}`;
    }
  }
};
</script>

<style scoped>
.student-center-course-list {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f7;
  font-family: 'Roboto', Arial, sans-serif;
}

/* 左侧导航栏样式已移至StudentSidebar组件 */

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: linear-gradient(135deg, #f5f5f7 0%, #F9F2EF 100%);
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #F98C53, #D2E0AA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.course-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.course-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #F98C53, #ABD7FB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.view-all {
  background: linear-gradient(135deg, #F98C53, #FCCEB4);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(249, 140, 83, 0.3);
}

.view-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 140, 83, 0.4);
}

/* 1. 未完成课程卡片样式 */
.courses-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.today-course-card {
  background: linear-gradient(135deg, #fff 0%, #F9F2EF 100%);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  padding: 25px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(25% - 15px);
  min-width: 280px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(249, 140, 83, 0.1);
}

.today-course-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #F98C53, #ABD7FB, #D2E0AA, #FCCEB4);
  background-size: 300% 100%;
  animation: gradientMove 3s ease infinite;
}

@keyframes gradientMove {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.today-course-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 40px rgba(249, 140, 83, 0.15);
}

.course-header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
}

.course-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #F9F2EF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
  overflow: hidden;
}

.course-icon img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
}

.course-info h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 6px 0;
}

.course-meta {
  display: flex;
  gap: 18px;
  font-size: 14px;
  color: #888;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-container {
  margin: 18px 0 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.progress-container::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #F98C53 0deg,
    #FCCEB4 72deg,
    #ABD7FB 144deg,
    #D2E0AA 216deg,
    #F9F2EF 288deg,
    #F98C53 360deg
  );
  opacity: 0.1;
  animation: rotate 4s linear infinite;
  z-index: -1;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.progress-circle {
  width: 72px;
  height: 72px;
  position: relative;
  z-index: 1;
  background: radial-gradient(
    circle,
    rgba(249, 242, 239, 0.8) 0%,
    rgba(252, 206, 180, 0.6) 30%,
    rgba(171, 215, 251, 0.4) 60%,
    rgba(210, 224, 170, 0.2) 100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circular-chart {
  width: 72px;
  height: 72px;
  display: block;
  transition: all 0.3s ease;
}

.circular-chart:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 15px rgba(249, 140, 83, 0.4));
}

.circle-bg {
  fill: none;
  stroke: linear-gradient(135deg, #F9F2EF, #FCCEB4);
  stroke-width: 3.8;
  opacity: 0.3;
}

.circle {
  fill: none;
  stroke: url(#progressGradient);
  stroke-width: 4;
  stroke-linecap: round;
  transition: all 0.6s ease;
  animation: progressPulse 2s ease-in-out infinite;
}

@keyframes progressPulse {
  0%, 100% {
    stroke-width: 4;
    filter: drop-shadow(0 0 5px rgba(249, 140, 83, 0.3));
  }
  50% {
    stroke-width: 4.5;
    filter: drop-shadow(0 0 10px rgba(171, 215, 251, 0.5));
  }
}

.percentage {
  fill: #333;
  font-size: 1.1em;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  animation: textGlow 3s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% {
    fill: #333;
  }
  25% {
    fill: #F98C53;
  }
  50% {
    fill: #ABD7FB;
  }
  75% {
    fill: #D2E0AA;
  }
}

.course-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.info-btn, .continue-btn {
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.info-btn {
  background: linear-gradient(135deg, #ABD7FB, #D2E0AA);
  color: white;
}

.info-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(171, 215, 251, 0.4);
}

.continue-btn {
  background: linear-gradient(135deg, #F98C53, #FCCEB4);
  color: white;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 140, 83, 0.4);
}

.add-more-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 280px;
  max-width: calc(25% - 15px);
  height: 200px;
  background-color: #f9f9f9;
  border-radius: 12px;
  border: 2px dashed #ddd;
  cursor: pointer;
  transition: all 0.2s;
}

.add-more-btn:hover {
  background-color: #f0f0f0;
}

.add-icon {
  font-size: 36px;
  color: #aaa;
}

.add-text {
  margin-top: 10px;
  color: #aaa;
  font-weight: 500;
}

/* 2. 已完成课程样式 */
.completed-course-card {
  background: linear-gradient(135deg, #D2E0AA, #F9F2EF);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(210, 224, 170, 0.15);
  padding: 25px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  width: calc(33.33% - 14px);
  min-width: 280px;
  position: relative;
  transition: all 0.4s ease;
  overflow: hidden;
}

.completed-course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(210, 224, 170, 0.25);
}

.completion-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #D2E0AA, #ABD7FB);
  border-radius: 25px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: white;
  box-shadow: 0 4px 15px rgba(210, 224, 170, 0.3);
  animation: pulse 2s infinite;
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #4a6741;
  color: white;
  border-radius: 50%;
  font-size: 12px;
}

.review-btn {
  background: linear-gradient(135deg, #D2E0AA, #ABD7FB);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;
}

.review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(210, 224, 170, 0.4);
}

/* 3. 收藏的课程卡片样式 - 美化版本 */
.liked-course-card {
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  width: calc(33.33% - 14px);
  min-width: 280px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 220px;
  justify-content: space-between;
  /* 添加更柔和的渐变覆盖层 */
  background-image: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%);
  background-blend-mode: overlay;
}

.liked-course-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0,0,0,0.18);
}

/* 装饰性元素 */
.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: -20px;
  right: -20px;
}

.circle-2 {
  width: 40px;
  height: 40px;
  bottom: 20px;
  left: -10px;
  background: rgba(255, 255, 255, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  z-index: 2;
  position: relative;
}

.card-number {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-date {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 10px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
  position: relative;
}

.card-title {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  /* 添加文字描边效果增强可读性 */
  -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.1);
}

.card-amount {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  padding: 8px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
  width: fit-content;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  z-index: 2;
  position: relative;
}

.like-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.like-icon:hover {
  transform: scale(1.1);
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.25));
}

.heart-icon {
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.course-actions {
  display: flex;
  gap: 8px;
}

.card-info-btn, .card-continue-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card-info-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-info-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-continue-btn {
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8));
  color: #333;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.card-continue-btn:hover {
  background: linear-gradient(45deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9));
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  .today-course-card, .completed-course-card, .liked-course-card {
    width: calc(50% - 10px);
  }
}

@media (max-width: 768px) {
  .today-course-card, .completed-course-card, .liked-course-card {
    width: 100%;
  }
}
</style>