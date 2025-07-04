<template>
      <div class="course-list-page">
    <!-- 顶部导航栏 -->
    <header class="site-header">
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
            <img src="/src/assets/images/course/course-teacher/teacher1.png" alt="用户头像">
          </div>
          <button class="btn-logout" @click="logout">退出登录</button>
        </div>
      </div>
    </header>

    <!-- 轮播Banner区 -->
    <div class="banner-slider">
      <div class="slider-container">
        <div v-for="(image, index) in carouselImages" 
             :key="index" 
             class="slider-item" 
             :class="{ active: currentSlide === index }">
          <img :src="image.url" :alt="image.alt">
          <div class="slider-content">
            <h2>{{image.title}}</h2>
            <p>{{image.description}}</p>
            <button class="btn-explore">立即探索</button>
          </div>
        </div>
      </div>
      <button class="slider-control prev" @click="prevSlide">❮</button>
      <button class="slider-control next" @click="nextSlide">❯</button>
      
      <!-- 进度条已移除 -->
      
      <div class="slider-dots">
        <span v-for="(_, index) in carouselImages" 
              :key="index" 
              class="dot" 
              :class="{ active: currentSlide === index }"
              @click="setSlide(index)"></span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 分类导航 -->
      <div class="category-nav">
        <h2 class="section-title">发现好课</h2>
        <div class="category-tabs">
          <button 
            class="category-tab" 
            :class="{ active: currentCategory === '' }"
            @click="changeCategory('')">全部课程</button>
          <button 
            class="category-tab" 
            :class="{ active: currentCategory === '学科主修' }"
            @click="changeCategory('学科主修')">学科主修</button>
          <button 
            class="category-tab" 
            :class="{ active: currentCategory === '职场技能' }"
            @click="changeCategory('职场技能')">职场技能</button>
          <button 
            class="category-tab" 
            :class="{ active: currentCategory === '人文通识' }"
            @click="changeCategory('人文通识')">人文通识</button>
          <button 
            class="category-tab" 
            :class="{ active: currentCategory === '考研督学' }"
            @click="changeCategory('考研督学')">考研督学</button>
          <button 
            class="category-tab" 
            :class="{ active: currentCategory === '兴趣探索' }"
            @click="changeCategory('兴趣探索')">兴趣探索</button>
        </div>
      </div>

      <!-- 筛选区 -->
      <div class="filter-section">
          <div class="tabs">
            <button :class="{active: sort==='recommend'}" @click="changeSort('recommend')">推荐</button>
            <button :class="{active: sort==='new'}" @click="changeSort('new')">最新</button>
            <button :class="{active: sort==='hot'}" @click="changeSort('hot')">热门</button>
          </div>
          <div class="filters">
            <select v-model="level">
              <option value="">全部层级</option>
              <option value="基础">基础</option>
              <option value="目标">目标</option>
              <option value="菁英">菁英</option>
            </select>
            <select v-model="subject">
            <option value="">全部分类</option>
              <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
            </select>
          <button @click="applyFilters" class="filter-btn">筛选</button>
          </div>
        </div>

      <!-- 课程列表 -->
      <div class="course-layout">
        <!-- 第一行：图片和一门课程 -->
        <div class="course-row first-row">
          <!-- 左侧大图 -->
          <div class="featured-image">
            <img :src="getCategoryImage()" alt="分类特色图" class="category-image">
          </div>
          
          <!-- 右侧第一门课程 -->
          <div 
            v-if="displayedCourses.length > 0" 
            class="course-card first-course"
            @click="goDetail(displayedCourses[0].id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="displayedCourses[0].coverUrl || '/src/assets/images/course/list-show1.png'" alt="课程封面" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(displayedCourses[0].level)}`">{{ displayedCourses[0].level }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ displayedCourses[0].title }}</h3>
                <p class="card-category">{{ displayedCourses[0].category }}</p>
                <p class="card-intro">{{ displayedCourses[0].introMd ? displayedCourses[0].introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ displayedCourses[0].subscriberCount || 0 }}人已订阅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 第二行：三门课程 -->
        <div class="course-row">
          <!-- 显示索引1的课程（第2门课） -->
          <div 
            v-if="displayedCourses.length > 1" 
            class="course-card"
            @click="goDetail(displayedCourses[1].id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="displayedCourses[1].coverUrl || '/src/assets/images/course/list-show2.png'" alt="课程封面" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(displayedCourses[1].level)}`">{{ displayedCourses[1].level }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ displayedCourses[1].title }}</h3>
                <p class="card-category">{{ displayedCourses[1].category }}</p>
                <p class="card-intro">{{ displayedCourses[1].introMd ? displayedCourses[1].introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ displayedCourses[1].subscriberCount || 0 }}人已订阅</span>
            </div>
          </div>
        </div>
        </div>
          </div>
          
          <!-- 显示索引2的课程（第3门课） -->
          <div 
            v-if="displayedCourses.length > 2" 
            class="course-card"
            @click="goDetail(displayedCourses[2].id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="displayedCourses[2].coverUrl || '/src/assets/images/course/list-show3.png'" alt="课程封面" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(displayedCourses[2].level)}`">{{ displayedCourses[2].level }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ displayedCourses[2].title }}</h3>
                <p class="card-category">{{ displayedCourses[2].category }}</p>
                <p class="card-intro">{{ displayedCourses[2].introMd ? displayedCourses[2].introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ displayedCourses[2].subscriberCount || 0 }}人已订阅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 显示索引3的课程（第4门课） -->
          <div 
            v-if="displayedCourses.length > 3" 
            class="course-card"
            @click="goDetail(displayedCourses[3].id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="displayedCourses[3].coverUrl || '/src/assets/images/course/list-show4.png'" alt="课程封面" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(displayedCourses[3].level)}`">{{ displayedCourses[3].level }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ displayedCourses[3].title }}</h3>
                <p class="card-category">{{ displayedCourses[3].category }}</p>
                <p class="card-intro">{{ displayedCourses[3].introMd ? displayedCourses[3].introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ displayedCourses[3].subscriberCount || 0 }}人已订阅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 第三行：三门课程 -->
        <div class="course-row">
          <!-- 显示索引4的课程（第5门课） -->
          <div 
            v-if="displayedCourses.length > 4" 
            class="course-card"
            @click="goDetail(displayedCourses[4].id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="displayedCourses[4].coverUrl || '/src/assets/images/course/list-show1.png'" alt="课程封面" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(displayedCourses[4].level)}`">{{ displayedCourses[4].level }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ displayedCourses[4].title }}</h3>
                <p class="card-category">{{ displayedCourses[4].category }}</p>
                <p class="card-intro">{{ displayedCourses[4].introMd ? displayedCourses[4].introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ displayedCourses[4].subscriberCount || 0 }}人已订阅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 显示索引5的课程（第6门课） -->
          <div 
            v-if="displayedCourses.length > 5" 
            class="course-card"
            @click="goDetail(displayedCourses[5].id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="displayedCourses[5].coverUrl || '/src/assets/images/course/list-show2.png'" alt="课程封面" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(displayedCourses[5].level)}`">{{ displayedCourses[5].level }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ displayedCourses[5].title }}</h3>
                <p class="card-category">{{ displayedCourses[5].category }}</p>
                <p class="card-intro">{{ displayedCourses[5].introMd ? displayedCourses[5].introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ displayedCourses[5].subscriberCount || 0 }}人已订阅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 显示索引6的课程（第7门课） -->
          <div 
            v-if="displayedCourses.length > 6" 
            class="course-card"
            @click="goDetail(displayedCourses[6].id)"
          >
            <div class="course-card-inner">
              <div class="card-image">
                <img :src="displayedCourses[6].coverUrl || '/src/assets/images/course/list-show3.png'" alt="课程封面" class="cover">
                <div class="card-tag" :class="`level-${getLevelClass(displayedCourses[6].level)}`">{{ displayedCourses[6].level }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ displayedCourses[6].title }}</h3>
                <p class="card-category">{{ displayedCourses[6].category }}</p>
                <p class="card-intro">{{ displayedCourses[6].introMd ? displayedCourses[6].introMd.slice(0, 40) + '...' : '' }}</p>
                <div class="card-footer">
                  <div class="students">
                    <span>{{ displayedCourses[6].subscriberCount || 0 }}人已订阅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div class="explore-more-container">
        <button @click="goToFilterPage" class="explore-more-btn">
          <span>加载更多</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- 精选推荐区 -->
      <div class="featured-section">
        <h2 class="section-title">精选推荐</h2>
        <div class="featured-grid">
          <div class="featured-card big-card">
            <img src="/src/assets/images/course/course-bar/course-bar1-1.png" alt="精选课程">
            <div class="featured-content">
              <h3>2025备考指导</h3>
              <p>全学科高分策略 · 高效学习规划</p>
              <div class="tag">热门</div>
            </div>
          </div>
          <div class="featured-card">
            <img src="/src/assets/images/course/course-bar/course-bar2-2.png" alt="精选课程">
            <div class="featured-content">
              <h3>数学思维训练营</h3>
              <p>提高解题能力和数学思维</p>
              <div class="tag tag-green">基础</div>
            </div>
          </div>
          <div class="featured-card">
            <img src="/src/assets/images/course/course-bar/course-bar3-3.png" alt="精选课程">
            <div class="featured-content">
              <h3>英语听力突破</h3>
              <p>独家听力训练方法</p>
              <div class="tag tag-blue">进阶</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 培优体系区域 -->
      <div class="training-system">
        <div class="training-content">
          <h2 class="section-title">培优体系</h2>
          <p class="training-subtitle">首创"贯通式"培养，只提供对孩子有用的长效培优体系</p>
          
          <div class="training-items">
            <div class="training-item">
              <div class="item-icon item-icon-1"></div>
              <div class="item-text">
                <h3>素质培养</h3>
                <p>以国家战略为导向，以素养人才的最新标准为教研准则</p>
              </div>
            </div>
            
            <div class="training-item">
              <div class="item-icon item-icon-2"></div>
              <div class="item-text">
                <h3>升学规划</h3>
                <p>通过AI技术，为学生提供全面、个性化、深层次的升学规划服务</p>
              </div>
            </div>
            
            <div class="training-item">
              <div class="item-icon item-icon-3"></div>
              <div class="item-text">
                <h3>赛考服务</h3>
                <p>提供一站式权威赛事辅导，助力特长培养，收获竞赛好成绩</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教学成果展示区 -->
      <div class="achievement-section">
        <h2 class="section-title">教学成果</h2>
        
        <!-- 成果展示标签页 -->
        <div class="achievement-tabs">
          <button class="tab-btn active" data-tab="tab1">考研督学</button>
          <button class="tab-btn" data-tab="tab2">职场技能</button>
          <button class="tab-btn" data-tab="tab3">兴趣探索</button>
          <div class="tab-indicator"></div>
        </div>
        
        <!-- 成果展示内容 -->
        <div class="achievement-content">
          <!-- 考研督学 -->
          <div class="achievement-item active" id="tab1">
            <div class="achievement-image">
              <img src="/src/assets/images/course/course-show/systen1.png" alt="考研督学成果">
              <div class="achievement-badge">
                <span>98%</span>
                <small>通过率</small>
              </div>
            </div>
            <div class="achievement-info">
              <h3>考研督学<span class="highlight">卓越成果</span></h3>
              <div class="achievement-stats">
                <div class="stat-item">
                  <span class="stat-number">5000+</span>
                  <span class="stat-label">学员</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">98%</span>
                  <span class="stat-label">通过率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">80%</span>
                  <span class="stat-label">名校录取</span>
                </div>
              </div>
              <p class="achievement-desc">
                智学通考研督学项目已成功帮助5000+学员实现考研梦想，通过率高达98%，其中80%被985/211名校录取。我们的专业导师团队提供全程跟踪指导，从备考规划、学习方法到心理调适，全方位保障学员高效备考。
              </p>
              <div class="achievement-tags">
                <span class="tag">专业规划</span>
                <span class="tag">名师指导</span>
                <span class="tag">心理辅导</span>
                <span class="tag">模拟训练</span>
              </div>
            </div>
          </div>
          
          <!-- 职场技能 -->
          <div class="achievement-item" id="tab2">
            <div class="achievement-image">
              <img src="/src/assets/images/course/course-show/systen1.png" alt="职场技能成果">
              <div class="achievement-badge">
                <span>92%</span>
                <small>就业率</small>
              </div>
            </div>
            <div class="achievement-info">
              <h3>职场技能<span class="highlight">实战成果</span></h3>
              <div class="achievement-stats">
                <div class="stat-item">
                  <span class="stat-number">8000+</span>
                  <span class="stat-label">学员</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">92%</span>
                  <span class="stat-label">就业率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">85%</span>
                  <span class="stat-label">薪资提升</span>
                </div>
              </div>
              <p class="achievement-desc">
                智学通职场技能培训已帮助8000+学员成功实现职业转型与晋升，就业率高达92%，平均薪资提升85%。我们与500+知名企业建立深度合作，提供实战项目和就业推荐，让学员在实践中掌握核心竞争力。
              </p>
              <div class="achievement-tags">
                <span class="tag">实战项目</span>
                <span class="tag">企业对接</span>
                <span class="tag">岗位推荐</span>
                <span class="tag">职业规划</span>
              </div>
            </div>
          </div>
          
          <!-- 兴趣探索 -->
          <div class="achievement-item" id="tab3">
            <div class="achievement-image">
              <img src="/src/assets/images/course/course-show/systen1.png" alt="兴趣探索成果">
              <div class="achievement-badge">
                <span>96%</span>
                <small>满意度</small>
              </div>
            </div>
            <div class="achievement-info">
              <h3>兴趣探索<span class="highlight">精彩成果</span></h3>
              <div class="achievement-stats">
                <div class="stat-item">
                  <span class="stat-number">12000+</span>
                  <span class="stat-label">学员</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">96%</span>
                  <span class="stat-label">满意度</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">300+</span>
                  <span class="stat-label">课程</span>
                </div>
              </div>
              <p class="achievement-desc">
                智学通兴趣探索课程覆盖艺术、运动、手工、烹饪等300+品类，已服务12000+学员，满意度高达96%。我们注重培养学员的创造力和自我表达能力，让学习成为一种乐趣，帮助学员发现并发展自己的兴趣特长。
              </p>
              <div class="achievement-tags">
                <span class="tag">兴趣培养</span>
                <span class="tag">创意激发</span>
                <span class="tag">能力提升</span>
                <span class="tag">快乐学习</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优秀师资展示 -->
      <div class="teacher-section">
        <div class="teacher-section-bg"></div>
        <div class="teacher-section-content">
          <h2 class="section-title">严选优秀师资</h2>
          <p class="teacher-subtitle">成员资质如下</p>
          
          <div class="teacher-tags">
            <div class="teacher-tag">平均教龄9年+</div>
            <div class="teacher-tag">清北名校毕业</div>
            <div class="teacher-tag">全国明星教师</div>
            <div class="teacher-tag">高考试题资深研究员</div>
            <div class="teacher-tag">学科带头人</div>
          </div>
          
          <div class="teacher-list">
            <!-- 教师1 -->
            <div class="teacher-card" data-aos="fade-up" data-aos-delay="100">
              <div class="teacher-card-inner">
                <div class="teacher-avatar-wrapper">
                  <img src="/src/assets/images/course/course-teacher/teacher1.png" alt="李楠老师" class="teacher-avatar">
                  <div class="teacher-avatar-overlay"></div>
                </div>
                <h3 class="teacher-name">李楠 <span class="teacher-badge">高中物理主讲</span></h3>
                <p class="teacher-education">毕业于清华大学 <span class="teacher-exp">15年教龄</span></p>
                <p class="teacher-intro">前航天工程师，善于研究物理运动规律，提升学生科学思维能力</p>
                <div class="teacher-id">教师资格证：201811001410003x1</div>
                <div class="teacher-card-blur"></div>
              </div>
            </div>
            
            <!-- 教师2 -->
            <div class="teacher-card" data-aos="fade-up" data-aos-delay="200">
              <div class="teacher-card-inner">
                <div class="teacher-avatar-wrapper">
                  <img src="/src/assets/images/course/course-teacher/teacher1.png" alt="胡源老师" class="teacher-avatar">
                  <div class="teacher-avatar-overlay"></div>
                </div>
                <h3 class="teacher-name">胡源 <span class="teacher-badge">高中数学主讲</span></h3>
                <p class="teacher-education">毕业于北京大学 <span class="teacher-exp">12年教龄</span></p>
                <p class="teacher-intro">完备的数学体系与原创技巧，让学生"用念想维解题，用问题思维答题"</p>
                <div class="teacher-id">教师资格证：201911001410240x6</div>
                <div class="teacher-card-blur"></div>
              </div>
            </div>
            
            <!-- 教师3 -->
            <div class="teacher-card" data-aos="fade-up" data-aos-delay="300">
              <div class="teacher-card-inner">
                <div class="teacher-avatar-wrapper">
                  <img src="/src/assets/images/course/course-teacher/teacher1.png" alt="常美美老师" class="teacher-avatar">
                  <div class="teacher-avatar-overlay"></div>
                </div>
                <h3 class="teacher-name">常美美 <span class="teacher-badge">英语博雅主讲</span></h3>
                <p class="teacher-education">毕业于北京大学 <span class="teacher-exp">8年教龄</span></p>
                <p class="teacher-intro">文科第一名考取北京大学，央媒国家级出版社合作讲师，"冰心杯"征文特约老师</p>
                <div class="teacher-id">教师资格证：202113601420060x4</div>
                <div class="teacher-card-blur"></div>
              </div>
            </div>
            
            <!-- 教师4 -->
            <div class="teacher-card" data-aos="fade-up" data-aos-delay="400">
              <div class="teacher-card-inner">
                <div class="teacher-avatar-wrapper">
                  <img src="/src/assets/images/course/course-teacher/teacher1.png" alt="顾静老师" class="teacher-avatar">
                  <div class="teacher-avatar-overlay"></div>
                </div>
                <h3 class="teacher-name">顾静 <span class="teacher-badge">少儿编程主讲</span></h3>
                <p class="teacher-education">华东理工大学硕士 <span class="teacher-exp">11年教龄</span></p>
                <p class="teacher-intro">信息学竞赛同步选手，中科院软件研究员，海淀区智慧杯大赛金牌专家</p>
                <div class="teacher-id">教师资格证：2022140014xxxx1</div>
                <div class="teacher-card-blur"></div>
              </div>
            </div>
            
            <!-- 教师5 -->
            <div class="teacher-card" data-aos="fade-up" data-aos-delay="500">
              <div class="teacher-card-inner">
                <div class="teacher-avatar-wrapper">
                  <img src="/src/assets/images/course/course-teacher/teacher1.png" alt="赵建昆老师" class="teacher-avatar">
                  <div class="teacher-avatar-overlay"></div>
                </div>
                <h3 class="teacher-name">赵建昆 <span class="teacher-badge">语言英语带头人</span></h3>
                <p class="teacher-education">爱丁堡大学硕士 <span class="teacher-exp">22年教龄</span></p>
                <p class="teacher-intro">教育行业多年知名，专注英语学习规划与语言人文素养的提升</p>
                <div class="teacher-id">教师资格证：2018110014xxxx5</div>
                <div class="teacher-card-blur"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习路径区 -->
      <div class="learning-path" data-aos="fade-up">
        <div class="learning-path-bg"></div>
        <h2 class="section-title">学习路径</h2>
        <p class="learning-path-subtitle">定制个性化学习之旅，助你一步步实现目标</p>
        
        <div class="path-container">
          <div class="path-line"></div>
          
          <div class="path-steps">
            <div class="path-step" data-aos="zoom-in" data-aos-delay="100">
              <div class="step-icon">
                <span class="step-number">1</span>
                <svg class="step-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="step-content">
                <h3>选择课程</h3>
                <p>根据学习需求选择合适的课程，我们提供专业的课程推荐</p>
                <div class="step-indicator">第一阶段</div>
              </div>
            </div>
            
            <div class="path-step" data-aos="zoom-in" data-aos-delay="200">
              <div class="step-icon">
                <span class="step-number">2</span>
                <svg class="step-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v9l4 4m5-9a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="step-content">
                <h3>系统学习</h3>
                <p>按照课程规划系统学习，掌握核心知识点和技能</p>
                <div class="step-indicator">第二阶段</div>
              </div>
            </div>
            
            <div class="path-step" data-aos="zoom-in" data-aos-delay="300">
              <div class="step-icon">
                <span class="step-number">3</span>
                <svg class="step-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <div class="step-content">
                <h3>完成作业</h3>
                <p>巩固所学知识点，通过实践练习加深理解</p>
                <div class="step-indicator">第三阶段</div>
              </div>
            </div>
            
            <div class="path-step" data-aos="zoom-in" data-aos-delay="400">
              <div class="step-icon">
                <span class="step-number">4</span>
                <svg class="step-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="step-content">
                <h3>能力提升</h3>
                <p>全面提升学科能力，实现个人成长与突破</p>
                <div class="step-indicator">第四阶段</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="learning-path-cta">
          <button class="path-btn" @click="startLearningJourney">开始我的学习之旅</button>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>智学通致力于为学生提供高质量的在线学习体验</p>
        </div>
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li><a href="#">首页</a></li>
            <li><a href="#">课程</a></li>
            <li><a href="#">教师</a></li>
            <li><a href="#">学习资源</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>联系我们</h3>
          <p>电话: 400-888-8888</p>
          <p>邮箱: support@slp.com</p>
        </div>
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-icons">
            <a href="#" class="social-icon">W</a>
            <a href="#" class="social-icon">F</a>
            <a href="#" class="social-icon">T</a>
          </div>
        </div>
      </div>
      <div class="copyright">
        <p>© 2025 智学通 版权所有</p>
        <button @click="testApiCall" class="test-api-btn">测试API</button>
      </div>
    </footer>
      </div>
    </template>
    
    <script>
    import axios from '@/utils/http' // 使用封装好的http模块
    import studentCourseListService from '@/utils/studentCourseListService'
    import testApi from '@/utils/testApi'
    
    export default {
      name: 'CourseList',
      computed: {
        // 只显示7门课程
        displayedCourses() {
          return this.courses.slice(0, 7);
        }
      },
      data() {
        return {
          courses: [],
          allCourses: [], // 存储所有课程，用于探索更多
          sort: 'recommend',
          level: '',
          subject: '',
      currentCategory: '', // 当前选中的课程分类
      subjects: ['学科主修', '职场技能', '人文通识', '考研督学', '兴趣探索'], // 更新为新的分类
      categoryImages: { // 分类图片映射
        '': '/src/assets/images/course/course-bar/course-bar1-1.png', // 全部课程
        '学科主修': '/src/assets/images/course/course-bar/course-bar1-3.png',
        '职场技能': '/src/assets/images/course/course-bar/course-bar1-2.png',
        '人文通识': '/src/assets/images/course/course-bar/course-bar1-7.png',
        '考研督学': '/src/assets/images/course/course-bar/course-bar1-4.png',
        '兴趣探索': '/src/assets/images/course/course-bar/course-bar1-6.png'
      },
      trainingItems: [
        { 
          title: '素质培养', 
          description: '以国家战略为导向，以素养人才的最新标准为教研准则',
          icon: 'cube'
        },
        { 
          title: '升学规划', 
          description: '通过AI技术，为学生提供全面、个性化、深层次的升学规划服务',
          icon: 'arrow'
        },
        { 
          title: '赛考服务', 
          description: '提供一站式权威赛事辅导，助力特长培养，收获竞赛好成绩',
          icon: 'star'
        }
      ],
      currentSlide: 0,
      carouselImages: [
        { 
          url: '/src/assets/images/course/list-show1.png', 
          alt: '轮播图1',
          title: '精品课程，成就未来',
          description: '海量优质课程，助你实现学习目标'
        },
        { 
          url: '/src/assets/images/course/list-show2.png', 
          alt: '轮播图2',
          title: '名师授课，学习无忧',
          description: '一线名师在线指导，助你攻克学习难关'
        },
        { 
          url: '/src/assets/images/course/list-show3.png', 
          alt: '轮播图3',
          title: '个性化学习，提高效率',
          description: '根据学习需求定制专属学习计划'
        },
        { 
          url: '/src/assets/images/course/list-show4.png', 
          alt: '轮播图4',
          title: '全面提升，综合发展',
          description: '全方位培养能力，助力综合素质提升'
        }
      ],
      // progressWidth已移除
        }
      },
      mounted() {
        this.fetchCourses();
        this.startCarousel(); // 启动轮播
        window.addEventListener('scroll', this.handleScroll); // 添加滚动监听
        
        // 添加成果展示标签页切换功能
        this.initAchievementTabs();
        
        // 初始化教师卡片3D效果
        this.initTeacherCards();
        
        // 测试API调用
        console.log("开始测试API调用...");
        testApi.testGetAllCourses().then(courses => {
          console.log("测试API调用结果:", courses ? `成功获取${courses.length}门课程` : "获取失败");
        });
      },
      beforeUnmount() {
        this.stopCarousel(); // 清理定时器
        window.removeEventListener('scroll', this.handleScroll); // 移除滚动监听
      },
      methods: {
        getCardColor(level) {
          switch (level) {
            case '基础': return '#D2E0AA';
            case '目标': return '#ABD7FB';
            case '菁英': return '#F98C53';
            default: return '#F9F2EF';
          }
        },
    getLevelClass(level) {
      switch (level) {
        case '基础': return 'basic';
        case '目标': return 'target';
        case '菁英': return 'elite';
        default: return 'default';
      }
    },
        changeSort(s) {
          this.sort = s;
          this.fetchCourses();
        },
        goDetail(id) {
          this.$router.push({ name: 'CourseDetail', params: { id } });
        },
    // 处理分类切换
    changeCategory(category) {
      this.currentCategory = category;
      this.subject = ''; // 重置下拉菜单选择
      this.fetchCourses();
    },
    
    // 应用筛选条件
    applyFilters() {
      if (this.subject) {
        this.currentCategory = ''; // 如果选择了下拉菜单中的分类，重置顶部导航选择
      }
      this.fetchCourses();
    },
    
    // 跳转到高级筛选页面
    goToFilterPage() {
      // 构建查询参数
      const queryParams = {};
      
      if (this.sort && this.sort !== 'recommend') {
        queryParams.sort = this.sort;
      }
      
      if (this.level) {
        queryParams.level = this.level;
      }
      
      // 使用顶部导航栏选择的分类或下拉列表选择的分类
      const category = this.currentCategory || this.subject;
      if (category) {
        queryParams.category = category;
      }
      
      // 跳转到筛选页面，带上查询参数
      this.$router.push({
        name: 'CourseFilterPage',
        query: queryParams
      });
    },
    
        async fetchCourses() {
      console.log("当前分类:", this.currentCategory, "当前主题:", this.subject);
      try {
        // 构建筛选条件
        const filters = {
          category: this.currentCategory || this.subject || '',
          level: this.level || '',
          sortType: this.sort || 'recommend'
        };
        
        console.log("应用筛选条件:", filters);
        
        // 使用服务进行筛选
        const courses = await studentCourseListService.filterCourses(filters);
        
        console.log("获取到原始课程数据:", courses);
        
        if (courses && Array.isArray(courses) && courses.length > 0) {
          this.allCourses = courses;
          this.courses = courses;
          console.log("设置课程数据成功，共", this.courses.length, "门课程");
        } else {
          console.warn('未获取到课程数据或数据为空');
          this.allCourses = [];
          this.courses = [];
        }
      } catch (err) {
        console.error('获取课程列表失败:', err);
        this.allCourses = [];
        this.courses = [];
      }
    },
    
    // 探索更多功能
    // 获取分类对应的图片
    getCategoryImage() {
      const category = this.currentCategory || '';
      return this.categoryImages[category];
    },
    
    // 探索更多功能
    exploreMore() {
      // 构建查询参数
      const queryParams = new URLSearchParams();
      
      if (this.sort && this.sort !== 'recommend') {
        queryParams.append('sort', this.sort);
      }
      
      if (this.level) {
        queryParams.append('level', this.level);
      }
      
      // 使用顶部导航栏选择的分类或下拉列表选择的分类
      const category = this.currentCategory || this.subject;
      if (category) {
        queryParams.append('category', category);
      }
      
      // 跳转到筛选页面，带上查询参数
      this.$router.push({
        name: 'CourseFilterPage',
        query: Object.fromEntries(queryParams)
      });
    },
    // 轮播相关方法
    startCarousel() {
      // 清除旧定时器
      this.stopCarousel();
      
      // 设置轮播定时器
      this.carouselInterval = setInterval(() => {
        this.nextSlide();
      }, 5000); // 5秒切换一次
      
      // 进度条相关代码已移除
    },
    stopCarousel() {
      clearInterval(this.carouselInterval);
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.carouselImages.length;
    },
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.carouselImages.length) % this.carouselImages.length;
    },
    setSlide(index) {
      this.currentSlide = index;
    },
    // 进度条相关方法已移除
    // 滚动视差效果
    handleScroll() {
      const banner = document.querySelector('.banner-slider');
      if (!banner) return;
      
      const scrollPosition = window.scrollY;
      if (scrollPosition < 500) { // 只在页面顶部一定范围内有效
        const opacity = 1 - (scrollPosition / 500) * 0.3; // 最大透明度变化0.3
        const scale = 1 + (scrollPosition / 500) * 0.05; // 最大缩放1.05
        const translateY = scrollPosition * 0.15; // 缓慢上移
        
        banner.style.opacity = opacity;
        banner.style.transform = `scale(${scale}) translateY(-${translateY}px)`;
      }
    },
            // 初始化成果展示标签页
        initAchievementTabs() {
          setTimeout(() => {
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabItems = document.querySelectorAll('.achievement-item');
            const tabIndicator = document.querySelector('.tab-indicator');
            
            if(tabBtns.length && tabItems.length && tabIndicator) {
              // 设置初始指示器位置
              const activeBtn = document.querySelector('.tab-btn.active');
              if(activeBtn) {
                tabIndicator.style.width = `${activeBtn.offsetWidth}px`;
                tabIndicator.style.left = `${activeBtn.offsetLeft}px`;
              }
              
              tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                  // 移除所有活动状态
                  tabBtns.forEach(b => b.classList.remove('active'));
                  tabItems.forEach(item => item.classList.remove('active'));
                  
                  // 添加活动状态到当前选中项
                  btn.classList.add('active');
                  const tabId = btn.getAttribute('data-tab');
                  document.getElementById(tabId).classList.add('active');
                  
                  // 移动指示器
                  tabIndicator.style.width = `${btn.offsetWidth}px`;
                  tabIndicator.style.left = `${btn.offsetLeft}px`;
                });
              });
            }
          }, 500);
        },
        
        // 初始化教师卡片3D效果
        initTeacherCards() {
          setTimeout(() => {
            const teacherCards = document.querySelectorAll('.teacher-card');
            
            if(teacherCards.length) {
              // 添加鼠标移动效果
              teacherCards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                  const cardRect = card.getBoundingClientRect();
                  const cardCenterX = cardRect.left + cardRect.width / 2;
                  const cardCenterY = cardRect.top + cardRect.height / 2;
                  
                  // 计算鼠标相对于卡片中心的位置
                  const mouseX = e.clientX - cardCenterX;
                  const mouseY = e.clientY - cardCenterY;
                  
                  // 计算旋转角度，最大为5度
                  const rotateY = mouseX * 5 / (cardRect.width / 2);
                  const rotateX = -mouseY * 5 / (cardRect.height / 2);
                  
                  // 应用3D变换
                  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
                });
                
                // 鼠标离开时恢复
                card.addEventListener('mouseleave', () => {
                  card.style.transform = '';
                  setTimeout(() => {
                    card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                  }, 100);
                });
                
                // 鼠标进入时取消过渡效果，使移动更流畅
                card.addEventListener('mouseenter', () => {
                  setTimeout(() => {
                    card.style.transition = 'none';
                  }, 300);
                });
              });
            }
          }, 800);
        },
        
        // 开始学习之旅按钮点击事件
        startLearningJourney() {
          // 平滑滚动到课程分类导航区域
          const categoryNav = document.querySelector('.category-nav');
          if (categoryNav) {
            categoryNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // 添加高亮动画效果
            setTimeout(() => {
              categoryNav.classList.add('highlight-section');
              setTimeout(() => {
                categoryNav.classList.remove('highlight-section');
              }, 1500);
            }, 800);
          }
        },
        
        // 测试API调用
        async testApiCall() {
          console.log("手动测试API调用...");
          try {
            // 直接使用axios测试
            const response = await axios.get('/api/students/course/all');
            console.log("直接API调用响应:", response);
            
            if (response.data && response.data.code === 200) {
              console.log("API调用成功，数据:", response.data.data);
              if (response.data.data && response.data.data.length > 0) {
                // 尝试使用获取到的数据
                this.courses = response.data.data;
                this.allCourses = response.data.data;
                console.log("成功设置课程数据");
              }
            }
          } catch (error) {
            console.error("API调用失败:", error);
          }
        },
        
        // 退出登录
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
      }
    }
    </script>
    
    <style scoped>
/* 整体样式 */
    .course-list-page {
  background-color: #F9F2EF;
      min-height: 100vh;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', Arial, sans-serif;
}

/* 顶部导航栏 */
.site-header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
}

.logo h1 {
  margin: 0;
  color: #F98C53;
  font-size: 24px;
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
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 5px 0;
  position: relative;
}

.main-nav li.active a {
  color: #F98C53;
}

.main-nav li.active a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #F98C53;
}

.user-actions {
  display: flex;
  align-items: center;
}

.btn-download {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  margin-right: 15px;
  cursor: pointer;
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

/* 轮播Banner区 */
.banner-slider {
  height: 420px; /* 增加了高度 */
  position: relative;
  overflow: hidden;
  margin: 40px auto 50px;
  max-width: 1200px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  background: linear-gradient(45deg, #f3f3f3, #e6e6e6);
  transition: opacity 0.5s ease, transform 0.5s ease;
  animation: slideIn 0.8s ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-slider::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), transparent);
  z-index: 1;
  pointer-events: none;
}

.banner-slider::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
  z-index: 1;
  pointer-events: none;
}

.slider-container {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.slider-item {
  position: relative;
  height: 100%;
  display: none;
  transition: opacity 0.5s ease;
}

.slider-item.active {
  display: block;
  animation: fadeIn 0.8s;
}

@keyframes fadeIn {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

.slider-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.slider-item.active img {
  animation: zoomIn 10s ease forwards;
}

@keyframes zoomIn {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.slider-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
  pointer-events: none;
}

.slider-content {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  max-width: 60%;
}

.slider-content h2 {
  font-size: 40px;
  margin-bottom: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}

.slider-content p {
  font-size: 20px;
  margin-bottom: 24px;
  line-height: 1.5;
  opacity: 0.9;
}

.btn-explore {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(249, 140, 83, 0.4);
}

.btn-explore:hover {
  background-color: #e67641;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(249, 140, 83, 0.6);
}

/* 轮播控制按钮 */
.slider-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 5;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.slider-control:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-50%) scale(1.1);
}

.slider-control.prev {
  left: 15px;
}

.slider-control.next {
  right: 15px;
}

.slider-dots {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.5);
  margin: 0 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
}

.dot:hover {
  background-color: rgba(255,255,255,0.7);
  transform: scale(1.1);
}

.dot::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255,0.3);
  transform: scale(0);
  transition: transform 0.3s;
  border-radius: 50%;
}

.dot:hover::after {
  transform: scale(1);
}

.dot.active {
  background-color: white;
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(255,255,255,0.9);
}

/* 进度条相关样式已移除 */

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 分类导航 */
.section-title {
  font-size: 24px;
      margin-bottom: 20px;
  color: #333;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background-color: #F98C53;
  border-radius: 3px;
}

.category-nav {
  margin-bottom: 30px;
  transition: all 0.5s ease;
  border-radius: 16px;
  position: relative;
}

@keyframes highlight {
  0% { box-shadow: 0 0 0 rgba(249, 140, 83, 0); }
  50% { box-shadow: 0 0 20px rgba(249, 140, 83, 0.5); }
  100% { box-shadow: 0 0 0 rgba(249, 140, 83, 0); }
}

.highlight-section {
  animation: highlight 1.5s ease;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 10px;
}

.category-tab {
  background: none;
      border: none;
  padding: 10px 25px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  margin-right: 10px;
      border-radius: 20px;
  transition: all 0.3s;
}

.category-tab.active {
  background-color: #ABD7FB;
  color: white;
}

.category-tab:hover:not(.active) {
  background-color: #F9F2EF;
  color: #333;
}

/* 筛选区 */
.filter-section {
  background-color: white;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 35px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.4s ease;
  border: 1px solid rgba(171,215,251,0.2);
  position: relative;
  overflow: hidden;
}

.filter-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #ABD7FB, #D2E0AA, #F9F2EF, #FCCEB4);
  opacity: 0.8;
}

.filter-section:hover {
  box-shadow: 0 15px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(171,215,251,0.1);
  transform: translateY(-2px);
}

.tabs {
  margin-bottom: 22px;
  display: flex;
  border-bottom: 1px solid rgba(171,215,251,0.2);
  padding-bottom: 8px;
}

.tabs button {
  background: none;
  border: none;
  padding: 10px 25px;
  margin-right: 20px;
  font-size: 16px;
  font-weight: 500;
  color: #777;
      cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 30px;
}

.tabs button:hover {
  color: #444;
  background-color: rgba(171,215,251,0.08);
}

.tabs button.active {
      color: #fff;
  font-weight: 600;
  background: linear-gradient(135deg, #ABD7FB 0%, #8bc4f8 100%);
  box-shadow: 0 4px 12px rgba(171,215,251,0.3);
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background-color: #ABD7FB;
  border-radius: 50%;
  transition: all 0.3s ease;
}

    .filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filters {
      display: flex;
      flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  position: relative;
}

/* 美化下拉列表 - 全面改进版 */
.filters select {
  padding: 12px 20px;
  border-radius: 50px;
  border: 2px solid rgba(171,215,251,0.3);
  min-width: 170px;
  font-size: 15px;
  font-weight: 500;
  color: #444;
      cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  text-align: center;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ABD7FB' stroke='%23ABD7FB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 18px center;
  background-size: 14px;
  padding-right: 45px;
}

/* 下拉列表选项容器样式 - 模拟自定义下拉菜单 */
.filters select:focus {
  border-color: #ABD7FB;
  box-shadow: 0 4px 15px rgba(171,215,251,0.5);
  outline: none;
  background-color: #f9fdff;
}

/* 下拉列表悬停样式 */
.filters select:hover {
  border-color: #ABD7FB;
  box-shadow: 0 6px 16px rgba(171,215,251,0.4);
  transform: translateY(-2px);
}

/* 下拉选项样式 */
.filters select option {
  padding: 12px;
  background-color: white;
  color: #444;
  font-weight: 500;
}

/* 修改下拉列表展开时的样式 */
.filters select:focus option:checked {
  background: linear-gradient(to right, #ABD7FB, rgba(171,215,251,0.7));
  color: #fff;
}

/* 伪类实现悬浮效果 */
.filters::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 10%;
  width: 80%;
  height: 6px;
  background: radial-gradient(ellipse at center, rgba(171,215,251,0.3) 0%, rgba(171,215,251,0) 80%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.filters select:hover ~ .filters::after {
  opacity: 1;
}

.filter-btn {
  background: linear-gradient(135deg, #ABD7FB 0%, #8bc4f8 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(171,215,251,0.5);
  position: relative;
      overflow: hidden;
}

.filter-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  transition: left 0.6s ease;
}

.filter-btn:hover {
  background: linear-gradient(135deg, #8bc4f8 0%, #7ab9f5 100%);
  box-shadow: 0 6px 20px rgba(139,196,248,0.6);
  transform: translateY(-2px);
}

.filter-btn:hover::before {
  left: 100%;
}

.filter-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(171,215,251,0.4);
}

/* 课程布局 */
.course-layout {
      display: flex;
      flex-direction: column;
  gap: 25px;
  margin-bottom: 40px;
  width: 100%;
}

.course-row {
  display: flex;
  gap: 25px;
  width: 100%;
  height: 300px; /* 固定每行高度 */
}

.first-row {
  height: 360px; /* 第一行更高一些 */
}

.featured-image {
  flex: 0 0 66%; /* 修改左侧图片占据宽度为33% */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.featured-image:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.featured-image:hover .category-image {
  transform: scale(1.03);
}

/* 课程卡片 */
.course-card {
  flex: 1;
  min-width: 0; /* 防止内容撑开 */
  height: 100%; /* 与行高一致 */
}

.first-course {
  flex: 0 0 32%; /* 第一行的课程卡片占据66%的宽度，与后面行的三个卡片宽度总和一致 */
}

.course-card-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
}

.card-image {
  height: 50%;
  position: relative;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
}

.course-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

    .course-card:hover {
  transform: translateY(-5px);
}

.course-card-inner {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.course-card:hover .course-card-inner {
  box-shadow: 0 8px 20px rgba(171,215,251,0.25);
  border-color: #ABD7FB;
}

.card-image {
  position: relative;
  height: 50%;
}

    .cover {
      width: 100%;
  height: 100%;
      object-fit: cover;
}

.card-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  color: white;
  z-index: 2;
}

.level-basic {
  background-color: #D2E0AA;
  color: #333;
}

.level-target {
  background-color: #ABD7FB;
  color: #333;
}

.level-elite {
  background-color: #FCCEB4;
  color: #333;
}

.card-content {
  padding: 18px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 50%;
  box-sizing: border-box;
  overflow: hidden;
  justify-content: space-between; /* 确保内容均匀分布 */
}

.card-title {
  font-size: 17px;
  margin: 0 0 8px 0; /* 减少下边距 */
  line-height: 1.3; /* 减少行高 */
  color: #333;
  font-weight: 600;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 44px; /* 减少最小高度 */
}

.card-category {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0; /* 减少下边距 */
  display: inline-block;
  background-color: #F9F2EF;
  padding: 3px 10px;
  border-radius: 12px;
  width: fit-content;
}

.card-intro {
  font-size: 14px;
  color: #666;
  line-height: 1.5; /* 减少行高 */
  flex-grow: 1;
  margin: 0 0 8px 0; /* 减少下边距 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px; /* 减少上内边距 */
  border-top: 1px solid #f0f0f0;
}

    .price {
      font-weight: bold;
      color: #F98C53;
  font-size: 15px;
    }

.price.free {
      color: #4CAF50;
    }

.students {
  font-size: 13px; /* 减小字体大小 */
  color: #555;
  display: flex;
  align-items: center;
  background-color: #F9F2EF;
  padding: 4px 10px; /* 减少内边距 */
  border-radius: 20px;
  margin-left: auto;
  white-space: nowrap;
  overflow: hidden; /* 防止内容溢出 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
  max-width: 100%; /* 确保不超出父容器 */
}

.students::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F98C53' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'%3e%3c/path%3e%3ccircle cx='9' cy='7' r='4'%3e%3c/circle%3e%3cpath d='M23 21v-2a4 4 0 0 0-3-3.87'%3e%3c/path%3e%3cpath d='M16 3.13a4 4 0 0 1 0 7.75'%3e%3c/path%3e%3c/svg%3e");
  background-size: contain;
  background-repeat: no-repeat;
}

/* 探索更多按钮 */
.explore-more-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
}

.explore-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #ABD7FB 0%, #8bc4f8 100%);
  color: white;
      border: none;
  padding: 14px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
      cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(171, 215, 251, 0.4);
  position: relative;
  overflow: hidden;
}

.explore-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(171, 215, 251, 0.6);
  background: linear-gradient(135deg, #8bc4f8 0%, #7ab9f5 100%);
}

.explore-more-btn svg {
  transition: transform 0.3s ease;
}

.explore-more-btn:hover svg {
  transform: translateX(5px);
}

.explore-more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  transition: left 0.6s ease;
}

.explore-more-btn:hover::before {
  left: 100%;
}

/* 精选推荐区 */
.featured-section {
  margin: 60px 0;
  animation: fadeInUp 1s ease-out;
}

.featured-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 25px;
  margin-top: 30px;
}

.featured-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.4s ease;
  height: 220px;
}

.featured-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}

.featured-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.featured-card:hover img {
  transform: scale(1.05);
}

.featured-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  color: white;
}

.featured-content h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
}

.featured-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.big-card {
  grid-row: span 2;
  height: 465px;
}

.big-card .featured-content h3 {
  font-size: 28px;
  margin-bottom: 12px;
}

.big-card .featured-content p {
  font-size: 16px;
}

.tag {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  background-color: #F98C53;
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(249, 140, 83, 0.4);
}

.tag-green {
  background-color: #D2E0AA;
  color: #333;
  box-shadow: 0 2px 8px rgba(210, 224, 170, 0.4);
}

.tag-blue {
  background-color: #ABD7FB;
  color: #333;
  box-shadow: 0 2px 8px rgba(171, 215, 251, 0.4);
}

/* 学习路径 */
.learning-path {
  margin: 80px 0;
  padding: 60px 30px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.learning-path-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 40%, #f0f7ff 100%);
  z-index: -1;
}

.learning-path-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(171, 215, 251, 0.15) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(252, 206, 180, 0.15) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(249, 140, 83, 0.08) 0%, transparent 30%);
  z-index: -1;
}

.learning-path-subtitle {
  text-align: center;
  color: #666;
  font-size: 16px;
  margin: 10px 0 40px;
  position: relative;
}

.learning-path-subtitle::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 1px;
  background-color: rgba(249, 140, 83, 0.3);
}

.path-container {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
}

.path-line {
  position: absolute;
  top: 50%;
  left: 10%;
  width: 80%;
  height: 3px;
  background: linear-gradient(to right, #ABD7FB, #FCCEB4);
  transform: translateY(-50%);
  border-radius: 3px;
  z-index: 1;
}

.path-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.path-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 22%;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 25px 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.path-step:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(171, 215, 251, 0.2);
}

.path-step::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 15px;
  background: linear-gradient(to bottom, transparent, #ABD7FB);
}

.step-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ABD7FB, #FCCEB4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 24px;
  margin-bottom: 20px;
  position: relative;
  box-shadow: 0 5px 15px rgba(171, 215, 251, 0.4);
  transition: all 0.3s ease;
}

.path-step:hover .step-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 20px rgba(171, 215, 251, 0.6);
}

.step-number {
  position: absolute;
  font-size: 22px;
  font-weight: bold;
  z-index: 2;
}

.step-svg {
  width: 30px;
  height: 30px;
  stroke: white;
  stroke-width: 1.5;
  fill: none;
  opacity: 0.6;
  position: absolute;
  z-index: 1;
}

.step-content {
  text-align: center;
  width: 100%;
}

.step-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
  position: relative;
  display: inline-block;
}

.step-content h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #ABD7FB, #FCCEB4);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.path-step:hover .step-content h3::after {
  transform: scaleX(1);
}

.step-content p {
  margin: 0 0 15px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.step-indicator {
  display: inline-block;
  padding: 4px 12px;
  background-color: rgba(171, 215, 251, 0.2);
  color: #666;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.path-step:hover .step-indicator {
  background-color: #ABD7FB;
  color: white;
}

.learning-path-cta {
  text-align: center;
  margin-top: 50px;
}

.path-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #ABD7FB, #FCCEB4);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(171, 215, 251, 0.3);
}

.path-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(171, 215, 251, 0.5);
}

/* 底部区域 */
.site-footer {
  background-color: #333;
  color: white;
  padding: 50px 0 20px;
  margin-top: 50px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  padding: 0 20px;
}

.footer-section h3 {
  font-size: 18px;
  margin: 0 0 20px 0;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 30px;
  height: 2px;
  background-color: #F98C53;
}

.footer-section p {
  margin: 10px 0;
  font-size: 14px;
      color: #aaa;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul a {
  color: #aaa;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-section ul a:hover {
  color: #F98C53;
}

.social-icons {
  display: flex;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.social-icon:hover {
  background-color: #F98C53;
}

.copyright {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 20px 20px 0;
  border-top: 1px solid #444;
  text-align: center;
  font-size: 13px;
  color: #888;
}

.test-api-btn {
  margin-top: 10px;
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.test-api-btn:hover {
  background-color: #e67641;
}

/* 响应式调整 */
@media (max-width: 1100px) {
  .course-row {
    height: auto;
    flex-wrap: wrap;
  }
  
  .first-row {
    flex-direction: column;
    height: auto;
  }
  
  .featured-image, .first-course {
    flex: 0 0 100%;
    height: 300px;
    margin-bottom: 25px;
  }
  
  .course-card {
    flex: 0 0 calc(50% - 12.5px);
    height: 350px;
    margin-bottom: 25px;
  }
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .featured-grid {
    grid-template-columns: 1fr;
  }
  
  .big-card {
    grid-column: auto;
    height: 180px;
  }
  
  .footer-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .path-steps {
    flex-direction: column;
    align-items: center;
  }
  
  .path-step {
    width: 80%;
    margin-bottom: 30px;
  }
  
  .path-line {
    width: 3px;
    height: 80%;
    left: 50%;
    top: 10%;
    transform: translateX(-50%);
  }
  
  .path-step::before {
    top: auto;
    bottom: -15px;
    height: 15px;
    width: 3px;
  }
  
  .learning-path {
    padding: 40px 20px;
  }
  
  .path-arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }
}

@media (max-width: 480px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-container {
    grid-template-columns: 1fr;
    }
}

/* 培优体系区域样式 */
.training-system {
  position: relative;
  margin: 60px 0;
  height: 500px;
  background-image: url('/src/assets/images/course/course-show/show1.png');
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  overflow: hidden;
}

/* 标题装饰元素 */
.title-decoration {
  display: inline-block;
  width: 4px;
  height: 20px;
  background-color: #F98C53;
  margin-right: 10px;
  border-radius: 2px;
  vertical-align: middle;
  position: relative;
  top: -2px;
}

.training-system::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
}

.training-content {
  position: relative;
  max-width: 600px;
  padding: 60px;
  z-index: 2;
}

.training-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.training-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 50px;
}

.training-items {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.training-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.item-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-size: 30px;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.item-icon-1 {
  background-color: #D2E0AA;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'%3E%3C/path%3E%3Cpolyline points='3.27 6.96 12 12.01 20.73 6.96'%3E%3C/polyline%3E%3Cline x1='12' y1='22.08' x2='12' y2='12'%3E%3C/line%3E%3C/svg%3E");
}

.item-icon-2 {
  background-color: #ABD7FB;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'%3E%3C/path%3E%3Cpath d='M12 5l7 7-7 7'%3E%3C/path%3E%3C/svg%3E");
}

.item-icon-3 {
  background-color: #FCCEB4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'%3E%3C/polygon%3E%3C/svg%3E");
}

.item-text h3 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px;
}

.item-text p {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .training-system {
    height: auto;
    padding-bottom: 40px;
  }
  
  .training-content {
    padding: 40px 20px;
  }
  
  .training-item {
    flex-direction: column;
  }
}

/* 教学成果展示区样式 */
.achievement-section {
  margin: 60px 0;
  padding: 20px;
}

.achievement-tabs {
  display: flex;
  justify-content: center;
  position: relative;
  margin: 30px 0;
  border-bottom: 2px solid #eee;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #ABD7FB;
}

.tab-indicator {
  position: absolute;
  bottom: -2px;
  height: 3px;
  background-color: #ABD7FB;
  transition: all 0.3s ease;
}

.achievement-content {
  position: relative;
  min-height: 400px;
}

.achievement-item {
  display: none;
  grid-template-columns: 45% 55%;
  gap: 30px;
  align-items: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.achievement-item.active {
  display: grid;
}

.achievement-image {
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(171, 215, 251, 0.3);
}

.achievement-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.achievement-item:hover .achievement-image img {
  transform: scale(1.05);
}

.achievement-badge {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: #ABD7FB;
  color: #fff;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 15px rgba(171, 215, 251, 0.5);
}

.achievement-badge span {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.achievement-badge small {
  font-size: 14px;
  opacity: 0.8;
}

.achievement-info {
  padding: 20px;
}

.achievement-info h3 {
  font-size: 32px;
  margin-bottom: 25px;
  color: #333;
  font-weight: 700;
}

.highlight {
  color: #F98C53;
  margin-left: 10px;
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #F98C53;
  border-radius: 2px;
}

.achievement-stats {
  display: flex;
  margin-bottom: 25px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.stat-item:last-child {
  margin-right: 0;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #ABD7FB;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.achievement-desc {
  font-size: 16px;
  line-height: 1.7;
  color: #555;
  margin-bottom: 25px;
}

.achievement-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 8px 16px;
  background-color: #F9F2EF;
  color: #333;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tag:nth-child(1) {
  background-color: #ABD7FB;
  color: #fff;
}

.tag:nth-child(2) {
  background-color: #D2E0AA;
}

.tag:nth-child(3) {
  background-color: #FCCEB4;
}

.tag:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 992px) {
  .achievement-item {
    grid-template-columns: 1fr;
  }
  
  .achievement-image {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .achievement-tabs {
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 10px;
  }
  
  .tab-btn {
    padding: 10px 20px;
    font-size: 16px;
    white-space: nowrap;
  }
  
  .achievement-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-item {
    margin-right: 0;
  }
}

/* 优秀师资展示区样式 */
.teacher-section {
  margin: 80px 0;
  padding: 40px 20px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.teacher-section-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9f4ff 50%, #f0f7ff 100%);
  z-index: -2;
}

.teacher-section-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(171, 215, 251, 0.3) 0%, rgba(171, 215, 251, 0) 60%);
  animation: rotate 60s linear infinite;
  z-index: -1;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.teacher-section-content {
  position: relative;
  z-index: 1;
}

.teacher-subtitle {
  text-align: center;
  color: #666;
  font-size: 16px;
  margin: 10px 0 30px;
  position: relative;
}

.teacher-subtitle::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 1px;
  background-color: rgba(171, 215, 251, 0.5);
}

.teacher-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin: 40px 0;
}

.teacher-tag {
  padding: 10px 25px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 30px;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.teacher-tag:hover {
  background-color: #ABD7FB;
  color: #fff;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 15px rgba(171, 215, 251, 0.4);
  border-color: rgba(171, 215, 251, 0.5);
}

.teacher-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 25px;
  margin-top: 50px;
  perspective: 1000px;
}

.teacher-card {
  position: relative;
  height: 350px;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.teacher-card:hover {
  transform: translateY(-10px) rotateY(5deg);
}

.teacher-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  transition: all 0.4s ease;
}

.teacher-card:hover .teacher-card-inner {
  box-shadow: 
    0 20px 40px rgba(171, 215, 251, 0.3),
    0 0 0 2px rgba(171, 215, 251, 0.4) inset;
}

.teacher-avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  background-color: #f5f5f5;
  position: relative;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateZ(20px);
  transition: all 0.4s ease;
}

.teacher-card:hover .teacher-avatar-wrapper {
  transform: translateZ(30px) scale(1.05);
}

.teacher-avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(171, 215, 251, 0.4), rgba(252, 206, 180, 0.4));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.teacher-card:hover .teacher-avatar-overlay {
  opacity: 1;
}

.teacher-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.teacher-card:hover .teacher-avatar {
  transform: scale(1.1);
}

.teacher-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  transform: translateZ(15px);
  transition: all 0.3s ease;
}

.teacher-card:hover .teacher-name {
  color: #F98C53;
}

.teacher-badge {
  background-color: #FCCEB4;
  color: #333;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(252, 206, 180, 0.3);
  transition: all 0.3s ease;
}

.teacher-card:hover .teacher-badge {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(252, 206, 180, 0.4);
}

.teacher-education {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  transform: translateZ(10px);
}

.teacher-exp {
  color: #ABD7FB;
  font-weight: 500;
  position: relative;
}

.teacher-exp::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #ABD7FB;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: right;
}

.teacher-card:hover .teacher-exp::after {
  transform: scaleX(1);
  transform-origin: left;
}

.teacher-intro {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin: 15px 0;
  height: 60px;
  overflow: hidden;
  transform: translateZ(5px);
}

.teacher-id {
  font-size: 11px;
  color: #999;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px dashed rgba(171, 215, 251, 0.3);
  width: 100%;
}

.teacher-card-blur {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
  border-radius: 0 0 16px 16px;
}

.teacher-card:hover .teacher-card-blur {
  opacity: 0.7;
}

/* Animation for cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.teacher-card {
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
}

.teacher-card:nth-child(1) { animation-delay: 0.1s; }
.teacher-card:nth-child(2) { animation-delay: 0.2s; }
.teacher-card:nth-child(3) { animation-delay: 0.3s; }
.teacher-card:nth-child(4) { animation-delay: 0.4s; }
.teacher-card:nth-child(5) { animation-delay: 0.5s; }

@media (max-width: 1200px) {
  .teacher-list {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .teacher-card {
    height: 330px;
  }
}

@media (max-width: 768px) {
  .teacher-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .teacher-tags {
    flex-direction: column;
    align-items: center;
  }
  
  .teacher-card {
    height: 350px;
  }
}

@media (max-width: 480px) {
  .teacher-list {
    grid-template-columns: 1fr;
  }
}
    </style>