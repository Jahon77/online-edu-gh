<template>
  <Layout>
    <div class="course-detail">
      <div class="course-header">
        <h1>{{ course.title || '课程详情' }}</h1>
        <div class="course-meta">
          <span class="category">{{ course.category || '未分类' }}</span>
          <span class="level">{{ course.level || '基础' }}</span>
          <span class="price" :class="{ free: course.price === 0 }">
            {{ course.price === 0 ? '免费' : '￥' + course.price }}
          </span>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>加载失败: {{ error }}</p>
        <button @click="fetchCourseDetail">重试</button>
      </div>
      
      <div v-else class="course-content">
        <div class="course-info">
          <div class="course-cover">
            <img :src="course.coverUrl || 'https://via.placeholder.com/400x250'" alt="课程封面">
          </div>
          
          <div class="course-intro">
            <h2>课程简介</h2>
            <p>{{ course.introMd || '暂无介绍' }}</p>
          </div>
        </div>
        
        <div class="course-tabs">
          <div class="tab-header">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'chapters' }"
              @click="activeTab = 'chapters'"
            >
              章节内容
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'comments' }"
              @click="activeTab = 'comments'"
            >
              学员评价
            </button>
          </div>
          
          <div class="tab-content">
            <div v-if="activeTab === 'chapters'" class="chapters">
              <div v-if="!course.chapters || course.chapters.length === 0" class="empty">
                暂无章节内容
              </div>
              <div v-else class="chapter-list">
                <div v-for="(chapter, index) in course.chapters" :key="index" class="chapter-item">
                  <h3>{{ chapter.title }}</h3>
                  <p>{{ chapter.description }}</p>
                </div>
              </div>
            </div>
            
            <div v-else-if="activeTab === 'comments'" class="comments">
              <div class="empty">暂无评价</div>
            </div>
          </div>
        </div>
        
        <div class="course-actions">
          <button class="btn primary">立即学习</button>
          <button class="btn secondary">收藏课程</button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/commen/layout.vue';
import axios from '../../utils/http';

export default {
  name: 'CourseDetail',
  components: { Layout },
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
      activeTab: 'chapters'
    };
  },
  mounted() {
    this.fetchCourseDetail();
  },
  methods: {
    async fetchCourseDetail() {
      this.loading = true;
      this.error = null;
      
      try {
        // 假设后端有一个获取课程详情的API
        // const response = await axios.get(`/api/courses/${this.id}`);
        // this.course = response.data.data;
        
        // 由于目前可能没有后端API，我们模拟一个响应
        setTimeout(() => {
          this.course = {
            id: this.id,
            title: `课程 #${this.id}`,
            coverUrl: 'https://via.placeholder.com/400x250',
            category: '示例分类',
            level: '基础',
            price: 0,
            introMd: '这是一个示例课程介绍。在实际环境中，这里将显示从后端获取的课程详细介绍。',
            chapters: [
              { title: '第一章：课程介绍', description: '本章介绍课程基础知识和学习方法' },
              { title: '第二章：核心概念', description: '深入讲解课程核心概念和应用场景' },
              { title: '第三章：实践演练', description: '通过实际案例进行实践操作' }
            ]
          };
          this.loading = false;
        }, 500);
      } catch (err) {
        console.error('获取课程详情失败:', err);
        this.error = '获取课程详情失败，请稍后重试';
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.course-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.course-header {
  margin-bottom: 30px;
}

.course-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.course-meta {
  display: flex;
  gap: 15px;
}

.course-meta span {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.category {
  background-color: #E3F2FD;
  color: #1976D2;
}

.level {
  background-color: #E8F5E9;
  color: #388E3C;
}

.price {
  background-color: #FFF3E0;
  color: #FF9800;
  font-weight: bold;
}

.price.free {
  background-color: #F1F8E9;
  color: #689F38;
}

.loading, .error {
  text-align: center;
  padding: 40px 0;
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
}

.course-info {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.course-cover {
  flex: 0 0 400px;
}

.course-cover img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-intro {
  flex: 1;
}

.course-intro h2 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #333;
}

.course-intro p {
  line-height: 1.6;
  color: #555;
}

.course-tabs {
  margin-bottom: 30px;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #757575;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #1976D2;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1976D2;
}

.tab-content {
  min-height: 200px;
}

.empty {
  text-align: center;
  padding: 40px 0;
  color: #757575;
  font-style: italic;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chapter-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.chapter-item h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.chapter-item p {
  margin: 0;
  color: #666;
}

.course-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #1976D2;
  color: white;
}

.btn.primary:hover {
  background-color: #1565C0;
}

.btn.secondary {
  background-color: #ECEFF1;
  color: #546E7A;
}

.btn.secondary:hover {
  background-color: #CFD8DC;
}
</style>