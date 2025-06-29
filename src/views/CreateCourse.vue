<template>
    <div class="page">
      <!-- TeacherHeader 组件 -->
      <TeacherHeader /> 
  
      <!-- 主内容区：左侧垂直标题 + 表单 -->
      <div class="main-content">
        <!-- 左侧垂直标题 -->
        <div class="vertical-title">
          创建新课程
        </div>
  
        <!-- 表单容器（优化后） -->
        <div class="form-container">
          <!-- 步骤 1：课程基本信息 -->
          <div v-if="step === 1" class="form-step">
            <h3>课程信息</h3>
            <div class="form-row">
              <label>课程标题</label>
              <input v-model="course.title" required />
            </div>
            <div class="form-row">
              <label>分类</label>
              <select v-model="course.category" required>
                <option disabled value="">请选择分类</option>
                <option>学科主修</option>
                <option>职场技能</option>
                <option>人文通识</option>
                <option>考研督学</option>
                <option>兴趣探索</option>
              </select>
            </div>
            <div class="form-row">
              <label>选择等级</label>
              <select v-model="course.level" required>
                <option disabled value=""></option>
                <option>基础</option>
                <option>目标</option>
                <option>菁英</option>
              </select>
            </div>
            <div class="form-row">
              <label>封面图片</label>
              <ImageUpload 
                v-model="course.coverUrl" 
                @upload-success="handleImageUploadSuccess" 
                @upload-error="handleImageUploadError" 
              />
            </div>
            <div class="form-row">
              <label>课程介绍</label>
              <textarea v-model="course.introMd"></textarea>
            </div>
            <div class="form-row">
              <label>价格(元/月)</label>
              <input type="number" v-model="course.price" min="0" />
            </div>
            <div class="form-row">
              <label>试看百分比(%)</label>
              <input type="number" v-model="course.previewPercent" min="0" max="100" />
            </div>
            <div class="form-row">
              <label>状态</label>
              <select v-model="course.status" required>
                <option :value="0">草稿</option>
                <option :value="1">上架</option>
                <option :value="2">下架</option>
              </select>
            </div>
          </div>
  
          <!-- 步骤 2：章节 -->
          <div v-if="step === 2" class="form-step">
            <h3>章节信息</h3>
            <div v-for="(chapter, index) in chapters" :key="index" class="chapter-card">
              <div class="form-row">
                <label>章节标题</label>
                <input v-model="chapter.title" required />
              </div>
            </div>
          </div>

          <!-- 步骤 3：课时 -->
          <div v-if="step === 3" class="form-step">
          <h3>课时信息</h3>
          <div v-for="(chapter, cIndex) in chapters" :key="cIndex" class="chapter-lessons">
            <h4>章节 {{ cIndex + 1 }}: {{ chapter.title }}</h4>
            <div v-for="(lesson, lIndex) in lessonsMap[cIndex]" :key="lIndex" class="lesson-card">
              <div class="form-row">
                <label>课时标题</label>
                <input v-model="lesson.title" required />
              </div>
              <div class="form-row">
                <label>视频地址</label>
                <VideoUpload 
                  v-model="lesson.videoUrl" 
                  @upload-success="handleVideoUploadSuccess" 
                  @upload-error="handleVideoUploadError" 
                />
              </div>
              <div class="form-row">
                <label>时长(秒)</label>
                <input type="number" v-model="lesson.duration" />
              </div>
              <div class="form-row">
                <label>
                  <input type="checkbox" v-model="lesson.isPreview" /> 可试看
                </label>
              </div>
            </div>
          </div>
        </div>
  
          <!-- 动态按钮区 -->
          <div class="actions">
            <button v-if="step > 1" @click="prevStep" class="nav-btn">⬅ 上一步</button>
            <button v-if="step === 1" @click="addChapterAndNext" class="nav-btn">➕ 添加章节</button>
            <button v-if="step === 2" @click="addLessonAndNext" class="nav-btn">➕ 添加课时</button>
            <button v-if="step === 3" @click="submitCourse" class="submit-btn">提交课程</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import TeacherHeader from 'src/components/commen/header/TeacherHeader.vue' 
  import ImageUpload from 'src/components/ImageUpload.vue'
  import VideoUpload from 'src/components/VideoUpload.vue'
  import { reactive, ref } from 'vue'
  import axios from 'axios'
  
  const step = ref(1)
  const course = reactive({
    teacherId: 3,
    title: '',
    category: '',
    level: '基础',
    coverUrl: '',
    introMd: '',
    price: 10,
    previewPercent: 10,
    status: 0
  })
  const chapters = reactive([])
  const lessonsMap = reactive({})
  
  // const handleImageUploadSuccess = (data) => {
  //   try {
  //   const formData = new FormData()
  //   formData.append('file', data.file)
    
  //   const response = await axios.post('/api/upload/image', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  //   // 将服务器返回的URL赋值给封面
  //   course.coverUrl = response.data.url
  // } catch (error) {
  //   console.error('上传到服务器失败:', error)
  //   alert('图片上传失败，请重试')
  // }}

  // 处理图片上传成功
  const handleImageUploadSuccess = (data) => {
    console.log('图片上传成功:', data)
    // 这里可以调用后端API上传图片到服务器
    // 然后将返回的URL赋值给 course.coverUrl
  }

  // 处理图片上传错误
  const handleImageUploadError = (error) => {
    console.error('图片上传失败:', error)
  }

  // 处理视频上传成功
  const handleVideoUploadSuccess = (data) => {
    console.log('视频上传成功:', data)
    // 自动填充视频时长
    if (data.info && data.info.duration) {
      // 找到当前正在编辑的课时并更新时长
      const currentLesson = Object.values(lessonsMap).flat().find(lesson => lesson.videoUrl === data.url)
      if (currentLesson) {
        currentLesson.duration = Math.round(data.info.duration)
      }
    }
  }

  // 处理视频上传错误
  const handleVideoUploadError = (error) => {
    console.error('视频上传失败:', error)
  }

  function addChapterAndNext() {
    chapters.push({ title: '' })
    lessonsMap[chapters.length - 1] = []
    step.value = 2
  }
  function addLessonAndNext() {
    chapters.forEach((_, index) => {
      if (!lessonsMap[index]) lessonsMap[index] = []
      lessonsMap[index].push({
        title: '',
        videoUrl: '',
        duration: 0,
        isPreview: false
      })
    })
    step.value = 3
  }
  function prevStep() { step.value > 1 && step.value-- }
  async function submitCourse() {
    // 数据验证
    if (!course.title || course.title.trim() === '') {
      alert('请输入课程标题')
      return
    }
    
    if (!course.level) {
      alert('请选择课程等级')
      return
    }
    
    if (chapters.length === 0) {
      alert('请至少添加一个章节')
      return
    }
    
    for (let i = 0; i < chapters.length; i++) {
      if (!chapters[i].title || chapters[i].title.trim() === '') {
        alert(`请填写第${i + 1}章的标题`)
        return
      }
      
      if (!lessonsMap[i] || lessonsMap[i].length === 0) {
        alert(`请为第${i + 1}章添加至少一个课时`)
        return
      }
      
      for (let j = 0; j < lessonsMap[i].length; j++) {
        if (!lessonsMap[i][j].title || lessonsMap[i][j].title.trim() === '') {
          alert(`请填写第${i + 1}章第${j + 1}个课时的标题`)
          return
        }
      }
    }
    
    try {
    // 构造符合后端DTO的数据结构
    const payload = {
      course: {
        teacherId: course.teacherId,
        title: course.title,
        category: course.category,
        level: course.level,
        coverUrl: course.coverUrl,
        introMd: course.introMd,
        price: course.price,
        previewPercent: course.previewPercent,
        status: course.status
      },
      chapters: chapters.map((chapter, idx) => ({
        chapter: {
          title: chapter.title
          // 如果Chapter实体有更多字段，按需加
        },
        lessons: (lessonsMap[idx] || []).map(lesson => ({
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          isPreview: lesson.isPreview
          // 按后端Lesson实体字段定义
        }))
      }))
    };
    
    // 把Vue响应式对象转换为普通JSON对象
    const data = JSON.parse(JSON.stringify(payload));

    console.log('发送的数据:', data);

    const response = await axios.post('http://localhost:8080/api/teacher/course/create', data);

    if (response.data && response.data.courseId) {
      alert('课程创建成功！');
      // 重置逻辑
      step.value = 1;
      Object.assign(course, {
        teacherId: 3,
        title: '',
        category: '',
        level: '基础',
        coverUrl: '',
        introMd: '',
        price: 0,
        previewPercent: 10,
        status: 0
      });
      chapters.splice(0);
      Object.keys(lessonsMap).forEach(k => delete lessonsMap[k]);
    } else {
      alert('课程创建失败: ' + (response.data?.message || '未知错误'));
    }
  } catch (error) {
    console.error('请求错误:', error);
    alert('课程创建失败: ' + (error.response?.data?.message || error.message || '网络错误'));
  }
  }
  </script>
  
  <style scoped>
  
  /* 页面基础布局 */
  .page {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #F9F2EF; 
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }
  
  /* TeacherHeader 组件样式 */
  TeacherHeader {
    width: 100%;
    max-width: 1500px;
  }
  
  /* 主内容区 */
  .main-content {
    display: flex;
    justify-content: center; /* 水平居中 */
    width: 100%;
    max-width: 1500px;
    margin-top: 2rem; /* 与上方保持固定距离 */
    flex-direction: row; /* 确保左右排列 */
    align-items: flex-start; /* 顶部对齐，内容增加时向下扩展 */
  }
  
  /* 左侧垂直标题 */
  .vertical-title {
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-size: 2rem;
    font-weight: 700;
    color: #4a4a4a; /* 深灰色 */
    letter-spacing: 2px;
    white-space: nowrap;
    margin-right: 2rem;
    margin-top: 10rem;
    display: flex;
    align-items: center;
    height: 100%;
  }
  
  /* 表单容器 */
  .form-container {
    flex: 1;
    background-color: #f8faff;
    border-radius: 16px; /* 更大的圆角 */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); /* 更明显的阴影 */
    overflow: hidden;
    min-height: 500px;
    padding: 2rem; /* 增加内边距 */
  }
  
  .form-step {
    padding: 0;
  }
  .form-step h3 {
    margin: 0 0 1.5rem; /* 调整间距 */
    font-size: 1.4rem; /* 字体更大 */
    font-weight: 600;
    color: #555555;
    border-bottom: 1px solid #f0f0f0; /* 增加底部边框 */
    padding-bottom: 0.8rem;
  }
  .form-step input,
  .form-step select,
  .form-step textarea {
    width: 100%;
    padding: 0.85rem; /* 增加内边距 */
    margin-bottom: 1.2rem; /* 调整间距 */
    border: 1px solid #cccccc; /* 柔和的边框颜色 */
    border-radius: 10px; /* 更大的圆角 */
    font-size: 1.05rem;
    color: #333;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .form-step input:focus,
  .form-step select:focus,
  .form-step textarea:focus {
    border-color: #6a98ed; /* 柔和的蓝色焦点边框 */
    box-shadow: 0 0 0 4px rgba(106, 152, 237, 0.25); /* 柔和的蓝色焦点阴影 */
  }
  .form-step textarea {
    resize: vertical;
    min-height: 100px; /* 增加最小高度 */
  }
  .chapter-card {
    background-color: #f8faff; /* 浅蓝色背景 */
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #dbe9ff; /* 浅蓝色边框 */
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03); /* 增加轻微阴影 */
  }
  .lesson-card {
    background-color: #fdfefe; /* 接近白色背景 */
    padding: 1.2rem;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    margin-bottom: 1.2rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02); /* 增加轻微阴影 */
  }
  .actions {
    display: flex;
    gap: 1.2rem; /* 调整按钮间距 */
    justify-content: flex-end;
    padding: 1.5rem 0 0 0; /* 调整内边距 */
    border-top: 1px solid #e0e0e0;
    background-color: transparent; /* 移除背景色 */
    margin-top: 2rem; /* 增加与表单内容的间距 */
  }
  .nav-btn,
  .submit-btn {
    padding: 0.8rem 1.6rem; /* 增加内边距 */
    border: none;
    border-radius: 10px; /* 更大的圆角 */
    cursor: pointer;
    transition: all 0.3s ease; /* 更平滑的过渡效果 */
    font-size: 1.05rem;
    font-weight: 500;
  }
  .nav-btn {
    background-color: #e9ecef; /* 柔和的灰色 */
    color: #555555;
  }
  .nav-btn:hover {
    background-color: #dcdfe4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 增加阴影 */
  }
  .submit-btn {
    background-color: #5a8dee; /* 柔和的蓝色 */
    color: #fff;
  }
  .submit-btn:hover {
    background-color: #4a7ddb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* 增加阴影 */
  }

  .form-row {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem; /* 调整行间距 */
}
.form-row label {
  width: 120px; /* 调整标签宽度 */
  font-size: 1.05rem;
  color: #4a4a4a; /* 深灰色 */
  margin-right: 1.5rem; /* 调整标签与输入框的间距 */
  flex-shrink: 0;
}
.form-row input,
.form-row select,
.form-row textarea {
  flex: 1;
  margin: 0;
}
  </style>