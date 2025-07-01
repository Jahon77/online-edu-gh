<template>
<div class="hot-courses">
  <div class="hot-courses-header">
    <h3>热门课程</h3>
    <div class="hot-courses-actions">
      <select class="month-select">
        <option>2024-06</option>
        <option>2024-05</option>
        <option>2024-04</option>
      </select>
      <button class="view-all-btn">查看全部</button>
    </div>
  </div>
  <table class="hot-courses-table">
    <thead>
      <tr>
        <th>排名</th>
        <th>课程名称</th>
        <th>讲师</th>
        <th>订阅数量</th>
        <th>价格</th>
        <th>节数</th>
        <th>总时间</th>
        <th>状态</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(course, idx) in hotCourses" :key="course.id">
        <td>
            <img v-if="idx < 5" :src="topImages[idx]" alt="top icon" class="rank-img" />
            
          <span v-else class="rank-num">{{ idx+1 }}</span>
        </td>
        <td>
          <img :src="course.img" class="course-img" />
          <div class="course-info">
            <div class="course-title">{{ course.title }}</div>
            <div class="course-id">#{{ course.id }}</div>
          </div>
        </td>
        <td>{{ course.teacher }}</td>
        <td>{{ course.count }}</td>
        <td>{{ course.price }}</td>
        <td>{{ course.lessons }}</td>
        <td>{{ course.duration }}</td>
        <td>
          <span :class="['status', course.statusClass]">{{ course.statusText }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

</template>


<script setup>

import top1 from '@/assets/images/top1.png'
import top2 from '@/assets/images/top2.png'
import top3 from '@/assets/images/top3.png'
import top4 from '@/assets/images/top4.png'
import top5 from '@/assets/images/top5.png'

const topImages = [top1, top2, top3, top4, top5]


const hotCourses = [
  {
    id: '54204152',
    // img: require('@/assets/images/1.jpg'),
    title: '机器学习算法',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 24,
    duration: '248小时',
    statusText: '已发布',
    statusClass: 'published'
  },
  {
    id: '54204153',
    // img: require('@/assets/images/2.jpg'),
    title: '均衡饮食食谱',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 32,
    duration: '248小时',
    statusText: '已发布',
    statusClass: 'published'
  },
  {
    id: '54204154',
    // img: require('@/assets/images/3.jpg'),
    title: '减少技术',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 32,
    duration: '248小时',
    statusText: '已下架',
    statusClass: 'offline'
  },
  {
    id: '54204155',
    // img: require('@/assets/images/4.jpg'),
    title: '用户界面设计',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 32,
    duration: '248小时',
    statusText: '即将发布',
    statusClass: 'pending'
  }
]


</script>

<style scoped>
/* <style scoped> 区域添加 */
.hot-courses {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 32px 24px;
  margin-bottom: 32px;
}
.hot-courses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.hot-courses-header h3 {
  color: var(--main-orange);
  font-size: 1.5rem;
  margin: 0;
}
.view-all-btn {
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.view-all-btn:hover {
  background: var(--main-green);
}
.hot-courses-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}
.hot-courses-table th, .hot-courses-table td {
  padding: 12px 10px;
  text-align: center;
  background: #fafbfc;
  border-radius: 8px;
}
.hot-courses-table th {
  color: #888;
  font-weight: 600;
  background: #f5f5f5;
}
.course-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 10px;
  vertical-align: middle;
}
.course-info {
  display: inline-block;
  vertical-align: middle;
  text-align: left;
}
.course-title {
  font-weight: bold;
  color: #333;
}
.course-id {
  font-size: 0.85em;
  color: #aaa;
}
.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.95em;
  font-weight: 600;
  display: inline-block;
}
.status.published {
  background: #e6f9ed;
  color: #1abc9c;
}
.status.offline {
  background: #ffeaea;
  color: #e74c3c;
}
.status.pending {
  background: #fffbe6;
  color: #f1c40f;
}


.hot-courses-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.month-select {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 1rem;
  color: #FF914D;
  background: #fff;
  outline: none;
  margin-right: 8px;
  cursor: pointer;
}
.rank-img {
  width: 32px;
  height: 32px;
  vertical-align: middle;
}
.rank-num {
  font-size: 1.2rem;
  color: #aaa;
  font-weight: bold;
}
</style>