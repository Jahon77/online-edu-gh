<template>
  <div class="teacher-page">
    <div class="teacher-header">
      <h2>教师</h2>
      <div class="teacher-actions">
        <button class="btn export">导出</button>
        <button class="btn add">+ 添加教师</button>
      </div>
    </div>
    <div class="teacher-table-wrapper">
      <table class="teacher-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>课程</th>
            <th>加入日期</th>
            <th>收益</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in teacherList" :key="idx">
            <td>
              <img class="avatar" :src="item.avatar" />
              <div class="info">
                <div class="name">{{ item.name }}</div>
                <div class="id">#{{ item.id }}</div>
              </div>
            </td>
            <td>{{ item.course }}</td>
            <td>{{ item.date }}</td>
            <td>￥{{ item.income }}</td>
            <td>
              <button class="action view">👁️</button>
              <button class="action edit">✏️</button>
              <button class="action delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">显示 {{ teacherList.length }} 个结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const teacherList = ref([
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', course: 10, date: '2024.1.5', income: 4450 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/33.jpg', course: 20, date: '2024.1.5', income: 1345 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/34.jpg', course: 40, date: '2024.1.5', income: 4645 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/35.jpg', course: 10, date: '2024.1.5', income: 4450 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/36.jpg', course: 10, date: '2024.1.5', income: 4450 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/37.jpg', course: 80, date: '2024.1.5', income: 6245 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/38.jpg', course: 10, date: '2024.1.5', income: 4450 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/39.jpg', course: 10, date: '2024.1.5', income: 4450 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/40.jpg', course: 10, date: '2024.1.5', income: 4450 },
  { name: '姓名示例', id: '54124', avatar: 'https://randomuser.me/api/portraits/men/41.jpg', course: 80, date: '2024.1.5', income: 6245 },
])
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
</style>
