<template>
      <div class="video-player-page" :class="{ 'web-fullscreen': isWebFullscreen }">
        <!-- 顶部导航栏 - 非全屏模式下显示 -->
        <SiteHeader v-if="!isFullscreen && !isWebFullscreen"/>
        <!-- <header class="site-header" v-if="!isFullscreen && !isWebFullscreen">
          <div class="header-container">
            <div class="logo">
              <h1>智学通</h1>
            </div>
            <nav class="main-nav">
              <ul>
                <li class="active"><router-link to="/courses">课程中心</router-link></li>
                <li><router-link to="/dashboard">我的学习</router-link></li>
                <li><a href="#" @click.prevent>论坛</a></li>
                <li><a href="#" @click.prevent>学习助手</a></li>
              </ul>
            </nav>
            <div class="user-actions">
              <button class="btn-download">APP下载</button>
              <div class="user-avatar">
                <img src="https://via.placeholder.com/36" alt="用户头像">
              </div>
              <button class="btn-logout" @click="logout">退出登录</button>
            </div>
          </div>
        </header> -->
    
        <div class="video-container" ref="videoContainer" :class="{ 'fullscreen': isFullscreen, 'web-fullscreen': isWebFullscreen }">
          <!-- 视频播放器主体 -->
          <div class="player-wrapper">
            <video
              ref="videoPlayer"
              class="video-element"
              @timeupdate="onTimeUpdate"
              @ended="onVideoEnded"
              @loadedmetadata="onVideoLoaded"
              @play="isPlaying = true"
              @pause="isPlaying = false"
            ></video>
    
            <!-- 弹幕层 -->
            <div class="danmaku-container" v-show="danmakuEnabled">
              <div 
                v-for="(danmaku, index) in activeDanmakus" 
                :key="index"
                class="danmaku"
                :style="danmaku.style"
              >
                {{ danmaku.text }}
              </div>
            </div>
    
            <!-- 控制层 -->
            <div class="controls-overlay" v-show="controlsVisible" @mousemove="showControls">
              <!-- 顶部控制栏 -->
              <div class="top-controls">
                <div class="video-title">{{ lessonTitle }}</div>
                <div class="right-controls">
                  <button @click="toggleDanmaku" class="control-btn">
                    <i :class="danmakuEnabled ? 'icon-danmaku-on' : 'icon-danmaku-off'"></i>
                    {{ danmakuEnabled ? '弹幕开' : '弹幕关' }}
                  </button>
                </div>
              </div>
              
              <!-- 设置面板 -->
              <div class="settings-panel" v-if="showSettingsPanel">
                <div class="settings-header">
                  <h3>播放设置</h3>
                  <button @click="toggleSettingsPanel" class="close-btn">&times;</button>
                </div>
                <div class="settings-tabs">
                  <div 
                    class="settings-tab" 
                    :class="{ 'active': activeSettingsTab === 'playback' }"
                    @click="setSettingsTab('playback')"
                  >
                    播放
                  </div>
                  <div 
                    class="settings-tab" 
                    :class="{ 'active': activeSettingsTab === 'quality' }"
                    @click="setSettingsTab('quality')"
                  >
                    画质
                  </div>
                  <div 
                    class="settings-tab" 
                    :class="{ 'active': activeSettingsTab === 'subtitle' }"
                    @click="setSettingsTab('subtitle')"
                  >
                    字幕
                  </div>
                </div>
                <div class="settings-content">
                  <!-- 播放设置 -->
                  <div v-if="activeSettingsTab === 'playback'" class="settings-section">
                    <div class="settings-item">
                      <div class="settings-label">播放速度</div>
                      <div class="settings-options">
                        <div 
                          v-for="rate in playbackRates" 
                          :key="rate" 
                          @click="changePlaybackRate(rate)"
                          :class="{ 'active': playbackRate === rate }"
                          class="settings-option"
                        >
                          {{ rate }}x
                        </div>
                      </div>
                    </div>
                    <div class="settings-item">
                      <div class="settings-label">音量</div>
                      <div class="settings-volume">
                        <button @click="toggleMute" class="volume-btn">
                          <i :class="isMuted || volume === 0 ? 'icon-volume-mute' : volume < 0.5 ? 'icon-volume-low' : 'icon-volume-high'"></i>
                        </button>
                        <div class="volume-slider-container" v-show="showVolumeSlider">
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            v-model.number="volume" 
                            @input="changeVolume(volume)"
                            class="volume-slider"
                          />
                        </div>
                        <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 画质设置 -->
                  <div v-if="activeSettingsTab === 'quality'" class="settings-section">
                    <div class="settings-item">
                      <div class="settings-label">清晰度</div>
                      <div class="settings-options">
                        <div 
                          v-for="(label, value) in qualityOptions" 
                          :key="value" 
                          @click="changeQuality(value)"
                          :class="{ 'active': qualitySetting === value }"
                          class="settings-option"
                        >
                          {{ label }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 字幕设置 -->
                  <div v-if="activeSettingsTab === 'subtitle'" class="settings-section">
                    <div class="settings-item">
                      <div class="settings-label">字幕</div>
                      <div class="settings-toggle">
                        <button @click="toggleSubtitle" class="toggle-btn" :class="{ 'active': subtitleEnabled }">
                          {{ subtitleEnabled ? '开启' : '关闭' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
    
              <!-- 中间播放按钮 -->
              <div class="center-play" v-show="!isPlaying" @click="togglePlay">
                <i class="icon-play-large"></i>
              </div>
    
              <!-- 底部控制栏 -->
              <div class="bottom-controls">
                <!-- 进度条 -->
                <div class="progress-bar" @click="seekVideo">
                  <div class="progress-background"></div>
                  <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
                  <div class="progress-current" :style="{ width: progressPercent + '%' }"></div>
                  <div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
                </div>
    
                <!-- 控制按钮组 -->
                <div class="control-buttons">
                  <div class="left-controls">
                    <button @click="togglePlay" class="control-btn">
                      <i :class="isPlaying ? 'icon-pause' : 'icon-play'"></i>
                    </button>
                    <div class="time-display">
                      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                    </div>
                  </div>
    
                  <div class="center-controls">
                    <div class="danmaku-input-container">
                      <input 
                        type="text" 
                        v-model="danmakuText" 
                        placeholder="发个弹幕见证当下" 
                        @keyup.enter="sendDanmaku"
                      />
                      <button @click="sendDanmaku" class="send-danmaku-btn">发送</button>
                    </div>
                  </div>
    
                  <div class="right-controls">
                    <!-- 音量控制 -->
                    <div class="volume-control dropdown">
                      <button @click.stop="toggleVolumeSlider" class="control-btn volume-control-btn">
                        <i :class="isMuted || volume === 0 ? 'icon-volume-mute' : volume < 0.5 ? 'icon-volume-low' : 'icon-volume-high'"></i>
                      </button>
                      <div class="volume-slider-container" v-show="showVolumeSlider">
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          v-model.number="volume" 
                          @input="changeVolume(volume)"
                          class="volume-slider"
                        />
                      </div>
                    </div>
                    
                    <!-- 播放速度 -->
                    <div class="playback-rate dropdown">
                      <button class="control-btn dropdown-toggle" @click.stop="toggleDropdown('playbackRate')">
                        {{ playbackRate }}x
                      </button>
                      <div class="dropdown-menu" v-show="activeDropdown === 'playbackRate'">
                        <div 
                          v-for="rate in playbackRates" 
                          :key="rate" 
                          @click.stop="changePlaybackRate(rate)"
                          :class="{ 'active': playbackRate === rate }"
                        >
                          {{ rate }}x
                        </div>
                      </div>
                    </div>
    
                    <!-- 清晰度 -->
                    <div class="quality dropdown">
                      <button class="control-btn dropdown-toggle" @click.stop="toggleDropdown('quality')">
                        {{ qualityOptions[qualitySetting] || '自动' }}
                      </button>
                      <div class="dropdown-menu" v-show="activeDropdown === 'quality'">
                        <div 
                          v-for="(label, value) in qualityOptions" 
                          :key="value" 
                          @click.stop="changeQuality(value)"
                          :class="{ 'active': qualitySetting === value }"
                        >
                          {{ label }}
                        </div>
                      </div>
                    </div>
    
                    <!-- 字幕 -->
                    <button @click="toggleSubtitle" class="control-btn">
                      <i :class="subtitleEnabled ? 'icon-subtitle-on' : 'icon-subtitle-off'"></i>
                    </button>
                    
                    <!-- 画中画 -->
                    <button 
                      v-if="isPipSupported" 
                      @click="togglePip" 
                      class="control-btn"
                      :title="pipEnabled ? '退出画中画' : '开启画中画'"
                    >
                      <i :class="pipEnabled ? 'icon-pip-exit' : 'icon-pip'"></i>
                    </button>
                    
                    <!-- 设置按钮 -->
                    <button @click="toggleSettingsPanel" class="control-btn">
                      <i class="icon-settings"></i>
                    </button>
    
                    <!-- 网页全屏 -->
                    <button @click="toggleWebFullscreen" class="control-btn">
                      <i :class="isWebFullscreen ? 'icon-web-fullscreen-exit' : 'icon-web-fullscreen'"></i>
                    </button>
    
                    <!-- 全屏 -->
                    <button @click="toggleFullscreen" class="control-btn">
                      <i :class="isFullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen'"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <!-- 右侧课程章节列表 - 非全屏模式下显示 -->
          <div class="course-sidebar" v-if="!isFullscreen && !isWebFullscreen">
            <div class="sidebar-header">
              <h3>课程章节</h3>
            </div>
            <div class="chapter-list">
              <div 
                v-for="(chapter, chapterIndex) in chapters" 
                :key="'chapter-' + chapterIndex" 
                class="chapter-item"
              >
                <div class="chapter-header">
                  <h4 class="chapter-title">{{ chapter.title }}</h4>
                </div>
                <div class="lesson-list">
                  <div 
                    v-for="(lesson, lessonIndex) in chapter.lessons" 
                    :key="'lesson-' + lessonIndex" 
                    class="lesson-item"
                    :class="{ 'active': lesson.id === Number(lessonId), 'completed': isLessonCompleted(lesson.id) }"
                    @click="switchLesson(lesson.id)"
                  >
                    <div class="lesson-info">
                      <span class="lesson-index">{{ lessonIndex + 1 }}</span>
                      <h5>{{ lesson.title }}</h5>
                    </div>
                    <div class="lesson-meta">
                      <span class="duration">{{ formatTime(lesson.duration) }}</span>
                      <span v-if="isLessonCompleted(lesson.id)" class="completed-icon">
                        <i class="icon-check"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <script>
    import studentCourseVideoService from '../../utils/studentCourseVideoService';
    
    export default {
      name: 'StudentCoursePlayer',
      props: {
        lessonId: {
          type: Number,
          required: true
        },
        courseId: {
          type: Number,
          required: true
        },
        studentId: {
          type: Number,
          default: 7
        }
      },
      data() {
        return {
          // 视频信息
          videoUrl: '',
          lessonTitle: '',
          lessonInfo: null,
          
          // 播放状态
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          bufferedPercent: 0,
          progressPercent: 0,
          completedLessons: {},
          
          // 控制显示
          controlsVisible: true,
          controlsTimeout: null,
          isFullscreen: false,
          isWebFullscreen: false,
          
          // 播放设置
          playbackRate: 1.0,
          playbackRates: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
          qualitySetting: 'auto',
          qualityOptions: {
            'auto': '自动',
            '1080p': '1080P',
            '720p': '720P',
            '480p': '480P',
            '360p': '360P'
          },
          subtitleEnabled: false,
          
          // 弹幕相关
          danmakuEnabled: true,
          danmakuText: '',
          danmakus: [],
          activeDanmakus: [],
          danmakuColors: [
            '#FFFFFF', '#FE0302', '#FF7204', '#FFAA02', '#FFD302', 
            '#FFFF00', '#A0EE00', '#00CD00', '#019899', '#4266BE', 
            '#89D5FF', '#CC0273', '#222222'
          ],
          
          // 音量控制
          volume: 1.0,
          isMuted: false,
          showVolumeSlider: false,
          
          // 画中画
          pipEnabled: false,
          isPipSupported: false,
          
          // 设置面板
          showSettingsPanel: false,
          activeSettingsTab: 'playback',
          
          // 课程章节
          chapters: [],
          
          // 保存进度的计时器
          saveProgressInterval: null,
          lastSaveTime: 0, // 上次保存时间戳
          
          // 新增的 dropdown 相关
          activeDropdown: null,
          
          // 模拟用户信息
          currentUser: {
            id: this.studentId,
            name: '测试用户'
          }
        };
      },
      mounted() {
        this.initPlayer();
        this.fetchVideoDetail();
        this.fetchCourseChapters();
        this.fetchDanmakus(); // 获取课时弹幕
        
        // 添加事件监听
        document.addEventListener('keydown', this.handleKeydown);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('click', this.closeDropdowns);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 鼠标移动显示控制栏
        document.addEventListener('mousemove', this.showControls);
        
        // 定时保存播放进度
        this.saveProgressInterval = setInterval(this.saveProgress, 10000); // 每10秒保存一次进度
      },
      beforeUnmount() {
        // 移除事件监听
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('click', this.closeDropdowns);
        document.removeEventListener('mousemove', this.showControls);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 清除定时器
        if (this.controlsTimeout) {
          clearTimeout(this.controlsTimeout);
        }
        if (this.saveProgressInterval) {
          clearInterval(this.saveProgressInterval);
        }
        
        // 保存最终进度
        this.saveProgress();
      },
      beforeRouteLeave(to, from, next) {
        // 路由离开前保存进度
        this.saveProgress();
        next();
      },
      methods: {
        logout() {
          // 清除本地存储的用户信息
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          sessionStorage.removeItem('userToken');
          sessionStorage.removeItem('userInfo');
          
          // 显示退出成功提示
          alert('已成功退出登录');
          
          // 跳转到登录页面或首页
          this.$router.push('/login');
        },
        
        async initPlayer() {
          // 初始化视频播放器
          console.log('初始化视频播放器，课时ID:', this.lessonId);
          
          // 添加额外的事件监听，确保音量控制正确初始化
          document.addEventListener('click', (event) => {
            const volumeControl = event.target.closest('.volume-control');
            const volumeBtn = event.target.closest('.volume-control-btn');
            
            // 如果点击了音量控制按钮，不做处理（由toggleVolumeSlider处理）
            if (volumeBtn) {
              return;
            }
            
            // 如果点击了非音量控制区域，关闭音量滑块
            if (!volumeControl && this.showVolumeSlider) {
              this.showVolumeSlider = false;
            }
          });
        },
        
        async fetchVideoDetail() {
          try {
            const response = await studentCourseVideoService.getVideoDetail(this.lessonId, this.studentId);
            console.log('获取视频详情成功:', response.data);
            
            if (response.data && response.data.status === 0) {
              const { lesson, progress } = response.data.data;
              
              this.lessonInfo = lesson;
              this.lessonTitle = lesson.title;
              this.videoUrl = lesson.videoUrl;
              
              // 设置视频源
              this.$nextTick(() => {
                const videoElement = this.$refs.videoPlayer;
                if (videoElement) {
                  videoElement.src = this.videoUrl;
                  
                  // 检查本地存储中是否有更新的进度
                  const localStorageKey = `video_progress_${this.studentId}_${this.lessonId}`;
                  const savedProgress = localStorage.getItem(localStorageKey);
                  let useLocalProgress = false;
                  let localCurrentTime = 0;
                  
                  if (savedProgress) {
                    try {
                      const localProgress = JSON.parse(savedProgress);
                      const savedTime = new Date(localProgress.lastSaved);
                      
                      // 如果本地进度存在且比后端进度更新，则使用本地进度
                      if (progress && progress.lastWatched) {
                        const serverTime = new Date(progress.lastWatched);
                        if (savedTime > serverTime) {
                          useLocalProgress = true;
                          localCurrentTime = localProgress.currentTime;
                        }
                      } else {
                        // 如果后端没有进度，直接使用本地进度
                        useLocalProgress = true;
                        localCurrentTime = localProgress.currentTime;
                      }
                      
                      // 如果本地标记为已完成，更新完成状态
                      if (localProgress.isCompleted) {
                        this.completedLessons[this.lessonId] = true;
                      }
                    } catch (e) {
                      console.error('解析本地进度数据失败', e);
                    }
                  }
                  
                  // 设置播放进度
                  if (useLocalProgress) {
                    videoElement.currentTime = localCurrentTime;
                    console.log('从本地存储恢复播放进度:', localCurrentTime);
                  } else if (progress && progress.currentTime) {
                    videoElement.currentTime = progress.currentTime;
                    console.log('恢复上次播放进度:', progress.currentTime);
                  }
                  
                  // 设置播放速度
                  if (progress && progress.playbackRate) {
                    this.playbackRate = progress.playbackRate;
                    videoElement.playbackRate = progress.playbackRate;
                  }
                  
                  // 设置清晰度
                  if (progress && progress.qualitySetting) {
                    this.qualitySetting = progress.qualitySetting;
                  }
                  
                  // 设置字幕
                  if (progress && progress.subtitleEnabled !== null) {
                    this.subtitleEnabled = progress.subtitleEnabled;
                  }
                  
                  // 标记为已完成
                  if (progress && progress.isCompleted) {
                    this.completedLessons[this.lessonId] = true;
                  }
                  
                  // 设置音量 - 修复这部分代码
                  if (progress && progress.volume !== null) {
                    this.volume = progress.volume;
                    videoElement.volume = progress.volume;
                    console.log('从进度恢复音量:', progress.volume);
                  } else {
                    // 如果没有保存的音量信息，使用默认值
                    videoElement.volume = this.volume;
                    console.log('使用默认音量:', this.volume);
                  }
                  
                  // 设置弹幕状态
                  if (progress && progress.danmakuEnabled !== null) {
                    this.danmakuEnabled = progress.danmakuEnabled;
                  }
                  
                  // 检查画中画支持
                  this.checkPipSupport(videoElement);
                  
                  // 设置静音状态
                  if (progress && progress.muted !== undefined) {
                    this.isMuted = progress.muted;
                  } else {
                    this.isMuted = false; // 默认不静音
                  }
                  videoElement.muted = this.isMuted;
                  console.log('静音状态:', this.isMuted);
                }
              });
            }
          } catch (error) {
            console.error('获取视频详情失败:', error);
            
            // 如果后端请求失败，尝试从本地存储恢复
            this.$nextTick(() => {
              const videoElement = this.$refs.videoPlayer;
              if (videoElement && this.videoUrl) {
                videoElement.src = this.videoUrl;
                
                // 尝试从本地存储恢复进度
                const localStorageKey = `video_progress_${this.studentId}_${this.lessonId}`;
                const savedProgress = localStorage.getItem(localStorageKey);
                if (savedProgress) {
                  try {
                    const localProgress = JSON.parse(savedProgress);
                    videoElement.currentTime = localProgress.currentTime;
                    console.log('从本地存储恢复播放进度:', localProgress.currentTime);
                    
                    if (localProgress.isCompleted) {
                      this.completedLessons[this.lessonId] = true;
                    }
                  } catch (e) {
                    console.error('解析本地进度数据失败', e);
                  }
                }
              } else {
                // 视频加载失败时显示错误提示
                this.showErrorMessage('视频资源加载失败，请稍后再试');
              }
            });
          }
        },
        
        // 检查是否支持画中画模式
        checkPipSupport(videoElement) {
          if (videoElement) {
            // 检查浏览器是否支持画中画
            this.isPipSupported = 
              document.pictureInPictureEnabled && 
              !videoElement.disablePictureInPicture;
          }
        },
        
        // 显示错误信息
        showErrorMessage(message) {
          this.lessonTitle = '视频无法播放';
          // 创建一个错误提示元素
          const errorElement = document.createElement('div');
          errorElement.className = 'video-error-message';
          errorElement.innerHTML = `
            <div class="error-icon">!</div>
            <div class="error-text">${message}</div>
            <div class="error-hint">您可以尝试刷新页面或联系客服</div>
          `;
          
          // 清空视频元素并添加错误提示
          const playerWrapper = this.$refs.videoPlayer.parentNode;
          playerWrapper.appendChild(errorElement);
        },
        
        async fetchCourseChapters() {
          try {
            const response = await studentCourseVideoService.getCourseChaptersAndLessons(this.courseId);
            console.log('获取课程章节成功:', response.data);
            
            if (response.data && response.data.status === 0) {
              this.chapters = response.data.data || [];
            }
          } catch (error) {
            console.error('获取课程章节失败:', error);
          }
        },
        
        onVideoLoaded() {
          const video = this.$refs.videoPlayer;
          if (video) {
            this.duration = video.duration;
            
            // 确保音量设置正确应用
            video.volume = this.volume;
            video.muted = this.isMuted;
            console.log('视频加载完成，音量:', this.volume, '静音状态:', this.isMuted);
          }
        },
        
        onTimeUpdate() {
          const video = this.$refs.videoPlayer;
          this.currentTime = video.currentTime;
          this.progressPercent = (video.currentTime / video.duration) * 100;
          
          // 更新缓冲进度
          if (video.buffered.length > 0) {
            this.bufferedPercent = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
          }
          
          // 如果播放到90%以上，标记为已完成
          if (this.progressPercent > 90 && !this.completedLessons[this.lessonId]) {
            this.markAsCompleted();
          }
          
          // 处理弹幕显示
          this.updateDanmakus();
          
          // 每30秒自动保存进度
          if (Math.floor(this.currentTime) % 30 === 0 && this.currentTime > 1) {
            this.saveProgress();
          }
        },
        
        onVideoEnded() {
          // 视频结束时标记为已完成
          this.markAsCompleted();
          
          // 自动播放下一课时
          this.playNextLesson();
        },
        
        async markAsCompleted() {
          if (this.completedLessons[this.lessonId]) return;
          
          try {
            await studentCourseVideoService.markVideoCompleted(this.studentId, this.lessonId);
            console.log('标记视频为已完成');
            this.completedLessons[this.lessonId] = true;
          } catch (error) {
            console.error('标记视频为已完成失败:', error);
          }
        },
        
        async saveProgress() {
          if (!this.$refs.videoPlayer) return;
          
          // 避免频繁保存，至少间隔3秒
          const now = Date.now();
          if (now - this.lastSaveTime < 3000) {
            console.log('保存间隔太短，跳过');
            return;
          }
          
          this.lastSaveTime = now;
          
          // 创建进度对象
          const progress = {
            studentId: this.studentId,
            lessonId: this.lessonId,
            currentTime: Math.floor(this.currentTime),
            isCompleted: this.completedLessons[this.lessonId] || false,
            playbackRate: this.playbackRate,
            qualitySetting: this.qualitySetting,
            subtitleEnabled: this.subtitleEnabled,
            volume: this.volume,
            danmakuEnabled: this.danmakuEnabled,
            pipEnabled: this.pipEnabled,
            lastWatched: new Date()
          };
          
          // 保存到本地存储，确保即使后端失败也能恢复进度
          const localStorageKey = `video_progress_${this.studentId}_${this.lessonId}`;
          localStorage.setItem(localStorageKey, JSON.stringify({
            currentTime: progress.currentTime,
            progressPercent: this.progressPercent, // 保存百分比进度
            isCompleted: progress.isCompleted,
            lastSaved: new Date().toISOString()
          }));
          
          try {
            // 发送到后端
            await studentCourseVideoService.updateVideoProgress(progress);
            console.log('保存播放进度成功:', progress.currentTime, '秒, 百分比:', this.progressPercent.toFixed(2) + '%');
          } catch (error) {
            console.error('保存播放进度失败:', error);
            // 即使后端保存失败，本地存储也已经保存了进度
          }
        },
        
        async updateVideoSettings() {
          try {
            await studentCourseVideoService.updateVideoSettings(
              this.studentId,
              this.lessonId,
              this.playbackRate,
              this.qualitySetting,
              this.subtitleEnabled
            );
            console.log('更新视频设置成功');
          } catch (error) {
            console.error('更新视频设置失败:', error);
          }
        },
        
        togglePlay() {
          const video = this.$refs.videoPlayer;
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        },
        
        seekVideo(event) {
          const video = this.$refs.videoPlayer;
          const progressBar = event.currentTarget;
          const clickPosition = event.offsetX / progressBar.offsetWidth;
          
          video.currentTime = clickPosition * video.duration;
        },
        
        changePlaybackRate(rate) {
          this.playbackRate = rate;
          this.$refs.videoPlayer.playbackRate = rate;
          this.updateVideoSettings();
        },
        
        changeQuality(quality) {
          this.qualitySetting = quality;
          // 实际项目中，这里应该切换不同清晰度的视频源
          this.updateVideoSettings();
        },
        
        toggleSubtitle() {
          this.subtitleEnabled = !this.subtitleEnabled;
          this.updateVideoSettings();
        },
        
        toggleDanmaku() {
          this.danmakuEnabled = !this.danmakuEnabled;
          this.updateAdvancedSettings();
        },
        
        // 音量控制
        changeVolume(value) {
          const video = this.$refs.videoPlayer;
          if (video) {
            this.volume = Math.max(0, Math.min(1, value));
            video.volume = this.volume;
            
            // 如果音量大于0，取消静音状态
            if (this.volume > 0) {
              this.isMuted = false;
              video.muted = false;
            } else {
              this.isMuted = true;
              video.muted = true;
            }
            
            this.updateAdvancedSettings();
          }
        },
        
        toggleMute() {
          const video = this.$refs.videoPlayer;
          if (video) {
            this.isMuted = !this.isMuted;
            video.muted = this.isMuted;
            
            // 如果取消静音，恢复之前的音量
            if (!this.isMuted && this.volume === 0) {
              this.volume = 0.5;
              video.volume = this.volume;
            }
            
            this.updateAdvancedSettings();
            console.log('音量状态:', this.isMuted ? '静音' : '有声', '音量值:', this.volume);
          }
        },
        
        toggleVolumeSlider() {
          this.showVolumeSlider = !this.showVolumeSlider;
          // 确保音量滑块显示后，其他下拉菜单关闭
          if (this.showVolumeSlider) {
            this.activeDropdown = null;
            this.showSettingsPanel = false;
          }
          console.log('音量滑块显示状态:', this.showVolumeSlider);
        },
        
        // 画中画功能
        async togglePip() {
          if (!this.isPipSupported) {
            console.warn('当前浏览器不支持画中画功能');
            return;
          }
          
          try {
            const video = this.$refs.videoPlayer;
            
            if (document.pictureInPictureElement) {
              // 退出画中画模式
              await document.exitPictureInPicture();
              this.pipEnabled = false;
            } else {
              // 进入画中画模式
              await video.requestPictureInPicture();
              this.pipEnabled = true;
            }
            
            this.updateAdvancedSettings();
          } catch (error) {
            console.error('切换画中画模式失败:', error);
          }
        },
        
        // 设置面板
        toggleSettingsPanel() {
          this.showSettingsPanel = !this.showSettingsPanel;
        },
        
        setSettingsTab(tab) {
          this.activeSettingsTab = tab;
        },
        
        // 更新高级设置
        updateAdvancedSettings() {
          try {
            studentCourseVideoService.updateAdvancedSettings(
              this.studentId,
              this.lessonId,
              this.volume,
              this.danmakuEnabled,
              this.pipEnabled
            );
            console.log('更新视频高级设置成功');
          } catch (error) {
            console.error('更新视频高级设置失败:', error);
          }
        },
        
        // 获取课时弹幕
        async fetchDanmakus() {
          try {
            const response = await studentCourseVideoService.getDanmakus(this.lessonId);
            console.log('获取弹幕成功:', response.data);
            
            if (response.data && response.data.status === 0) {
              const danmakuList = response.data.data || [];
              
              // 将后端弹幕数据转换为前端格式
              this.danmakus = danmakuList.map(item => ({
                text: item.content,
                time: item.timePoint,
                color: item.color || this.danmakuColors[0],
                fontSize: item.fontSize || 20,
                speed: 5 + Math.random() * 3,
                track: Math.floor(Math.random() * 15),
                displayed: false // 添加displayed属性跟踪是否已显示
              }));
              
              console.log('弹幕数据加载完成，共', this.danmakus.length, '条');
            }
          } catch (error) {
            console.error('获取弹幕失败:', error);
          }
        },
        
        // 发送弹幕
        async sendDanmaku() {
          if (!this.danmakuText.trim()) return;
          
          // 生成随机颜色
          const color = this.danmakuColors[Math.floor(Math.random() * this.danmakuColors.length)];
          const fontSize = 16 + Math.random() * 8;
          
          try {
            // 创建弹幕对象
            const danmakuData = {
              studentId: this.studentId,
              lessonId: this.lessonId,
              content: this.danmakuText,
              timePoint: Math.floor(this.currentTime),
              color: color,
              fontSize: fontSize,
              status: 'normal'
            };
            
            // 创建前端弹幕对象（不等待后端响应，先在前端显示）
            const danmaku = {
              text: this.danmakuText,
              time: this.currentTime,
              color: color,
              speed: 0.8 + Math.random() * 0.4,
              fontSize: fontSize,
              track: Math.floor(Math.random() * 10),
              displayed: false,
              isNewSent: true // 标记为新发送的弹幕
            };
            
            // 立即添加到弹幕列表并显示
            this.danmakus.push(danmaku);
            this.showDanmaku(danmaku);
            
            // 清空输入框
            this.danmakuText = '';
            
            // 发送到后端
            const response = await studentCourseVideoService.sendDanmaku(danmakuData);
            console.log('发送弹幕成功:', response.data);
          } catch (error) {
            console.error('发送弹幕失败:', error);
            // 即使后端保存失败，前端也已经显示了弹幕
          }
        },
        
        showDanmaku(danmaku) {
          if (!this.$refs.videoPlayer) return;
          
          const containerWidth = this.$refs.videoPlayer.offsetWidth;
          const containerHeight = this.$refs.videoPlayer.offsetHeight;
          const danmakuWidth = danmaku.text.length * (danmaku.fontSize / 1.8);
          
          // 创建弹幕元素
          const danmakuEl = document.createElement('div');
          danmakuEl.className = danmaku.isNewSent ? 'danmaku danmaku-new' : 'danmaku danmaku-normal';
          danmakuEl.textContent = danmaku.text;
          danmakuEl.style.color = danmaku.color;
          danmakuEl.style.fontSize = `${danmaku.fontSize}px`;
          
          if (danmaku.isNewSent) {
            // 新发送的弹幕：在屏幕上方中间显示
            danmakuEl.style.top = '20px';
            danmakuEl.style.left = '50%';
            danmakuEl.style.transform = 'translateX(-50%)';
            danmakuEl.style.animation = 'danmaku-new-send 3s ease-out forwards';
          } else {
            // 原有弹幕：从右向左飘动
            // 计算动画时间（基于弹幕长度、容器宽度和速度）
            const animationDuration = (containerWidth + danmakuWidth) / (100 * danmaku.speed);
            
            // 确保轨道不超出容器高度
            const maxTracks = Math.floor(containerHeight / 30) - 1;
            const track = danmaku.track % maxTracks;
            
            danmakuEl.style.top = `${track * 30 + 50}px`; // 避开新弹幕区域
            danmakuEl.style.right = `-${danmakuWidth}px`;
            danmakuEl.style.animation = `danmaku-move ${animationDuration}s linear forwards`;
          }
          
          // 添加到弹幕容器
          const container = this.$refs.videoPlayer.parentNode.querySelector('.danmaku-container');
          if (container) {
            container.appendChild(danmakuEl);
            
            // 动画结束后移除元素
            const removeDelay = danmaku.isNewSent ? 3000 : (containerWidth + danmakuWidth) / (100 * danmaku.speed) * 1000;
            setTimeout(() => {
              if (container.contains(danmakuEl)) {
                container.removeChild(danmakuEl);
              }
            }, removeDelay);
          }
          
          // 添加到活动弹幕列表（用于跟踪）
          const activeDanmaku = {
            text: danmaku.text,
            id: Date.now() + Math.random(),
            element: danmakuEl
          };
          
          this.activeDanmakus.push(activeDanmaku);
          
          // 弹幕数量控制，避免过多弹幕影响性能
          if (this.activeDanmakus.length > 100) {
            const oldestDanmaku = this.activeDanmakus.shift();
            if (oldestDanmaku.element && container.contains(oldestDanmaku.element)) {
              container.removeChild(oldestDanmaku.element);
            }
          }
        },
        
        updateDanmakus() {
          if (!this.danmakuEnabled || !this.$refs.videoPlayer) return;
          
          // 显示当前时间点附近的弹幕（不包括新发送的弹幕）
          const currentTimeDanmakus = this.danmakus.filter(
            d => Math.abs(d.time - this.currentTime) < 0.5 && !d.displayed && !d.isNewSent
          );
          
          // 标记已显示的弹幕
          currentTimeDanmakus.forEach(danmaku => {
            danmaku.displayed = true;
            this.showDanmaku(danmaku);
          });
          
          // 每30秒重置显示状态，允许弹幕重新显示
          if (Math.floor(this.currentTime) % 30 === 0 && this.currentTime > 1) {
            this.danmakus.forEach(d => d.displayed = false);
          }
        },
        
        toggleFullscreen() {
          this.$nextTick(() => {
            if (!document.fullscreenElement) {
              const videoContainer = this.$refs.videoContainer;
              if (videoContainer) {
                videoContainer.requestFullscreen();
              }
            } else {
              document.exitFullscreen();
            }
          });
        },
        
        handleFullscreenChange() {
          this.isFullscreen = !!document.fullscreenElement;
        },
        
        toggleWebFullscreen() {
          this.isWebFullscreen = !this.isWebFullscreen;
        },
        
        showControls() {
          this.controlsVisible = true;
          
          // 清除之前的定时器
          if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
          }
          
          // 3秒后隐藏控制栏
          this.controlsTimeout = setTimeout(() => {
            this.controlsVisible = false;
          }, 3000);
        },
        
        handleKeydown(event) {
          // 空格键：播放/暂停
          if (event.code === 'Space') {
            event.preventDefault();
            this.togglePlay();
          }
          
          // 左右箭头：快退/快进
          if (event.code === 'ArrowLeft') {
            this.$refs.videoPlayer.currentTime -= 5;
          }
          if (event.code === 'ArrowRight') {
            this.$refs.videoPlayer.currentTime += 5;
          }
          
          // F键：全屏
          if (event.code === 'KeyF') {
            this.toggleFullscreen();
          }
          
          // M键：静音
          if (event.code === 'KeyM') {
            this.$refs.videoPlayer.muted = !this.$refs.videoPlayer.muted;
          }
        },
        
        switchLesson(lessonId) {
          // 保存当前进度
          this.saveProgress();
          
          // 跳转到新课时
          this.$router.push({
            name: 'StudentCoursePlayer',
            params: { lessonId },
            query: { 
              courseId: this.courseId,
              studentId: this.studentId
            }
          });
        },
        
        playNextLesson() {
          // 查找当前课时的下一课时
          let foundCurrent = false;
          let nextLessonId = null;
          
          for (const chapter of this.chapters) {
            for (const lesson of chapter.lessons) {
              if (foundCurrent) {
                nextLessonId = lesson.id;
                break;
              }
              if (lesson.id === Number(this.lessonId)) {
                foundCurrent = true;
              }
            }
            if (nextLessonId) break;
          }
          
          // 如果找到下一课时，自动播放
          if (nextLessonId) {
            this.switchLesson(nextLessonId);
          }
        },
        
        isLessonCompleted(lessonId) {
          return !!this.completedLessons[lessonId];
        },
        
        formatTime(seconds) {
          if (!seconds) return '00:00';
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        
        toggleDropdown(tab) {
          if (this.activeDropdown === tab) {
            this.activeDropdown = null;
          } else {
            this.activeDropdown = tab;
          }
        },
        
        closeDropdowns(event) {
          // 如果点击的不是下拉菜单内部元素，则关闭所有下拉菜单
          if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-toggle')) {
            this.activeDropdown = null;
          }
          
          // 如果点击的不是音量控制相关元素，则关闭音量滑块
          if (!event.target.closest('.volume-slider-container') && 
              !event.target.closest('.volume-control button')) {
            this.showVolumeSlider = false;
          }
        },
        
        // 处理页面可见性变化
        handleVisibilityChange() {
          if (document.hidden) {
            // 页面隐藏时保存进度
            this.saveProgress();
            
            // 如果视频正在播放，暂停它
            if (this.isPlaying && this.$refs.videoPlayer) {
              this.$refs.videoPlayer.pause();
            }
          } else {
            // 页面重新可见时，如果之前在播放，可以选择自动恢复播放
            // 这里不自动恢复，避免突然的声音干扰用户
          }
        }
      }
    };
    </script>
    
    <style scoped>
    /* 整体页面样式 */
    .video-player-page {
      min-height: 100vh;
      background-color: #f8f9fa;
      display: flex;
      flex-direction: column;
    }
    
    /* 顶部导航栏样式 - 复用课程详情页的样式 */
    .site-header {
      background-color: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .logo h1 {
      color: #F98C53;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    
    .main-nav ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .main-nav li {
      margin: 0 15px;
    }
    
    .main-nav a {
      color: #333;
      text-decoration: none;
      font-size: 16px;
      font-weight: 500;
      padding: 10px 0;
      position: relative;
      transition: color 0.3s;
    }
    
    .main-nav a:hover,
    .main-nav li.active a {
      color: #F98C53;
    }
    
    .user-actions {
      display: flex;
      align-items: center;
    }
    
    .btn-download {
      background-color: #F98C53;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      margin-right: 15px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-download:hover {
      background-color: #e67e45;
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .btn-logout {
      background: #ff4757;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-left: 10px;
      transition: background-color 0.3s ease;
    }
    
    .btn-logout:hover {
      background: #ff3838;
    }
    
    /* 视频容器样式 */
    .video-container {
      display: flex;
      max-width: 1400px;
      margin: 20px auto;
      background-color: #F9F2EF;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(249, 140, 83, 0.2);
      overflow: hidden;
      height: calc(100vh - 110px);
      border: 1px solid #FCCEB4;
    }
    
    .video-container.fullscreen,
    .video-container.web-fullscreen {
      max-width: 100%;
      margin: 0;
      border-radius: 0;
      box-shadow: none;
      height: 100vh;
    }
    
    .web-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      background-color: #000;
    }
    
    /* 播放器样式 */
    .player-wrapper {
      position: relative;
      flex: 1;
      background-color: #000;
      overflow: hidden;
    }
    
    .video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    /* 弹幕层 */
    .danmaku-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 5;
    }
    
    .danmaku {
      position: absolute;
      white-space: nowrap;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
      will-change: transform;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
      line-height: 1.2;
      padding: 3px 0;
      user-select: none;
    }
    
    .danmaku-new {
      z-index: 10;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.7), 0 0 10px rgba(255, 255, 255, 0.5);
      font-weight: 800;
    }
    
    .danmaku-normal {
      z-index: 5;
    }
    
    @keyframes danmaku-move {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(-100%);
      }
    }
    
    @keyframes danmaku-new-send {
      0% {
        opacity: 0;
        transform: translateX(-50%) scale(0.5);
      }
      20% {
        opacity: 1;
        transform: translateX(-50%) scale(1.2);
      }
      40% {
        transform: translateX(-50%) scale(1);
      }
      80% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateX(-50%) scale(1);
      }
    }
    
    /* 控制层 */
    .controls-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.3) 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 10;
    }
    
    /* 顶部控制栏 */
    .top-controls {
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .video-title {
      color: white;
      font-size: 18px;
      font-weight: 500;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    /* 中间播放按钮 */
    .center-play {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .center-play:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    .icon-play-large {
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 20px 0 20px 35px;
      border-color: transparent transparent transparent white;
      margin-left: 8px;
    }
    
    /* 底部控制栏 */
    .bottom-controls {
      padding: 10px 20px 20px;
    }
    
    /* 进度条 */
    .progress-bar {
      position: relative;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      margin-bottom: 12px;
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) inset;
      transition: height 0.2s ease;
    }
    
    .progress-bar:hover {
      height: 8px;
    }
    
    .progress-bar:hover .progress-handle {
      transform: scale(1) translateY(-50%);
    }
    
    .progress-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .progress-buffered {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.4);
      transition: width 0.3s ease;
    }
    
    .progress-current {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: #F98C53;
      background-image: linear-gradient(to right, #F98C53, #FCCEB4);
      transition: width 0.3s ease;
    }
    
    .progress-handle {
      position: absolute;
      top: 50%;
      width: 16px;
      height: 16px;
      background-color: #F98C53;
      border: 2px solid white;
      border-radius: 50%;
      transform: scale(0) translateY(-50%);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      transform-origin: center;
      margin-left: -8px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
    }
    
    .progress-bar:hover .progress-handle {
      box-shadow: 0 0 10px rgba(249, 140, 83, 0.5);
    }
    
    /* 控制按钮组 */
    .control-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .left-controls,
    .right-controls {
      display: flex;
      align-items: center;
    }
    
    .center-controls {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    
    .control-btn {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }
    
    .control-btn:hover {
      color: #F98C53;
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    .control-btn:active {
      transform: translateY(0);
    }
    
    .control-btn::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 0;
      border-radius: 100%;
      transform: scale(1, 1) translate(-50%);
      transform-origin: 50% 50%;
    }
    
    .control-btn:focus:not(:active)::after {
      animation: ripple 1s ease-out;
    }
    
    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 0.5;
      }
      20% {
        transform: scale(25, 25);
        opacity: 0.3;
      }
      100% {
        opacity: 0;
        transform: scale(40, 40);
      }
    }
    
    .time-display {
      color: white;
      font-size: 14px;
      margin-left: 10px;
    }
    
    /* 弹幕输入 */
    .danmaku-input-container {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 5px 10px;
      width: 350px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .danmaku-input-container:hover {
      background-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .danmaku-input-container input {
      flex: 1;
      background: none;
      border: none;
      color: white;
      padding: 8px;
      outline: none;
      font-size: 14px;
    }
    
    .danmaku-input-container input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .send-danmaku-btn {
      background-color: #F98C53;
      color: white;
      border: none;
      border-radius: 15px;
      padding: 5px 12px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(249, 140, 83, 0.3);
    }
    
    .send-danmaku-btn:hover {
      background-color: #e67e45;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(249, 140, 83, 0.4);
    }
    
    /* 下拉菜单 */
    .dropdown {
      position: relative;
      display: inline-block;
    }
    
    .dropdown-toggle {
      display: flex;
      align-items: center;
    }
    
    .dropdown-menu {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      border-radius: 4px;
      padding: 5px 0;
      margin-bottom: 10px;
      min-width: 100px;
      z-index: 1000;
    }
    
    /* Add a pseudo-element to create a safe hover area between button and dropdown */
    .dropdown-menu::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      height: 10px;
    }
    
    .dropdown-menu div {
      padding: 8px 15px;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
      white-space: nowrap;
    }
    
    .dropdown-menu div:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .dropdown-menu div.active {
      color: #F98C53;
    }
    
    /* 音量控制 */
    .volume-control {
      position: relative;
      margin-right: 5px;
    }
    
    .volume-control-btn {
      z-index: 2;
    }
    
    .volume-slider-container {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: #F9F2EF;
      border-radius: 8px;
      padding: 12px 8px;
      margin-bottom: 10px;
      width: 40px;
      height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(249, 140, 83, 0.3);
      border: 1px solid #FCCEB4;
    }
    
    /* Add a pseudo-element to create a safe hover area between button and slider */
    .volume-slider-container::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      height: 10px;
    }
    
    .volume-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 8px;
      height: 80px;
      background: rgba(249, 140, 83, 0.3);
      outline: none;
      opacity: 1;
      transition: opacity .2s, background .2s;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 auto;
    }
    
    .volume-slider:hover {
      background: rgba(255, 255, 255, 0.5);
    }
    
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #F98C53;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(249, 140, 83, 0.5);
      border: 2px solid #fff;
      transition: all 0.2s ease;
    }
    
    .volume-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #F98C53;
      cursor: pointer;
      border: 2px solid #fff;
      box-shadow: 0 0 8px rgba(249, 140, 83, 0.5);
      transition: all 0.2s ease;
    }
    
    .volume-slider::-webkit-slider-thumb:hover,
    .volume-slider::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 0 12px rgba(249, 140, 83, 0.7);
    }
    
    /* 设置面板 */
    .settings-panel {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #F9F2EF;
      border-radius: 12px;
      width: 320px;
      max-width: 90%;
      z-index: 9999;
      box-shadow: 0 8px 30px rgba(249, 140, 83, 0.3);
      border: 2px solid #F98C53;
      overflow: hidden;
    }
    
    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #FCCEB4;
      background-color: #FCCEB4;
    }
    
    .settings-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: #333;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      transition: all 0.2s ease;
    }
    
    .close-btn:hover {
      color: #F98C53;
      transform: scale(1.1);
    }
    
    .settings-tabs {
      display: flex;
      border-bottom: 1px solid #FCCEB4;
      background-color: #F9F2EF;
    }
    
    .settings-tab {
      flex: 1;
      padding: 14px 12px;
      text-align: center;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      font-weight: 500;
    }
    
    .settings-tab:hover {
      color: #F98C53;
      background-color: rgba(249, 140, 83, 0.05);
    }
    
    .settings-tab.active {
      color: #F98C53;
      font-weight: 600;
    }
    
    .settings-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 40%;
      height: 3px;
      background-color: #F98C53;
      border-radius: 3px 3px 0 0;
      background-color: #F98C53;
      box-shadow: 0 0 8px rgba(249, 140, 83, 0.6);
    }
    
    .settings-content {
      padding: 20px;
      max-height: 300px;
      overflow-y: auto;
      background-color: #F9F2EF;
    }
    
    .settings-section {
      margin-bottom: 20px;
    }
    
    .settings-item {
      margin-bottom: 18px;
    }
    
    .settings-label {
      color: #333;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
    }
    
    .settings-options {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .settings-option {
      padding: 8px 14px;
      background-color: #FFF;
      border-radius: 6px;
      color: #555;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #FCCEB4;
      font-weight: 500;
    }
    
    .settings-option:hover {
      background-color: #FFF5EF;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(249, 140, 83, 0.2);
      border-color: #F98C53;
    }
    
    .settings-option.active {
      background-color: #F98C53;
      color: white;
      box-shadow: 0 2px 10px rgba(249, 140, 83, 0.4);
      border: 1px solid #F98C53;
    }
    
    .settings-volume {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .volume-btn {
      background: none;
      border: none;
      color: white;
      padding: 0;
      cursor: pointer;
    }
    
    .settings-volume .volume-slider-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;
      margin: 0 10px;
      padding: 0 5px;
    }
    
    .settings-volume .volume-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 8px;
      background: rgba(249, 140, 83, 0.2);
      outline: none;
      opacity: 1;
      transition: all 0.3s ease;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .settings-volume .volume-slider:hover {
      background: rgba(249, 140, 83, 0.4);
      box-shadow: 0 0 5px rgba(249, 140, 83, 0.3);
    }
    
    .settings-volume .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #F98C53;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(249, 140, 83, 0.5);
      border: 2px solid #fff;
      transition: all 0.2s ease;
    }
    
    .settings-volume .volume-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #F98C53;
      cursor: pointer;
      border: 2px solid #fff;
      box-shadow: 0 0 8px rgba(249, 140, 83, 0.5);
      transition: all 0.2s ease;
    }
    
    .settings-volume .volume-slider::-webkit-slider-thumb:hover,
    .settings-volume .volume-slider::-moz-range-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 0 15px rgba(249, 140, 83, 0.8);
      background: #FF7B3A;
    }
    
    .volume-value {
      color: #333;
      font-size: 14px;
      min-width: 40px;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .settings-toggle {
      display: flex;
      gap: 10px;
    }
    
    .toggle-btn {
      background-color: rgba(255, 255, 255, 0.8);
      border: 1px solid #FCCEB4;
      color: #333;
      padding: 8px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .toggle-btn.active {
      background-color: #F98C53;
      color: white;
      border-color: #F98C53;
      box-shadow: 0 2px 8px rgba(249, 140, 83, 0.4);
      transform: translateY(-2px);
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    }
    
    /* 错误提示 */
    .video-error-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 5;
    }
    
    .error-icon {
      font-size: 48px;
      width: 80px;
      height: 80px;
      line-height: 80px;
      border-radius: 50%;
      background-color: rgba(255, 0, 0, 0.2);
      margin: 0 auto 20px;
      border: 2px solid rgba(255, 0, 0, 0.5);
    }
    
    .error-text {
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .error-hint {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    /* 图标样式 */
    .icon-play, .icon-pause, .icon-danmaku-on, .icon-danmaku-off,
    .icon-subtitle-on, .icon-subtitle-off, .icon-fullscreen, .icon-fullscreen-exit,
    .icon-web-fullscreen, .icon-web-fullscreen-exit, .icon-check,
    .icon-volume-high, .icon-volume-low, .icon-volume-mute, .icon-pip, .icon-pip-exit, .icon-settings {
      display: inline-block;
      width: 24px;
      height: 24px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .icon-play {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
    }
    
    .icon-pause {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/%3E%3C/svg%3E");
    }
    
    .icon-danmaku-on {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z'/%3E%3C/svg%3E");
    }
    
    .icon-danmaku-off {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 14.5L18.5 15H4V4h16v12.5z'/%3E%3Cpath d='M6 12h12v2H6zm0-3h12v2H6zm0-3h12v2H6z'/%3E%3C/svg%3E");
    }
    
    .icon-subtitle-on {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z'/%3E%3C/svg%3E");
    }
    
    .icon-subtitle-off {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z'/%3E%3C/svg%3E");
    }
    
    .icon-fullscreen {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'/%3E%3C/svg%3E");
    }
    
    .icon-fullscreen-exit {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z'/%3E%3C/svg%3E");
    }
    
    .icon-web-fullscreen {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z'/%3E%3C/svg%3E");
    }
    
    .icon-web-fullscreen-exit {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M15 3h2v7h-7V8h5V3zm0 18v-5h-5v-2h7v7h-2zM3 15h2v5h5v2H3v-7zm2-5H3V3h7v2H5v5z'/%3E%3C/svg%3E");
    }
    
    .icon-check {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F98C53'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E");
    }
    
    .icon-volume-high {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'/%3E%3C/svg%3E");
    }
    
    .icon-volume-low {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 9v6h4l5 5V4l-5 5H7z'/%3E%3Cpath d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z'/%3E%3C/svg%3E");
    }
    
    .icon-volume-mute {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'/%3E%3C/svg%3E");
    }
    
    .icon-pip {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z'/%3E%3C/svg%3E");
    }
    
    .icon-pip-exit {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M23 3H1v18h22V3zm-2 16H3V5h18v14zm-6-3h-6v-6h6v6z'/%3E%3C/svg%3E");
    }
    
    .icon-settings {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'/%3E%3C/svg%3E");
    }
    
    /* 课程侧边栏 */
    .course-sidebar {
      width: 300px;
      background-color: #F9F2EF;
      border-left: 2px solid #FCCEB4;
      overflow-y: auto;
      box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .sidebar-header {
      padding: 18px 15px;
      border-bottom: 2px solid #FCCEB4;
      background-color: #F98C53;
      box-shadow: 0 2px 8px rgba(249, 140, 83, 0.2);
    }
    
    .sidebar-header h3 {
      margin: 0;
      color: white;
      font-size: 18px;
      font-weight: 600;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.5px;
    }
    
    .chapter-list {
      padding: 15px;
    }
    
    .chapter-item {
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 3px 10px rgba(249, 140, 83, 0.15);
      transition: all 0.3s ease;
      transform-origin: center;
      border: 1px solid #FCCEB4;
    }
    
    .chapter-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(249, 140, 83, 0.25);
    }
    
    .chapter-header {
      padding: 14px 15px;
      background-color: #D2E0AA;
      border-radius: 4px 4px 0 0;
      margin-bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(249, 140, 83, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .chapter-header:hover {
      background-color: #c9d99e;
    }
    
    .chapter-title {
      margin: 0;
      font-size: 16px;
      color: #333;
      font-weight: 600;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
    }
    
    .lesson-list {
      padding: 5px 0;
      background-color: #fff;
    }
    
    .lesson-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 15px;
      border-bottom: 1px solid #F9F2EF;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .lesson-item::after {
      content: '';
      position: absolute;
      left: -100%;
      top: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(249, 140, 83, 0.1), transparent);
      transition: all 0.5s ease;
    }
    
    .lesson-item:hover {
      background-color: #F9F2EF;
      transform: translateX(5px);
      box-shadow: 0 1px 5px rgba(249, 140, 83, 0.1);
    }
    
    .lesson-item:hover::after {
      left: 100%;
    }
    
    .lesson-item.active {
      background-color: #FCCEB4;
      border-left: 4px solid #F98C53;
      box-shadow: 0 2px 8px rgba(249, 140, 83, 0.2);
    }
    
    .lesson-item.completed .lesson-index {
      background-color: #F98C53;
      color: white;
    }
    
    .lesson-info {
      display: flex;
      align-items: center;
    }
    
    .lesson-index {
      width: 26px;
      height: 26px;
      background-color: #ABD7FB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 12px;
      color: #333;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.8);
    }
    
    .lesson-item:hover .lesson-index {
      transform: scale(1.1) rotate(5deg);
    }
    
    .lesson-info h5 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
    
    .lesson-meta {
      display: flex;
      align-items: center;
    }
    
    .duration {
      font-size: 12px;
      color: #333;
      background-color: rgba(210, 224, 170, 0.6);
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .lesson-item:hover .duration {
      background-color: rgba(210, 224, 170, 0.9);
      transform: scale(1.05);
    }
    
    .completed-icon {
      margin-left: 5px;
    }
    
    /* 响应式调整 */
    @media (max-width: 768px) {
      .video-container {
        flex-direction: column;
        height: auto;
      }
      
      .player-wrapper {
        height: 56.25vw; /* 16:9 比例 */
      }
      
      .course-sidebar {
        width: 100%;
        height: auto;
        max-height: 300px;
      }
      
      .danmaku-input-container {
        width: 200px;
      }
    }
    </style>