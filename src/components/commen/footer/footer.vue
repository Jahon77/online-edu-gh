<template>
  <div class="footer" >
    <div style="background-color:#2c3e50" class="footer--bg"></div>
    <div class="footer--inner">
      <div class="am-g">
        <div class="am-u-md-3 ">
          <div class="footer_main--column">
            <strong class="footer_main--column_title">Products</strong>
            <ul class="footer_navigation">
              <li class="footer_navigation--item"><router-link to="/product" class="footer_navigation--link">华迪智学通</router-link></li>
              <li class="footer_navigation--item"><router-link to="/product" class="footer_navigation--link">华迪智学</router-link></li>
              <li class="footer_navigation--item"><router-link to="/product" class="footer_navigation--link">华迪</router-link></li>
            </ul>
          </div>
        </div>
        <div class="am-u-md-6 ">
          <div class="footer_main--column">
            <strong class="footer_main--column_title">关于我们</strong>
            <div class="footer_about">
              <p class="footer_about--text">
                华迪智学通（Hwadee Smart Learning Platform，简写：Hwadee-SLP）是基于人工智能与大数据技术打造的智能教学平台，提供教师、学生和管理员多端服务。平台支持课程管理、作业布置与批改、课程订阅学习、学生画像分析、教学反馈调查与用户统计等功能，集成视频播放、作业提交、即时通信、AI问答与多种登录方式，全面实现教学活动的数字化与智能化管理。
              </p>

            </div>
          </div>
        </div>
        <div class="am-u-md-3 ">
          <div class="footer_main--column">
            <strong class="footer_main--column_title">联系方式</strong>
            <ul class="footer_contact_info">
              <li class="footer_contact_info--item">
                  <img class="image" src="../../../assets/images/phone.svg">

                  <span>16674221033</span>
              </li>


              <li class="footer_contact_info--item">
                <img class="image" src="../../../assets/images/address.svg">
                <span>郫都区, 成都市,四川省</span></li>
              <li class="footer_contact_info--item">
                <img class="image" src="../../../assets/images/date.svg">
                <span>周一~ 周五, 8:30 - 17:30 </span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer"
}
</script>

<style scoped>
.footer {
  background-color: #2c3e50;
  color: #ffffff;
  padding: 40px 0 20px;
  position: relative;
}

.footer--inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.footer_main--column_title {
  color: #ecf0f1;
  font-size: 18px;
  margin-bottom: 20px;
  display: block;
  font-weight: 600;
}

.footer_navigation {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer_navigation--item {
  margin-bottom: 10px;
}

.footer_navigation--link {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer_navigation--link:hover {
  color: #3498db;
}

.footer_about--text {
  color: #bdc3c7;
  line-height: 1.6;
  font-size: 14px;
}

.footer_contact_info {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer_contact_info--item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #bdc3c7;
}

.footer_contact_info--item .image {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  filter: brightness(0) invert(0.8);
}

.footer_contact_info--item span {
  font-size: 14px;
}
</style>
