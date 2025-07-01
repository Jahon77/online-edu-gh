<template>
  <div class="header-wrapper" >
    <div class="header">
      <div class="header-left">
        <img src="../../../assets/images/logo.jpg" alt="">
      </div>
      <div class="header-mid">
        <div class="header-item">
          <i style="color:#7c6aa6" class="contact-icon am-icon-phone"></i>
          <div class="item">
            <strong>16674221033</strong>
            <span>周一 ~ 周五, 8:30 - 17:30</span>
          </div>
        </div>
        <div class="header-item">
          <i style="color:#7c6aa6" class="contact-icon am-icon-map-marker"></i>
          <div class="item">
            <strong> 四川省成都市</strong>
            <span>四川华迪实训基地</span>
          </div>
        </div>
      </div>
      <div class="header-right">
          <button type="button" v-if="!isLoggedIn" @click="login">登录</button>
          <button type="button" v-else @click="logout">退出登录</button>
      </div>
    </div>

    <div class="nav-wrapper header-default">
      <div class="nav">

      </div>
    </div>
  </div>
</template>

<script>
import AppFunctions from "../../../utils/appFunction.js";
export default {
  name: "Header",
  components: {},
  data(){
    return{
      AppFunctions,
      isLoggedIn: false,
      username: ''
    }
  },
  methods: {
    toggleStickyHeader() {
      const scrolled = document.documentElement.scrollTop;
      const headerDefault = document.querySelector('.header-default');
      if (!headerDefault) return; // 如果元素不存在，直接返回
      
      if (scrolled > 100) {
        AppFunctions.addClass('.header-default', 'sticky');
      } else if (scrolled <= 100) {
        AppFunctions.removeClass('.header-default', 'sticky');
      }
    },
    login(){
      this.$router.push({ name: 'login' });
    },
    logout(){
      // 清除cookie
      document.cookie = "satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "userid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // 跳转到登录页
      this.$router.push({ name: 'login' });
    },
    checkLoginStatus() {
      // 检查cookie中是否有用户信息
      const username = this.getCookie('username');
      if (username) {
        this.isLoggedIn = true;
        this.username = username;
      } else {
        this.isLoggedIn = false;
        this.username = '';
      }
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return '';
    }
  },
  created() {
    window.addEventListener('scroll', this.toggleStickyHeader);
  },
  mounted() {
    this.toggleStickyHeader();
    this.checkLoginStatus();
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.toggleStickyHeader);
  },

}
</script>

<style scoped>
.router.router-link-active{
  /*color: #fff;*/
  /*background-color: #0e90d2;*/
  /*border: 1px solid #0e90d2;*/
  cursor: default;

  color: #0e90d2;
}

</style>
