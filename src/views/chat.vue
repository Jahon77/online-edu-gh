<template>
  <div class="new-chat-container">
    <!-- Login Required Message -->
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
      </div>
    </div>

    <!-- Main Chat UI -->
    <template v-else>
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="user-profile">
            <div class="avatar">{{ currentUser ? currentUser.name.substring(0, 1) : 'U' }}</div>
            <div class="user-info">
              <span class="username">{{ currentUser ? currentUser.name : '未登录' }}</span>
            </div>
          </div>
          <div class="actions">
            <el-dropdown @command="handleCommand" trigger="click">
                <el-button type="primary">
                    新建<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="addFriend">添加好友</el-dropdown-item>
                        <el-dropdown-item command="createGroup">创建群聊</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
          </div>
        </div>
        <el-tabs v-model="activeTab" class="sidebar-tabs" stretch>
          <el-tab-pane label="好友" name="friends">
            <div class="friend-list">
              <div v-for="friend in friends" :key="friend.id" class="friend-item" @click="startPrivateChatWithFriend(friend)">
                <div class="avatar">{{ friend.name.substring(0, 1) }}</div>
                <div class="info">{{ friend.name }}</div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="群聊" name="groups">
            <div class="conversation-list">
              <div v-for="conv in groupChats" :key="conv.conversation.id"
                   class="conversation-item"
                   :class="{ active: currentConversation && currentConversation.conversation.id === conv.conversation.id }"
                   @click="selectConversation(conv)">
                <div class="avatar">{{ conv.title.substring(0, 1) }}</div>
                <div class="info">
                  <div class="title">{{ conv.title }}</div>
                  <div class="last-message" v-if="conv.lastMessage">{{ conv.lastMessage.content }}</div>
                </div>
                <div class="badge" v-if="conv.unreadCount > 0">{{ conv.unreadCount }}</div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="通知" name="requests">
            <div class="friend-request-list">
               <div v-for="req in friendRequests" :key="req.id" class="friend-request-item">
                <div class="avatar">
                  {{ (req.senderId === currentUser.id ? req.receiver.name : req.sender.name).substring(0, 1) }}
                </div>
                <div class="info">
                  <p v-if="req.senderId === currentUser.id">
                    您向 <strong>{{ req.receiver.name }}</strong> 发送了好友请求
                  </p>
                  <p v-else>
                    <strong>{{ req.sender.name }}</strong> 想添加你为好友
                  </p>
                  <span class="request-time">{{ formatRequestTime(req.createdAt) }}</span>
                </div>
                <div class="actions">
                  <template v-if="req.status === 'PENDING' && req.receiverId === currentUser.id">
                    <el-button size="mini" type="primary" @click="acceptFriendRequest(req.id)">同意</el-button>
                    <el-button size="mini" type="danger" @click="rejectFriendRequest(req.id)">拒绝</el-button>
                  </template>
                  <span v-else class="status-text">
                    {{ getStatusText(req.status) }}
                  </span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
  
      <div class="chat-area">
        <template v-if="currentConversation">
          <div class="chat-header">
            <h3>{{ currentConversation.title }}</h3>
            <div class="participants" v-if="currentConversation.conversation.type === 'GROUP'">
                <el-button size="small" @click="showGroupMembersDialog = true">查看成员</el-button>
            </div>
          </div>
          <div class="message-list" ref="messageList">
            <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="{'self': msg.senderId === currentUser.id}">
               <div class="message-avatar">{{ msg.senderName.substring(0, 1) }}</div>
                <div class="message-content">
                  <div class="sender-name">{{ msg.senderName }}</div>
                  <div class="message-text">{{ msg.content }}</div>
                  <div class="message-time">{{ formatMessageTime(msg.createdAt) }}</div>
                </div>
            </div>
          </div>
          <div class="input-area">
            <template v-if="isUserAllowedToSendMessage">
              <el-input type="textarea" :rows="3" placeholder="输入消息..." v-model="messageInput" @keyup.enter.native="sendMessage"></el-input>
              <el-button type="primary" @click="sendMessage">发送</el-button>
            </template>
            <template v-else>
              <div class="muted-message">{{ getMuteMessage() }}</div>
            </template>
          </div>
        </template>
        <div v-else class="no-conversation">
          <p>选择一个会话开始聊天</p>
        </div>
      </div>
  
      <!-- 添加好友对话框 -->
      <el-dialog title="添加好友" v-model="addFriendDialogVisible" width="30%">
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="按姓名或用户名搜索"
            @input="handleSearchInput"
            @blur="hideSuggestionsDelayed"
            @focus="handleSearchInput(searchKeyword)"
          />
          <div v-if="showSuggestions" class="suggestions-panel">
            <div v-if="isLoading" class="suggestions-loading">
              <el-icon class="is-loading"><loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else-if="suggestions.length > 0">
              <div
                v-for="user in suggestions"
                :key="user.id"
                class="suggestion-item"
                @mousedown="handleSelectSuggestion(user)"
              >
                <span>{{ user.name }} ({{ user.username }})</span>
              </div>
            </div>
            <div v-else class="suggestions-empty">
              <span>无匹配用户</span>
            </div>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="closeAddFriendDialog">取消</el-button>
            <el-button type="primary" @click="sendFriendRequestFromDialog" :disabled="!selectedUser">确认</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 创建群聊对话框 -->
       <el-dialog title="创建群聊" v-model="createGroupDialogVisible" width="30%">
        <el-form>
          <el-form-item label="群名称">
            <el-input v-model="groupName" placeholder="请输入群名称"></el-input>
          </el-form-item>
          <el-form-item label="群成员">
            <el-select v-model="selectedUserIds" multiple filterable placeholder="选择群成员">
               <el-option v-for="friend in friends" :key="friend.id" :label="friend.name" :value="friend.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="createGroupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createGroupChat">创建</el-button>
        </template>
      </el-dialog>
      
      <!-- 群成员对话框 -->
      <el-dialog title="群成员" v-model="showGroupMembersDialog" width="40%">
          <div v-if="currentGroupMembers.length > 0">
              <div v-for="member in currentGroupMembers" :key="member.user.id" class="group-member-item">
                  <div class="member-info">
                      <span class="member-name">{{member.user.name}}</span>
                      <el-tag size="mini" v-if="member.role === 'owner'">群主</el-tag>
                      <el-tag size="mini" type="success" v-if="member.role === 'admin'">管理员</el-tag>
                      <el-tag size="mini" type="info" v-if="member.muted">已禁言</el-tag>
                  </div>
                  <div class="member-actions" v-if="currentUserIsOwnerOrAdmin && member.user.id !== currentUser.id">
                      <el-dropdown>
                          <el-button size="mini">操作</el-button>
                          <template #dropdown>
                          <el-dropdown-menu>
                              <el-dropdown-item v-if="!areFriends(member.user.id)" @click="sendFriendRequest(member.user.id)">添加好友</el-dropdown-item>
                              <el-dropdown-item v-if="currentUserIsOwner && member.role !== 'admin'" @click="setGroupAdmin(member.user.id)">设为管理员</el-dropdown-item>
                              <el-dropdown-item v-if="currentUserIsOwner && member.role === 'admin'" @click="removeGroupAdmin(member.user.id)">取消管理员</el-dropdown-item>
                              <el-dropdown-item v-if="!member.muted" @click="muteMember(member.user.id)">禁言</el-dropdown-item>
                              <el-dropdown-item v-if="member.muted" @click="unmuteMember(member.user.id)">取消禁言</el-dropdown-item>
                          </el-dropdown-menu>
                          </template>
                      </el-dropdown>
                  </div>
              </div>
               <div v-if="currentUserIsOwnerOrAdmin" class="group-management-actions">
                  <el-button type="danger" size="small" @click="toggleGroupMute" :loading="isTogglingGroupMute">
                      {{ isGroupMuted ? '取消全员禁言' : '全员禁言' }}
                  </el-button>
              </div>
          </div>
          <div v-else>
              <p>无法加载群成员信息。</p>
          </div>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import axios from '@/utils/http.js';
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'Chat',
  data() {
    return {
      currentUser: null,
      socket: null,
      activeTab: 'friends',
      loginRequired: true,
      
      // 会话
      conversations: [],
      currentConversation: null,
      messages: [],
      messageInput: '',

      // 好友
      friends: [],
      addFriendDialogVisible: false,
      searchKeyword: '',
      selectedUser: null,
      suggestions: [],
      isLoading: false,
      showSuggestions: false,
      
      // 好友申请
      friendRequests: [],

      // 群组
      createGroupDialogVisible: false,
      groupName: '',
      selectedUserIds: [],
      showGroupMembersDialog: false,
      currentGroupMembers: [],
      isGroupMuted: false,
      isTogglingGroupMute: false,
      reconnectCount: 0,
      reconnectTimer: null,
      isCurrentUserMuted: false,
    };
  },
  computed: {
    groupChats() {
        return this.conversations.filter(c => c.conversation.type === 'GROUP');
    },
    currentUserIsOwnerOrAdmin() {
        if (!this.currentConversation || this.currentConversation.conversation.type !== 'GROUP' || !this.currentUser) return false;
        const self = this.currentGroupMembers.find(m => m.user.id === this.currentUser.id);
        return self && (self.role === 'owner' || self.role === 'admin');
    },
    currentUserIsOwner() {
        if (!this.currentConversation || this.currentConversation.conversation.type !== 'GROUP' || !this.currentUser) return false;
        const self = this.currentGroupMembers.find(m => m.user.id === this.currentUser.id);
        return self && self.role === 'owner';
    },
    isUserAllowedToSendMessage() {
        if (!this.currentConversation || !this.currentUser) return true;
        
        // 如果不是群聊，允许发消息
        if (this.currentConversation.conversation.type !== 'GROUP') return true;
        
        // 如果是群主，始终允许发消息
        if (this.currentUserIsOwner) return true;
        
        // 如果是全员禁言，非群主不能发消息
        if (this.isGroupMuted) return false;
        
        // 如果被单独禁言，不能发消息
        return !this.isCurrentUserMuted;
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  },
  methods: {
    // 初始化
    initialize() {
      let token = this.getCookie('satoken');
      if (!token) {
        token = localStorage.getItem('satoken');
        if (token) {
          this.setCookie('satoken', token, 1);
        }
      }
      
      const username = this.getCookie('username');
      const userId = this.getCookie('userid');
      
      if (userId && username && token) {
        this.loginRequired = false;
        this.currentUser = {
            id: parseInt(userId),
            name: this.getCookie('name') || username,
            username: username
        };
        this.connectWebSocket();
        this.fetchConversations();
        this.fetchFriends();
        this.fetchFriendRequests();
      } else {
        this.loginRequired = true;
      }
    },
    goToLogin() {
        this.$router.push('/login');
    },
    setCookie(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/';
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },
    deleteCookie(name) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    },

    handleCommand(command) {
        if (command === 'addFriend') {
            this.openAddFriendDialog();
        } else if (command === 'createGroup') {
            this.openCreateGroupDialog();
        }
    },
    
    // WebSocket
    connectWebSocket() {
        const token = this.getCookie('satoken');
        if (!token) {
            this.handleTokenInvalid();
            return;
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//localhost:8080/api/ws/chat?token=${encodeURIComponent(token)}`;
        
        if (this.socket) {
            this.socket.close();
        }
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.$message.success('聊天服务连接成功');
            this.reconnectCount = 0;
        };

        this.socket.onmessage = this.handleWebSocketMessage;
        
        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed', event);
            if (event.wasClean) return;

            // Check if token is still valid before attempting to reconnect
            this.validateToken().then(valid => {
                if (valid) {
                    this.handleReconnect();
                } else {
                    this.handleTokenInvalid();
                }
            });
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error', error);
            // onclose will be called subsequently, where we handle reconnection.
        };
    },

    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'FRIEND_REQUEST') {
                this.fetchFriendRequests();
                this.$message.info('您有一条新的好友请求');
                return;
            }

            const conversation = this.conversations.find(c => c.conversation.id === message.conversationId);
            if (conversation) {
                conversation.lastMessage = message;
                if (this.currentConversation && this.currentConversation.conversation.id === message.conversationId) {
                    this.messages.push(message);
                    this.$nextTick(this.scrollToBottom);
                } else {
                    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
                }
            } else {
                this.fetchConversations();
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message', error);
        }
    },
    
    // 会话 & 消息
    fetchConversations() {
      axios.get('/api/chat/conversations').then(res => {
        if(res.data.status === 10000) this.conversations = res.data.data;
      });
    },
    selectConversation(conv) {
      this.currentConversation = conv;
      this.messages = []; // 清空上一会话的消息
      this.fetchMessages(conv.conversation.id);
      
      if (conv.conversation.type === 'GROUP' && conv.group) {
        this.currentGroupMembers = []; // 清空旧数据
        this.fetchGroupMembers(); 
      }

      if(conv.unreadCount > 0) {
          axios.post(`/api/chat/read/${conv.conversation.id}`).then(() => {
              conv.unreadCount = 0;
          });
      }
    },
    fetchMessages(id) {
      axios.get(`/api/chat/messages/${id}`).then(res => {
        if(res.data.status === 10000) {
            this.messages = res.data.data.reverse();
            this.$nextTick(this.scrollToBottom);
        }
      });
    },
    sendMessage() {
        if (!this.messageInput.trim()) return;
        if (!this.currentConversation) {
            this.$message.warning('请先选择一个会话');
            return;
        }
        
        // 检查禁言状态
        if (this.currentConversation.conversation.type === 'GROUP') {
            // 若是群组，检查禁言状态
            if (this.isCurrentUserMuted) {
                this.$message.error('您已被禁言，无法发送消息');
                return;
            }
            
            if (this.isGroupMuted && !this.currentUserIsOwner) {
                this.$message.error('当前群组已开启全员禁言');
                return;
            }
        }
        
        this.doSendMessage();
    },
    doSendMessage() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.$message.warning('聊天服务连接已断开，正在尝试重新连接...');
            this.connectWebSocket(); // Attempt to reconnect
            
            // Try sending after a short delay
            setTimeout(() => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.doSendMessage();
                } else {
                    this.$message.error('无法发送消息，请检查连接');
                }
            }, 1000);
            return;
        }
        
        const message = {
            conversationId: this.currentConversation.conversation.id,
            senderId: this.currentUser.id,
            senderName: this.currentUser.name,
            content: this.messageInput,
            type: this.currentConversation.conversation.type
        };

        this.socket.send(JSON.stringify(message));
        this.messages.push({ ...message, createdAt: new Date() });
        this.messageInput = '';
        this.$nextTick(this.scrollToBottom);
    },
     scrollToBottom() {
      if (this.$refs.messageList) {
        this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
      }
    },
    
    // 好友
    fetchFriends() {
        axios.get('/api/friend/list').then(res => {
            if(res.data.status === 10000) this.friends = res.data.data;
        });
    },
    openAddFriendDialog() {
        this.addFriendDialogVisible = true;
        this.searchKeyword = '';
        this.selectedUser = null;
        this.suggestions = [];
        this.showSuggestions = false;
        this.isLoading = false;
    },
    closeAddFriendDialog() {
        this.addFriendDialogVisible = false;
    },
    handleSearchInput(queryString) {
        clearTimeout(this.searchTimeout);
        if (queryString && queryString.trim()) {
            this.showSuggestions = true;
            this.isLoading = true;
            this.selectedUser = null; // Reset selection when input changes
            this.searchTimeout = setTimeout(() => {
                axios.get(`/api/friend/search?keyword=${queryString.trim()}`).then(res => {
                    if (res.data.status === 10000) {
                        this.suggestions = res.data.data;
                    } else {
                        this.suggestions = [];
                    }
                }).catch(() => {
                    this.suggestions = [];
                }).finally(() => {
                    this.isLoading = false;
                });
            }, 300);
        } else {
            this.showSuggestions = false;
            this.suggestions = [];
            this.isLoading = false;
        }
    },
    hideSuggestionsDelayed() {
        setTimeout(() => {
            this.showSuggestions = false;
        }, 200);
    },
    handleSelectSuggestion(user) {
        this.selectedUser = user;
        this.searchKeyword = user.name;
        this.showSuggestions = false;
    },
    sendFriendRequestFromDialog() {
        if (this.selectedUser) {
            this.sendFriendRequest(this.selectedUser.id);
            this.closeAddFriendDialog();
        }
    },
    sendFriendRequest(targetUserId) {
        axios.post('/api/friend/request', { targetUserId }).then(res => {
            if(res.data.status === 10000) {
                this.$message.success('好友申请已发送');
            } else {
                this.$message.error(res.data.message || '发送失败');
            }
        });
    },
    startPrivateChatWithFriend(friend) {
        axios.post('/api/chat/conversation/private', { targetUserId: friend.id }).then(res => {
            if (res.data.status === 10000) {
                const newConvData = res.data.data;
                const existingConvIndex = this.conversations.findIndex(
                    c => c.conversation.id === newConvData.conversation.id
                );

                if (existingConvIndex > -1) {
                    this.conversations.splice(existingConvIndex, 1, newConvData);
                } else {
                    this.conversations.push(newConvData);
                }
                
                this.selectConversation(newConvData);
            } else {
                this.$message.error(res.data.message || '开启会话失败');
            }
        });
    },

    // 好友请求
    fetchFriendRequests() {
        axios.get('/api/friend/requests/received').then(res => {
            if(res.data.status === 10000) this.friendRequests = res.data.data;
        });
    },
    acceptFriendRequest(requestId) {
        axios.post(`/api/friend/accept/${requestId}`).then(res => {
            if(res.data.status === 10000) {
                this.$message.success('已添加好友');
                this.fetchFriendRequests();
                this.fetchFriends();
            } else {
                this.$message.error(res.data.message || '操作失败');
            }
        });
    },
    rejectFriendRequest(requestId) {
        axios.post(`/api/friend/reject/${requestId}`).then(res => {
            if(res.data.status === 10000) {
                this.$message.info('已拒绝好友申请');
                this.fetchFriendRequests();
            } else {
                this.$message.error(res.data.message || '操作失败');
            }
        });
    },
    areFriends(userId) {
        return this.friends.some(f => f.id === userId);
    },
    getStatusText(status) {
        switch (status) {
            case 'PENDING': return '等待验证';
            case 'ACCEPTED': return '已同意';
            case 'REJECTED': return '已拒绝';
            default: return status;
        }
    },
    formatRequestTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return '刚刚';
      if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
      if (diffInHours < 24) return `${diffInHours}小时前`;
      if (diffInDays === 1) return '昨天';
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    // 群组
    openCreateGroupDialog() {
        this.createGroupDialogVisible = true;
        this.groupName = '';
        this.selectedUserIds = [];
    },
    createGroupChat() {
        if(!this.groupName.trim() || this.selectedUserIds.length === 0) {
            this.$message.warning("群名称和群成员不能为空");
            return;
        }
        axios.post('/api/chat/conversation/group', {
            groupName: this.groupName,
            memberIds: this.selectedUserIds,
        }).then(res => {
            if(res.data.status === 10000) {
                this.$message.success('群聊创建成功');
                this.createGroupDialogVisible = false;
                this.fetchConversations();
            } else {
                this.$message.error(res.data.message || '创建失败');
            }
        });
    },
    fetchGroupMembers() {
        if(!this.currentConversation || this.currentConversation.conversation.type !== 'GROUP' || !this.currentConversation.group) return;
        const groupId = this.currentConversation.group.id;
        axios.get(`/api/group/${groupId}/members`).then(res => {
            if(res.data.status === 10000) this.currentGroupMembers = res.data.data;
        });
        axios.get(`/api/group/${groupId}/muteall/check`).then(res => {
            if(res.data.status === 10000) this.isGroupMuted = res.data.data;
        });
        
        // 检查当前用户是否被禁言
        if (this.currentUser) {
            axios.get(`/api/group/${groupId}/mute/check/${this.currentUser.id}`).then(res => {
                if(res.data.status === 10000) this.isCurrentUserMuted = res.data.data;
            });
        }
    },
    setGroupAdmin(userId) {
        const groupId = this.currentConversation.group.id;
        axios.post(`/api/group/${groupId}/admin/${userId}`).then(res => {
            if (res.data.status === 10000) {
                this.$message.success("设置管理员成功");
                this.fetchGroupMembers();
            } else {
                this.$message.error(res.data.message || '操作失败');
            }
        });
    },
    removeGroupAdmin(userId) {
        const groupId = this.currentConversation.group.id;
        axios.delete(`/api/group/${groupId}/admin/${userId}`).then(res => {
            if (res.data.status === 10000) {
                this.$message.success("取消管理员成功");
                this.fetchGroupMembers();
            } else {
                this.$message.error(res.data.message || '操作失败');
            }
        });
    },
    muteMember(userId) {
        const groupId = this.currentConversation.group.id;
        axios.post(`/api/group/${groupId}/mute/${userId}`).then(res => {
            if (res.data.status === 10000) {
                this.$message.success("禁言成功");
                this.fetchGroupMembers();
            } else {
                this.$message.error(res.data.message || '操作失败');
            }
        });
    },
    unmuteMember(userId) {
        const groupId = this.currentConversation.group.id;
        axios.delete(`/api/group/${groupId}/mute/${userId}`).then(res => {
            if (res.data.status === 10000) {
                this.$message.success("取消禁言成功");
                this.fetchGroupMembers();
            } else {
                this.$message.error(res.data.message || '操作失败');
            }
        });
    },
    toggleGroupMute() {
        this.isTogglingGroupMute = true;
        const groupId = this.currentConversation.group.id;
        const action = this.isGroupMuted ? axios.delete(`/api/group/${groupId}/muteall`) : axios.post(`/api/group/${groupId}/muteall`);

        action.then(res => {
            if (res.data.status === 10000) {
                this.$message.success("操作成功");
                this.isGroupMuted = !this.isGroupMuted;
            } else {
                 this.$message.error(res.data.message || '操作失败');
            }
        }).finally(() => {
            this.isTogglingGroupMute = false;
        });
    },
    handleReconnect() {
        if (this.reconnectTimer || this.reconnectCount >= 5) return;

        const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectCount++;
            this.reconnectTimer = null;
            this.connectWebSocket();
        }, delay);
    },
    validateToken() {
        return new Promise((resolve) => {
            const token = this.getCookie('satoken');
            if (!token) {
                resolve(false);
                return;
            }
            axios.get('/api/chat/conversations')
                .then(response => resolve(response.data && response.data.status === 10000))
                .catch(() => resolve(false));
        });
    },
    handleTokenInvalid() {
        this.loginRequired = true;
        this.deleteCookie('satoken');
        this.deleteCookie('username');
        this.deleteCookie('userid');
        this.deleteCookie('name');
        localStorage.removeItem('satoken');
        localStorage.removeItem('userInfo');

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.$message.error('登录已过期，请重新登录');
    },
    // 新增方法: 获取禁言消息
    getMuteMessage() {
        if (this.isGroupMuted) return "全员禁言中";
        if (this.isCurrentUserMuted) return "你已被禁言";
        return "不能发送消息";
    },
    formatMessageTime(timeString) {
      if (!timeString) return '';
      
      const date = new Date(timeString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 格式化时间部分
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeFormat = `${hours}:${minutes}`;
      
      // 判断是今天、昨天还是更早的日期
      if (date >= today) {
        return timeFormat; // 今天只显示时间
      } else if (date >= yesterday) {
        return `昨天 ${timeFormat}`; // 昨天显示"昨天"和时间
      } else {
        // 更早的日期显示完整日期和时间
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}-${day} ${timeFormat}`;
      }
    },
  },
  created() {
    this.searchTimeout = null;
    this.initialize();
  }
};
</script>

<style scoped>
/* 配色 */
:root {
  --primary-color: #F98C53;
  --bg-color-light: #F9F2EF;
  --accent-color-light: #FCCEB4;
  --secondary-color: #D2E0AA;
  --accent-color-blue: #ABD7FB;
  --text-color: #333;
  --bg-color-white: #FFFFFF;
}

.new-chat-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color-light);
  color: var(--text-color);
}

.sidebar {
  width: 300px;
  background-color: var(--bg-color-white);
  border-right: 1px solid var(--accent-color-light);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--accent-color-light);
}

.user-profile {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  margin-right: 12px;
}

.username {
  font-weight: bold;
}

.add-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 5px 0;
  z-index: 10;
}

.add-menu div {
  padding: 8px 15px;
  cursor: pointer;
}
.add-menu div:hover {
  background-color: #f5f5f5;
}


.sidebar-tabs {
  flex: 1;
}

.conversation-list, .friend-list, .friend-request-list {
  overflow-y: auto;
  height: calc(100vh - 120px);
}

.conversation-item, .friend-item, .friend-request-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}
.conversation-item:hover, .friend-item:hover {
  background-color: var(--bg-color-light);
}
.conversation-item.active {
  background-color: var(--accent-color-light);
}


.info {
  flex: 1;
  overflow: hidden;
}

.title {
  font-weight: bold;
}
.last-message {
  color: #888;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge {
    background-color: var(--primary-color);
    color: white;
    border-radius: 10px;
    padding: 0 6px;
    font-size: 12px;
}
.friend-request-item .actions {
    margin-left: auto;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F9F2EF; /* 使用淡色背景 */
}
.chat-header {
    padding: 15px;
    background-color: white;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.message-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}
.message-item {
    display: flex;
    margin-bottom: 20px;
}
.message-item.self {
    flex-direction: row-reverse;
}
.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--secondary-color);
    color: white;
    text-align: center;
    line-height: 36px;
    margin: 0 10px;
}
.message-item.self .message-avatar {
    background-color: var(--primary-color);
}
.message-content {
    background-color: white;
    padding: 10px 15px;
    border-radius: 10px;
    max-width: 60%;
}
.message-item.self .message-content {
    background-color: #D2E0AA; /* 自己的消息用不同颜色 */
}
.sender-name {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
}
.input-area {
    padding: 15px;
    background-color: white;
    border-top: 1px solid #e0e0e0;
    display: flex;
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
.group-member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
}
.group-management-actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    text-align: right;
}

/* 登录提示样式 */
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

.search-container {
  position: relative;
}

.suggestions-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  margin-top: 5px;
  z-index: 2000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestions-loading, .suggestions-empty {
  padding: 10px 12px;
  color: #999;
  display: flex;
  align-items: center;
}
.suggestions-loading .el-icon {
    margin-right: 5px;
}

.request-time {
  font-size: 12px;
  color: #999;
}

.status-text {
  font-size: 14px;
  color: #909399;
}

.muted-message {
    background-color: #f5f5f5;
    color: #999;
    padding: 15px;
    text-align: center;
    width: 100%;
    border-radius: 4px;
    font-style: italic;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}
</style> 