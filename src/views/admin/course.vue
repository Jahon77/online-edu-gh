<template>
  <div class="course-page">
    <div class="course-header">
      <div class="course-tabs">
        <div 
          :class="['tab', { active: activeTab === 'all' }]" 
          @click="switchTab('all')"
        >
          全部课程
        </div>
        <div 
          :class="['tab', { active: activeTab === 'ranking' }]" 
          @click="switchTab('ranking')"
        >
          课程排名
        </div>
      </div>
      <div class="course-actions">
        <div v-if="activeTab === 'ranking'" class="ranking-filter">
          <select v-model="selectedMonth" class="month-select">
            <option value="2024-06">2024年6月</option>
            <option value="2024-05">2024年5月</option>
            <option value="2024-04">2024年4月</option>
            <option value="2024-03">2024年3月</option>
          </select>
        </div>
        <button class="btn export">导出</button>
      </div>
    </div>
    
    <!-- 全部课程表格 -->
    <div v-if="activeTab === 'all'" class="course-table-wrapper">
      <table class="course-table">
        <thead>
          <tr>
            <th>课程名称</th>
            <th>课程编号</th>
            <th>类型</th>
            <th>讲师</th>
            <th>订阅数</th>
            <th>价格</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in courseList" :key="idx" @click="goToDetail(item)" style="cursor: pointer;" class="hover-row">
            <td>
              <img class="cover" :src="item.coverUrl || 'https://randomuser.me/api/portraits/men/60.jpg'" />
              <div class="info">
                <div class="name">{{ item.title }}</div>
              </div>
            </td>
            <td>{{ item.courseId }}</td>
            <td>{{ item.level }}</td>
            <td>{{ item.teacherName }}</td>
            <td>{{ item.subscriberCount || 0 }}</td>
            <td>￥{{ item.price || 0 }}</td>
            <td>
              <span :class="['status', getStatusClass(item.status)]">{{ getStatusText(item.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 分页组件 -->
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

    <!-- 课程排名表格 -->
    <div v-if="activeTab === 'ranking'" class="course-table-wrapper">
      <table class="course-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>课程名称</th>
            <th>讲师</th>
            <th>订阅数</th>
            <th>价格</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(course, idx) in rankingList" :key="course.courseId" @click="goToDetail(course)" style="cursor: pointer;" class="hover-row">
            <td>
              <img v-if="idx < 5 && rankingCurrentPage === 1" :src="topImages[idx]" alt="top icon" class="rank-img" />
              <span v-else class="rank-num">{{ idx + 1 + (rankingCurrentPage - 1) * rankingPageSize }}</span>
            </td>
            <td>
              <img :src="course.coverUrl" class="cover" />
              <div class="info">
                <div class="name">{{ course.title }}</div>
                <div class="id">#{{ course.courseId }}</div>
              </div>
            </td>
            <td>{{ course.teacherName }}</td>
            <td>{{ course.subscriberCount }}</td>
            <td>￥{{ course.price }}</td>
            <td>
              <span :class="['status', getStatusClass(course.status)]">{{ getStatusText(course.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination-wrapper" v-if="activeTab === 'ranking'">
        <div class="pagination-info">
          显示 {{ (rankingCurrentPage - 1) * rankingPageSize + 1 }}-{{ Math.min(rankingCurrentPage * rankingPageSize, rankingTotal) }} 条，共 {{ rankingTotal }} 条
        </div>
        <div class="pagination">
          <button 
            :disabled="rankingCurrentPage === 1" 
            @click="changeRankingPage(rankingCurrentPage - 1)"
            class="page-btn prev"
          >
            上一页
          </button>
          <span class="page-info">{{ rankingCurrentPage }} / {{ rankingTotalPages }}</span>
          <button 
            :disabled="rankingCurrentPage === rankingTotalPages" 
            @click="changeRankingPage(rankingCurrentPage + 1)"
            class="page-btn next"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()


const goToDetail = (course) => {
  router.push(`/admin/courseDetail/${course.id}`)
}

const activeTab = ref('all')
const selectedMonth = ref('2024-06')

import top1 from '@/assets/images/top1.png'
import top2 from '@/assets/images/top2.png'
import top3 from '@/assets/images/top3.png'
import top4 from '@/assets/images/top4.png'
import top5 from '@/assets/images/top5.png'

const topImages = [top1, top2, top3, top4, top5]


// 分页相关数据
const courseList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

// 获取课程列表
const fetchCourseList = async (page = 1) => {
  try {
    const response = await http.get(`/admin/courses?page=${page}&size=${pageSize.value}`)
    // console.log("课程", response)
    if (response.data.status === 200) {
      const data = response.data.data
      courseList.value = data.records
      total.value = data.total
      totalPages.value = data.pages
      currentPage.value = data.current
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchCourseList(page)
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 1: return 'success'
    case 2: return 'danger'
    case 3: return 'warning'
    case 4: return 'danger'
    default: return 'warning'
  }
}

// 获取状态文本
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

const rankingList = ref([])
const rankingCurrentPage = ref(1)
const rankingPageSize = ref(10)
const rankingTotal = ref(0)
const rankingTotalPages = ref(0)

const fetchRankingList = async (page = 1) => {
  const response = await http.get(`/admin/courses/ranking?page=${page}&size=${rankingPageSize.value}`)
  if (response.data.status === 200) {
    const data = response.data.data
    rankingList.value = data.records
    rankingTotal.value = data.total
    rankingTotalPages.value = Math.ceil(data.total / rankingPageSize.value)
    rankingCurrentPage.value = data.current
  }
}

const changeRankingPage = (page) => {
  if (page >= 1 && page <= rankingTotalPages.value) {
    fetchRankingList(page)
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'ranking') {
    fetchRankingList(1)
  } else if (tab === 'all') {
    fetchCourseList(1)
  }
}

// 页面加载时获取数据
onMounted(() => {
  if (route.query.tab === 'ranking') {
    activeTab.value = 'ranking'
    fetchRankingList(1)
  } else {
    activeTab.value = 'all'
    fetchCourseList(1)
  }
  
  fetchCourseList()
})
</script>

<style scoped>

.hover-row td {
  transition: background-color 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
  background-color: #f9fafb;  /* 默认背景 */
}

/* 鼠标悬停整行时改变所有单元格样式 */
.course-table tr.hover-row:hover td {
  background-color: #9ac9ff !important;       /* 背景加深 */
  outline: 2px solid #409eff; /* 不占用布局空间 */      /* 蓝色边框 */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3); /* 淡淡阴影 */
}



.course-page {
  background: var(--main-light);
  min-height: 100vh;
  padding: 32px 40px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.course-tabs {
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
  font-size: 1.2em;
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

.course-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-filter {
  display: flex;
  align-items: center;
}

.month-select {
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

.course-actions .btn {
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


.course-table-wrapper {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
  font-size: 1.2em;
}

.course-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  font-size: 1.2em;
}

.course-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
  font-size: 1.2em;
}

.course-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}

.course-table .cover {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  margin-right: 8px;
  vertical-align: middle;
  object-fit: cover;
}

.course-table .info {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}

.course-table .name {
  font-weight: bold;
  color: #333;
}

.course-table .id {
  font-size: 0.9em;
  color: #888;
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
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: bold;
  display: inline-block;
}

.status.success,
.status.published {
  background: var(--main-green);
  color: #3a7c2b;
}

.status.danger,
.status.offline {
  background: #ffeaea;
  color: #e74c3c;
}

.status.warning,
.status.pending {
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

.table-footer {
  color: #888;
  font-size: 0.95em;
  margin-top: 16px;
}

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