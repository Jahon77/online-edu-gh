<template>
  <div class="student-page">
    <div class="student-header">
      <h2>学生 / 打卡榜</h2>
      <div class="student-actions">
        <button class="btn export">导出</button>
        <button class="btn add">+ 添加学生</button>
      </div>
    </div>
    <div class="student-table-wrapper">
      <table class="student-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>课程</th>
            <th>已注册</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in studentList" :key="idx">
            <td>
              <img class="avatar" :src="item.avatar" />
              <div class="info">
                <div class="name">{{ item.name }}</div>
                <div class="id">#{{ item.id }}</div>
              </div>
            </td>
            <td>{{ item.course }}</td>
            <td>{{ item.date }}</td>
            <td>
              <span :class="['status', item.statusClass]">{{ item.statusText }}</span>
            </td>
            <td>
              <button class="action view">👁️</button>
              <button class="action edit">✏️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">显示 {{ studentList.length }} 个结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const studentList = ref([
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', course: '数字营销基础知识', date: '2024.1.5', statusText: '进行中', statusClass: 'success' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', course: 'Python 编程简介', date: '2024.1.5', statusText: '已取消', statusClass: 'danger' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/46.jpg', course: '机器学习与应用', date: '2024.1.5', statusText: '进行中', statusClass: 'success' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/47.jpg', course: '利用数据进行决策', date: '2024.1.5', statusText: '进行中', statusClass: 'success' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/48.jpg', course: '利用数据进行决策', date: '2024.1.5', statusText: '进行中', statusClass: 'success' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/49.jpg', course: '利用数据进行决策', date: '2024.1.5', statusText: '待学习', statusClass: 'warning' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/50.jpg', course: '利用数据进行决策', date: '2024.1.5', statusText: '进行中', statusClass: 'success' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/51.jpg', course: '利用数据进行决策', date: '2024.1.5', statusText: '进行中', statusClass: 'success' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/52.jpg', course: '利用数据进行决策', date: '2024.1.5', statusText: '进行中', statusClass: 'success' },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/women/53.jpg', course: '利用数据进行决策', date: '2024.1.5', statusText: '待学习', statusClass: 'warning' },
])
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
.student-header h2 {
  color: var(--main-orange);
  font-size: 1.4rem;
  margin: 0;
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
.student-table .id {
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

.table-footer {
  color: #888;
  font-size: 0.95em;
  margin-top: 16px;
}
</style>
