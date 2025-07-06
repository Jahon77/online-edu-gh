<template>
  <div class="survey-container">
    <div class="survey-header">
      <h1>问卷填写</h1>
      <div class="user-info" v-if="userInfo">
        <span>欢迎，{{ userInfo.username }}</span>
        <span class="role-tag">{{ userInfo.role === 1 ? '学生' : '老师' }}</span>
      </div>
    </div>

    <!-- 问卷列表 -->
    <div class="survey-list" v-if="!currentSurvey">
      <div class="list-header">
        <h2>可填写的问卷</h2>
        <el-button type="primary" @click="refreshSurveys">刷新列表</el-button>
      </div>
      
      <el-table :data="availableSurveys" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="问卷标题" width="300">
          <template #default="scope">
            <div class="survey-title">
              <span>{{ scope.row.title }}</span>
              <el-tag v-if="scope.row.targetRole === 1" type="success" size="small">学生专用</el-tag>
              <el-tag v-else-if="scope.row.targetRole === 2" type="warning" size="small">老师专用</el-tag>
              <el-tag v-else type="info" size="small">全部用户</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="问卷描述" width="400"></el-table-column>
        <el-table-column prop="participantCount" label="参与人数" width="100" align="center"></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="startSurvey(scope.row)">
              开始填写
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 问卷填写界面 -->
    <div class="survey-form" v-if="currentSurvey">
      <div class="survey-form-header">
        <h2>{{ currentSurvey.title }}</h2>
        <p class="survey-description">{{ currentSurvey.description }}</p>
        <div class="progress-info">
          <span>进度：{{ currentQuestionIndex + 1 }} / {{ currentSurvey.questions.length }}</span>
          <el-progress 
            :percentage="((currentQuestionIndex + 1) / currentSurvey.questions.length) * 100" 
            :stroke-width="8"
          ></el-progress>
        </div>
      </div>

      <!-- 问题显示区域 -->
      <div class="question-container" v-if="currentQuestion">
        <div class="question-header">
          <h3>第 {{ currentQuestionIndex + 1 }} 题</h3>
          <el-tag :type="getQuestionTypeTag(currentQuestion.questionType)">
            {{ getQuestionTypeText(currentQuestion.questionType) }}
          </el-tag>
        </div>
        
        <div class="question-content">
          <p class="question-text">{{ currentQuestion.questionText }}</p>
          
          <!-- 单选题 -->
          <div v-if="currentQuestion.questionType === 'single'" class="options-container">
            <el-radio-group v-model="currentAnswer">
              <el-radio 
                v-for="option in currentQuestion.options" 
                :key="option.id" 
                :label="option.optionText"
                class="option-item"
              >
                {{ option.optionText }}
              </el-radio>
            </el-radio-group>
          </div>
          
          <!-- 多选题 -->
          <div v-else-if="currentQuestion.questionType === 'multiple'" class="options-container">
            <el-checkbox-group v-model="currentAnswer">
              <el-checkbox 
                v-for="option in currentQuestion.options" 
                :key="option.id" 
                :label="option.optionText"
                class="option-item"
              >
                {{ option.optionText }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          
          <!-- 评分题 -->
          <div v-else-if="currentQuestion.questionType === 'rating'" class="rating-container">
            <el-rate 
              v-model="currentAnswer" 
              :max="5" 
              show-text 
              :texts="['很差', '较差', '一般', '较好', '很好']"
            ></el-rate>
          </div>
          
          <!-- 文本题 -->
          <div v-else-if="currentQuestion.questionType === 'text'" class="text-container">
            <el-input 
              v-model="currentAnswer" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入您的答案..."
              maxlength="500"
              show-word-limit
            ></el-input>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="survey-actions">
        <el-button @click="previousQuestion" :disabled="currentQuestionIndex === 0">
          上一题
        </el-button>
        
        <el-button 
          type="primary" 
          @click="nextQuestion" 
          :disabled="!isAnswerValid"
        >
          {{ currentQuestionIndex === currentSurvey.questions.length - 1 ? '提交问卷' : '下一题' }}
        </el-button>
        
        <el-button @click="cancelSurvey">取消</el-button>
      </div>
    </div>

    <!-- 提交成功提示 -->
    <el-dialog v-model="submitSuccess" title="提交成功" width="400px" center>
      <div class="success-content">
        <el-icon class="success-icon" color="#67C23A"><CircleCheckFilled /></el-icon>
        <p>问卷提交成功！感谢您的参与。</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="submitSuccess = false; refreshSurveys()">
          返回列表
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import http from '@/utils/http'

export default {
  name: 'SurveyText',
  components: {
    CircleCheckFilled
  },
  setup() {
    const userInfo = ref(null)
    const availableSurveys = ref([])
    const currentSurvey = ref(null)
    const currentQuestionIndex = ref(0)
    const currentAnswer = ref('')
    const answers = ref({})
    const loading = ref(false)
    const submitSuccess = ref(false)

    // 获取当前问题
    const currentQuestion = computed(() => {
      if (!currentSurvey.value || !currentSurvey.value.questions) return null
      return currentSurvey.value.questions[currentQuestionIndex.value]
    })

    // 验证答案是否有效
    const isAnswerValid = computed(() => {
      if (!currentQuestion.value) return false
      
      const question = currentQuestion.value
      const answer = currentAnswer.value
      
      if (question.questionType === 'single') {
        return answer && answer.trim() !== ''
      } else if (question.questionType === 'multiple') {
        return Array.isArray(answer) && answer.length > 0
      } else if (question.questionType === 'rating') {
        return answer > 0
      } else if (question.questionType === 'text') {
        return answer && answer.trim() !== ''
      }
      
      return false
    })

    // 获取用户信息
    const getUserInfo = () => {
      const user = localStorage.getItem('user')
      if (user) {
        userInfo.value = JSON.parse(user)
      }
    }

    // 获取可用问卷列表
    const getAvailableSurveys = async () => {
      if (!userInfo.value) {
        ElMessage.error('请先登录')
        return
      }

      loading.value = true
      try {
        const response = await http.get('/surveys/available', {
          params: {
            userId: userInfo.value.userId,
            userRole: userInfo.value.role
          }
        })
        
        if (response.status === 200) {
          availableSurveys.value = response.data.data
        } else {
          ElMessage.error(response.message || '获取问卷列表失败')
        }
      } catch (error) {
        console.error('获取问卷列表失败:', error)
        ElMessage.error('获取问卷列表失败')
      } finally {
        loading.value = false
      }
    }

    // 开始填写问卷
    const startSurvey = async (survey) => {
      try {
        const response = await http.get(`/surveys/${survey.id}`)
        
        if (response.status === 200) {
          currentSurvey.value = response.data.data
          currentQuestionIndex.value = 0
          currentAnswer.value = ''
          answers.value = {}
          
          // 初始化答案
          currentSurvey.value.questions.forEach(question => {
            if (question.questionType === 'multiple') {
              answers.value[question.id] = []
            } else {
              answers.value[question.id] = ''
            }
          })
        } else {
          ElMessage.error(response.message || '获取问卷详情失败')
        }
      } catch (error) {
        console.error('获取问卷详情失败:', error)
        ElMessage.error('获取问卷详情失败')
      }
    }

    // 下一题
    const nextQuestion = async () => {
      if (!isAnswerValid.value) {
        ElMessage.warning('请先回答当前问题')
        return
      }

      // 保存当前答案
      answers.value[currentQuestion.value.id] = currentAnswer.value

      // 如果是最后一题，提交问卷
      if (currentQuestionIndex.value === currentSurvey.value.questions.length - 1) {
        await submitSurvey()
        return
      }

      // 移动到下一题
      currentQuestionIndex.value++
      currentAnswer.value = answers.value[currentQuestion.value.id] || ''
    }

    // 上一题
    const previousQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        // 保存当前答案
        answers.value[currentQuestion.value.id] = currentAnswer.value
        
        currentQuestionIndex.value--
        currentAnswer.value = answers.value[currentQuestion.value.id] || ''
      }
    }

    // 提交问卷
    const submitSurvey = async () => {
      try {
        // 保存最后一题的答案
        answers.value[currentQuestion.value.id] = currentAnswer.value

        // 转换为提交格式
        const submitAnswers = Object.keys(answers.value).map(questionId => ({
          questionId: parseInt(questionId),
          answerText: Array.isArray(answers.value[questionId]) 
            ? answers.value[questionId].join(',') 
            : answers.value[questionId].toString()
        }))

        const response = await http.post(`/surveys/${currentSurvey.value.id}/submit`, {
          surveyId: currentSurvey.value.id,
          userId: userInfo.value.userId,
          answers: submitAnswers
        })

        if (response.status === 200) {
          submitSuccess.value = true
          currentSurvey.value = null
          currentQuestionIndex.value = 0
          currentAnswer.value = ''
          answers.value = {}
        } else {
          ElMessage.error(response.message || '提交失败')
        }
      } catch (error) {
        console.error('提交问卷失败:', error)
        ElMessage.error('提交问卷失败')
      }
    }

    // 取消填写
    const cancelSurvey = async () => {
      try {
        await ElMessageBox.confirm('确定要取消填写吗？已填写的内容将丢失。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        currentSurvey.value = null
        currentQuestionIndex.value = 0
        currentAnswer.value = ''
        answers.value = {}
      } catch {
        // 用户取消
      }
    }

    // 刷新问卷列表
    const refreshSurveys = () => {
      getAvailableSurveys()
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }

    // 获取问题类型标签
    const getQuestionTypeTag = (type) => {
      const typeMap = {
        'single': 'primary',
        'multiple': 'success',
        'rating': 'warning',
        'text': 'info'
      }
      return typeMap[type] || 'info'
    }

    // 获取问题类型文本
    const getQuestionTypeText = (type) => {
      const typeMap = {
        'single': '单选题',
        'multiple': '多选题',
        'rating': '评分题',
        'text': '文本题'
      }
      return typeMap[type] || '未知类型'
    }

    onMounted(() => {
      getUserInfo()
      getAvailableSurveys()
    })

    return {
      userInfo,
      availableSurveys,
      currentSurvey,
      currentQuestionIndex,
      currentQuestion,
      currentAnswer,
      answers,
      loading,
      submitSuccess,
      isAnswerValid,
      getUserInfo,
      getAvailableSurveys,
      startSurvey,
      nextQuestion,
      previousQuestion,
      submitSurvey,
      cancelSurvey,
      refreshSurveys,
      formatDate,
      getQuestionTypeTag,
      getQuestionTypeText
    }
  }
}
</script>

<style scoped>
.survey-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.survey-header h1 {
  color: #303133;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-tag {
  background: #409eff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.survey-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  margin: 0;
  color: #303133;
}

.survey-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.survey-form {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.survey-form-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.survey-form-header h2 {
  color: #303133;
  margin-bottom: 10px;
}

.survey-description {
  color: #606266;
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.progress-info span {
  color: #909399;
  font-size: 14px;
}

.question-container {
  margin-bottom: 40px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-header h3 {
  margin: 0;
  color: #303133;
}

.question-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.question-text {
  font-size: 16px;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 500;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  margin-bottom: 10px;
}

.rating-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.text-container {
  width: 100%;
}

.survey-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.success-content p {
  color: #606266;
  font-size: 16px;
  margin: 0;
}
</style>