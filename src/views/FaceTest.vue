<template>
  <div class="test-container">
    <h1>人脸识别功能测试页</h1>
    <div class="card">
      <p v-if="name">你好，<strong>{{ name }}</strong>！</p>
      <p>为你的账户注册人脸，或测试人脸登录。</p>
      <div class="button-group top-buttons">
        <button @click="openModal('register')" class="btn" :disabled="!userId">
          注册人脸
        </button>
        <button @click="openModal('login')" class="btn secondary">
          测试人脸登录
        </button>
      </div>
    </div>

    <div class="auth-modal" v-if="showFaceRegistrationModal">
      <div class="auth-modal-content">
        <h3>{{ mode === 'register' ? '人脸注册' : '人脸登录' }}</h3>
        <canvas ref="canvas" style="display:none;"></canvas>
        <div v-if="!capturedImage">
          <video ref="video" autoplay playsinline class="video-preview"></video>
          <button @click="capture" class="btn modal-btn">拍照</button>
        </div>
        <div v-else>
          <img :src="capturedImage" class="video-preview" />
          <div class="button-group">
            <button @click="resetCapture" class="btn modal-btn secondary">重拍</button>
            <button @click="confirmAction" class="btn modal-btn" :disabled="isProcessing">
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
        <button @click="closeCamera" class="btn modal-btn transparent">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import service from "../utils/http";

export default {
  name: "FaceTest",
  data() {
    return {
      showFaceRegistrationModal: false,
      userId: null,
      username: '',
      name: '',
      video: null,
      canvas: null,
      capturedImage: null,
      isProcessing: false,
      stream: null,
      mode: 'register'
    };
  },
  computed: {
    confirmButtonText() {
      if (this.isProcessing) {
        return this.mode === 'register' ? '注册中...' : '登录中...';
      }
      return this.mode === 'register' ? '确认注册' : '确认登录';
    }
  },
  mounted() {
    const userIdFromCookie = this.getCookie('userid');
    const usernameFromCookie = this.getCookie('username');
    const nameFromCookie = this.getCookie('name');

    if (userIdFromCookie) {
      this.userId = userIdFromCookie;
      this.username = usernameFromCookie;
      this.name = nameFromCookie || usernameFromCookie || '当前用户';
    } else {
      alert('无法获取用户信息，请先登录。');
      this.$router.push('/login');
    }
  },
  methods: {
    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    async openCamera() {
      if (this.stream) return;
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$nextTick(() => {
            const videoElement = this.$refs.video;
            if(videoElement) {
                videoElement.srcObject = this.stream;
            }
        });
      } catch (err) {
        alert('无法访问摄像头，请检查权限。');
        console.error("Error accessing camera: ", err);
      }
    },
    closeCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      this.resetCapture();
      this.showFaceRegistrationModal = false;
    },
    capture() {
      const videoElement = this.$refs.video;
      const canvasElement = this.$refs.canvas;
      if (videoElement && canvasElement) {
        if (videoElement.videoWidth === 0) {
            alert('摄像头尚未准备好或权限被阻止，请稍等片刻或刷新重试。');
            return;
        }
        const context = canvasElement.getContext('2d');
        
        // 设置较小的尺寸以减小图像大小
        const maxWidth = 640;
        const maxHeight = 480;
        let width = videoElement.videoWidth;
        let height = videoElement.videoHeight;
        
        // 保持宽高比的情况下调整尺寸
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvasElement.width = width;
        canvasElement.height = height;
        context.drawImage(videoElement, 0, 0, width, height);
        
        // 使用较低的图像质量
        this.capturedImage = canvasElement.toDataURL('image/jpeg', 0.7);
        
        console.log('图像已压缩，大小约为：' + Math.round(this.capturedImage.length / 1024) + 'KB');
      } else {
          alert('拍照功能初始化失败，请关闭弹窗后重试。');
      }
    },
    resetCapture() {
      this.capturedImage = null;
      if (this.showFaceRegistrationModal) {
          this.$nextTick(() => this.openCamera());
      }
    },
    openModal(mode) {
      this.mode = mode;
      this.showFaceRegistrationModal = true;
    },
    confirmAction() {
      if (this.mode === 'register') {
        this.registerFace();
      } else {
        this.loginWithFace();
      }
    },
    async registerFace() {
      if (!this.userId) {
        alert('用户ID无效，请重新登录。');
        return;
      }
      if (!this.capturedImage) {
        alert('请先拍照');
        return;
      }
      this.isProcessing = true;
      try {
        const response = await service.post('/api/face/register', {
          userId: parseInt(this.userId),
          image: this.capturedImage,
        });
        console.log('人脸注册响应:', response);
        if (response.status === 0) {
          alert(response.message || '人脸注册成功！');
          this.closeCamera();
        } else {
          alert(response.message || '人脸注册失败，请重试。');
        }
      } catch (error) {
        console.error('人脸注册错误:', error);
        const errorMessage = error.response?.data?.message || '请求失败，请检查网络或联系管理员。';
        alert(errorMessage);
      } finally {
        this.isProcessing = false;
      }
    },
    async loginWithFace() {
      if (!this.capturedImage) {
        alert('请先拍照');
        return;
      }
      this.isProcessing = true;
      try {
        // 打印请求数据，检查格式
        const requestData = {
          image: this.capturedImage,
          userId: this.userId ? parseInt(this.userId) : null
        };
        console.log('人脸登录请求数据:', JSON.stringify(requestData).substring(0, 100) + '...');
        
        const response = await service.post('/api/face/login', requestData);
        console.log('人脸登录响应:', response);
        if (response.status === 0) {
          const loginResp = response.data;
          this.setCookie('satoken', loginResp.saTokenInfo.tokenValue, 1);
          this.setCookie('username', loginResp.username, 1);
          this.setCookie('userid', loginResp.userId, 1);
          this.setCookie('name', loginResp.name, 1);
          alert('人脸登录成功！欢迎回来, ' + loginResp.name);
          this.closeCamera();
          this.username = loginResp.username;
          this.userId = loginResp.userId;
          this.name = loginResp.name;
        } else {
          alert(response.message || '人脸登录失败。');
        }
      } catch (error) {
        console.error('人脸登录错误:', error);
        // 打印更详细的错误信息
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误状态码:', error.response.status);
          console.error('错误头信息:', error.response.headers);
        }
        const errorMessage = error.response?.data?.message || '请求失败，请检查网络或联系管理员。';
        alert(errorMessage);
      } finally {
        this.isProcessing = false;
      }
    },
    setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },
  },
  watch: {
    showFaceRegistrationModal(newValue) {
      if(newValue) {
        this.openCamera();
      } else {
        this.closeCamera();
      }
    }
  }
}
</script>

<style scoped>
.test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background-color: #f4f7f6;
  min-height: 100vh;
}
h1 {
  color: #333;
  margin-bottom: 30px;
}
.card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}
p {
  color: #666;
  margin-bottom: 20px;
}
.input-field {
  width: 100%;
  height: 50px;
  margin-bottom: 20px;
}
.input-field input {
  width: 100%;
  height: 100%;
  border-radius: 25px;
  border: 1px solid #ddd;
  padding: 0 20px;
  font-size: 1rem;
}
.btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color .3s;
}
.btn:hover {
  background-color: #0056b3;
}
.auth-modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.auth-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 540px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.video-preview {
  width: 100%;
  height: auto;
  border-radius: 5px;
  background: #eee;
}
.modal-btn {
  width: 100%;
  margin-top: 10px;
}
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.button-group .btn {
  width: 48%;
}
.btn.secondary {
  background-color: #6c757d;
}
.btn.secondary:hover {
  background-color: #5a6268;
}
.btn.transparent {
  background: none;
  border: 2px solid #ddd;
  color: #666;
}
.btn.transparent:hover {
  background-color: #f8f9fa;
}
.top-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.top-buttons .btn {
  width: 48%;
}
</style> 