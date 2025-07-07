<template>
  <div class="course-list-bg">
    <TeacherHeader />
    <div class="main-flex">
      <!-- <div class="vertical-title">课程列表管理</div> -->
      <div class="main-content">
        <div class="header-banner">
          <h2>我的课程</h2>
          <p>在这里管理和编辑你发布的所有课程</p>
        </div>
        <div class="filter-row">
          <label>课程分类：</label>
          <select v-model="selectedCategory" @change="filterCourses">
            <option value="">全部</option>
            <option>学科主修</option>
            <option>职场技能</option>
            <option>人文通识</option>
            <option>考研督学</option>
            <option>兴趣探索</option>
          </select>
        </div>
        <div v-if="filteredCourses.length === 0" class="empty-tip">暂无课程</div>
        <div v-else class="course-grid">
          <div 
            v-for="(course, index) in filteredCourses" 
            :key="course.id" 
            class="course-card"
          >
            <div class="card-header">
              <div class="index">{{ index + 1 }}</div>
              <img :src="course.coverUrl" alt="课程封面" class="cover" />
              <!-- 标题覆盖层 -->
              <div class="title-overlay">
                <h3 class="course-title">{{ course.title }}</h3>
              </div>
            </div>
            <div class="card-body">
              <!-- 基本信息单行显示 -->
              <p class="meta">
                <span>分类：{{ course.category }}</span>
                <span class="divider">|</span>
                <span>难度：{{ course.level }}</span>
                <span class="divider">|</span>
                <span class="price">¥{{ course.price }}</span>
              </p>
              <p class="intro">{{ course.introMd }}</p>
              <div class="button-group">
                <button class="edit-btn" @click="editCourse(course.id)">编辑</button>
                <button 
                  class="chat-btn" 
                  @click="createCourseGroupChat(course)"
                  :disabled="course.hasChatGroup"
                  :class="{ 'btn-disabled': course.hasChatGroup }"
                >
                  {{ course.hasChatGroup ? '群聊已创建' : '创建群聊' }}
                </button>
              </div>
            </div>
      </div>
    </div>
    <!-- 返回顶部按钮 -->
    <transition name="fade">
      <button 
        v-show="showBackToTop" 
        class="back-to-top"
        @click="scrollToTop"
      >
        ↑
      </button>
    </transition>
    
    <!-- 创建群聊结果弹窗 -->
    <el-dialog
      title="创建群聊结果"
      v-model="dialogVisible"
      width="30%"
    >
      <div class="dialog-content">
        <p v-if="createSuccess" class="success-message">
          <i class="el-icon-success"></i>
          群聊创建成功！
        </p>
        <p v-else class="error-message">
          <i class="el-icon-error"></i>
          {{ errorMessage }}
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button v-if="createSuccess" type="primary" @click="goToChatPage">
            前往聊天页面
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  </div>
  </div>
</template>

<script>
import TeacherHeader from 'src/components/commen/header/TeacherHeader.vue'
import axios from '@/utils/http.js';

export default {
  name: "TeacherCourseList",
  data() {
    return {
      teacherId: null,
      courses: [],

      filteredCourses: [],
      selectedCategory: '',
      showBackToTop: false,
      dialogVisible: false,
      createSuccess: false,
      errorMessage: '',
      createdGroupId: null

    };
  },
  mounted() {
    this.initTeacherId();
    this.$nextTick(() => {
      if (this.teacherId) {
        this.fetchCourses();
      }
    });
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    getCurrentUserId() {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; userid=`);
      if (parts.length === 2) {
        const userId = parts.pop().split(';').shift();
        return userId ? parseInt(userId) : null;
      }
      return null;
    },
    initTeacherId() {
      const userId = this.getCurrentUserId();
      if (userId) {
        this.teacherId = userId;
        console.log('当前教师ID:', userId);
      } else {
        console.error('无法获取当前用户ID，请确保已登录');
        alert('无法获取用户信息，请重新登录');
      }
    },
    fetchCourses() {
      if (!this.teacherId) {
        console.error('教师ID未设置，无法获取课程列表');
        return;
      }

      fetch(`http://localhost:8080/api/teacher/course/list?teacherId=${this.teacherId}`)
        .then(res => res.json())
        .then(data => {
          // 为每个课程添加是否已有群聊的标记
          this.courses = data.map(course => ({
            ...course,
            hasChatGroup: false
          }));
          // this.courses = data;
          this.filterCourses();
          
          // 检查每个课程是否已有群聊
          this.checkExistingCourseGroups();

        })
        .catch(error => {
          console.error('获取课程列表失败:', error);
        });
    },
    checkExistingCourseGroups() {
      // 获取所有群聊
      axios.get(`/api/chat/conversations?userId=${this.teacherId}`)
        .then(res => {
          if (res.data.status === 10000) {
            const groupChats = res.data.data.filter(c => 
              c.conversation.type === 'GROUP' && 
              c.group && 
              c.group.id
            );
            
            // 检查每个课程是否有同名群聊
            this.courses.forEach(course => {
              const courseGroupName = `${course.title} 【课程群聊】`;
              const existingGroup = groupChats.find(g => g.title === courseGroupName);
              if (existingGroup) {
                course.hasChatGroup = true;
              }
            });
          }
        })
        .catch(error => {
          console.error('获取群聊列表失败:', error);
        });
    },
    createCourseGroupChat(course) {
      // 获取课程学生列表
      axios.get(`/api/teacher/course/${course.id}/students`, {
        params: { teacherId: this.teacherId }
      })
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            const students = res.data;
            const memberIds = students.map(student => student.id);
            
            // 创建群聊
            const groupName = `${course.title} 【课程群聊】`;
            
            axios.post(`/api/chat/conversation/group?userId=${this.teacherId}`, {
              groupName: groupName,
              memberIds: memberIds,
            })
            .then(res => {
              if (res.data.status === 10000) {
                this.createSuccess = true;
                this.dialogVisible = true;
                this.createdGroupId = res.data.data.group.id;
                
                // 更新课程状态
                course.hasChatGroup = true;
              } else {
                this.createSuccess = false;
                this.errorMessage = res.data.message || '创建群聊失败';
                this.dialogVisible = true;
              }
            })
            .catch(error => {
              this.createSuccess = false;
              this.errorMessage = '创建群聊请求失败，请稍后再试';
              this.dialogVisible = true;
              console.error('创建群聊失败:', error);
            });
          } else {
            this.createSuccess = false;
            this.errorMessage = '获取课程学生列表失败';
            this.dialogVisible = true;
          }
        })
        .catch(error => {
          this.createSuccess = false;
          this.errorMessage = '获取课程学生列表失败，请稍后再试';
          this.dialogVisible = true;
          console.error('获取课程学生列表失败:', error);
        });
    },
    goToChatPage() {
      this.dialogVisible = false;
      this.$router.push('/chat');
    },
    editCourse(courseId) {
      this.$router.push(`/teacher/edit-course/${courseId}`);
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 0;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    filterCourses() {
      if (!this.selectedCategory) {
        this.filteredCourses = this.courses;
      } else {
        this.filteredCourses = this.courses.filter(
          c => c.category === this.selectedCategory
        );
      }
    }
  }
};
</script>

<style scoped>
/* 外层背景 */
.course-list-bg {
  min-height: 100vh;
  background: #F9F2EF;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 主内容容器 */
.main-flex {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1500px;
  /* margin-top: 2rem; */
  flex-direction: row;
  align-items: flex-start;
}

.main-content {
  background: #f8faff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 2rem 2rem 3rem 2rem;
  margin-top: 2rem;
  /* margin-bottom: 2rem; */
  width: 100%;
  max-width: 1400px;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 绿色横幅 */
.header-banner {
  background: #d7e7b9;
  border-radius: 12px;
  padding: 2.5rem 2rem 2rem 2rem;
  margin-bottom: 2rem;
  text-align: center;
  width: 100%;
  height: 245px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.header-banner h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
}

.header-banner p {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

/* 筛选行样式 */
.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  font-size: 1rem;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
}

.filter-row label {
  font-weight: 600;
  color: #374151;
}

.filter-row select {
  flex: 1;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

/* 空状态提示 */
.empty-tip {
  color: #6b7280;
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  width: 100%;
  max-width: 1200px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px dashed #e5e7eb;
  font-size: 1rem;
}

/* 课程网格布局 - 一行四个 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1200px;
}

/* 课程卡片样式 */
.course-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #f9e6d2;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
}

/* 卡片头部 */
.card-header {
  position: relative;
  height: 160px;
}

.index {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  background-color: #f58b3b;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 标题覆盖层 */
.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: 12px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* 卡片主体 */
.card-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 基本信息单行显示 */
.meta {
  color: #666;
  font-size: 12px;
  margin: 4px 0 12px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta .divider {
  margin: 0 8px;
  color: #ddd;
}

.meta .price {
  color: #f58b3b;
  font-weight: 500;
}

.intro {
  color: #555;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* .edit-btn {
  width: 100%;
  background: #f58b3b;
} */
/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 8px;
}

.edit-btn, .chat-btn {
  flex: 1;

  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(171,215,251,0.15);
}

.edit-btn {
  background-color: #ABD7FB;
}

.chat-btn {
  background-color: #F98C53;
}

.edit-btn:hover {
  /* background: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(171,215,251,0.25); */

  background-color: #9ac7ea;
}

.chat-btn:hover {
  background-color: #f7a059;
}

.btn-disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-disabled:hover {
  background-color: #ccc;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 900px) {
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .header-banner {
    padding: 1.5rem 1rem;
    margin: 1rem 0 1.5rem 0;
  }
  .header-banner h2 {
    font-size: 1.5rem;
  }
  .header-banner p {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
  .filter-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* 返回顶部按钮样式 */
.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f58b3b;
  color: white;
  font-size: 20px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.back-to-top:hover {
  background-color: #f7a059;
  transform: scale(1.1);
}

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.vertical-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 2rem;
  font-weight: 700;
  color: #4a4a4a;
  letter-spacing: 2px;
  white-space: nowrap;
  margin-right: 2rem;
  margin-top: 10rem;
  display: flex;
  align-items: center;
  height: 100%;
}
/* 对话框样式 */
.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.success-message, .error-message {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.success-message {
  color: #67C23A;
}

.error-message {
  color: #F56C6C;
}

.success-message i, .error-message i {
  font-size: 24px;
  margin-right: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>