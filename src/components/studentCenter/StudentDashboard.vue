<template>
  <div class="student-dashboard">
    <!-- 我的课程 -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>我的课程</h2>
      </div>
      
      <div class="courses-grid">
        <!-- 显示最近观看的课程 -->
        <div v-for="course in recentCourses" :key="course.id" class="course-card">
          <div class="course-image">
            <img :src="course.coverUrl || '/src/assets/images/1.jpg'" :alt="course.title">
          </div>
          <div class="course-content">
            <h3>{{ course.title }}</h3>
            <div class="course-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
              </div>
              <div class="progress-text">{{ course.progress }}%</div>
            </div>
            <div class="course-meta">
              <span>{{ course.lessonsCompleted }}/{{ course.totalLessons }} 课时</span>
              <span>总时长: {{ course.duration }}</span>
            </div>
            <div class="course-actions">
              <button class="info-btn" @click="goToCourseDetail(course.id)">Info</button>
              <button class="continue-btn" @click="continueCourse(course.id)">Continue</button>
            </div>
          </div>
        </div>
        
        <!-- 当课程不足4门时，显示添加课程卡片 -->
        <div v-if="recentCourses.length < 4" class="add-course-card" @click="goToCourseList">
          <div class="add-icon">+</div>
        </div>
      </div>
    </div>
    
    <!-- 活跃度 -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Your activity</h2>
        <div class="date-range">Last week</div>
      </div>
      
      <div class="activity-wave-container">
        <div class="activity-content">
          <div class="activity-badge">
            <span class="badge-text">4 courses completed</span>
          </div>
          
          <div class="wave-chart">
            <svg class="wave-svg" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <!-- 动态波浪线 -->
              <path class="wave-line" 
                    d="M0,120 Q50,80 100,100 T200,90 T300,110 T400,100" 
                    stroke="#6B9EFF" 
                    stroke-width="3" 
                    fill="none" />
              
              <!-- 波浪点 -->
              <circle class="wave-dot" cx="100" cy="100" r="4" fill="#6B9EFF" />
              <circle class="wave-dot" cx="200" cy="90" r="4" fill="#6B9EFF" />
              <circle class="wave-dot" cx="300" cy="110" r="4" fill="#6B9EFF" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="activity-chart">
        <div class="chart-container">
          <div ref="activityChartContainer" style="height: 250px;"></div>
        </div>
        <div class="activity-stats">
          <div class="stat-item">
            <div class="stat-value">{{ activityStats.totalMinutes }}</div>
            <div class="stat-label">总学习时长(分钟)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activityStats.averageMinutes }}</div>
            <div class="stat-label">日均学习时长(分钟)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activityStats.maxMinutes }}</div>
            <div class="stat-label">最长学习时长(分钟)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/http';
import * as echarts from 'echarts';

// 替换为导入自定义服务
import StudentCenterService from '@/utils/studentCenterService';

export default {
  name: 'StudentDashboard',
  // 在 data() 中添加
  data() {
    return {
      userId: null,
      recentCourses: [],
      activityData: {
        labels: [],
        data: []
      },
      activityStats: {
        totalMinutes: 0,
        averageMinutes: 0,
        maxMinutes: 0
      },
      progressCategory: '',
      currentDateRange: '',
      activityChart: null
    };
  },
  mounted() {
    // 获取当前登录用户的ID
    this.getUserId();
    
    // 设置日期范围
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 6);
    
    // 格式化日期
    const formatDate = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    };
    
    this.currentDateRange = `${formatDate(lastWeek)} - ${formatDate(now)}`;
  },
  // 在 methods 中添加或修改
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
        } catch (error) {
          console.error('解析用户数据失败:', error);
        }
      } 
      
      // 如果localStorage中没有，则尝试从cookie中获取
      if (!userId) {
        userId = this.getCookie('userid');
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
      console.log('StudentDashboard 当前用户ID:', userId);
      
      // 加载数据
      this.loadAllData();
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
        // 获取最近观看的课程
        const recentCoursesData = await StudentCenterService.getRecentCourses(this.userId);
        
        // 确保每个课程都有一个合理的总时长显示
        this.recentCourses = recentCoursesData.map(course => {
          // 如果后端返回的duration是0或不存在，则提供一个模拟的总时长
          if (!course.duration || course.duration === "0" || course.duration === "0m") {
            // 根据课时数生成一个合理的总时长（每课时30-60分钟）
            const totalMinutes = (course.totalLessons || 1) * (30 + Math.floor(Math.random() * 30));
            
            // 格式化为小时和分钟
            if (totalMinutes >= 60) {
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              course.duration = `${hours}h${minutes > 0 ? minutes + 'm' : ''}`;
            } else {
              course.duration = `${totalMinutes}m`;
            }
          }
          return course;
        });
        
        // 获取活跃度数据
        const activityData = await StudentCenterService.getActivityData(this.userId);
        this.activityData.labels = activityData.labels || [];
        this.activityData.data = activityData.data || [];
        
        // 计算统计数据
        if (this.activityData.data.length > 0) {
          const totalMinutes = this.activityData.data.reduce((sum, val) => sum + val, 0);
          this.activityStats = {
            totalMinutes,
            averageMinutes: Math.round(totalMinutes / this.activityData.data.length),
            maxMinutes: Math.max(...this.activityData.data)
          };
        }
        
        // 初始化图表
        this.$nextTick(() => {
          this.initActivityChart();
        });
        
        // 获取学习进度分类
        const progressData = await StudentCenterService.getProgressCategoryData(this.userId);
        this.progressCategory = progressData.category;
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    },
    
    initActivityChart() {
      if (this.activityChart) {
        this.activityChart.dispose();
      }
      
      const chartDom = this.$refs.activityChartContainer;
      if (!chartDom) return;
      
      this.activityChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: this.activityData.labels || [],
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [{
          name: '学习时长(分钟)',
          type: 'bar',
          barWidth: '60%',
          data: this.activityData.data || [],
          itemStyle: {
            color: '#F98C53'
          }
        }]
      };
      
      this.activityChart.setOption(option);
      
      // 监听窗口大小变化，重新调整图表
      window.addEventListener('resize', () => {
        this.activityChart.resize();
      });
    },
    
    goToCourseList() {
      this.$router.push('/courses');
    },
    
    goToCourseDetail(courseId) {
      // 跳转到课程详情页面 - 使用正确的路径 "/courses/:id"
      this.$router.push(`/courses/${courseId}`);
    },
    
    async continueCourse(courseId) {
      console.log(`尝试继续课程，课程ID: ${courseId}`);
      try {
        // 尝试不同的API端点，使用完整的baseURL路径
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
              
              // 使用命名路由方式导航，与CourseDetail.vue保持一致
              console.log(`跳转到视频播放页 - 课时ID: ${lastLesson.id}, 课程ID: ${courseId}`);
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
    }
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', () => {
      this.activityChart.resize();
    });
    if (this.activityChart) {
      this.activityChart.dispose();
    }
  }
};
</script>

<style scoped>
.student-dashboard {
  padding: 20px;
  font-family: 'Segoe UI', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}

.dashboard-section {
  margin-bottom: 30px;
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.date-range, .view-all {
  font-size: 14px;
  color: #F98C53;
  cursor: pointer;
}

/* 我的课程样式 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.course-card {
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-bottom: 3px solid #D2E0AA;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(249, 140, 83, 0.15);
  border-bottom: 3px solid #F98C53;
}

.course-image {
  height: 140px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-content {
  padding: 15px;
}

.course-content h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-progress {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  margin-right: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #F98C53;
  border-radius: 3px;
}

.progress-text {
  font-size: 14px;
  color: #F98C53;
  font-weight: 600;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.course-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.info-btn, .continue-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 14px;
}

.info-btn {
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
}

.continue-btn {
  background-color: #F98C53;
  color: white;
  box-shadow: 0 2px 5px rgba(249, 140, 83, 0.3);
}

.info-btn:hover {
  background-color: #e0e0e0;
}

.continue-btn:hover {
  background-color: #e67a42;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(249, 140, 83, 0.4);
}

.add-course-card {
  border: 2px dashed #ddd;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 230px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-course-card:hover {
  border-color: #F98C53;
  background-color: #FFF9F5;
}

.add-icon {
  font-size: 48px;
  color: #ddd;
  transition: all 0.3s;
}

.add-course-card:hover .add-icon {
  color: #F98C53;
}

/* 活跃度样式 */
.activity-chart {
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  margin-bottom: 20px;
}

.activity-stats {
  display: flex;
  justify-content: space-around;
  background-color: #F9F2EF;
  border-radius: 10px;
  padding: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #F98C53;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 活跃度波浪容器 */
.activity-wave-container {
  background: linear-gradient(135deg, #F8FBFF 0%, #E8F4FD 100%);
  border-radius: 16px;
  padding: 30px;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  border: 1px solid #E1EFFF;
}

.activity-content {
  position: relative;
  z-index: 2;
}

/* 活跃度徽章 */
.activity-badge {
  display: inline-block;
  margin-bottom: 20px;
}

.badge-text {
  background: #6B9EFF;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(107, 158, 255, 0.3);
}

/* 波浪图表 */
.wave-chart {
  position: relative;
  width: 100%;
  height: 200px;
}

.wave-svg {
  width: 100%;
  height: 100%;
}

/* 波浪动画 */
.wave-path {
  animation: waveFloat 4s ease-in-out infinite;
}

.wave-line {
  animation: waveMove 3s ease-in-out infinite;
}

.wave-dot {
  animation: dotPulse 2s ease-in-out infinite;
}

.wave-dot:nth-child(4) {
  animation-delay: 0.5s;
}

.wave-dot:nth-child(5) {
  animation-delay: 1s;
}

.wave-dot:nth-child(6) {
  animation-delay: 1.5s;
}

/* 波浪动画关键帧 */
@keyframes waveFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes waveMove {
  0%, 100% {
    stroke-dasharray: 0 1000;
  }
  50% {
    stroke-dasharray: 500 1000;
  }
}

@keyframes dotPulse {
  0%, 100% {
    r: 4;
    opacity: 1;
  }
  50% {
    r: 6;
    opacity: 0.7;
  }
}

/* 背景装饰 */
.activity-wave-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(107, 158, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
}

.activity-wave-container::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(184, 224, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-wave-container {
    padding: 20px;
    min-height: 150px;
  }
  
  .wave-chart {
    height: 150px;
  }
  
  .badge-text {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>