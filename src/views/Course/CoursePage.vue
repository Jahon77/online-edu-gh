<template>
  <Layout>
    <div class="course-nav-page">
      <h1>课程导航</h1>
      <div class="course-links">
        <router-link to="/courses" class="course-link">
          <div class="link-card">
            <h2>课程列表</h2>
            <p>浏览所有课程</p>
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
import Layout from "../components/commen/layout.vue";

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