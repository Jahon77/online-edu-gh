<template>
  <div class="image-upload-container">
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-image': imageUrl }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="!imageUrl && triggerFileInput()"
    >
      <!-- 显示已上传的图片 -->
      <img 
        v-if="imageUrl" 
        :src="imageUrl" 
        alt="课程封面" 
        class="preview-image"
        :class="`preview-mode-${previewMode}`"
      />
      
      <!-- 上传提示 -->
      <div v-else class="upload-hint">
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <p class="upload-text">点击或拖拽图片到此处</p>
        <p class="upload-subtext">支持 JPG、PNG、GIF 格式，最大 5MB</p>
      </div>
      
      <!-- 删除按钮 -->
      <button 
        v-if="imageUrl" 
        @click.stop="removeImage" 
        class="remove-btn"
        type="button"
        title="删除图片"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <!-- 预览模式切换按钮 -->
      <div v-if="imageUrl" class="preview-controls">
        <button 
          @click.stop="switchPreviewMode" 
          class="preview-mode-btn"
          type="button"
          :title="`当前模式: ${previewModeText}`"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
        
        <!-- 放大预览按钮 -->
        <button 
          @click.stop="openPreviewModal" 
          class="preview-mode-btn zoom-btn"
          type="button"
          title="放大预览"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 隐藏的文件输入框 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <!-- 图片信息显示 -->
    <div v-if="imageUrl && imageInfo" class="image-info">
      <span>尺寸: {{ imageInfo.width }} × {{ imageInfo.height }}</span>
      <span>大小: {{ formatFileSize(imageInfo.size) }}</span>
    </div>
    
    <!-- 放大预览模态框 -->
    <div v-if="showPreviewModal" class="preview-modal-overlay" @click="closePreviewModal">
      <div class="preview-modal" @click.stop>
        <div class="preview-modal-header">
          <h3>图片预览</h3>
          <button @click="closePreviewModal" class="close-btn" title="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="preview-modal-content">
          <img 
            :src="imageUrl" 
            alt="课程封面预览" 
            class="preview-modal-image"
            :style="{
              transform: `scale(${zoomLevel}) translate(${panState.x / zoomLevel}px, ${panState.y / zoomLevel}px)`
            }"
            @wheel="handleZoom"
            @mousedown="startPan"
            @mousemove="handlePan"
            @mouseup="stopPan"
            @mouseleave="stopPan"
          />
        </div>
        <div class="preview-modal-footer">
          <div class="zoom-controls">
            <button @click="zoomOut" class="zoom-btn" title="缩小">-</button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button @click="zoomIn" class="zoom-btn" title="放大">+</button>
            <button @click="resetZoom" class="reset-btn" title="重置">重置</button>
          </div>
          <div class="image-details">
            <span>原始尺寸: {{ imageInfo?.width }} × {{ imageInfo?.height }}</span>
            <span>文件大小: {{ imageInfo ? formatFileSize(imageInfo.size) : '' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  acceptTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/gif']
  },
  defaultPreviewMode: {
    type: String,
    default: 'contain' // 'cover', 'contain', 'fill'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])

// 响应式数据
const fileInput = ref(null)
const imageUrl = ref('')
const isDragOver = ref(false)
const errorMessage = ref('')
const previewMode = ref(props.defaultPreviewMode)
const imageInfo = ref(null)
const showPreviewModal = ref(false)
const zoomLevel = ref(1)
const panState = ref({ x: 0, y: 0, startX: 0, startY: 0, isPanning: false })
const uploadedFile = ref(null)

// 计算属性
const previewModeText = computed(() => {
  const modeMap = {
    'cover': '覆盖模式',
    'contain': '适应模式', 
    'fill': '填充模式'
  }
  return modeMap[previewMode.value] || '适应模式'
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  imageUrl.value = newValue
}, { immediate: true })

// 切换预览模式
const switchPreviewMode = () => {
  const modes = ['cover', 'contain', 'fill']
  const currentIndex = modes.indexOf(previewMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  previewMode.value = modes[nextIndex]
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取图片信息
const getImageInfo = (file) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size
      })
    }
    img.src = URL.createObjectURL(file)
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
    errorMessage.value = '不支持的文件格式，请选择 JPG、PNG 或 GIF 格式的图片'
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

  // 预览显示（使用本地URL，不上传到服务器）
  const reader = new FileReader()
  reader.onload = async (e) => {
    imageUrl.value = e.target.result
    // 不触发上传事件，只用于本地预览
    try {
      imageInfo.value = await getImageInfo(file)
    } catch (error) {
      console.error('获取图片信息失败:', error)
    }
    emit('upload-success', { file, fileUrl: imageUrl.value })
  }
  reader.readAsDataURL(file)
}

// 删除图片
const removeImage = () => {
  imageUrl.value = ''
  imageInfo.value = null
  uploadedFile.value = null
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 打开放大预览模态框
const openPreviewModal = () => {
  showPreviewModal.value = true
  zoomLevel.value = 1
  panState.value = { x: 0, y: 0, startX: 0, startY: 0, isPanning: false }
}

// 关闭放大预览模态框
const closePreviewModal = () => {
  showPreviewModal.value = false
}

// 处理鼠标滚轮缩放
const handleZoom = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  zoomLevel.value = Math.max(0.1, Math.min(5, zoomLevel.value + delta))
}

// 开始拖拽
const startPan = (event) => {
  if (event.button === 0) {
    panState.value.isPanning = true
    panState.value.startX = event.clientX - panState.value.x
    panState.value.startY = event.clientY - panState.value.y
  }
}

// 处理拖拽
const handlePan = (event) => {
  if (panState.value.isPanning) {
    panState.value.x = event.clientX - panState.value.startX
    panState.value.y = event.clientY - panState.value.startY
  }
}

// 停止拖拽
const stopPan = () => {
  panState.value.isPanning = false
}

// 缩小
const zoomOut = () => {
  zoomLevel.value = Math.max(0.1, zoomLevel.value - 0.1)
}

// 放大
const zoomIn = () => {
  zoomLevel.value = Math.min(5, zoomLevel.value + 0.1)
}

// 重置缩放和位置
const resetZoom = () => {
  zoomLevel.value = 1
  panState.value = { x: 0, y: 0, startX: 0, startY: 0, isPanning: false }
}

// 获取上传的文件
const getFile = () => uploadedFile.value

// 检查是否有文件被选择
const hasFile = () => uploadedFile.value !== null

defineExpose({ getFile, removeImage, hasFile })
</script>

<style scoped>
.image-upload-container {
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

.upload-area.has-image {
  border-style: solid;
  border-color: #10b981;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  transition: all 0.3s ease;
}

/* 预览模式样式 */
.preview-mode-cover {
  object-fit: cover;
  object-position: center;
}

.preview-mode-contain {
  object-fit: contain;
  object-position: center;
  background-color: #f8f9fa;
}

.preview-mode-fill {
  object-fit: fill;
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

.preview-controls {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.preview-mode-btn {
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

.preview-mode-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.zoom-btn {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

.error-message {
  margin-top: 8px;
  color: #ef4444;
  font-size: 14px;
  text-align: center;
}

.image-info {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: 6px;
}

.image-info span {
  margin-right: 12px;
}

.image-info span:last-child {
  margin-right: 0;
}

/* 放大预览模态框样式 */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.preview-modal {
  background-color: white;
  border-radius: 12px;
  max-width: 90%;
  max-height: 90%;
  width: 800px;
  height: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.preview-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.preview-modal-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background-color: #f8f9fa;
}

.preview-modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  cursor: grab;
  user-select: none;
}

.preview-modal-image:active {
  cursor: grabbing;
}

.preview-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-controls .zoom-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.zoom-controls .zoom-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.zoom-level {
  min-width: 60px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.reset-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.image-details {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.image-details span {
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-modal {
    width: 95%;
    height: 80%;
  }
  
  .preview-modal-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .image-details {
    justify-content: center;
  }
}
</style> 