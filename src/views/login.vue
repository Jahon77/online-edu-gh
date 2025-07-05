<template>
  <div class="container" >
    <div class="forms-container">
      <div class="signin-signup" id="app">
        <form action="" class="sign-in-form" @submit.prevent="handleSubmit">
          <b>Smart Learning Platform</b>
          <h2 class="title">Login</h2>

          <!-- 登录方式选择 -->
          <div v-if="loginMode === 'selection'" class="login-mode-selection">
            <button @click.prevent="setLoginMode('password')" class="btn mode-btn">By Password</button>
            <button @click.prevent="setLoginMode('phone')" class="btn mode-btn">By PhoneNumber</button>
            <button @click.prevent="setLoginMode('face')" class="btn mode-btn">By Face</button>
          </div>

          <!-- 账号密码登录 -->
          <div v-if="loginMode === 'password'">
            <div class="input-field">
              <div class="el-icon-user-solid"></div>
              <input type="username" placeholder="Username" v-model="username" >
            </div>
            <div class="input-field">
              <div class="el-icon-key"></div>
              <input type="password" placeholder="Password" v-model="password">
            </div>
            <div class="input-field captcha-field">
              <div class="el-icon-picture-outline"></div>
              <input type="text" placeholder="Verification Code" v-model="captchaCode">
              <div class="captcha-img" @click="refreshCaptcha">
                <img v-if="captchaImageUrl" :src="captchaImageUrl" alt="验证码">
              </div>
            </div>
            <div >
              <input type="submit" value="Login" class="btn"  >
            </div>
            <a href="#" @click.prevent="goBack" class="back-link">返回</a>
          </div>

          <!-- 手机号码登录 -->
          <div v-if="loginMode === 'phone'">
            <div class="input-field">
              <div class="el-icon-phone-outline"></div>
              <input type="text" placeholder="Phone Number" v-model="phone">
            </div>
            <div class="input-field captcha-field">
               <div class="el-icon-picture-outline"></div>
               <input type="text" placeholder="Verification Code" v-model="smsCode">
               <button @click.prevent="sendSmsForLogin" class="sms-button" v-if="!isLoginSmsCounting">Get V-Code</button>
               <div v-if="isLoginSmsCounting" class="countdown-box">
                {{ loginSmsCountdown }} 秒后重新发送
               </div>
             </div>
            <div>
              <input type="submit" value="Login" class="btn" @click.prevent="handlePhoneLogin">
            </div>
            <a href="#" @click.prevent="goBack" class="back-link">返回</a>
          </div>

          <!-- 人脸识别登录 -->
          <div v-if="loginMode === 'face'" class="face-login-container">
            <p>请点击下方按钮，允许浏览器使用摄像头进行登录</p>
            <button @click.prevent="openFaceModal" class="btn">开启人脸识别</button>
            <a href="#" @click.prevent="goBack" class="back-link" style="margin-top: 20px;">返回</a>
          </div>

          <div v-if="loginStatusMessage" class="login-status-message">
            {{ loginStatusMessage }}
          </div>
          <p class="social-text">Or Sign in with social platforms</p>

          <br>
          <div class="social-media">
            <a href="https://im.qq.com/index/" class="social-icon">
              <img  src="../assets/pictures/QQ.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://wx.qq.com/" class="social-icon">
              <img src="../assets/pictures/weixin.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://auth.alipay.com/login/index.htm" class="social-icon">
              <img src="../assets/pictures/zhifubao.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://weibo.com/newlogin?tabtype=weibo&gid=102803&openLoginLayer=0&url=https%3A%2F%2Fwww.weibo.com%2F" class="social-icon">
              <img src="../assets/pictures/weibo.png" STYLE="height: 40px;width:40px">
            </a>

          </div>
        </form>
        <form action="" class="sign-up-form" @submit.prevent="handleRegister">
          <b>Smart Learning Platform</b>
          <h2 class="title"> Sign up</h2>
          <div class="input-field">
            <div class="el-icon-user-solid"></div>
            <input type="text" placeholder="Username" v-model="registerForm.username">
          </div>
          <div class="input-field">
            <div class="el-icon-key"></div>
            <input type="password" placeholder="Password (minimum 6 characters)" v-model="registerForm.password">
          </div>
          <div class="input-field">
            <i class="el-icon-phone-outline"></i>
            <input type="text" placeholder="Phone Number" v-model="registerForm.phone">
          </div>
          <div class="input-field code-field">
            <i class="el-icon-message"></i>
            <input type="text" placeholder="SMS Code" v-model="registerForm.smsCode">
            <button id="send-sms-code-btn" @click.prevent="sendSmsCode"
                    class="sms-button"
                    v-if="!isCounting"
            >Get V-Code
            </button>
            <div id="countdown" v-if="isCounting" class="countdown-box">
              {{ countdown }} 秒后重新发送
            </div>
          </div>
          <input type="submit" value="Next" class="btn" style="margin-bottom: 20px;">

          <!-- 认证弹窗 -->
          <div class="auth-modal" v-if="showAuthModal">
            <div class="auth-modal-content">
              <h3>身份认证</h3>
              <div class="input-field modal-input">
                <div class="el-icon-user-solid"></div>
                <input type="text" placeholder="Your Name" v-model="registerForm.name">
              </div>
              <div class="input-field modal-input">
                <div class="el-icon-key"></div>
                <input type="text" placeholder="Auth Code" v-model="registerForm.authCode">
              </div>
              <div class="modal-buttons">
                <button @click="closeAuthModal" class="modal-btn cancel">取消</button>
                <button @click="completeRegistration" class="modal-btn confirm">确认</button>
              </div>
            </div>
          </div>

          <p class="social-text">Or Sign up with social platforms</p>
          <div class="social-media" style="margin-top: 50px;">
            <a href="https://im.qq.com/index/" class="social-icon">
              <img  src="../assets/pictures/QQ.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://wx.qq.com/" class="social-icon">
              <img src="../assets/pictures/weixin.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://auth.alipay.com/login/index.htm" class="social-icon">
              <img src="../assets/pictures/zhifubao.png" STYLE="height: 40px;width:40px">
            </a>
            <a href="https://weibo.com/newlogin?tabtype=weibo&gid=102803&openLoginLayer=0&url=https%3A%2F%2Fwww.weibo.com%2F" class="social-icon">
              <img src="../assets/pictures/weibo.png" STYLE="height: 40px;width:40px">
            </a>
          </div>
        </form>
      </div>
    </div>
    <div class="panels-container">
      <div class="panel left-panel">
        <div class="content">
          <h3>
            Don t have an account ?
          </h3>
          <p>if you don t have an account
            <br>Please sign in by using your phone number.
            In this way,you can get an account.
          </p>
          <button class="btn transparent" id="sign-up-btn"> Sign up</button>
        </div>
        <img src="../assets/pictures/teacher.svg" class="image">

      </div>
      <div class="panel right-panel">
        <div class="content">
          <h3>
            Aleady have an account?
          </h3>
          <p>If you aleady have an account,
            <br>Please use your username and password to login.
          </p>
          <button class="btn transparent" id="sign-in-btn">Login</button>
        </div>
        <img src="../assets/pictures/web.svg" class="image">

      </div>
    </div>
     <!-- 人脸识别弹窗 -->
    <div class="auth-modal" v-if="showCameraModal">
      <div class="auth-modal-content">
        <h3>人脸登录</h3>
        <canvas ref="canvas" style="display:none;"></canvas>
        <div v-if="!capturedImage">
          <video ref="video" autoplay playsinline class="video-preview"></video>
          <button @click="capture" class="btn modal-btn">拍照</button>
        </div>
        <div v-else>
          <img :src="capturedImage" class="video-preview" />
          <div class="button-group">
            <button @click="resetCapture" class="btn modal-btn secondary">重拍</button>
            <button @click="loginWithFace" class="btn modal-btn" :disabled="isProcessing">
              {{ isProcessing ? '登录中...' : '确认登录' }}
            </button>
          </div>
        </div>
        <button @click="closeCamera" class="btn modal-btn transparent">关闭</button>
      </div>
    </div>
  </div>
</template>

<style >
*{
  padding: 0;
  margin:0;
  box-sizing:border-box;
}
body,input {
  font-family:'Poppins',sans-serif;
}
.container {
  position:relative;
  width:100%;
  min-height: 100vh;
  background-color: var(--background-color);
  overflow: hidden;
}
.forms-container {
  position: absolute;
  width:100%;
  height:100%;
  top:0;
  left:0;

}
form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  grid-column: 1 /2;
  grid-row:1 / 2;
  padding:  0 5rem;
  overflow: hidden;
  transition: 0.2s 0.7s ease-in-out;
}
form.sign-in-form{
  z-index: 2;
}
.container::before{
  content: ' ';
  position: absolute;
  width:2000px;
  height: 2800px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--primary-light-color), var(--accent-color));
  top:-10%;
  right: 48%;
  transform: translateY(-50%);
  z-index:6;
  transition:1.8s ease-in-out;
}
form.sign-up-form{
  z-index: 1;
  opacity: 0;
}
.title {
  font-size: 2.2rem;
  color: var(--text-color);
  margin-bottom: 10px;
}
.input-field {
  max-width: 380px;
  width: 100%;
  height: 55px;
  background-color: var(--light-background-color);
  margin: 10px 0;
  border-radius: 55px;
  display:grid;
  grid-template-columns: 15% 85%;
  /*padding: 0 .4rem;*/
  border: 1px solid var(--border-color);
  margin-top: 20px;
}
.captcha-field {
  grid-template-columns: 15% 50% 35%;
}
.captcha-img {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding-right: 10px;
}
.captcha-img img {
  height: 40px;
  border-radius: 5px;
  max-width: 100%;
}
.input-field phonenum{
  margin-left: 0px;
}
.input-field i, .input-field div[class^="el-icon-"]{
  text-align: center;
  line-height: 55px;
  color: var(--subtle-text-color);
  font-size: 1.1rem;

}
.input-field input{
  background: none;
  outline: none;
  border: none;
  line-height: 1;
  font-weight: 400;
  font-size: 1.1rem;
  color: var(--text-color);
}
.input-field input::placeholder{
  color: var(--subtle-text-color);
  font-weight: 500;
}
.btn{
  width:150px;
  height: 49px;
  border: none;
  outline: none;
  border-radius: 49px;
  cursor: pointer;
  background-color: var(--primary-color);
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  margin: 10px 0;
  transition: .5s;
}
.btn:hover{
  background-color: var(--primary-light-color);
}
.social-text{
  padding:.7rem 0;
  font-size: 1rem;
  color: var(--text-color);
}
.social-media{
  display: flex;
  justify-content: center;
}

.social-icon{
  height: 46px;
  width:46px;
  border: 1px solid var(--border-color);
  margin: 0 0.45rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
  font-size: 1.1rem;
  border-radius: 50%;
  transition:0.3s;
}
.social-icon:hover{
  color: var(--accent-color);
  border-color: var(--accent-color);
}
.signin-signup{
  position: absolute;
  top:50%;
  left:75%;
  transform:translate(-50%,-50%);
  width: 50%;
  display: grid;
  grid-template-columns: 1fr;
  z-index: 5;
  transition: 1s 0.7s ease-in-out;
}
.panels-container{
  position: absolute;
  width: 100%;
  height: 100%;
  top:0;
  left:0;

  display: grid;
  grid-template-columns: repeat(2,1fr);
}
.panel{
  display:flex;
  flex-direction: column;
  align-items:flex-end;
  justify-content:space-around ;
  text-align: center;
  z-index:7;

}
.left-panel{
  pointer-events: all;
  padding:3rem 17% 2rem 12%;
}
.panel .content{
  color:#fff;
  transition: .9s .6s ease-in-out;
}
.panel h3{
  font-weight: 600;
  line-height: 1;
  font-size: 1.5rem;
}
.panel p{
  font-size: 0.95rem;
  padding: 0.7rem 0;
}
.btn.transparent{
  margin: 0;
  background: none;
  border:2px solid#fff;
  width:130px;
  height:41px;
  font-weight:600 ;
  font-size: 0.8rem;
}
.btn.transparent:hover {
  background: white;
  color: var(--accent-color);
}
.right-panel{
  padding: 3rem 12% 2rem 17%;
  pointer-events: none;
}
.image{
  width: 100%;
  transition: 1.1s .4s ease-in-out;
}
.right-panel .content, .right-panel .image{
  transform:translateX(1000px) ;
}
.container.sign-up-mode::before{
  transform: translate(100%,-50%);
  right:52%;

}
.btn{
  margin-top: 30px;
  margin-bottom: 50px;
  width:380px;
}
.container.sign-up-mode .left-panel .image,
.container.sign-up-mode .left-panel .content{
  transform: translateX(-800px);
}
.container.sign-up-mode .right-panel .image,
.container.sign-up-mode .right-panel .content{
  transform: translateX(0px);
}
.container.sign-up-mode .left-panel {
  pointer-events: none;
}
.container.sign-up-mode .right-panel {
  pointer-events: all;
}
.container.sign-up-mode .signin-signup{
  left:25%;
}
.container.sign-up-mode form.sign-in-form{
  z-index: 1;
  opacity: 0;
}
.container.sign-up-mode form.sign-up-form{
  z-index: 2;
  opacity: 1;
}

/* 添加认证弹窗样式 */
.auth-modal {
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-modal-content {
  background-color: var(--light-background-color);
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.auth-modal-content h3 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-color);
}

.modal-input {
  margin-bottom: 15px;
}

.auth-info {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
  font-size: 0.9rem;
}

.auth-info p {
  margin: 5px 0;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.modal-btn.cancel {
  background-color: #eee;
  color: var(--subtle-text-color);
}

.modal-btn.confirm {
  background-color: var(--accent-color);
  color: white;
}

.code-field {
  grid-template-columns: 15% 45% 40%;
}
.sms-button {
  background-color: var(--accent-color);
  color: white;
  border: none;
  height: 40px;
  padding: 0 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 40px;
  transition: all 0.3s ease;
  align-self: center;
  justify-self: center;
}
.sms-button:hover {
  background-color: #8ec5f5;
}
.countdown-box {
  padding: 10px 15px;
  font-size: 0.9rem;
  color: var(--subtle-text-color);
}

.login-status-message {
  margin-top: 15px;
  padding: 10px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  border-radius: 5px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #096dd9;
}

.login-mode-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.mode-btn {
  width: 100%;
  max-width: 380px;
  margin: 10px 0;
  font-size: 1.2rem;
  text-transform: none;
  padding: 12px 0;
  height: auto;
}

.back-link {
  margin-top: 15px;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s;
}

.back-link:hover {
  color: var(--accent-color);
}

@media (max-width: 870px){
  .container{
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .forms-container {
    width: 100%;
    height: auto;
  }
  .signin-signup {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
  }
  .panels-container {
    display: none;
  }
}

/* 人脸识别弹窗样式 */
.auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.auth-modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
  text-align: center;
}
.auth-modal-content h3 {
  margin-bottom: 20px;
  color: #333;
}
.video-preview {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 5px;
  margin-bottom: 15px;
  background-color: #eee;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.modal-btn {
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.modal-btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.modal-btn.transparent {
  background: none;
  color: #666;
}

.face-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.face-login-container p {
  margin-bottom: 15px;
  color: var(--text-color);
}
</style>
<script>
import axios from 'axios';
import { setCookie } from '../utils/authUtils';

export default {
  name: "Login",
  data() {
    return {
      // 登录模式：selection, password, phone, face
      loginMode: 'selection',
      
      // 账号密码登录
      username: '',
      password: '',
      captchaCode: '',
      captchaKey: '',
      captchaImageUrl: '',
      
      // 手机号登录
      phone: '',
      smsCode: '',
      isLoginSmsCounting: false,
      loginSmsCountdown: 60,
      loginSmsCountdownTimer: null,
      
      // 注册表单
      registerForm: {
        username: '',
        password: '',
        phone: '',
        smsCode: '',
        name: '',
        authCode: ''
      },
      
      // 短信验证码倒计时
      isCounting: false,
      countdown: 60,
      countdownTimer: null,
      
      // 认证弹窗
      showAuthModal: false,
      
      // 登录状态消息
      loginStatusMessage: '',

      // 人脸识别
      showCameraModal: false,
      stream: null,
      capturedImage: null,
      isProcessing: false
    };
  },
  created() {
    // 在组件创建时获取验证码
    this.refreshCaptcha();
  },
  mounted() {
    // 添加DOM事件监听
    this.$nextTick(() => {
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    
      if (sign_up_btn) {
        sign_up_btn.addEventListener("click", () => {
      container.classList.add("sign-up-mode");
    });
      }
    
      if (sign_in_btn) {
        sign_in_btn.addEventListener("click", () => {
      container.classList.remove("sign-up-mode");
        });
      }
    });
  },
  methods: {
    // 设置登录模式
    setLoginMode(mode) {
      this.loginMode = mode;
      if (mode === 'password') {
        this.refreshCaptcha();
      }
    },
    
    // 返回选择登录方式
    goBack() {
      this.loginMode = 'selection';
      this.loginStatusMessage = '';
      
      // 如果是从人脸识别模式返回，确保关闭摄像头
      if (this.stream) {
        this.closeCamera();
      }
    },
    async handlePhoneLogin() {
      if (!this.phone || !this.smsCode) {
        this.loginStatusMessage = '请输入手机号和验证码';
        return;
      }
      try {
        const loginData = {
          phone: this.phone,
          smsCode: this.smsCode
        };
        this.loginStatusMessage = '';
        const response = await axios.post('http://localhost:8080/login-by-phone', loginData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 10001) {
          const loginResp = response.data.data;
          this.loginStatusMessage = '您已成功登录，正在跳转...';

          this.setCookie('satoken', loginResp.saTokenInfo.tokenValue, 1);
          this.setCookie('username', loginResp.username, 1);
          this.setCookie('userid', loginResp.userId, 1);
          this.setCookie('name', loginResp.name, 1);
          this.setCookie('role', loginResp.role, 1);

          // 检查是否有重定向路径
          const redirectPath = localStorage.getItem('redirectPath');
          if (redirectPath) {
            localStorage.removeItem('redirectPath'); // 使用后删除
            await this.$router.push(redirectPath);
          } else {
            // 根据角色跳转
            // if (loginResp.role === 3) { // 管理员
            //   await this.$router.push('/admin/home');
            // } else { // 学生或教师
            //   await this.$router.push('/index');
            // }
            if (loginResp.role === 3) {
              await this.$router.push('/admin/home');
            }else if(loginResp.role === 2){
              await this.$router.push('/teacher/profile');
            }else{
              await this.$router.push('/courses');
            }
          }
        } else {
          this.loginStatusMessage = response.data.message || '登录失败，请重试';
        }
      } catch (error) {
        this.loginStatusMessage = '登录失败，请检查网络或联系管理员';
      }
    },
    sendSmsForLogin() {
      if (!this.phone || !/^1[3-9]\d{9}$/.test(this.phone)) {
        alert('请输入正确的手机号码');
        return;
      }

      // 检查手机号是否存在
      axios.get(`http://localhost:8080/check-phone?phone=${this.phone}`)
        .then(response => {
          if (!response.data.data || !response.data.data.exists) {
            alert('该手机号未注册');
            return;
          }
          
          // 发送短信
          axios.post(`http://localhost:8080/send-sms?phone=${this.phone}`)
            .then(sendResponse => {
              if (sendResponse.data.status === 10005) {
                alert('短信验证码已发送，请查收');
                this.startLoginSmsCountdown();
              } else {
                alert(sendResponse.data.message || '短信验证码发送失败');
              }
            })
            .catch(error => {
              console.error('短信验证码发送请求异常:', error);
              alert('短信验证码发送失败: 网络错误');
            });
        })
        .catch(error => {
          console.error('检查手机号失败:', error);
          alert('检查手机号失败，请稍后重试');
        });
    },
    startLoginSmsCountdown() {
      this.isLoginSmsCounting = true;
      this.loginSmsCountdown = 60;
      this.loginSmsCountdownTimer = setInterval(() => {
        this.loginSmsCountdown--;
        if (this.loginSmsCountdown <= 0) {
          this.isLoginSmsCounting = false;
          clearInterval(this.loginSmsCountdownTimer);
        }
      }, 1000);
    },
    async handleSubmit() {
      if (this.loginMode !== 'password') return;
      
      // 验证输入
      if (!this.username || !this.password || !this.captchaCode) {
        this.loginStatusMessage = '请填写完整的登录信息';
        return;
      }

      try {
        const loginData = {
          username: this.username,
          password: this.password,
          captchaCode: this.captchaCode,
          captchaKey: this.captchaKey
        };
        
        // 清空之前的状态消息
        this.loginStatusMessage = '正在登录中...';
        
        const response = await axios.post('http://localhost:8080/login', loginData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('登录响应:', response.data);
        
        if (response.data.status === 10001) {
          const loginResp = response.data.data;
          this.loginStatusMessage = '您已成功登录，正在跳转...';
          
          // 设置 cookie
          this.setCookie('satoken', loginResp.saTokenInfo.tokenValue, 1);
          this.setCookie('username', loginResp.username, 1);
          this.setCookie('userid', loginResp.userId, 1);
          this.setCookie('name', loginResp.name, 1);
          this.setCookie('role', loginResp.role, 1);
          
            // 存入 localStorage
          localStorage.setItem('user', JSON.stringify({
            token: loginResp.saTokenInfo.tokenValue,
            username: loginResp.username,
            userId: loginResp.userId,
            name: loginResp.name,
            role: loginResp.role
          }));
          
          // 延迟3秒后跳转
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // 检查是否有重定向路径
          const redirectPath = localStorage.getItem('redirectPath');
          if (redirectPath) {
            localStorage.removeItem('redirectPath'); // 使用后删除
            await this.$router.push(redirectPath);
          } else {
            // 根据角色跳转
            // if (loginResp.role === 3) { // 管理员
            //   await this.$router.push('/admin/home');
            // } else { // 学生或教师
            //   await this.$router.push('/index');
            // }
            if (loginResp.role === 3) {
              await this.$router.push('/admin/home');
            }else if(loginResp.role === 2){
              await this.$router.push('/teacher/profile');
            }else{
              await this.$router.push('/courses');
            }
          }
        } else {
          this.loginStatusMessage = response.data.message || '登录失败，请重试';
          this.refreshCaptcha();
        }
      } catch (error) {
        this.loginStatusMessage = '登录失败，请检查网络或联系管理员';
        this.refreshCaptcha();
      }
    },
    // 发送短信验证码
    sendSmsCode() {
      // 验证手机号格式
      if (!this.registerForm.phone || !/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        alert('请输入正确的手机号码');
        return;
      }
      
      console.log('发送短信验证码到手机号:', this.registerForm.phone);
      
      // 检查手机号是否已被注册
      axios.get(`http://localhost:8080/check-phone?phone=${this.registerForm.phone}`)
        .then(response => {
          console.log('检查手机号响应:', response.data);
          
          if (response.data.data && response.data.data.exists) {
            alert('该手机号已被注册');
            return;
          }
          
          // // 显示加载提示
          // alert('正在发送验证码，请稍候...');
          
          // 直接开始倒计时
          this.startCountdown();
          
          // 发送短信验证码
          axios.post(`http://localhost:8080/send-sms?phone=${this.registerForm.phone}`)
            .then(response => {
              console.log('发送短信验证码响应:', response.data);
              
              if (response.data.status === 0 || response.data.status === 10005) {
                // alert('短信验证码已发送，请查收');
                // this.startCountdown();
                
                // 添加一个额外提示，应对可能收不到短信的情况
                setTimeout(() => {
                  let noticeTip = "如果长时间未收到短信，请联系管理员获取验证码，或尝试使用其他手机号";
                  console.log(noticeTip);
                  
                  // 如果30秒后用户仍在注册页面且尚未输入验证码，显示提示
                  if (this.registerForm.smsCode === '' && document.querySelector(".container").classList.contains("sign-up-mode")) {
                    alert(noticeTip);
                  }
                }, 30000);
              } else {
                console.error('发送失败:', response.data);
                let errorMsg = response.data.message || '短信验证码发送失败';
                alert(`验证码发送失败: ${errorMsg}`);
                // 发送失败时停止倒计时
                this.stopCountdown();
              }
            })
            .catch(error => {
              console.error('短信验证码发送请求异常:', error);
              let errorMsg = '网络错误';
              
              if (error.response && error.response.data) {
                console.error('错误详情:', error.response.data);
                errorMsg = error.response.data.message || '服务器错误';
              }
              
              alert(`短信验证码发送失败: ${errorMsg}`);
              // 发送失败时停止倒计时
              this.stopCountdown();
            });
        })
        .catch(error => {
          console.error('检查手机号失败:', error);
          alert('检查手机号失败，请稍后重试');
        });
    },
    // 开始倒计时
    startCountdown() {
      this.isCounting = true;
      this.countdown = 60;
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.stopCountdown();
        }
      }, 1000);
    },
    // 停止倒计时
    stopCountdown() {
      this.isCounting = false;
      clearInterval(this.countdownTimer);
    },
    // 处理注册表单提交
    handleRegister() {
      // 数据验证
      if (!this.registerForm.username) {
        alert('请输入用户名');
        return;
      }
      
      if (!this.registerForm.password || this.registerForm.password.length < 6) {
        alert('密码长度不能少于6位');
        return;
      }
      
      if (!this.registerForm.phone || !/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        alert('请输入正确的手机号码');
        return;
      }
      
      if (!this.registerForm.smsCode) {
        alert('请输入短信验证码');
        return;
      }
      
      // 检查用户名是否已存在
      axios.get(`http://localhost:8080/check-username?username=${this.registerForm.username}`)
        .then(response => {
          if (response.data.data.exists) {
            alert('用户名已存在');
            return;
          }
          
          // 显示认证弹窗
          this.showAuthModal = true;
        })
        .catch(error => {
          console.error('检查用户名失败:', error);
          alert('检查用户名失败，请稍后重试');
        });
    },
    // 关闭认证弹窗
    closeAuthModal() {
      this.showAuthModal = false;
    },
    // 完成注册
    completeRegistration() {
      if (!this.registerForm.name) {
        alert('请输入姓名');
        return;
      }
      
      if (!this.registerForm.authCode) {
        alert('请输入认证码');
        return;
      }
      
      // 发送注册请求
      axios.post('http://localhost:8080/register', this.registerForm, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.data.status === 10000) {
          alert('注册成功，请登录');
          this.closeAuthModal();
          this.resetRegisterForm();
          
          // 切换到登录页
          const container = document.querySelector(".container");
          container.classList.remove("sign-up-mode");
        } else {
          alert('注册失败：' + response.data.message);
        }
      })
      .catch(error => {
        console.error('注册失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert('注册失败：' + error.response.data.message);
        } else {
          alert('注册失败，请稍后重试');
        }
      });
    },
    // 重置注册表单
    resetRegisterForm() {
      this.registerForm = {
        username: '',
        password: '',
        phone: '',
        smsCode: '',
        name: '',
        authCode: ''
      };
      this.showAuthModal = false;
    },
    setCookie(name, value, days) {
      setCookie(name, value, days);
      console.log(`Cookie已设置: ${name}=${value}`);
    },
    refreshCaptcha() {
      axios.get('http://localhost:8080/captcha')
        .then(response => {
          if (response.data.status === 10004) {
            const captchaData = response.data.data;
            this.captchaKey = captchaData.captchaKey;
            this.captchaImageUrl = captchaData.captchaImage;
          } else {
            console.error('获取验证码失败:', response.data.message);
          }
        })
        .catch(error => {
          console.error('获取验证码请求失败:', error);
        });
    },
    // --- 人脸识别相关方法 ---
    openFaceModal() {
      this.showCameraModal = true;
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
      this.showCameraModal = false;
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
      if (this.showCameraModal) {
          this.$nextTick(() => this.openCamera());
      }
    },
    async loginWithFace() {
      if (!this.capturedImage) {
        alert('请先拍照');
        return;
      }
      this.isProcessing = true;
      this.loginStatusMessage = '正在进行人脸识别...';
      try {
        // 打印请求数据，检查格式
        const requestData = {
          image: this.capturedImage,
          userId: null // 人脸登录不需要提供用户ID
        };
        console.log('人脸登录请求数据:', JSON.stringify(requestData).substring(0, 100) + '...');
        
        const response = await axios.post('http://localhost:8080/api/face/login', requestData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('人脸登录响应:', response.data);
        
        if (response.data.status === 10001) {
          const loginResp = response.data.data;
          this.setCookie('satoken', loginResp.saTokenInfo.tokenValue, 1);
          this.setCookie('username', loginResp.userInfo.username, 1);
          this.setCookie('userid', loginResp.userInfo.userId, 1);
          this.setCookie('name', loginResp.userInfo.name, 1);
          this.setCookie('role', loginResp.role, 1);
          this.loginStatusMessage = '人脸登录成功！欢迎回来, ' + loginResp.userInfo.name;
          this.closeCamera();
          
          // 检查是否有重定向路径
          const redirectPath = localStorage.getItem('redirectPath');
          if (redirectPath) {
            localStorage.removeItem('redirectPath'); // 使用后删除
            await this.$router.push(redirectPath);
          } else {
            // 根据角色跳转
            // if (loginResp.userInfo.role === 3) { // 管理员
            //   await this.$router.push('/admin/home');
            // } else { // 学生或教师
            //   await this.$router.push('/index');
            // }
            if (loginResp.userInfo.role === 3) {
              await this.$router.push('/admin/home');
            }else if(loginResp.userInfo.role === 2){
              await this.$router.push('/teacher/profile');
            }else{
              await this.$router.push('/courses');
            }
          }
        } else {
          this.loginStatusMessage = response.data.message || '人脸登录失败。';
        }
      } catch (error) {
        console.error('人脸登录错误:', error);
        // 打印更详细的错误信息
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误状态码:', error.response.status);
          console.error('错误头信息:', error.response.headers);
        }
        this.loginStatusMessage = error.response?.data?.message || '请求失败，请检查网络或联系管理员。';
      } finally {
        this.isProcessing = false;
      }
    },
    setCookieForLogin(name, value, days) {
      setCookie(name, value, days);
      console.log(`Cookie已设置: ${name}=${value}`);
    },
  },
  watch: {
    showCameraModal(newValue) {
      if(newValue) {
        this.openCamera();
      } else {
        // 当弹窗关闭时，也确保摄像头资源被释放
        this.closeCamera();
      }
    }
  }
}

</script>