<template>
      <div class="chat-container">
    <!-- 未登录提示 -->
    <div v-if="loginRequired" class="login-required">
      <el-alert
        title="需要登录"
        type="warning"
        description="您需要登录才能使用聊天功能"
        show-icon
        :closable="false"
      />
      <div class="login-actions">
        <p>登录已过期或您尚未登录，请重新登录以继续使用聊天功能</p>
        <el-button type="primary" @click="goToLogin" class="login-button">
          前往登录
        </el-button>
        <el-button @click="tryRefreshToken" class="login-button">
          刷新Token
        </el-button>
      </div>
    </div>
    
    <!-- 聊天界面，仅在登录后显示 -->
    <div v-else class="chat-layout">
      <!-- 左侧会话列表 -->
      <div class="conversation-list">
        <div class="list-header">
          <h2>会话列表</h2>
          <div class="action-buttons">
            <el-button size="small" type="primary" @click="showNewPrivateChat">私聊</el-button>
            <el-button size="small" type="success" @click="showNewGroupChat">群聊</el-button>
            <el-button size="small" type="info" @click="testGetUsers">测试</el-button>
          </div>
        </div>
        
        <!-- 会话列表 -->
        <div class="conversation-items">
          <div 
            v-for="conv in conversations" 
            :key="conv.conversation.id" 
            class="conversation-item"
            :class="{ active: currentConversation && currentConversation.conversation.id === conv.conversation.id }"
            @click="selectConversation(conv)"
          >
            <div class="avatar">{{ conv.avatar }}</div>
            <div class="info">
              <div class="title">{{ conv.title }}</div>
              <div class="last-message" v-if="conv.lastMessage">
                {{ conv.lastMessage.content.length > 15 ? conv.lastMessage.content.substring(0, 15) + '...' : conv.lastMessage.content }}
              </div>
            </div>
            <div class="badge" v-if="conv.unreadCount > 0">{{ conv.unreadCount }}</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧聊天区域 -->
      <div class="chat-area">
        <template v-if="currentConversation">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <h3>{{ currentConversation.title }}</h3>
            <div class="participants" v-if="currentConversation.conversation.type === 'GROUP'">
              <el-button size="small" @click="showParticipants">查看成员</el-button>
            </div>
              </div>
              
          <!-- 消息列表 -->
          <div class="message-list" ref="messageList">
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              class="message-item"
              :class="{ 'self': message.senderId === currentUser.id }"
            >
              <div class="message-avatar">{{ message.senderName.substring(0, 1) }}</div>
              <div class="message-content">
                <div class="sender-name">{{ message.senderName }}</div>
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.createdAt) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="input-area">
            <el-input
              v-model="messageInput"
              type="textarea"
              :rows="3"
              placeholder="输入消息..."
              @keyup.enter.native="sendMessage"
            ></el-input>
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </div>
        </template>
        
        <div v-else class="no-conversation">
          <p>请选择一个会话或创建新会话</p>
          </div>
        </div>
        
      <!-- 新建私聊对话框 -->
      <el-dialog title="新建私聊" v-model="newPrivateChatVisible" width="30%">
        <div v-if="users.length <= 1">
          <el-alert
            title="没有其他用户可聊天"
            type="info"
            description="系统中没有其他用户可以聊天"
            show-icon
            :closable="false"
          />
        </div>
        <div v-else>
          <p>系统中共有 {{ users.length }} 个用户，当前显示 {{ users.filter(u => u.id !== currentUser.id).length }} 个可聊天用户</p>
          <el-select v-model="selectedUserId" filterable placeholder="选择用户" @visible-change="(visible) => { if(visible) console.log('下拉框打开，可选用户:', users.filter(u => u && u.id !== currentUser.id)) }">
            <el-option
              v-for="user in users.filter(u => u && u.id !== currentUser.id)"
              :key="user.id"
              :label="`${user.name || '未知用户'} (${user.username || '无用户名'})`"
              :value="user.id"
            >
              <span>{{ user.name || '未知用户' }} ({{ user.username || '无用户名' }})</span>
            </el-option>
          </el-select>
          <div class="debug-info" style="margin-top: 10px; font-size: 12px; color: #666;">
            <div>当前用户: {{ currentUser ? currentUser.name : '未知' }} (ID: {{ currentUser ? currentUser.id : '未知' }})</div>
            <div>可选用户: {{ users.filter(u => u && u.id !== (currentUser ? currentUser.id : -1)).map(u => u.name || '未知用户').join(', ') }}</div>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="newPrivateChatVisible = false">取消</el-button>
            <el-button type="primary" @click="createPrivateChat" :disabled="!selectedUserId">创建</el-button>
          </div>
        </template>
      </el-dialog>
      
      <!-- 新建群聊对话框 -->
      <el-dialog title="新建群聊" v-model="newGroupChatVisible" width="30%">
        <div v-if="users.length <= 1">
          <el-alert
            title="没有其他用户可添加"
            type="info"
            description="系统中没有其他用户可以添加到群聊"
            show-icon
            :closable="false"
          />
        </div>
        <div v-else>
          <el-form>
            <el-form-item label="群名称">
              <el-input v-model="groupName" placeholder="请输入群名称"></el-input>
            </el-form-item>
            <el-form-item label="群成员">
              <p>系统中共有 {{ users.length }} 个用户，当前显示 {{ users.filter(u => u && u.id !== (currentUser ? currentUser.id : -1)).length }} 个可选用户</p>
              <el-select v-model="selectedUserIds" multiple filterable placeholder="选择群成员">
                <el-option
                  v-for="user in users.filter(u => u && u.id !== (currentUser ? currentUser.id : -1))"
                  :key="user.id"
                  :label="`${user.name || '未知用户'}(${user.username || '无用户名'})`"
                  :value="user.id"
                >
                  <span>{{ user.name || '未知用户' }} ({{ user.username || '无用户名' }})</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="warning" @click="refreshToken">刷新Token</el-button>
              <span class="token-info">当前Token: {{ getCookie('satoken') ? getCookie('satoken').substring(0, 8) + '...' : '无' }}</span>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="newGroupChatVisible = false">取消</el-button>
            <el-button type="primary" @click="createGroupChat" :disabled="!groupName.trim() || selectedUserIds.length === 0">创建</el-button>
          </div>
        </template>
      </el-dialog>
      
      <!-- 查看成员对话框 -->
      <el-dialog title="群成员" v-model="participantsVisible" width="30%">
        <ul class="participant-list">
          <li v-for="participant in participants" :key="participant.id">
            <span class="participant-avatar">{{ participant.name.substring(0, 1) }}</span>
            <span class="participant-name">{{ participant.name }}</span>
          </li>
        </ul>
      </el-dialog>
      </div>
    </div>
  </template>
  
  <script>
import axios from '@/utils/http.js';
import { ref, onMounted } from 'vue';
  
  export default {
  name: 'ChatView',
  data() {
    return {
      // 当前用户信息
      currentUser: null,
      
      // 会话列表
      conversations: [],
      currentConversation: null,
      
      // 消息
      messages: [],
      messageInput: '',
      
      // WebSocket
      socket: null,
      reconnectCount: 0,
      reconnectTimer: null,
      
      // 新建私聊
      newPrivateChatVisible: false,
      selectedUserId: null,
      users: [],
      
      // 新建群聊
      newGroupChatVisible: false,
      groupName: '',
      selectedUserIds: [],
      
      // 查看成员
      participantsVisible: false,
      participants: [],
      
      // 登录提示
      loginRequired: false,
      
      // 重试计数
      _retryCount: 0,
      
      // 登录状态检查中
      checkingLogin: false
    };
  },
  created() {
    // 获取当前登录用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    let token = this.getCookie('satoken');
    const username = this.getCookie('username');
    const userId = this.getCookie('userid');
    
    // 如果cookie中没有token，尝试从localStorage获取
    if (!token) {
      token = localStorage.getItem('satoken');
      if (token) {
        console.log('从localStorage恢复token:', token);
        this.setCookie('satoken', token, 1);
      }
    }
    
    if (userId && username && token) {
      // 如果cookie中有用户信息，使用它
      this.currentUser = {
        id: parseInt(userId),
        name: this.getCookie('name') || username,
        username: username
      };
      
      console.log('当前用户信息:', this.currentUser);
      
      // 刷新token，确保所有cookie都正确设置
      this.refreshToken();
      
      // 获取会话列表
      this.fetchConversations();
      
      // 获取用户列表 - 不直接在这里显示对话框，等用户点击按钮才调用
      this.fetchUsers()
        .then(() => {
          console.log('初始用户列表加载成功');
        })
        .catch(err => {
          console.error('初始用户列表加载失败', err);
        });
      
      // 连接WebSocket
      this.connectWebSocket();
    } else {
      // 如果没有登录信息，显示提示
      this.loginRequired = true;
      console.log('未登录或登录已过期，需要重新登录');
    }
  },
  beforeDestroy() {
    // 关闭WebSocket连接
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  },
  methods: {
    // 获取会话列表
    fetchConversations() {
      const token = this.getCookie('satoken');
      if (!token) {
        console.error('未检测到登录令牌，请先登录');
        this.loginRequired = true;
        return;
      }
      
      console.log('正在获取会话列表，当前token:', token);
      axios.get('/api/chat/conversations')
        .then(response => {
          console.log('会话列表响应:', response);
          if (response.data && response.data.status === 10000) {
            this.conversations = response.data.data;
            console.log('获取到的会话列表:', this.conversations);
          } else {
            console.error('获取会话列表失败:', response.data);
            this.$message.error(response.data?.message || '获取会话列表失败');
          }
        })
        .catch(error => {
          console.error('获取会话列表失败', error);
          if (error.response) {
            console.error('错误响应:', error.response);
          }
          this.$message.error('获取会话列表失败');
        });
    },
    
    // 获取用户列表
    fetchUsers() {
      const token = this.getCookie('satoken');
      if (!token) {
        console.error('未检测到登录令牌，请先登录');
        this.loginRequired = true;
        return Promise.reject(new Error('未检测到登录令牌'));
      }

      console.log('正在获取用户列表，当前token:', token);
      return axios.get('/api/chat/users')
        .then(response => {
          console.log('用户列表响应:', response);
          if (response.data && response.data.status === 10000) {
            // 打印每个用户的详细信息，便于调试
            console.log('用户列表详情:');
            response.data.data.forEach(user => {
              console.log(`用户ID: ${user.id}, 用户名: ${user.username}, 姓名: ${user.name}, 角色: ${user.role}`);
            });
            
            this.users = response.data.data;
            console.log('获取到的用户列表:', this.users);
            console.log('当前用户信息:', this.currentUser);
            console.log('可选择的用户数量:', this.users.filter(u => u && u.id !== (this.currentUser ? this.currentUser.id : -1)).length);
            
            // 检查私聊对话框中的用户选项
            console.log('当前用户ID:', this.currentUser ? this.currentUser.id : '未知');
            console.log('可选择的用户数量:', this.users.filter(u => u && u.id !== (this.currentUser ? this.currentUser.id : -1)).length);
            
            return this.users;
          } else {
            console.error('获取用户列表失败:', response.data);
            this.$message.error(response.data?.message || '获取用户列表失败');
            return Promise.reject(new Error('获取用户列表失败'));
          }
        })
        .catch(error => {
          console.error('获取用户列表失败', error);
          if (error.response) {
            console.error('错误响应:', error.response);
          }
          if (error.response && error.response.status === 500) {
            // 检查是否是登录过期或无效token
            if (error.response.data && error.response.data.message && 
                error.response.data.message.includes('未能读取到有效Token')) {
              this.loginRequired = true;
              this.$message.error('登录已过期，请重新登录');
            } else {
              this.$message.error('获取用户列表失败');
            }
          } else {
            this.$message.error('获取用户列表失败');
          }
          return Promise.reject(error);
        });
    },
    
    // 选择会话
    selectConversation(conversation) {
      this.currentConversation = conversation;
      this.fetchMessages(conversation.conversation.id);
      
      // 获取token
      const token = this.getCookie('satoken');
      if (!token) {
        console.error('未检测到登录令牌，无法标记已读');
        return;
      }
      
      // 标记为已读
      console.log('正在标记会话已读，会话ID:', conversation.conversation.id);
      
      // 添加token参数到URL
      const url = `/api/chat/read/${conversation.conversation.id}?token=${encodeURIComponent(token)}`;
      
      // 发送请求，使用URL参数和请求头传递token
      axios.post(url, {}, {
        headers: {
          'satoken': token,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log('标记已读成功:', response);
          // 更新未读数
          conversation.unreadCount = 0;
        })
        .catch(error => {
          console.error('标记已读失败', error);
          // 如果是Token无效，尝试重新登录
          if (error.response && error.response.status === 500 && 
              error.response.data && error.response.data.message &&
              error.response.data.message.includes('未能读取到有效Token')) {
            this.$message.error('登录已过期，请重新登录');
            this.loginRequired = true;
          }
        });
    },
    
    // 获取会话消息
    fetchMessages(conversationId, page = 0, size = 50) {
      const token = this.getCookie('satoken');
      if (!token) {
        console.error('未检测到登录令牌，请先登录');
        return;
      }
      
      console.log('正在获取会话消息，会话ID:', conversationId, '当前token:', token);
      axios.get(`/api/chat/messages/${conversationId}?page=${page}&size=${size}`)
        .then(response => {
          console.log('会话消息响应:', response);
          if (response.data && response.data.status === 10000) {
            this.messages = response.data.data.reverse(); // 反转消息顺序，最新的在底部
            console.log('获取到的消息:', this.messages);
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          } else {
            console.error('获取消息失败:', response.data);
            this.$message.error(response.data?.message || '获取消息失败');
          }
        })
        .catch(error => {
          console.error('获取消息失败', error);
          if (error.response) {
            console.error('错误响应:', error.response);
          }
          this.$message.error('获取消息失败');
        });
    },
    
    // 发送消息
    sendMessage() {
      if (!this.messageInput.trim()) {
        return;
      }
      
      if (!this.currentConversation) {
        this.$message.warning('请先选择一个会话');
        return;
      }
      
      // 检查WebSocket连接状态
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket连接已断开，尝试重新连接');
        this.$message.warning('聊天服务连接已断开，正在尝试重新连接...');
      }
      
      // 无论WebSocket状态如何，都尝试发送消息
      // doSendMessage方法内部会处理WebSocket连接问题
      this.doSendMessage();
    },
    
    // 实际发送消息的方法
    doSendMessage() {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket连接未打开，无法发送消息');
        this.$message.warning('聊天服务连接已断开，正在尝试重新连接...');
        
        // 存储消息以便连接成功后发送
        const pendingMessage = {
          conversationId: this.currentConversation.conversation.id,
          senderId: this.currentUser.id,
          senderName: this.currentUser.name,
          content: this.messageInput,
          type: this.currentConversation.conversation.type
        };
        
        // 尝试重新连接WebSocket
        this.connectWebSocket();
        
        // 连接成功后发送
        let retryCount = 0;
        const maxRetries = 3;
        const checkAndSend = () => {
          if (retryCount >= maxRetries) {
            this.$message.error('无法连接到聊天服务，请刷新页面重试');
            return;
          }
          
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
              this.socket.send(JSON.stringify(pendingMessage));
              
              // 在本地添加消息
              this.messages.push({
                ...pendingMessage,
                createdAt: new Date()
              });
              
              // 清空输入框
              this.messageInput = '';
              
              // 滚动到底部
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            } catch (error) {
              console.error('发送消息失败:', error);
              this.$message.error('发送消息失败，请检查网络连接');
            }
          } else {
            retryCount++;
            setTimeout(checkAndSend, 1000);
          }
        };
        
        setTimeout(checkAndSend, 1000);
        return;
      }
      
      const message = {
        conversationId: this.currentConversation.conversation.id,
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        content: this.messageInput,
        type: this.currentConversation.conversation.type
      };
      
      console.log('发送WebSocket消息:', message);
      
      try {
        // 通过WebSocket发送消息
        this.socket.send(JSON.stringify(message));
        
        // 在本地添加消息
        this.messages.push({
          ...message,
          createdAt: new Date()
        });
        
        // 清空输入框
        this.messageInput = '';
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('发送消息失败:', error);
        this.$message.error('发送消息失败，请检查网络连接');
      }
    },
    
    // 连接WebSocket
    connectWebSocket() {
      try {
        const token = this.getCookie('satoken');
        if (!token) {
          console.error('未检测到登录令牌，无法连接WebSocket');
          this.$message.error('未登录或登录已过期，请重新登录');
          this.handleTokenInvalid();
          return;
        }
        
        console.log('尝试连接WebSocket，当前token:', token);
        
        // 创建WebSocket连接
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8080/api/ws/chat?token=${encodeURIComponent(token)}`;
        console.log('WebSocket连接URL:', wsUrl);
        
        // 先关闭之前的连接
        if (this.socket) {
          try {
            this.socket.close();
          } catch (e) {
            console.error('关闭旧WebSocket连接时出错:', e);
          }
          this.socket = null;
        }
        
        // 创建新连接
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('WebSocket连接已建立');
          this.$message.success('聊天服务连接成功');
          this.reconnectCount = 0; // 重置重连计数
        };
        
        this.socket.onmessage = (event) => {
          try {
            console.log('收到WebSocket消息:', event.data);
            const message = JSON.parse(event.data);
            
            // 如果当前正在查看该会话，则直接添加消息
            if (this.currentConversation && message.conversationId === this.currentConversation.conversation.id) {
              this.messages.push(message);
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            } else {
              // 否则更新未读消息数
              const conversation = this.conversations.find(c => c.conversation.id === message.conversationId);
              if (conversation) {
                conversation.unreadCount = (conversation.unreadCount || 0) + 1;
                conversation.lastMessage = message;
              } else {
                // 如果是新会话，刷新会话列表
                this.fetchConversations();
              }
            }
          } catch (error) {
            console.error('解析WebSocket消息失败', error);
          }
        };
        
        this.socket.onclose = (event) => {
          console.log('WebSocket连接已关闭', event);
          
          // 如果是正常关闭，不进行重连
          if (event.wasClean) {
            console.log('WebSocket连接正常关闭');
            return;
          }
          
          // 检查是否是token无效导致的关闭
          if (event.code === 1006) {
            // 验证token是否仍然有效
            this.validateToken()
              .then(valid => {
                if (!valid) {
                  console.log('Token无效，需要重新登录');
                  this.handleTokenInvalid();
                  return;
                }
                // Token有效但连接断开，尝试重连
                this.handleReconnect();
              })
              .catch(() => {
                this.handleTokenInvalid();
              });
          } else {
            // 其他原因的断开，尝试重连
            this.handleReconnect();
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket错误', error);
          // WebSocket错误通常会触发onclose事件，所以这里不需要额外处理重连
        };
        
        // 设置连接超时
        setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket连接超时');
            this.socket.close();
          }
        }, 10000);
        
        return this.socket;
      } catch (error) {
        console.error('创建WebSocket连接时出错:', error);
        this.$message.error('无法连接到聊天服务');
        return null;
      }
    },

    // 处理重连逻辑
    handleReconnect() {
      if (!this.reconnectTimer && this.reconnectCount < 3) { // 减少重试次数到3次
        const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000);
        console.log(`尝试在${delay/1000}秒后重新连接，当前尝试次数: ${this.reconnectCount + 1}`);
        
        this.reconnectTimer = setTimeout(() => {
          this.reconnectCount++;
          this.reconnectTimer = null;
          this.connectWebSocket();
        }, delay);
      } else if (this.reconnectCount >= 3) {
        this.$message.error('聊天服务连接失败，请刷新页面或重新登录');
        this.handleTokenInvalid();
      }
    },

    // 验证token是否有效
    validateToken() {
      return new Promise((resolve) => {
        const token = this.getCookie('satoken');
        if (!token) {
          resolve(false);
          return;
        }

        axios.get('/api/chat/users')
          .then(response => {
            resolve(response.data && response.data.status === 10000);
          })
          .catch(() => {
            resolve(false);
          });
      });
    },

    // 处理token无效的情况
    handleTokenInvalid() {
      this.loginRequired = true;
      // 清除所有相关cookie
      this.deleteCookie('satoken');
      this.deleteCookie('token');
      this.deleteCookie('auth_token');
      this.deleteCookie('username');
      this.deleteCookie('userid');
      this.deleteCookie('name');
      
      // 清除localStorage中的数据
      localStorage.removeItem('satoken');
      localStorage.removeItem('userInfo');
      
      // 停止重连
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.reconnectCount = 0;
      
      // 关闭WebSocket连接
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      
      // 显示提示信息
      this.$message.error('登录已过期，请重新登录');
    },
    
    // 显示新建私聊对话框
    showNewPrivateChat() {
      console.log('显示新建私聊对话框');
      // 重新获取用户列表
      this.fetchUsers()
        .then(() => {
          this.newPrivateChatVisible = true;
          this.selectedUserId = null;
        })
        .catch(err => {
          console.error('获取用户列表失败，无法显示私聊对话框', err);
          this.$message.error('获取用户列表失败，请重试');
        });
    },
    
    // 确保用户登录状态
    ensureLogin() {
      if (this.checkingLogin) {
        console.log('登录状态检查中，请稍候...');
        return Promise.reject(new Error('登录状态检查中'));
      }
      
      this.checkingLogin = true;
      
      return new Promise((resolve, reject) => {
        // 获取token
        const token = this.getCookie('satoken');
        if (!token) {
          this.checkingLogin = false;
          this.$message.error('未检测到登录令牌，请先登录');
          this.loginRequired = true;
          reject(new Error('未检测到登录令牌'));
          return;
        }
        
        // 刷新token
        this.refreshToken();
        
        // 检查登录状态
        console.log('正在检查登录状态...');
        axios.get('/api/chat/users')
          .then(response => {
            if (response.data && response.data.status === 10000) {
              console.log('登录状态有效');
              this.checkingLogin = false;
              resolve(true);
            } else {
              console.error('登录状态检查失败:', response.data);
              this.checkingLogin = false;
              this.loginRequired = true;
              reject(new Error('登录状态检查失败'));
            }
          })
          .catch(error => {
            console.error('登录状态检查失败', error);
            this.checkingLogin = false;
            this.loginRequired = true;
            reject(error);
          });
      });
    },
    
    // 创建私聊
    createPrivateChat() {
      if (!this.selectedUserId) {
        this.$message.warning('请选择用户');
        return;
      }
      
      this.$message.info('正在验证登录状态...');
      
      // 确保用户已登录
      this.ensureLogin()
        .then(() => {
          this.doCreatePrivateChat();
        })
        .catch(error => {
          console.error('登录状态验证失败', error);
          this.$message.error('登录状态验证失败，请重新登录');
        });
    },
    
    // 实际执行创建私聊的方法
    doCreatePrivateChat() {
      // 获取token
      const token = this.getCookie('satoken');
      if (!token) {
        this.$message.error('未检测到登录令牌，请先登录');
        this.loginRequired = true;
        return;
      }
      
      console.log('创建私聊，当前token:', token);
      
      // 重置重试计数
      this._retryCount = 0;
      
      // 构建请求数据
      const requestData = {
        targetUserId: this.selectedUserId
      };
      
      // 添加token参数到URL
      const url = `/api/chat/conversation/private?token=${encodeURIComponent(token)}`;
      
      // 发送请求创建私聊，使用URL参数和请求头传递token
      axios.post(url, requestData, {
        headers: {
          'satoken': token,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (response.data && response.data.status === 10000) {
            this.$message.success('创建私聊成功');
            this.newPrivateChatVisible = false;
            
            // 更新会话列表
            this.fetchConversations();
            
            // 选择新创建的会话
            setTimeout(() => {
              const newConversation = this.conversations.find(c => 
                c.conversation.type === 'PRIVATE' && 
                c.targetUser && 
                c.targetUser.id === this.selectedUserId
              );
              
              if (newConversation) {
                this.selectConversation(newConversation);
              }
            }, 500);
          } else {
            this.$message.error(response.data?.message || '创建私聊失败');
          }
        })
        .catch(error => {
          console.error('创建私聊失败', error);
          if (error.response) {
            console.error('错误响应:', error.response);
            if (error.response.status === 500 && 
                error.response.data && 
                error.response.data.message && 
                error.response.data.message.includes('未能读取到有效Token')) {
              this.$message.error('登录已过期，请重新登录');
              this.loginRequired = true;
            } else if (error.response.status === 400) {
              // 如果是400错误，可能是token问题，尝试重新发送请求
              this.$message.warning('正在尝试重新验证身份...');
              this.refreshToken();
              
              // 防止无限递归，设置最大重试次数
              if (!this._retryCount) this._retryCount = 0;
              if (this._retryCount < 2) {
                this._retryCount++;
                setTimeout(() => {
                  this.doCreatePrivateChat();
                }, 1000);
              } else {
                this._retryCount = 0;
                this.$message.error('创建私聊失败，请刷新页面重试');
              }
            } else {
              this.$message.error(error.response.data?.message || '创建私聊失败');
            }
          } else {
            this.$message.error('创建私聊失败，请检查网络连接');
          }
        });
    },
    
    // 显示新建群聊对话框
    showNewGroupChat() {
      console.log('显示新建群聊对话框');
      // 重新获取用户列表
      this.fetchUsers()
        .then(() => {
          this.newGroupChatVisible = true;
          this.groupName = '';
          this.selectedUserIds = [];
        })
        .catch(err => {
          console.error('获取用户列表失败，无法显示群聊对话框', err);
          this.$message.error('获取用户列表失败，请重试');
        });
    },
    
    // 创建群聊
    createGroupChat() {
      if (!this.groupName.trim()) {
        this.$message.warning('请输入群名称');
        return;
      }
      
      if (this.selectedUserIds.length === 0) {
        this.$message.warning('请选择至少一个群成员');
        return;
      }
      
      this.$message.info('正在验证登录状态...');
      
      // 确保用户已登录
      this.ensureLogin()
        .then(() => {
          // 获取token
          const token = this.getCookie('satoken');
          if (!token) {
            this.$message.error('未检测到登录令牌，请先登录');
            this.loginRequired = true;
            return;
          }
          
          console.log('创建群聊，当前token:', token);
          
          // 构建请求数据
          const requestData = {
            groupName: this.groupName,
            memberIds: this.selectedUserIds
          };
          
          // 添加token参数到URL
          const url = `/api/chat/conversation/group?token=${encodeURIComponent(token)}`;
          
          // 发送请求创建群聊，使用URL参数和请求头传递token
          axios.post(url, requestData, {
            headers: {
              'satoken': token,
              'Content-Type': 'application/json'
            }
          })
            .then(response => {
              if (response.data && response.data.status === 10000) {
                this.$message.success('创建群聊成功');
                this.newGroupChatVisible = false;
                
                // 更新会话列表
                this.fetchConversations();
                
                // 选择新创建的会话
                setTimeout(() => {
                  const newConversation = this.conversations.find(c => 
                    c.conversation.type === 'GROUP' && 
                    c.group && 
                    c.group.name === this.groupName
                  );
                  
                  if (newConversation) {
                    this.selectConversation(newConversation);
                  }
                }, 500);
              } else {
                this.$message.error(response.data?.message || '创建群聊失败');
              }
            })
            .catch(error => {
              console.error('创建群聊失败', error);
              if (error.response) {
                console.error('错误响应:', error.response);
                if (error.response.status === 500 && 
                    error.response.data && 
                    error.response.data.message && 
                    error.response.data.message.includes('未能读取到有效Token')) {
                  this.$message.error('登录已过期，请重新登录');
                  this.loginRequired = true;
                } else {
                  this.$message.error(error.response.data?.message || '创建群聊失败');
                }
              } else {
                this.$message.error('创建群聊失败，请检查网络连接');
              }
            });
        })
        .catch(error => {
          console.error('登录状态验证失败', error);
          this.$message.error('登录状态验证失败，请重新登录');
        });
    },
    
    // 显示参与者列表
    showParticipants() {
      if (!this.currentConversation || this.currentConversation.conversation.type !== 'GROUP') {
        return;
      }
      
      // 确保用户已登录
      this.ensureLogin()
        .then(() => {
          // 获取token
          const token = this.getCookie('satoken');
          if (!token) {
            this.$message.error('未检测到登录令牌，请先登录');
            this.loginRequired = true;
            return;
          }
          
          console.log('获取群成员列表，会话ID:', this.currentConversation.conversation.id, '当前token:', token);
          
          // 添加token参数到URL
          const url = `/api/chat/participants/${this.currentConversation.conversation.id}?token=${encodeURIComponent(token)}`;
          
          // 发送请求，使用URL参数和请求头传递token
          axios.get(url, {
            headers: {
              'satoken': token
            }
          })
            .then(response => {
              if (response.data && response.data.status === 10000) {
                this.participants = response.data.data;
                this.participantsVisible = true;
              } else {
                this.$message.error(response.data?.message || '获取成员列表失败');
              }
            })
            .catch(error => {
              console.error('获取成员列表失败', error);
              if (error.response && error.response.status === 500 && 
                  error.response.data && error.response.data.message && 
                  error.response.data.message.includes('未能读取到有效Token')) {
                this.$message.error('登录已过期，请重新登录');
                this.loginRequired = true;
              } else {
                this.$message.error('获取成员列表失败');
              }
            });
        })
        .catch(error => {
          console.error('登录状态验证失败', error);
          this.$message.error('登录状态验证失败，请重新登录');
        });
    },
    
    // 滚动到底部
    scrollToBottom() {
      if (this.$refs.messageList) {
        this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
      }
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      
      const date = new Date(time);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (24 * 60 * 60 * 1000));
      
      if (diffDays === 0) {
        // 今天，只显示时间
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        // 昨天
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays < 7) {
        // 一周内
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else {
        // 超过一周
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + 
               date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
    },
    
    // 获取cookie
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },
    
    goToLogin() {
      this.$router.push('/login');
    },
    
    testGetUsers() {
      this.fetchUsers()
        .then(users => {
          this.$message.success(`成功获取到${users.length}个用户`);
        })
        .catch(err => {
          this.$message.error('获取用户列表失败');
        });
    },
    
    tryRefreshToken() {
      // 实现刷新Token的逻辑
      console.log('尝试刷新Token');
      
      // 首先尝试获取当前的token
      const token = this.getCookie('satoken');
      if (!token) {
        this.$message.error('没有找到有效的登录令牌，请直接登录');
        return;
      }
      
      // 刷新token
      this.refreshToken();
      
      // 尝试验证token是否仍然有效
      axios.get('/api/chat/users')
        .then(response => {
          console.log('Token有效，刷新成功');
          this.$message.success('已成功刷新登录状态');
          this.loginRequired = false;
          
          // 重新加载会话列表和用户列表
          this.fetchConversations();
          this.fetchUsers();
          
          // 重新连接WebSocket
          this.connectWebSocket();
        })
        .catch(error => {
          console.error('Token已失效，无法刷新', error);
          this.$message.error('登录已过期，请重新登录');
        });
    },
    
    // 刷新Token，尝试通过重新设置cookie来解决问题
    refreshToken() {
      const token = this.getCookie('satoken');
      if (!token) {
        this.$message.error('未检测到登录令牌，无法刷新');
        return;
      }
      
      console.log('尝试刷新token:', token);
      
      // 先清除所有可能的token cookie
      this.deleteCookie('satoken');
      this.deleteCookie('token');
      this.deleteCookie('auth_token');
      
      // 重新设置cookie，使用多种名称
      this.setCookie('satoken', token, 1); // 1天过期
      this.setCookie('token', token, 1);
      this.setCookie('auth_token', token, 1);
      
      // 设置localStorage备份
      localStorage.setItem('satoken', token);
      
      console.log('Token已刷新，当前cookie状态:');
      console.log('satoken =', this.getCookie('satoken'));
      console.log('token =', this.getCookie('token'));
      console.log('auth_token =', this.getCookie('auth_token'));
      
      // 尝试验证token是否有效
      axios.get('/api/chat/users', {
        headers: { 'satoken': token },
        params: { token: token }
      }).then(() => {
        console.log('Token验证成功');
      }).catch(err => {
        console.error('Token验证失败', err);
      });
    },
    
    // 删除cookie
    deleteCookie(name) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log(`删除cookie: ${name}`);
    },
    
    // 设置cookie
    setCookie(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/';
      console.log(`设置cookie: ${name}=${value}`);
    }
    }
  };
  </script>
  
<style scoped>
.chat-container {
    display: flex;
  height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

/* 会话列表样式 */
.conversation-list {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
}

.list-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
    display: flex;
  justify-content: space-between;
    align-items: center;
  }
  
.list-header h2 {
    margin: 0;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.conversation-items {
    flex: 1;
    overflow-y: auto;
  }
  
.conversation-item {
    display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.conversation-item:hover {
  background-color: #f9f9f9;
}

.conversation-item.active {
  background-color: #e6f7ff;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  background-color: #1890ff;
  color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  font-size: 18px;
  margin-right: 12px;
}

.info {
  flex: 1;
  overflow: hidden;
}

.title {
  font-weight: bold;
  margin-bottom: 4px;
}

.last-message {
  color: #888;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
    background-color: #ff4d4f;
    color: white;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  padding: 0 6px;
}

/* 聊天区域样式 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-header {
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
    max-width: 70%;
}

.message-item.self {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  margin: 0 10px;
}

.message-item.self .message-avatar {
  background-color: #52c41a;
}

.message-content {
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-item.self .message-content {
  background-color: #dcf8c6;
}

.sender-name {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.message-item.self .sender-name {
  text-align: right;
}

.message-text {
  word-break: break-word;
  }
  
  .message-time {
  font-size: 11px;
  color: #aaa;
    margin-top: 4px;
    text-align: right;
  }
  
.input-area {
  padding: 15px;
    background-color: #fff;
  border-top: 1px solid #e0e0e0;
    display: flex;
  align-items: flex-end;
  }
  
.input-area .el-input {
    flex: 1;
  margin-right: 10px;
}

.no-conversation {
  flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  color: #999;
}

/* 参与者列表样式 */
.participant-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.participant-list li {
    display: flex;
    align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.participant-avatar {
  width: 32px;
  height: 32px;
    border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.participant-name {
  font-size: 14px;
}

/* 添加未登录提示样式 */
.login-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 20px;
  text-align: center;
  background-color: #f9f9f9;
}

.login-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-actions p {
  margin-bottom: 15px;
  color: #666;
}

.login-button {
  margin: 5px;
  min-width: 120px;
}

.token-info {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}
</style> 