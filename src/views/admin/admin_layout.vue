<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo"><img src="@/assets/images/TeachingManagement.png" alt="首页" class="admin_icon" />教学管理</div>
      <nav>
        <ul>
          <div class="title">菜单</div>
          <li :class="{active: $route.path === '/admin/home'}" @click="goTo('/admin/home')">
            <img src="@/assets/images/home.png" alt="首页" class="icon" />
            首页
          </li>
          <li :class="{active: $route.path === '/admin/teacher'}" @click="goTo('/admin/teacher')">
            <img src="@/assets/images/teacher.png" alt="教师" class="icon" />
            教师
          </li>
          <li :class="{active: $route.path === '/admin/student'}" @click="goTo('/admin/student')">
            <img src="@/assets/images/student.png" alt="学生" class="icon" />
            学生
          </li>
          <li :class="{active: $route.path === '/admin/course'}" @click="goTo('/admin/course')">
            <img src="@/assets/images/course.png" alt="课程" class="icon" />
            课程
          </li>
          <li :class="{active: $route.path === '/admin/chat'}" @click="goTo('/admin/chat')">
            <img src="@/assets/images/chat.png" alt="聊天" class="icon" />
            聊天
          </li>
          <div class="title">帮助</div>
          <li :class="{active: $route.path === '/admin/setting'}" @click="goTo('/admin/setting')">
            <img src="@/assets/images/setting.png" alt="设置" class="icon" />
            设置
          </li>
          <li :class="{active: $route.path === '/admin/log'}" @click="goTo('/admin/log')">
            <img src="@/assets/images/log.png" alt="日志" class="icon" />
            日志
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
          <div>
            <div class="name">{{ userStore.user.name }}</div>
            <div class="email">{{ userStore.user.phone }}</div>
          </div>
          <!-- 退出按钮 -->
            <img
              src="@/assets/images/exit.png"
              alt="退出"
              style="width: 24px; height: 24px; cursor: pointer;"
              @click="logout"
            />
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
import { useUserStore } from '@/stores/user'
const router = useRouter()
const $route = useRoute()
const userStore = useUserStore()
function goTo(path) {
  if ($route.path !== path) router.push(path)
}

function logout() {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true,
    }
  )
    .then(() => {
      // 点击确定
      userStore.user.value = {}  // 清空用户信息
      ElMessage({
        type: 'success',
        message: '退出成功！'
      })
      router.push('/login')
    })
    .catch(() => {
      // 点击取消或关闭弹窗
      ElMessage({
        type: 'info',
        message: '已取消退出'
      })
    })
}

</script>

<style scoped>
.icon {
  width: 22px;
  height: 22px;
  margin-right: 8px;
  vertical-align: middle;
}

.admin_icon {
  width: 40px;
  height: 40px;
  margin-right: 7px;
  vertical-align: middle;
  margin-top: -3px;
}
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--main-light);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.title {
  font-size: 1.1rem;
  color: #000000;
  padding: 0 32px;
  margin-bottom: 3px;
  margin-top: 70px;
  padding-left: 11px;
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
  font-size: 2rem;
  font-weight: bold;
  color: var(--main-orange);
  text-align: center;
  margin-top: 30px;
}
.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: -183px
}
.sidebar nav li {
  padding: 14px 32px;
  color: #333;
  border-radius: 0 24px 24px 0;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: bold;
  font-size: 1.3rem;
  margin-top: 11px;
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
