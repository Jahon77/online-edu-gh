<template>
  <div class="settings-modal-overlay" v-if="visible" @click.self="closeModal">
    <div class="settings-modal" :class="{ 'dark-mode': isDarkMode }">
      <div class="modal-header">
        <h2>个人设置</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="avatar-section">
          <div class="avatar-container">
            <img :src="userAvatar || defaultAvatar" alt="用户头像" class="user-avatar" />
            <div class="avatar-overlay" @click="triggerFileInput">
              <i class="upload-icon">📷</i>
            </div>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept="image/*" 
            @change="handleFileChange"
          />
          <button class="upload-btn" @click="triggerFileInput">更换头像</button>
        </div>
        
        <div class="form-section">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              v-model="formData.username" 
              placeholder="请输入用户名"
            />
          </div>
          
          <div class="form-group">
            <label for="current-password">当前密码</label>
            <div class="password-input">
              <input 
                :type="showCurrentPassword ? 'text' : 'password'" 
                id="current-password" 
                v-model="formData.currentPassword" 
                placeholder="请输入当前密码"
              />
              <span class="password-toggle" @click="showCurrentPassword = !showCurrentPassword">
                {{ showCurrentPassword ? '👁️' : '👁️‍🗨️' }}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="new-password">新密码</label>
            <div class="password-input">
              <input 
                :type="showNewPassword ? 'text' : 'password'" 
                id="new-password" 
                v-model="formData.newPassword" 
                placeholder="请输入新密码"
              />
              <span class="password-toggle" @click="showNewPassword = !showNewPassword">
                {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirm-password">确认新密码</label>
            <div class="password-input">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirm-password" 
                v-model="formData.confirmPassword" 
                placeholder="请再次输入新密码"
              />
              <span class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </span>
            </div>
          </div>
          
          <div class="form-group theme-toggle">
            <label>主题模式</label>
            <div class="toggle-container">
              <span class="mode-label">正常</span>
              <label class="switch">
                <input type="checkbox" v-model="isDarkMode" @change="toggleTheme">
                <span class="slider round"></span>
              </label>
              <span class="mode-label">夜间</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">取消</button>
        <button class="save-btn" @click="saveChanges">保存更改</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'UserSettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const fileInput = ref(null);
    const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
    const defaultAvatar = '/src/assets/images/defult_user_avatar.png';
    
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    
    const userAvatar = computed(() => {
      return userStore.user.avatar || defaultAvatar;
    });
    
    const formData = reactive({
      username: userStore.user.name || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      avatar: null
    });
    
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          ElMessage.error('图片大小不能超过5MB');
          return;
        }
        
        formData.avatar = file;
        
        // 预览头像
        const reader = new FileReader();
        reader.onload = (e) => {
          userAvatar.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    
    const toggleTheme = () => {
      const theme = isDarkMode.value ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      document.body.classList.toggle('dark-theme', isDarkMode.value);
    };
    
    const validateForm = () => {
      if (!formData.username.trim()) {
        ElMessage.error('用户名不能为空');
        return false;
      }
      
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          ElMessage.error('请输入当前密码');
          return false;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          ElMessage.error('两次输入的新密码不一致');
          return false;
        }
        
        if (formData.newPassword.length < 6) {
          ElMessage.error('密码长度不能少于6位');
          return false;
        }
      }
      
      return true;
    };
    
    const saveChanges = async () => {
      if (!validateForm()) return;
      
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        
        if (formData.newPassword) {
          formDataToSend.append('currentPassword', formData.currentPassword);
          formDataToSend.append('newPassword', formData.newPassword);
        }
        
        if (formData.avatar) {
          formDataToSend.append('avatar', formData.avatar);
        }
        
        formDataToSend.append('theme', isDarkMode.value ? 'dark' : 'light');
        
        const response = await axios.post('/api/user/update-profile', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.code === 200) {
          ElMessage.success('设置更新成功');
          
          // 更新用户信息
          userStore.user.name = formData.username;
          if (response.data.data.avatarUrl) {
            userStore.user.avatar = response.data.data.avatarUrl;
          }
          
          emit('update');
          closeModal();
        } else {
          ElMessage.error(response.data.message || '更新失败，请重试');
        }
      } catch (error) {
        console.error('更新设置失败:', error);
        ElMessage.error('更新失败，请重试');
      }
    };
    
    const closeModal = () => {
      emit('close');
    };
    
    onMounted(() => {
      document.body.classList.toggle('dark-theme', isDarkMode.value);
    });
    
    return {
      fileInput,
      formData,
      isDarkMode,
      userAvatar,
      defaultAvatar,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      triggerFileInput,
      handleFileChange,
      toggleTheme,
      saveChanges,
      closeModal
    };
  }
};
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.settings-modal {
  width: 500px;
  background: linear-gradient(135deg, #F9F2EF, #FCCEB4);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(249, 140, 83, 0.3);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
  position: relative;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.settings-modal.dark-mode {
  background: linear-gradient(135deg, #2A2A2A, #3D3D3D);
  color: #F9F2EF;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(249, 140, 83, 0.2);
  background: linear-gradient(90deg, #F98C53, #FCCEB4);
  color: white;
}

.dark-mode .modal-header {
  background: linear-gradient(90deg, #333, #444);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.2);
}

.modal-body {
  padding: 25px;
  overflow-y: auto;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 4px solid #F98C53;
  transition: transform 0.3s ease;
}

.dark-mode .avatar-container {
  border-color: #ABD7FB;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 2rem;
  color: white;
}

.upload-btn {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(249, 140, 83, 0.3);
}

.dark-mode .upload-btn {
  background-color: #ABD7FB;
  box-shadow: 0 4px 10px rgba(171, 215, 251, 0.3);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(249, 140, 83, 0.4);
}

.dark-mode .upload-btn:hover {
  box-shadow: 0 6px 15px rgba(171, 215, 251, 0.4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.dark-mode .form-group label {
  color: #F9F2EF;
}

.form-group input {
  padding: 12px 15px;
  border: 2px solid rgba(249, 140, 83, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.8);
}

.dark-mode .form-group input {
  background-color: rgba(60, 60, 60, 0.8);
  border: 2px solid rgba(171, 215, 251, 0.2);
  color: white;
}

.form-group input:focus {
  outline: none;
  border-color: #F98C53;
  box-shadow: 0 0 0 3px rgba(249, 140, 83, 0.2);
}

.dark-mode .form-group input:focus {
  border-color: #ABD7FB;
  box-shadow: 0 0 0 3px rgba(171, 215, 251, 0.2);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
}

.theme-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-label {
  font-size: 0.9rem;
  color: #666;
}

.dark-mode .mode-label {
  color: #ccc;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #D2E0AA;
  transition: .4s;
}

.dark-mode .slider {
  background-color: #ABD7FB;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #333;
}

.dark-mode input:checked + .slider {
  background-color: #F98C53;
}

input:checked + .slider:before {
  transform: translateX(30px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.modal-footer {
  padding: 20px 25px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid rgba(249, 140, 83, 0.2);
}

.dark-mode .modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn {
  padding: 10px 20px;
  border: 2px solid #F98C53;
  background: transparent;
  color: #F98C53;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .cancel-btn {
  border: 2px solid #ABD7FB;
  color: #ABD7FB;
}

.cancel-btn:hover {
  background-color: rgba(249, 140, 83, 0.1);
}

.dark-mode .cancel-btn:hover {
  background-color: rgba(171, 215, 251, 0.1);
}

.save-btn {
  padding: 10px 25px;
  background: linear-gradient(135deg, #F98C53, #FCCEB4);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(249, 140, 83, 0.3);
}

.dark-mode .save-btn {
  background: linear-gradient(135deg, #ABD7FB, #D2E0AA);
  box-shadow: 0 4px 10px rgba(171, 215, 251, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(249, 140, 83, 0.4);
}

.dark-mode .save-btn:hover {
  box-shadow: 0 6px 15px rgba(171, 215, 251, 0.4);
}
</style> 