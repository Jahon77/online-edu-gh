import axios from './http';
import { useUserStore } from '../stores/user';

/**
 * 课程服务
 * 提供课程相关操作的API调用
 */
const courseService = {
  /**
   * 获取当前登录用户的ID
   * @returns {Number} 返回当前登录用户的ID
   */
  getCurrentUserId() {
    const userStore = useUserStore();
    return userStore.user.id;
  },

  /**
   * 获取课程详情
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回课程详情
   */
  async getCourseDetail(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.get(`/api/courses/${courseId}`, {
      params: { studentId }
    });
  },

  /**
   * 检查课程收藏状态
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回是否已收藏
   */
  async isCourseLiked(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.get(`/api/courses/${courseId}/like`, {
      params: { studentId }
    });
  },

  /**
   * 添加课程收藏
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回操作结果
   */
  async addCourseLike(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.post(`/api/courses/${courseId}/like`, null, {
      params: { studentId }
    });
  },

  /**
   * 取消课程收藏
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回操作结果
   */
  async removeCourseLike(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.delete(`/api/courses/${courseId}/like`, {
      params: { studentId }
    });
  },

  /**
   * 检查课程书签状态
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回是否已添加书签
   */
  async isCourseBookmarked(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.get(`/api/courses/${courseId}/bookmark`, {
      params: { studentId }
    });
  },

  /**
   * 添加课程书签
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回操作结果
   */
  async addCourseBookmark(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.post(`/api/courses/${courseId}/bookmark`, null, {
      params: { studentId }
    });
  },

  /**
   * 取消课程书签
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回操作结果
   */
  async removeCourseBookmark(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.delete(`/api/courses/${courseId}/bookmark`, {
      params: { studentId }
    });
  },

  /**
   * 检查课程订阅状态
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回是否已订阅
   */
  async isCourseSubscribed(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.get(`/api/courses/${courseId}/subscribe`, {
      params: { studentId }
    });
  },

  /**
   * 订阅课程
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回操作结果
   */
  async subscribeCourse(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.post(`/api/studentcourse/${courseId}/subscribe`, null, {
      params: { studentId }
    });
  },

  /**
   * 取消订阅课程
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回操作结果
   */
  async unsubscribeCourse(courseId) {
    const studentId = this.getCurrentUserId();
    return axios.delete(`/api/studentcourse/${courseId}/unsubscribe`, {
      params: { studentId }
    });
  },

  /**
   * 获取课程章节和课时信息
   * @param {Number} courseId 课程ID
   * @returns {Promise} 返回章节和课时信息
   */
  async getCourseChapters(courseId) {
    return axios.get(`/api/teacher/courses/${courseId}/chapters`);
  },

  /**
   * 提交课程评论
   * @param {Number} courseId 课程ID
   * @param {String} content 评论内容
   * @param {Number} rating 评分
   * @param {String} username 用户名
   * @param {String} userAvatar 用户头像
   * @returns {Promise} 返回操作结果
   */
  async addCourseComment(courseId, content, rating, username, userAvatar) {
    const studentId = this.getCurrentUserId();
    return axios.post(`/api/courses/${courseId}/comments`, null, {
      params: { studentId, content, rating, username, userAvatar }
    });
  },

  /**
   * 获取课程评论
   * @param {Number} courseId 课程ID
   * @param {Number} page 页码
   * @param {Number} size 每页数量
   * @returns {Promise} 返回评论列表
   */
  async getCourseComments(courseId, page = 1, size = 10) {
    return axios.get(`/api/courses/${courseId}/comments`, {
      params: { page, size }
    });
  }
};

export default courseService;