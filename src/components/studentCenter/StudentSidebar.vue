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
  name: 'StudentSidebar',
  components: {
    UserSettingsModal
  },
  props: {
    activePage: {
      type: String,
      default: 'course-list'
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
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: white;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding: 15px;
  background: linear-gradient(135deg, #F98C53, #FCCEB4);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(249, 140, 83, 0.3);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.logo:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 140, 83, 0.4);
}

.logo-icon {
  font-size: 24px;
  margin-right: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}

.nav-item:hover {
  background: linear-gradient(135deg, #ABD7FB, #D2E0AA);
  color: white;
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(171, 215, 251, 0.3);
}

.nav-item.active {
  background: linear-gradient(135deg, #F98C53, #FCCEB4);
  color: white;
  box-shadow: 0 4px 15px rgba(249, 140, 83, 0.4);
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.2) rotate(5deg);
}

.upgrade-container {
  margin-top: auto;
  background: linear-gradient(135deg, #F9F2EF, #FCCEB4);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(249, 242, 239, 0.3);
}

.upgrade-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.upgrade-lock {
  font-size: 28px;
  margin-bottom: 10px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.upgrade-text {
  margin-bottom: 12px;
  font-size: 14px;
}

.pro-text {
  font-weight: 600;
  color: #6200ea;
}

.upgrade-btn {
  background: linear-gradient(135deg, #F98C53, #FCCEB4);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(249, 140, 83, 0.3);
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 140, 83, 0.4);
  background: linear-gradient(135deg, #FCCEB4, #F98C53);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    padding: 15px;
  }
}
</style> 