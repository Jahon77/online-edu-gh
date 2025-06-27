<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">教学管理</div>
      <nav>
        <ul>
          <li :class="{active: $route.path === '/admin/home'}" @click="goTo('/admin/home')">首页</li>
          <li :class="{active: $route.path === '/admin/teacher'}" @click="goTo('/admin/teacher')">教师</li>
          <li :class="{active: $route.path === '/admin/student'}" @click="goTo('/admin/student')">学生</li>
          <li :class="{active: $route.path === '/admin/course'}" @click="goTo('/admin/course')">课程</li>
          <li :class="{active: $route.path === '/admin/chat'}" @click="goTo('/admin/chat')">聊天</li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
          <div>
            <div class="name">KOTO</div>
            <div class="email">koto@qq.com</div>
          </div>
        </div>
      </div>
    </aside>
    <!-- 主体内容 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const $route = useRoute()
function goTo(path) {
  if ($route.path !== path) router.push(path)
}
</script>

<style scoped>
.admin-layout {
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
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
