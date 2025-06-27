<template>
    <div class="course-list-page">
      <TeacherHeader />
      <h2 class="page-title">我的课程</h2>
      <div v-if="courses.length === 0" class="empty-tip">暂无课程</div>
      <div v-else class="course-list">
        <div v-for="(course, index) in courses" :key="course.id" class="course-item">
          <div class="index">{{ index + 1 }}.</div>
          <img :src="course.coverUrl" alt="封面" class="cover" />
          <div class="info">
            <h3>{{ course.title }}</h3>
            <p>分类：{{ course.category }} | 难度：{{ course.level }}</p>
            <p>价格：¥{{ course.price }}</p>
            <p class="intro">{{ course.introMd }}</p>
            <button @click="editCourse(course.id)">编辑</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import TeacherHeader from 'src/components/commen/header/TeacherHeader.vue'
  export default {
    name: "TeacherCourseList",
    data() {
      return {
        teacherId: 1, // 实际应从登录状态中获取
        courses: []
      };
    },
    mounted() {
      this.fetchCourses();
    },
    methods: {
      fetchCourses() {
        fetch(`http://localhost:8080/api/teacher/course/list?teacherId=${this.teacherId}`)
          .then(res => res.json())
          .then(data => {
            this.courses = data;
          });
      },
      editCourse(courseId) {
        this.$router.push(`/teacher/edit-course/${courseId}`);
      }
    }
  };
  </script>
  
  <style scoped>
  /* 页面基础布局 */
  .course-list-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f9fafb;
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }
  
  /* TeacherHeader 组件样式 */
  TeacherHeader {
    width: 100%;
    max-width: 1200px;
  }
  .empty-tip {
    color: #999;
    text-align: center;
  }
  .course-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .course-item {
    display: flex;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 12px;
    align-items: flex-start;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  .index {
    width: 30px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-right: 10px;
  }
  .cover {
    width: 120px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 16px;
  }
  .info {
    flex: 1;
  }
  .info h3 {
    margin: 0 0 6px;
    font-size: 18px;
  }
  .intro {
    color: #666;
    font-size: 14px;
    margin-top: 6px;
    line-height: 1.4;
  }
  button {
    margin-top: 8px;
    background-color: #409eff;
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #66b1ff;
  }
  </style>
  