<template>
    <div class="chat-page">
      <div class="chat-container">
        <div class="chat-header">
          <h2>智学通AI助手</h2>
          <div>
            <button class="clear-button" @click="clearChat">清空对话</button>
          </div>
        </div>
        <div class="chat-body" ref="chatBody">
          <!-- 消息列表 -->
          <template v-for="(message, index) in messages" :key="index">
            <div :class="['message', 
                         message.role === 'user' ? 'user-message' : 
                         message.role === 'assistant' ? 'bot-message' : 'system-message']">
              
              <!-- AI/System Avatar (at the start) -->
              <div v-if="message.role !== 'user'" :class="['message-avatar', message.role === 'assistant' ? 'bot' : 'system']">
                {{ message.role === 'assistant' ? 'AI' : '!' }}
              </div>
              
              <!-- Message Content -->
              <div class="message-content">
                <div v-html="formatMessage(message.content)"></div>
                <div class="message-time" v-if="message.time">{{ message.time }}</div>
              </div>
              
              <!-- User Avatar (at the end) -->
              <div v-if="message.role === 'user'" class="message-avatar user">我</div>
            </div>
          </template>
          
          <!-- 正在输入提示 -->
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
              placeholder="请输入您的问题..."
              :disabled="isLoading"
              @keyup.enter="sendMessage"
            />
            <button
              class="send-button"
              :disabled="isLoading || !inputMessage.trim()"
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
  
  <script>
  import { ref, onMounted, nextTick, watch } from 'vue';
  import { marked } from 'marked';
  
  export default {
    name: 'AiChat',
    setup() {
      const userRole = ref(1);
      const inputMessage = ref('');
      const error = ref('');
      const chatBody = ref(null);
      const chatHistory = ref([]);
      
      // 获取当前时间
      const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      };

      // 创建初始欢迎消息
      const createWelcomeMessage = () => ({
        role: 'assistant',
        content: '您好！我是智学通中的AI学习助手，有什么可以帮您？',
        time: '' // 初始消息不显示时间
      });

      // 初始化消息列表，包含欢迎消息
      const messages = ref([createWelcomeMessage()]);
      const isLoading = ref(false);

      // 使用 marked 将 Markdown 转换为 HTML
      const formatMessage = (text) => {
        if (!text) return '';
        // 配置 marked 以将换行符转换为 <br>
        return marked(text, { breaks: true, gfm: true });
      };
  
      // 滚动到底部
      const scrollToBottom = async () => {
        await nextTick();
        if (chatBody.value) {
          chatBody.value.scrollTop = chatBody.value.scrollHeight;
        }
      };
  
      // 使用HTTP方式发送消息
      const sendHttpMessage = async (message, history) => {
        try {
          // 获取token
          const token = getCookie('satoken');
          if (!token) {
            throw new Error('未登录或登录已过期，请重新登录');
          }
          
          console.log('发送HTTP请求到:', 'http://localhost:8080/api/chat/send');
          console.log('请求体:', JSON.stringify({
            message: message,
            history: history
          }));
          
          // 不要在URL中添加token参数，只在header中传递
          const response = await fetch('http://localhost:8080/api/chat/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'satoken': token
            },
            body: JSON.stringify({
              message: message,
              history: history
            })
          });
          
          console.log('收到HTTP响应:', response);
          
          if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}, 信息: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('HTTP响应数据:', data);
          
          if (data.status === 0) {
            return data.data;
          } else {
            // 显示具体的错误信息
            throw new Error(data.message || '请求失败，状态码: ' + data.status);
          }
        } catch (err) {
          console.error('HTTP请求失败:', err);
          throw err;
        }
      };
  
      // 获取cookie中的值
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const tokenValue = parts.pop().split(';').shift();
          return tokenValue;
        }
        return null;
      };
  
      // 发送消息
      const sendMessage = async () => {
        if (!inputMessage.value.trim() || isLoading.value) return;
        
        const userMessage = inputMessage.value.trim();
        
        // 添加用户消息到消息列表
        messages.value.push({
          role: 'user',
          content: userMessage,
          time: getCurrentTime()
        });
        
        // 添加到聊天历史
        chatHistory.value.push({
          role: 'user',
          content: userMessage
        });
        
        // 首次交互时，也将会话中的欢迎消息加入历史
        if (chatHistory.value.length === 1) {
          const welcomeMsg = messages.value[0];
          if(welcomeMsg && welcomeMsg.role === 'assistant') {
            chatHistory.value.unshift({
              role: 'assistant',
              content: welcomeMsg.content
            });
          }
        }
        
        inputMessage.value = '';
        error.value = '';
        isLoading.value = true;
        
        scrollToBottom();
        
        try {
          // 调用HTTP API
          const historyFormatted = chatHistory.value.slice(0, -1).map(item => ({
            role: item.role,
            content: item.content
          }));
          
          const response = await sendHttpMessage(userMessage, historyFormatted);
          
          // 添加AI回复到消息列表
          messages.value.push({
            role: 'assistant',
            content: response.content,
            time: getCurrentTime()
          });
          
          // 添加到聊天历史
          chatHistory.value.push({
            role: 'assistant',
            content: response.content
          });
          
          isLoading.value = false;
          scrollToBottom();
        } catch (err) {
          console.error('发送消息失败:', err);
          // 显示具体的错误信息而不只是通用提示
          error.value = `发送消息失败: ${err.message || '请稍后再试'}`;
          isLoading.value = false;
          
          // 添加错误消息到聊天界面
          messages.value.push({
            role: 'system',
            content: `错误: ${err.message || '发送消息失败，请稍后再试'}`,
            time: getCurrentTime()
          });
          scrollToBottom();
        }
      };
  
      // 清空聊天记录
      const clearChat = () => {
        messages.value = [createWelcomeMessage()];
        chatHistory.value = [];
        error.value = '';
      };
      
      onMounted(() => {
        const role = getCookie('role');
        if (role) {
            userRole.value = parseInt(role);
        }
        // 组件挂载后滚动到底部
        scrollToBottom();
      });
      
      // 监听消息列表变化，自动滚动
      watch(messages, () => {
        scrollToBottom();
      }, { deep: true });
  
      return {
        userRole,
        inputMessage,
        error,
        messages,
        isLoading,
        chatBody,
        sendMessage,
        clearChat,
        formatMessage
      };
    }
  };
  </script>
  
  <style>
  :root {
    --primary-orange: #F98C53;
    --primary-green: #D2E0AA;
    --primary-blue: #ABD7FB;
    --primary-pink: #F9F2EF;
    --primary-peach: #FCCEB4;
  }
  
  .chat-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  
  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    position: relative;
    border-radius: 8px;
    margin: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .chat-header {
    background: linear-gradient(135deg, var(--primary-green) 0%, #a8c776 100%);
    padding: 16px 24px;
    border-radius: 8px 8px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .chat-header h2 {
    color: #ffffff;
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .chat-header h2::before {
    content: "🤖";
    font-size: 24px;
  }
  
  .clear-button {
    background-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .clear-button:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .chat-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background-color: #ffffff;
  }
  
  .message {
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .message-avatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    margin-right: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .message-avatar.user {
    background-color: var(--primary-orange);
    color: white;
  }
  
  .message-avatar.bot {
    background: linear-gradient(135deg, var(--primary-blue) 0%, #7fb8f5 100%);
    color: white;
  }
  
  .message-avatar.system {
    background-color: #ff4d4f;
    color: white;
  }
  
  .message-content {
    padding: 14px 18px;
    border-radius: 12px;
    max-width: 80%;
    line-height: 1.6;
    font-size: 25px;
  }
  
  .user-message .message-content {
    background-color: var(--primary-orange);
    color: white;
    margin-left: auto;
    border-top-right-radius: 4px;
  }
  
  .bot-message .message-content {
    background-color: #f1f3f5;
    color: #333;
    border-top-left-radius: 4px;
  }
  
  .system-message .message-content {
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    color: #ff4d4f;
    border-top-left-radius: 4px;
  }
  
  .message-time {
    font-size: 14px;
    color: #adb5bd;
    margin-top: 6px;
    text-align: right;
  }
  
  .chat-footer {
    padding: 30px 24px;
    background-color: #ffffff;
    border-top: 1px solid #edf2f7;
    border-radius: 0 0 8px 8px;
  }
  
  .chat-input-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #f8f9fa;
    border-radius: 24px;
    padding: 4px;
  }
  
  .chat-input {
    flex: 1;
    padding: 14px 18px;
    border: none;
    background: transparent;
    outline: none;
    font-size: 25px;
    color: #495057;
  }
  
  .chat-input::placeholder {
    color: #adb5bd;
    font-size: 25px;
  }
  
  .send-button {
    min-width: 90px;
    height: 44px;
    background: linear-gradient(135deg, var(--primary-orange) 0%, #f47b3d 100%);
    color: white;
    border: none;
    border-radius: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 22px;
    font-weight: 500;
    padding: 0 24px;
  }
  
  .send-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 140, 83, 0.3);
  }
  
  .send-button:disabled {
    background: #e9ecef;
    color: #adb5bd;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .typing-indicator {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border-radius: 12px;
    width: fit-content;
    margin-bottom: 16px;
  }
  
  .typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--primary-blue);
    margin: 0 2px;
    animation: typing 1.4s infinite ease-in-out;
  }
  
  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  .message-error {
    color: #f56c6c;
    font-size: 12px;
    padding: 4px 0;
    text-align: center;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .chat-container {
      margin: 8px;
    }
    
    .chat-header {
      padding: 12px 16px;
    }
    
    .chat-header h2 {
      font-size: 20px;
    }
    
    .chat-body {
      padding: 16px;
    }
    
    .message-content {
      font-size: 15px;
      padding: 12px 16px;
    }
    
    .chat-footer {
      padding: 12px 16px;
    }
    
    .send-button {
      min-width: 80px;
      height: 40px;
      font-size: 15px;
      padding: 0 20px;
    }
  }
  </style> 