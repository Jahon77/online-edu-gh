<template>
  <div class="teacher-page">
    <div class="teacher-header">
      <h2>教师</h2>
      <div class="teacher-actions">
        <button class="btn export">导出</button>
      </div>
    </div>
    <div class="teacher-table-wrapper">
      <table class="teacher-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>教工号</th>
            <th>开设课程</th>
            <th>入职日期</th>
            <th>收益</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in teacherList" :key="idx">
            <td>
              <img class="avatar" :src="item.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'" />
              <div class="info">
                <div class="name">{{ item.name }}</div>
              </div>
            </td>
            <td>{{ item.teacherId }}</td>
            <td>{{ item.courseCount }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>￥{{ item.totalIncome || 0 }}</td>
            <td>
              <button class="action edit">✏️</button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http.js'

// 分页相关数据
const teacherList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

// 获取教师列表
const fetchTeacherList = async (page = 1) => {
  try {
    const response = await http.get(`/admin/teachers?page=${page}&size=${pageSize.value}`)
    console.log("教师", response)
    if (response.data.status === 200) {
      const data = response.data.data
      teacherList.value = data.records
      total.value = data.total
      totalPages.value = data.pages
      currentPage.value = data.current
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
  }
}

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchTeacherList(page)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 页面加载时获取数据
onMounted(() => {
  fetchTeacherList()
})
</script>

<style scoped>
.teacher-page {
  background: var(--main-light);
  min-height: 100vh;
  padding: 32px 40px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.teacher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.teacher-header h2 {
  color: var(--main-orange);
  font-size: 1.4rem;
  margin: 0;
}
.teacher-actions .btn {
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
.teacher-actions .btn.export:hover {
  background: var(--main-green);
  color: #333;
}
.teacher-actions .btn.add:hover {
  background: var(--main-orange);
}
.teacher-table-wrapper {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
}
.teacher-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}
.teacher-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}
.teacher-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}
.teacher-table .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.teacher-table .info {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}
.teacher-table .name {
  font-weight: bold;
  color: #333;
}
.teacher-table .id {
  font-size: 0.9em;
  color: #888;
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
  font-size: 14px;
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
  font-size: 14px;
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
}
</style>
