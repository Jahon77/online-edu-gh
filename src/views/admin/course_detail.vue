<template>
  <div class="course-detail-page">
    <button class="back-btn" @click="goBack">返回课程列表</button>
    <!-- 左侧课程信息 -->
    <div class="course-main">
      <div class="video-box">
        <img class="video-cover" src="https://img.freepik.com/free-photo/teacher-online-lesson_23-2148723452.jpg" />
        <div class="video-controls">
          <span class="play-btn">▶</span>
          <span class="time">05:14/10:00</span>
        </div>
      </div>
      <div class="course-title">掌握 Excel：从基础知识到高级公式</div>
      <div class="course-meta">
        <span class="teacher-avatar"><img src="https://randomuser.me/api/portraits/women/4.jpg" /></span>
        <span class="teacher-name">姓名示例</span>
        <span class="meta-dot">·</span>
      </div>
      <div class="course-tabs">
        <span class="tab" :class="{active: activeTab==='desc'}" @click="activeTab='desc'">概述</span>
        <span class="tab" :class="{active: activeTab==='review'}" @click="activeTab='review'">评价</span>
      </div>
      <div v-if="activeTab==='desc'" class="course-desc">
        欢迎来到《掌握Excel：从基础知识到高级公式》！无论你是刚入门的学员还是日常在报表技能的经验丰富的用户，本课程都能帮助你系统掌握 Microsoft Excel 全部高阶功能。
        <br /><br />
        你将学到什么：<br />
        Excel Essentials：操作界面、调整基本功能并高效整理数据。<br />
        中级技能：创建数据透视表和条件格式并进行数据分析。<br />
        高级技巧：玩转 VLOOKUP、INDEX-MATCH、SUMIFS 等高级工具，以及最常用高级公式<br />
        实战项目：通过真实案例，带你从零搭建工作任务并提升效率。<br />
        <br />
        为什么选择本课程：<br />
        讲师资质：来自于行业的实际经验。<br />
        内容全面：涵盖基础到高级 Excel 技能的全流程。<br />
        学习支持：你可以在学习群和同学们一起学习。
      </div>
      <div v-if="activeTab==='review'" class="course-review">
        <div class="review-header">
          <div class="review-score">
            <div class="score-main">4.7</div>
            <div class="score-label">评分</div>
          </div>
          <div class="review-detail">
            <div class="review-row" v-for="(item, idx) in reviewStats" :key="idx">
              <span class="review-bar-label">{{ item.percent }}%</span>
              <span class="review-stars">
                <span v-for="i in 5" :key="i" class="star" :class="{filled: i<=item.star}">★</span>
              </span>
              <div class="review-bar-outer">
                <div class="review-bar-inner" :style="{width: item.percent + '%'}"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="review-list">
          <div class="review-item">
            <div class="review-user">
              <img class="review-avatar" src="https://randomuser.me/api/portraits/men/1.jpg" />
              <span class="review-username">姓名示例</span>
              <span class="review-user-star">
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star">★</span>
              </span>
              <span class="review-time">2024-05-01 14:23</span>
            </div>
            <div class="review-content">
              我没有太多的时间和机会去外面学习这门课。
            </div>
          </div>
          <div class="review-item">
            <div class="review-user">
              <img class="review-avatar" src="https://randomuser.me/api/portraits/women/2.jpg" />
              <span class="review-username">李老师</span>
              <span class="review-user-star">
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
              </span>
              <span class="review-time">2024-05-02 09:10</span>
            </div>
            <div class="review-content">
              课程内容非常详细，讲解也很清晰，受益匪浅！
            </div>
          </div>
          <div class="review-item">
            <div class="review-user">
              <img class="review-avatar" src="https://randomuser.me/api/portraits/men/3.jpg" />
              <span class="review-username">王同学</span>
              <span class="review-user-star">
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
              </span>
              <span class="review-time">2024-05-03 18:45</span>
            </div>
            <div class="review-content">
              有些地方讲得有点快，不过整体还是很不错的。
            </div>
          </div>
          <div class="review-item">
            <div class="review-user">
              <img class="review-avatar" src="https://randomuser.me/api/portraits/women/4.jpg" />
              <span class="review-username">小张</span>
              <span class="review-user-star">
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star">★</span>
              </span>
              <span class="review-time">2024-05-04 11:30</span>
            </div>
            <div class="review-content">
              老师讲得很耐心，适合新手入门。
            </div>
          </div>
          <div class="review-item">
            <div class="review-user">
              <img class="review-avatar" src="https://randomuser.me/api/portraits/men/5.jpg" />
              <span class="review-username">匿名用户</span>
              <span class="review-user-star">
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star filled">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
              </span>
              <span class="review-time">2024-05-05 16:12</span>
            </div>
            <div class="review-content">
              希望能多一些实战案例。
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧章节目录 -->
    <div class="course-outline">
      <div class="outline-title">课程内容</div>
      <div class="outline-summary">讲座({{ sections.length }}) 总计(5:20 小时)</div>
      <div class="outline-section" v-for="(section, idx) in sections" :key="idx">
        <div class="section-title clickable" @click="toggleSection(idx)">
          {{ section.title }}
          <span class="arrow" :class="{open: section.expanded}">▼</span>
        </div>
        <div class="section-item clickable" @click="toggleSection(idx)">{{ section.summary }}</div>
        <div class="lesson-list" v-show="section.expanded">
          <transition-group name="slide-fade" tag="div">
            <div class="lesson-item" :class="{active: lesson.active}" v-for="(lesson, lidx) in section.lessons.slice(0, section.visibleCount)" :key="lesson.name">
              {{ lesson.name }} <span>{{ lesson.info }}</span>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() {
  router.push('/admin/course')
}
const activeTab = ref('desc')
const reviewStats = [
  { star: 5, percent: 57 },
  { star: 4, percent: 26 },
  { star: 3, percent: 12 },
  { star: 2, percent: 3 },
  { star: 1, percent: 2 }
]

const sections = ref([
  {
    title: '第 1 节 简介',
    summary: '1 个视频 | 20分钟',
    expanded: false,
    visibleCount: 0,
    lessons: [
      { name: '入门课程', info: '1 视频 20分钟', active: true },
      { name: 'Excel界面介绍', info: '1 视频 15分钟' },
      { name: 'Excel常用操作', info: '1 视频 18分钟' }
    ]
  },
  {
    title: '第 2 节 数据整理',
    summary: '3 个视频 | 60分钟',
    expanded: false,
    visibleCount: 0,
    lessons: [
      { name: '数据录入技巧', info: '1 视频 20分钟' },
      { name: '数据格式化', info: '1 视频 20分钟' },
      { name: '数据查找与替换', info: '1 视频 20分钟' }
    ]
  },
  {
    title: '第 3 节 公式与函数',
    summary: '4 个视频 | 80分钟',
    expanded: false,
    visibleCount: 0,
    lessons: [
      { name: '常用函数讲解', info: '1 视频 20分钟' },
      { name: 'VLOOKUP实战', info: '1 视频 20分钟' },
      { name: 'SUMIFS用法', info: '1 视频 20分钟' },
      { name: '综合案例', info: '1 视频 20分钟' }
    ]
  },
  {
    title: '第 4 节 数据分析',
    summary: '2 个视频 | 40分钟',
    expanded: false,
    visibleCount: 0,
    lessons: [
      { name: '数据透视表', info: '1 视频 20分钟' },
      { name: '条件格式', info: '1 视频 20分钟' }
    ]
  },
  {
    title: '第 5 节 高级技巧',
    summary: '2 个视频 | 40分钟',
    expanded: false,
    visibleCount: 0,
    lessons: [
      { name: '宏与自动化', info: '1 视频 20分钟' },
      { name: '自定义模板', info: '1 视频 20分钟' }
    ]
  }
])

async function toggleSection(idx) {
  const section = sections.value[idx];
  if (!section.expanded) {
    // 展开：依次滑入
    section.expanded = true;
    section.visibleCount = 0;
    for (let i = 1; i <= section.lessons.length; i++) {
      await new Promise(res => setTimeout(res, 100));
      section.visibleCount = i;
    }
  } else {
    // 收起：依次滑出
    for (let i = section.lessons.length - 1; i >= 0; i--) {
      await new Promise(res => setTimeout(res, 130 + i * 10));
      section.visibleCount = i;
    }
    section.expanded = false;
  }
}
</script>

<style scoped>
.back-btn {
  position: absolute;
  left: 2020px;
  top: 94px;
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}
.back-btn:hover {
  background: var(--main-blue);
}


.course-detail-page {
  display: flex;
  gap: 32px;
  background: var(--main-light);
  min-height: 100vh;
  padding: 32px 40px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.course-main {
  flex: 1;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 36px 28px;
  margin-right: 32px;
  min-width: 0;
  height: 1000px;
  max-height: 1000px;
}
.video-box {
  position: relative;
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 18px;
  background: #eee;
}
.video-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video-controls {
  position: absolute;
  left: 24px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 4px 12px;
}
.play-btn {
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
}
.time {
  color: #fff;
  font-size: 1rem;
}
.course-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}
.course-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.teacher-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 4px;
}
.teacher-name {
  font-weight: 500;
  color: #4a90e2;
}
.meta-dot {
  color: #aaa;
  margin: 0 4px;
}

.course-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
}
.tab {
  font-size: 1.1rem;
  color: #888;
  cursor: pointer;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border 0.2s;
}
.tab.active {
  color: var(--main-orange);
  border-bottom: 2px solid var(--main-orange);
}
.course-desc {
  color: #444;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-top: 10px;
}
.course-outline {
  width: 340px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 36px 28px;
  min-width: 340px;
  height: fit-content;
  height: 1000px;
  max-height: 1000px;
}
.outline-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}
.outline-summary {
  color: #888;
  font-size: 1rem;
  margin-bottom: 18px;
}
.outline-section {
  margin-bottom: 18px;
}
.section-title {
  font-weight: 500;
  color: var(--main-orange);
  font-size: 1.08rem;
  margin-bottom: 2px;
}
.section-item {
  color: #666;
  font-size: 0.98rem;
  margin-bottom: 4px;
}
.lesson-list {
  margin-left: 18px;
  margin-top: 4px;
}
.lesson-item {
  color: #4a90e2;
  font-size: 0.98rem;
  margin-bottom: 2px;
  padding: 2px 0 2px 8px;
  border-left: 3px solid #e0e7ef;
  position: relative;
}
.lesson-item.active {
  color: var(--main-orange);
  font-weight: bold;
  border-left: 3px solid var(--main-orange);
}
.course-review {
  margin-top: 18px;
  background: #f9f9fe;
  border-radius: 16px;
  padding: 24px 24px 12px 24px;

  max-height: 500px;        /* ✅ 限制最大高度 */
  overflow-y: auto;         /* ✅ 内容超出则出现滚动条 */
}
.review-header {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 18px;
}
.review-score {
  width: 90px;
  text-align: center;
  margin-right: 12px;
}
.score-main {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--main-orange);
  margin-bottom: 2px;
}
.score-label {
  color: #888;
  font-size: 1.1rem;
}
.review-detail {
  flex: 1;
}
.review-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.review-bar-label {
  width: 36px;
  color: #888;
  font-size: 1rem;
}
.review-stars {
  min-width: 90px;
}
.star {
  color: #e0e7ef;
  font-size: 1.1rem;
}
.star.filled {
  color: #ffc107;
}
.review-bar-outer {
  flex: 1;
  height: 12px;
  background: #e0e7ef;
  border-radius: 8px;
  margin-left: 8px;
  overflow: hidden;
}
.review-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #ff914d);
  border-radius: 8px;
  transition: width 0.4s;
}
.review-list {
  margin-top: 18px;
}
.review-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.review-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.review-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.review-username {
  font-weight: bold;
  color: #333;
}
.review-user-star .star {
  font-size: 1rem;
  margin-left: 2px;
}
.review-content {
  color: #444;
  font-size: 1.08rem;
  margin-left: 42px;
}
.review-time {
  color: #888;
  font-size: 0.9rem;
  margin-left: 10px;
}
.clickable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.section-title.clickable:hover,
.section-item.clickable:hover {
  background: #f5f7fa;
}
.arrow {
  display: inline-block;
  margin-left: 8px;
  font-size: 0.9em;
  transition: transform 0.2s;
}
.arrow.open {
  transform: rotate(180deg);
}
.lesson-list {
  margin-left: 12px;
  margin-bottom: 8px;
}
.lesson-item {
  padding: 6px 0 6px 12px;
  border-radius: 8px;
  margin-bottom: 2px;
  background: #f9f9fe;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lesson-item.active {
  background: linear-gradient(90deg, #ff914d22, #4a90e222);
  color: var(--main-orange);
  font-weight: bold;
}
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(.55,0,.1,1);
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(.55,0,.1,1);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
