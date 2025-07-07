<template>
  <div class="sidebar">
    <div class="logo">
      <span class="logo-icon">📚</span>
      <span class="logo-text">智学通</span>
    </div>
    
    <div class="nav-item" :class="{ active: activePage === 'dashboard' }" @click="navigateTo('/dashboard')">
      <div class="nav-icon">📊</div>
      <div class="nav-text">Dashboard</div>
    </div>
    
    <div class="nav-item" :class="{ active: activePage === 'course-list' }" @click="navigateTo('/course/list')">
      <div class="nav-icon">📝</div>
      <div class="nav-text">所有课程</div>
    </div>
    
    <div class="nav-item" :class="{ active: activePage === 'survey' }" @click="navigateTo('/survey_test')">
      <div class="nav-icon">📋</div>
      <div class="nav-text">问卷调查</div>
    </div>
    
    <div class="nav-item" :class="{ active: activePage === 'settings' }" @click="openSettingsModal">
      <div class="nav-icon">⚙️</div>
      <div class="nav-text">设置</div>
    </div>
    
    <div class="upgrade-container" v-if="showUpgrade">
      <div class="upgrade-lock">🔒</div>
      <div class="upgrade-text">
        升级到 <span class="pro-text">Pro</span><br>
        获取更多资源
      </div>
      <button class="upgrade-btn">升级</button>
    </div>
    
    <!-- 设置弹窗 -->
    <UserSettingsModal :visible="showSettingsModal" @close="closeSettingsModal" @update="handleSettingsUpdate" />
  </div>
</template>

<script>
import UserSettingsModal from '@/components/UserSettingsModal.vue';

export default {
  name: 'Sidebar',
  components: {
    UserSettingsModal
  },
  props: {
    activePage: {
      type: String,
      default: ''
    },
    showUpgrade: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showSettingsModal: false
    };
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
    openSettingsModal() {
      this.showSettingsModal = true;
    },
    closeSettingsModal() {
      this.showSettingsModal = false;
    },
    handleSettingsUpdate() {
      // 刷新用户信息或执行其他操作
      this.$emit('settings-updated');
    }
  }
};
</script>

<style scoped>
/* 左侧导航栏样式 */
.sidebar {
  width: 240px;
  background-color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  border-right: 1px solid rgba(249, 140, 83, 0.1);
  height: 100vh;
  position: sticky;
  top: 0;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  color: #F98C53;
  padding: 10px;
}

.logo-icon {
  font-size: 24px;
  margin-right: 10px;
  color: #F98C53;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #F98C53;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #F9F2EF;
}

.nav-item.active {
  background-color: #F98C53;
  color: white;
}

.nav-icon {
  font-size: 20px;
  margin-right: 15px;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
}

.upgrade-container {
  margin-top: auto;
  background-color: #F9F2EF;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  position: relative;
}

.upgrade-lock {
  font-size: 40px;
  margin-bottom: 10px;
}

.upgrade-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.pro-text {
  color: #F98C53;
  font-weight: bold;
}

.upgrade-btn {
  background-color: #F98C53;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-btn:hover {
  background-color: #e67a42;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    padding: 10px;
    height: auto;
    position: relative;
  }
}
</style> 