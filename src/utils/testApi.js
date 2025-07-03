import axios from './http'

/**
 * 测试API调用
 */
export default {
  /**
   * 测试获取所有课程
   */
  testGetAllCourses() {
    console.log("开始测试获取所有课程...");
    
    return axios.get('/api/studentcourse/all')
      .then(response => {
        console.log("API响应:", response);
        
        if (response.data && response.data.status === 0) {
          console.log("获取成功，课程数据:", response.data.data);
          return response.data.data;
        } else {
          console.warn("获取失败，错误信息:", response.data ? response.data.message : "未知错误");
          return null;
        }
      })
      .catch(error => {
        console.error("API调用出错:", error);
        
        if (error.response) {
          console.error("错误响应:", error.response);
        }
        
        return null;
      });
  }
} 