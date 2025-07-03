<template>
  <Layout>
    <div class="course-nav-page">
      <h1>课程导航</h1>
      
      <!-- 添加学生个人中心链接 -->
      <div class="student-dashboard-link-container">
        <router-link to="/dashboard" class="student-dashboard-link">
          <div class="dashboard-button">
            <i class="dashboard-icon">👤</i>
            <span>进入学生个人中心</span>
          </div>
        </router-link>
      </div>
      
      <div class="course-links">
        <router-link to="/courses" class="course-link">
          <div class="link-card">
            <h2>课程列表</h2>
            <p>浏览所有课程</p>
          </div>
        </router-link>
        
        <router-link to="/dashboard" class="course-link">
          <div class="link-card dashboard-card">
            <h2>我的课程</h2>
            <p>查看您已订阅的课程和学习进度</p>
          </div>
        </router-link>
        
        <h2>课程详情页直接链接</h2>
        <div class="course-ids">
          <router-link 
            v-for="id in [1, 2, 3, 4, 5]" 
            :key="id" 
            :to="`/courses/${id}`"
            class="course-detail-link"
          >
            课程 #{{ id }}
          </router-link>
        </div>
        
        <!-- 添加视频播放页链接 -->
        <h2>视频播放页直接链接</h2>
        <div class="video-links">
          <router-link 
            v-for="lessonId in [1, 2, 3, 4, 5]" 
            :key="`video-${lessonId}`" 
            :to="`/student/video/${lessonId}?courseId=1&studentId=7`"
            class="video-link"
          >
            视频 #{{ lessonId }}
          </router-link>
        </div>
      </div>
      
      <div class="note">
        <h3>导航说明</h3>
        <p>这是一个临时页面，用于访问课程相关功能。</p>
        <p>在实际应用中，应该由后端提供课程数据，并在导航菜单中添加课程入口。</p>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "src/components/commen/layout.vue";

export default {
  name: "CoursePage",
  components: { Layout }
}
</script>

<style scoped>
.course-nav-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

/* 学生个人中心链接样式 */
.student-dashboard-link-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.student-dashboard-link {
  text-decoration: none;
}

.dashboard-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F98C53, #FF6B6B);
  color: white;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(249, 140, 83, 0.4);
  transition: all 0.3s ease;
}

.dashboard-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(249, 140, 83, 0.6);
}

.dashboard-icon {
  font-size: 24px;
  margin-right: 10px;
}

.course-links {
  margin-bottom: 30px;
}

.link-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.link-card h2 {
  color: #4481eb;
  margin: 0 0 10px 0;
}

.dashboard-card h2 {
  color: #F98C53;
}

.link-card p {
  color: #666;
  margin: 0;
}

.course-link {
  text-decoration: none;
  display: block;
  color: inherit;
}

.course-ids {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.course-detail-link {
  display: inline-block;
  background: #4481eb;
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.course-detail-link:hover {
  background: #2560c8;
}

/* 视频链接样式 */
.video-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.video-link {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.video-link:hover {
  background: #388E3C;
}

.note {
  background: #fffde7;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #fbc02d;
}

.note h3 {
  color: #f57c00;
  margin-top: 0;
}

.note p {
  color: #666;
  margin: 5px 0;
}
</style> 