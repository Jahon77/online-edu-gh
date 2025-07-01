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

      <div class="main-area">
        <!-- 顶部栏 -->
        <header class="header">
          <div class="welcome">
            <h2>欢迎回来，{{userStore.user.name}}！</h2>
            <p>最轻松的管理和LMS平台绩效</p>
          </div>
          <div class="header-actions">
            <div class="tooltip">
              <img src="@/assets/images/notice2.png" alt="notice" class="notice" style="width: 48px; height: 48px;"/>
              <span class="tooltip-text">通知</span> 
            </div>
            <div class="tooltip">
              <img src="@/assets/images/chat.png" alt="chat" class="chat" style="width: 48px; height: 48px;"/>
              <span class="tooltip-text">消息</span>
            </div>
            <div class="tooltip">
              <img src="@/assets/images/setting.png" alt="setting" class="setting" style="width: 48px; height: 48px; margin-right: 60px;"/>
              <span class="tooltip-text">设置</span>
            </div>
            <img src="@/assets/images/defult_user_avatar.png" alt="avatar" class="avatar" />
          </div>
        </header>
      
        <!-- 主体内容 -->
        <main class="main-content">
          <router-view />
        </main>
      </div>
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
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  position: absolute;
  top: 110%; /* 显示在下方 */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75); /* 半透明黑 */
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tooltip:hover .tooltip-text {
  opacity: 1;
  pointer-events: auto;
}

.header {
  /* width: 100%; */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.welcome{
  margin: 33px 0 0 50px;
}
.welcome h2 {
  margin: 0 0 6px 0;
  color: var(--main-orange);
  font-size: 1.8rem;
}
.welcome p {
  margin: 0;
  color: #888;
  font-size: 1.2rem;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-right: 50px;

}
/* .header-actions .icon-btn {
  background: var(--main-blue);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.header-actions .icon-btn:hover {
  background: var(--main-orange);
} */


.header-actions img {
  cursor: pointer;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 2px solid var(--main-peach);
  transition: transform 0.2s ease-in-out;
}

.header-actions img:hover {
  transform: scale(1.1);
}
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
  height: auto;
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
  /* padding: 40px 48px 32px 48px; */
  /* padding: 0; */
  display: flex;
  flex-direction: column;
  /* gap: 0; */
  /* gap: 32px; */
}
</style>
