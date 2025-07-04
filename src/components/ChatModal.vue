<template>
  <div class="chat-modal-overlay" @click.self="closeModal">
    <div class="chat-modal-container">
      <div class="chat-header">
        <h2>与 {{ student.name }}{{ student.role === 2 ? '【老师】' : '' }} 的临时对话</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="chat-body" ref="chatBody">
        <template v-for="(message, index) in messages" :key="index">
          <div :class="['message', message.senderId === currentUserId ? 'user-message' : 'bot-message']">
            <div v-if="message.senderId !== currentUserId" class="message-avatar bot">
              <img :src="student.avatar || '/default-avatar.png'" :alt="student.name" />
            </div>
            <div class="message-content">
              <div>{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.createdAt) }}</div>
            </div>
            <div v-if="message.senderId === currentUserId" class="message-avatar user">我</div>
          </div>
        </template>
        <div class="typing-indicator" v-if="isLoading">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
      <div class="chat-footer">
        <div class="chat-input-container">
          <input
            v-model="inputMessage"
            class="chat-input"
            type="text"
            placeholder="输入消息..."
            :disabled="!isWebSocketReady"
            @keyup.enter="sendMessage"
          />
          <button
            class="send-button"
            :disabled="!isWebSocketReady || !inputMessage.trim()"
            @click="sendMessage"
          >
            发送
          </button>
        </div>
        <div class="message-error" v-if="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { ref, onMounted, onUnmounted, nextTick, defineProps, defineEmits, watch, computed } from 'vue';
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const messages = ref([]);
const inputMessage = ref('');
const error = ref('');
const isLoading = ref(false);
const chatBody = ref(null);
const ws = ref(null);
const conversationId = ref(null);
const isConnected = ref(false);

const isWebSocketReady = computed(() => isConnected.value);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getCurrentUserId = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; userid=`);
    if (parts.length === 2) {
        const userId = parts.pop().split(";").shift();
        return userId ? parseInt(userId, 10) : null;
    }
    return null;
};

const currentUserId = ref(getCurrentUserId());
const token = getCookie('satoken');

const scrollToBottom = async () => {
  await nextTick();
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const setupChat = async () => {
    if (!props.student?.id || !currentUserId.value) {
        error.value = "无法初始化聊天：缺少用户信息。";
        return;
    }
    isLoading.value = true;
    error.value = '';

    try {
        // 1. 获取或创建会话
        const convRes = await axios.post('http://localhost:8080/api/chat/conversation/private', 
            { targetUserId: props.student.id },
            { params: { userId: currentUserId.value } }
        );
        
        const conversationData = convRes.data.data.conversation;
        if (!conversationData || !conversationData.id) throw new Error("无法获取会话ID");
        conversationId.value = conversationData.id;

        // 2. 获取历史消息
        const messagesRes = await axios.get(`http://localhost:8080/api/chat/messages/${conversationId.value}`, {
            params: { userId: currentUserId.value, page: 0, size: 50 }
        });
        messages.value = messagesRes.data.data.reverse() || [];
        await scrollToBottom();
        
        // 3. 建立WebSocket连接
        connectWebSocket();

    } catch (e) {
        console.error("设置聊天失败:", e);
        error.value = "无法加载聊天记录。 " + (e.response?.data?.message || e.message);
    } finally {
        isLoading.value = false;
    }
};

const connectWebSocket = () => {
    if (!token) {
        error.value = "认证失败，无法连接聊天服务器。";
        return;
    }
    const wsUrl = `ws://localhost:8080/api/ws/chat?token=${token}`;
    ws.value = new WebSocket(wsUrl);

    ws.value.onopen = () => {
        console.log("WebSocket连接已建立。");
        error.value = '';
        isConnected.value = true;
    };

    ws.value.onmessage = (event) => {
        const message = JSON.parse(event.data);
        messages.value.push(message);
        scrollToBottom();
    };

    ws.value.onerror = (e) => {
        console.error("WebSocket错误:", e);
        error.value = "聊天连接发生错误。";
        isConnected.value = false;
    };

    ws.value.onclose = () => {
        console.log("WebSocket连接已关闭。");
        isConnected.value = false;
    };
};

const sendMessage = () => {
    if (!inputMessage.value.trim() || !ws.value || ws.value.readyState !== WebSocket.OPEN) return;

    const message = {
        conversationId: conversationId.value,
        content: inputMessage.value.trim(),
        // senderId will be set by backend
    };

    ws.value.send(JSON.stringify(message));

    // Optimistically add to UI
    messages.value.push({
        ...message,
        senderId: currentUserId.value,
        createdAt: new Date().toISOString()
    });
    inputMessage.value = '';
    scrollToBottom();
};

const closeModal = () => {
  emit('close');
};

watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    setupChat();
  }
}, { immediate: true });


onUnmounted(() => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.close();
  }
});
</script>

<style scoped>
/* 样式借用并修改自 aichat.vue 和一些新样式 */
.chat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.chat-modal-container {
  width: 90%;
  max-width: 600px;
  height: 80vh;
  max-height: 700px;
  background-color: #f4f6f8;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  line-height: 1;
}

.chat-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 80%;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #d1d5db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-break: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

/* User's message */
.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.user-message .message-content {
  background-color: #3b82f6;
  color: white;
}
.user-message .message-avatar {
  background-color: #3b82f6;
}

.user-message .message-time {
  color: #e0e0e0;
  text-align: right;
}

/* Bot's message */
.bot-message {
  align-self: flex-start;
}
.bot-message .message-content {
  background-color: #ffffff;
  color: #374151;
}

.bot-message .message-time {
  text-align: left;
}

.chat-footer {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.chat-input-container {
  display: flex;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}
.chat-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.send-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #2563eb;
}

.send-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.message-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    text-align: center;
}
</style> 