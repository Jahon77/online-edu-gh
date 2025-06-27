<template>
  <div class="course-list-page">
    <!-- 顶部导航栏 -->
    <header class="site-header">
      <div class="header-container">
        <div class="logo">
          <h1>智学通</h1>
        </div>
        <nav class="main-nav">
          <ul>
            <li class="active"><router-link to="/courses">课程中心</router-link></li>
            <li><router-link to="/index">首页</router-link></li>
            <li><router-link to="/notice">通知公告</router-link></li>
            <li><router-link to="/about">关于我们</router-link></li>
            <li><router-link to="/use">使用指南</router-link></li>
          </ul>
        </nav>
        <div class="user-actions">
          <button class="btn-download">APP下载</button>
          <div class="user-avatar">
            <img src="https://via.placeholder.com/36" alt="用户头像">
          </div>
        </div>
      </div>
    </header>

    <!-- 轮播Banner区 -->
    <div class="banner-slider">
      <div class="slider-container">
        <div class="slider-item active">
          <img src="https://via.placeholder.com/1200x300" alt="轮播图1">
          <div class="slider-content">
            <h2>精品课程，成就未来</h2>
            <p>海量优质课程，助你实现学习目标</p>
            <button class="btn-explore">立即探索</button>
          </div>
        </div>
      </div>
      <div class="slider-dots">
        <span class="dot active"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 分类导航 -->
      <div class="category-nav">
        <h2 class="section-title">发现好课</h2>
        <div class="category-tabs">
          <button class="category-tab active">全部课程</button>
          <button class="category-tab">高中</button>
          <button class="category-tab">初中</button>
          <button class="category-tab">小学</button>
          <button class="category-tab">兴趣培养</button>
        </div>
      </div>

      <!-- 筛选区 -->
      <div class="filter-section">
        <div class="tabs">
          <button :class="{active: sort==='recommend'}" @click="changeSort('recommend')">推荐</button>
          <button :class="{active: sort==='new'}" @click="changeSort('new')">最新</button>
          <button :class="{active: sort==='hot'}" @click="changeSort('hot')">热门</button>
        </div>
        <div class="filters">
          <select v-model="level">
            <option value="">全部层级</option>
            <option value="基础">基础</option>
            <option value="目标">目标</option>
            <option value="菁英">菁英</option>
          </select>
          <select v-model="subject">
            <option value="">全部学科</option>
            <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
          </select>
          <select v-model="price">
            <option value="">全部价格</option>
            <option value="free">免费</option>
            <option value="paid">付费</option>
          </select>
          <button @click="fetchCourses" class="filter-btn">筛选</button>
        </div>
      </div>

      <!-- 课程列表 -->
      <div class="course-grid">
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          @click="goDetail(course.id)"
        >
          <div class="course-card-inner">
            <div class="card-image">
              <img :src="course.coverUrl || 'https://via.placeholder.com/280x160'" alt="课程封面" class="cover">
              <div class="card-tag" :class="`level-${getLevelClass(course.level)}`">{{ course.level }}</div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ course.title }}</h3>
              <p class="card-category">{{ course.category }}</p>
              <p class="card-intro">{{ course.introMd ? course.introMd.slice(0, 40) + '...' : '' }}</p>
              <div class="card-footer">
                <div class="price" :class="{ free: course.price === 0 }">
                  <span v-if="course.price === 0">免费</span>
                  <span v-else>￥{{ course.price }}</span>
                </div>
                <div class="students">
                  <span>{{ Math.floor(Math.random() * 100) + 1 }}人已学习</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 翻页 -->
      <div class="pagination">
        <button :disabled="page===1" @click="page-- && fetchCourses()" class="page-btn prev">上一页</button>
        <span class="page-info">第 {{ page }} 页</span>
        <button :disabled="!hasMore" @click="page++ && fetchCourses()" class="page-btn next">下一页</button>
      </div>

      <!-- 精选推荐区 -->
      <div class="featured-section">
        <h2 class="section-title">精选推荐</h2>
        <div class="featured-grid">
          <div class="featured-card big-card">
            <img src="https://via.placeholder.com/400x280" alt="精选课程">
            <div class="featured-content">
              <h3>2025备考指导</h3>
              <p>全学科高分策略 · 高效学习规划</p>
              <div class="tag">热门</div>
            </div>
          </div>
          <div class="featured-card">
            <img src="https://via.placeholder.com/280x180" alt="精选课程">
            <div class="featured-content">
              <h3>数学思维训练营</h3>
              <p>提高解题能力和数学思维</p>
            </div>
          </div>
          <div class="featured-card">
            <img src="https://via.placeholder.com/280x180" alt="精选课程">
            <div class="featured-content">
              <h3>英语听力突破</h3>
              <p>独家听力训练方法</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习路径区 -->
      <div class="learning-path">
        <h2 class="section-title">学习路径</h2>
        <div class="path-steps">
          <div class="path-step">
            <div class="step-icon">1</div>
            <div class="step-content">
              <h3>选择课程</h3>
              <p>根据学习需求选择合适的课程</p>
            </div>
          </div>
          <div class="path-arrow">→</div>
          <div class="path-step">
            <div class="step-icon">2</div>
            <div class="step-content">
              <h3>系统学习</h3>
              <p>按照课程规划系统学习</p>
            </div>
          </div>
          <div class="path-arrow">→</div>
          <div class="path-step">
            <div class="step-icon">3</div>
            <div class="step-content">
              <h3>完成作业</h3>
              <p>巩固所学知识点</p>
            </div>
          </div>
          <div class="path-arrow">→</div>
          <div class="path-step">
            <div class="step-icon">4</div>
            <div class="step-content">
              <h3>能力提升</h3>
              <p>全面提升学科能力</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>智学通致力于为学生提供高质量的在线学习体验</p>
        </div>
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li><a href="#">首页</a></li>
            <li><a href="#">课程</a></li>
            <li><a href="#">教师</a></li>
            <li><a href="#">学习资源</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>联系我们</h3>
          <p>电话: 400-888-8888</p>
          <p>邮箱: support@slp.com</p>
        </div>
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-icons">
            <a href="#" class="social-icon">W</a>
            <a href="#" class="social-icon">F</a>
            <a href="#" class="social-icon">T</a>
          </div>
        </div>
      </div>
      <div class="copyright">
        <p>© 2025 智学通 版权所有</p>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from '../../utils/http' // 你的http封装

export default {
  name: 'CourseList',
  data() {
    return {
      courses: [],
      page: 1,
      size: 12,
      hasMore: true,
      sort: 'recommend',
      level: '',
      subject: '',
      price: '',
      subjects: ['数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'] // 可根据实际调整
    }
  },
  mounted() {
    this.fetchCourses();
  },
  methods: {
    getCardColor(level) {
      switch (level) {
        case '基础': return '#D2E0AA';
        case '目标': return '#ABD7FB';
        case '菁英': return '#F98C53';
        default: return '#F9F2EF';
      }
    },
    getLevelClass(level) {
      switch (level) {
        case '基础': return 'basic';
        case '目标': return 'target';
        case '菁英': return 'elite';
        default: return 'default';
      }
    },
    changeSort(s) {
      this.sort = s;
      this.page = 1;
      this.fetchCourses();
    },
    goDetail(id) {
      this.$router.push({ name: 'CourseDetail', params: { id } });
    },
    async fetchCourses() {
      let params = {
        page: this.page,
        size: this.size,
        sort: this.sort === 'recommend' ? '' : this.sort,
        level: this.level,
        subject: this.subject
      };
      
      try {
        // 模拟数据，因为可能没有实际API
        setTimeout(() => {
          this.courses = [
            {
              id: 1,
              title: '高中数学必修课程',
              coverUrl: 'https://via.placeholder.com/280x160?text=数学课程',
              category: '数学',
              level: '基础',
              price: 0,
              introMd: '这是一个免费的基础数学课程，适合高一学生入门学习。包含函数、三角和向量等核心知识点。'
            },
            {
              id: 2,
              title: '英语口语进阶训练',
              coverUrl: 'https://via.placeholder.com/280x160?text=英语课程',
              category: '英语',
              level: '目标',
              price: 99,
              introMd: '这是一个进阶英语口语课程，包含实用对话和专业词汇，适合有一定基础的学生。'
            },
            {
              id: 3,
              title: '物理竞赛培训课程',
              coverUrl: 'https://via.placeholder.com/280x160?text=物理课程',
              category: '物理',
              level: '菁英',
              price: 199,
              introMd: '这是一个高级物理竞赛课程，涵盖最新理论和实验，帮助学生备战各类物理竞赛。'
            },
            {
              id: 4,
              title: '化学实验与理论',
              coverUrl: 'https://via.placeholder.com/280x160?text=化学课程',
              category: '化学',
              level: '目标',
              price: 149,
              introMd: '化学实验与理论相结合的课程，让你深入理解化学原理并掌握实验技能。'
            },
            {
              id: 5,
              title: '生物科学入门',
              coverUrl: 'https://via.placeholder.com/280x160?text=生物课程',
              category: '生物',
              level: '基础',
              price: 0,
              introMd: '生物学基础知识讲解，从细胞到生态系统，建立完整的生物学知识体系。'
            },
            {
              id: 6,
              title: '中国历史文化探索',
              coverUrl: 'https://via.placeholder.com/280x160?text=历史课程',
              category: '历史',
              level: '基础',
              price: 59,
              introMd: '带你探索中国五千年历史长河，了解中华文化的博大精深。'
            },
            {
              id: 7,
              title: '地理与环境科学',
              coverUrl: 'https://via.placeholder.com/280x160?text=地理课程',
              category: '地理',
              level: '目标',
              price: 79,
              introMd: '结合现代环境科学，深入了解地球科学和人文地理学的内容。'
            },
            {
              id: 8,
              title: '政治与社会学分析',
              coverUrl: 'https://via.placeholder.com/280x160?text=政治课程',
              category: '政治',
              level: '菁英',
              price: 129,
              introMd: '从社会学视角分析政治现象，培养独立思考和分析问题的能力。'
            },
            {
              id: 9,
              title: '数学竞赛提高班',
              coverUrl: 'https://via.placeholder.com/280x160?text=数学竞赛',
              category: '数学',
              level: '菁英',
              price: 299,
              introMd: '专为数学竞赛设计的高级课程，包含奥数题型和解题技巧。'
            }
          ];
          
          // 价格筛选
          if (this.price === 'free') {
            this.courses = this.courses.filter(c => c.price == 0);
          }
          if (this.price === 'paid') {
            this.courses = this.courses.filter(c => c.price > 0);
          }
          
          this.hasMore = this.page < 3; // 模拟有3页数据
        }, 500);
      } catch (err) {
        console.error('获取课程列表失败:', err);
      }
    }
  }
}
</script>

<style scoped>
/* 整体样式 */
.course-list-page {
  background-color: #F9F2EF;
  min-height: 100vh;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', Arial, sans-serif;
}

/* 顶部导航栏 */
.site-header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
}

.logo h1 {
  margin: 0;
  color: #F98C53;
  font-size: 24px;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav li {
  margin: 0 15px;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 5px 0;
  position: relative;
}

.main-nav li.active a {
  color: #F98C53;
}

.main-nav li.active a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #F98C53;
}

.user-actions {
  display: flex;
  align-items: center;
}

.btn-download {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  margin-right: 15px;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 轮播Banner区 */
.banner-slider {
  height: 300px;
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
}

.slider-container {
  height: 100%;
}

.slider-item {
  position: relative;
  height: 100%;
}

.slider-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slider-content {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.slider-content h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.slider-content p {
  font-size: 18px;
  margin-bottom: 20px;
}

.btn-explore {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-explore:hover {
  background-color: #e67641;
}

.slider-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.5);
  margin: 0 5px;
}

.dot.active {
  background-color: white;
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 分类导航 */
.section-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background-color: #F98C53;
  border-radius: 3px;
}

.category-nav {
  margin-bottom: 30px;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 10px;
}

.category-tab {
  background: none;
  border: none;
  padding: 10px 25px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  margin-right: 10px;
  border-radius: 20px;
  transition: all 0.3s;
}

.category-tab.active {
  background-color: #F98C53;
  color: white;
}

/* 筛选区 */
.filter-section {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.tabs {
  margin-bottom: 15px;
}

.tabs button {
  background: none;
  border: none;
  padding: 8px 20px;
  margin-right: 15px;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tabs button.active {
  color: #F98C53;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #F98C53;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.filters select {
  padding: 10px 15px;
  border-radius: 5px;
  border: 1px solid #ddd;
  min-width: 150px;
}

.filter-btn {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

/* 课程卡片 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.course-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-5px);
}

.course-card-inner {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
}

.card-image {
  position: relative;
  height: 160px;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  color: white;
}

.level-basic {
  background-color: #4CAF50;
}

.level-target {
  background-color: #2196F3;
}

.level-elite {
  background-color: #F98C53;
}

.card-content {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  line-height: 1.4;
  color: #333;
}

.card-category {
  font-size: 13px;
  color: #666;
  margin: 0 0 10px 0;
}

.card-intro {
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  flex-grow: 1;
  margin: 0 0 15px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: bold;
  color: #F98C53;
}

.price.free {
  color: #4CAF50;
}

.students {
  font-size: 12px;
  color: #999;
}

/* 翻页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
}

.page-btn {
  background-color: #ABD7FB;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  margin: 0 15px;
  cursor: pointer;
}

.page-btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

/* 精选推荐区 */
.featured-section {
  margin: 50px 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}

.featured-card {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  height: 180px;
}

.big-card {
  grid-column: span 1;
  grid-row: span 2;
  height: auto;
}

.featured-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.featured-card:hover img {
  transform: scale(1.05);
}

.featured-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}

.featured-content h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.featured-content p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.featured-card .tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: #F98C53;
  color: white;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 15px;
}

/* 学习路径 */
.learning-path {
  margin: 50px 0;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0,0,0,0.05);
}

.path-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.path-step {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F98C53;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-right: 15px;
}

.step-content h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.path-arrow {
  color: #ccc;
  font-size: 24px;
  margin: 0 10px;
}

/* 底部区域 */
.site-footer {
  background-color: #333;
  color: white;
  padding: 50px 0 20px;
  margin-top: 50px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  padding: 0 20px;
}

.footer-section h3 {
  font-size: 18px;
  margin: 0 0 20px 0;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 30px;
  height: 2px;
  background-color: #F98C53;
}

.footer-section p {
  margin: 10px 0;
  font-size: 14px;
  color: #aaa;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul a {
  color: #aaa;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-section ul a:hover {
  color: #F98C53;
}

.social-icons {
  display: flex;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.social-icon:hover {
  background-color: #F98C53;
}

.copyright {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 20px 20px 0;
  border-top: 1px solid #444;
  text-align: center;
  font-size: 13px;
  color: #888;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .featured-grid {
    grid-template-columns: 1fr;
  }
  
  .big-card {
    grid-column: auto;
    height: 180px;
  }
  
  .footer-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .path-steps {
    flex-direction: column;
  }
  
  .path-arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }
}

@media (max-width: 480px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>