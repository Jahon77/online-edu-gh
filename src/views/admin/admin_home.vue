<template>
  <div class="admin-home">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">教学管理</div>
      <nav>
        <ul>
          <li class="active">首页</li>
          <li>教师</li>
          <li>学生</li>
          <li>课程</li>
          <li>资源</li>
          <li>证书</li>
          <li>聊天</li>
          <li>交易</li>
          <li>应用</li>
          <li>项目</li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
          <div>
            <div class="name">KOTO</div>
            <div class="email">koto@qq.com</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="welcome">
          <h2>欢迎回来，{{username}}！</h2>
          <p>最轻松的管理和LMS平台绩效</p>
        </div>
        <div class="header-actions">
          <button class="icon-btn">🔔</button>
          <button class="icon-btn">…</button>
          <img class="avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
        </div>
      </header>

      <!-- 统计卡片 -->
      <section class="stats-cards">
        <div class="card">
          <div class="card-title">学生总数</div>
          <div class="card-value">72,056</div>
          <div class="card-desc up">+12.05%</div>
        </div>
        <div class="card">
          <div class="card-title">总课程</div>
          <div class="card-value">12,056</div>
          <div class="card-desc down">-12.25%</div>
        </div>
        <div class="card">
          <div class="card-title">总视频</div>
          <div class="card-value">31,056</div>
          <div class="card-desc up">+25.21%</div>
        </div>
        <div class="card">
          <div class="card-title">总收入</div>
          <div class="card-value">￥8,05,056</div>
          <div class="card-desc up">+25.21%</div>
        </div>
      </section>

      <!-- 图表区（占位） -->
      <section class="charts-section">
        <div class="chart-card">
          <div class="chart-title">概述</div>
          <div class="chart-placeholder">[柱状图区域]</div>
        </div>
        <div class="chart-card">
          <div class="chart-title">学生分析</div>
          <div class="chart-placeholder">[折线图区域]</div>
        </div>
      </section>

      <!-- 交易列表 -->
      <section class="transactions">
        <div class="transactions-header">
          <span>交易</span>
          <a href="#">查看全部</a>
        </div>
        <table class="transactions-table">
          <thead>
            <tr>
              <th>学生名称</th>
              <th>课程</th>
              <th>价格</th>
              <th>付款方式</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><img class="avatar" src="https://randomuser.me/api/portraits/women/44.jpg" /> 姓名示例</td>
              <td>数字营销基础知识</td>
              <td>￥445.00</td>
              <td><span class="pay mastercard">●●●● 1264</span></td>
              <td><span class="status success">已完成</span></td>
              <td>
                <button class="action view">👁️</button>
                <button class="action edit">✏️</button>
                <button class="action delete">🗑️</button>
              </td>
            </tr>
            <tr>
              <td><img class="avatar" src="https://randomuser.me/api/portraits/men/45.jpg" /> 姓名示例</td>
              <td>Python 编程简介</td>
              <td>￥345.00</td>
              <td><span class="pay alipay">A2IV 3658</span></td>
              <td><span class="status danger">已驳回</span></td>
              <td>
                <button class="action view">👁️</button>
                <button class="action edit">✏️</button>
                <button class="action delete">🗑️</button>
              </td>
            </tr>
            <tr>
              <td><img class="avatar" src="https://randomuser.me/api/portraits/men/46.jpg" /> 姓名示例</td>
              <td>机器学习与应用</td>
              <td>￥645.00</td>
              <td><span class="pay wechat">●●●● 1264</span></td>
              <td><span class="status success">已完成</span></td>
              <td>
                <button class="action view">👁️</button>
                <button class="action edit">✏️</button>
                <button class="action delete">🗑️</button>
              </td>
            </tr>
            <tr>
              <td><img class="avatar" src="https://randomuser.me/api/portraits/men/47.jpg" /> 姓名示例</td>
              <td>利用数据进行决策</td>
              <td>￥645.00</td>
              <td><span class="pay mastercard">●●●● 1264</span></td>
              <td><span class="status warning">待支付</span></td>
              <td>
                <button class="action view">👁️</button>
                <button class="action edit">✏️</button>
                <button class="action delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const username = ref('admin') // 初始值为 admin

onMounted(() => {
  fetch('/api/user-info')
    .then(res => res.json())
    .then(data => {
      username.value = data.username
    })
})
</script>

<style scoped>

.admin-home {
  display: flex;
  min-height: 100vh;
  background: var(--main-light);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.sidebar {
  width: 220px;
  background: var(--main-green);
  padding: 32px 0 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 0 32px 32px 0;
  box-shadow: 2px 0 16px #e0e0e0;
}
.logo {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--main-orange);
  text-align: center;
  margin-bottom: 32px;
}
.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar nav li {
  padding: 14px 32px;
  color: #333;
  border-radius: 0 24px 24px 0;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.sidebar nav li.active,
.sidebar nav li:hover {
  background: var(--main-orange);
  color: #fff;
}
.sidebar-footer {
  padding: 24px 0 24px 32px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.user-info .name {
  font-weight: bold;
  color: #333;
}
.user-info .email {
  font-size: 0.9em;
  color: #888;
}
.main-content {
  flex: 1;
  padding: 40px 48px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.welcome h2 {
  margin: 0 0 6px 0;
  color: var(--main-orange);
  font-size: 1.5rem;
}
.welcome p {
  margin: 0;
  color: #888;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}
.header-actions .icon-btn {
  background: var(--main-blue);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.header-actions .icon-btn:hover {
  background: var(--main-orange);
}
.header-actions .avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--main-peach);
}
.stats-cards {
  display: flex;
  gap: 24px;
}
.card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.card-title {
  color: #888;
  font-size: 1em;
}
.card-value {
  font-size: 1.6em;
  font-weight: bold;
  color: var(--main-orange);
}
.card-desc {
  font-size: 0.95em;
  border-radius: 8px;
  padding: 2px 10px;
  margin-top: 2px;
}
.card-desc.up {
  background: var(--main-green);
  color: #3a7c2b;
}
.card-desc.down {
  background: #ffeaea;
  color: #e74c3c;
}
.charts-section {
  display: flex;
  gap: 24px;
}
.chart-card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chart-title {
  color: var(--main-orange);
  font-weight: bold;
  margin-bottom: 8px;
}
.chart-placeholder {
  background: var(--main-blue);
  border-radius: 12px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1em;
  opacity: 0.7;
}
.transactions {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px 18px;
}
.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1em;
  margin-bottom: 12px;
}
.transactions-header a {
  color: var(--main-orange);
  text-decoration: none;
  font-size: 0.95em;
}
.transactions-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}
.transactions-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}
.transactions-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}
.transactions-table .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.pay {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--main-peach);
  color: #fff;
}
.pay.alipay {
  background: var(--main-blue);
}
.pay.wechat {
  background: var(--main-green);
  color: #333;
}
.status {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: bold;
}
.status.success {
  background: var(--main-green);
  color: #3a7c2b;
}
.status.danger {
  background: #ffeaea;
  color: #e74c3c;
}
.status.warning {
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
</style>
