<template>
  <div class="student-page">
    <div class="student-header">
      <div class="student-tabs">
        <div 
          :class="['tab', { active: activeTab === 'all' }]" 
          @click="switchTab('all')"
        >
          学生
        </div>
        <div 
          :class="['tab', { active: activeTab === 'ranking' }]" 
          @click="switchTab('ranking')"
        >
          学习榜
        </div>
      </div>
      <div class="student-actions">
        <div v-if="activeTab === 'ranking'" class="ranking-filter">
          <select  class="ranking-select">
            <option value="duration">学习时长</option>
            <option value="completedCourses">完成课程</option>
            <option value="solveProblems">解题数</option>
          </select>
        </div>
        <button class="btn export">导出</button>
      </div>
    </div>
    
    <!-- 学生列表 -->
    <div v-if="activeTab === 'all'" class="student-table-wrapper">
      <table class="student-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>学号</th>
            <th>电话</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in studentList" :key="idx">
            <td>
              <img class="avatar" :src="item.avatarUrl" />
              <div class="info">
                <div class="name">{{ item.name }}</div>
              </div>
            </td>
            <td>{{ item.studentId }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.createdAt }}</td>
            <td>
              <button class="action edit">✏️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">显示 {{ studentList.length }} 个结果</div>
    </div>

    <!-- 学习榜排名 -->
    <div v-if="activeTab === 'ranking'" class="ranking-wrapper">
      <div class="podium">
        <!-- 第二名 -->
        <div class="podium-item second" v-if="topThree[1]">
          <img :src="topThree[1].avatar" class="avatar" />
          <img :src="topImages[1]" class="rank-img" />
          <div class="name">{{ topThree[1].name }}</div>
          <div class="value">{{ getRankingValue(topThree[1]) }}</div>
        </div>
        <!-- 第一名 -->
        <div class="podium-item first" v-if="topThree[0]">
          <img :src="topThree[0].avatar" class="avatar" />
          <img :src="topImages[0]" class="rank-img" />
          <div class="name">{{ topThree[0].name }}</div>
          <div class="value">{{ getRankingValue(topThree[0]) }}</div>
        </div>
        <!-- 第三名 -->
        <div class="podium-item third" v-if="topThree[2]">
          <img :src="topThree[2].avatar" class="avatar" />
          <img :src="topImages[2]" class="rank-img" />
          <div class="name">{{ topThree[2].name }}</div>
          <div class="value">{{ getRankingValue(topThree[2]) }}</div>
        </div>
      </div>

      <!-- 4名以后的表格展示 -->
      <div class="other-rankings">
        <!-- <h3>其他排名</h3> -->
        <table class="ranking-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>姓名</th>
              <th>学号</th>
              <th>学习时长</th>
              <th>完成课程</th>
              <th>解题数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, idx) in otherStudents" :key="student.id">
              <td>
              <img v-if="idx < 5 - 3 && currentPage === 1" :src="topImages[idx + 3]" alt="top icon" class="rank-img" />
              <span v-else class="rank-num">{{ idx + 4 + (currentPage - 1) * pageSize }}</span>
              </td>
              <!-- <td>
                <span class="rank-num">{{ idx + 4 }}</span>
              </td> -->
              <td>
                <img :src="student.avatar" class="avatar" />
                <span class="name">{{ student.name }}</span>
              </td>
              <td>{{ student.id }}</td>
              <td>{{ student.studyTime }}</td>
              <td>{{ student.completedCourses }}</td>
              <td>
                <span>{{ student.solveProblems }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">显示 {{ otherStudents.length }} 个结果</div>
      </div>
    </div>

    <!-- 在学生表格下方添加分页组件 -->
    <div class="pagination-wrapper">
      <div class="pagination-info">
        显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
      </div>
      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
          class="page-btn prev"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
          class="page-btn next"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http.js'
import top1 from '@/assets/images/top1.png'
import top2 from '@/assets/images/top2.png'
import top3 from '@/assets/images/top3.png'
import top4 from '@/assets/images/top4.png'
import top5 from '@/assets/images/top5.png'

const topImages = [top1, top2, top3, top4, top5]

const activeTab = ref('all')
const selection = ref('duration')

// 分页相关数据
const studentList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

// 获取学生列表
const fetchStudentList = async (page = 1) => {
  try {
    const response = await http.get(`/admin/students?page=${page}&size=${pageSize.value}`)
    console.log("学生", response)
    if (response.data.status === 200) {
      const data = response.data.data
      studentList.value = data.records
      total.value = data.total
      totalPages.value = data.pages
      currentPage.value = data.current
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchStudentList(page)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// mock 前5名学生数据
const topThree = ref([
  {
    id: '10001',
    name: '张三',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    studyTime: '120小时',
    completedCourses: 15,
    solveProblems: 98
  },
  {
    id: '10002',
    name: '李四',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    studyTime: '110小时',
    completedCourses: 14,
    solveProblems: 95
  },
  {
    id: '10003',
    name: '王五',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    studyTime: '105小时',
    completedCourses: 13,
    solveProblems: 92
  },
  {
    id: '10004',
    name: '赵六',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    studyTime: '98小时',
    completedCourses: 12,
    solveProblems: 89
  },
  {
    id: '10005',
    name: '钱七',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    studyTime: '95小时',
    completedCourses: 11,
    solveProblems: 87
  }
])
// 4名以后的数据
const otherStudents = ref([
  { name: '赵六', id: '10004', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', solveProblems: 89, studyTime: '98小时', completedCourses: 12 },
  { name: '钱七', id: '10005', avatar: 'https://randomuser.me/api/portraits/men/5.jpg', solveProblems: 87, studyTime: '95小时', completedCourses: 11 },
  { name: '孙八', id: '10006', avatar: 'https://randomuser.me/api/portraits/women/6.jpg', solveProblems: 85, studyTime: '92小时', completedCourses: 10 },
  { name: '周九', id: '10007', avatar: 'https://randomuser.me/api/portraits/men/7.jpg', solveProblems: 83, studyTime: '88小时', completedCourses: 9 },
  { name: '吴十', id: '10008', avatar: 'https://randomuser.me/api/portraits/women/8.jpg', solveProblems: 80, studyTime: '85小时', completedCourses: 8 },
  { name: '郑十一', id: '10009', avatar: 'https://randomuser.me/api/portraits/men/9.jpg', solveProblems: 78, studyTime: '82小时', completedCourses: 7 },
  { name: '王十二', id: '10010', avatar: 'https://randomuser.me/api/portraits/women/10.jpg', solveProblems: 75, studyTime: '78小时', completedCourses: 6 }
])

function getRankingValue(student) {
  if (selection.value === 'duration') return student.studyTime
  if (selection.value === 'completedCourses') return student.completedCourses
  if (selection.value === 'solveProblems') return student.solveProblems
  return ''
}

const switchTab = (tab) => {
  activeTab.value = tab
}

onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped>
.student-page {
  background: var(--main-light);
  min-height: 100vh;
  padding: 32px 40px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.student-tabs {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab {
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.tab.active {
  background: var(--main-orange);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 145, 77, 0.3);
}

.tab:hover:not(.active) {
  background: #f5f5f5;
  color: #333;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-filter {
  display: flex;
  align-items: center;
}

.ranking-select {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.95rem;
  color: var(--main-orange);
  background: #fff;
  outline: none;
  cursor: pointer;
  margin-right: 8px;
}

.month-select:focus {
  border-color: var(--main-orange);
}

.student-actions .btn {
  background: var(--main-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  margin-left: 12px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}

.student-actions .btn.export:hover {
  background: var(--main-green);
  color: #333;
}

.student-actions .btn.add:hover {
  background: var(--main-orange);
}

/* 学生列表表格样式 */
.student-table-wrapper {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
}

.student-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.student-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}

.student-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}

.student-table .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.student-table .info {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}

.student-table .name {
  font-weight: bold;
  color: #333;
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

.action.edit:hover {
  background: var(--main-green);
  color: #333;
}

/* 排名展示样式 */
.ranking-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.top-three {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 40px 24px;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin-top: -60px;
  margin-bottom: 8px;
}

/* ✅ 通用样式：添加 forwards 保证动画后不恢复 */
.podium-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12px 12px 4px 4px;
  padding: 24px 12px 16px 12px;
  width: 109px; 
  transform: translateY(-50px) scale(0.8);
  opacity: 0;
  animation: enter 0.6s ease-out forwards; /* ✅ 加 forwards */
  transition: transform 0.2s ease;
  color: #fff;
  box-shadow:
    inset 0 6px 10px rgba(255, 255, 255, 0.3),
    0 6px 10px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent 60%);
}

/* ✅ 动画延迟分别给 */
.podium-item.second  { height: 230px; background-color: #B0BEC5; animation-delay: 0.1s; }
.podium-item.first   { height: 270px; background-color: #FFC107; animation-delay: 0.3s; }
.podium-item.third   { height: 190px; background-color: #D7A86E; animation-delay: 0.5s; }

/* ✅ 入场动画定义 */
@keyframes enter {
  0% {
    transform: translateY(-50px) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateY(10px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* ✅ 保留你的头像样式 + 优化 */
.podium-item .avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 8px;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
}

/* ✅ 奖牌图标 */
.rank-img {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

/* ✅ 名字+数值 */
.podium-item .name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
  text-align: center;
}

.podium-item .value {
  font-size: 1.1em;
  font-weight: bold;
  color:  #0400f6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}



.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.rank-img {
  width: 32px;
  height: 32px;
  vertical-align: middle;
}

.avatar-container .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  object-fit: cover;
}

.crown {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.first-crown {
  font-size: 28px;
}

.podium-base {
  background: linear-gradient(135deg, #FF914D, #FF6B35);
  border-radius: 12px 12px 0 0;
  padding: 20px 16px 12px;
  text-align: center;
  color: #fff;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(255, 145, 77, 0.3);
}

.podium-item.second .podium-base {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  height: 120px;
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.3);
}

.podium-item.first .podium-base {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  height: 160px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.podium-item.third .podium-base {
  background: linear-gradient(135deg, #CD7F32, #B8860B);
  height: 80px;
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
}

.podium-base .name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.podium-base .rank {
  font-size: 1.5rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* 其他排名表格 */
.other-rankings {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
}

.other-rankings h3 {
  color: var(--main-orange);
  font-size: 1.3rem;
  margin: 0 0 20px 0;
}

.ranking-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.ranking-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}

.ranking-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 12px 8px;
  vertical-align: middle;
}

.ranking-table .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.ranking-table .name {
  font-weight: bold;
  color: #333;
}

.rank-num {
  font-size: 1.1rem;
  color: #aaa;
  font-weight: bold;
  display: inline-block;
  width: 32px;
  text-align: center;
}

.table-footer {
  color: #888;
  font-size: 0.95em;
  margin-top: 16px;
}

/* 分页组件样式 */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.pagination-info {
  color: #888;
  font-size: 0.95em;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  background: var(--main-blue);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.page-btn:hover {
  background: var(--main-green);
}

.page-btn.prev:hover {
  background: var(--main-orange);
}

.page-btn.next:hover {
  background: var(--main-orange);
}

.page-info {
  color: #333;
  font-size: 0.95em;
}
</style>