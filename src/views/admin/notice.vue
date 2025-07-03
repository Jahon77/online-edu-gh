<template>
  <div class="notice-page">
    <div class="notice-header">
      <div class="notice-tabs">
        <div 
          :class="['tab', { active: activeTab === 'course-approval' }]" 
          @click="switchTab('course-approval')"
        >
          课程审批
        </div>
        <div 
          :class="['tab', { active: activeTab === 'survey' }]" 
          @click="switchTab('survey')"
        >
          问卷调查
        </div>
      </div>
    </div>
    
    <!-- 课程审批模块 -->
    <div v-if="activeTab === 'course-approval'" class="approval-section">
      <div class="section-header">
        <h3>课程</h3>
        <div class="filter-actions">
          <select v-model="approvalFilter" class="filter-select">
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>
      
      <div class="approval-table-wrapper">
        <table class="approval-table">
          <thead>
            <tr>
              <th>课程名称</th>
              <th>课程编号</th>
              <th>类型</th>
              <th>讲师</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in filteredApprovalCourses" :key="course.id">
              <td>
                <img class="cover" :src="course.coverUrl || 'https://randomuser.me/api/portraits/men/60.jpg'" />
                <div class="info">
                  <div class="name">{{ course.title }}</div>
                </div>
              </td>
              <td>{{ course.courseId }}</td>
              <td>{{ course.level }}</td>
              <td>{{ course.teacherName }}</td>
              <td>
                <span :class="['status', getStatusClass(course.status)]">{{ getStatusText(course.status) }}</span>
              </td>
              <td>
                <div class="action-buttons" v-if="course.status === 3">
                  <button @click="approveCourse(course.id)" class="action-btn approve">同意</button>
                  <button @click="rejectCourse(course.id)" class="action-btn reject">拒绝</button>
                </div>
                <span v-else class="no-action">已处理</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <div class="pagination-info">
            显示 {{ (approvalCurrentPage - 1) * approvalPageSize + 1 }}-{{ Math.min(approvalCurrentPage * approvalPageSize, approvalTotal) }} 条，共 {{ approvalTotal }} 条
          </div>
          <div class="pagination">
            <button 
              :disabled="approvalCurrentPage === 1" 
              @click="changeApprovalPage(approvalCurrentPage - 1)"
              class="page-btn prev"
            >
              上一页
            </button>
            <span class="page-info">{{ approvalCurrentPage }} / {{ approvalTotalPages }}</span>
            <button 
              :disabled="approvalCurrentPage === approvalTotalPages" 
              @click="changeApprovalPage(approvalCurrentPage + 1)"
              class="page-btn next"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 问卷调查模块 -->
    <div v-if="activeTab === 'survey'" class="survey-section">
      <div class="section-header">
        <h3>问卷调查管理</h3>
        <button @click="showCreateSurveyModal = true" class="create-btn">创建问卷</button>
      </div>
      
      <div class="survey-list">
        <div v-for="survey in surveyList" :key="survey.id" class="survey-card">
          <div class="survey-header">
            <h4>{{ survey.title }}</h4>
            <span :class="['survey-status', getSurveyStatusClass(survey.status)]">
              {{ getSurveyStatusText(survey.status) }}
            </span>
          </div>
          <div class="survey-info">
            <p class="survey-desc">{{ survey.description }}</p>
            <div class="survey-meta">
              <span>发送对象: {{ getTargetText(survey.target) }}</span>
              <span>创建时间: {{ formatDate(survey.createdAt) }}</span>
              <span>参与人数: {{ survey.participantCount || 0 }}</span>
            </div>
          </div>
          <div class="survey-actions">
            <button @click="viewSurveyResults(survey.id)" class="action-btn view">查看结果</button>
            <button @click="editSurvey(survey.id)" class="action-btn edit">编辑</button>
            <button @click="deleteSurvey(survey.id)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建问卷模态框 -->
    <div v-if="showCreateSurveyModal" class="modal-overlay" @click="showCreateSurveyModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>创建问卷调查</h3>
          <button @click="showCreateSurveyModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>问卷标题</label>
            <input v-model="newSurvey.title" type="text" placeholder="请输入问卷标题" />
          </div>
          <div class="form-group">
            <label>问卷描述</label>
            <textarea v-model="newSurvey.description" placeholder="请输入问卷描述"></textarea>
          </div>
          <div class="form-group">
            <label>发送对象</label>
            <select v-model="newSurvey.target">
              <option value="all">所有人</option>
              <option value="students">学生</option>
              <option value="teachers">老师</option>
            </select>
          </div>
          <div class="form-group">
            <label>问题列表</label>
            <div v-for="(question, index) in newSurvey.questions" :key="index" class="question-item">
              <div class="question-header">
                <span>问题 {{ index + 1 }}</span>
                <button @click="removeQuestion(index)" class="remove-btn">删除</button>
              </div>
              <input v-model="question.text" type="text" placeholder="请输入问题内容"
                :class="{ error: questionErrors[index] && questionErrors[index].text }" />
              <select v-model="question.type">
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
                <option value="text">文本题</option>
                <option value="rating">评分题</option>
              </select>
              <div v-if="question.type !== 'text' && question.type !== 'rating'" class="options">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                  <input v-model="question.options[optIndex]" type="text" placeholder="选项内容"
                    :class="{ error: questionErrors[index] && questionErrors[index].options && questionErrors[index].options[optIndex] }" />
                  <button @click="removeOption(index, optIndex)" class="remove-option">×</button>
                </div>
                <button @click="addOption(index)" class="add-option">添加选项</button>
              </div>
            </div>
            <button @click="addQuestion" class="add-question">添加问题</button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCreateSurveyModal = false" class="cancel-btn">取消</button>
          <button @click="createSurvey" class="submit-btn">创建问卷</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import http from '@/utils/http.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('course-approval')

// 课程审批相关数据
const approvalCourses = ref([])
const approvalCurrentPage = ref(1)
const approvalPageSize = ref(10)
const approvalTotal = ref(0)
const approvalTotalPages = ref(0)
const approvalFilter = ref('all')

// 问卷调查相关数据
const surveyList = ref([])
const showCreateSurveyModal = ref(false)
const newSurvey = ref({
  title: '',
  description: '',
  target: 'all',
  questions: []
})
const questionErrors = ref([])

// 切换标签页
const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'course-approval') {
    fetchApprovalCourses()
  } else if (tab === 'survey') {
    fetchSurveyList()
  }
}

// 获取待审批课程列表
const fetchApprovalCourses = async (page = 1) => {
  try {
    // 构建查询参数
    const params = {
      page: page,
      size: approvalPageSize.value
    }
    
    // 如果有状态过滤，添加到参数中
    if (approvalFilter.value !== 'all') {
      params.status = approvalFilter.value
    }
    
    const response = await http.get('/admin/courses/approval', { params })
    if (response.data.status === 200) {
      const data = response.data.data
      approvalCourses.value = data.records
      approvalTotal.value = data.total
      approvalTotalPages.value = data.pages
      approvalCurrentPage.value = data.current
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 监听过滤条件变化，重新获取数据
const watchApprovalFilter = () => {
  approvalCurrentPage.value = 1 // 重置到第一页
  fetchApprovalCourses(1)
}

// 过滤课程列表（前端过滤，用于显示）
const filteredApprovalCourses = computed(() => {
  return approvalCourses.value
})

// 审批课程
const approveCourse = async (courseId) => {
  try {
    await http.put(`/admin/courses/${courseId}/approve`)
    ElMessage.success('审批通过成功')
    fetchApprovalCourses(approvalCurrentPage.value)
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败，请重试')
  }
}

// 拒绝课程
const rejectCourse = async (courseId) => {
  try {
    await http.put(`/admin/courses/${courseId}/reject`)
    ElMessage.success('拒绝成功')
    fetchApprovalCourses(approvalCurrentPage.value)
  } catch (error) {
    console.error('拒绝失败:', error)
    ElMessage.error('拒绝失败，请重试')
  }
}

// 切换审批页面
const changeApprovalPage = (page) => {
  if (page >= 1 && page <= approvalTotalPages.value) {
    fetchApprovalCourses(page)
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 1: return 'success'
    case 2: return 'danger'
    case 3: return 'warning'
    case 4: return 'danger'
    default: return 'warning'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 1: return '已上架'
    case 2: return '已下架'
    case 3: return '待审核'
    case 4: return '已拒绝'
    default: return '未知'
  }
}

// 获取问卷调查列表
const fetchSurveyList = async () => {
  try {
    const response = await http.get('/surveys')
    if (response.data.status === 200) {
      surveyList.value = response.data.data.records.map(survey => ({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        target: getTargetFromRole(survey.targetRole),
        status: 'active', // 暂时都设为active，后续可以添加状态字段
        createdAt: new Date(survey.createdAt),
        participantCount: survey.participantCount || 0
      }))
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error)
  }
}

// 根据角色获取目标文本
const getTargetFromRole = (role) => {
  switch (role) {
    case 1: return 'students'
    case 2: return 'teachers'
    case 3: return 'all'
    default: return 'all'
  }
}

// 获取问卷状态样式
const getSurveyStatusClass = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'draft': return 'warning'
    case 'closed': return 'danger'
    default: return 'warning'
  }
}

// 获取问卷状态文本
const getSurveyStatusText = (status) => {
  switch (status) {
    case 'active': return '进行中'
    case 'draft': return '草稿'
    case 'closed': return '已结束'
    default: return '未知'
  }
}

// 获取目标对象文本
const getTargetText = (target) => {
  switch (target) {
    case 'all': return '所有人'
    case 'students': return '学生'
    case 'teachers': return '老师'
    default: return '未知'
  }
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 查看问卷结果
const viewSurveyResults = async (surveyId) => {
  try {
    const response = await http.get(`/surveys/${surveyId}/statistics`)
    if (response.data.status === 200) {
      const statistics = response.data.data
      console.log('问卷统计结果:', statistics)
      ElMessage.info(`问卷参与人数: ${statistics.participantCount}，详细统计见控制台`)
    } else {
      ElMessage.error('获取问卷结果失败：' + response.data.message)
    }
  } catch (error) {
    console.error('获取问卷结果失败:', error)
    ElMessage.error('获取问卷结果失败，请重试')
  }
}

// 编辑问卷
const editSurvey = (surveyId) => {
  alert(`编辑问卷 ${surveyId}`)
}

// 删除问卷
const deleteSurvey = async (surveyId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个问卷吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await http.delete(`/surveys/${surveyId}`)
    if (response.data.status === 200) {
      ElMessage.success('问卷删除成功')
      fetchSurveyList()
    } else {
      ElMessage.error('问卷删除失败：' + response.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问卷失败:', error)
      ElMessage.error('删除问卷失败，请重试')
    }
  }
}

// 添加问题
const addQuestion = () => {
  newSurvey.value.questions.push({
    text: '',
    type: 'single',
    options: ['', '']
  })
  questionErrors.value.push({ text: false, options: [false, false] })
}

// 删除问题
const removeQuestion = (index) => {
  newSurvey.value.questions.splice(index, 1)
  questionErrors.value.splice(index, 1)
}

// 添加选项
const addOption = (questionIndex) => {
  newSurvey.value.questions[questionIndex].options.push('')
  questionErrors.value[questionIndex].options.push(false)
}

// 删除选项
const removeOption = (questionIndex, optionIndex) => {
  newSurvey.value.questions[questionIndex].options.splice(optionIndex, 1)
  questionErrors.value[questionIndex].options.splice(optionIndex, 1)
}

// 创建问卷
const createSurvey = async () => {
  if (!newSurvey.value.title.trim()) {
    ElMessage.warning('请输入问卷标题')
    return
  }
  if (newSurvey.value.questions.length === 0) {
    ElMessage.warning('请至少添加一个问题')
    return
  }
  // 校验每个问题和选项
  let hasError = false
  questionErrors.value = newSurvey.value.questions.map(q => ({
    text: !q.text.trim(),
    options: (q.type !== 'text' && q.type !== 'rating') ? q.options.map(opt => !opt.trim()) : []
  }))
  for (let i = 0; i < questionErrors.value.length; i++) {
    if (questionErrors.value[i].text) hasError = true
    if (questionErrors.value[i].options.some(Boolean)) hasError = true
  }
  if (hasError) {
    ElMessage.warning('请完善所有问题内容和选项，红框处不能为空！')
    return
  }
  try {
    // 构建创建问卷的数据
    const createSurveyData = {
      title: newSurvey.value.title,
      description: newSurvey.value.description,
      targetRole: getRoleFromTarget(newSurvey.value.target),
      questions: newSurvey.value.questions.map(q => ({
        questionText: q.text,
        questionType: q.type,
        sortOrder: 0,
        options: q.type !== 'text' ? q.options.filter(opt => opt.trim()) : []
      }))
    }
    
    const response = await http.post('/surveys', createSurveyData)
    if (response.data.status === 200) {
      ElMessage.success('问卷创建成功')
      showCreateSurveyModal.value = false
      fetchSurveyList()
      
      // 重置表单
      newSurvey.value = {
        title: '',
        description: '',
        target: 'all',
        questions: []
      }
      questionErrors.value = []
    } else {
      ElMessage.error('问卷创建失败：' + response.data.message)
    }
  } catch (error) {
    console.error('创建问卷失败:', error)
    ElMessage.error('创建问卷失败，请重试')
  }
}

// 根据目标获取角色
const getRoleFromTarget = (target) => {
  switch (target) {
    case 'students': return 1
    case 'teachers': return 2
    case 'all': return 3
    default: return 3
  }
}

// 监听过滤条件变化
watch(approvalFilter, () => {
  watchApprovalFilter()
})

// 页面加载时获取数据
onMounted(() => {
  fetchApprovalCourses()
})
</script>

<style scoped>
.notice-page {
  background: var(--main-light);
  min-height: 100vh;
  padding: 32px 40px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.notice-tabs {
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

/* 课程审批样式 */
.approval-section {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.filter-select {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.95rem;
  color: var(--main-orange);
  background: #fff;
  outline: none;
  cursor: pointer;
}

.approval-table-wrapper {
  margin-top: 20px;
}

.approval-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.approval-table th {
  color: #888;
  font-weight: 500;
  text-align: left;
  padding-bottom: 8px;
}

.approval-table td {
  background: var(--main-light);
  border-radius: 10px;
  padding: 10px 8px;
  vertical-align: middle;
}

.approval-table .cover {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  margin-right: 8px;
  vertical-align: middle;
  object-fit: cover;
}

.approval-table .info {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}

.approval-table .name {
  font-weight: bold;
  color: #333;
}

.status {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: bold;
  display: inline-block;
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.action-btn.approve {
  background: var(--main-green);
  color: #fff;
}

.action-btn.approve:hover {
  background: #2d5a1f;
}

.action-btn.reject {
  background: #e74c3c;
  color: #fff;
}

.action-btn.reject:hover {
  background: #c0392b;
}

.action-btn.view {
  background: var(--main-blue);
  color: #fff;
}

.action-btn.edit {
  background: var(--main-orange);
  color: #fff;
}

.action-btn.delete {
  background: #e74c3c;
  color: #fff;
}

.no-action {
  color: #999;
  font-size: 0.9em;
}

/* 问卷调查样式 */
.survey-section {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 24px;
}

.create-btn {
  background: var(--main-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.2s;
}

.create-btn:hover {
  background: #2980b9;
}

.survey-list {
  margin-top: 20px;
}

.survey-card {
  background: var(--main-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #eee;
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.survey-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.survey-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
}

.survey-status.success {
  background: var(--main-green);
  color: #fff;
}

.survey-status.warning {
  background: var(--main-peach);
  color: #fff;
}

.survey-status.danger {
  background: #e74c3c;
  color: #fff;
}

.survey-info {
  margin-bottom: 16px;
}

.survey-desc {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.survey-meta {
  display: flex;
  gap: 20px;
  font-size: 0.9em;
  color: #888;
}

.survey-actions {
  display: flex;
  gap: 8px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--main-orange);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.question-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.remove-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8em;
}

.options {
  margin-top: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.option-item input {
  flex: 1;
}

.remove-option {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.8em;
}

.add-option,
.add-question {
  background: var(--main-blue);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
}

.submit-btn {
  background: var(--main-orange);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
}

/* 分页组件样式 */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: var(--main-orange);
  color: #fff;
  border-color: var(--main-orange);
}

.page-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
  min-width: 60px;
  text-align: center;
}

/* 新增：错误高亮样式 */
.error {
  border-color: #e74c3c !important;
  background: #fff0f0;
}
</style>
