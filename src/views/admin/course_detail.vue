<template>
  <div class="course-detail-page">
    <button class="back-btn" @click="goBack">返回课程列表</button>
    <!-- 左侧课程信息 -->
    <div class="course-main">
      <div class="video-box">
        <video v-if="videoUrl" class="video-cover" :src="videoUrl" controls :poster="courseCover" />
        <img v-else class="video-cover" :src="courseCover" />
        <div class="video-controls">
        </div>
      </div>
      <div class="course-title">{{ courseTitle }}</div>
      <div class="course-meta">
        <span class="teacher-avatar"><img :src="teacherInfo.avatarUrl" /></span>
        <span class="teacher-name">{{ teacherInfo.name }}</span>
        <span class="meta-dot">·</span>
        <span class="meta-info">总时长：{{ Math.floor(totalDuration) }}秒</span>
      </div>
      <div class="course-tabs">
        <span class="tab" :class="{active: activeTab==='desc'}" @click="activeTab='desc'">概述</span>
        <span class="tab" :class="{active: activeTab==='review'}" @click="activeTab='review'">评价</span>
      </div>
      <div v-if="activeTab==='desc'" class="course-desc">
        {{ courseIntro }}
      </div>
      <div v-if="activeTab==='review'" class="course-review">
        <div class="review-header">
          <div class="review-score">
            <div class="score-main">{{ averageScore }}</div>
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
          <div class="review-item" v-for="(comment, idx) in comments" :key="idx">
            <div class="review-user">
              <img class="review-avatar" :src="comment.userAvatar" />
              <span class="review-username">{{ comment.username }}</span>
              <span class="review-user-star">
                <span class="star" :class="{filled: comment.stars >= 1}">★</span>
                <span class="star" :class="{filled: comment.stars >= 2}">★</span>
                <span class="star" :class="{filled: comment.stars >= 3}">★</span>
                <span class="star" :class="{filled: comment.stars >= 4}">★</span>
                <span class="star" :class="{filled: comment.stars >= 5}">★</span>
              </span>
              <span class="review-time">{{ comment.createdAt ? comment.createdAt.replace('T',' ').slice(0,16) : '' }}</span>
            </div>
            <div class="review-content">
              {{ comment.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧章节目录 -->
    <div class="course-outline">
      <div class="outline-title">课程内容</div>
      <div class="outline-summary">总章节：{{ sections.length }}&nbsp;&nbsp;&nbsp;&nbsp;共{{ Math.floor(totalDuration) }}秒</div>
      <div class="outline-section" v-for="(section, idx) in sections" :key="idx">
        <div class="section-title clickable" @click="toggleSection(idx)">
          {{ section.title }}
          <span class="arrow" :class="{open: section.expanded}">▼</span>
        </div>
        <div class="section-item clickable" @click="toggleSection(idx)" v-html="section.summary"></div>
        <div class="lesson-list" v-show="section.expanded">
          <transition-group name="slide-fade" tag="div">
            <div class="lesson-item" :class="{active: lesson.active}" v-for="(lesson, lidx) in section.lessons.slice(0, section.visibleCount)" :key="lesson.name" @click="playLesson(idx, lidx)">
              {{ lesson.name }} <span>{{ lesson.info }}</span>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
const router = useRouter()
const route = useRoute()
function goBack() {
  router.push('/admin/course')
}
const activeTab = ref('desc')

// 课程相关
const id = route.params.id
const courseDetail = ref(null)
const videoUrl = ref('')
const courseTitle = ref('')
const courseIntro = ref('')
const courseCover = ref('')
const teacherInfo = ref({})
const totalDuration = ref(0)

// 章节目录（动态）
const sections = ref([])

async function fetchCourseDetail() {
  try {
    const res = await axios.get(`/api/courses/admin/${id}`)
    const data = res.data.data
    courseDetail.value = data
    courseTitle.value = data.title
    courseIntro.value = data.introMd
    courseCover.value = data.coverUrl
    teacherInfo.value = data.teacher
    totalDuration.value = data.totalDuration
    // 目录结构
    sections.value = (data.chapters || []).map(chap => ({
      title: chap.title,
      summary: `${chap.lessons.length} 个视频 &nbsp;&nbsp;|&nbsp; &nbsp;${Math.floor(chap.duration)}秒`,
      expanded: false,
      visibleCount: 0,
      lessons: chap.lessons.map((lesson, idx) => ({
        name: lesson.title,
        info: `1 视频 ${Math.floor(lesson.duration)}秒`,
        videoUrl: lesson.videoUrl,
        active: false
      }))
    }))
    // 默认第一个视频
    if (data.chapters && data.chapters.length > 0 && data.chapters[0].lessons && data.chapters[0].lessons.length > 0) {
      videoUrl.value = data.chapters[0].lessons[0].videoUrl
      // 默认激活第一个
      if (sections.value[0] && sections.value[0].lessons[0]) {
        sections.value[0].lessons[0].active = true
      }
    }
  } catch (e) {
    // 失败处理
    courseTitle.value = '课程加载失败'
    courseIntro.value = ''
    courseCover.value = ''
    teacherInfo.value = {}
    totalDuration.value = 0
    sections.value = []
  }
}

// 目录点击切换
async function toggleSection(idx) {
  const section = sections.value[idx];
  if (!section.expanded) {
    section.expanded = true;
    section.visibleCount = 0;
    for (let i = 1; i <= section.lessons.length; i++) {
      await new Promise(res => setTimeout(res, 120));
      section.visibleCount = i;
    }
  } else {
    for (let i = section.lessons.length - 1; i >= 0; i--) {
      await new Promise(res => setTimeout(res, 120));
      section.visibleCount = i;
    }
    section.expanded = false;
  }
}

// 切换视频播放
function playLesson(sectionIdx, lessonIdx) {
  // 取消所有active
  sections.value.forEach((sec, sidx) => sec.lessons.forEach((l, lidx) => l.active = false))
  const lesson = sections.value[sectionIdx].lessons[lessonIdx]
  lesson.active = true
  videoUrl.value = lesson.videoUrl
}

// 评论相关
const comments = ref([])
async function fetchComments() {
  try {
    const res = await axios.get(`/api/teacher/course/${id}/comments`)
    comments.value = res.data
  } catch (e) {
    comments.value = []
  }
}

const reviewStats = computed(() => {
  const stats = [0, 0, 0, 0, 0]
  const total = comments.value.length
  comments.value.forEach(item => {
    const star = item.stars
    if (star >= 1 && star <= 5) stats[star - 1]++
  })
  return stats.map((count, index) => ({
    star: index + 1,
    percent: total > 0 ? Math.round((count / total) * 100) : 0
  })).reverse()
})

const averageScore = computed(() => {
  if (comments.value.length === 0) return '0.0'
  const sum = comments.value.reduce((acc, r) => acc + (r.stars || 0), 0)
  return (sum / comments.value.length).toFixed(1)
})

onMounted(() => {
  fetchCourseDetail()
  fetchComments()
})
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
  min-width: 0;
  height: 965px;
  max-height: 965px;
}
.video-box {
  position: relative;
  width: 100%;
  height: 425px;
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
.meta-info {
  color: #888;
  font-size: 1rem;
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
  width: 500px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 36px 28px;
  min-width: 340px;
  height: fit-content;
  height: 965px;
  max-height: 965px;
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
  font-size: 0.98rem;
  margin-bottom: 2px;
  padding: 2px 20px 2px 20px !important;
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
