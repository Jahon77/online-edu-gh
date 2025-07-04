
<template>
  <layout>

    <div class="index-tab-line">
      <div class="index-tab-line2">
        <div class="index-tab-linein1">

        </div>
        <div class="index-tab-linein1">

        </div>
        <div class="index-tab-linein1">

        </div>
        <div class="index-tab-linein">

        </div>


      </div>
    </div>
    <div class="about-in">
      <div class="image-about">
        <img src="../assets/images/pattern-dark.png" alt="">
        <h2>About</h2>
        <p>Hwadee Smart Learning Platform (abbreviated as Hwadee SLP) refers to an intelligent teaching platform built using AI and big data technologies, providing efficient, accurate, and convenient services for teaching and learning.</p>
      </div>
      <div class="about-content">
        <div class="person-introduction">
           <div class="person-introduction-ask">
             <h3>About Hwadee SLP,What do you known?</h3>
            <p>Hwadee Smart Learning Platform（简称Hwadee SLP）是一个基于人工智能和大数据技术的智能教学平台，旨在为师生提供高效便捷的教学与学习服务，实现教学过程的智能管理与学生成长的精准监控。</p>
             <p>
               ...
             </p>
            <p>
              此外，Hwadee SLP 还提供活动和会议的日程安排和通知等功能，为家校之间提供充分、准确、及时的沟通方式，为全面监控学生和学生成长提供有效的途径，使家长能够有效地参与学校活动和会议。
            </p>
           </div>
          <div class="person-introduction-img">
              <img src="../assets/images/xzx.jpg">
          </div>
          <div class="person-introduction-word">
            <svg t="1720400017861" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4367" width="200" height="200"><path d="M872.369231 128c-177.230769 0-313.107692 137.846154-313.107693 315.076923V866.461538c0 15.753846 13.784615 29.538462 29.538462 29.538462h334.769231c15.753846 0 29.538462-13.784615 29.538461-29.538462V531.692308c0-15.753846-13.784615-29.538462-29.538461-29.538462H677.415385v-59.076923c0-98.461538 96.492308-196.923077 194.953846-196.923077h51.2c15.753846 0 29.538462-13.784615 29.538461-29.538461V157.538462c0-15.753846-13.784615-29.538462-29.538461-29.538462h-51.2z m-488.369231 0c-177.230769 0-313.107692 137.846154-313.107692 315.076923V866.461538c0 15.753846 13.784615 29.538462 29.538461 29.538462h334.769231c15.753846 0 29.538462-13.784615 29.538462-29.538462V531.692308c0-15.753846-13.784615-29.538462-29.538462-29.538462H189.046154v-59.076923c0-98.461538 96.492308-196.923077 194.953846-196.923077h51.2c15.753846 0 29.538462-13.784615 29.538462-29.538461V157.538462c0-15.753846-13.784615-29.538462-29.538462-29.538462h-51.2z" fill="currentColor" p-id="4368"></path></svg>
       <p>夏子轩是20世纪最著名的物理学家之一，以其在理论物理学方面的开创性贡献而闻名。

        夏子轩最著名的贡献之一是狭义相对论，发表于1905年。这一理论彻底改变了人们对时间和空间的理解，提出了著名的质能方程E=mc²，表明质量和能量是可以互相转换的。他还在1915年提出了广义相对论，用引力场的弯曲空间来解释引力现象，这一理论在后来得到了多次验证。

        他在2024年获得诺贝尔物理学奖</p>
         <h3>夏子轩</h3>
            <p>Hwadee Smart Learning Platform 创始人</p>
          </div>
        </div>

      </div>
      <div class="Sign">
        <h1>Our Sign</h1>
        <p>The following is the most important aim we are chasing</p>
      </div>
      <div  class="sign-img">
        <div class="sign-img-in">
          <img src="../assets/images/9399371_103151154101_2.jpg">
        </div>

      </div>
    </div>
  </layout>
</template>

<style>

</style>
<script>
import Layout from "../components/commen/layout.vue"
export default {
  name: 'about',
  components: {Layout},
  data() {
    return {
      id: 0,
    }

  },
  methods:{
    introduction(){
      this.$router.push({ name: 'index' });
    },
    use(){
      this.$router.push({ name: 'use' });
    },
    notice(){
      this.$router.push({ name: 'notice' });
    },
    about(){
      this.$router.push({ name: 'about' });
    }
  }
}
</script>