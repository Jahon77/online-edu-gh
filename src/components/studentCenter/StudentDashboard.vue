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
              <span>{{ course.duration }}</span>
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
        <h2>您的活跃度</h2>
        <div class="date-range">{{ currentDateRange }}</div>
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
import axios from 'axios';
import * as echarts from 'echarts';

// 替换为导入自定义服务
import StudentCenterService from '@/utils/studentCenterService';

export default {
  name: 'StudentDashboard',
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
    // 设置默认用户ID为7
    this.userId = 7;
    localStorage.setItem('userId', this.userId);
    
    // 加载数据
    this.loadAllData();
    
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
  methods: {
    async loadAllData() {
      try {
        // 获取最近观看的课程
        const recentCoursesData = await StudentCenterService.getRecentCourses(this.userId);
        this.recentCourses = recentCoursesData;
        
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
      this.$router.push('/course/list');
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

@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .activity-stats {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style> 