<template>
  <div class="course-page">
    <div class="course-header">
      <div class="course-tabs">
        <div 
          :class="['tab', { active: activeTab === 'all' }]" 
          @click="switchTab('all')"
        >
          全部课程
        </div>
        <div 
          :class="['tab', { active: activeTab === 'ranking' }]" 
          @click="switchTab('ranking')"
        >
          课程排名
        </div>
      </div>
      <div class="course-actions">
        <div v-if="activeTab === 'ranking'" class="ranking-filter">
          <select v-model="selectedMonth" class="month-select">
            <option value="2024-06">2024年6月</option>
            <option value="2024-05">2024年5月</option>
            <option value="2024-04">2024年4月</option>
            <option value="2024-03">2024年3月</option>
          </select>
        </div>
        <button class="btn export">导出</button>
      </div>
    </div>
    
    <!-- 全部课程表格 -->
    <div v-if="activeTab === 'all'" class="course-table-wrapper">
      <table class="course-table">
        <thead>
          <tr>
            <th>课程名称</th>
            <th>课程编号</th>
            <th>类型</th>
            <th>讲师</th>
            <th>订阅</th>
            <th>价格</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in courseList" :key="idx">
            <td>
              <img class="cover" :src="item.cover" />
              <div class="info">
                <div class="name">{{ item.name }}</div>
              </div>
            </td>
            <td>{{ item.id }}</td>
            <td>{{ item.level }}</td>
            <td>{{ item.teacher }}</td>
            <td>{{ item.note }}</td>
            <td>{{ item.price }}</td>
            <td>
              <span :class="['status', item.statusClass]">{{ item.statusText }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">显示 {{ courseList.length }} 个结果</div>
    </div>

    <!-- 课程排名表格 -->
    <div v-if="activeTab === 'ranking'" class="course-table-wrapper">
      <table class="course-table">
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
              <img :src="course.img" class="cover" />
              <div class="info">
                <div class="name">{{ course.title }}</div>
                <div class="id">#{{ course.id }}</div>
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
      <div class="table-footer">显示 {{ hotCourses.length }} 个结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('all')
const selectedMonth = ref('2024-06')

import top1 from '@/assets/images/top1.png'
import top2 from '@/assets/images/top2.png'
import top3 from '@/assets/images/top3.png'
import top4 from '@/assets/images/top4.png'
import top5 from '@/assets/images/top5.png'

const topImages = [top1, top2, top3, top4, top5]

const courseList = ref([
  { name: '机器学习算法', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/60.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 24, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '均衡饮食食谱', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/61.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '减步技术', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/62.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已下架', statusClass: 'danger' },
  { name: '用户界面设计', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/63.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '即将发布', statusClass: 'warning' },
  { name: '网页设计与开发', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/64.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '心理学入门与心灵', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/65.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '利用数据进行决策', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/66.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '从零开始构建网站', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/67.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '数字营销基础知识', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/68.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: 'Python编程', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/69.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
  { name: '均衡饮食食谱', id: '4204152', cover: 'https://randomuser.me/api/portraits/men/70.jpg', teacher: '姓名示例', note: 562, price: '400元', train: 32, duration: '248小时', statusText: '已发布', statusClass: 'success' },
])

const hotCourses = ref([
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
  },
  {
    id: '54204156',
    // img: require('@/assets/images/5.jpg'),
    title: '网页设计与开发',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 32,
    duration: '248小时',
    statusText: '已发布',
    statusClass: 'published'
  },
  {
    id: '54204157',
    // img: require('@/assets/images/6.jpg'),
    title: '心理学入门与心灵',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 32,
    duration: '248小时',
    statusText: '已发布',
    statusClass: 'published'
  },
  {
    id: '54204158',
    // img: require('@/assets/images/7.jpg'),
    title: '利用数据进行决策',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 32,
    duration: '248小时',
    statusText: '已发布',
    statusClass: 'published'
  },
  {
    id: '54204159',
    // img: require('@/assets/images/8.jpg'),
    title: '从零开始构建网站',
    teacher: '姓名示例',
    count: 562,
    price: '400元',
    lessons: 32,
    duration: '248小时',
    statusText: '已发布',
    statusClass: 'published'
  }
])

const switchTab = (tab) => {
  activeTab.value = tab
}
</script>

<style scoped>
.course-page {
  background: var(--main-light);
  min-height: 100vh;
  padding: 32px 40px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.course-tabs {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab {
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.tab.active {
  background: var(--main-orange);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 145, 77, 0.3);
}

.tab:hover:not(.active) {
  background: #f5f5f5;
  color: #333;
}

.course-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-filter {
  display: flex;
  align-items: center;
}

.month-select {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.95rem;
  color: var(--main-orange);
  background: #fff;
  outline: none;
  cursor: pointer;
  margin-right: 8px;
}

.month-select:focus {
  border-color: var(--main-orange);
}

.course-actions .btn {
  background: var(--main-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  margin-left: 12px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}


.course-table-wrapper {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
}

.course-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.course-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}

.course-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}

.course-table .cover {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  margin-right: 8px;
  vertical-align: middle;
  object-fit: cover;
}

.course-table .info {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}

.course-table .name {
  font-weight: bold;
  color: #333;
}

.course-table .id {
  font-size: 0.9em;
  color: #888;
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
  display: inline-block;
  width: 32px;
  text-align: center;
}

.status {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: bold;
  display: inline-block;
}

.status.success,
.status.published {
  background: var(--main-green);
  color: #3a7c2b;
}

.status.danger,
.status.offline {
  background: #ffeaea;
  color: #e74c3c;
}

.status.warning,
.status.pending {
  background: var(--main-peach);
  color: #fff;
}

.action {
  background: var(--main-blue);
  border: none;
  border-radius: 6px;
  margin-right: 4px;
  padding: 4px 8px;
  color: #fff;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.2s;
}

.action.view:hover {
  background: var(--main-orange);
}

.action.edit:hover {
  background: var(--main-green);
  color: #333;
}

.action.delete:hover {
  background: #e74c3c;
}

.table-footer {
  color: #888;
  font-size: 0.95em;
  margin-top: 16px;
}
</style>