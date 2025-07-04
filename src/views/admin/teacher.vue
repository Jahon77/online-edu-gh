<template>
  <div class="teacher-page">
    <div class="teacher-header">
      <h2>教师</h2>
      <div class="teacher-actions">
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
    <div class="teacher-table-wrapper">
      <table class="teacher-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>教工号</th>
            <th>开设课程</th>
            <th>入职日期</th>
            <th>收益</th>
            <th style="width: 60px;">批量导出</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in teacherList" :key="idx" @click="goToDetail(item)" style="cursor: pointer;" class="hover-row">
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
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import { useRouter } from 'vue-router'
const router = useRouter()

const goToDetail = (teacher) => {
  router.push(`/admin/teacherDetail/${teacher.id}`)
}

// 分页相关数据
const teacherList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const selectedIds = ref([])

// 获取教师列表
const fetchTeacherList = async (page = 1) => {
  try {
    const response = await http.get(`/admin/teachers?page=${page}&size=${pageSize.value}`)
    // console.log("教师", response)
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

function handleExport(type = 'xlsx') {
  let exportList = []
  if (selectedIds.value.length > 0) {
    exportList = teacherList.value.filter(item => selectedIds.value.includes(item.id))
  } else {
    exportList = teacherList.value
  }
  if (exportList.length === 0) return
  // 组装导出数据
  const data = exportList.map(item => ({
    姓名: item.name,
    教工号: item.teacherId,
    开设课程: item.courseCount,
    入职日期: formatDate(item.createdAt),
    收益: item.totalIncome || 0
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '教师')
  const fileType = type === 'csv' ? 'csv' : 'xlsx'
  const fileName = `教师导出_${new Date().toISOString().slice(0,10)}.${fileType}`
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

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}
</script>

<style scoped>
.checkbox-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 18px;
  height: 18px;
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
  background-color: #409EFF;
  border-color: #409EFF;
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
.teacher-table tr.hover-row:hover td {
  background-color: #9ac9ff !important;       /* 背景加深 */
  outline: 2px solid #409eff; /* 不占用布局空间 */      /* 蓝色边框 */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3); /* 淡淡阴影 */
}

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
  font-size: 2em;
  margin: 0;
}
.teacher-actions .btn {
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  margin-left: 24px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 30px;
  margin-bottom: 25px;
  width: 200px;
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
  font-size: 1.3em;
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
  border-radius: 40px;
  padding: 10px 8px;
  vertical-align: middle;
  font-size: 1.2em;
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
