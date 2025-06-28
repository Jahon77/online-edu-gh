<template>
  <div class="dashboard-container">
    <h1 class="page-title">我的课程</h1>
    
    <!-- 课程卡片容器 -->
    <div class="course-cards">
      <div v-for="course in courses" :key="course.id" class="course-card">
        <!-- 课程封面 -->
        <div class="course-cover">
          <img :src="course.coverUrl || '/src/assets/images/default-course.jpg'" :alt="course.title">
        </div>
        
        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-title">{{ course.title }}</h3>
          <div class="course-category">{{ course.category }} · {{ course.level }}</div>
          
          <!-- 进度环 -->
          <div class="progress-container">
            <div class="progress-circle" :style="getProgressStyle(course.progress)">
              <div class="progress-inner">
                <span class="progress-text">{{ Math.floor(course.progress * 100) }}%</span>
              </div>
            </div>
            
            <!-- 学习时间 -->
            <div class="last-learn">
              <div>上次学习</div>
              <div>{{ formatDate(course.lastLearnTime) }}</div>
            </div>
          </div>
          
          <!-- 下一学习点 -->
          <div class="next-learning-point">
            <h4>继续学习</h4>
            <div class="next-point">{{ course.nextLearningPoint }}</div>
            <button class="continue-btn" @click="continueLearning(course)">继续学习</button>
          </div>
        </div>
      </div>
      
      <!-- 暂无课程的提示 -->
      <div v-if="courses.length === 0" class="no-courses">
        <div class="empty-message">您目前还没有订阅课程</div>
        <button class="browse-courses-btn" @click="browseCourses">浏览课程</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      courses: [],
      userId: 1, // 默认用户ID，实际应从登录信息获取
      loading: false,
      error: null
    };
  },
  created() {
    this.fetchStudentCourses();
  },
  methods: {
    async fetchStudentCourses() {
      this.loading = true;
      try {
        const response = await axios.get(`/api/students/${this.userId}/courses`);
        if (response.data && response.data.status === 0) {
          this.courses = response.data.data;
        } else {
          this.error = '获取课程失败';
          console.error('获取课程失败:', response.data);
        }
      } catch (error) {
        this.error = '获取课程失败';
        console.error('获取课程出错:', error);
      } finally {
        this.loading = false;
      }
    },
    getProgressStyle(progress) {
      const angle = progress * 360;
      let style = {};
      
      if (progress <= 0.5) {
        style = {
          '--progress-angle': `${angle}deg`,
          '--progress-color': '#F98C53' // 使用指定的橙色
        };
      } else {
        style = {
          '--progress-right-angle': '180deg', 
          '--progress-left-angle': `${angle - 180}deg`,
          '--progress-color': '#F98C53' // 使用指定的橙色
        };
      }
      
      return style;
    },
    formatDate(dateString) {
      if (!dateString) return '未开始学习';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    },
    continueLearning(course) {
      this.$router.push(`/courses/${course.courseId}`);
    },
    browseCourses() {
      this.$router.push('/courses');
    }
  }
};
</script>

<style>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
  border-left: 5px solid #F98C53;
  padding-left: 15px;
}

.course-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 25px;
}

.course-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.course-cover {
  height: 180px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.course-card:hover .course-cover img {
  transform: scale(1.05);
}

.course-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-category {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.progress-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.progress-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.progress-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--progress-color) var(--progress-angle, 0deg),
    #f0f0f0 var(--progress-angle, 0deg)
  );
}

.progress-circle::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: 
    conic-gradient(
      var(--progress-color) var(--progress-right-angle, 0deg),
      #f0f0f0 var(--progress-right-angle, 0deg)
    );
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0, 50% 100%, 0 100%);
}

.progress-inner {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.progress-text {
  font-size: 18px;
  font-weight: bold;
  color: var(--progress-color, #F98C53);
}

.last-learn {
  padding-left: 20px;
  color: #666;
  font-size: 14px;
}

.next-learning-point {
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.next-learning-point h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #333;
}

.next-point {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
  line-height: 1.5;
}

.continue-btn {
  background-color: #F98C53;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.continue-btn:hover {
  background-color: #e67e45;
}

/* 暂无课程样式 */
.no-courses {
  grid-column: 1 / -1;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 80px;
  text-align: center;
}

.empty-message {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.browse-courses-btn {
  background-color: #F98C53;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.browse-courses-btn:hover {
  background-color: #e67e45;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .course-cards {
    grid-template-columns: 1fr;
  }
  
  .no-courses {
    padding: 40px 20px;
  }
}
</style> 