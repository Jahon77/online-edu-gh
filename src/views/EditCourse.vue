<template>
    <div class="edit-course-page">
      <TeacherHeader />
  
      <div class="main-content">
        
  
        <!-- 课程编辑表单 -->
        <div class="form-container">
          <h3>课程信息</h3>
          <form @submit.prevent="saveCourse">
            <div class="form-row">
              <label>标题：</label>
              <input v-model="course.title" required />
            </div>
            <div class="form-row">
              <label>分类：</label>
              <input v-model="course.category" />
            </div>
            <div class="form-row">
              <label>难度：</label>
              <select v-model="course.level">
                <option value="基础">基础</option>
                <option value="目标">目标</option>
                <option value="菁英">菁英</option>
              </select>
            </div>
            <div class="form-row">
              <label>价格：</label>
              <input type="number" v-model="course.price" min="0" />
            </div>
  
            <div class="form-row">
              <label>封面图：</label>
              <!-- <img :src="course.coverUrl" alt="课程封面" class="cover" /> -->
              <ImageUpload
                  v-model="coverPreview"
                  @upload-success="handleImageUploadSuccess"
                  @upload-error="handleImageUploadError"
                />
            </div>
            <div class="form-row">
              <label>简介：</label>
              <textarea v-model="course.introMd" rows="4"></textarea>
            </div> 
          </form>
          <div class="actions">
          <button type="button" @click="saveCourse">保存</button>
          <button type="button" @click="deleteCourse">删除</button>
        </div>
        </div>
  
        <!-- 章节课时管理 折叠面板 -->
        <div class="chapter-section">
          <div class="collapse-header" @click="toggleCollapse">
            <h3>章节与课时管理</h3>
            <span class="toggle-icon">{{ isCollapsed ? '+' : '-' }}</span>
          </div>
  
          <div v-show="!isCollapsed" class="collapse-content">
            <div
              v-for="(item, index) in chapterList"
              :key="item.chapter.id"
              class="chapter-card"
            >
              <div class="form-row chapter-header">
                <span>章节 {{ index + 1 }}：{{ item.chapter.title }}</span>
                <button @click="deleteChapter(item.chapter.id)" class="delete-btn">
                  删除章节
                </button>
              </div>
  
              <div class="lesson-list">
                <div
                  v-for="lesson in item.lessons"
                  :key="lesson.id"
                  class="form-row lesson-item"
                >
                  <span>课时：{{ lesson.title }} ({{ lesson.duration }} 分钟)</span>
                  <button @click="deleteLesson(lesson.id)" class="delete-btn">
                    删除
                  </button>
                </div>
              </div>
  
              <div class="form-row">
                <label>新课时标题：</label>
                <input
                  v-model="newLessonTitle[item.chapter.id]"
                  placeholder="新课时标题"
                  class="input-inline"
                />
                <button @click="addLesson(item.chapter.id)" class="add-btn">
                  添加课时
                </button>
              </div>
            </div>
  
            <div class="form-row">
              <label>新章节标题：</label>
              <input
                v-model="newChapterTitle"
                placeholder="新章节标题"
              />
              <button @click="addChapter" class="add-btn">
                添加章节
              </button>
            </div>

            <!-- 新增課程作業按鈕 -->
            <div class="form-row">
              <label>課程作業：</label>
              <button @click="goToQuestionManager" class="question-btn">
                <i class="fas fa-tasks"></i>
                管理課程作業
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </template>
    
  <script>
  import TeacherHeader from "src/components/commen/header/TeacherHeader.vue";
  
  export default {
    name: "EditCourse",
    components: { TeacherHeader },
    data() {
      return {
        courseId: this.$route.params.id,
        isNew: this.$route.params.id === "new",
        course: {
          title: "",
          category: "",
          level: "基础",
          price: 0,
          coverUrl: "",
          introMd: ""
        },
        chapterList: [],
        newChapterTitle: "",
        newLessonTitle: {},
        isCollapsed: false // 折叠状态，默认展开
      };
    },
    mounted() {
      if (!this.isNew) {
        this.fetchCourse();
        this.fetchChapters();
      }
    },
    methods: {
      toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
      },
      fetchCourse() {
        fetch(`http://localhost:8080/api/teacher/course/${this.courseId}`)
          .then((res) => res.json())
          .then((data) => {
            this.course = data;
          });
      },
      saveCourse() {
        fetch(`http://localhost:8080/api/teacher/course/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.course)
        }).then(() => {
          alert("课程更新成功！");
          this.$router.push("/teacher/courseList");
        });
      },
      deleteCourse() {
        if (confirm("确定要删除该课程吗？")) {
          fetch(`http://localhost:8080/api/teacher/course/delete/${this.courseId}`, {
            method: "DELETE"
          }).then(() => {
            alert("课程已删除");
            this.$router.push("/teacher/course-manager");
          });
        }
      },
      fetchChapters() {
        fetch(`http://localhost:8080/api/teacher/course/${this.courseId}/chapters`)
          .then((res) => res.json())
          .then((data) => {
            this.chapterList = data;
          });
      },
      addChapter() {
        const chapter = {
          courseId: this.courseId,
          title: this.newChapterTitle,
          sortOrder: this.chapterList.length
        };
        fetch("http://localhost:8080/api/teacher/course/chapter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chapter)
        }).then(() => {
          this.newChapterTitle = "";
          this.fetchChapters();
        });
      },
      deleteChapter(chapterId) {
        fetch(`http://localhost:8080/api/teacher/course/chapter/${chapterId}`, {
          method: "DELETE"
        }).then(() => this.fetchChapters());
      },
      addLesson(chapterId) {
        const lesson = {
          chapterId,
          title: this.newLessonTitle[chapterId],
          duration: 5,
          sortOrder: 0,
          isPreview: 0
        };
        fetch("http://localhost:8080/api/teacher/course/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lesson)
        }).then(() => {
          this.newLessonTitle[chapterId] = "";
          this.fetchChapters();
        });
      },
      deleteLesson(lessonId) {
        fetch(`http://localhost:8080/api/teacher/course/lesson/${lessonId}`, {
          method: "DELETE"
        }).then(() => this.fetchChapters());
      },
      goToQuestionManager() {
        // 跳转到课程作业管理页面
        this.$router.push(`/teacher/question-manager/${this.courseId}`);
      }
    }
  };
  </script>
  
  <style scoped>
  /* 复用创建课程的页面基础布局样式 */
  .edit-course-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #F9F2EF; 
    min-height: 100vh;
    padding: 0;
    margin: 0;
    overflow: auto; /* 保证滚动逻辑一致 */
  }
  
  /* 复用 TeacherHeader 样式 */
  TeacherHeader {
    width: 100%;
    max-width: 1500px;
  }
  
  /* 复用主内容区布局 */
  .main-content {
    display: flex;
    justify-content: center; 
    width: 100%;
    max-width: 1500px;
    margin-top: 2rem; 
    flex-direction: row; 
    align-items: flex-start; 
  }
  
  /* 复用表单容器样式 */
  .form-container {
    flex: 1;
    background-color: #f8faff;
    border-radius: 16px; 
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); 
    overflow: hidden;
    min-height: 500px;
    padding: 2rem; 
  }
  
  .form-container h3 {
    margin: 0 0 1.5rem; 
    font-size: 1.4rem; 
    font-weight: 600;
    color: #555555;
    border-bottom: 1px solid #f0f0f0; 
    padding-bottom: 0.8rem;
  }
  
  /* 复用表单行样式 */
  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 1.2rem; 
  }
  .form-row label {
    width: 120px; 
    font-size: 1.05rem;
    color: #4a4a4a; 
    margin-right: 1.5rem; 
    flex-shrink: 0;
  }
  .form-row input,
  .form-row select,
  .form-row textarea {
    flex: 1;
    padding: 0.85rem; 
    margin: 0;
    border: 1px solid #cccccc; 
    border-radius: 10px; 
    font-size: 1.05rem;
    color: #333;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
    width: 500px;
  }
  .form-row input:focus,
  .form-row select:focus,
  .form-row textarea:focus {
    border-color: #6a98ed; 
    box-shadow: 0 0 0 4px rgba(106, 152, 237, 0.25); 
  }
  .form-row textarea {
    resize: vertical;
    min-height: 100px; 
  }
  
  /* 按钮组样式 */
  .actions {
    display: flex;
    gap: 1.2rem; 
    justify-content: flex-end;
    padding: 1.5rem 0 0 0; 
    border-top: 1px solid #e0e0e0;
    background-color: transparent; 
    margin-top: 2rem; 
  }
  .nav-btn,
  button {
    padding: 0.8rem 1.6rem; 
    border: none;
    border-radius: 10px; 
    cursor: pointer;
    transition: all 0.3s ease; 
    font-size: 1.05rem;
    font-weight: 500;
  }
  button[type="submit"] {
    background-color: #5a8dee; 
    color: #fff;
  }
  button[type="button"] {
    background-color: #f56c6c; 
    color: #fff;
  }
  button:hover {
    opacity: 0.9;
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  }
  
  /* 章节管理面板样式调整 */
  .chapter-section {
    background: #f8faff;
    padding: 2rem;
    border-radius: 16px; 
    flex: 1;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    max-height: 720px;
    min-height: 720px; 
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    margin-left: 20px; /* 和表单保持间距，可按需调整 */
  }
  .collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid #f0f0f0; 
    padding-bottom: 0.8rem;
    margin-bottom: 1.5rem;
  }
  .toggle-icon {
    font-size: 24px;
    font-weight: bold;
    color: #409eff;
  }
  .collapse-content {
    flex: 1;
    overflow-y: auto;
  }
  .chapter-card {
    background-color: #fdfefe; 
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #dbe9ff; 
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03); 
  }
  .chapter-header {
    justify-content: space-between;
    font-weight: 600;
    color: #555;
  }
  .lesson-list {
    margin-left: 0; /* 去掉默认左边距，用 form-row 控制 */
  }
  .lesson-item {
    justify-content: space-between;
    margin: 0.5rem 0;
  }
  .input-inline {
    flex: 1;
    margin-right: 10px;
  }
  .add-btn {
    background-color: #67c23a;
    color: #fff;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  .add-btn:hover {
    opacity: 0.9;
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  }
  .delete-btn {
    background-color: #f56c6c;
    color: #fff;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }
  .delete-btn:hover {
    opacity: 0.9;
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  }

  .form-row img.cover {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-left: 10px;
  }

  .question-btn {
    background-color: #67c23a;
    color: #fff;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .question-btn:hover {
    opacity: 0.9;
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 

  }
</style>