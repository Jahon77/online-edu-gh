<template>
  <div class="edit-course-page">
    <TeacherHeader />

    <div class="main-content">
      <!-- 课程编辑表单 -->
      <div class="form-container">
        <h3>课程信息</h3>
        <form @submit.prevent="saveCourse">
          <div class="form-layout">
            <!-- 左侧字段 -->
            <div class="form-left">
              <div class="form-row">
                <label>标题：</label>
                <input v-model="course.title" required />
              </div>
              <div class="form-row">
                <label>分类：</label>
                <select v-model="course.category" required>
                  <option>学科主修</option>
                  <option>职场技能</option>
                  <option>人文通识</option>
                  <option>考研督学</option>
                  <option>兴趣探索</option>
                </select>
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
            </div>
            
            <!-- 右侧字段 -->
            <div class="form-right">
              <div class="form-row">
                <label>封面：</label>
                <div class="cover-input-wrap">
                  <img v-if="coverPreview" :src="coverPreview" alt="课程封面" class="cover" @click="showPreview = true" />
                  <button v-if="coverPreview" class="cover-btn" @click="triggerFileInput" type="button">更换</button>
                  <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleFileChange" />
                  <button v-if="!coverPreview" class="cover-btn" @click="triggerFileInput" type="button">上传封面</button>
                </div>
              </div>
              <div class="form-row">
                <label>简介：</label>
                <textarea v-model="course.introMd" rows="8"></textarea>
              </div>
            </div>
          </div>
          
          <div v-if="showPreview" class="cover-modal" @click.self="showPreview = false">
            <img :src="coverPreview" class="cover-large" />
            <button class="close-btn" @click="showPreview = false">关闭</button>
          </div>
        </form>
      </div>

      <!-- 章节课时管理 -->
      <div class="chapter-section">
        <div class="collapse-header" @click="toggleCollapse">
          <h3>章节与课时管理</h3>
          <span class="toggle-icon">{{ isCollapsed ? '+' : '-' }}</span>
        </div>

        <div v-show="!isCollapsed" class="collapse-content">
          <div v-for="(item, index) in chapterList" :key="item.chapter.id" class="chapter-card">
            <div class="form-row chapter-header">
              <span>章节 {{ index + 1 }}：{{ item.chapter.title }}</span>
              <button @click="deleteChapter(item.chapter.id)" class="delete-btn">删除章节</button>
            </div>

            <div class="lesson-list">
              <div v-for="lesson in item.lessons" :key="lesson.id" class="form-row lesson-item" style="flex-direction:column;align-items:stretch;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="lesson-title" style="cursor:pointer;color:#409eff;text-decoration:underline;"
                        @click="toggleVideoPanel(lesson.id)">
                    课时：{{ lesson.title }} ({{ lesson.duration }} 秒)
                  </span>
                  
                  <button @click="deleteLesson(lesson.id)" class="delete-btn">删除</button>
                </div>
                <!-- 视频面板 -->
                <div v-if="videoPanelOpen[lesson.id]" style="margin-top:12px;padding:16px 12px;background:#f5f7fa;border-radius:8px;">
                  <h4 style="margin-bottom:12px;">{{ lesson.title }} 视频</h4>
                  <video v-if="lesson.videoUrl" :src="lesson.videoUrl" controls style="width:400px;max-width:90vw;height:220px;border-radius:8px;background:#000;margin-bottom:12px;" />
                  <div v-else style="color:#888;margin-bottom:12px;">暂无视频</div>
                  <div style="display:flex;gap:12px;align-items:center;">
                    <button class="change-btn" @click="triggerVideoFileInput(lesson.id)">
                      {{ lesson.videoUrl ? '更换视频' : '上传视频' }}
                    </button>
                    <button v-if="lesson.videoUrl" @click="deleteLessonVideo(lesson)" class="delete-btn">删除视频</button>
                    <input :ref="'videoFileInput_' + lesson.id" type="file" accept="video/*" style="display:none"
                      @change="handleVideoFileChange(lesson, $event)" />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-row">
              <label>新课时标题：</label>
              <input v-model="newLessonTitle[item.chapter.id]" placeholder="新课时标题" class="input-inline short-input" />
              <button @click="addLesson(item.chapter.id)" class="add-btn">添加课时</button>
            </div>
          </div>

          <div class="form-row">
            <label>新章节标题：</label>
            <input v-model="newChapterTitle" placeholder="新章节标题" class="short-input" />
            <button @click="addChapter" class="add-btn">添加章节</button>
          </div>

          <div class="form-row">
            <label>课程作业：</label>
            <button @click="goToQuestionManager" class="question-btn">管理课程作业</button>
          </div>
          
          <div class="actions">
            <button type="button" @click="saveCourse">保存</button>
            <button type="button" @click="deleteCourse">删除</button>
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
      isCollapsed: false,
      coverFile: null,
      coverPreview: '',
      showPreview: false,
      lessonVideoFiles: {},
      videoPanelOpen: {}
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
        .then(res => res.json())
        .then(data => {
          this.course = data;
          this.coverPreview = data.coverUrl;
        });
    },
    fetchChapters() {
      fetch(`http://localhost:8080/api/teacher/course/${this.courseId}/chapters`)
        .then(res => res.json())
        .then(data => {
          this.chapterList = data;
        });
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.coverFile = file;
      this.coverPreview = URL.createObjectURL(file);
    },
    toggleVideoPanel(lessonId) {
      this.videoPanelOpen[lessonId] = !this.videoPanelOpen[lessonId];
    },
    triggerVideoFileInput(lessonId) {
      const refName = 'videoFileInput_' + lessonId;
      const input = this.$refs[refName];
      if (input && input[0] && typeof input[0].click === 'function') {
        input[0].value = null;
        input[0].click();
      } else if (input && typeof input.click === 'function') {
        input.value = null;
        input.click();
      } else {
        alert('视频上传框未正确渲染');
      }
    },
    handleVideoFileChange(lesson, e) {
      const file = e.target.files[0];
      if (!file) return;
      const lessonId = lesson.id;
      if (lessonId) {
        this.lessonVideoFiles[lessonId] = file;
        // 先本地预览
        lesson.videoUrl = URL.createObjectURL(file);

        // 获取视频时长
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = lesson.videoUrl;
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = Math.round(video.duration); // 秒数，四舍五入
          lesson.duration = duration;

          // 立即上传
          const userId = this.getCurrentUserId();
          const formData = new FormData();
          formData.append("file", file);
          formData.append("userId", userId);
          fetch("http://localhost:8080/api/file/upload", {
            method: "POST",
            body: formData
          })
            .then(res => res.json())
            .then(result => {
              if (result.status === 0 && result.data?.[0]?.fileUrl) {
                lesson.videoUrl = result.data[0].fileUrl; // 用服务器地址替换
                // 这里 lesson.duration 已经是最新的
              } else {
                alert("视频上传失败");
              }
            });
        };
      }
    },
    deleteLessonVideo(lesson) {
      if (lesson) {
        lesson.videoUrl = "";
        delete this.lessonVideoFiles[lesson.id];
      }
    },
    async saveCourse() {
      const userId = this.getCurrentUserId();

      try {
        // 封面上传
        if (this.coverFile) {
          const formData = new FormData();
          formData.append("file", this.coverFile);
          formData.append("userId", userId);
          const res = await fetch("http://localhost:8080/api/file/upload", {
            method: "POST",
            body: formData
          });
          const result = await res.json();
          if (result.status === 0 && result.data?.[0]?.fileUrl) {
            this.course.coverUrl = result.data[0].fileUrl;
          } else {
            alert("封面上传失败");
            return;
          }
        }

        // 视频上传
        const promises = [];
        for (const lessonId in this.lessonVideoFiles) {
          const file = this.lessonVideoFiles[lessonId];
          if (!file) continue;
          const formData = new FormData();
          formData.append("file", file);
          formData.append("userId", userId);
          const p = fetch("http://localhost:8080/api/file/upload", {
            method: "POST",
            body: formData
          })
            .then(res => res.json())
            .then(result => {
              if (result.status === 0 && result.data?.[0]?.fileUrl) {
                for (const chapter of this.chapterList) {
                  const lesson = chapter.lessons.find(l => l.id == lessonId);
                  if (lesson) lesson.videoUrl = result.data[0].fileUrl;
                }
              } else {
                alert("视频上传失败");
                throw new Error("视频上传失败");
              }
            });
          promises.push(p);
        }
        await Promise.all(promises);

        // 合并章节到课程中
        this.course.chapters = this.chapterList.map(item => ({
          chapter: item.chapter,
          lessons: item.lessons
        }));

        console.log(JSON.stringify(this.course));

        await fetch(`http://localhost:8080/api/teacher/course/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.course)
        });

        alert("课程更新成功！");
        this.$router.push("/teacher/courseList");
      } catch (e) {
        alert("保存失败：" + e.message);
      }
    },
    deleteCourse() {
      if (confirm("确定删除课程？")) {
        fetch(`http://localhost:8080/api/teacher/course/delete/${this.courseId}`, {
          method: "DELETE"
        }).then(() => {
          alert("删除成功");
          this.$router.push("/teacher/course-manager");
        });
      }
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
      this.$router.push(`/teacher/question-manager/${this.courseId}`);
    },
    getCurrentUserId() {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; userid=`);
      if (parts.length === 2) {
        const userId = parts.pop().split(";").shift();
        return userId ? parseInt(userId) : null;
      }
      return null;
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
    flex-direction: column; 
    align-items: center; 
    gap: 2rem;
  }

  /* 复用表单容器样式 */
  .form-container {
    width: 100%;
    background-color: #f8faff;
    border-radius: 16px; 
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); 
    overflow: hidden;
    min-height: 300px;
    padding: 1.5rem; 
  }

.form-container h3 {
  margin: 0 0 1.5rem; 
  font-size: 1.4rem; 
  font-weight: 600;
  color: #555555;
  border-bottom: 1px solid #f0f0f0; 
  padding-bottom: 0.8rem;
}

  /* 表单布局 */
  .form-layout {
    display: flex;
    gap: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .form-left {
    flex: 1;
    width: 500px;
  }
  
  .form-right {
    flex: 1.5;
    width: 500px;
  }
  
  /* 复用表单行样式 */
  .form-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.2rem;
  }
  .form-row label {
    width: 120px; 
    font-size: 1.05rem;
    color: #4a4a4a;
    margin-right: 1rem;
    flex-shrink: 0;
    text-align: right;
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
    width: 100%;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    max-height: 720px;
    min-height: 720px; 
    overflow-y: auto;
    display: flex;
    flex-direction: column;
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
  width: 100%;
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

  .cover-input-wrap {
    display: flex;
    /* align-items: center; */
    width: 100%; 
    max-width: 100%;
    gap: 18px;
  }
.cover {
  width: 90%;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  border: 1.5px solid #e5e6eb;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s, transform 0.2s;
}
.cover:hover {
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  transform: scale(1.04);
}
.cover-btn {
  background: #ff8686;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(255,134,134,0.08);
}
.cover-btn:hover {
  background: #ff5c5c;
  box-shadow: 0 4px 16px rgba(255,92,92,0.15);
}
.cover-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.cover-large {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}
.close-btn {
  position: absolute;
  top: 30px;
  right: 30px;
  background: #fff;
  color: #333;
  border: none;
  border-radius: 50%;
  width: 90px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.video-modal-mask {
  position: fixed; left:0; top:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.video-modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 40px 40px 32px 40px;
  min-width: 600px;
  max-width: 900px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.video-modal-content h4 {
  font-size: 1.25rem;
  margin-bottom: 24px;
}
.video-modal-content video {
  width: 600px;
  max-width: 80vw;
  height: 340px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: #000;
}

.change-btn {
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  transition: background 0.2s;
}
.change-btn:hover {
  background: #1976d2;
}

.video-btn-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.short-input {
  width: 320px;
  min-width: 120px;
  max-width: 100%;
}
</style>