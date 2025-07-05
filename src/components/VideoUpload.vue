<template>
  <div class="video-upload-container">
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-video': videoUrl }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="!videoUrl && triggerFileInput()"
    >
      <!-- 显示已上传的视频 -->
      <video 
        v-if="videoUrl" 
        :src="videoUrl" 
        class="preview-video"
        controls
        preload="metadata"
      >
        您的浏览器不支持视频播放
      </video>
      
      <!-- 上传提示 -->
      <div v-else class="upload-hint">
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
        <p class="upload-text">点击或拖拽视频到此处</p>
        <p class="upload-subtext">支持 MP4、AVI、MOV 格式，最大 500MB</p>
      </div>
      
      <!-- 删除按钮 -->
      <button 
        v-if="videoUrl" 
        @click.stop="removeVideo" 
        class="remove-btn"
        type="button"
        title="删除视频"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <!-- 视频信息按钮 -->
      <div v-if="videoUrl" class="video-controls">
        <button 
          @click.stop="showVideoInfo = !showVideoInfo" 
          class="info-btn"
          type="button"
          :title="showVideoInfo ? '隐藏信息' : '显示信息'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 隐藏的文件输入框 -->
    <input
      ref="fileInput"
      type="file"
      accept="video/*"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <!-- 视频信息显示 -->
    <div v-if="videoUrl && videoInfo && showVideoInfo" class="video-info">
      <div class="info-row">
        <span>文件名: {{ videoInfo.name }}</span>
        <span>大小: {{ formatFileSize(videoInfo.size) }}</span>
      </div>
      <div class="info-row">
        <span>时长: {{ formatDuration(videoInfo.duration) }}</span>
        <span>格式: {{ videoInfo.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  maxSize: {
    type: Number,
    default: 500 * 1024 * 1024 // 500MB
  },
  acceptTypes: {
    type: Array,
    default: () => ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo']
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])

// 响应式数据
const fileInput = ref(null)
const videoUrl = ref('')
const isDragOver = ref(false)
const errorMessage = ref('')
const videoInfo = ref(null)
const showVideoInfo = ref(false)
const uploadedFile = ref(null)

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  videoUrl.value = newValue
}, { immediate: true })

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '未知'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// 获取视频信息
const getVideoInfo = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      resolve({
        name: file.name,
        size: file.size,
        duration: video.duration,
        type: file.type,
        width: video.videoWidth,
        height: video.videoHeight
      })
    }
    
    video.onerror = () => {
      resolve({
        name: file.name,
        size: file.size,
        duration: 0,
        type: file.type,
        width: 0,
        height: 0
      })
    }
    
    video.src = URL.createObjectURL(file)
  })
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽进入
const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

// 处理拖拽离开
const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

// 处理拖拽放置
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

// 处理文件
const processFile = async (file) => {
  // 清除之前的错误信息
  errorMessage.value = ''
  
  // 验证文件类型
  if (!props.acceptTypes.includes(file.type)) {
    errorMessage.value = '不支持的文件格式，请选择 MP4、AVI 或 MOV 格式的视频'
    emit('upload-error', '不支持的文件格式')
    return
  }
  
  // 验证文件大小
  if (file.size > props.maxSize) {
    errorMessage.value = `文件大小不能超过 ${props.maxSize / 1024 / 1024}MB`
    emit('upload-error', '文件大小超限')
    return
  }
  
  uploadedFile.value = file
  // 本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    videoUrl.value = e.target.result
    emit('update:modelValue', e.target.result)
    // 先触发一个基础的上传成功事件，时长信息会在后续的onloadedmetadata中补充
    emit('upload-success', { fileUrl: e.target.result, file: file })
  }
  reader.readAsDataURL(file)
  
  // 获取视频信息
  try {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      videoInfo.value = {
        name: file.name,
        size: file.size,
        duration: video.duration,
        type: file.type
      }
      // 在获取到视频信息后，重新触发upload-success事件，包含时长信息
      emit('upload-success', { 
        fileUrl: videoUrl.value, 
        file: file,
        info: {
          duration: video.duration,
          name: file.name,
          size: file.size,
          type: file.type
        }
      })
    }
    video.src = URL.createObjectURL(file)
  } catch (error) {
    console.error('获取视频信息失败:', error)
  }
}

// 删除视频
const removeVideo = () => {
  videoUrl.value = ''
  videoInfo.value = null
  showVideoInfo.value = false
  uploadedFile.value = null
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 获取上传的文件
const getFile = () => uploadedFile.value
defineExpose({ getFile })
</script>

<style scoped>
.video-upload-container {
  width: 100%;
}

.upload-area {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #6b7280;
  background-color: #f3f4f6;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: scale(1.02);
}

.upload-area.has-video {
  border-style: solid;
  border-color: #10b981;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.upload-hint {
  text-align: center;
  color: #6b7280;
}

.upload-icon {
  margin-bottom: 12px;
  color: #9ca3af;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #374151;
}

.upload-subtext {
  font-size: 14px;
  margin: 0;
  color: #9ca3af;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.remove-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.video-controls {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.info-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.info-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.error-message {
  margin-top: 8px;
  color: #ef4444;
  font-size: 14px;
  text-align: center;
}

.video-info {
  margin-top: 8px;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6b7280;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row span {
  flex: 1;
}

.info-row span:first-child {
  margin-right: 16px;
}

.reupload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-preview-container:hover .reupload-overlay {
  opacity: 1;
}
</style> 