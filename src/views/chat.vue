<template>
  <TeacherHeader v-if="currentUser && currentUser.role === 2" />
  <SiteHeader v-else />
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
            <div class="avatar">{{ currentUser?.name?.substring(0, 1) || 'U' }}</div>
            <div class="user-info">
              <div class="username-container">
                <span class="username">{{ currentUser?.name || '未登录' }}</span>
                <span v-if="currentUser?.role === 2" class="role-tag">【老师】</span>
              </div>
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
        <el-tabs v-model="activeTab" class="sidebar-tabs" stretch @tab-click="handleTabClick">
          <el-tab-pane label="好友" name="friends">
            <div class="friend-list">
              <div v-for="friend in friends" :key="friend.id" class="friend-item">
                <div class="avatar" @click="startPrivateChatWithFriend(friend)">{{ friend?.name?.substring(0, 1) || 'U' }}</div>
                <div class="info" @click="startPrivateChatWithFriend(friend)">
                  <div class="title-time-wrapper">
                    <div class="title">
                      {{ friend?.name || '未知用户' }}
                      <span v-if="friend?.role === 2" class="role-tag">【老师】</span>
                    </div>
                    <div class="last-message-time" v-if="getFriendLastMessage(friend.id)">
                      {{ formatMessageTime(getFriendLastMessage(friend.id).createdAt) }}
                    </div>
                  </div>
                  <div class="last-message" v-if="getFriendLastMessage(friend.id)">
                    <span v-if="getFriendLastMessage(friend.id).messageType === 'AUDIO'">【语音信息】</span>
                    <span v-else>{{ getFriendLastMessage(friend.id).content }}</span>
                  </div>
                </div>
                <div class="unread-badge" v-if="getFriendUnreadCount(friend.id) > 0">
                  {{ getFriendUnreadCount(friend.id) }}
                </div>
                <el-dropdown trigger="click">
                  <span class="el-dropdown-link" style="cursor: pointer; padding: 5px; display: inline-flex; align-items: center;">
                    <el-icon><More />...</el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="confirmDeleteFriend(friend)" class="danger-option">删除好友</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="群聊" name="groups">
            <div class="conversation-list">
              <div v-for="conv in groupChats" :key="conv.conversation.id"
                   class="conversation-item"
                   :class="{ active: currentConversation && currentConversation.conversation.id === conv.conversation.id }">
                <div class="avatar" @click="selectConversation(conv)">{{ (conv?.title || 'G').substring(0, 1) }}</div>
                <div class="info" @click="selectConversation(conv)">
                  <div class="title-time-wrapper">
                    <div class="title">{{ conv?.title || '未知群聊' }}</div>
                    <div class="last-message-time" v-if="conv.lastMessage">
                      {{ formatMessageTime(conv.lastMessage.createdAt) }}
                    </div>
                  </div>
                  <div class="last-message" v-if="conv.lastMessage">
                    {{ conv.lastMessage?.senderName || '未知用户' }}: 
                    <span v-if="conv.lastMessage.messageType === 'AUDIO'">【语音信息】</span>
                    <span v-else>{{ conv.lastMessage.content }}</span>
                  </div>
                </div>
                <div class="actions">
                  <div class="badge" v-if="conv.unreadCount > 0">{{ conv.unreadCount }}</div>
                  <el-dropdown trigger="click">
                    <span class="el-dropdown-link" style="cursor: pointer; padding: 5px; display: inline-flex; align-items: center;">
                      <el-icon><More />...</el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="viewGroupMembers(conv)">查看成员</el-dropdown-item>
                        <el-dropdown-item v-if="isGroupOwner(conv)" @click="confirmDisbandGroup(conv)" class="danger-option">解散群聊</el-dropdown-item>
                        <el-dropdown-item v-else @click="confirmExitGroupFromList(conv)">退出群聊</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="临时会话" name="temporary">
            <div class="conversation-list">
              <div v-for="conv in temporaryChats" :key="conv.conversation.id"
                   class="conversation-item"
                   :class="{ active: currentConversation && currentConversation.conversation.id === conv.conversation.id }">
                <div class="avatar" @click="selectConversation(conv)">{{ (conv.targetUser?.name || 'T').substring(0, 1) }}</div>
                <div class="info" @click="selectConversation(conv)">
                  <div class="title-time-wrapper">
                    <div class="title">
                      {{ conv.targetUser?.name || '未知用户' }}
                      <span v-if="conv.targetUser?.role === 2" class="role-tag">【老师】</span>
                    </div>
                    <div class="last-message-time" v-if="conv.lastMessage">
                      {{ formatMessageTime(conv.lastMessage.createdAt) }}
                    </div>
                  </div>
                  <div class="last-message" v-if="conv.lastMessage">
                    <span v-if="conv.lastMessage.messageType === 'AUDIO'">【语音信息】</span>
                    <span v-else>{{ conv.lastMessage.content }}</span>
                  </div>
                </div>
                <div class="actions">
                  <div class="badge" v-if="conv.unreadCount > 0">{{ conv.unreadCount }}</div>
                  <el-button
                    type="danger"
                    size="small"
                    circle
                    class="delete-btn"
                    @click.stop="confirmDeleteTemporaryChat(conv)"
                    title="删除会话"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="notifications">
            <template #label>
              <div class="tab-label-with-badge">
                <span>通知</span>
                <!-- <span v-if="unreadNotificationsCount > 0" class="tab-badge">{{ unreadNotificationsCount }}</span> -->
              </div>
            </template>
            <div class="notification-list">
              <!-- 所有通知按时间排序显示 -->
              <div v-for="notif in systemNotifications" :key="notif.id" class="notification-item">
                <!-- 好友申请通知 -->
                <template v-if="notif.type === 'FRIEND_REQUEST'">
                  <div class="avatar">
                    {{ (notif.targetName || 'U').substring(0, 1) }}
                  </div>
                  <div class="info">
                    <p><strong>{{ notif.targetName }}</strong> 想添加您为好友</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="actions">
                    <el-button size="mini" type="primary" @click="acceptFriendRequestFromNotification(notif)">同意</el-button>
                    <el-button size="mini" type="danger" @click="rejectFriendRequestFromNotification(notif)">拒绝</el-button>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 发送的好友申请 -->
                <template v-else-if="notif.type === 'FRIEND_REQUEST_SENT'">
                  <div class="avatar">
                    {{ (notif.targetName || 'U').substring(0, 1) }}
                  </div>
                  <div class="info">
                    <p>您向 <strong>{{ notif.targetName }}</strong> 发送了好友请求</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="status-text">等待验证</div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 好友申请已接受 -->
                <template v-else-if="notif.type === 'FRIEND_REQUEST_ACCEPTED'">
                  <div class="avatar system-avatar success">
                    <i class="el-icon-check"></i>
                  </div>
                  <div class="info">
                    <p><strong>{{ notif.targetName }}</strong> 已接受您的好友请求</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="status-text">已同意</div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 好友申请已拒绝 -->
                <template v-else-if="notif.type === 'FRIEND_REQUEST_REJECTED'">
                  <div class="avatar system-avatar warning">
                    <i class="el-icon-close"></i>
                  </div>
                  <div class="info">
                    <p><strong>{{ notif.targetName }}</strong> 已拒绝您的好友请求</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 我接受的好友申请 -->
                <template v-else-if="notif.type === 'FRIEND_REQUEST_ACCEPTED_BY_ME'">
                  <div class="avatar system-avatar success">
                    <i class="el-icon-check"></i>
                  </div>
                  <div class="info">
                    <p>您已接受 <strong>{{ notif.targetName }}</strong> 的好友请求</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="status-text">已同意</div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 我拒绝的好友申请 -->
                <template v-else-if="notif.type === 'FRIEND_REQUEST_REJECTED_BY_ME'">
                  <div class="avatar system-avatar warning">
                    <i class="el-icon-close"></i>
                  </div>
                  <div class="info">
                    <p>您已拒绝 <strong>{{ notif.targetName }}</strong> 的好友请求</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="status-text">已拒绝</div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 好友删除通知 -->
                <template v-else-if="notif.type === 'FRIEND_DELETE'">
                  <div class="avatar system-avatar warning">
                    <i class="el-icon-delete"></i>
                  </div>
                  <div class="info">
                    <p><strong>{{ notif.targetName }}</strong> 已将您从好友列表中移除</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 我删除的好友通知 -->
                <template v-else-if="notif.type === 'FRIEND_DELETE_BY_ME'">
                  <div class="avatar system-avatar warning">
                    <i class="el-icon-delete"></i>
                  </div>
                  <div class="info">
                    <p>您已将 <strong>{{ notif.targetName }}</strong> 从好友列表中移除</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 群聊解散通知 -->
                <template v-else-if="notif.type === 'GROUP_DISBANDED'">
                  <div class="avatar system-avatar warning">
                    <i class="el-icon-circle-close"></i>
                  </div>
                  <div class="info">
                    <p v-if="notif.isOwner">您已解散群聊 <strong>{{ notif.groupName }}</strong></p>
                    <p v-else>群聊 <strong>{{ notif.groupName }}</strong> 已被群主 <strong>{{ notif.operatorName }}</strong> 解散</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 群成员禁言通知 -->
                <template v-else-if="notif.type === 'GROUP_MUTED'">
                  <div class="avatar system-avatar warning">
                    <i class="el-icon-microphone"></i>
                  </div>
                  <div class="info">
                    <p>您在群聊 <strong>{{ notif.groupName }}</strong> 中被 <strong>{{ notif.operatorName }}</strong> 禁言</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 设置群管理员通知 -->
                <template v-else-if="notif.type === 'GROUP_ADMIN_ADDED'">
                  <div class="avatar system-avatar success">
                    <i class="el-icon-s-check"></i>
                  </div>
                  <div class="info">
                    <p>恭喜！您在群聊 <strong>{{ notif.groupName }}</strong> 中被设为管理员</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <!-- 取消群管理员通知 -->
                <template v-else-if="notif.type === 'GROUP_ADMIN_REMOVED'">
                  <div class="avatar system-avatar">
                    <i class="el-icon-s-tools"></i>
                  </div>
                  <div class="info">
                    <p>您在群聊 <strong>{{ notif.groupName }}</strong> 中被取消管理员身份</p>
                    <span class="notification-time">{{ formatRequestTime(notif.createdAt) }}</span>
                  </div>
                  <div class="unread-indicator" v-if="!notif.isRead"></div>
                </template>

                <div class="unread-indicator" v-if="!notif.isRead"></div>
              </div>

              <!-- 无通知时的提示 -->
              <div v-if="systemNotifications.length === 0" class="empty-notification">
                <i class="el-icon-bell"></i>
                <p>暂无通知</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
  
      <div class="chat-area">
        <template v-if="currentConversation">
          <div class="chat-header">
            <h3>
              {{ currentConversation.title }}
              <span v-if="currentConversation.conversation.type === 'PRIVATE' && currentConversation.targetUser?.role === 2" class="role-tag">【老师】</span>
            </h3>
            <div class="participants" v-if="currentConversation.conversation.type === 'GROUP'">
                <el-button size="small" @click="showGroupMembersDialog = true">查看成员</el-button>
                <el-button v-if="currentUserIsOwner" size="small" type="danger" @click="confirmDisbandGroup(currentConversation)">解散群聊</el-button>
                <el-button v-else size="small" type="warning" @click="confirmExitGroup">退出群聊</el-button>
            </div>
          </div>
          <div class="message-list" ref="messageList">
            <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="{'self': msg.senderId === currentUser?.id}">
               <div class="message-avatar">{{ (msg?.senderName || 'U').substring(0, 1) }}</div>
                <div class="message-content">
                  <div class="sender-name">
                    {{ msg?.senderName || '未知用户' }}
                    <span v-if="msg?.senderRole === 2" class="role-tag">【老师】</span>
                  </div>
                  
                  <!-- Audio Message -->
                  <div v-if="msg.messageType === 'AUDIO'">
                    <audio controls :src="msg.content" style="width: 250px; height: 40px;"></audio>
                  </div>
                  
                  <!-- Text Message -->
                  <div v-else class="message-text">{{ msg?.content || '' }}</div>
                  <div class="message-time">{{ formatMessageTime(msg?.createdAt) }}</div>
                </div>
            </div>
          </div>
          <div class="input-area">
            <template v-if="isUserAllowedToSendMessage">
              <div v-if="isRecording" class="recording-indicator">
                <span>正在录音中...</span>
                <el-button type="danger" @click="toggleRecording" size="small">停止</el-button>
              </div>
              <template v-else>
                <el-input type="textarea" :rows="3" placeholder="输入消息..." v-model="messageInput" @keyup.enter.native="sendMessage"></el-input>
                <el-button type="primary" @click="sendMessage">发送</el-button>
                <el-button @click="toggleRecording" circle :disabled="!currentConversation">
                  <i class="el-icon-microphone">录音</i>
                </el-button>
              </template>
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
        <el-form >
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
               <div v-if="currentUserIsOwnerOrAdmin" class="group-actions-footer">
                  <div class="group-management-actions">
                      <el-button type="primary" size="small" @click="toggleGroupMute" :loading="isTogglingGroupMute">
                          {{ isGroupMuted ? '取消全员禁言' : '全员禁言' }}
                      </el-button>
                  </div>
                  <div class="group-exit-action">
                    <el-button v-if="currentUserIsOwner" style="width:100%" type="danger" @click="confirmDisbandGroup(currentConversation)">解散群聊</el-button>
                    <el-button v-else style="width:100%" type="warning" @click="confirmExitGroup">退出群聊</el-button>
                  </div>
              </div>
          </div>
          <div v-else>
              <p>加载中...</p>
          </div>
      </el-dialog>

      <!-- 退出群聊对话框 -->
      <el-dialog title="退出群聊" v-model="exitGroupDialogVisible" width="30%">
        <p>确定要退出群聊 "{{ currentConversation ? currentConversation.title : '' }}" 吗？</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="exitGroupDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="exitGroup" :loading="isExitingGroup">确认退出</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 删除好友对话框 -->
      <el-dialog title="删除好友" v-model="deleteFriendDialogVisible" width="30%">
        <p>确定要删除好友 "{{ selectedFriend ? selectedFriend.name : '' }}" 吗？</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="deleteFriendDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="deleteFriend" :loading="isDeletingFriend">确认删除</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 解散群聊对话框 -->
      <el-dialog title="解散群聊" v-model="disbandGroupDialogVisible" width="30%">
        <p>确定要解散群聊 "{{ currentConversation ? currentConversation.title : '' }}" 吗？此操作不可逆。</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="disbandGroupDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="disbandGroup" :loading="isDisbandingGroup">确认解散</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 删除临时会话对话框 -->
      <el-dialog title="删除临时会话" v-model="deleteTemporaryChatDialogVisible" width="30%">
        <p>确定要删除与 "{{ selectedTemporaryChat?.targetUser?.name || '未知用户' }}" 的临时会话吗？删除后聊天记录将被清空。</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="deleteTemporaryChatDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="deleteTemporaryChat" :loading="isDeletingTemporaryChat">确认删除</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import axios from '@/utils/http.js';
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
      selectedFriend: null,
      deleteFriendDialogVisible: false,
      isDeletingFriend: false,
      
      // 不再需要单独的好友申请数组

      // 群组
      createGroupDialogVisible: false,
      groupName: '',
      selectedUserIds: [],
      showGroupMembersDialog: false,
      currentGroupMembers: [],
      isGroupMuted: false,
      isTogglingGroupMute: false,
      exitGroupDialogVisible: false,
      isExitingGroup: false,
      disbandGroupDialogVisible: false,
      isDisbandingGroup: false,
      reconnectCount: 0,
      reconnectTimer: null,
      isCurrentUserMuted: false,
      participantsMap: {}, // 存储会话的参与者列表
      systemNotifications: [], // 确保初始化为空数组
      unreadCount: 0,
      
      // 录音
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      recordingStartTime: 0,
      deleteTemporaryChatDialogVisible: false,
      selectedTemporaryChat: null,
      isDeletingTemporaryChat: false,
    };
  },
  computed: {
    groupChats() {
        return this.conversations.filter(c => 
          c.conversation.type === 'GROUP' && 
          c.group && 
          c.group.id && 
          c.title
        );
    },
    temporaryChats() {
      return this.conversations.filter(c => {
        if (c.conversation.type !== 'PRIVATE' || !c.targetUser) {
          return false;
        }
        // 如果没有最后一条消息，不显示该会话
        if (!c.lastMessage) {
          return false;
        }
        // If the other user is not in the friends list, it's a temporary chat
        return !this.friends.some(friend => friend.id === c.targetUser.id);
      });
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
    },
    unreadNotificationsCount() {
      return this.systemNotifications ? 
        this.systemNotifications.filter(n => !n.isRead).length : 0;
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
  watch: {
    showGroupMembersDialog(newVal) {
      if (newVal) {
        this.fetchGroupMembers();
      }
    }
  },
  methods: {
    async initialize() {
      try {
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
          // 先设置基本信息
          const role = this.getCookie('role');
          this.currentUser = {
            id: parseInt(userId),
            name: this.getCookie('name') || username,
            username: username,
            role: parseInt(role) || 1
          };
          console.log('Current user info:', this.currentUser);
          
          // 使用 Promise.all 并行加载数据
          await Promise.all([
            this.connectWebSocket(),
            this.fetchConversations(),
            this.fetchFriends(),
            this.fetchNotifications() // 添加获取通知
          ]).catch(error => {
            console.error('Failed to load initial data:', error);
          });
        } else {
          this.loginRequired = true;
        }
      } catch (error) {
        console.error('Initialization error:', error);
        this.$message.error('初始化失败，请刷新页面重试');
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
            //this.$message.success('聊天服务连接成功');
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
            
            // 处理不同类型的消息
            switch (message.type) {
                case 'FRIEND_REQUEST':
                this.fetchFriendRequests();
                this.fetchNotifications(); // 刷新通知列表
                this.$message.info('您有一条新的好友请求');
                return;
                
                case 'FRIEND_DELETE':
                    // 不再需要手动添加通知，后端已经创建了通知
                    this.fetchNotifications(); // 刷新通知列表
                    this.fetchFriends(); // 刷新好友列表
                    this.$message.info(`${message.targetName} 已将您从好友列表中移除`);
                    return;
                    
                case 'GROUP_DISBANDED':
                    if (message.groupName) {
                        // 不再需要手动添加通知，后端已经创建了通知
                        // 刷新通知列表
                        this.fetchNotifications();
                        
                        // 从会话列表中移除该群聊
                        if (message.groupId) {
                            this.conversations = this.conversations.filter(c => 
                                !(c.conversation.type === 'GROUP' && c.group && c.group.id === message.groupId)
                            );
                            
                            // 如果当前正在查看该群聊，清空当前会话
                            if (this.currentConversation && 
                                this.currentConversation.conversation.type === 'GROUP' && 
                                this.currentConversation.group && 
                                this.currentConversation.group.id === message.groupId) {
                                this.currentConversation = null;
                                this.messages = [];
                            }
                        }
                        
                        // 根据是否是群主显示不同的消息提示
                        if (message.isOwner) {
                            this.$message.success(`您已解散群聊 "${message.groupName}"`);
                        } else {
                            this.$message.warning(`群聊 "${message.groupName}" 已被群主 ${message.ownerName} 解散`);
                        }
                    }
                    return;
                    
                case 'GROUP_MUTED':
                    // 不再需要手动添加通知，后端已经创建了通知
                    this.fetchNotifications(); // 刷新通知列表
                    this.$message.warning(`您在群聊 ${message.groupName} 中被 ${message.operatorName} 禁言`);
                    return;
                    
                case 'GROUP_ADMIN_ADDED':
                    // 不再需要手动添加通知，后端已经创建了通知
                    this.fetchNotifications(); // 刷新通知列表
                    this.$message.success(`恭喜！您在群聊 ${message.groupName} 中被设为管理员`);
                    return;
                    
                case 'GROUP_ADMIN_REMOVED':
                    // 不再需要手动添加通知，后端已经创建了通知
                    this.fetchNotifications(); // 刷新通知列表
                    this.$message.info(`您在群聊 ${message.groupName} 中被取消管理员身份`);
                    return;
            }

            // 处理普通聊天消息
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
      const currentUserId = this.currentUser.id;
      axios.get(`/api/chat/conversations?userId=${currentUserId}`).then(res => {
        if(res.data.status === 10000) {
          // 过滤掉不完整的会话数据
          this.conversations = res.data.data.filter(conv => {
            // 检查基本会话数据是否完整
            if (!conv.conversation || !conv.conversation.id || !conv.conversation.type) {
              console.warn('Incomplete conversation data:', conv);
              return false;
            }
            
            // 对于群聊，检查群组数据是否完整
            if (conv.conversation.type === 'GROUP') {
              if (!conv.group || !conv.group.id || !conv.title) {
                console.warn('Incomplete group data:', conv);
                return false;
              }
            }
            
            return true;
          });

          // 获取每个私聊会话的参与者
          this.conversations.forEach(conv => {
            if (conv.conversation.type === 'PRIVATE') {
              axios.get(`/api/chat/participants/${conv.conversation.id}`).then(participants => {
                if (participants.data.status === 10000) {
                  this.participantsMap[conv.conversation.id] = participants.data.data;
                }
              });
            }
          });
        } else {
          //this.$message.error(res.data.message || '获取会话列表失败');
        }
      }).catch(error => {
        console.error('Failed to fetch conversations:', error);
        this.$message.error('获取会话列表失败，请检查网络连接');
      });
    },
    selectConversation(conv) {
      this.currentConversation = conv;
      this.fetchMessages(conv.conversation.id);
      
      // 如果有未读消息，标记为已读
      if(conv.unreadCount > 0) {
          const currentUserId = this.currentUser.id;
          axios.post(`/api/chat/read/${conv.conversation.id}?userId=${currentUserId}`).then(res => {
              // 立即更新本地未读消息数
              conv.unreadCount = 0;
              // 强制更新视图
              this.$forceUpdate();
          }).catch(err => {
              if (err.message === 'SUCCESS') {
                  // 立即更新本地未读消息数
                  conv.unreadCount = 0;
                  // 强制更新视图
                  this.$forceUpdate();
              } else {
                  console.error('标记已读请求失败:', err);
              }
          });
      }
    },
    fetchMessages(id) {
      const currentUserId = this.currentUser.id;
      axios.get(`/api/chat/messages/${id}?userId=${currentUserId}`).then(res => {
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
    sendAudioMessage(audioUrl, duration) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.$message.error('无法发送消息，请检查连接');
            return;
        }

        const message = {
            conversationId: this.currentConversation.conversation.id,
            senderId: this.currentUser.id,
            senderName: this.currentUser.name,
            content: audioUrl,
            messageType: 'AUDIO', // 消息类型
            type: this.currentConversation.conversation.type, // 会话类型
            duration: duration
        };

        this.socket.send(JSON.stringify(message));
        this.messages.push({ ...message, createdAt: new Date() });
        this.$nextTick(this.scrollToBottom);
    },
     scrollToBottom() {
      if (this.$refs.messageList) {
        this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
      }
    },
    
    fetchFriends() {
    const currentUserId = this.currentUser.id; // 从当前用户对象获取ID
    axios.get(`/api/friend/list?userId=${currentUserId}`) // 显式传参
        .then(res => {
            if (res.data.status === 10000) {
                this.friends = res.data.data;
                console.log('Friends list with roles:', this.friends);
            }
        })
        .catch(error => {
            console.error("获取好友列表失败:", error);
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
        const currentUserId = this.currentUser.id;
        axios.post(`/api/friend/request?userId=${currentUserId}`, { targetUserId }).then(res => {
            if(res.data.status === 10000) {
                this.$message.success('好友申请已发送');
            } else {
                this.$message.error(res.data.message || '发送失败');
            }
        });
    },
    startPrivateChatWithFriend(friend) {
        const currentUserId = this.currentUser.id;
        axios.post(`/api/chat/conversation/private?userId=${currentUserId}`, { targetUserId: friend.id }).then(res => {
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
                
                // 选择会话并标记为已读
                const conversation = existingConvIndex > -1 ? 
                    this.conversations[existingConvIndex] : newConvData;
                this.selectConversation(conversation);
            } else {
                ///this.$message.error(res.data.message || '开启会话失败');
            }
        });
    },

    // 不再需要旧的好友请求相关方法
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
        const currentUserId = this.currentUser.id;
        axios.post(`/api/chat/conversation/group?userId=${currentUserId}`, {
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
        const currentUserId = this.currentUser.id;
        axios.post(`/api/group/${groupId}/admin/${userId}?currentUserId=${currentUserId}`).then(res => {
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
        const currentUserId = this.currentUser.id;
        axios.delete(`/api/group/${groupId}/admin/${userId}?currentUserId=${currentUserId}`).then(res => {
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
        const currentUserId = this.currentUser.id;
        axios.post(`/api/group/${groupId}/mute/${userId}?currentUserId=${currentUserId}`).then(res => {
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
        const currentUserId = this.currentUser.id;
        axios.delete(`/api/group/${groupId}/mute/${userId}?currentUserId=${currentUserId}`).then(res => {
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
        const currentUserId = this.currentUser.id;
        const action = this.isGroupMuted ? axios.delete(`/api/group/${groupId}/muteall?currentUserId=${currentUserId}`) : axios.post(`/api/group/${groupId}/muteall?currentUserId=${currentUserId}`);

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
    // 获取好友最后一条消息
    getFriendLastMessage(friendId) {
      // 找到与该好友的私聊会话
      const conversation = this.conversations.find(c => {
        if (c.conversation.type !== 'PRIVATE') return false;
        
        // 检查targetUser是否为当前好友
        if (c.targetUser && c.targetUser.id === friendId) {
          return true;
        }
        
        // 遍历参与者查找好友
        const participants = this.participantsMap[c.conversation.id];
        if (participants && participants.some(p => p.id === friendId)) {
          return true;
        }
        
        return false;
      });
      
      // 检查conversation是否存在以及是否有lastMessage
      if (conversation && conversation.lastMessage) {
        return conversation.lastMessage;
      }
      
      return null;
    },
    // 删除好友相关方法
    confirmDeleteFriend(friend) {
      this.selectedFriend = friend;
      this.deleteFriendDialogVisible = true;
    },
    
    deleteFriend() {
      if (!this.selectedFriend) return;
      
      this.isDeletingFriend = true;
      const currentUserId = this.currentUser.id;
      axios.delete(`/api/friend/${this.selectedFriend.id}?userId=${currentUserId}`)
        .then(res => {
          if (res.data.status === 10000) {
            this.$message.success('好友删除成功');
            
            // 从列表移除好友
            this.friends = this.friends.filter(f => f.id !== this.selectedFriend.id);
            
            // 如果当前正在和该好友聊天，清空聊天界面
            if (this.currentConversation && 
                this.currentConversation.conversation.type === 'PRIVATE' && 
                (this.currentConversation.conversation.userId1 === this.selectedFriend.id || 
                 this.currentConversation.conversation.userId2 === this.selectedFriend.id)) {
              this.currentConversation = null;
              this.messages = [];
            }
            
            // 从会话列表中移除与该好友的对话
            this.conversations = this.conversations.filter(c => 
              !(c.conversation.type === 'PRIVATE' && 
                (c.conversation.userId1 === this.selectedFriend.id || 
                 c.conversation.userId2 === this.selectedFriend.id))
            );
            
            this.deleteFriendDialogVisible = false;
          } else {
            this.$message.error(res.data.message || '删除失败');
          }
        })
        .catch(err => {
          this.$message.error('操作失败: ' + err.message);
        })
        .finally(() => {
          this.isDeletingFriend = false;
        });
    },
    
    // 退出群聊相关方法
    confirmExitGroup() {
      this.exitGroupDialogVisible = true;
    },
    
    exitGroup() {
      if (!this.currentConversation || !this.currentConversation.group) return;
      
      this.isExitingGroup = true;
      const groupId = this.currentConversation.group.id;
      const conversationId = this.currentConversation.conversation.id;

      const currentUserId = this.currentUser.id;
      axios.post(`/api/chat/group/${groupId}/exit?userId=${currentUserId}`)
        .then(res => {
          if (res.data.status === 10000) {
            this.$message.success('已退出群聊');
            
            // 从会话列表移除此群聊
            this.conversations = this.conversations.filter(c => c.conversation.id !== conversationId);
            
            // 清空当前会话
            this.currentConversation = null;
            this.messages = [];
            
            this.exitGroupDialogVisible = false;
            this.showGroupMembersDialog = false;
          } else {
            this.$message.error(res.data.message || '退出失败');
          }
        })
        .catch(err => {
          this.$message.error('操作失败: ' + err.message);
        })
        .finally(() => {
          this.isExitingGroup = false;
        });
    },
    // 查看群成员
    viewGroupMembers(conv) {
      this.selectConversation(conv);
      this.showGroupMembersDialog = true;
      this.fetchGroupMembers(); // 添加这行来获取群成员信息
    },
    
    // 从群聊列表中退出群聊
    confirmExitGroupFromList(conv) {
      this.currentConversation = conv;
      this.confirmExitGroup();
    },
    
    // 检查当前用户是否是群主
    isGroupOwner(conv) {
      return conv.group && conv.group.ownerId === this.currentUser.id;
    },

    confirmDisbandGroup(conv) {
      this.currentConversation = conv;
      this.disbandGroupDialogVisible = true;
    },

    disbandGroup() {
      if (!this.currentConversation || !this.currentConversation.group) return;

      this.isDisbandingGroup = true;
      const groupId = this.currentConversation.group.id;
      const groupName = this.currentConversation.title;
      const currentUserId = this.currentUser.id;
      axios.delete(`/api/group/${groupId}/disband?currentUserId=${currentUserId}`)
        .then(res => {
          if (res.data.status === 10000) {
            // 添加系统通知 - 群主视角
            // this.addSystemNotification({
            //     id: Date.now(),
            //     type: 'GROUP_DISBANDED',
            //     groupName: groupName,
            //     isOwner: true, // 标记为群主
            //     createdAt: new Date()
            // });
            
            this.$message.success(`您已解散群聊 "${groupName}"`);
            this.conversations = this.conversations.filter(c => c.conversation.id !== this.currentConversation.conversation.id);
            this.currentConversation = null;
            this.messages = [];
            this.disbandGroupDialogVisible = false;
            if (this.showGroupMembersDialog) this.showGroupMembersDialog = false;
          } else {
            this.$message.error(res.data.message || '解散失败');
          }
        })
        .catch(err => {
          //this.$message.error('操作失败: ' + err.message);
        })
        .finally(() => {
          this.isDisbandingGroup = false;
          if (this.showGroupMembersDialog) this.showGroupMembersDialog = false;
        });
    },
    handleTabClick(tab) {
      // 防止递归更新
      if (tab.paneName === this.activeTab) return;
      
      this.$nextTick(() => {
        if (tab.paneName === 'notifications') {
          this.markAllNotificationsAsRead();
        }
      });
    },
    // 修改方法名，避免重复定义
    markAllNotificationsAsRead() {
      const currentUserId = this.currentUser.id;
      axios.post(`/api/notifications/read/all?userId=${currentUserId}`).then(res => {
          if (res.data.status === 10000) {
              this.fetchNotifications();
          }
      }).catch(error => {
          console.error('Failed to mark notifications as read:', error);
      });
    },
    // 标记单个通知为已读
    markNotificationAsRead(notificationId) {
      const currentUserId = this.currentUser.id;
      axios.post(`/api/notifications/read/${notificationId}?userId=${currentUserId}`).then(res => {
            if (res.data.status === 10000) {
                this.fetchNotifications();
            }
        }).catch(error => {
            console.error('Failed to mark notification as read:', error);
        });
    },
    // 添加系统通知方法
    addSystemNotification(notification) {
        // 构造通知对象
        const notificationData = {
            userId: this.currentUser.id,
            type: notification.type,
            targetName: notification.targetName,
            operatorName: notification.operatorName,
            groupId: notification.groupId,
            groupName: notification.groupName,
            isOwner: notification.isOwner,
            isRead: false,
            createdAt: new Date()
        };
        
        // 根据不同类型设置标题和内容
        switch (notification.type) {
            case 'FRIEND_DELETE':
                notificationData.title = '好友删除通知';
                notificationData.content = `${notification.targetName} 已将您从好友列表中移除`;
                break;
            case 'GROUP_DISBANDED':
                if (notification.isOwner) {
                    notificationData.title = '群聊解散通知';
                    notificationData.content = `您已解散群聊 "${notification.groupName}"`;
                } else {
                    notificationData.title = '群聊解散通知';
                    notificationData.content = `群聊 "${notification.groupName}" 已被群主 ${notification.ownerName} 解散`;
                }
                break;
            case 'GROUP_MUTED':
                notificationData.title = '群聊禁言通知';
                notificationData.content = `您在群聊 ${notification.groupName} 中被 ${notification.operatorName} 禁言`;
                break;
            case 'GROUP_ADMIN_ADDED':
                notificationData.title = '群管理员通知';
                notificationData.content = `恭喜！您在群聊 ${notification.groupName} 中被设为管理员`;
                break;
            case 'GROUP_ADMIN_REMOVED':
                notificationData.title = '群管理员通知';
                notificationData.content = `您在群聊 ${notification.groupName} 中被取消管理员身份`;
                break;
        }
        
        // 发送到后端保存
        axios.post('/api/notifications', notificationData).catch(error => {
            console.error('Failed to save notification:', error);
        });
        
        // 更新前端显示
        this.fetchNotifications();
    },
    
    // 获取通知列表
    fetchNotifications() {
        const currentUserId = this.currentUser.id; 
        axios.get(`/api/notifications/list?userId=${currentUserId}`).then(res => {
            if (res.data.status === 10000) {
                this.systemNotifications = res.data.data;
            }
        }).catch(error => {
            console.error('Failed to fetch notifications:', error);
        });
    },
    // 从通知接受好友请求
    acceptFriendRequestFromNotification(notification) {
      // 从通知中获取发送者ID
      const senderId = notification.targetId;
      if (!senderId) {
        this.$message.error('无法识别好友请求发送者');
        return;
      }
      
      const currentUserId = this.currentUser.id;
      axios.post(`/api/friend/request/accept-from-notification?userId=${currentUserId}`, { 
        senderId: senderId,
        notificationId: notification.id
      }).then(res => {
        if (res.data.status === 10000) {
          this.$message.success('已添加好友');
          this.fetchNotifications();
          this.fetchFriends();
        } else {
          this.$message.error(res.data.message || '操作失败');
        }
      }).catch(err => {
        this.$message.error('操作失败: ' + err.message);
      });
    },
    
    // 从通知拒绝好友请求
    rejectFriendRequestFromNotification(notification) {
      const senderId = notification.targetId;
      if (!senderId) {
        this.$message.error('无法识别好友请求发送者');
        return;
      }
      
      const currentUserId = this.currentUser.id;
      axios.post(`/api/friend/request/reject-from-notification?userId=${currentUserId}`, {
        senderId: senderId,
        notificationId: notification.id
      }).then(res => {
        if (res.data.status === 10000) {
          this.$message.info('已拒绝好友申请');
          this.fetchNotifications();
        } else {
          this.$message.error(res.data.message || '操作失败');
        }
      }).catch(err => {
        this.$message.error('操作失败: ' + err.message);
      });
    },
    // 获取好友未读消息数
    getFriendUnreadCount(friendId) {
      // 找到与该好友的私聊会话
      const conversation = this.conversations.find(c => {
        if (c.conversation.type !== 'PRIVATE') return false;
        
        // 检查targetUser是否为当前好友
        if (c.targetUser && c.targetUser.id === friendId) {
          return true;
        }
        
        // 遍历参与者查找好友
        const participants = this.participantsMap[c.conversation.id];
        if (participants && participants.some(p => p.id === friendId)) {
          return true;
        }
        
        return false;
      });
      
      return conversation ? conversation.unreadCount || 0 : 0;
    },
    // 语音相关方法
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },
    
    startRecording() {
      if (!this.currentConversation) {
        this.$message.warning('请先选择一个会话');
        return;
      }
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];
          
          this.mediaRecorder.ondataavailable = event => {
            this.audioChunks.push(event.data);
          };
          
          this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const duration = Math.round((Date.now() - this.recordingStartTime) / 1000);
            
            // 如果录音时间太短，则不发送
            if (duration < 1) {
              this.$message.warning('录音时间太短');
              stream.getTracks().forEach(track => track.stop());
              return;
            }

            const formData = new FormData();
            formData.append('file', audioBlob, `audio_${Date.now()}.webm`);
            formData.append('userId', this.currentUser.id);
            
            this.$message.info('正在上传语音...');

            // 创建一个没有拦截器的临时axios实例来上传文件
            const uploadInstance = axios.create();
            uploadInstance.post('/api/file/upload/audio', formData, {
              headers: { 
                'Content-Type': 'multipart/form-data',
                'satoken': this.getCookie('satoken') || ''
              }
            }).then(res => {
              if (res.data.status === 0) {
                this.$message.success('语音发送成功');
                const { fileUrl } = res.data.data;
                this.sendAudioMessage(fileUrl, duration);
              } else {
                this.$message.error(res.data.message || '语音上传失败');
              }
            }).catch(() => {
              this.$message.error('语音上传失败');
            }).finally(() => {
              // 停止录音后需要关闭媒体流
              stream.getTracks().forEach(track => track.stop());
            });
          };
          
          this.mediaRecorder.start();
          this.recordingStartTime = Date.now();
          this.isRecording = true;
        })
        .catch(() => {
          this.$message.error('无法获取麦克风权限，请检查设置');
        });
    },

    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
      this.isRecording = false;
    },

    confirmDeleteTemporaryChat(conv) {
      this.selectedTemporaryChat = conv;
      this.deleteTemporaryChatDialogVisible = true;
    },

    deleteTemporaryChat() {
      if (!this.selectedTemporaryChat) return;
      
      this.isDeletingTemporaryChat = true;
      const currentUserId = this.currentUser.id;
      axios.delete(`/api/chat/conversation/${this.selectedTemporaryChat.conversation.id}?userId=${currentUserId}`)
        .then(res => {
          if (res.data.status === 10000) {
            this.$message.success('临时会话删除成功');
            
            // 从列表移除临时会话
            this.conversations = this.conversations.filter(c => c.conversation.id !== this.selectedTemporaryChat.conversation.id);
            
            // 清空当前会话
            this.currentConversation = null;
            this.messages = [];
            
            this.deleteTemporaryChatDialogVisible = false;
            this.showGroupMembersDialog = false;
          } else {
            this.$message.error(res.data.message || '删除失败');
          }
        })
        .catch(err => {
          this.$message.error('操作失败: ' + err.message);
        })
        .finally(() => {
          this.isDeletingTemporaryChat = false;
        });
    },
  },
  created() {
    this.searchTimeout = null;
    this.initialize();
  }
};
</script>

<style scoped>
/* 主题配色 - 基于UI图像 */
:root {
  --primary-color: #F98C53;
  --secondary-color: #D2E0AA;
  --bg-color-light: #F9F2EF;
  --accent-blue: #ABD7FB;
  --accent-peach: #FCCEB4;
  --text-primary: #333;
  --text-secondary: #666;
  --text-light: #999;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  --border-radius: 12px;
  --border-color: #eee;
}

.new-chat-container {
  display: flex;
  height: calc(100vh - 66px);
  background-color: var(--bg-color-light);
  color: var(--text-primary);
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 侧边栏样式 */
.sidebar {
  width: 320px;
  background-color: #fff;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
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
  margin-right: 15px;
  box-shadow: 0 2px 5px rgba(249, 140, 83, 0.3);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 600;
  font-size: 16px;
}

.role-tag {
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-left: 4px;
}

/* 选项卡样式 */
.sidebar-tabs {
  flex: 1;
}

:deep(.sidebar-tabs .el-tabs__item) {
  font-size: 15px;
  color: var(--text-secondary);
  height: 50px;
  line-height: 50px;
}

:deep(.sidebar-tabs .el-tabs__item.is-active) {
  color: var(--primary-color);
  font-weight: 600;
}

:deep(.sidebar-tabs .el-tabs__active-bar) {
  background-color: var(--primary-color);
  height: 3px;
  border-radius: 3px;
}

:deep(.sidebar-tabs .el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--border-color);
}

/* 列表样式 */
.conversation-list, .friend-list, .friend-request-list {
  overflow-y: auto;
  height: calc(100vh - 236px);
  padding: 10px 0;
}

.conversation-item, .friend-item, .friend-request-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .delete-btn {
      opacity: 0;
      transition: opacity 0.2s ease;
      padding: 6px;
      
      &:hover {
        background-color: #f56c6c;
        color: white;
      }
    }
  }
  
  &:hover {
    .actions {
      .delete-btn {
        opacity: 1;
      }
    }
  }
}

.conversation-item.active {
  background-color: rgba(249, 140, 83, 0.1);
  border-left: 4px solid var(--primary-color);
}

.info {
  flex: 1;
  overflow: hidden;
  margin: 0 15px;
}

.title-time-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}

.last-message-time {
  font-size: 12px;
  color: var(--text-light);
}

.last-message {
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
    background-color: var(--primary-color);
    color: white;
    border-radius: 10px;
  padding: 0px 8px;
    font-size: 12px;
  height: 20px;
  line-height: 20px;
  font-weight: 600;
}

/* 聊天区域样式 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-light);
  position: relative;
}

.chat-header {
  padding: 15px 25px;
    background-color: white;
  border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  z-index: 1;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.message-list {
    flex: 1;
    overflow-y: auto;
  padding: 25px;
  display: flex;
  flex-direction: column;
}

.message-item {
    display: flex;
    margin-bottom: 20px;
  max-width: 80%;
  align-self: flex-start;
}

.message-item.self {
    flex-direction: row-reverse;
  align-self: flex-end;
}

.message-avatar {
  width: 40px;
  height: 40px;
    border-radius: 50%;
    background-color: var(--secondary-color);
    color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  margin: 0 12px;
}

.message-item.self .message-avatar {
    background-color: var(--primary-color);
}

.message-content {
    background-color: white;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: relative;
}

.message-item.self .message-content {
  background-color: var(--secondary-color);
}

.sender-name {
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.role-tag {
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 600;
}

.message-text {
  line-height: 1.5;
  font-size: 14px;
  color: var(--text-primary);
}

.message-time {
  font-size: 11px;
  color: var(--text-light);
  margin-top: 6px;
  text-align: right;
}

.input-area {
  padding: 15px 25px;
    background-color: white;
  border-top: 1px solid var(--border-color);
    display: flex;
  align-items: center;
}

.input-area .el-input {
    flex: 1;
  margin-right: 15px;
}

:deep(.input-area .el-textarea__inner) {
  border-radius: var(--border-radius);
  border-color: #e0e0e0;
  transition: all 0.3s;
  resize: none;
  padding: 12px 15px;
  font-size: 14px;
}

:deep(.input-area .el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(249, 140, 83, 0.2);
}

:deep(.input-area .el-button) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: var(--border-radius);
  padding: 12px 25px;
  font-weight: 600;
  transition: all 0.3s;
}

:deep(.input-area .el-button:hover) {
  background-color: #e87a45;
  border-color: #e87a45;
  transform: translateY(-1px);
}

/* 无会话样式 */
.no-conversation {
  flex: 1;
    display: flex;
  flex-direction: column;
    justify-content: center;
    align-items: center;
  color: var(--text-light);
  font-size: 16px;
}

.no-conversation:before {
  content: '';
  width: 100px;
  height: 100px;
  background-color: rgba(249, 140, 83, 0.1);
  border-radius: 50%;
  margin-bottom: 20px;
  background-image: url('@/assets/images/chat.png');
  background-size: 50px;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.7;
}

/* 群组成员样式 */
.group-member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.member-info {
  display: flex;
  align-items: center;
}

.member-name {
  font-weight: 500;
  margin-right: 10px;
}

:deep(.member-info .el-tag) {
  margin-left: 8px;
  font-size: 11px;
  height: 20px;
  line-height: 18px;
}

.group-actions-footer {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.group-management-actions {
  margin-bottom: 15px;
}

.group-exit-action {
  margin-top: 25px;
  text-align: center;
}

/* 登录提示样式 */
.login-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 30px;
  text-align: center;
  background-color: var(--bg-color-light);
}

:deep(.login-required .el-alert) {
  width: 350px;
  border-radius: var(--border-radius);
}

.login-actions {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-actions p {
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.login-button {
  margin: 5px;
  min-width: 150px;
}

/* 搜索容器样式 */
.search-container {
  position: relative;
  margin-bottom: 15px;
}

:deep(.search-container .el-input__inner) {
  border-radius: var(--border-radius);
  padding: 0 15px;
  height: 40px;
}

.suggestions-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-top: 5px;
  z-index: 2000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background-color: rgba(249, 140, 83, 0.05);
}

.suggestions-loading, .suggestions-empty {
  padding: 15px;
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestions-loading .el-icon {
  margin-right: 10px;
}

.request-time {
  font-size: 12px;
  color: var(--text-light);
}

.status-text {
  font-size: 13px;
  color: var(--text-light);
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  margin-right: 10px;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: var(--border-radius);
}

:deep(.el-form) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

:deep(.el-form-item) {
  width: 100%;
}

:deep(.el-input),
:deep(.el-select) {
  width: 100%;
}

:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
}

:deep(.el-dialog__body) {
  padding: 25px 20px;
}

/* 禁言消息 */
.muted-message {
  background-color: rgba(249, 140, 83, 0.05);
  color: var(--text-light);
    padding: 15px;
    text-align: center;
    width: 100%;
  border-radius: var(--border-radius);
    font-style: italic;
}

/* 操作按钮样式 */
.actions {
  display: flex;
  align-items: center;
}

.conversation-item .badge {
  margin-right: 10px;
}

.danger-option, .danger-option:hover {
  color: #F56C6C;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  border-radius: var(--border-radius);
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 20px;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(249, 140, 83, 0.05);
}

:deep(.el-dropdown-menu__item.danger-option:hover) {
  background-color: rgba(245, 108, 108, 0.05);
}

/* 按钮样式 */
:deep(.el-button) {
  border-radius: var(--border-radius);
  font-weight: 500;
}

:deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-button--primary:hover) {
  background-color: #e87a45;
  border-color: #e87a45;
}

:deep(.el-button--danger:hover) {
  opacity: 0.9;
}

/* 好友项目样式优化 */
.friend-item .info, .conversation-item .info {
  flex: 1;
  margin: 0 15px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }
  
  .user-info, .info {
    display: none;
  }
  
  .avatar {
    margin-right: 0;
  }
}

/* 通知列表样式 */
.notification-list {
  overflow-y: auto;
  height: calc(100vh - 236px);
  padding: 10px 0;
}

.notification-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: rgba(249, 140, 83, 0.03);
}

.notification-item .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  font-size: 18px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.notification-item .system-avatar {
  background-color: var(--accent-blue, #ABD7FB);
}

.notification-item .system-avatar.warning {
  background-color: #F56C6C;
}

.notification-item .system-avatar.success {
  background-color: var(--secondary-color);
}

.notification-item .info {
  flex: 1;
  padding: 3px 0;
}

.notification-item .info p {
  margin: 0 0 5px 0;
  line-height: 1.5;
  color: var(--text-primary);
}

.notification-item .info strong {
  color: var(--primary-color);
  font-weight: 600;
}

.notification-time {
  font-size: 12px;
  color: var(--text-light);
  display: block;
  margin-top: 5px;
}

.notification-item .actions {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.notification-item .actions button {
  margin: 0 3px;
}

.empty-notification {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-light);
  padding: 20px;
}

.empty-notification i {
  font-size: 40px;
  margin-bottom: 15px;
  opacity: 0.5;
  color: var(--accent-blue, #ABD7FB);
}

.unread-indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  top: 15px;
  right: 15px;
}

.tab-label-with-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  height: 18px;
  line-height: 18px;
  min-width: 18px;
  text-align: center;
  font-weight: 600;
  position: absolute;
  top: -8px;
  right: -15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 未读消息徽章 */
.unread-badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  margin-right: 10px;
  min-width: 20px;
  text-align: center;
}

.recording-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #333;
  font-style: italic;
}

.recording-indicator span {
  margin-right: 15px;
}

:deep(.input-area .el-button[circle]) {
  margin-left: 10px;
}

.el-icon {
  width: 1em;
  height: 1em;
  line-height: 1em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  fill: currentColor;
  color: inherit;
  font-size: inherit;
}

</style> 