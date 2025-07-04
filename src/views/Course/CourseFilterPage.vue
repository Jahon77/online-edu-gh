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
            <li><router-link to="/dashboard">我的学习</router-link></li>
            <li><a href="#" @click.prevent>论坛</a></li>
            <li><a href="#" @click.prevent>学习助手</a></li>
          </ul>
        </nav>
        <div class="user-actions">
          <button class="btn-download">APP下载</button>
          <div class="user-avatar">
            <img src="https://via.placeholder.com/36" alt="用户头像">
          </div>
          <button class="btn-logout" @click="logout">退出</button>
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
        <!-- 加载指示器 -->
        <div class="loading-container" v-if="isLoading">
          <div class="loading-spinner"></div>
          <p>正在加载课程...</p>
        </div>
        
        <div v-else-if="filteredCourses.length === 0" class="no-courses">
          <p>没有找到符合条件的课程</p>
          <button @click="resetFilters" class="reset-btn">重置筛选条件</button>
        </div>
        
        <div class="course-grid" v-else>
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
import axios from 'src/utils/http'
import studentCourseListService from 'src/utils/studentCourseListService'

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
      isLoading: false
    }
  },
  created() {
    // 从路由参数中获取初始筛选条件
    const { category, level, sort, search } = this.$route.query
    
    // 设置分类
    if (category && this.categories.includes(category)) {
      this.selectedCategory = category
    }
    
    // 设置难度级别
    if (level && this.levels.includes(level)) {
      this.selectedLevel = level
    }
    
    // 设置排序方式
    if (sort && Object.keys(this.sortOptions).includes(sort)) {
      this.selectedSort = sort
    }
    
    // 设置搜索关键词
    if (search) {
      this.searchQuery = search
    }
    
    // 获取课程数据
    this.fetchCourses()
  },
  methods: {
    async fetchCourses() {
      // 显示加载状态
      this.isLoading = true;
      console.log("开始获取课程数据...");
      
      try {
        // 构建筛选条件，与CourseList.vue保持一致
        const filters = {
          category: this.selectedCategory === '全部' ? '' : this.selectedCategory,
          level: this.selectedLevel === '全部' ? '' : this.selectedLevel,
          sortType: this.selectedSort,
          search: this.searchQuery || ''
        };
        
        console.log("应用筛选条件:", filters);
        
        // 使用与CourseList.vue相同的服务获取数据
        const courses = await studentCourseListService.filterCourses(filters);
        
        console.log("获取到原始课程数据:", courses);
        
        if (courses && Array.isArray(courses) && courses.length > 0) {
          this.courses = courses;
          this.applySearch(); // 应用搜索过滤
          console.log(`加载了 ${this.courses.length} 门课程，筛选后有 ${this.filteredCourses.length} 门课程`);
        } else {
          console.warn('未获取到课程数据或数据为空');
          this.courses = [];
          this.filteredCourses = [];
        }
      } catch (error) {
        console.error('获取课程列表失败:', error);
        // 使用模拟数据进行测试
        this.courses = this.getMockCourses();
        this.applySearch();
      } finally {
        // 隐藏加载状态
        this.isLoading = false;
      }
      
      // 更新URL参数，保持筛选条件在URL中，方便分享和刷新
      this.updateUrlParams()
    },
    logout() {
      // 清除本地存储的用户信息
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userInfo');
      
      // 显示退出成功提示
      alert('已成功退出登录');
      
      // 跳转到登录页面或首页
      this.$router.push('/login');
    },
    selectCategory(category) {
      this.selectedCategory = category
      this.fetchCourses()
    },
    selectLevel(level) {
      this.selectedLevel = level
      this.fetchCourses()
    },
    selectSort(sort) {
      this.selectedSort = sort
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
      // 重新获取课程，包含搜索条件
      this.fetchCourses()
    },
    
    // 更新URL参数，方便分享和刷新
    updateUrlParams() {
      const query = {}
      
      if (this.selectedCategory !== '全部') {
        query.category = this.selectedCategory
      }
      
      if (this.selectedLevel !== '全部') {
        query.level = this.selectedLevel
      }
      
      if (this.selectedSort !== 'recommend') {
        query.sort = this.selectedSort
      }
      
      if (this.searchQuery) {
        query.search = this.searchQuery
      }
      
      // 使用replace避免在历史记录中创建新条目
      this.$router.replace({ query })
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
        course.category?.toLowerCase().includes(query) ||
        (course.level && course.level.toLowerCase().includes(query))
      )
    },
    // 重置所有筛选条件
    resetFilters() {
      this.selectedCategory = '全部';
      this.selectedLevel = '全部';
      this.selectedSort = 'recommend';
      this.searchQuery = '';
      this.fetchCourses();
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
/* 整体页面样式 */
.course-filter-page {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', Arial, sans-serif;
  color: #333;
  background: linear-gradient(135deg, #F9F2EF 0%, #fff 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.course-filter-page::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 140, 83, 0.2) 0%, rgba(249, 140, 83, 0) 70%);
  z-index: 0;
  animation: float 15s ease-in-out infinite alternate;
}

.course-filter-page::after {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -100px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(210, 224, 170, 0.2) 0%, rgba(210, 224, 170, 0) 70%);
  z-index: 0;
  animation: float 20s ease-in-out infinite alternate-reverse;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, 20px) rotate(5deg); }
  100% { transform: translate(-20px, 10px) rotate(-5deg); }
}

/* 顶部导航栏样式 */
.site-header {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.site-header:hover {
  background-color: rgba(255, 255, 255, 0.95);
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
  font-size: 28px;
  color: #F98C53;
  text-shadow: 0 2px 4px rgba(249, 140, 83, 0.2);
  transition: all 0.3s ease;
}

.logo h1:hover {
  transform: scale(1.05);
  text-shadow: 0 4px 8px rgba(249, 140, 83, 0.3);
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav li {
  margin: 0 15px;
  position: relative;
  transition: transform 0.3s ease;
}

.main-nav li:hover {
  transform: translateY(-2px);
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 10px 0;
  position: relative;
  transition: color 0.3s ease;
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
  background: linear-gradient(90deg, #F98C53, #FCCEB4);
  transform: scaleX(1);
  transform-origin: left;
}

.main-nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #F98C53, #FCCEB4);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.main-nav a:hover::after {
  transform: scaleX(1);
}

.user-actions {
  display: flex;
  align-items: center;
}

.btn-download {
  background: linear-gradient(135deg, #F98C53 0%, #FCCEB4 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  margin-right: 15px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(249, 140, 83, 0.3);
  transition: all 0.3s ease;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(249, 140, 83, 0.4);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid rgba(249, 140, 83, 0.3);
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(249, 140, 83, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.user-avatar:hover img {
  transform: scale(1.1);
}

.btn-logout {
  background: #ff4757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
}

.btn-logout:hover {
  background: #ff3838;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 71, 87, 0.4);
}

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* 搜索框样式 */
.search-section {
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease both;
  animation-delay: 0.2s;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-container {
  display: flex;
  max-width: 700px;
  margin: 0 auto;
  border-radius: 30px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 
              0 0 0 1px rgba(255, 255, 255, 0.5) inset,
              0 5px 15px rgba(249, 140, 83, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.search-container:hover, .search-container:focus-within {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.6) inset,
              0 5px 20px rgba(249, 140, 83, 0.2);
  transform: translateY(-2px);
}

.search-input {
  flex: 1;
  padding: 18px 25px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
  transition: all 0.3s ease;
}

.search-input:focus::placeholder {
  opacity: 0.7;
  transform: translateX(5px);
}

.search-button {
  background: linear-gradient(135deg, #F98C53 0%, #FCCEB4 100%);
  color: white;
  border: none;
  padding: 0 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: linear-gradient(135deg, #e67641 0%, #f9b99a 100%);
}

.search-button svg {
  transition: transform 0.3s ease;
}

.search-button:hover svg {
  transform: scale(1.1);
}

/* 筛选区域样式 */
.filter-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.8s ease both;
  animation-delay: 0.4s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.filter-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(171, 215, 251, 0.1) 0%, rgba(171, 215, 251, 0) 70%);
  z-index: -1;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: relative;
  z-index: 1;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group label {
  min-width: 60px;
  color: #555;
  font-weight: 600;
  font-size: 15px;
  position: relative;
}

.filter-group label::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, #F98C53, transparent);
}

.filter-btn {
  padding: 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  color: #555;
  font-weight: 500;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-btn:hover {
  border-color: #F98C53;
  color: #F98C53;
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 140, 83, 0.15);
}

.filter-btn.active {
  background: linear-gradient(135deg, #F98C53 0%, #FCCEB4 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 5px 15px rgba(249, 140, 83, 0.25);
}

/* 课程卡片样式 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
  animation: fadeInUp 0.8s ease both;
  animation-delay: 0.6s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.course-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 16px;
  overflow: hidden;
  perspective: 1000px;
}

.course-card:hover {
  transform: translateY(-8px);
}

.course-card-inner {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08),
              0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s ease;
}

.course-card:hover .course-card-inner {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12),
              0 0 0 1px rgba(255, 255, 255, 0.8) inset,
              0 5px 15px rgba(249, 140, 83, 0.15);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.course-card:hover .cover {
  transform: scale(1.05);
}

.card-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.course-card:hover .card-tag {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.level-basic {
  background-color: rgba(210, 224, 170, 0.9);
  color: #333;
}

.level-target {
  background-color: rgba(171, 215, 251, 0.9);
  color: #333;
}

.level-elite {
  background-color: rgba(252, 206, 180, 0.9);
  color: #333;
}

.level-default {
  background-color: rgba(249, 242, 239, 0.9);
  color: #333;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 48px;
  transition: color 0.3s ease;
}

.course-card:hover .card-title {
  color: #F98C53;
}

.card-category {
  display: inline-block;
  padding: 5px 14px;
  background-color: rgba(249, 242, 239, 0.8);
  border-radius: 15px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  width: fit-content;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.course-card:hover .card-category {
  background-color: rgba(249, 140, 83, 0.1);
  color: #F98C53;
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
  line-height: 1.5;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: auto;
}

.students {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: rgba(249, 242, 239, 0.7);
  padding: 6px 12px;
  border-radius: 20px;
  width: fit-content;
  margin-left: auto;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.course-card:hover .students {
  background-color: rgba(249, 140, 83, 0.1);
  color: #F98C53;
}

.students::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F98C53' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'%3e%3c/path%3e%3ccircle cx='9' cy='7' r='4'%3e%3c/circle%3e%3cpath d='M23 21v-2a4 4 0 0 0-3-3.87'%3e%3c/path%3e%3cpath d='M16 3.13a4 4 0 0 1 0 7.75'%3e%3c/path%3e%3c/svg%3e");
  background-size: contain;
  background-repeat: no-repeat;
  transition: transform 0.3s ease;
}

.course-card:hover .students::before {
  transform: scale(1.1);
}

/* 加载指示器 */
.loading-container {
  text-align: center;
  margin: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(249, 140, 83, 0.1);
  border-radius: 50%;
  border-top-color: #F98C53;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(249, 140, 83, 0.2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #666;
  font-size: 18px;
  margin: 0;
  background: linear-gradient(135deg, #F98C53 0%, #FCCEB4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

/* 无课程提示 */
.no-courses {
  text-align: center;
  margin: 60px 0;
  padding: 40px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: fadeIn 0.8s ease both;
}

.no-courses p {
  color: #666;
  font-size: 20px;
  margin-bottom: 25px;
}

.reset-btn {
  padding: 12px 25px;
  background: linear-gradient(135deg, #F98C53 0%, #FCCEB4 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(249, 140, 83, 0.25);
}

.reset-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(249, 140, 83, 0.35);
}

/* 底部区域样式 */
.site-footer {
  background: linear-gradient(180deg, rgba(51, 51, 51, 0.95) 0%, #333 100%);
  color: #fff;
  padding: 60px 0 30px;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

.site-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #F98C53, #FCCEB4, #D2E0AA, #ABD7FB, #F9F2EF);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 40px;
  position: relative;
  z-index: 1;
}

.footer-section h3 {
  margin: 0 0 25px;
  font-size: 20px;
  color: #F98C53;
  position: relative;
  padding-bottom: 12px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #F98C53, transparent);
}

.footer-section p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #ccc;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 12px;
}

.footer-section ul li a {
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
  position: relative;
  padding-left: 15px;
}

.footer-section ul li a::before {
  content: '›';
  position: absolute;
  left: 0;
  top: 0;
  color: #F98C53;
  transition: transform 0.3s;
}

.footer-section ul li a:hover {
  color: #F98C53;
  transform: translateX(5px);
}

.footer-section ul li a:hover::before {
  transform: scale(1.2);
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.social-icon:hover {
  background: linear-gradient(135deg, #F98C53 0%, #FCCEB4 100%);
  transform: translateY(-5px) rotate(10deg);
  box-shadow: 0 8px 20px rgba(249, 140, 83, 0.3);
}

.copyright {
  text-align: center;
  padding-top: 40px;
  margin-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  color: #888;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .filter-group {
    flex-wrap: wrap;
  }
  
  .filter-btn {
    flex: 1;
    min-width: 80px;
    text-align: center;
  }
  
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  .main-nav {
    display: none;
  }
}

/* 添加一些微妙的动画效果 */
@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(249, 140, 83, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(249, 140, 83, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(249, 140, 83, 0.3);
  }
}

@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>