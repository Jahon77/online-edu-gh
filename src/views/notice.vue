<template>
  <layout>


    <div class="index-tab-line">
      <div class="index-tab-line2">
        <div class="index-tab-linein1">

        </div>
        <div class="index-tab-linein1">

        </div>
        <div class="index-tab-linein">

        </div>
        <div class="index-tab-linein1">

        </div>


      </div>
    </div>
    <div class="news">
      <div class="T0">
        <div class="T1">

          <div class="SwiperBox" ref="SwiperBox" @mouseenter="new MouseFun('移入')" @mouseleave="new MouseFun('移出')">
            <!-- 图片 -->
            <div class="imgBox" :style="{left:`-${leftVal}px`,transition:`${ition}s`}">
              <img :src="item.imgUrl" v-for="(item,index) in imgList" :key="index"/>

              <img :src="imgList[0].imgUrl" alt="">
            </div>

            <div class="leftBtn" @click="throttle(PrevFun)">&larr;</div>

            <div class="rightBtn" @click="throttle(NextFun)">&rarr;</div>

            <div class="instBox">
              <div @click="instFun(index)" v-for="(item,index) in imgList.length" :key="index"
                   :class="['inst',index===imgShow?'instActv':'']">
              </div>
            </div>

          </div>

          <div class="calendar">
            <el-calendar>

            </el-calendar>
          </div>
        </div>

      </div>
      <div class="first">
        <div class="notice">
          <div class="notice-in">

            <h2>学校通知</h2>
            <div class="notice-line"></div>
            <div v-for="(news, index)  in paginatedNoticeWithLimit" :key=index class="news-item">
              <p @click="handleClick(news)">
                {{ (index + 1 + pageSize_notice * (currentPage_notice - 1) + '. ' + news.userTitle) }}</p>
            </div>
            <div v-if="paginatedNoticeWithLimit.length === 0" class="empty-notice">
              <p>暂无通知信息</p>
              <p>请稍后查看</p>
            </div>
            <div class="content-pagination">

              <el-pagination class="pagination"


                             layout="prev, pager, next"
                             :total="totalItems_notice"
                             :page-size="pageSize_notice"
                             @current-change="handleNoticeChange"
              ></el-pagination>

            </div>

          </div>

        </div>
        <div class="announcement">
          <div class="announcement-in">

            <h2>学校公告</h2>
            <div class="notice-line"></div>
            <div v-for="(news, index)  in paginatedAnnouncementWithLimit" :key=index class="news-item">

              <p @click="handleClick(news)">
                {{ (index + 1 + pageSize_announcement * (currentPage_announcement - 1) + '. ' + news.userTitle) }}</p>
            </div>
            <div v-if="paginatedAnnouncementWithLimit.length === 0" class="empty-notice">
              <p>暂无公告信息</p>
              <p>请稍后查看</p>
            </div>
            <div class="content-pagination">

              <el-pagination class="pagination"


                             layout="prev, pager, next"
                             :total="totalItems_announcement"
                             :page-size="pageSize_announcement"
                             @current-change="handleAnnouncementChange"
              ></el-pagination>

            </div>

          </div>

        </div>
      </div>
      <div class="second">
        <div class="buttons">
          <div class="buttons-in">
            <div class="button-navigation">
              <h2>
                <span>网</span>
                <span>址</span>
                <span>导</span>
                <span>航</span>
              </h2>

            </div>
            <div class="buttons-content">
              <div v-for="button in buttons" :key="button.id" class="buttons-content-in">
                <div class="button-center">
                  <svg t="1720488913763" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="4378" width="200" height="200">
                    <path :d="button.iconPath" fill="currentColor" p-id="4379"></path>
                  </svg>
                  <p>{{ button.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="schoolnews">
          <div class="schoolnews-in">

            <h2>学校新闻</h2>
            <div class="notice-line"></div>
            <div v-for="(news, index)  in paginatedNewsWithLimit" :key=index class="news-item">
              <p @click="handleClick(news)">
                {{ (index + 1 + pageSize_news * (currentPage_news - 1)) + '. ' + news.userTitle }}</p>
            </div>
            <div v-if="paginatedNewsWithLimit.length === 0" class="empty-notice">
              <p>暂无新闻信息</p>
              <p>请稍后查看</p>
            </div>
            <div class="content-pagination">

              <el-pagination class="pagination"


                             layout="prev, pager, next"
                             :total="totalItems_news"
                             :page-size="pageSize_news"
                             @current-change="handleNewsChange"
              ></el-pagination>

            </div>

          </div>
        </div>


      </div>
    </div>


  </layout>
</template>

<style>
.empty-notice {
  padding: 20px 0;
  text-align: center;
  color: #999;
}

.empty-notice p {
  margin: 5px 0;
  font-size: 14px;
}

.news-item {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}

.news-item p {
  cursor: pointer;
  transition: color 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-item p:hover {
  color: #409EFF;
}

.notice-line {
  margin-bottom: 15px;
}
</style>
<script>
import Layout from "../components/commen/layout.vue"
import axios from "axios";

export default {
  name: 'index',
  components: {Layout},
  data() {
    return {
      id: 0,

      animatedIndices: [],
      tabList: [
        {name: 'School', desc: 'School Profile', icon: 'am-icon-cog'},
        {name: 'Company', desc: 'Company Profile', icon: 'am-icon-lightbulb-o'},
        {name: 'Notice', desc: 'The notice about us', icon: 'am-icon-line-chart'},
        {name: 'About', desc: 'All about us', icon: 'am-icon-hourglass-end'},
      ],
      tabIndex: 0,
      newsList: [
        { newsUrl: '#', userTitle: '中央网信办等部门部署开展2024年暑期未成年人网络环境专项整治' },
        { newsUrl: '#', userTitle: '关于举办2024年校园开放日活动的通知' },
        { newsUrl: '#', userTitle: '我校在全国大学生计算机设计大赛中获得特等奖' },
        { newsUrl: '#', userTitle: '2024年秋季学期教学工作安排通知' },
        { newsUrl: '#', userTitle: '关于开展2024年度科研项目申报工作的通知' },
        { newsUrl: '#', userTitle: '我校与多家企业签署产学研合作协议' },
        { newsUrl: '#', userTitle: '关于组织参加全国大学生创新创业大赛的通知' },
        // { newsUrl: '#', userTitle: '校园网络升级维护通知' },
        // { newsUrl: '#', userTitle: '我校学子在全国英语竞赛中荣获佳绩' },
        // { newsUrl: '#', userTitle: '关于举办第十届校园文化艺术节的通知' }
      ],
      announcementList: [
        { newsUrl: '#', userTitle: '关于2024-2025学年第一学期学生注册的通知' },
        { newsUrl: '#', userTitle: '关于调整2024年暑假放假时间的通知' },
        { newsUrl: '#', userTitle: '2024年秋季学期奖学金评定工作安排' },
        { newsUrl: '#', userTitle: '关于开展2024年度学生社团招新活动的通知' },
        { newsUrl: '#', userTitle: '校园安全隐患排查整治工作通知' },
        { newsUrl: '#', userTitle: '关于开展节能减排宣传周活动的通知' },
        { newsUrl: '#', userTitle: '2024年度学生公寓入住安排' },
        // { newsUrl: '#', userTitle: '关于举办校园招聘会的通知' },
        // { newsUrl: '#', userTitle: '图书馆暑期开放时间调整通知' },
        // { newsUrl: '#', userTitle: '关于评选2024年度优秀学生干部的通知' }
      ],
      noticeList: [
        { newsUrl: '#', userTitle: '关于做好2024年毕业生离校工作的通知' },
        { newsUrl: '#', userTitle: '关于开展2024年暑期社会实践活动的通知' },
        { newsUrl: '#', userTitle: '2024-2025学年第一学期选课通知' },
        { newsUrl: '#', userTitle: '关于组织开展防诈骗宣传教育活动的通知' },
        { newsUrl: '#', userTitle: '关于开展校园文明建设月活动的通知' },
        { newsUrl: '#', userTitle: '2024年度学生体检工作安排' },
        { newsUrl: '#', userTitle: '关于开展心理健康教育系列讲座的通知' },
        // { newsUrl: '#', userTitle: '校园网络安全教育周活动通知' },
        // { newsUrl: '#', userTitle: '关于组织参加暑期社区志愿服务的通知' },
        // { newsUrl: '#', userTitle: '2024年度学生证补办工作通知' }
      ],
      imgList: [
        {imgUrl: "src/assets/images/10001.jpg"},
        {imgUrl: "src/assets/images/10002.png"},
        {imgUrl: "src/assets/images/10003.jpg"},
        {imgUrl: "src/assets/images/10004.png"},
        {imgUrl: "src/assets/images/10005.png"},
        {imgUrl: "src/assets/images/10006.jpg"},

      ],
      leftVal: 0,
      flag: true,
      start: null,
      imgWidth: 700,
      ition: 0.6,
      imgShow: 0,

      totalItems_announcement: 0,
      totalItems_notice: 10,
      totalItems_news: 0,
      pageSize_announcement: 10,
      pageSize_notice: 10,
      pageSize_news: 10,
      currentPage_announcement: 1,
      currentPage_notice: 1,
      currentPage_news: 1,
      message: '',
      buttons: [
        {
          id: 1,
          text: '教务管理系统',
          iconPath: 'M866.9 98.2H157c-33 0-60.1 27-60.1 60.1v486c0 33 27 60.1 60.1 60.1h324.9s0.1 0 0.1 0.1v131.1s0 0.1-0.1 0.1H192c-16.4 0-30.2 12.8-30.7 29.2-0.4 16.9 13.2 30.8 30 30.8H832c16.4 0 30.2-12.8 30.7-29.2 0.4-16.9-13.2-30.8-30-30.8H542s-0.1 0-0.1-0.1V704.3s0-0.1 0.1-0.1h324.9c33 0 60.1-27 60.1-60.1v-486c0-32.9-27.1-59.9-60.1-59.9z m0.1 545.9l-0.2 0.2H157.1l-0.2-0.2V158.4l0.2-0.2h709.7l0.2 0.2v485.7z'
        },
        {
          id: 1,
          text: '二级学院系统',
          iconPath: 'M369.066667 669.866667c6.4 0 10.666667-4.266667 12.8-8.533334l14.933333-49.066666 14.933333 49.066666c2.133333 6.4 6.4 8.533333 12.8 8.533334s10.666667-2.133333 12.8-8.533334l17.066667-70.4s0-4.266667-4.266667-4.266666c0-6.4-2.133333-8.533333-8.533333-8.533334s-8.533333 4.266667-10.666667 10.666667l-10.666666 53.333333-14.933334-55.466666c0-6.4-4.266667-6.4-10.666666-6.4-4.266667 0-6.4 2.133333-10.666667 6.4l-17.066667 55.466666-10.666666-53.333333c0-6.4-6.4-10.666667-10.666667-10.666667s-4.266667 4.266667-4.266667 8.533334v4.266666l17.066667 70.4c0 6.4 4.266667 8.533333 10.666667 8.533334z m115.2 0c6.4 0 10.666667-4.266667 12.8-8.533334l14.933333-49.066666 14.933333 49.066666c2.133333 6.4 6.4 8.533333 12.8 8.533334s10.666667-2.133333 12.8-8.533334l17.066667-70.4s0-4.266667-4.266667-4.266666c0-6.4-4.266667-8.533333-8.533333-8.533334s-8.533333 4.266667-8.533333 10.666667l-10.666667 53.333333-17.066667-55.466666c-2.133333-6.4-4.266667-6.4-10.666666-6.4-4.266667 0-8.533333 2.133333-10.666667 6.4l-17.066667 55.466666-10.666666-53.333333c0-6.4-6.4-10.666667-10.666667-10.666667s-6.4 4.266667-8.533333 8.533334v4.266666L469.333333 661.333333c4.266667 6.4 8.533333 8.533333 14.933334 8.533334z m117.333333 0c6.4 0 10.666667-4.266667 12.8-8.533334l14.933333-49.066666 14.933334 49.066666c2.133333 6.4 6.4 8.533333 12.8 8.533334s10.666667-2.133333 12.8-8.533334l17.066666-70.4s2.133333-4.266667-2.133333-4.266666c0-6.4-4.266667-8.533333-8.533333-8.533334s-8.533333 4.266667-10.666667 10.666667l-10.666667 53.333333-17.066666-55.466666c0-6.4-4.266667-6.4-8.533334-6.4s-8.533333 2.133333-10.666666 6.4l-17.066667 55.466666-10.666667-53.333333c0-6.4-6.4-10.666667-10.666666-10.666667s-8.533333 4.266667-8.533334 8.533334v4.266666l17.066667 70.4c2.133333 6.4 4.266667 8.533333 12.8 8.533334zM832 106.666667H192C145.066667 106.666667 106.666667 145.066667 106.666667 192v85.333333h810.666666V192c0-46.933333-38.4-85.333333-85.333333-85.333333zM202.666667 234.666667C185.6 234.666667 170.666667 219.733333 170.666667 202.666667S185.6 170.666667 202.666667 170.666667s32 14.933333 32 32-14.933333 32-32 32z m106.666666 0c-17.066667 0-32-14.933333-32-32S292.266667 170.666667 309.333333 170.666667s32 14.933333 32 32-14.933333 32-32 32z m106.666667 0c-17.066667 0-32-14.933333-32-32S398.933333 170.666667 416 170.666667s32 14.933333 32 32-14.933333 32-32 32zM106.666667 832c0 46.933333 38.4 85.333333 85.333333 85.333333h640c46.933333 0 85.333333-38.4 85.333333-85.333333V341.333333H106.666667v490.666667z m552.533333-85.333333c-36.266667 38.4-89.6 64-147.2 64s-110.933333-25.6-147.2-64c-4.266667-4.266667 0-10.666667 4.266667-10.666667h285.866666c6.4 0 8.533333 6.4 4.266667 10.666667zM347.733333 490.666667c36.266667-51.2 96-85.333333 166.4-85.333334s128 34.133333 166.4 85.333334c4.266667 4.266667 0 10.666667-6.4 10.666666h-320c-6.4 0-10.666667-6.4-6.4-10.666666z m-38.4 85.333333c0-23.466667 19.2-42.666667 42.666667-42.666667h320c23.466667 0 42.666667 19.2 42.666667 42.666667v85.333333c0 23.466667-19.2 42.666667-42.666667 42.666667h-320c-23.466667 0-42.666667-19.2-42.666667-42.666667v-85.333333z '
        },
        {
          id: 1,
          text: '考试管理平台',
          iconPath: 'M126 434.9c56.3-193 179.5-330.7 404.9-350.2 15.5-1.4 37.2-0.2 55-3.5 15.3-3 33.9-14.1 51.5-21.3C708.8 30.5 866.5-21 946.2 42.2c69.1 55 56.4 188.7 13.7 276 41.5 84.4 57 179.2 44.6 272.5-200.2 8.2-433.5 1.1-628 3.6C383 698 448 777.5 544.6 788.7c94.4 11 159.6-42.4 202.5-102.6h240.1c-62.4 179.6-221 318.8-466.6 300.8-55.8-4.2-99.4-20.5-147.6-39-80.5 44.1-258.5 109.6-329.4 17.7-53.8-69.8-19.2-196.7 10.3-279.4C113.7 518.5 227.4 352.4 338.7 258c0.6-2.9 3.4-3.6 3.4-7.1-87.9 45-147.2 119.4-216.1 184zM970.1 173c-3.3-120.5-158.3-108.6-240.2-60.1 91.4 36.6 158.2 98.7 212.7 173.3 11.9-37.8 28.7-69.2 27.5-113.2zM376.4 466.7h380.9c-11-246.1-368.9-226.2-380.9 0zM95.1 898.4c19.1 109 171.4 77.2 240.2 28.3-90.3-50.8-146.7-136.6-192.2-233.6-21.1 52.5-60.7 133.4-48 205.3z'
        },
        {
          id: 1,
          text: '本科生教育网',
          iconPath: 'M128 0l888.832 0-72.704 843.776-376.832 115.712-358.4-115.712zM839.68 254.976l21.504-128-572.416-1.024 36.864 384 372.736 0 0 100.352-124.928 44.032-130.048-46.08-8.192-54.272-102.4 1.024 15.36 135.168 219.136 76.8 230.4-72.704 29.696-309.248-405.504 0-10.24-130.048 428.032 0z '
        },
        {
          id: 1,
          text: '网络教学平台',
          iconPath: 'M333.824 149.504H124.928c-20.48 0-36.864 16.384-36.864 36.864v208.896c0 20.48 16.384 36.864 36.864 36.864h208.896c20.48 0 36.864-16.384 36.864-36.864V186.368c0-20.48-16.384-36.864-36.864-36.864z m-10.24 235.52H135.168V196.608h188.416v188.416z m161.792-188.416h428.032c12.288 0 22.528-10.24 22.528-22.528 0-12.288-10.24-24.576-22.528-24.576H485.376c-12.288 0-22.528 10.24-22.528 24.576-2.048 12.288 8.192 22.528 22.528 22.528z m428.032 188.416H485.376c-12.288 0-22.528 10.24-22.528 24.576s10.24 24.576 22.528 24.576h428.032c12.288 0 22.528-10.24 22.528-24.576s-10.24-24.576-22.528-24.576zM333.824 591.872H124.928c-20.48 0-36.864 16.384-36.864 36.864v208.896c0 20.48 16.384 36.864 36.864 36.864h208.896c20.48 0 36.864-16.384 36.864-36.864V628.736c0-20.48-16.384-36.864-36.864-36.864z m-10.24 235.52H135.168v-188.416h188.416v188.416z m589.824-235.52H485.376c-12.288 0-22.528 10.24-22.528 22.528s10.24 24.576 22.528 24.576h428.032c12.288 0 22.528-10.24 22.528-24.576s-10.24-22.528-22.528-22.528z m0 235.52H485.376c-12.288 0-22.528 10.24-22.528 24.576 0 12.288 10.24 22.528 22.528 22.528h428.032c12.288 0 22.528-10.24 22.528-22.528 0-14.336-10.24-24.576-22.528-24.576z '
        },
        {
          id: 1,
          text: '实验室平台',
          iconPath: 'M916.2 825.9L709.3 407.5V303.9h45.6v-80.1H269.1v80.1h39.2v104L107.4 826.6c-10.2 21.2-8.2 45.9 5.2 65.4 13.5 19.6 36.6 31.4 61.4 31.4h675.8c25 0 48.2-12 61.6-31.7 13.6-19.7 15.3-44.6 4.8-65.8z m-738.6 21.6l203.9-424.9V303.9h254.7v118.7l210.1 424.9H177.6z m203.9-263.3c-1.5-1.4-116 226.1-116 226.1h492.8L620.7 540.4s-141 135.3-239.2 43.8z m151-120.9c34 0 61.6-25.9 61.6-57.8s-27.6-57.8-61.6-57.8-61.6 25.9-61.6 57.8c0 32 27.6 57.8 61.6 57.8z m20.6-285.6c22.7 0 41.1-17.3 41.1-38.6s-18.4-38.5-41.1-38.5c-22.7 0-41.1 17.3-41.1 38.5 0 21.3 18.4 38.6 41.1 38.6zM470.9 579c22.7 0 41.1-17.3 41.1-38.6s-18.4-38.5-41.1-38.5c-22.7 0-41.1 17.3-41.1 38.5s18.4 38.6 41.1 38.6z '
        },
        {
          id: 1,
          text: '学生招生在线',
          iconPath: 'M512 32C246.912 32 32 246.848 32 512s214.912 480 480 480c265.152 0 480-214.848 480-480S777.152 32 512 32zM320.256 143.04c20.864-10.88 42.688-20.16 65.408-27.392-23.616 34.624-43.968 78.656-59.904 129.6-23.808-15.232-37.76-33.472-37.76-53.248 0-17.984 12.224-34.56 32.256-48.96zM227.136 209.344c7.424 37.568 36.864 71.296 82.752 96.512-11.84 53.376-19.2 112.064-21.12 174.144H97.6a414.464 414.464 0 0 1 129.536-270.656z m0 605.312A414.464 414.464 0 0 1 97.6 544h191.104c1.92 62.08 9.344 120.768 21.184 174.144-45.888 25.088-75.328 58.944-82.752 96.512z m93.12 66.304C300.224 866.56 288 849.92 288 832c0-19.776 13.952-38.08 37.76-53.312 15.936 51.008 36.288 94.976 59.904 129.664a411.392 411.392 0 0 1-65.408-27.392z m159.744 38.656c-40.192-21.184-74.816-81.856-97.92-165.568a425.536 425.536 0 0 1 97.92-16.704v182.272z m0-245.824a454.592 454.592 0 0 0-111.68 20.288A966.4 966.4 0 0 1 352.64 544H480v129.792z m0-193.792H352.64a966.4 966.4 0 0 1 15.68-150.08 460.608 460.608 0 0 0 111.68 20.352V480z m0-193.344a432.512 432.512 0 0 1-97.92-16.704c23.104-83.712 57.728-144.32 97.92-165.568v182.272z m316.864-77.312A414.08 414.08 0 0 1 926.336 480h-191.104c-1.92-62.08-9.344-120.768-21.184-174.144 45.952-25.152 75.392-58.944 82.816-96.512z m-93.12-66.304c20.032 14.4 32.256 30.976 32.256 48.96 0 19.776-13.952 38.016-37.76 53.248-15.936-50.944-36.288-94.976-59.968-129.6a409.6 409.6 0 0 1 65.472 27.392zM544 104.384c40.256 21.248 74.88 81.856 97.92 165.568a432.512 432.512 0 0 1-97.92 16.704V104.384z m0 245.888a460.096 460.096 0 0 0 111.68-20.288c8.64 45.888 14.144 96.448 15.68 150.016H544V350.272z m0 193.728h127.36c-1.536 53.568-7.04 104.128-15.68 150.144a454.016 454.016 0 0 0-111.68-20.288V544z m0 375.616v-182.272a425.536 425.536 0 0 1 97.92 16.704c-23.04 83.712-57.664 144.384-97.92 165.568z m159.744-38.656c-20.864 10.88-42.688 20.16-65.408 27.456 23.616-34.688 44.032-78.656 59.968-129.664 23.808 15.232 37.76 33.536 37.76 53.312-0.064 17.856-12.288 34.496-32.32 48.896z m93.12-66.304c-7.424-37.568-36.928-71.36-82.816-96.512a936.96 936.96 0 0 0 21.184-174.144h191.104a414.08 414.08 0 0 1-129.472 270.656z '
        },
        {
          id: 1,
          text: '数据库系统',
          iconPath: 'M512 32C246.912 32 32 246.848 32 512s214.912 480 480 480c265.152 0 480-214.848 480-480S777.152 32 512 32zM320.256 143.04c20.864-10.88 42.688-20.16 65.408-27.392-23.616 34.624-43.968 78.656-59.904 129.6-23.808-15.232-37.76-33.472-37.76-53.248 0-17.984 12.224-34.56 32.256-48.96zM227.136 209.344c7.424 37.568 36.864 71.296 82.752 96.512-11.84 53.376-19.2 112.064-21.12 174.144H97.6a414.464 414.464 0 0 1 129.536-270.656z m0 605.312A414.464 414.464 0 0 1 97.6 544h191.104c1.92 62.08 9.344 120.768 21.184 174.144-45.888 25.088-75.328 58.944-82.752 96.512z m93.12 66.304C300.224 866.56 288 849.92 288 832c0-19.776 13.952-38.08 37.76-53.312 15.936 51.008 36.288 94.976 59.904 129.664a411.392 411.392 0 0 1-65.408-27.392z m159.744 38.656c-40.192-21.184-74.816-81.856-97.92-165.568a425.536 425.536 0 0 1 97.92-16.704v182.272z m0-245.824a454.592 454.592 0 0 0-111.68 20.288A966.4 966.4 0 0 1 352.64 544H480v129.792z m0-193.792H352.64a966.4 966.4 0 0 1 15.68-150.08 460.608 460.608 0 0 0 111.68 20.352V480z m0-193.344a432.512 432.512 0 0 1-97.92-16.704c23.104-83.712 57.728-144.32 97.92-165.568v182.272z m316.864-77.312A414.08 414.08 0 0 1 926.336 480h-191.104c-1.92-62.08-9.344-120.768-21.184-174.144 45.952-25.152 75.392-58.944 82.816-96.512z m-93.12-66.304c20.032 14.4 32.256 30.976 32.256 48.96 0 19.776-13.952 38.016-37.76 53.248-15.936-50.944-36.288-94.976-59.968-129.6a409.6 409.6 0 0 1 65.472 27.392zM544 104.384c40.256 21.248 74.88 81.856 97.92 165.568a432.512 432.512 0 0 1-97.92 16.704V104.384z m0 245.888a460.096 460.096 0 0 0 111.68-20.288c8.64 45.888 14.144 96.448 15.68 150.016H544V350.272z m0 193.728h127.36c-1.536 53.568-7.04 104.128-15.68 150.144a454.016 454.016 0 0 0-111.68-20.288V544z m0 375.616v-182.272a425.536 425.536 0 0 1 97.92 16.704c-23.04 83.712-57.664 144.384-97.92 165.568z m159.744-38.656c-20.864 10.88-42.688 20.16-65.408 27.456 23.616-34.688 44.032-78.656 59.968-129.664 23.808 15.232 37.76 33.536 37.76 53.312-0.064 17.856-12.288 34.496-32.32 48.896z m93.12-66.304c-7.424-37.568-36.928-71.36-82.816-96.512a936.96 936.96 0 0 0 21.184-174.144h191.104a414.08 414.08 0 0 1-129.472 270.656z '
        },
        {
          id: 1,
          text: '大学生创业网',
          iconPath: 'M512 32C246.912 32 32 246.848 32 512s214.912 480 480 480c265.152 0 480-214.848 480-480S777.152 32 512 32zM320.256 143.04c20.864-10.88 42.688-20.16 65.408-27.392-23.616 34.624-43.968 78.656-59.904 129.6-23.808-15.232-37.76-33.472-37.76-53.248 0-17.984 12.224-34.56 32.256-48.96zM227.136 209.344c7.424 37.568 36.864 71.296 82.752 96.512-11.84 53.376-19.2 112.064-21.12 174.144H97.6a414.464 414.464 0 0 1 129.536-270.656z m0 605.312A414.464 414.464 0 0 1 97.6 544h191.104c1.92 62.08 9.344 120.768 21.184 174.144-45.888 25.088-75.328 58.944-82.752 96.512z m93.12 66.304C300.224 866.56 288 849.92 288 832c0-19.776 13.952-38.08 37.76-53.312 15.936 51.008 36.288 94.976 59.904 129.664a411.392 411.392 0 0 1-65.408-27.392z m159.744 38.656c-40.192-21.184-74.816-81.856-97.92-165.568a425.536 425.536 0 0 1 97.92-16.704v182.272z m0-245.824a454.592 454.592 0 0 0-111.68 20.288A966.4 966.4 0 0 1 352.64 544H480v129.792z m0-193.792H352.64a966.4 966.4 0 0 1 15.68-150.08 460.608 460.608 0 0 0 111.68 20.352V480z m0-193.344a432.512 432.512 0 0 1-97.92-16.704c23.104-83.712 57.728-144.32 97.92-165.568v182.272z m316.864-77.312A414.08 414.08 0 0 1 926.336 480h-191.104c-1.92-62.08-9.344-120.768-21.184-174.144 45.952-25.152 75.392-58.944 82.816-96.512z m-93.12-66.304c20.032 14.4 32.256 30.976 32.256 48.96 0 19.776-13.952 38.016-37.76 53.248-15.936-50.944-36.288-94.976-59.968-129.6a409.6 409.6 0 0 1 65.472 27.392zM544 104.384c40.256 21.248 74.88 81.856 97.92 165.568a432.512 432.512 0 0 1-97.92 16.704V104.384z m0 245.888a460.096 460.096 0 0 0 111.68-20.288c8.64 45.888 14.144 96.448 15.68 150.016H544V350.272z m0 193.728h127.36c-1.536 53.568-7.04 104.128-15.68 150.144a454.016 454.016 0 0 0-111.68-20.288V544z m0 375.616v-182.272a425.536 425.536 0 0 1 97.92 16.704c-23.04 83.712-57.664 144.384-97.92 165.568z m159.744-38.656c-20.864 10.88-42.688 20.16-65.408 27.456 23.616-34.688 44.032-78.656 59.968-129.664 23.808 15.232 37.76 33.536 37.76 53.312-0.064 17.856-12.288 34.496-32.32 48.896z m93.12-66.304c-7.424-37.568-36.928-71.36-82.816-96.512a936.96 936.96 0 0 0 21.184-174.144h191.104a414.08 414.08 0 0 1-129.472 270.656z '
        },
        {
          id: 1,
          text: '大学招生网',
          iconPath: 'M512 32C246.912 32 32 246.848 32 512s214.912 480 480 480c265.152 0 480-214.848 480-480S777.152 32 512 32zM320.256 143.04c20.864-10.88 42.688-20.16 65.408-27.392-23.616 34.624-43.968 78.656-59.904 129.6-23.808-15.232-37.76-33.472-37.76-53.248 0-17.984 12.224-34.56 32.256-48.96zM227.136 209.344c7.424 37.568 36.864 71.296 82.752 96.512-11.84 53.376-19.2 112.064-21.12 174.144H97.6a414.464 414.464 0 0 1 129.536-270.656z m0 605.312A414.464 414.464 0 0 1 97.6 544h191.104c1.92 62.08 9.344 120.768 21.184 174.144-45.888 25.088-75.328 58.944-82.752 96.512z m93.12 66.304C300.224 866.56 288 849.92 288 832c0-19.776 13.952-38.08 37.76-53.312 15.936 51.008 36.288 94.976 59.904 129.664a411.392 411.392 0 0 1-65.408-27.392z m159.744 38.656c-40.192-21.184-74.816-81.856-97.92-165.568a425.536 425.536 0 0 1 97.92-16.704v182.272z m0-245.824a454.592 454.592 0 0 0-111.68 20.288A966.4 966.4 0 0 1 352.64 544H480v129.792z m0-193.792H352.64a966.4 966.4 0 0 1 15.68-150.08 460.608 460.608 0 0 0 111.68 20.352V480z m0-193.344a432.512 432.512 0 0 1-97.92-16.704c23.104-83.712 57.728-144.32 97.92-165.568v182.272z m316.864-77.312A414.08 414.08 0 0 1 926.336 480h-191.104c-1.92-62.08-9.344-120.768-21.184-174.144 45.952-25.152 75.392-58.944 82.816-96.512z m-93.12-66.304c20.032 14.4 32.256 30.976 32.256 48.96 0 19.776-13.952 38.016-37.76 53.248-15.936-50.944-36.288-94.976-59.968-129.6a409.6 409.6 0 0 1 65.472 27.392zM544 104.384c40.256 21.248 74.88 81.856 97.92 165.568a432.512 432.512 0 0 1-97.92 16.704V104.384z m0 245.888a460.096 460.096 0 0 0 111.68-20.288c8.64 45.888 14.144 96.448 15.68 150.016H544V350.272z m0 193.728h127.36c-1.536 53.568-7.04 104.128-15.68 150.144a454.016 454.016 0 0 0-111.68-20.288V544z m0 375.616v-182.272a425.536 425.536 0 0 1 97.92 16.704c-23.04 83.712-57.664 144.384-97.92 165.568z m159.744-38.656c-20.864 10.88-42.688 20.16-65.408 27.456 23.616-34.688 44.032-78.656 59.968-129.664 23.808 15.232 37.76 33.536 37.76 53.312-0.064 17.856-12.288 34.496-32.32 48.896z m93.12-66.304c-7.424-37.568-36.928-71.36-82.816-96.512a936.96 936.96 0 0 0 21.184-174.144h191.104a414.08 414.08 0 0 1-129.472 270.656z '
        },


      ]


    }

  },
  mounted() {
    this.getData();
    this.init()
  },
  methods: {
    changeTab(index) {
      this.tabIndex = index;
    },
    getTodayDate() {
      const now = new Date();
      const options = {year: 'numeric', month: 'long', day: 'numeric'};
      this.today = now.toLocaleDateString('zh-CN', options);
    },
    MouseFun(type) {
      type === '移入' ? clearTimeout(this.start) : this.init()
    },

    init() {
      this.start = setInterval(() => {
        this.NextFun()
      }, 1500)
    },

    throttle(fun) {
      if (this.flag) {
        this.flag = false;
        fun();
        setTimeout(() => {
          this.flag = true;
        }, 650);
      }
    },
    // 上一张
    PrevFun() {
      if (this.leftVal === 0) {

        this.ition = 0
        this.imgShow = this.imgList.length - 1
        this.leftVal = this.imgList.length * this.imgWidth
        this.$nextTick(() => {
          setTimeout(() => {
            this.ition = 0.6
            this.leftVal -= this.imgWidth
          }, this.ition * 1000)
        })
      } else {
        this.ition = 0.6
        this.leftVal -= this.imgWidth
        this.imgShow--
      }
    },
    // 下一张
    NextFun() {
      if (this.leftVal === (this.imgList.length - 1) * this.imgWidth) {
        this.ition = 0.6
        this.leftVal += this.imgWidth
        this.imgShow = 0
        this.$nextTick(() => {
          setTimeout(() => {
            this.ition = 0
            this.leftVal = 0
          }, this.ition * 1000)
        })
      } else {
        this.ition = 0.6
        this.leftVal += this.imgWidth
        this.imgShow++
      }
    },
    // 点击小圆点
    instFun(index) {
      this.ition = 0.6
      this.leftVal = index * this.imgWidth
      this.imgShow = index
    },
    handleAnnouncementChange(page) {
      this.currentPage_announcement = page;
    },
    // 新闻分页变化处理
    handleNewsChange(page) {
      this.currentPage_news = page;
    },
    handleNoticeChange(page) {
      this.currentPage_notice = page;
      console.log(this.pageSize_notice * (this.currentPage_notice - 1))
    },
    introduction() {
      this.$router.push({name: 'index'});
    },
    use() {
      this.$router.push({name: 'use'});
    },
    notice() {
      this.$router.push({name: 'notice'});
    },
    about() {
      this.$router.push({name: 'about'});
    },
    getData() {
      axios.get('http://106.53.100.120:8090/api/newsByCategory', {
        params: {
          category: '0'
        }

      })
          .then(response => {
            if (response.data.data && response.data.data.length > 0) {
              this.newsList = response.data.data;
            }
            this.totalItems_news = this.newsList.length;
            this.message = response.data.message;
            console.log(this.newsList);
          })
          .catch(() => {
            console.log(this.message);
            this.totalItems_news = this.newsList.length;
          });
      axios.get('http://106.53.100.120:8090/api/newsByCategory', {
        params: {
          category: '1'
        }

      })
          .then(response => {
            if (response.data.data && response.data.data.length > 0) {
              this.announcementList = response.data.data;
            }
            this.totalItems_announcement = this.announcementList.length;
            this.message = response.data.message;
            // console.log(this.announcementList);
          })
          .catch(() => {
            console.log(this.message);
            this.totalItems_announcement = this.announcementList.length;
          });
      axios.get('http://106.53.100.120:8090/api/newsByCategory', {
        params: {
          category: '2'
        }

      })
          .then(response => {
            if (response.data.data && response.data.data.length > 0) {
              this.noticeList = response.data.data;
            }
            this.totalItems_notice = this.noticeList.length;
            this.message = response.data.message;
            console.log(response.data.data);
          })
          .catch(() => {
            console.log(this.message);
            this.totalItems_notice = this.noticeList.length;
          });
    },
    handleClick(news) {
      const newsUrl = news.newsUrl;
      // window.location.href = newsUrl;
      const encodedUrl = encodeURIComponent(newsUrl);
      this.$router.push({ name: 'noticeDetail', params: { url: encodedUrl } });
      // this.$router.push({ name: 'noticeDetail', params: { url: newsUrl } });

    }
  },
  computed: {
    // 计算当前页的公告数据
    paginatedAnnouncement() {
      const start = (this.currentPage_announcement - 1) * this.pageSize_announcement;
      const end = start + this.pageSize_announcement;

      return this.announcementList.slice(start, end);
    },
    // 计算当前页的新闻数据
    paginatedNews() {
      const start = (this.currentPage_news - 1) * this.pageSize_news;
      const end = start + this.pageSize_news;
      return this.newsList.slice(start, end);
    },
    paginatedNotice() {
      const start = (this.currentPage_notice - 1) * this.pageSize_notice;
      const end = start + this.pageSize_notice;
      return this.noticeList.slice(start, end);
    },
    paginatedNoticeWithLimit() {
      return this.paginatedNotice.map((news) => {
        return {
          newsUrl: news.newsUrl,
          userTitle: news.userTitle.length > 30 ? news.userTitle.substring(0, 30) + '...' : news.userTitle
        };
      });
    },
    paginatedAnnouncementWithLimit() {
      return this.paginatedAnnouncement.map((news) => {
        return {
          newsUrl: news.newsUrl,
          userTitle: news.userTitle.length > 30 ? news.userTitle.substring(0, 30) + '...' : news.userTitle
        };
      });
    },
    paginatedNewsWithLimit() {
      return this.paginatedNews.map((news) => {
        return {
          newsUrl: news.newsUrl,
          userTitle: news.userTitle.length > 30 ? news.userTitle.substring(0, 30) + '...' : news.userTitle
        };
      });
    },


  },
}
</script>
