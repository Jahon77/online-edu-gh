import axios from './http';
import { useUserStore } from '../stores/user';

/**
 * 学生课程视频服务
 * 提供视频播放页面所需的API调用
 */
const studentCourseVideoService = {
  /**
   * 获取当前登录用户的ID
   * @returns {Number} 返回当前登录用户的ID
   */
  getCurrentUserId() {
    const userStore = useUserStore();
    return userStore.user.id;
  },
  /**
   * 获取视频播放进度
   * @param {Number} lessonId 课时ID
   * @param {Number} studentId 可选学生ID，不传则使用当前登录用户ID
   * @returns {Promise} 返回视频播放进度信息
   */
  getVideoProgress(lessonId, studentId) {
    if (!studentId) {
      studentId = this.getCurrentUserId();
    }
    return axios.get('/api/student/video/progress', {
      params: {
        studentId,
        lessonId
      }
    });
  },
  
  /**
   * 更新视频播放进度
   * @param {Object} progress 进度对象
   * @returns {Promise} 返回更新结果
   */
  updateVideoProgress(progress) {
    if (!progress.studentId) {
      progress.studentId = this.getCurrentUserId();
    }
    return axios.post('/api/student/video/progress', progress);
  },
  
  /**
   * 标记视频为已完成
   * @param {Number} lessonId 课时ID
   * @param {Number} studentId 可选学生ID，不传则使用当前登录用户ID
   * @returns {Promise} 返回标记结果
   */
  markVideoCompleted(lessonId, studentId) {
    if (!studentId) {
      studentId = this.getCurrentUserId();
    }
    return axios.post('/api/student/video/complete', null, {
      params: {
        studentId,
        lessonId
      }
    });
  },
  
  /**
   * 更新视频播放设置
   * @param {Number} lessonId 课时ID
   * @param {Number} playbackRate 播放速度
   * @param {String} qualitySetting 清晰度设置
   * @param {Boolean} subtitleEnabled 是否启用字幕
   * @param {Number} studentId 可选学生ID，不传则使用当前登录用户ID
   * @returns {Promise} 返回更新结果
   */
  updateVideoSettings(lessonId, playbackRate, qualitySetting, subtitleEnabled, studentId) {
    if (!studentId) {
      studentId = this.getCurrentUserId();
    }
    return axios.post('/api/student/video/settings', null, {
      params: {
        studentId,
        lessonId,
        playbackRate,
        qualitySetting,
        subtitleEnabled
      }
    });
  },
  
  /**
   * 更新视频高级设置
   * @param {Number} lessonId 课时ID
   * @param {Number} volume 音量
   * @param {Boolean} danmakuEnabled 是否启用弹幕
   * @param {Boolean} pipEnabled 是否启用画中画
   * @param {Number} studentId 可选学生ID，不传则使用当前登录用户ID
   * @returns {Promise} 返回更新结果
   */
  updateAdvancedSettings(lessonId, volume, danmakuEnabled, pipEnabled, studentId) {
    if (!studentId) {
      studentId = this.getCurrentUserId();
    }
    return axios.post('/api/student/video/advanced-settings', null, {
      params: {
        studentId,
        lessonId,
        volume,
        danmakuEnabled,
        pipEnabled
      }
    });
  },
  
  /**
   * 获取视频详情
   * @param {Number} lessonId 课时ID
   * @param {Number} studentId 可选学生ID，不传则使用当前登录用户ID
   * @returns {Promise} 返回视频详情
   */
  getVideoDetail(lessonId, studentId) {
    if (!studentId) {
      studentId = this.getCurrentUserId();
    }
    return axios.get('/api/student/video/detail', {
      params: {
        lessonId,
        studentId
      }
    });
  },

  /**
   * 获取课程章节和课时
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回课程章节和课时信息
   */
  getCourseChaptersAndLessons(courseId) {
    return axios.get(`/api/courses/${courseId}/chapters`);
  },

  /**
   * 获取课时的所有弹幕
   * @param {Number} lessonId 课时ID
   * @returns {Promise} 返回弹幕列表
   */
  getDanmakus(lessonId) {
    return axios.get('/api/student/video/danmaku', {
      params: {
        lessonId
      }
    });
  },

  /**
   * 获取指定时间范围内的弹幕
   * @param {Number} lessonId 课时ID
   * @param {Number} startTime 开始时间（秒）
   * @param {Number} endTime 结束时间（秒）
   * @returns {Promise} 返回弹幕列表
   */
  getDanmakusByTimeRange(lessonId, startTime, endTime) {
    return axios.get('/api/student/video/danmaku/range', {
      params: {
        lessonId,
        startTime,
        endTime
      }
    });
  },

  /**
   * 发送弹幕
   * @param {Object} danmaku 弹幕对象
   * @returns {Promise} 返回发送结果
   */
  sendDanmaku(danmaku) {
    if (!danmaku.studentId) {
      danmaku.studentId = this.getCurrentUserId();
    }
    return axios.post('/api/student/video/danmaku', danmaku);
  }
};

export default studentCourseVideoService; 