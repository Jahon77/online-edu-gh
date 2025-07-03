<template>
  <div class="dashboard-page">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">智学通</span>
      </div>
      
      <div class="nav-item active">
        <div class="nav-icon">📊</div>
        <div class="nav-text">Dashboard</div>
      </div>
      
      <div class="nav-item" @click="navigateTo('/course/list')">
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
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-text">
          <h1>欢迎回来，{{ username }} 👋</h1>
          <p>您已完成 <strong>{{ completionRate }}%</strong> 的学习目标！继续努力，提高您的学习进度！</p>
        </div>
        <div class="welcome-image">
          <img src="/src/assets/images/6402d73b1c4a9f72c60a257bac3cd93a.png" alt="Welcome illustration">
        </div>
      </div>
      
      <!-- 使用StudentDashboard组件 -->
      <StudentDashboard />
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
      
      <!-- 学习进度日历 -->
      <div class="progress-section">
        <div class="section-header">
          <h3>我的进度</h3>
          <div class="month-selector">{{ currentMonth }}</div>
        </div>
        
        <div class="calendar">
          <div class="calendar-header">
            <div v-for="day in weekDays" :key="day" class="calendar-day-header">{{ day }}</div>
          </div>
          <div class="calendar-body">
            <div v-for="(day, index) in calendarDays" :key="index" 
                 :class="['calendar-day', { 'has-activity': day.hasActivity, 'current': day.isCurrent, 'other-month': !day.isCurrentMonth }]">
              {{ day.date }}
            </div>
          </div>
        </div>
        
        <div class="activity-legend">
          <div class="legend-item">
            <div class="legend-color light"></div>
            <div class="legend-text">轻度</div>
          </div>
          <div class="legend-item">
            <div class="legend-color medium"></div>
            <div class="legend-text">中度</div>
          </div>
          <div class="legend-item">
            <div class="legend-color heavy"></div>
            <div class="legend-text">重度</div>
          </div>
        </div>
      </div>
      
      <!-- 待办事项 -->
      <div class="tasks-section">
        <div class="section-header">
          <h3>待办任务</h3>
          <div class="view-all">查看全部</div>
        </div>
        
        <div class="task-list">
          <div v-for="task in upcomingTasks" :key="task.id" class="task-item">
            <div class="task-icon" :style="{ backgroundColor: task.iconBg }">
              <img :src="task.icon" alt="Task icon">
            </div>
            <div class="task-content">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-time">{{ task.time }}</div>
            </div>
            <div class="task-arrow">›</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import StudentDashboard from '@/components/studentCenter/StudentDashboard.vue';

export default {
  name: 'Dashboard',
  components: {
    StudentDashboard
  },
  data() {
    return {
      username: 'Deena',
      userAvatar: '/src/assets/pictures/logo.png',
      completionRate: 80,
      currentMonth: 'October',
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      calendarDays: [],
      upcomingTasks: [
        {
          id: 1,
          title: 'Prototyping Section',
          time: '09:00-10:00 Today',
          icon: '/src/assets/pictures/logo.png',
          iconBg: '#e6f7f2'
        },
        {
          id: 2,
          title: 'Wireframing Section',
          time: '11:00-12:30 Today',
          icon: '/src/assets/pictures/web.svg',
          iconBg: '#f0e6f7'
        },
        {
          id: 3,
          title: 'Blog Writing Section',
          time: '14:00-15:30 Today',
          icon: '/src/assets/pictures/teacher.svg',
          iconBg: '#fff8e6'
        },
        {
          id: 4,
          title: 'Video Editing Section',
          time: '17:00-20:00 Today',
          icon: '/src/assets/pictures/QQ.png',
          iconBg: '#ffe6e6'
        }
      ]
    };
  },
  mounted() {
    this.generateCalendarDays();
    
    // 从后端获取数据
    this.fetchUserData();
  },
  methods: {
    generateCalendarDays() {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      
      // 获取当月第一天和最后一天
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // 获取当月第一天是星期几
      const firstDayOfWeek = firstDay.getDay();
      
      // 获取上月的一些天数来填充日历的第一行
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      const days = [];
      
      // 添加上月的日期
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: prevMonthLastDay - i,
          isCurrentMonth: false,
          hasActivity: false,
          isCurrent: false
        });
      }
      
      // 添加当月的日期
      for (let i = 1; i <= lastDay.getDate(); i++) {
        // 随机生成活动强度
        const hasActivity = Math.random() > 0.5;
        const activityLevel = hasActivity ? Math.floor(Math.random() * 3) + 1 : 0; // 0: 无活动, 1: 轻度, 2: 中度, 3: 重度
        
        days.push({
          date: i,
          isCurrentMonth: true,
          hasActivity: hasActivity,
          activityLevel: activityLevel,
          isCurrent: i === today.getDate()
        });
      }
      
      // 如果不足42天，添加下月的日期
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          isCurrentMonth: false,
          hasActivity: false,
          isCurrent: false
        });
      }
      
      this.calendarDays = days;
    },
    fetchUserData() {
      // 设置默认用户ID为7
      const userId = 7;
      localStorage.setItem('userId', userId);
      
      // 直接使用默认用户信息，不调用后端API
      this.username = '测试用户';
      this.userAvatar = '/src/assets/pictures/logo.png';
      
      console.log('使用默认用户信息:', {
        userId: userId,
        username: this.username
      });
      
      // 以下是原来的代码，暂时注释掉
      /*
      axios.get(`http://localhost:8080/api/user/${userId}`)
        .then(response => {
          if (response.data.status === 200) {
            const userData = response.data.data;
            this.username = userData.username || 'User';
            this.userAvatar = userData.avatarUrl || '/src/assets/pictures/logo.png';
          }
        })
        .catch(error => {
          console.error('获取用户数据失败:', error);
          // 如果API调用失败，设置默认值
          this.username = '测试用户';
          this.userAvatar = '/src/assets/pictures/logo.png';
        });
      */
    },
    navigateTo(path) {
      this.$router.push(path);
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  min-height: 100vh;
  background-color: #F9F2EF;
  font-family: 'Segoe UI', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}

/* 左侧导航栏样式 */
.sidebar {
  width: 240px;
  background-color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  border-right: 1px solid rgba(249, 140, 83, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  color: #F98C53;
  padding: 10px;
}

.logo-icon {
  font-size: 24px;
  margin-right: 10px;
  color: #F98C53;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #F98C53;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #F9F2EF;
}

.nav-item.active {
  background-color: #F98C53;
  color: white;
}

.nav-icon {
  font-size: 20px;
  margin-right: 15px;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
}

.upgrade-container {
  margin-top: auto;
  background-color: #F9F2EF;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  position: relative;
}

.upgrade-lock {
  font-size: 40px;
  margin-bottom: 10px;
}

.upgrade-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.pro-text {
  color: #F98C53;
  font-weight: bold;
}

.upgrade-btn {
  background-color: #F98C53;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-btn:hover {
  background-color: #e67a42;
  transform: translateY(-2px);
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.welcome-section {
  background: linear-gradient(135deg, #F98C53, #FCCEB4);
  border-radius: 20px;
  padding: 30px;
  color: white;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(249, 140, 83, 0.2);
}

.welcome-text {
  flex: 1;
}

.welcome-text h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.welcome-text p {
  font-size: 16px;
  opacity: 0.9;
}

.welcome-image {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-image img {
  max-width: 100%;
  max-height: 100%;
}

/* 右侧边栏样式 */
.right-sidebar {
  width: 300px;
  background-color: white;
  padding: 20px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
  border-left: 1px solid rgba(249, 140, 83, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.notification-icon {
  font-size: 20px;
  margin-right: 20px;
  color: #F98C53;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-icon:hover {
  transform: scale(1.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.dropdown-icon {
  font-size: 12px;
  margin-left: 5px;
  color: #999;
}

.progress-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.month-selector {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.calendar {
  margin-bottom: 15px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 10px;
}

.calendar-day-header {
  font-size: 12px;
  color: #999;
  padding: 5px;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-day {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-day:hover:not(.current) {
  background-color: #FCCEB4;
  color: white;
}

.calendar-day.current {
  background-color: #F98C53;
  color: white;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.has-activity {
  position: relative;
}

.calendar-day.has-activity::after {
  content: '';
  position: absolute;
  bottom: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #F98C53;
}

.activity-legend {
  display: flex;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}

.legend-color.light {
  background-color: rgba(249, 140, 83, 0.3);
}

.legend-color.medium {
  background-color: rgba(249, 140, 83, 0.6);
}

.legend-color.heavy {
  background-color: rgba(249, 140, 83, 1);
}

.legend-text {
  font-size: 12px;
  color: #999;
}

.tasks-section {
  margin-bottom: 30px;
}

.view-all {
  font-size: 14px;
  color: #F98C53;
  cursor: pointer;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-color: #F9F2EF;
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 3px solid #FCCEB4;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 140, 83, 0.1);
  border-left: 3px solid #F98C53;
}

.task-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.task-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.task-time {
  font-size: 12px;
  color: #999;
}

.task-arrow {
  font-size: 20px;
  color: #999;
}

@media (max-width: 1200px) {
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 10px;
  }
  
  .main-content {
    padding: 15px;
  }
}
</style>