<template>
  <div class="student-detail-page">
    <button class="back-btn" @click="goBack">返回学生列表</button>
    <!-- 左侧学生信息 -->
    <div class="student-info-card">
      <div class="avatar-box">
        <img class="avatar" :src="student.avatarUrl" />
        <div class="name">{{ student.name }}</div>
        <div class="role">学号：{{ student.studentId }}</div>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">{{ student.studyTime }}</div>
          <div class="stat-label">学习时长(小时)</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ student.finishCourseNum }}</div>
          <div class="stat-label">完成课程</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ student.solveQuestionNum }}</div>
          <div class="stat-label">解题数</div>
        </div>
      </div>
      <div class="section-title">联系方式</div>
      <div class="info-list">
        <div class="info-item"><span class="label">手机号：</span>{{ student.phone }}</div>
        <div class="info-item"><span class="label">注册时间：</span>{{ formatDate(student.createdAt) }}</div>
      </div>
    </div>

    <!-- 右侧课程信息 -->
    <div class="course-list-card">
      <div class="course-list-header">
        <span class="title">已购课程</span>
      </div>
      <table class="course-table">
        <thead>
          <tr>
            <th>课程封面</th>
            <th>课程名称</th>
            <th>类别</th>
            <th>等级</th>
            <th>进度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in student.courses" :key="course.id">
            <td>
              <img class="course-cover" :src="course.coverUrl" />
            </td>
            <td>{{ course.title }}</td>
            <td>{{ course.category }}</td>
            <td>{{ course.level }}</td>
            <td>
              <div class="progress-bar-outer">
                <div class="progress-bar-inner" :style="{ width: course.courseProgress + '%' }"></div>
                <span class="progress-text">{{ course.courseProgress }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()
import http from '@/utils/http.js'

const route = useRoute()
const student = ref({
  name: '',
  studentId: '',
  phone: '',
  createdAt: '',
  avatarUrl: '',
  id: '',
  studyTime: 0,
  solveQuestionNum: 0,
  finishCourseNum: 0,
  courses: []
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const fetchStudentDetail = async () => {
  const id = route.params.id
  const res = await http.get(`/user/student/${id}`)
  if (res.data && res.data.status === 0) {
    student.value = res.data.data
  }
}

function goBack() {
  router.push('/admin/student')
}

onMounted(() => {
  fetchStudentDetail()
})
</script>

<style scoped>
.student-detail-page {
  display: flex;
  gap: 32px;
  background: var(--main-light);
  min-height: 100vh;
  padding: 32px 40px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.back-btn {
  position: absolute;
  left: 2020px;
  top: 94px;
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}
.back-btn:hover {
  background: var(--main-blue);
}


.student-info-card {
width: 360px;
  background: #fff;
  border-radius: 24px;
  padding: 36px 28px;
  margin-right: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  height: 1000px;
}
.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}
.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin-bottom: 10px;
}
.name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}
.role {
  color: #7b7b7b;
  font-size: 1rem;
  margin-top: 2px;
}
.stats {
display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 24px;
  gap: 12px;
}
.stat {
  flex: 1;
  text-align: center;
}
.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4a90e2;
}
.stat-label {
  color: #888;
  font-size: 0.95rem;
}
.section-title {
  font-weight: bold;
  color: #4a90e2;
  margin: 18px 0 6px 0;
  font-size: 1.05rem;
  align-self: flex-start;
}
.info-list {
  width: 100%;
  margin-bottom: 10px;
}
.info-item {
  color: #444;
  font-size: 0.97rem;
  margin-bottom: 4px;
}
.label {
  color: #888;
}
.course-list-card {
  flex: 1;
  background: #fff;
  border-radius: 24px;
  padding: 36px 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  min-width: 0;
  overflow-x: auto;
  height: 1000px;
}
.course-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.course-list-header .title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}
.course-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}
.course-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}
.course-table td {
  background: #f7f6fb;
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}
.course-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 8px;
  vertical-align: middle;
}
.progress-bar-outer {
  position: relative;
  width: 120px;
  height: 18px;
  background: #e0e7ef;
  border-radius: 10px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
}
.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #ff914d);
  border-radius: 10px 0 0 10px;
  transition: width 0.4s;
}
.progress-text {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  font-size: 0.95em;
  color: #333;
  font-weight: bold;
  line-height: 18px;
}
</style>
