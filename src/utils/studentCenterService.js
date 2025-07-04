import axios from 'axios';

// 设置API基础URL
const API_URL = 'http://localhost:8080/api/student/center';

/**
 * 学生中心服务
 */
const StudentCenterService = {
  /**
   * 获取最近观看的课程
   * @param {Number} studentId 学生ID
   * @param {Number} limit 限制数量，默认为4
   * @returns {Promise} 返回Promise对象
   */
  async getRecentCourses(studentId, limit = 4) {
    try {
      const response = await axios.get(`${API_URL}/recent-courses`, {
        params: { studentId, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('获取最近观看的课程失败:', error);
      return [];
    }
  },

  /**
   * 获取学习活跃度数据
   * @param {Number} studentId 学生ID
   * @param {Number} days 天数，默认为7
   * @returns {Promise} 返回Promise对象
   */
  async getActivityData(studentId, days = 7) {
    try {
      const response = await axios.get(`${API_URL}/activity`, {
        params: { studentId, days }
      });
      return response.data.data || { labels: [], data: [] };
    } catch (error) {
      console.error('获取活跃度数据失败:', error);
      return { labels: [], data: [] };
    }
  },

  /**
   * 获取学习进度分类数据
   * @param {Number} studentId 学生ID
   * @returns {Promise} 返回Promise对象
   */
  async getProgressCategoryData(studentId) {
    try {
      const response = await axios.get(`${API_URL}/progress-category`, {
        params: { studentId }
      });
      return response.data.data || { category: 'light', updatedLessons: 0 };
    } catch (error) {
      console.error('获取学习进度分类数据失败:', error);
      return { category: 'light', updatedLessons: 0 };
    }
  },

  /**
   * 获取订阅但未完成的课程
   * @param {Number} studentId 学生ID
   * @param {Number} limit 限制数量，默认为4
   * @returns {Promise} 返回Promise对象
   */
  async getSubscribedUncompletedCourses(studentId, limit = 4) {
    try {
      const response = await axios.get(`${API_URL}/subscribed-uncompleted`, {
        params: { studentId, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('获取未完成的课程失败:', error);
      return [];
    }
  },

  /**
   * 获取订阅且已完成的课程
   * @param {Number} studentId 学生ID
   * @param {Number} limit 限制数量，默认为3
   * @returns {Promise} 返回Promise对象
   */
  async getSubscribedCompletedCourses(studentId, limit = 3) {
    try {
      const response = await axios.get(`${API_URL}/subscribed-completed`, {
        params: { studentId, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('获取已完成的课程失败:', error);
      return [];
    }
  },

  /**
   * 获取收藏的课程
   * @param {Number} studentId 学生ID
   * @returns {Promise} 返回Promise对象
   */
  async getLikedCourses(studentId) {
    try {
      const response = await axios.get(`${API_URL}/liked-courses`, {
        params: { studentId }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('获取收藏的课程失败:', error);
      return [];
    }
  },

  /**
   * 获取所有订阅但未完成的课程
   * @param {Number} studentId 学生ID
   * @returns {Promise} 返回Promise对象
   */
  async getAllSubscribedUncompletedCourses(studentId) {
    try {
      const response = await axios.get(`${API_URL}/all-subscribed-uncompleted`, {
        params: { studentId }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('获取所有未完成的课程失败:', error);
      return [];
    }
  }
};

export default StudentCenterService; 