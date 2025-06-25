<template>
  <div class="container" >
    <div class="forms-container">
      <div class="signin-signup" id="app">
        <form action="" class="sign-in-form" @submit.prevent="handleSubmit">
          <b>Home-school communication</b>
          <h2 class="title">Login</h2>
          <div class="input-field">
            <div class="el-icon-user-solid"></div>

            <input type="username" placeholder="Username" v-model="username" >
          </div>
          <div class="input-field">
            <div class="el-icon-key"></div>
            <input type="password" placeholder="Password" v-model="password">
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
        <form action="" class="sign-up-form">
          <b>Home-school communication</b>
          <h2 class="title"> Sign up</h2>
          <div class="input-field">
            <i class="el-icon-phone-outline"></i>
            <input id="phone-number" type="number" placeholder="Phonenumber">
          </div>
          <div class="input-field" style="display: flex">
            <input style="margin-left: 10px" type="code" placeholder="Code">
            <button id="send-sms-code-btn"  style=" padding: 0 0;
                    background-color: #247fe0;
                    color: #fff;
                    border: none;
                    border-radius: 40px;
                    cursor: pointer;
                    flex: 1;
                    justify-content: flex-end;"
            >Get V-Code
            </button>
            <div id="countdown" style="
                     display: none;
                     padding: 0 0;
                     background-color: #f0f0f0;
                     color: #343232;
                     border: none;
                     border-radius: 40px;
                     cursor: pointer; flex: 1;
                     justify-content: flex-end;
                     margin-top: 15px;
                     margin-right: 5px;
                    " >

            </div>
          </div>
          <input type="submit" value="Sign up" class="btn" style="margin-bottom: 50px;">
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

</style>
<script>

import axios from "axios";
export default {
  name: "loginView",
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    };
  },
  mounted() {

    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    const phone_number = document.querySelector("#phone-number");
    sign_up_btn.addEventListener('click', () => {
      container.classList.add("sign-up-mode");
    });
    sign_in_btn.addEventListener('click', () => {
      clearInterval(countdown); // �����ʱ��
      phone_number.value = ' ';
      document.getElementById('send-sms-code-btn').style.display = 'inline-block'; // ��ʾ���Ͱ�ť
      document.getElementById('countdown').style.display = 'none'; // ���ؼ�ʱ��
      container.classList.remove("sign-up-mode");
    });

    var countdown; // ��ʱ������
    const sendButton = document.querySelector("#send-sms-code-btn");

    // ���ӵ���¼�������
    sendButton.addEventListener('click', () => {
      // ������֤����߼�������ʹ�� setTimeout ģ���첽����
      event.preventDefault()
      setTimeout(function () {
        // ���ͳɹ���

        sendButton.style.display = 'none'; // ���ط��Ͱ�ť
        document.getElementById('countdown').style.display = 'inline-block'; // ��ʾ��ʱ��
        startCountdown(60); // ��ʼ����ʱ��ʱ��Ϊ60��
      }, 1000); // ���跢����֤����Ҫ1����
      console.log("anhuqabfh")
    });


    function startCountdown(seconds) {
      document.getElementById('countdown').innerText = seconds + ' ������·���';
      countdown = setInterval(function () {
        seconds--;
        if (seconds > 0) {
          document.getElementById('countdown').innerText = seconds + ' ������·���';
        } else {
          clearInterval(countdown); // �����ʱ��
          document.getElementById('send-sms-code-btn').style.display = 'inline-block'; // ��ʾ���Ͱ�ť
          document.getElementById('countdown').style.display = 'none'; // ���ؼ�ʱ��
        }
      }, 1000);
    }
  },
  methods: {
    handleSubmit() {
      // 使用JSON格式而不是FormData
      const loginData = {
        accountName: this.username,
        password: this.password
      };
      
      console.log('发送登录请求:', loginData);
      
      axios.post('http://localhost:8090/api/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('登录响应:', response.data);
        
        if (response.data.status === 0) { // 成功状态码
          const loginResp = response.data.data;
          console.log('登录成功，用户信息:', loginResp);
          
          // 保存用户信息到cookie
          this.setCookie('satoken', loginResp.saTokenInfo.tokenValue, 1);
          this.setCookie('username', loginResp.username, 1);
          this.setCookie('userid', loginResp.userId, 1);
          
          // 使用setTimeout延迟跳转，确保cookie已保存
          setTimeout(() => {
            console.log('准备跳转到主页面');
            // 使用更直接的方式跳转
            window.location.href = '#/mainView';
          }, 100);
        } else {
          console.error('登录失败:', response.data.msg);
          this.$alert(response.data.msg, {
            type: "error",
          });
        }
      })
      .catch(error => {
        // 处理错误情况
        console.error('登录请求失败:', error);
        this.$alert('登录失败，请检查网络连接或联系管理员', {
          type: "error",
        });
      });
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