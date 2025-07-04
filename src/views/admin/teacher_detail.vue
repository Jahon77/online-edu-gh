<template>
    <div class="teacher-detail-container">
      <button class="back-btn" @click="goBack">← 返回教师列表</button>
      <div class="teacher-info-card" v-if="!loading && teacher">
        <img class="avatar" :src="teacher.avatarUrl" alt="头像" />
        <div class="name">{{ teacher.name }}</div>
        <div class="stats">
          <div>
            <div class="stat-num">{{ teacher.studentCount }}</div>
            <div class="stat-label">学生</div>
          </div>
          <div>
            <div class="stat-num">{{ teacher.courseCount }}</div>
            <div class="stat-label">课程</div>
          </div>
          <div>
            <div class="stat-num">{{ teacher.avgStart ? teacher.avgStart.toFixed(1) : '-' }}</div>
            <div class="stat-label">评分</div>
          </div>
        </div>
        <div class="section-title">简介</div>
        <div class="desc">{{ teacher.intro || '暂无简介' }}</div>
        <div class="section-title">个人信息</div>
        <div class="info-list">
          <div>教师号：{{ teacher.teacherId }}</div>
          <div>手机号：{{ teacher.phone }}</div>
          <div>注册时间：{{ teacher.createdAt ? teacher.createdAt.slice(0, 10) : '-' }}</div>
          <div>总收入：{{ teacher.totalIncome }} 元</div>
          <div>评论数：{{ teacher.commentCount }}</div>
        </div>
      </div>
      <div v-else-if="loading" style="margin:auto;">加载中...</div>
      <div v-else-if="error" style="color:red; margin:auto;">{{ error }}</div>
  
      <div class="course-list-section" v-if="teacher && teacher.courses && teacher.courses.length">
        <div class="header">
          <span class="title">开设课程</span>
          <div class="actions">
            <select>
              <option>所有类别</option>
              <option>已发布</option>
              <option>已下架</option>
            </select>
          </div>
        </div>
        <table class="course-table">
          <thead>
            <tr>
              <th>课程名称</th>
              <th>课程编号</th>
              <th>难度</th>
              <th>订阅数</th>
              <th>总时间</th>
              <th>价格</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in pagedCourses.filter(c => c && (c.status === 1 || c.status === 2))" :key="course.id">
              <td>
                <img class="course-img" :src="course.coverUrl" />
                {{ course.title }}<br />
              </td>
              <td>{{ course.courseId }}</td>
              <td>{{ course.level }}</td>
              <td>{{ course.subscriberCount }}</td>
              <td>{{ course.totalDuration || '-' }}</td>
              <td>{{ course.price }}元</td>
              <td>
                <span :class="['status', course.status === 1 ? 'ongoing' : 'finished']">
                  {{ course.status === 1 ? '已上架' : course.status === 2 ? '已下架' : '未知' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-wrapper">
             <div class="pagination-info">
                显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredCourses.length) }} 条，共 {{ filteredCourses.length }} 条
             </div>
            <div class="pagination">
                <button class="page-btn prev" :disabled="currentPage === 1" @click="prevPage">上一页</button>
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <button class="page-btn next" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
            </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/utils/http.js'

const route = useRoute()
const router = useRouter()
const teacherId = route.params.id || ''
const teacher = ref(null)
const loading = ref(true)
const error = ref('')

// 分页相关
const pageSize = 10
const currentPage = ref(1)

// ✅ 只保留 status 为 1 或 2 的课程
const filteredCourses = computed(() =>
  (teacher.value?.courses || []).filter(c => c && (c.status === 1 || c.status === 2))
)

// ✅ 总页数
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCourses.value.length / pageSize))
)

// ✅ 当前页课程
const pagedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredCourses.value.slice(start, start + pageSize)
})

// ✅ 上/下一页
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function goBack() {
  router.push('/admin/teacher')
}

// ✅ 数据加载
onMounted(async () => {
  if (!teacherId) {
    error.value = '未提供教师ID'
    loading.value = false
    return
  }
  try {
    const res = await http.get(`/user/teacher/${teacherId}`)
    if (res.data.status === 0) {
      teacher.value = res.data.data
    } else {
      error.value = res.data.message || '获取教师信息失败'
    }
  } catch (e) {
    error.value = e.message || '请求失败'
  } finally {
    loading.value = false
  }
})
</script>


<style scoped>
.teacher-detail-container {
  display: flex;
  padding: 32px 40px;
  background: var(--main-light);
  min-height: 100vh;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.back-btn {
  position: absolute;
  left: 1230px;
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

.teacher-info-card {
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
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 20px;
  border: 5px solid var(--main-orange);
  object-fit: cover;
  box-shadow: 0 0 12px rgba(255, 145, 0, 0.3);
}

.name {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--main-orange);
}

.stats {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 24px;
  gap: 12px;
}
.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: var(--main-blue);
  text-align: center;
}
.stat-label {
  font-size: 13px;
  color: #888;
  text-align: center;
  margin-top: 4px;
}

.section-title {
  font-weight: 700;
  margin: 20px 0 10px 0;
  width: 100%;
  color: #222;
  font-size: 17px;
  position: relative;
}
.section-title::before {
  content: "📌";
  margin-right: 8px;
  color: var(--main-orange);
}

.desc {
  font-size: 15px;
  color: #444;
  margin-bottom: 10px;
  width: 100%;
  line-height: 1.8;
  text-align: justify;
}

.info-list {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
  width: 100%;
  line-height: 2;
}
.info-list div::before {
  content: "📎 ";
  margin-right: 6px;
  color: var(--main-blue);
}


.course-list-section {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 32px 24px;
  box-shadow: 0 2px 12px #e0e0e0;
  border: none;
  min-width: 0;
  overflow-x: auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--main-orange);
}
.actions select {
  margin-left: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fff;
  color: var(--main-orange);
  font-size: 14px;
  outline: none;
  cursor: pointer;
}
.actions select:focus {
  border-color: var(--main-orange);
}
.actions button {
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 8px;
}
.actions button:hover {
  background: var(--main-green);
}
.course-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-bottom: 18px;
  font-size: 15px;
}
.course-table th {
  background: #f5f5f5;
  color: #888;
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: none;
  text-align: left;
}
.course-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
  border-bottom: none;
}
.course-img {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 8px;
  vertical-align: middle;
  border: 1.5px solid #e5e7ef;
}
.status {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: bold;
  display: inline-block;
}
.status.ongoing {
  background: var(--main-blue);
  color: #fff;
}
.status.finished {
  background: var(--main-orange);
  color: #fff;
}
.action {
  background: var(--main-blue);
  border: none;
  border-radius: 6px;
  margin-right: 4px;
  padding: 4px 8px;
  color: #fff;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.2s;
  position: relative;
}
.action.view:hover {
  background: var(--main-orange);
}
.action.edit:hover {
  background: var(--main-green);
  color: #333;
}
.action.delete:hover {
  background: #e74c3c;
}
.action.view::after {
  content: "👁";
  color: #fff;
  font-size: 16px;
  position: absolute;
  left: 6px; top: 3px;
}
.action.edit::after {
  content: "✏️";
  color: #fff;
  font-size: 15px;
  position: absolute;
  left: 6px; top: 3px;
}
.action.delete::after {
  content: "🗑";
  color: #fff;
  font-size: 15px;
  position: absolute;
  left: 6px; top: 3px;
}
.action:hover {
  filter: brightness(0.92);
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  margin-top: 10px;
}
.pagination .active {
  color: #fff;
  background: var(--main-orange);
  border-radius: 50%;
  padding: 2px 10px;
  font-weight: 600;
}
.pagination span {
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.pagination span:hover:not(.active) {
  background: #f0f1f5;
}

/* 分页组件样式 */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.pagination-info {
  color: #666;
  font-size: 1em;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1em;
}

.page-btn:hover:not(:disabled) {
  background: var(--main-orange);
  color: #fff;
  border-color: var(--main-orange);
}

.page-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
  min-width: 60px;
  text-align: center;
  font-size: 1.1em;
}
</style>