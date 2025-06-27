<template>
  <div class="course-page">
    <div class="course-header">
      <h2>课程</h2>
      <div class="course-actions">
        <button class="btn export">导出</button>
        <button class="btn add">+ 添加课程</button>
      </div>
    </div>
    <div class="course-table-wrapper">
      <table class="course-table">
        <thead>
          <tr>
            <th>课程名称</th>
            <th>讲师</th>
            <th>笔记</th>
            <th>价格</th>
            <th>获训</th>
            <th>总时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in courseList" :key="idx">
            <td>
              <img class="cover" :src="item.cover" />
              <div class="info">
                <div class="name">{{ item.name }}</div>
                <div class="id">#{{ item.id }}</div>
              </div>
            </td>
            <td>{{ item.teacher }}</td>
            <td>{{ item.note }}</td>
            <td>{{ item.price }}</td>
            <td>{{ item.train }}</td>
            <td>{{ item.duration }}</td>
            <td>
              <span :class="['status', item.statusClass]">{{ item.statusText }}</span>
            </td>
            <td>
              <button class="action view">👁️</button>
              <button class="action edit">✏️</button>
              <button class="action delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">显示 {{ courseList.length }} 个结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const courseList = ref([
  { name: '机器学习算法', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/60.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 24, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '均衡饮食食谱', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/61.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '减步技术', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/62.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已下架', statusClass: 'danger' },
  { name: '用户界面设计', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/63.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '即将发布', statusClass: 'warning' },
  { name: '网页设计与开发', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/64.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '心理学入门与心灵', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/65.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '利用数据进行决策', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/66.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '从零开始构建网站', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/67.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '数字营销基础知识', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/68.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: 'Python编程', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/69.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '均衡饮食食谱', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/70.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
])
</script>

<style scoped>
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
.course-header h2 {
  color: var(--main-orange);
  font-size: 1.4rem;
  margin: 0;
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
.course-actions .btn.export:hover {
  background: var(--main-green);
  color: #333;
}
.course-actions .btn.add:hover {
  background: var(--main-orange);
}
.course-table-wrapper {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
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
.status {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: bold;
  display: inline-block;
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
.table-footer {
  color: #888;
  font-size: 0.95em;
  margin-top: 16px;
}
</style>