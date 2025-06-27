<template>
  <div class="container" >
    <div class="forms-container">
      <div class="signin-signup" id="app">
        <form action="" class="sign-in-form" @submit.prevent="handleSubmit">
          <b>Smart Learning Platform</b>
          <h2 class="title">Login</h2>
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
  background-color: #fff;
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
  background: linear-gradient(145deg,#4481eb,#04befe);
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
  color:#444;
  margin-bottom: 10px;
}
.input-field {
  max-width: 380px;
  width: 100%;
  height: 55px;
  background-color: #f0f0f0;
  margin: 10px 0;
  border-radius: 55px;
  display:grid;
  grid-template-columns: 15% 85%;
  /*padding: 0 .4rem;*/

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
.input-field i{
  text-align: center;
  line-height: 55px;
  color: #acacac;
  font-size: 1.1rem;

}
.input-field input{
  background: none;
  outline: none;
  border: none;
  line-height: 1;
  font-weight: 400;
  font-size: 1.1rem;
  color: #333;
}
.input-field input::placeholder{
  color:#aaa;
  font-weight: 380;
}
.btn{
  width:150px;
  height: 50px;
  border: none;
  outline: none;
  border-radius: 49px;
  cursor: pointer;
  background-color: #5995fd;
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  margin: 10px 0;
  transition: .5s;
}
.btn:hover{
  background-color: #4d84e2;
}
.social-text{
  padding:.7m 0;
  font-size: 1rem;
}
.social-media{
  display: flex;
  justify-content: center;
}

.social-icon{
  height: 46px;
  width:46px;
  border:1px solid#333;
  margin: 0 0.45rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color:#333;
  font-size: 1.1rem;
  border-radius: 1.1rem;
  transition:0.3s;
}
.social-icon:hover{
  color: #4481eb;
  border-color:#4481eb ;
}
.signin-signup{
  position: absolute;
  top:45%;
  left:75%;
  transform:translate(-50%,-50%);
  width: 70%;
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
  transform: translateX(-1000px);
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
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.modal-input {
  margin: 15px 0;
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
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.modal-btn.cancel {
  background-color: #f0f0f0;
  color: #333;
}

.modal-btn.confirm {
  background-color: #5995fd;
  color: white;
}

.code-field {
  grid-template-columns: 15% 45% 40%;
}
.sms-button {
  background-color: #247fe0;
  color: #fff;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  margin: 10px;
  padding: 0 10px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.countdown-box {
  background-color: #f0f0f0;
  color: #343232;
  border: none;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  padding: 0 10px;
  font-size: 0.9rem;
}

</style>
<script>

import axios from "axios";
export default {
  name: "loginView",
  data() {
    return {
      username: '',
      password: '',
      captchaCode: '',
      captchaKey: '',
      captchaImageUrl: '',
      errorMessage: '',
      // 注册表单数据
      registerForm: {
        username: '',
        password: '',
        phone: '',
        smsCode: '',
        name: '',
        authCode: ''
      },
      countdown: 60,
      isCounting: false,
      showAuthModal: false,
      countdownTimer: null
    };
  },
  mounted() {
    this.refreshCaptcha();

    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    
    sign_up_btn.addEventListener('click', () => {
      container.classList.add("sign-up-mode");
    });
    
    sign_in_btn.addEventListener('click', () => {
      this.resetRegisterForm();
      this.stopCountdown();
      container.classList.remove("sign-up-mode");
    });
  },
  methods: {
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
    handleSubmit() {
      const loginData = {
        username: this.username,
        password: this.password,
        captchaCode: this.captchaCode,
        captchaKey: this.captchaKey
      };
      
      console.log('发送登录请求:', loginData);
      
      axios.post('http://localhost:8080/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('登录响应:', response.data);
        
        if (response.data.status === 0) {
          const loginResp = response.data.data;
          console.log('登录成功，用户信息:', loginResp);
          
          this.setCookie('satoken', loginResp.saTokenInfo.tokenValue, 1);
          this.setCookie('username', loginResp.username, 1);
          this.setCookie('userid', loginResp.userId, 1);
          
          setTimeout(() => {
            console.log('准备跳转到主页面');
            window.location.href = '#/mainView';
          }, 100);
        } else {
          console.error('登录失败:', response.data.message);
          alert(response.data.message || '登录失败');
          this.refreshCaptcha();
        }
      })
      .catch(error => {
        console.error('登录请求失败:', error);
        alert('登录失败，请检查网络连接或联系管理员');
        this.refreshCaptcha();
      });
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
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
      console.log(`Cookie已设置: ${name}=${value}`);
    },
  }
}

</script>