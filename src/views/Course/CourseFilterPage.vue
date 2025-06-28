<template>
  <div class="course-filter-page">
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

    <div class="main-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索课程名称、讲师或关键词..." 
            class="search-input"
          >
          <button class="search-button" @click="searchCourses">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-container">
          <div class="filter-group">
            <label>分类：</label>
            <button 
              v-for="category in categories" 
              :key="category"
              :class="['filter-btn', { active: selectedCategory === category }]"
              @click="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>
          
          <div class="filter-group">
            <label>难度：</label>
            <button 
              v-for="level in levels" 
              :key="level"
              :class="['filter-btn', { active: selectedLevel === level }]"
              @click="selectLevel(level)"
            >
              {{ level }}
            </button>
          </div>
          
          <div class="filter-group">
            <label>排序：</label>
            <button 
              v-for="(sortName, sortKey) in sortOptions" 
              :key="sortKey"
              :class="['filter-btn', { active: selectedSort === sortKey }]"
              @click="selectSort(sortKey)"
            >
              {{ sortName }}
            </button>
          </div>
        </div>
      </div>

      <!-- 课程列表 -->
      <div class="course-list">
        <div class="course-grid">
          <div 
            v-for="course in filteredCourses" 
            :key="course.id" 
            class="course-card"
            @click="goToCourseDetail(course.id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="course.coverUrl || 'https://via.placeholder.com/280x160'" :alt="course.title" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(course.level)}`">
                  {{ course.level }}
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ course.title }}</h3>
                <p class="card-category">{{ course.category }}</p>
                <p class="card-intro">{{ course.introMd ? course.introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ course.subscriberCount || 0 }}人已订阅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <button class="load-more-btn" @click="loadMore">
          加载更多
        </button>
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
import axios from '../utils/http'

export default {
  name: 'CourseFilterPage',
  data() {
    return {
      courses: [],
      filteredCourses: [],
      searchQuery: '',
      categories: ['全部', '学科主修', '职场技能', '人文通识', '考研督学', '兴趣探索'],
      levels: ['全部', '基础', '目标', '菁英'],
      sortOptions: {
        'recommend': '推荐',
        'new': '最新',
        'hot': '热门'
      },
      selectedCategory: '全部',
      selectedLevel: '全部',
      selectedSort: 'recommend',
      page: 1,
      hasMore: true
    }
  },
  created() {
    // 从路由参数中获取初始筛选条件
    const { category, level, sort } = this.$route.query
    if (category) this.selectedCategory = category
    if (level) this.selectedLevel = level
    if (sort) this.selectedSort = sort
    
    this.fetchCourses()
  },
  methods: {
    async fetchCourses() {
      try {
        const params = {
          category: this.selectedCategory === '全部' ? '' : this.selectedCategory,
          level: this.selectedLevel === '全部' ? '' : this.selectedLevel,
          sort: this.selectedSort
        }
        
        const response = await axios.get('/api/courses/filter', { params })
        if (response.data.code === 200) {
          this.courses = response.data.data
          this.applySearch() // 应用搜索过滤
          this.hasMore = response.data.data.length >= 10 // 假设每页10条
        }
      } catch (error) {
        console.error('获取课程列表失败:', error)
        // 使用模拟数据进行测试
        this.courses = this.getMockCourses()
        this.applySearch()
        this.hasMore = this.courses.length >= 10
      }
    },
    selectCategory(category) {
      this.selectedCategory = category
      this.page = 1
      this.fetchCourses()
    },
    selectLevel(level) {
      this.selectedLevel = level
      this.page = 1
      this.fetchCourses()
    },
    selectSort(sort) {
      this.selectedSort = sort
      this.page = 1
      this.fetchCourses()
    },
    loadMore() {
      this.page++
      this.fetchCourses()
    },
    goToCourseDetail(id) {
      this.$router.push({ name: 'CourseDetail', params: { id } })
    },
    getLevelClass(level) {
      switch (level) {
        case '基础': return 'basic'
        case '目标': return 'target'
        case '菁英': return 'elite'
        default: return 'default'
      }
    },
    searchCourses() {
      this.applySearch()
    },
    applySearch() {
      if (!this.searchQuery) {
        this.filteredCourses = [...this.courses]
        return
      }
      
      const query = this.searchQuery.toLowerCase()
      this.filteredCourses = this.courses.filter(course => 
        course.title?.toLowerCase().includes(query) || 
        course.introMd?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
      )
    },
    // 模拟数据用于测试
    getMockCourses() {
      return [
        {
          id: 1,
          title: '高等数学基础',
          category: '学科主修',
          level: '基础',
          introMd: '本课程涵盖高等数学的基础知识，包括函数、极限、微积分等内容',
          subscriberCount: 1250,
          coverUrl: '/src/assets/images/course/course-bar/course-bar1-1.png'
        },
        {
          id: 2,
          title: '大学英语精讲',
          category: '学科主修',
          level: '目标',
          introMd: '系统讲解大学英语语法、阅读和写作技巧，提升英语综合能力',
          subscriberCount: 950,
          coverUrl: '/src/assets/images/course/course-bar/course-bar2-1.png'
        },
        {
          id: 3,
          title: '物理实验进阶',
          category: '职场技能',
          level: '菁英',
          introMd: '通过实验深入理解物理原理，培养实验设计和数据分析能力',
          subscriberCount: 680,
          coverUrl: '/src/assets/images/course/course-bar/course-bar3-1.png'
        },
        {
          id: 4,
          title: '有机化学入门',
          category: '职场技能',
          level: '基础',
          introMd: '介绍有机化学的基本概念、反应机理和实验技术',
          subscriberCount: 520,
          coverUrl: '/src/assets/images/course/course-bar/course-bar4-1.png'
        }
      ]
    }
  }
}
</script>

<style scoped>
.course-filter-page {
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9f9f9;
}

/* 顶部导航栏样式 */
.site-header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #F98C53;
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
  padding: 10px 0;
  position: relative;
}

.main-nav li.active a {
  color: #F98C53;
}

.main-nav li.active a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
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

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
}

/* 搜索框样式 */
.search-section {
  margin-bottom: 30px;
}

.search-container {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: none;
  outline: none;
  font-size: 16px;
}

.search-button {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 0 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background-color: #e67641;
}

/* 筛选区域样式 */
.filter-section {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group label {
  min-width: 60px;
  color: #666;
  font-weight: 500;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: none;
  cursor: pointer;
  transition: all 0.3s;
  color: #333;
}

.filter-btn:hover {
  border-color: #ABD7FB;
  color: #ABD7FB;
}

.filter-btn.active {
  background-color: #ABD7FB;
  color: white;
  border-color: #ABD7FB;
}

/* 课程卡片样式 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.course-card {
  cursor: pointer;
  transition: transform 0.3s;
  border-radius: 10px;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-5px);
}

.course-card-inner {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
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
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
}

.level-basic {
  background-color: #D2E0AA;
  color: #333;
}

.level-target {
  background-color: #ABD7FB;
  color: #333;
}

.level-elite {
  background-color: #FCCEB4;
  color: #333;
}

.card-content {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.card-category {
  display: inline-block;
  padding: 4px 12px;
  background-color: #F9F2EF;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  width: fit-content;
}

.card-intro {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer {
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.students {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: #F9F2EF;
  padding: 4px 10px;
  border-radius: 20px;
  width: fit-content;
  margin-left: auto;
}

.students::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F98C53' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'%3e%3c/path%3e%3ccircle cx='9' cy='7' r='4'%3e%3c/circle%3e%3cpath d='M23 21v-2a4 4 0 0 0-3-3.87'%3e%3c/path%3e%3cpath d='M16 3.13a4 4 0 0 1 0 7.75'%3e%3c/path%3e%3c/svg%3e");
  background-size: contain;
  background-repeat: no-repeat;
}

/* 加载更多按钮 */
.load-more {
  text-align: center;
  margin: 30px 0;
}

.load-more-btn {
  padding: 12px 30px;
  background-color: #F98C53;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.load-more-btn:hover {
  background-color: #e67641;
  transform: translateY(-2px);
}

/* 底部区域样式 */
.site-footer {
  background-color: #333;
  color: #fff;
  padding: 50px 0 20px;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.footer-section h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: #F98C53;
}

.footer-section p {
  margin: 0 0 10px;
  font-size: 14px;
  color: #ccc;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #F98C53;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}

.social-icon:hover {
  background-color: #F98C53;
  transform: translateY(-3px);
}

.copyright {
  text-align: center;
  padding-top: 30px;
  margin-top: 30px;
  border-top: 1px solid #444;
  font-size: 14px;
  color: #888;
}

@media (max-width: 768px) {
  .filter-group {
    flex-wrap: wrap;
  }
  
  .filter-btn {
    flex: 1;
    min-width: 80px;
  }
  
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style> 