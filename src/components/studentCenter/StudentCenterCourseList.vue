<template>
  <div class="student-center-course-list">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">智学通</span>
      </div>
      
      <div class="nav-item" @click="navigateTo('/course/dashboard')">
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
          <div v-for="course in uncompletedCourses" :key="course.id" class="today-course-card">
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
              <button class="info-btn">Info</button>
              <button class="continue-btn" @click="continueCourse(course.id)">Continue</button>
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
        </div>
        
        <div class="productivity-list">
          <div v-for="(course, index) in displayedCompletedCourses" :key="course.id" class="productivity-card" 
               :class="[index === 0 ? 'light-green' : index === 1 ? 'medium-green' : 'dark-green']">
            <div class="productivity-date">
              <span class="date-number">{{ index + 1 }}</span>
            </div>
            <div class="productivity-info">
              <div class="title-row">
                <h3>{{ course.title }}</h3>
                <div class="percentage">100%</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 100%"></div>
              </div>
              <div class="stats-row">
                <div class="stat-item">
                  <div class="stat-label">课程总时长</div>
                  <div class="stat-value">{{ course.duration || '0分钟' }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">课时数</div>
                  <div class="stat-value">{{ course.totalLessons || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="completedCourses.length > 3" class="view-more" @click="toggleCompletedCourses">
          {{ showAllCompleted ? '收起' : '查看更多' }}
        </div>
      </div>
      
      <!-- 3. 收藏的课程 -->
      <div class="course-section">
        <div class="section-header">
          <h2>收藏的课程</h2>
        </div>
        
        <div class="card-list">
          <div v-for="course in likedCourses" :key="course.id" class="active-card" :style="getRandomCardStyle()">
            <div class="card-number">{{ course.id.toString().padStart(4, '0') }}</div>
            <div class="card-date">{{ formatCardDate(course.createdAt) }}</div>
            <div class="card-amount">¥ {{ course.price || 0 }}</div>
            <div class="card-title">{{ course.title }}</div>
            <div class="card-dots">
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
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
          <img :src="userAvatar" :alt="username">
        </div>
        <div class="user-name">{{ username }} <span class="dropdown-icon">▼</span></div>
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
</template>

<script>
import axios from 'axios';
import StudentCenterService from '@/utils/studentCenterService';

export default {
  name: 'StudentCenterCourseList',
  data() {
    return {
      userId: 7, // 默认用户ID
      username: '测试用户',
      userAvatar: '/src/assets/pictures/logo.png',
      uncompletedCourses: [],
      completedCourses: [],
      likedCourses: [],
      showAllUncompleted: false,
      showAllCompleted: false,
      allCourses: [] // 用于存储所有课程数据
    };
  },
  computed: {
    displayedCompletedCourses() {
      return this.showAllCompleted 
        ? this.completedCourses 
        : this.completedCourses.slice(0, 3);
    }
  },
  mounted() {
    // 设置默认用户ID
    localStorage.setItem('userId', this.userId);
    
    // 加载数据
    this.loadAllData();
    
    // 获取用户信息
    this.fetchUserData();
  },
  methods: {
    async loadAllData() {
      try {
        // 获取所有课程数据
        const allCoursesData = await this.getAllCourses();
        this.allCourses = allCoursesData;
        
        console.table(
          this.allCourses.map(c => ({
            id: c.id,
            rawProgress: c.progress,                         // 后端原值
            numeric: Number(String(c.progress).replace('%', '')) // 转成数字看看
          }))
        );

        // 根据progress属性进行区分
        this.processCoursesByProgress();
        
        // 获取收藏课程
        const likedCoursesData = await StudentCenterService.getLikedCourses(this.userId);
        this.likedCourses = likedCoursesData;
      } catch (error) {
        console.error('加载课程数据失败:', error);
      }
    },

    async getAllCourses() {
      try {
        // 获取已完成课程数据（优先级更高）
        const completedCoursesData = await StudentCenterService.getSubscribedCompletedCourses(this.userId, 0);
        
        // 获取未完成课程数据
        const uncompletedCoursesData = await StudentCenterService.getAllSubscribedUncompletedCourses(this.userId);
        
        // 使用Map存储课程，以课程ID为键，防止重复
        const courseMap = new Map();
        
        // 先处理未完成课程数据（较低优先级）
        uncompletedCoursesData.forEach(course => {
          courseMap.set(course.id, course);
        });
        
        // 再处理已完成课程数据（较高优先级，会覆盖同ID的未完成课程）
        completedCoursesData.forEach(course => {
          courseMap.set(course.id, course);
        });
        
        // 转换回数组
        const allCourses = Array.from(courseMap.values());
        console.log('所有课程数据(去重后):', allCourses.length);
        return allCourses;
      } catch (error) {
        console.error('获取所有课程失败:', error);
        return [];
      }
    },
    
    processCoursesByProgress() {
      // 清空已有数据
      this.completedCourses = [];
      this.uncompletedCourses = [];
      
      // 根据progress属性进行区分
      this.allCourses.forEach(course => {
        // 确保progress是数字
        const progressValue = typeof course.progress === 'number' 
          ? course.progress 
          : parseFloat(String(course.progress).replace('%', ''));
        
        console.log(`课程ID: ${course.id}, 标题: ${course.title}, 进度: ${progressValue}`);
        
        if (!isNaN(progressValue) && progressValue >= 100) {
          this.completedCourses.push(course);
        } else {
          this.uncompletedCourses.push(course);
        }
      });
      
      // 排序：已完成课程按最后学习时间排序，未完成课程按进度排序（从高到低）
      this.completedCourses.sort((a, b) => new Date(b.lastLearnTime || 0) - new Date(a.lastLearnTime || 0));
      this.uncompletedCourses.sort((a, b) => {
        const progressA = typeof a.progress === 'number' ? a.progress : parseFloat(String(a.progress).replace('%', ''));
        const progressB = typeof b.progress === 'number' ? b.progress : parseFloat(String(b.progress).replace('%', ''));
        return progressB - progressA;
      });
      
      console.log(`课程分类完成 - 已完成课程: ${this.completedCourses.length}, 未完成课程: ${this.uncompletedCourses.length}`);
    },
    
    fetchUserData() {
      // 直接使用默认用户信息，不调用后端API
      this.username = '测试用户';
      this.userAvatar = '/src/assets/pictures/logo.png';
      
      // 记录用户ID到localStorage
      localStorage.setItem('userId', this.userId);
      
      console.log('使用默认用户信息:', {
        userId: this.userId,
        username: this.username
      });
      
      // 以下是原来的代码，暂时注释掉
      /*
      axios.get(`http://localhost:8080/api/user/${this.userId}`)
        .then(response => {
          if (response.data.status === 200) {
            const userData = response.data.data;
            this.username = userData.username || '测试用户';
            this.userAvatar = userData.avatarUrl || '/src/assets/pictures/logo.png';
          }
        })
        .catch(error => {
          console.error('获取用户数据失败:', error);
        });
      */
    },
    
    showAllUncompletedCourses() {
      this.showAllUncompleted = true;
    },
    
    toggleCompletedCourses() {
      this.showAllCompleted = !this.showAllCompleted;
    },
    
    continueCourse(courseId) {
      this.$router.push(`/course/player/${courseId}`);
    },
    
    navigateTo(path) {
      this.$router.push(path);
    },
    
    getRandomCardStyle() {
      const colors = [
        'linear-gradient(120deg, #84fab0, #8fd3f4)',
        'linear-gradient(120deg, #f6d365, #fda085)',
        'linear-gradient(120deg, #a1c4fd, #c2e9fb)',
        'linear-gradient(120deg, #f093fb, #f5576c)',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return { background: randomColor };
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
  flex: 1;
  min-width: 280px;
  max-width: calc(25% - 15px);
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.course-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.course-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.course-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.course-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.meta-icon {
  margin-right: 6px;
}

.progress-container {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
}

.circular-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke-width: 3.8;
  stroke-linecap: round;
  stroke: #F98C53; /* 使用橙色 */
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

.percentage {
  fill: #333;
  font-family: sans-serif;
  font-size: 0.5em;
  text-anchor: middle;
}

.course-actions {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
}

.info-btn, .continue-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.info-btn {
  background-color: #f0f0f0;
  color: #666;
}

.continue-btn {
  background-color: #F98C53; /* 使用橙色 */
  color: white;
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
.productivity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.productivity-card {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.light-green {
  background-color: #D2E0AA;
}

.medium-green {
  background-color: #ABD7FB; /* 使用浅蓝色 */
  color: #333;
}

.dark-green {
  background-color: #F98C53; /* 使用橙色 */
  color: white;
}

.productivity-date {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255,255,255,0.2);
}

.date-number {
  font-size: 24px;
  font-weight: 600;
}

.productivity-info {
  flex: 1;
  padding: 20px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title-row h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background-color: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background-color: rgba(255,255,255,0.8);
  border-radius: 3px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
}

.view-more {
  text-align: center;
  color: #F98C53;
  font-weight: 500;
  margin-top: 15px;
  cursor: pointer;
}

/* 3. 收藏的课程卡片样式 */
.card-list {
  display: flex;
  align-items: center;
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: none;
}

.card-list::-webkit-scrollbar {
  display: none;
}

.active-card {
  min-width: 280px;
  height: 160px;
  border-radius: 12px;
  padding: 20px;
  margin-right: 20px;
  position: relative;
  color: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  background: linear-gradient(120deg, #F98C53, #FCCEB4); /* 使用橙色渐变 */
}

.card-number {
  font-size: 14px;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.card-date {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: auto;
}

.card-amount {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
}

.card-dots {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
}

.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.5);
  margin-left: 5px;
}

.card-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  cursor: pointer;
}

.nav-arrow {
  font-size: 18px;
  color: #333;
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
</style> 