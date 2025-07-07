<template>
  <div class="log-page">
    <!-- 左侧侧边栏 -->
    <div class="log-sider">
      <div
        v-for="(item, idx) in logTabs"
        :key="item.key"
        @click="activeTab = item.key"
        :class="['log-sider-item', { active: activeTab === item.key }]"
      >
        <span class="log-sider-icon">{{ item.icon }}</span>
        <div>
          <div class="log-sider-label">{{ item.label }}</div>
          <div class="log-sider-desc">{{ item.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="log-content">
      <div class="log-content-card">
        <h2 class="log-content-title">{{ getTabLabel(activeTab) }}</h2>
        <div class="log-content-placeholder">
          <div class="log-content-card">
            <h2 class="log-content-title">{{ getTabLabel(activeTab) }}</h2>

            <table class="log-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>用户</th>
                  <th>类型</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-07-05 18:32</td>
                  <td>张三</td>
                  <td>异常日志</td>
                  <td>页面加载超时</td>
                </tr>
                <tr>
                  <td>2025-07-05 18:01</td>
                  <td>李四</td>
                  <td>安全日志</td>
                  <td>登录失败：密码错误</td>
                </tr>
                <tr>
                  <td>2025-07-05 17:45</td>
                  <td>王五</td>
                  <td>课程日志</td>
                  <td>发布了新课程《Vue 3 实战》</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const logTabs = [
  { key: 'system', label: '系统日志', desc: '监控接口调用情况与响应效率', icon: '💻' },
  { key: 'exception', label: '异常日志', desc: '记录系统运行过程中的错误与异常信息', icon: '⚠️' },
  { key: 'security', label: '安全日志', desc: '记录登录失败、越权访问等安全相关事件', icon: '🔒' },
  { key: 'course', label: '课程日志', desc: '记录教师课程的创建、修改、删除等行为', icon: '📚' },
  { key: 'student', label: '学生日志', desc: '记录学生的学习行为与使用偏好信息', icon: '👨‍🎓' },
];

const activeTab = ref('exception');

function getTabLabel(key) {
  const found = logTabs.find(t => t.key === key);
  return found ? found.label : '';
}
</script>

<style scoped>
/* 整体页面布局 */
.log-page {
  display: flex;
  min-height: 600px;
  background: var(--main-light);
  padding: 32px 0;
  font-size: 16px;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

/* 左侧导航栏 */
.log-sider {
  width: 370px;
  background: #fff;
  border-radius: 20px;
  margin-left: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 730px;
}

/* 单个导航项 */
.log-sider-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 12px;
  margin: 0 20px;
  padding: 14px 22px;
  transition: all 0.3s ease;
  color: #333;
  font-size: 16px;
  background: var(--main-light);
}
.log-sider-item.active {
  background: #f3eafe;
  color: #7c3aed;
  font-weight: 600;
}
.log-sider-icon {
  font-size: 36px;
  margin-right: 10px;
}
.log-sider-label {
  font-size: 22px;
  font-weight: 500;
}
.log-sider-desc {
  font-size: 20px;
  color: #9aa0b2;
  margin-top: 4px;
}

/* 右侧内容区域 */
.log-content {
  flex: 1;
  margin-left: 36px;
  margin-right: 40px;
}
.log-content-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #dcdfe6; /* 明显一点的浅灰色边框 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); /* 稍微加强阴影 */
  padding: 36px 48px;
  height: auto;
  width: 100%;
  min-height: 800px;
}

.log-content-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 28px;
}
.log-content-placeholder {
  color: #999;
  font-size: 18px;
  text-align: center;
  margin-top: 46px;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  color: #444;
}
.log-table th,
.log-table td {
  border-bottom: 1px solid #eee;
  padding: 12px 16px;
  text-align: left;
}
.log-table th {
  background: #fafafa;
  color: #666;
  font-weight: 600;
}


</style>
  