<template>
  <div>
    <!-- 添加统一的顶部导航栏 -->
    <header class="site-header">
      <div class="header-container">
        <div class="logo">
          <img src="/src/assets/pictures/logo.png" alt="Logo">
        </div>
        <nav class="main-nav">
          <router-link to="/courses" class="nav-link">课程中心</router-link>
          <router-link to="/dashboard" class="nav-link">我的学习</router-link>
          <a href="#" class="nav-link" @click.prevent>论坛</a>
          <a href="#" class="nav-link" @click.prevent>学习助手</a>
        </nav>
        <div class="user-actions">
          <button class="download-btn">APP下载</button>
          <button class="btn-logout" @click="logout">退出登录</button>
          <div class="user-avatar">
            <img :src="userAvatar" :alt="username">
          </div>
        </div>
      </div>
    </header>
    
    <div class="student-center-course-list">
      <!-- 左侧导航栏 -->
      <div class="sidebar">
        <div class="logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text">智学通</span>
        </div>
        
        <div class="nav-item" @click="navigateTo('/dashboard')">
          <div class="nav-icon">📊</div>
          <div class="nav-text">Dashboard</div>
        </div>
        
        <div class="nav-item active">
          <div class="nav-icon">📝</div>
          <div class="nav-text">所有课程</div>
        </div>
        
        <div class="nav-item">
          <div class="nav-icon">📚</div>
          <div class="nav-text">资源</div>
        </div>
        
        <div class="nav-item" @click="navigateTo('/chat')">
          <div class="nav-icon">💬</div>
          <div class="nav-text">聊天</div>
        </div>
        
        <div class="nav-item">
          <div class="nav-icon">⚙️</div>
          <div class="nav-text">设置</div>
        </div>
        
        <div class="upgrade-container">
          <div class="upgrade-lock">🔒</div>
          <div class="upgrade-text">
            升级到 <span class="pro-text">Pro</span><br>
            获取更多资源
          </div>
          <button class="upgrade-btn">升级</button>
        </div>
      </div>
      
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
              <div class="card-header">
                <div class="card-number">{{ course.id.toString().padStart(4, '0') }}</div>
                <div class="card-date">{{ formatCardDate(course.createdAt) }}</div>
              </div>
              
              <div class="card-body">
                <div class="card-title">{{ course.title }}</div>
                <div class="card-amount">¥ {{ course.price || 0 }}</div>
              </div>
              
              <div class="card-footer">
                <div class="like-icon">❤️</div>
                <div class="course-actions">
                  <button class="info-btn" @click="goToCourseDetail(course.id)">Info</button>
                  <button class="continue-btn" @click="continueCourse(course.id)">Continue</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧边栏 -->
      <div class="right-sidebar">
        <!-- 个人信息 -->
        <div class="user-profile">
          <div class="notification-icon">🔔</div>
          <div class="user-avatar">
            <img :src="userAvatar" :alt="username">
          </div>
          <div class="user-name">{{ username }} <span class="dropdown-icon">▼</span></div>
        </div>
        
        <!-- 学习统计 -->
        <div class="stats-section">
          <div class="section-header">
            <h3>学习统计</h3>
          </div>
          
          <div class="card-navigation">
            <span class="nav-arrow">&#10095;</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧边栏 -->
    <div class="right-sidebar">
      <!-- 个人信息 -->
      <div class="user-profile">
        <div class="notification-icon">🔔</div>
        <div class="user-avatar">
          <img :src="userAvatar" :alt="name || username">
        </div>
        <div class="user-name">{{ name || username }} <span class="dropdown-icon">▼</span></div>
      </div>
      
      <!-- 学习统计 -->
      <div class="stats-section">
        <div class="section-header">
          <h3>学习统计</h3>
        </div>
        
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #F98C53">📚</div>
            <div class="stat-info">
              <div class="stat-value">{{ uncompletedCourses.length + completedCourses.length }}</div>
              <div class="stat-label">已订阅课程</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon" style="background-color: #D2E0AA">✓</div>
              <div class="stat-info">
                <div class="stat-value">{{ completedCourses.length }}</div>
                <div class="stat-label">已完成课程</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon" style="background-color: #ABD7FB">❤️</div>
              <div class="stat-info">
                <div class="stat-value">{{ likedCourses.length }}</div>
                <div class="stat-label">已收藏课程</div>
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

export default {
  name: 'StudentCenterCourseList',
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
    
    logout() {
      // 清除本地存储的用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      sessionStorage.clear();
      
      // 清除cookie
      document.cookie = "satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "userid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // 显示退出成功提示
      alert('已成功退出登录');
      
      // 跳转到登录页面或首页
      this.$router.push('/login');
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
/* 添加顶部导航栏样式 */
.site-header {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo img {
  height: 40px;
}

.main-nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 10px 0;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #F98C53;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.download-btn {
  background: #F98C53;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.download-btn:hover {
  background: #e67c42;
}

.btn-logout {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background: #c82333;
}

.user-avatar img {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.student-center-course-list {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f7;
  font-family: 'Roboto', Arial, sans-serif;
}

/* 左侧导航栏样式 */
.sidebar {
  width: 220px;
  background-color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 10px;
}

.logo-icon {
  font-size: 24px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.nav-item.active {
  background-color: #F98C53;
  color: white;
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
}

.upgrade-container {
  margin-top: auto;
  background-color: #f9f0ff;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.upgrade-lock {
  font-size: 24px;
  margin-bottom: 10px;
}

.upgrade-text {
  margin-bottom: 12px;
  font-size: 14px;
}

.pro-text {
  font-weight: 600;
  color: #6200ea;
}

.upgrade-btn {
  background-color: #6200ea;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.upgrade-btn:hover {
  background-color: #5000d6;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.course-section {
  background-color: #fff;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.view-all {
  color: #F98C53;
  font-weight: 500;
  cursor: pointer;
}

/* 1. 未完成课程卡片样式 */
.courses-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.today-course-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 24px 24px 18px 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s;
  position: relative;
}

.today-course-card:hover {
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
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
}

.progress-circle {
  width: 72px;
  height: 72px;
  position: relative;
}

.circular-chart {
  width: 72px;
  height: 72px;
  display: block;
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #4BC0C0;
  stroke-width: 3.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}

.percentage {
  fill: #333;
  font-size: 1.1em;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
}

.course-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.info-btn, .continue-btn {
  padding: 6px 18px;
  border-radius: 20px;
  border: none;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.info-btn {
  background: #fff;
  color: #4BC0C0;
  border: 1.5px solid #4BC0C0;
}

.info-btn:hover {
  background: #4BC0C0;
  color: #fff;
}

.continue-btn {
  background: #4BC0C0;
  color: #fff;
  border: 1.5px solid #4BC0C0;
}

.continue-btn:hover {
  background: #388e8e;
  color: #fff;
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
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: calc(33.33% - 14px);
  min-width: 280px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.completed-course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.completion-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(210, 224, 170, 0.9);
  border-radius: 20px;
  padding: 5px 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #4a6741;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 14px;
  background-color: #D2E0AA;
  color: #4a6741;
  border: 1px solid #4a6741;
}

.review-btn:hover {
  background-color: #4a6741;
  color: #D2E0AA;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 103, 65, 0.3);
}

/* 3. 收藏的课程卡片样式 */
.liked-course-card {
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: calc(33.33% - 14px);
  min-width: 280px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 200px;
  justify-content: space-between;
}

.liked-course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.card-number {
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.card-date {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-amount {
  font-size: 22px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.like-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-size: 16px;
}

/* 右侧边栏样式 */
.right-sidebar {
  width: 280px;
  padding: 30px 20px;
  background-color: #fff;
  box-shadow: -2px 0 10px rgba(0,0,0,0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.notification-icon {
  margin-right: auto;
  font-size: 18px;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
}

.dropdown-icon {
  font-size: 10px;
  margin-left: 5px;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.stats-card .stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stats-card .stat-item:last-child {
  margin-bottom: 0;
}

.stats-card .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 18px;
}

.stats-card .stat-info {
  flex: 1;
}

.stats-card .stat-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 3px;
}

.stats-card .stat-label {
  font-size: 14px;
  color: #666;
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