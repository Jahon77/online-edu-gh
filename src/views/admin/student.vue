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
          <select  class="ranking-select" v-model="selection">
            <option value="duration">学习时长</option>
            <option value="completedCourses">完成课程</option>
            <option value="solveProblems">解题数</option>
          </select>
        </div>
        <div class="dropdown">
          <button class="btn export">{{ selectedIds.length > 0 ? '批量导出' : '导出全部' }}</button>
          <div class="dropdown-content">
            <a @click="handleExportXlsx">导出为 xlsx</a>
            <a @click="handleExportCsv">导出为 csv</a>
          </div>
        </div>
        <button class="btn import" @click="handleBatchImport">批量导入</button>
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
            <th style="width: 60px;">批量导出</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in studentList" :key="idx" @click="goToDetail(item)" style="cursor: pointer;" class="hover-row">
            <td>
              <img class="avatar" :src="item.avatarUrl" />
              <div class="info">
                <div class="name">{{ item.name }}</div>
              </div>
            </td>
            <td>{{ item.studentId }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td @click.stop>
              <label class="checkbox-wrapper">
                <input
                  type="checkbox"
                  v-model="selectedIds"
                  :value="item.id"
                  class="custom-checkbox"
                />
                <span class="checkmark"></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
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

    <!-- 学习榜排名 -->
    <div v-if="activeTab === 'ranking'" class="ranking-wrapper">
      <div class="podium" v-if="currentPage === 1">
        <!-- 第二名 -->
        <div class="podium-item second hover-row" v-if="topThree[1]" :key="`second-${selection}-${topThree[1].id}`" @click="goToDetail(topThree[1])" style="cursor: pointer;">
          <img :src="topThree[1].avatarUrl" class="avatar" />
          <img :src="topImages[1]" class="rank-img" />
          <div class="name">{{ topThree[1].name }}</div>
          <div class="value">{{ getRankingValue(topThree[1]) }}</div>
        </div>
        <!-- 第一名 -->
        <div class="podium-item first hover-row" v-if="topThree[0]" :key="`second-${selection}-${topThree[0].id}`" @click="goToDetail(topThree[0])" style="cursor: pointer;">
          <img :src="topThree[0].avatarUrl" class="avatar" />
          <img :src="topImages[0]" class="rank-img" />
          <div class="name">{{ topThree[0].name }}</div>
          <div class="value">{{ getRankingValue(topThree[0]) }}</div>
        </div>
        <!-- 第三名 -->
        <div class="podium-item third hover-row" v-if="topThree[2]" :key="`second-${selection}-${topThree[2].id}`" @click="goToDetail(topThree[2])" style="cursor: pointer;" >
          <img :src="topThree[2].avatarUrl" class="avatar" />
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
              <th style="width: 60px;">批量导出</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, idx) in otherStudents" :key="student.id" @click="goToDetail(student)" style="cursor: pointer;" class="hover-row">
              <td>
                <img v-if="idx < 5 - 3 && currentPage === 1" :src="topImages[idx + 3]" alt="top icon" class="rank-img" />
                <span v-else class="rank-num">{{ idx + 4 + (currentPage - 1) * pageSize }}</span>
              </td>
              <td>
                <img :src="student.avatarUrl" class="avatar" />
                <span class="name">{{ student.name }}</span>
              </td>
              <td>{{ student.studentId }}</td>
              <td>{{ student.studyTime }}</td>
              <td>{{ student.finishCourseNum }}</td>
              <td>
                <span>{{ student.solveQuestionNum }}</span>
              </td>
              <td @click.stop>
              <label class="checkbox-wrapper">
                <input
                  type="checkbox"
                  v-model="selectedIds"
                  :value="student.id"
                  class="custom-checkbox"
                />
                <span class="checkmark"></span>
              </label>
            </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-wrapper">
        <div class="pagination-info">
          显示 {{ (currentPage - 1) * pageSize + 4 }}-{{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import http from '@/utils/http.js'
import top1 from '@/assets/images/top1.png'
import top2 from '@/assets/images/top2.png'
import top3 from '@/assets/images/top3.png'
import top4 from '@/assets/images/top4.png'
import top5 from '@/assets/images/top5.png'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const router = useRouter()

const goToDetail = (student) => {
  router.push(`/admin/studentDetail/${student.id}`)
}

const topImages = [top1, top2, top3, top4, top5]

const activeTab = ref('all')
const selection = ref('duration')

// 分页相关数据
// 所有数据
const studentList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

// 排序字段映射
const sortKeyMap = {
  duration: 'studyTime',
  completedCourses: 'finishCourseNum',
  solveProblems: 'solveQuestionNum'
}

// 前三名（仅当 page = 1 时才取）
const topThree = computed(() => {
  return currentPage.value === 1 ? studentList.value.slice(0, 3) : []
})

// 其余学生
const otherStudents = computed(() => {
  return currentPage.value === 1
    ? studentList.value.slice(3)
    : studentList.value
})

// 获取学生列表
const fetchStudentList = async (page = 1) => {
  try {
    const sortField = sortKeyMap[selection.value] || 'studyTime'
    const response = await http.get(`/admin/students`, {
      params: {
        page,
        size: pageSize.value,
        sort: sortField
      }
    })
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

watch(selection, () => {
  fetchStudentList(1)
})

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

function getRankingValue(student) {
  if (selection.value === 'duration') return student.studyTime + '分钟'
  if (selection.value === 'completedCourses') return student.finishCourseNum + '门'
  if (selection.value === 'solveProblems') return student.solveQuestionNum + '道'
  return ''
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'ranking') {
    fetchTopThree()
  }
}

const selectedIds = ref([])

function handleExport(type = 'xlsx') {
  // 如果是全部导出，需要获取所有数据
  if (selectedIds.value.length === 0) {
    handleExportAll(type)
    return
  }
  
  // 批量导出：需要获取所有选中的学生数据
  handleExportSelected(type)
}

async function handleExportAll(type = 'xlsx') {
  try {
    // 获取所有学生数据（不分页）
    const response = await http.get('/admin/students', {
      params: {
        page: 1,
        size: 10000 // 设置一个很大的数字来获取所有数据
      }
    })
    
    if (response.data.status === 200) {
      const allStudents = response.data.data.records
      const data = allStudents.map(item => ({
        姓名: item.name,
        学号: item.studentId,
        电话: item.phone,
        注册时间: formatDate(item.createdAt)
      }))
      
      exportToFile(data, type, '学生')
    }
  } catch (error) {
    console.error('导出失败:', error)
  }
}

async function handleExportSelected(type = 'xlsx') {
  try {
    // 获取所有学生数据，然后过滤选中的
    const response = await http.get('/admin/students', {
      params: {
        page: 1,
        size: 10000
      }
    })
    
    if (response.data.status === 200) {
      const allStudents = response.data.data.records
      const selectedStudents = allStudents.filter(item => selectedIds.value.includes(item.id))
      
      const data = selectedStudents.map(item => ({
        姓名: item.name,
        学号: item.studentId,
        电话: item.phone,
        注册时间: formatDate(item.createdAt)
      }))
      
      exportToFile(data, type, '学生')
    }
  } catch (error) {
    console.error('导出失败:', error)
  }
}

function exportToFile(data, type, sheetName) {
  if (data.length === 0) return
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const fileType = type === 'csv' ? 'csv' : 'xlsx'
  const fileName = `${sheetName}导出_${new Date().toISOString().slice(0,10)}.${fileType}`
  
  if (type === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, fileName)
  } else {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName)
  }
}

function handleExportXlsx() { handleExport('xlsx') }
function handleExportCsv() { handleExport('csv') }

function handleBatchImport() {
  // 批量导入逻辑
}

onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped>
.checkbox-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 30px;
  height: 30px;
}

.custom-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  position: absolute;
  top: 3px;
  left: 7px;
  height: 30px;
  width: 30px;
  background-color: #fff;
  border: 2px solid #ff8c00;
  border-radius: 50%; /* 变成圆形 */
  transition: all 0.2s ease;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #fbff05;
  border-color: #ff8c00;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.checkmark:after {
  left: 5px;
  top: 1px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.hover-row td {
  transition: background-color 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
  background-color: #f9fafb;  /* 默认背景 */
}

/* 鼠标悬停整行时改变所有单元格样式 */
.student-table tr.hover-row:hover td,.ranking-table tr.hover-row:hover td,.podium-item.hover-row:hover {
  background-color: #9ac9ff !important;       /* 背景加深 */
  outline: 2px solid #409eff; /* 不占用布局空间 */      /* 蓝色边框 */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3); /* 淡淡阴影 */
}

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
  font-size: 1.2rem;
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
  font-size: 1.4em;
  margin-top: 7px;
}

.month-select:focus {
  border-color: var(--main-orange);
}

.student-actions .btn {
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  margin-left: 12px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 30px;
  margin-bottom: 25px;
  width: 200px;
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
  font-size: 1.4em;
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
  border-radius: 40px;
  padding: 10px 8px;
  vertical-align: middle;
  font-size: 1.2em;
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
  gap: 10px;
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
  width: 140px; 
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
  width: 45px;
  height: 45px;
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
  width: 45px;
  height: 45px;
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
  font-size: 1.4em;
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
  border-radius: 40px;
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
  font-size: 1.3rem;
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

.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-content {
  display: none;
  position: absolute;
  background: #fff;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 99;
  border-radius: 8px;
  margin-top: 4px;
  left: 14px;
  top: 80px;
}
.dropdown:hover .dropdown-content {
  display: block;
}
.dropdown-content a {
  color: #333;
  padding: 10px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
  border-radius: 8px;
}
.dropdown-content a:hover {
  background: var(--main-orange);
  color: #fff;
}
</style>