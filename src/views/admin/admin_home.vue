<template>
  <div class="admin-home">
    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 统计卡片 -->
      <section class="stats-cards">
        <div class="card">
          <div class="card-title">学生总数</div>
          <div class="card-value">{{ studentStats.totalStudents || '加载中...' }}</div>
          <div :class="['card-desc', studentStats.growthDirection || 'up']">
            {{ studentStats.growthRate ? (studentStats.growthDirection === 'up' ? '+' : '') + studentStats.growthRate + '%' : '加载中...' }}
          </div>
        </div>
        <div class="card">
          <div class="card-title">教师总数</div>
          <div class="card-value">{{ teacherStats.totalTeachers || '加载中...' }}</div>
          <div :class="['card-desc', teacherStats.growthDirection || 'up']">
            {{ teacherStats.growthRate ? (teacherStats.growthDirection === 'up' ? '+' : '') + teacherStats.growthRate + '%' : '加载中...' }}
          </div>
        </div>
        <div class="card">
          <div class="card-title">总课程</div>
          <div class="card-value">{{ courseStats.total || '加载中...' }}</div>
          <div :class="['card-desc', courseStats.growthDirection || 'up']">
            {{ courseStats.growthRate ? (courseStats.growthDirection === 'up' ? '+' : '') + courseStats.growthRate + '%' : '加载中...' }}
          </div>
        </div>
        <div class="card">
          <div class="card-title">总视频</div>
          <div class="card-value">31,056</div>
          <div class="card-desc up">+25.21%</div>
        </div>
      </section>

      <section class="charts-section">
        <div class="chart-card">
          <div class="chart-title" style="display:flex;align-items:center;justify-content:space-between;">
            <span>月活量</span>
            <select v-model="activeYear" @change="updateActiveChart" class="year-select">
              <option v-for="year in activeYears" :key="year" :value="year">{{ year }}年</option>
            </select>
          </div>
          <apexchart
            width="100%"
            height="220"
            type="area"
            :options="activeChartOptions"
            :series="activeChartSeries"
          />
        </div>
        <div class="chart-card">
          <div class="chart-title" style="display:flex;align-items:center;justify-content:space-between;">
            <span>学生分析</span>
            <select v-model="registerYear" @change="updateRegisterChart" class="year-select">
              <option v-for="year in registerYears" :key="year" :value="year">{{ year }}年</option>
            </select>
          </div>
          <apexchart
            width="100%"
            height="220"
            type="area"
            :options="registerChartOptions"
            :series="registerChartSeries"
          />
        </div>
      </section>

      <!-- 热门课程区块 -->
      <div class="hot-courses">
        <div class="hot-courses-header">
          <h3>热门课程</h3>
          <div class="hot-courses-actions">
            <select class="month-select">
              <option>2024-06</option>
              <option>2024-05</option>
              <option>2024-04</option>
            </select>
            <button class="view-all-btn">查看全部</button>
          </div>
        </div>
        <table class="hot-courses-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>课程名称</th>
              <th>讲师</th>
              <th>订阅数量</th>
              <th>价格</th>
              <th>节数</th>
              <th>总时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <!-- template 热门课程区块部分 -->
              <tr v-for="(course, idx) in hotCourses" :key="course.courseId">
                <td>
                  <img v-if="idx < 5" :src="topImages[idx]" alt="top icon" class="rank-img" />
                  <span v-else>{{ idx + 1 }}</span>
                </td>
                <td>
                  <img :src="course.coverUrl" class="course-img" />
                  <div class="course-info">
                    <div class="course-title">{{ course.title }}</div>
                    <div class="course-id">#{{ course.courseId }}</div>
                  </div>
                </td>
                <td>{{ course.teacherName }}</td>
                <td>{{ course.subscriberCount }}</td>
                <td>￥{{ course.price }}</td>
                <td>-</td> <!-- 节数和总时间后端如未返回可先留空或补充 -->
                <td>-</td>
                <td>
                  <span :class="['status', getStatusClass(course.status)]">{{ getStatusText(course.status) }}</span>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ApexCharts from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'
import http from '@/utils/http.js'
import { useUserStore } from '@/stores/user'

import top1 from '@/assets/images/top1.png'
import top2 from '@/assets/images/top2.png'
import top3 from '@/assets/images/top3.png'
import top4 from '@/assets/images/top4.png'
import top5 from '@/assets/images/top5.png'

const topImages = [top1, top2, top3, top4, top5]

const userStore = useUserStore()
const apexchart = VueApexCharts

const studentStats = ref({
  totalStudents: 0,
  growthRate: '0.00',
  growthDirection: 'up'
})

const courseStats = ref({
  total: 0,
  growthRate: '0.00',
  growthDirection: 'up'
})

const teacherStats = ref({
  totalTeachers: 0,
  growthRate: '0.00',
  growthDirection: 'up'
})

const activeChartSeries = ref([{ name: '月活学生数', data: [] }])
const activeChartOptions = ref({
  chart: { id: 'active-students', toolbar: { show: false }, zoom: { enabled: false } },
  xaxis: { categories: [], labels: { style: { fontSize: '13px' } } },
  yaxis: { title: { text: '人数' }, min: 0 },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.3,
      gradientToColors: ['#FF914D'],
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  markers: { size: 5, colors: ['#fff'], strokeColors: '#FF914D', strokeWidth: 3, hover: { size: 8 } },
  tooltip: { enabled: true, y: { formatter: val => `${val}人` } },
  colors: ['#FF914D'],
  dataLabels: { enabled: false }
})

const registerChartSeries = ref([{ name: '月注册学生数', data: [] }])
const registerChartOptions = ref({
  chart: { id: 'register-students', toolbar: { show: false }, zoom: { enabled: false } },
  xaxis: { categories: [], labels: { style: { fontSize: '13px' } } },
  yaxis: { title: { text: '人数' }, min: 0 },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.3,
      gradientToColors: ['#3A7C2B'],
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  markers: { size: 5, colors: ['#fff'], strokeColors: '#3A7C2B', strokeWidth: 3, hover: { size: 8 } },
  tooltip: { enabled: true, y: { formatter: val => `${val}人` } },
  colors: ['#3A7C2B'],
  dataLabels: { enabled: false }
})

// 年份筛选
const activeYear = ref('')
const registerYear = ref('')
const activeYears = ref([])
const registerYears = ref([])

const allActiveData = ref([])
const allRegisterData = ref([])

const hotCourses = ref([])

const fetchHotCourses = async () => {
  const res = await http.get('http://localhost:8080/admin/courses/ranking?page=1&size=5')
  if (res.data.status === 200) {
    hotCourses.value = res.data.data.records
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 1: return 'success'
    case 2: return 'danger'
    case 3: return 'warning'
    case 4: return 'danger'
    default: return 'warning'
  }
}
const getStatusText = (status) => {
  switch (status) {
    case 0: return '草稿'
    case 1: return '已发布'
    case 2: return '已下架'
    case 3: return '审核中'
    case 4: return '拒绝'
    default: return '未知'
  }
}


// 获取学生统计数据
const fetchStudentStats = async () => {
  try {
    const response = await http.get('http://localhost:8080/admin/student-stats')
    // console.log("学生response", response)
    if (response.data.status === 200) {
      studentStats.value = response.data.data
    } else {
      console.error('获取学生统计数据失败:', response.message)
    }
  } catch (error) {
    console.error('获取学生统计数据出错:', error)
  }
}

// 获取课程统计数据
const fetchCourseStats = async () => {
  try {
    const response = await http.get('http://localhost:8080/admin/course-stats')
    // console.log("response", response)
    if (response.data.status === 200) {
      courseStats.value = response.data.data
    } else {
      console.error('获取课程统计数据失败:', response.message)
    }
  } catch (error) {
    console.error('获取课程统计数据出错:', error)
  }
}

// 获取教师统计数据
const fetchTeacherStats = async () => {
  try {
    const response = await http.get('http://localhost:8080/admin/teacher-stats')
    if (response.data.status === 200) {
      teacherStats.value = response.data.data
    } else {
      console.error('获取教师统计数据失败:', response.message)
    }
  } catch (error) {
    console.error('获取教师统计数据出错:', error)
  }
}

// 获取月活量
const fetchActiveStudents = async () => {
  const res = await http.get('http://localhost:8080/admin/statistics/monthly-active-students')
  // console.log("res", res)
  if (res.data && Array.isArray(res.data.data)) {
    allActiveData.value = res.data.data
    // 提取所有年份
    const years = [...new Set(res.data.data.map(item => item.month.slice(0, 4)))]
    activeYears.value = years
    activeYear.value = years[years.length - 1] // 默认最新年
    updateActiveChart()
  }
}

// 获取月注册量
const fetchRegisterStudents = async () => {
  const res = await http.get('http://localhost:8080/admin/statistics/monthly-registered-students')

  // console.log("res", res)
  if (res.data && Array.isArray(res.data.data)) {
    allRegisterData.value = res.data.data
    // 提取所有年份
    const years = [...new Set(res.data.data.map(item => item.month.slice(0, 4)))]
    registerYears.value = years
    registerYear.value = years[years.length - 1] // 默认最新年
    updateRegisterChart()
  }
}

function updateActiveChart() {
  const months = Array.from({ length: 12 }, (_, i) => `${activeYear.value}-${(i+1).toString().padStart(2, '0')}`)
  activeChartOptions.value.xaxis.categories = months.map(m => m.slice(5) + '月')
  const dataMap = Object.fromEntries(allActiveData.value.filter(item => item.month.startsWith(activeYear.value)).map(item => [item.month, item.activeCount]))
  activeChartSeries.value[0].data = months.map(m => dataMap[m] || 0)
}

function updateRegisterChart() {
  const months = Array.from({ length: 12 }, (_, i) => `${registerYear.value}-${(i+1).toString().padStart(2, '0')}`)
  registerChartOptions.value.xaxis.categories = months.map(m => m.slice(5) + '月')
  const dataMap = Object.fromEntries(allRegisterData.value.filter(item => item.month.startsWith(registerYear.value)).map(item => [item.month, item.registerCount]))
  registerChartSeries.value[0].data = months.map(m => dataMap[m] || 0)
}

const fetchUserInfo = async () => {
  try {
    // console.log('开始获取用户信息...');
    const response = await http.get('http://localhost:8080/user/user-info')
    // console.log('获取用户信息响应:', response);
    
    if (response.data && response.data.status === 0) { // 成功状态码是0
      const data = response.data.data;
      // console.log('用户信息数据:', data);
      if (data && data.username) {
        userStore.setUser(data);
        // console.log('用户信息已设置到store:', data);
      } else {
        console.error('用户信息数据格式不正确:', data);
      }
    } else {
      console.error('获取用户信息失败:', response.data);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
  }
}

onMounted(() => {
  // 获取用户信息
  fetchUserInfo()
  
  // 获取学生统计数据
  fetchStudentStats()

  // 获取教师统计数据
  fetchTeacherStats()

  // 获取课程统计数据
  fetchCourseStats()

  // 获取月活量
  fetchActiveStudents()

  // 获取月注册量
  fetchRegisterStudents()

  // 获取热门课程
  fetchHotCourses()
})
</script>

<style scoped>

.year-select {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 14px;
  color: #FF914D;
  background: #fff;
  margin-left: 8px;
  outline: none;
  cursor: pointer;
}
.year-select:focus {
  border-color: #FF914D;
}


.hot-courses {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 32px 24px;
  margin-bottom: 32px;
}
.hot-courses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.hot-courses-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-select {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 1rem;
  color: #FF914D;
  background: #fff;
  outline: none;
  cursor: pointer;
  margin-right: 8px;
}

.month-select:focus {
  border-color: #FF914D;
}
.hot-courses-header h3 {
  color: var(--main-orange);
  font-size: 1.5rem;
  margin: 0;
}
.view-all-btn {
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.view-all-btn:hover {
  background: var(--main-green);
}
.hot-courses-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}
.hot-courses-table th, .hot-courses-table td {
  padding: 12px 10px;
  text-align: center;
  background: #fafbfc;
  border-radius: 8px;
}
.hot-courses-table th {
  color: #888;
  font-weight: 600;
  background: #f5f5f5;
}
.course-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 10px;
  vertical-align: middle;
}
.course-info {
  display: inline-block;
  vertical-align: middle;
  text-align: left;
}
.course-title {
  font-weight: bold;
  color: #333;
}
.course-id {
  font-size: 0.85em;
  color: #aaa;
}

.rank-img {
  width: 32px;
  height: 32px;
  vertical-align: middle;
}

.rank-num {
  font-size: 1.2rem;
  color: #aaa;
  font-weight: bold;
  display: inline-block;
  width: 32px;
  text-align: center;
}
.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.95em;
  font-weight: 600;
  display: inline-block;
}
.status.published {
  background: #e6f9ed;
  color: #1abc9c;
}
.status.offline {
  background: #ffeaea;
  color: #e74c3c;
}
.status.pending {
  background: #fffbe6;
  color: #f1c40f;
}


.admin-home {
  display: flex;
  min-height: 100vh;
  background: var(--main-light);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.sidebar {
  width: 220px;
  background: var(--main-green);
  padding: 32px 0 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 0 32px 32px 0;
  box-shadow: 2px 0 16px #e0e0e0;
}
.logo {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--main-orange);
  text-align: center;
  margin-bottom: 32px;
}
.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar nav li {
  padding: 14px 32px;
  color: #333;
  border-radius: 0 24px 24px 0;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.sidebar nav li.active,
.sidebar nav li:hover {
  background: var(--main-orange);
  color: #fff;
}
.sidebar nav li.clickable {
  cursor: pointer;
  transition: background 0.2s;
}
.sidebar nav li.clickable:hover {
  background: var(--main-orange);
  color: #fff;
}
.sidebar-footer {
  padding: 24px 0 24px 32px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.user-info .name {
  font-weight: bold;
  color: #333;
}
.user-info .email {
  font-size: 0.9em;
  color: #888;
}
.main-content {
  flex: 1;
  padding: 40px 48px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-cards {
  display: flex;
  gap: 24px;
}
.card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.card-title {
  color: #888;
  font-size: 1em;
}
.card-value {
  font-size: 1.6em;
  font-weight: bold;
  color: var(--main-orange);
}
.card-desc {
  font-size: 0.95em;
  border-radius: 8px;
  padding: 2px 10px;
  margin-top: 2px;
}
.card-desc.up {
  background: var(--main-green);
  color: #3a7c2b;
}
.card-desc.down {
  background: #ffeaea;
  color: #e74c3c;
}
.charts-section {
  display: flex;
  gap: 24px;
}
.chart-card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chart-title {
  color: var(--main-orange);
  font-weight: bold;
  margin-bottom: 8px;
}
.chart-placeholder {
  background: var(--main-blue);
  border-radius: 12px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1em;
  opacity: 0.7;
}
.transactions {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
}
.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1em;
  margin-bottom: 12px;
}
.transactions-header a {
  color: var(--main-orange);
  text-decoration: none;
  font-size: 0.95em;
}
.transactions-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}
.transactions-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}
.transactions-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}
.transactions-table .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.pay {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--main-peach);
  color: #fff;
}
.pay.alipay {
  background: var(--main-blue);
}
.pay.wechat {
  background: var(--main-green);
  color: #333;
}
.status {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: bold;
}
.status.success {
  background: var(--main-green);
  color: #3a7c2b;
}
.status.danger {
  background: #ffeaea;
  color: #e74c3c;
}
.status.warning {
  background: var(--main-peach);
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
</style>
