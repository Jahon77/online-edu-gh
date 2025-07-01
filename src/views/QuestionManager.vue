<template>
    <div class="question-manager-page">
      <TeacherHeader />
  
      <div class="main-content">
        <div class="header-section">
          <h2>课程作业管理</h2>
          <div class="course-info">
            <span class="course-title">{{ courseTitle }}</span>
            <span class="course-id">课程ID: {{ courseId }}</span>
            <button @click="goBack" class="back-btn">
              <i class="fas fa-arrow-left"></i>
              返回课程编辑
            </button>
          </div>
        </div>
  
        <!-- 作业列表 -->
        <div class="question-list-container">
          <div class="list-header">
            <h3>作业列表</h3>
            <button @click="showAddQuestionModal = true" class="add-question-btn">
              <i class="fas fa-plus"></i>
              新增作业
            </button>
          </div>
  
          <div class="question-list">
            <div
              v-for="question in questionList"
              :key="question.id"
              class="question-card"
            >
              <div class="question-header">
                <div class="question-info">
                  <h4>{{ question.title }}</h4>
                  <span class="question-type">{{ getQuestionTypeText(question.type) }}</span>
                  <span class="question-score">分值: {{ question.score }}分</span>
                </div>
                <div class="question-actions">
                  <button @click="editQuestion(question)" class="edit-btn">
                    <i class="fas fa-edit"></i>
                    编辑
                  </button>
                  <button @click="deleteQuestion(question.id)" class="delete-btn">
                    <i class="fas fa-trash"></i>
                    删除
                  </button>
                </div>
              </div>
              <div class="question-content">
                <p>{{ question.content }}</p>
              </div>
              
              <!-- 作业附件显示 -->
              <div v-if="question.resourceUrls && getResourceUrlList(question.resourceUrls).length > 0" class="question-attachments">
                <h5>附件：</h5>
                <div class="attachment-list">
                  <div v-for="(url, index) in getResourceUrlList(question.resourceUrls)" :key="index" class="attachment-item">
                    <i :class="getFileIcon(getFileOriginalNameByUrl(url))"></i>
                    <div class="attachment-info">
                      <a :href="url" target="_blank" class="attachment-link">
                        {{ getFileOriginalNameByUrl(url) }}
                      </a>
                      <div class="attachment-actions">
                        <button @click="previewFile(url)" class="preview-btn" title="预览文件">
                          <i class="fas fa-eye"></i>
                        </button>
                        <a :href="url" download class="download-btn" title="下载文件">
                          <i class="fas fa-download"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="question-footer">
                <span class="create-time">创建时间: {{ formatDate(question.createTime) }}</span>
                <span class="answer-count">已答人数: {{ question.answerCount || 0 }}</span>
              </div>
            </div>
          </div>
  
          <!-- 空状态 -->
          <div v-if="questionList.length === 0" class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <p>暂无作业，点击上方按钮新增作业</p>
          </div>
        </div>
      </div>
  
      <!-- 新增/编辑作业模态框 -->
      <div v-if="showAddQuestionModal || showEditQuestionModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content question-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <i class="fas fa-edit"></i>
              <h3>{{ showEditQuestionModal ? '编辑作业' : '新增作业' }}</h3>
            </div>
            <button @click="closeModal" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
  
          <form @submit.prevent="saveQuestion" class="question-form">
            <!-- 基本信息区域 -->
            <div class="form-section">
              <div class="section-header">
                <i class="fas fa-info-circle"></i>
                <h4>基本信息</h4>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>作业标题：</label>
                  <input v-model="currentQuestion.title" required placeholder="请输入作业标题" class="form-input" />
                </div>
                
                <div class="form-group">
                  <label>作业类型：</label>
                  <select v-model="currentQuestion.type" required class="form-select">
                    <option value="1">单选题</option>
                    <option value="2">多选题</option>
                    <option value="3">填空题</option>
                    <option value="4">简答题</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group full-width">
                <label>分值：</label>
                <div class="score-input-wrapper">
                  <input type="number" v-model="currentQuestion.score" min="1" max="100" required class="form-input score-input" />
                  <span class="score-unit">分</span>
                </div>
              </div>
            </div>

            <!-- 作业内容区域 -->
            <div class="form-section">
              <div class="section-header">
                <i class="fas fa-file-alt"></i>
                <h4>作业内容</h4>
              </div>
              
              <div class="form-group full-width">
                <label>作业内容：</label>
                <textarea v-model="currentQuestion.content" rows="6" required placeholder="请输入作业内容" class="form-textarea"></textarea>
              </div>
              
              <div class="form-group full-width">
                <label>参考答案：</label>
                <textarea v-model="currentQuestion.answer" rows="4" placeholder="请输入参考答案（可选）" class="form-textarea"></textarea>
              </div>
            </div>

            <!-- 文件上传区域 -->
            <div class="form-section">
              <div class="section-header">
                <i class="fas fa-paperclip"></i>
                <h4>作业附件</h4>
              </div>
              
              <div class="file-upload-section">
                <!-- 文件上传 -->
                <div class="upload-area">
                  <input 
                    type="file" 
                    ref="fileInput" 
                    @change="handleFileUpload" 
                    multiple 
                    style="display: none;"
                  />
                  <div class="upload-zone" @click="$refs.fileInput.click()">
                    <div class="upload-icon">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-text">
                      <h5>选择文件上传</h5>
                      <p>支持多文件上传，文件将保存到您的文件库中</p>
                    </div>
                  </div>
                </div>

                <!-- 已上传文件列表 -->
                <div v-if="uploadedFiles.length > 0" class="uploaded-files">
                  <div class="files-header">
                    <i class="fas fa-check-circle"></i>
                    <h5>已上传文件</h5>
                    <span class="file-count">{{ uploadedFiles.length }}个文件</span>
                  </div>
                  <div class="file-list">
                    <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
                      <div class="file-icon">
                        <i :class="getFileIcon(file.originalFilename)"></i>
                      </div>
                      <div class="file-info">
                        <div class="file-name">{{ file.originalFilename }}</div>
                        <div class="file-meta">
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                          <span class="file-status">已上传</span>
                        </div>
                      </div>
                      <button type="button" @click="removeUploadedFile(file.id)" class="remove-file-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 从文件库选择 -->
                <div class="file-library-section">
                  <div class="library-header">
                    <i class="fas fa-folder-open"></i>
                    <h5>从文件库选择</h5>
                    <button type="button" @click="showFileLibrary = true" class="select-file-btn">
                      <i class="fas fa-plus"></i>
                      选择已有文件
                    </button>
                  </div>
                  
                  <!-- 已选择的文件 -->
                  <div v-if="selectedFiles.length > 0" class="selected-files">
                    <div class="files-header">
                      <i class="fas fa-link"></i>
                      <h6>已选择的文件</h6>
                      <span class="file-count">{{ selectedFiles.length }}个文件</span>
                    </div>
                    <div class="file-list">
                                          <div v-for="file in selectedFiles" :key="file.id" class="file-item">
                      <div class="file-icon">
                        <i :class="getFileIcon(file.originalFilename)"></i>
                      </div>
                      <div class="file-info">
                        <div class="file-name">{{ file.originalFilename }}</div>
                        <div class="file-meta">
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                          <span class="file-status">已选择</span>
                        </div>
                      </div>
                      <button type="button" @click="removeSelectedFile(file.id)" class="remove-file-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn">
                <i class="fas fa-times"></i>
                取消
              </button>
              <button type="submit" class="save-btn">
                <i class="fas fa-save"></i>
                {{ showEditQuestionModal ? '更新' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 文件库选择模态框 -->
      <div v-if="showFileLibrary" class="modal-overlay" @click="showFileLibrary = false">
        <div class="modal-content file-library-modal" @click.stop>
          <div class="modal-header">
            <h3>选择文件</h3>
            <button @click="showFileLibrary = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="file-library-content">
            <div class="file-search">
              <input 
                v-model="fileSearchKeyword" 
                placeholder="搜索文件名..." 
                class="search-input"
              />
            </div>
            
            <div class="file-grid">
              <div 
                v-for="file in filteredFileLibrary" 
                :key="file.id" 
                class="file-card"
                :class="{ 'selected': isFileSelected(file.id) }"
                @click="toggleFileSelection(file)"
              >
                <div class="file-icon">
                  <i :class="getFileIcon(file.originalFilename)"></i>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ file.originalFilename }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  <div class="file-date">{{ formatDate(file.uploadTime) }}</div>
                </div>
                <div class="file-checkbox">
                  <i v-if="isFileSelected(file.id)" class="fas fa-check"></i>
                </div>
              </div>
            </div>
            
            <div v-if="filteredFileLibrary.length === 0" class="empty-files">
              <i class="fas fa-folder-open"></i>
              <p>暂无文件</p>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showFileLibrary = false" class="cancel-btn">取消</button>
            <button @click="confirmFileSelection" class="confirm-btn">确认选择</button>
          </div>
        </div>
      </div>

      <!-- 文件上传进度弹窗 -->
      <div v-if="showUploadProgress" class="modal-overlay" @click.stop>
        <div class="modal-content upload-progress-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <i class="fas fa-cloud-upload-alt"></i>
              <h3>文件上傳中</h3>
            </div>
            <span class="progress-percentage">{{ Math.round(uploadProgress) }}%</span>
          </div>
          
          <div class="progress-content">
            <div class="upload-file-info">
              <div class="upload-file-name">
                <i class="fas fa-file"></i>
                <span>{{ currentUploadingFile ? currentUploadingFile.name : '准备上传...' }}</span>
              </div>
              <div class="upload-status">
                {{ currentFileIndex + 1 }} / {{ totalFilesToUpload }} 文件
              </div>
            </div>
            
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            
            <div class="upload-stats">
              <span class="upload-speed">{{ uploadSpeed }}</span>
              <span class="upload-remaining">剩余时间: {{ remainingTime }}</span>
            </div>
          </div>
          
          <div class="upload-actions">
            <button v-if="!uploadCompleted" @click="minimizeUpload" class="minimize-upload-btn">
              <i class="fas fa-minus"></i> 最小化
            </button>
            <button v-else @click="closeUploadProgress" class="close-upload-btn">
              <i class="fas fa-times"></i> 关闭
            </button>
            <button v-if="!uploadCompleted" @click="cancelUpload" class="cancel-upload-btn">
              <i class="fas fa-times-circle"></i> 取消上传
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import TeacherHeader from "src/components/commen/header/TeacherHeader.vue";
  
  export default {
    name: "QuestionManager",
    components: { TeacherHeader },
    data() {
      return {
        courseId: this.$route.params.courseId,
        courseTitle: "",
        questionList: [],
        showAddQuestionModal: false,
        showEditQuestionModal: false,
        showFileLibrary: false,
        currentQuestion: {
          id: null,
          courseId: null,
          title: "",
          type: "1",
          score: 10,
          content: "",
          answer: "",
          resourceUrls: ""
        },
        uploadedFiles: [], // 本次上传的文件
        selectedFiles: [], // 从文件库选择的文件
        fileLibrary: [], // 用户的所有文件
        fileSearchKeyword: "", // 文件搜索关键词
        tempSelectedFiles: [], // 临时选择的文件（用于文件库选择）
        originalResourceUrls: [], // 存储原始的资源URL列表
        
        // 上传进度相关
        showUploadProgress: false, // 是否显示进度条
        uploadProgress: 0, // 上传进度百分比
        uploadSpeed: '0 KB/s', // 上传速度
        remainingTime: '计算中...', // 剩余时间
        uploadStartTime: null, // 上传开始时间
        currentUploadingFile: null, // 当前正在上传的文件
        currentFileIndex: 0, // 当前上传文件的索引
        totalFilesToUpload: 0, // 总文件数
        uploadController: null, // 取消上传控制器
        xhr: null, // XMLHttpRequest 对象
        uploadCompleted: false, // 是否已完成（影响按钮显示）
      };
    },
    computed: {
      filteredFileLibrary() {
        if (!this.fileSearchKeyword) {
          return this.fileLibrary;
        }
        return this.fileLibrary.filter(file => 
          file.originalFilename.toLowerCase().includes(this.fileSearchKeyword.toLowerCase())
        );
      }
    },
    mounted() {
      this.fetchCourseInfo();
      this.fetchQuestionList();
      this.fetchFileLibrary();
    },
    methods: {
      fetchCourseInfo() {
        fetch(`http://localhost:8080/api/teacher/course/${this.courseId}`)
          .then((res) => res.json())
          .then((data) => {
            this.courseTitle = data.title;
          })
          .catch((error) => {
            console.error("获取课程信息失败:", error);
          });
      },
      fetchQuestionList() {
        fetch(`http://localhost:8080/api/question/course/${this.courseId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.status === 0) {
              this.questionList = data.data || [];
            } else {
              console.error("获取作业列表失败:", data.message);
            }
          })
          .catch((error) => {
            console.error("获取作业列表失败:", error);
          });
      },
      fetchFileLibrary() {
        // 假设当前用户ID为1，实际应该从登录状态获取
        const userId = 1;
        fetch(`http://localhost:8080/api/file/list/${userId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.status === 0) {
              this.fileLibrary = data.data || [];
            }
          })
          .catch((error) => {
            console.error("获取文件库失败:", error);
          });
      },
      getQuestionTypeText(type) {
        const typeMap = {
          "1": "單選題",
          "2": "多選題",
          "3": "填空題",
          "4": "簡答題"
        };
        return typeMap[type] || "未知類型";
      },
      formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("zh-TW");
      },
      formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      },
      getResourceUrlList(resourceUrls) {
        if (!resourceUrls) return [];
        try {
          return JSON.parse(resourceUrls);
        } catch (e) {
          return [];
        }
      },
      getFileOriginalNameByUrl(url) {
        if (!url) return '';
        
        console.log('getFileOriginalNameByUrl 調用，URL:', url);
        console.log('uploadedFiles:', this.uploadedFiles);
        console.log('selectedFiles:', this.selectedFiles);
        console.log('fileLibrary:', this.fileLibrary);
        
        // 先从uploadedFiles中查找（新上传的文件）
        let fileRecord = this.uploadedFiles.find(file => file.fileUrl === url);
        if (fileRecord) {
          console.log('在uploadedFiles中找到文件:', fileRecord.originalFilename);
          return fileRecord.originalFilename;
        }
        
        // 再从selectedFiles中查找（从文件库选择的文件）
        fileRecord = this.selectedFiles.find(file => file.fileUrl === url);
        if (fileRecord) {
          console.log('在selectedFiles中找到文件:', fileRecord.originalFilename);
          return fileRecord.originalFilename;
        }
        
        // 從fileLibrary中查找（精確匹配）
        fileRecord = this.fileLibrary.find(file => file.fileUrl === url);
        if (fileRecord) {
          console.log('在fileLibrary中找到文件（精確匹配）:', fileRecord.originalFilename);
          return fileRecord.originalFilename;
        }
        
        // 再用結尾模糊比對（從URL中提取文件名）
        const urlName = url.split('/').pop();
        if (urlName) {
          console.log('嘗試模糊匹配，URL文件名:', urlName);
          // 先嘗試精確匹配文件名
          fileRecord = this.fileLibrary.find(file => {
            if (!file.fileUrl) return false;
            const fileUrlName = file.fileUrl.split('/').pop();
            return fileUrlName === urlName;
          });
          if (fileRecord) {
            console.log('在fileLibrary中找到文件（模糊匹配）:', fileRecord.originalFilename);
            return fileRecord.originalFilename;
          }
        }
        
        // 如果都找不到，返回URL的最後一部分作為文件名
        console.log('未找到文件記錄，返回URL文件名:', urlName || url);
        return urlName || url;
      },
      handleFileUpload(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        // 初始化上传状态
        this.showUploadProgress = true;
        this.uploadProgress = 0;
        this.uploadSpeed = '0 KB/s';
        this.remainingTime = '计算中...';
        this.uploadStartTime = Date.now();
        this.currentFileIndex = 0;
        this.totalFilesToUpload = files.length;
        this.currentUploadingFile = files[0];
        this.uploadCompleted = false;

        // 创建FormData对象
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append('file', files[i]);
        }
        formData.append('userId', 1); // 假设当前用户ID为1

        // 使用XMLHttpRequest实现进度监控和取消功能
        this.xhr = new XMLHttpRequest();
        
        // 上传进度事件
        this.xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            // 计算上传进度
            const progress = (e.loaded / e.total) * 100;
            this.uploadProgress = progress;
            
            // 计算上传速度
            const elapsedTime = (Date.now() - this.uploadStartTime) / 1000; // 秒
            const uploadedBytes = e.loaded;
            const bytesPerSecond = uploadedBytes / elapsedTime;
            this.uploadSpeed = this.formatSpeed(bytesPerSecond);
            
            // 估算剩余时间
            const remainingBytes = e.total - e.loaded;
            const remainingTimeInSeconds = bytesPerSecond > 0 ? remainingBytes / bytesPerSecond : 0;
            this.remainingTime = this.formatTime(remainingTimeInSeconds);
          }
        });
        
        // 上傳完成事件
        this.xhr.addEventListener('load', () => {
          if (this.xhr.status === 200) {
            try {
              const response = JSON.parse(this.xhr.responseText);
              console.log('文件上傳響應:', response);
              if (response.status === 0) {
                this.uploadedFiles.push(...response.data);
                console.log('文件上传成功，uploadedFiles更新为:', this.uploadedFiles);
                this.uploadCompleted = true; // 上傳完成
                // 不再自动隐藏窗口，也不再 alert
              } else {
                // 失败时自动关闭窗口
                console.error('文件上传失败:', response.message);
                this.showUploadProgress = false;
                this.uploadCompleted = false;
                // 可选：显示错误提示
              }
            } catch (error) {
              console.error('解析上传响应失败:', error);
              this.showUploadProgress = false;
              this.uploadCompleted = false;
            }
          } else {
            console.error('上传请求失败，状态码:', this.xhr.status);
            this.showUploadProgress = false;
            this.uploadCompleted = false;
          }
        });
        
        // 上傳錯誤事件
        this.xhr.addEventListener('error', () => {
          console.error('上傳出錯');
          alert('网络错误，文件上传失败');
          this.showUploadProgress = false;
          this.uploadCompleted = false;
        });
        
        // 上傳中止事件
        this.xhr.addEventListener('abort', () => {
          console.log('上傳已取消');
          alert('文件上傳已取消');
          this.showUploadProgress = false;
          this.uploadCompleted = false;
        });
        
        // 發送請求
        this.xhr.open('POST', 'http://localhost:8080/api/file/upload');
        this.xhr.send(formData);

        // 清空input
        event.target.value = '';
      },
      
      // 取消上傳
      cancelUpload() {
        if (this.xhr && this.xhr.readyState !== 4) {
          this.xhr.abort();
        }
      },
      
              // 格式化上传速度
      formatSpeed(bytesPerSecond) {
        if (bytesPerSecond === 0) return '0 KB/s';
        
        const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
        let speed = bytesPerSecond;
        let unitIndex = 0;
        
        while (speed > 1024 && unitIndex < units.length - 1) {
          speed /= 1024;
          unitIndex++;
        }
        
        return `${speed.toFixed(2)} ${units[unitIndex]}`;
      },
      
              // 格式化剩余时间
      formatTime(seconds) {
        if (!seconds || seconds === Infinity || isNaN(seconds)) {
          return '计算中...';
        }
        
        seconds = Math.ceil(seconds);
        
        if (seconds < 60) {
          return `${seconds} 秒`;
        } else if (seconds < 3600) {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes} 分 ${remainingSeconds} 秒`;
        } else {
          const hours = Math.floor(seconds / 3600);
          const remainingMinutes = Math.floor((seconds % 3600) / 60);
          return `${hours} 小時 ${remainingMinutes} 分`;
        }
      },
      editQuestion(question) {
        this.currentQuestion = { ...question };
        // 解析已有的文件URL並保存到originalResourceUrls
        if (question.resourceUrls) {
          const urls = this.getResourceUrlList(question.resourceUrls);
          this.originalResourceUrls = [...urls]; // 保存原始URL列表
          // 從文件庫中找到對應的文件記錄
          this.selectedFiles = this.fileLibrary.filter(file => 
            urls.includes(file.fileUrl)
          );
          // 不要清空本次上传的文件，保留新上传的文件
          // this.uploadedFiles = [];
        } else {
          this.originalResourceUrls = [];
          this.selectedFiles = [];
        }
        
        console.log('编辑作业时的数据：', {
          question: question,
          originalResourceUrls: this.originalResourceUrls,
          selectedFiles: this.selectedFiles,
          uploadedFiles: this.uploadedFiles,
          fileLibrary: this.fileLibrary
        });
        
        this.showEditQuestionModal = true;
      },
      deleteQuestion(questionId) {
        if (confirm("确定要删除这个作业吗？")) {
          fetch(`http://localhost:8080/api/question/${questionId}`, {
            method: "DELETE"
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.status === 0) {
                alert("作业删除成功！");
                this.fetchQuestionList();
              } else {
                alert("删除作业失败：" + data.message);
              }
            })
            .catch((error) => {
              console.error("删除作业失败:", error);
              alert("删除作业失败，请重试");
            });
        }
      },
      saveQuestion() {
        // 合併所有文件的URL
        let allFileUrls = [];
        
        // 收集所有文件的URL
        const uploadedUrls = this.uploadedFiles.map(file => file.fileUrl);
        const selectedUrls = this.selectedFiles.map(file => file.fileUrl);
        
        console.log('保存作业时的数据：', {
          showEditQuestionModal: this.showEditQuestionModal,
          originalResourceUrls: this.originalResourceUrls,
          uploadedFiles: this.uploadedFiles,
          selectedFiles: this.selectedFiles,
          uploadedUrls: uploadedUrls,
          selectedUrls: selectedUrls
        });
        
        console.log('uploadedFiles详细信息：', this.uploadedFiles.map(f => ({ id: f.id, name: f.originalFilename, url: f.fileUrl })));
        console.log('selectedFiles详细信息：', this.selectedFiles.map(f => ({ id: f.id, name: f.originalFilename, url: f.fileUrl })));
        
        if (this.showEditQuestionModal) {
          // 編輯模式：合併原有URL和新URL
          const oldUrls = this.originalResourceUrls || [];
          allFileUrls = [...new Set([...oldUrls, ...uploadedUrls, ...selectedUrls])];
        } else {
          // 新增模式：只包含新上傳和選擇的URL
          allFileUrls = [...new Set([...uploadedUrls, ...selectedUrls])];
        }
        
        console.log('最终的resourceUrls:', allFileUrls);
        console.log('JSON.stringify后的resourceUrls:', JSON.stringify(allFileUrls));
        
        // 发送时一定要是 JSON 字符串
        const questionData = {
          ...this.currentQuestion,
          courseId: this.courseId,
          resourceUrls: JSON.stringify(allFileUrls)
        };
        
        console.log('发送给后端的完整数据:', questionData);
        console.log('发送给后端的JSON字符串:', JSON.stringify(questionData));

        const url = this.showEditQuestionModal
          ? `http://localhost:8080/api/question/update`
          : "http://localhost:8080/api/question/create";
        
        const method = this.showEditQuestionModal ? "PUT" : "POST";

        fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData)
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === 0) {
              alert(this.showEditQuestionModal ? "作业更新成功！" : "作业创建成功！");
              this.closeModal();
              this.fetchQuestionList();
            } else {
              alert("保存作业失败：" + data.message);
            }
          })
          .catch((error) => {
            console.error("保存作业失败:", error);
            alert("保存作业失败，请重试");
          });
      },
      closeModal() {
        this.showAddQuestionModal = false;
        this.showEditQuestionModal = false;
        this.currentQuestion = {
          id: null,
          courseId: null,
          title: "",
          type: "1",
          score: 10,
          content: "",
          answer: "",
          resourceUrls: ""
        };
        // 重置所有文件相關狀態
        this.uploadedFiles = [];
        this.selectedFiles = [];
        this.tempSelectedFiles = [];
        this.fileSearchKeyword = "";
        this.originalResourceUrls = []; // 重置原始URL列表
        
        console.log('關閉模態框，重置狀態完成');
      },
      goBack() {
        // 返回課程編輯頁面
        this.$router.push(`/teacher/edit-course/${this.courseId}`);
      },
      previewFile(url) {
        // 實現文件預覽功能
        const fileRecord = this.fileLibrary.find(file => file.fileUrl === url);
        if (fileRecord) {
          const fileName = fileRecord.originalFilename;
          const fileExtension = fileName.split('.').pop().toLowerCase();
          
          // 根據文件類型決定預覽方式
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
            // 圖片文件直接在新窗口打開
            window.open(url, '_blank');
          } else if (['pdf'].includes(fileExtension)) {
            // PDF文件在新窗口打開
            window.open(url, '_blank');
          } else if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(fileExtension)) {
            // 文本文件在新窗口打開
            window.open(url, '_blank');
          } else {
            // 其他文件類型提示下載
            alert(`文件 "${fileName}" 不支持在線預覽，請下載後查看。`);
          }
        } else {
          // 如果找不到文件記錄，直接在新窗口打開
          window.open(url, '_blank');
        }
      },
      getFileIcon(filename) {
        if (!filename) return 'fas fa-file';
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'bmp':
          case 'webp':
            return 'fas fa-file-image';
          case 'pdf':
            return 'fas fa-file-pdf';
          case 'doc':
          case 'docx':
            return 'fas fa-file-word';
          case 'xls':
          case 'xlsx':
            return 'fas fa-file-excel';
          case 'ppt':
          case 'pptx':
            return 'fas fa-file-powerpoint';
          case 'zip':
          case 'rar':
          case '7z':
            return 'fas fa-file-archive';
          case 'txt':
          case 'md':
          case 'json':
          case 'xml':
          case 'html':
          case 'css':
          case 'js':
          case 'java':
          case 'py':
          case 'cpp':
          case 'c':
            return 'fas fa-file-code';
          case 'mp3':
          case 'wav':
          case 'flac':
            return 'fas fa-file-audio';
          case 'mp4':
          case 'avi':
          case 'mov':
          case 'wmv':
            return 'fas fa-file-video';
          default:
            return 'fas fa-file';
        }
      },
      removeUploadedFile(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileId);
      },
      removeSelectedFile(fileId) {
        this.selectedFiles = this.selectedFiles.filter(file => file.id !== fileId);
      },
      toggleFileSelection(file) {
        const index = this.tempSelectedFiles.findIndex(f => f.id === file.id);
        if (index > -1) {
          this.tempSelectedFiles.splice(index, 1);
          console.log('取消選擇文件:', file.originalFilename);
        } else {
          this.tempSelectedFiles.push(file);
          console.log('選擇文件:', file.originalFilename);
        }
        console.log('临时选择的文件:', this.tempSelectedFiles);
      },
      isFileSelected(fileId) {
        return this.tempSelectedFiles.some(file => file.id === fileId);
      },
      confirmFileSelection() {
        this.selectedFiles = [...this.tempSelectedFiles];
        console.log('确认文件选择，selectedFiles更新为:', this.selectedFiles);
        this.showFileLibrary = false;
        this.tempSelectedFiles = [];
      },
      minimizeUpload() {
        this.showUploadProgress = false;
      },
      closeUploadProgress() {
        this.showUploadProgress = false;
        this.uploadCompleted = false;
      },
    }
  };
  </script>
  
  <style scoped>
  .question-manager-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #F9F2EF;
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }
  
  .main-content {
    width: 100%;
    max-width: 1200px;
    margin-top: 2rem;
    padding: 0 2rem;
  }
  
  .header-section {
    background: #f8faff;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .header-section h2 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.8rem;
    font-weight: 600;
  }
  
  .course-info {
    display: flex;
    gap: 2rem;
    align-items: center;
  }
  
  .course-title {
    font-size: 1.2rem;
    color: #5a8dee;
    font-weight: 500;
  }
  
  .course-id {
    color: #666;
    font-size: 0.9rem;
  }
  
  .back-btn {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .back-btn:hover {
    background: #e0e0e0;
    color: #333;
    transform: translateY(-1px);
  }
  
  .question-list-container {
    background: #f8faff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 1rem;
  }
  
  .list-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.4rem;
    font-weight: 600;
  }
  
  .add-question-btn {
    background: #67c23a;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .add-question-btn:hover {
    background: #5daf34;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  }
  
  .question-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .question-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .question-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .question-info h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .question-type {
    background: #e1f3d8;
    color: #67c23a;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
  
  .question-score {
    color: #f56c6c;
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  .question-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .edit-btn, .delete-btn {
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 0.3s ease;
  }
  
  .edit-btn {
    background: #409eff;
    color: white;
  }
  
  .edit-btn:hover {
    background: #337ecc;
  }
  
  .delete-btn {
    background: #f56c6c;
    color: white;
  }
  
  .delete-btn:hover {
    background: #e74c3c;
  }
  
  .question-content {
    margin-bottom: 1rem;
  }
  
  .question-content p {
    margin: 0;
    color: #666;
    line-height: 1.6;
  }

  .question-attachments {
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .question-attachments h5 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }

  .attachment-item:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }

  .attachment-item i {
    color: #667eea;
    font-size: 1rem;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .attachment-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .attachment-link {
    color: #409eff;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    flex: 1;
  }

  .attachment-link:hover {
    text-decoration: underline;
    color: #337ecc;
  }

  .attachment-actions {
    display: flex;
    gap: 0.5rem;
  }

  .preview-btn, .download-btn {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    font-size: 0.8rem;
    color: #666;
    transition: all 0.3s ease;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-btn:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
  }

  .download-btn:hover {
    background: #67c23a;
    color: white;
    border-color: #67c23a;
    transform: translateY(-1px);
  }
  
  .question-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #999;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #999;
  }
  
  .empty-state i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .empty-state p {
    margin: 0;
    font-size: 1.1rem;
  }
  
  /* 模態框樣式 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  
  .modal-content {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
  }

  .question-modal {
    max-width: 900px;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .file-library-modal {
    max-width: 800px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1.5rem 2rem;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px 20px 0 0;
  }

  .modal-title {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .modal-title i {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .modal-header h3 {
    margin: 0;
    color: white;
    font-size: 1.6rem;
    font-weight: 600;
  }
  
  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: white;
    padding: 0.8rem;
    border-radius: 50%;
    transition: all 0.3s ease;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
  
  .question-form {
    padding: 2rem;
  }
  
  .form-section {
    margin-bottom: 2.5rem;
    background: #fafbfc;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e8eaed;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid #e8eaed;
  }
  
  .section-header i {
    color: #667eea;
    font-size: 1.3rem;
  }
  
  .section-header h4 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.8rem;
    color: #2c3e50;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e8eaed;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: white;
    color: #2c3e50;
    box-sizing: border-box;
  }
  
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
  }

  .score-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .score-input {
    padding-right: 3rem;
  }

  .score-unit {
    position: absolute;
    right: 1rem;
    color: #667eea;
    font-weight: 600;
    font-size: 0.9rem;
    pointer-events: none;
  }

  /* 文件上傳區域樣式 */
  .file-upload-section {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    border: 1px solid #e8eaed;
  }

  .upload-area {
    margin-bottom: 2rem;
  }

  .upload-zone {
    width: 100%;
    height: 120px;
    border: 3px dashed #667eea;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  }

  .upload-zone:hover {
    border-color: #5a6fd8;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  }

  .upload-icon {
    font-size: 2.5rem;
    color: #667eea;
    margin-bottom: 0.5rem;
  }

  .upload-text h5 {
    margin: 0 0 0.3rem 0;
    color: #2c3e50;
    font-size: 1rem;
    font-weight: 600;
  }

  .upload-text p {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.85rem;
  }

  .uploaded-files,
  .file-library-section {
    margin-top: 2rem;
  }

  .files-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
    padding: 0.8rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #67c23a;
  }

  .files-header i {
    color: #67c23a;
    font-size: 1.1rem;
  }

  .files-header h5,
  .files-header h6 {
    margin: 0;
    color: #2c3e50;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .file-count {
    background: #67c23a;
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: auto;
  }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 10px;
    border: 1px solid #e8eaed;
    transition: all 0.3s ease;
  }

  .file-item:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  .file-icon {
    text-align: center;
    margin-bottom: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
    border-radius: 12px;
    border: 2px solid #e8eaed;
  }

  .file-icon i {
    font-size: 2.5rem;
    color: #667eea;
    transition: all 0.3s ease;
  }

  .file-card:hover .file-icon {
    border-color: #667eea;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
  }

  .file-card:hover .file-icon i {
    transform: scale(1.1);
  }

  .file-info {
    flex: 1;
  }

  .file-name {
    color: #2c3e50;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.3rem;
  }

  .file-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .file-size {
    color: #7f8c8d;
    font-size: 0.8rem;
  }

  .file-status {
    background: #e1f3d8;
    color: #67c23a;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .remove-file-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .remove-file-btn:hover {
    background: #ff5252;
    transform: scale(1.1);
  }

  .library-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
    padding: 0.8rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;
  }

  .library-header i {
    color: #667eea;
    font-size: 1.1rem;
  }

  .library-header h5 {
    margin: 0;
    color: #2c3e50;
    font-size: 0.95rem;
    font-weight: 600;
    flex: 1;
  }

  .select-file-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    font-weight: 600;
  }

  .select-file-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  .selected-files {
    margin-top: 1.5rem;
  }

  .selected-files .files-header {
    border-left-color: #667eea;
  }

  .selected-files .files-header i {
    color: #667eea;
  }

  .selected-files .file-status {
    background: #e3f2fd;
    color: #667eea;
  }

  /* 文件庫模態框樣式 */
  .file-library-content {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .file-search {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    padding: 1rem 1.5rem;
    border: 2px solid #e8eaed;
    border-radius: 12px;
    font-size: 1rem;
    background: white;
    color: #2c3e50;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .file-card {
    border: 2px solid #e8eaed;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    background: white;
  }

  .file-card:hover {
    border-color: #667eea;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  }

  .file-card.selected {
    border-color: #667eea;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  }

  .file-card .file-icon {
    text-align: center;
    margin-bottom: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
    border-radius: 12px;
    border: 2px solid #e8eaed;
  }

  .file-card .file-icon i {
    font-size: 2.5rem;
    color: #667eea;
    transition: all 0.3s ease;
  }
  
  /* 上傳進度條樣式 */
  .upload-progress-modal {
    max-width: 550px;
  }
  
  .upload-progress-modal .modal-header {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  .progress-percentage {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
  }
  
  .progress-content {
    padding: 2rem;
    background: white;
  }
  
  .upload-file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .upload-file-name {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1rem;
    color: #2c3e50;
    max-width: 70%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  
  .upload-file-name i {
    color: #4facfe;
    font-size: 1.2rem;
  }
  
  .upload-status {
    background: #e1f3fd;
    color: #4facfe;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .progress-bar-container {
    height: 12px;
    width: 100%;
    background: #f0f4f7;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 1rem;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .progress-bar {
    height: 100%;
    background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
    border-radius: 20px;
    transition: width 0.3s ease-in-out;
  }
  
  .upload-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #7f8c8d;
    margin-bottom: 1.5rem;
  }
  
  .upload-speed {
    font-weight: 600;
    color: #2c3e50;
  }
  
  .upload-actions {
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: center;
    border-top: 1px solid #f0f4f7;
    gap: 1rem;
  }
  
  .minimize-upload-btn {
    background: #e0e0e0;
    color: #333;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .minimize-upload-btn:hover {
    background: #bdbdbd;
    color: #222;
  }
  
  .close-upload-btn {
    background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .close-upload-btn:hover {
    background: #5daf34;
    color: #fff;
  }
  
  .cancel-upload-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .cancel-upload-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
  
  /* 響應式樣式調整 */
  @media (max-width: 768px) {
    .modal-content {
      width: 95%;
      margin: 1rem;
    }
    
    .form-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .file-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    .form-actions {
      flex-direction: column;
      gap: 1rem;
    }

    .attachment-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .attachment-actions {
      align-self: flex-end;
    }

    .main-content {
      padding: 0 1rem;
    }

    .header-section,
    .question-list-container {
      padding: 1.5rem;
    }

    .course-info {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .list-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .upload-progress-modal {
      width: 90%;
    }
    
    .upload-file-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .upload-file-name {
      max-width: 100%;
    }
    
    .progress-percentage {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .modal-content {
      width: 98%;
      margin: 0.5rem;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
    }

    .question-form {
      padding: 1.5rem;
    }

    .form-section {
      padding: 1rem;
    }

    .file-card {
      padding: 1rem;
    }

    .file-grid {
      grid-template-columns: 1fr;
    }

    .cancel-btn, .save-btn {
      width: 100%;
      justify-content: center;
    }

    .attachment-actions {
      flex-direction: column;
      gap: 0.3rem;
    }

    .preview-btn, .download-btn {
      padding: 0.3rem 0.5rem;
      font-size: 0.7rem;
    }
  }

  .file-card .file-info {
    text-align: center;
  }

  .file-card .file-info .file-name {
    font-size: 0.9rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    word-break: break-all;
    font-weight: 500;
  }

  .file-card .file-info .file-size,
  .file-card .file-info .file-date {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-bottom: 0.2rem;
  }

  .file-card .file-checkbox {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .empty-files {
    text-align: center;
    padding: 4rem 2rem;
    color: #7f8c8d;
  }

  .empty-files i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
    color: #667eea;
  }

  .empty-files p {
    margin: 0;
    font-size: 1.1rem;
    color: #2c3e50;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e8eaed;
    background: #fafbfc;
    border-radius: 0 0 20px 20px;
  }

  .confirm-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    font-weight: 600;
  }

  .confirm-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #e8eaed;
  }

  .cancel-btn, .save-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    font-weight: 600;
  }

  .cancel-btn {
    background: #f8f9fa;
    color: #6c757d;
    border: 2px solid #e8eaed;
  }

  .cancel-btn:hover {
    background: #e9ecef;
    color: #495057;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .save-btn {
    background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
    color: white;
  }

  .save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(103, 194, 58, 0.3);
  }
  </style>