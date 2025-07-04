import axios from '@/utils/http'

/**
 * 课程列表服务
 * 用于获取课程列表数据
 */
export default {
  /**
   * 获取所有课程
   * @returns {Promise<Array>} 课程列表
   */
  getAllCourses() {
    console.log('正在获取所有课程数据...');
    return axios.get('/api/studentcourse/all')
      .then(response => {
        console.log('获取课程响应:', response);
        // 检查响应是否成功且包含数据
        if (response.data && response.data.status === 0) {
          // 直接返回数据数组
          console.log('成功获取课程数据，数量:', response.data.data ? response.data.data.length : 0);
          return response.data.data || [];
        } else if (response.data && response.data.code === 200) {
          // 尝试使用另一种响应格式
          console.log('使用备用格式获取课程数据，数量:', response.data.data ? response.data.data.length : 0);
          return response.data.data || [];
        } else {
          console.warn('获取课程列表失败:', response.data ? response.data.message || response.data.msg : '未知错误');
          return [];
        }
      })
      .catch(error => {
        console.error('获取课程列表出错:', error);
        return [];
      });
  },

  /**
   * 根据分类筛选课程
   * @param {string} category 课程分类
   * @returns {Promise<Array>} 课程列表
   */
  getCoursesByCategory(category) {
    return this.getAllCourses()
      .then(courses => {
        if (!category) return courses;
        return courses.filter(course => course.category === category);
      });
  },

  /**
   * 根据级别筛选课程
   * @param {string} level 课程级别
   * @returns {Promise<Array>} 课程列表
   */
  getCoursesByLevel(level) {
    return this.getAllCourses()
      .then(courses => {
        if (!level) return courses;
        return courses.filter(course => course.level === level);
      });
  },

  /**
   * 根据排序方式排序课程
   * @param {string} sortType 排序方式：recommend-推荐，new-最新，hot-热门
   * @returns {Promise<Array>} 课程列表
   */
  getCoursesBySortType(sortType, courses) {
    if (!courses) {
      return this.getAllCourses().then(courses => this.sortCourses(sortType, courses));
    }
    return Promise.resolve(this.sortCourses(sortType, courses));
  },

  /**
   * 对课程进行排序
   * @param {string} sortType 排序方式
   * @param {Array} courses 课程列表
   * @returns {Array} 排序后的课程列表
   */
  sortCourses(sortType, courses) {
    if (!courses || courses.length === 0) return [];
    
    const coursesCopy = [...courses];
    
    switch (sortType) {
      case 'new':
        // 按创建时间排序（最新的在前）
        return coursesCopy.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });
      case 'hot':
        // 按订阅人数排序（从高到低）
        return coursesCopy.sort((a, b) => {
          const aCount = a.subscriberCount || 0;
          const bCount = b.subscriberCount || 0;
          return bCount - aCount;
        });
      case 'recommend':
      default:
        // 默认推荐排序：先按订阅人数，再按创建时间
        return coursesCopy.sort((a, b) => {
          const aCount = a.subscriberCount || 0;
          const bCount = b.subscriberCount || 0;
          
          if (bCount !== aCount) {
            return bCount - aCount;
          }
          
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });
    }
  },

  /**
   * 综合筛选课程
   * @param {Object} filters 筛选条件
   * @param {string} filters.category 课程分类
   * @param {string} filters.level 课程级别
   * @param {string} filters.sortType 排序方式
   * @param {string} filters.search 搜索关键词
   * @returns {Promise<Array>} 课程列表
   */
  filterCourses(filters) {
    const { category, level, sortType, search } = filters;
    
    return this.getAllCourses()
      .then(courses => {
        // 应用分类筛选
        let filteredCourses = courses;
        
        if (category) {
          filteredCourses = filteredCourses.filter(course => course.category === category);
        }
        
        // 应用级别筛选
        if (level) {
          filteredCourses = filteredCourses.filter(course => course.level === level);
        }
        
        // 应用搜索关键词筛选
        if (search) {
          const searchLower = search.toLowerCase();
          filteredCourses = filteredCourses.filter(course => 
            (course.title && course.title.toLowerCase().includes(searchLower)) ||
            (course.introMd && course.introMd.toLowerCase().includes(searchLower)) ||
            (course.category && course.category.toLowerCase().includes(searchLower)) ||
            (course.level && course.level.toLowerCase().includes(searchLower))
          );
        }
        
        // 应用排序
        return this.sortCourses(sortType, filteredCourses);
      });
  }
} 