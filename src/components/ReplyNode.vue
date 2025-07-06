<template>
  <div class="reply-node" :style="{marginLeft: level * 24 + 'px'}">
    <div class="reply-content">
      <div class="reply-main">
        <span>{{ reply.userName || '用户' }}：</span>
        <span>{{ reply.content }}</span>
        <span class="meta">{{ formatDate(reply.createdAt) }}</span>
      </div>
      <div class="reply-actions">
        <button class="icon-btn delete-btn" v-if="String(reply.userId) === String(currentUserId)" @click="deleteReply(reply.id)">
          <svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          删除
        </button>
        <button class="icon-btn reply-btn" @click="showReply = !showReply">
          <svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          回复
        </button>
      </div>
    </div>
    <div v-if="showReply" class="reply-box">
      <input v-model="replyContent" placeholder="回复该评论..." />
      <button @click="submitReply">回复</button>
    </div>
    <div v-if="reply.children && reply.children.length">
      <ReplyNode
        v-for="child in reply.children"
        :key="child.id"
        :reply="child"
        :level="level + 1"
        :current-user-id="currentUserId"
        @reply="emitReply"
      />
    </div>
    <!-- <div v-if="reply.id === rootReplyCommentId" class="root-reply-box">
      <input v-model="rootReplyInput[reply.id]" placeholder="回复该评论..." />
      <button @click="submitReply(reply.id)">回复</button>
   </div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
const props = defineProps({
  reply: Object,
  level: { type: Number, default: 0 },
  currentUserId: Number,
  rootReplyCommentId: Number,
  rootReplyInput: Object
})
const emit = defineEmits(['reply', 'deleted'])
const showReply = ref(false)
const replyContent = ref('')

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { hour12: false })
}

const submitReply = () => {
  if (!replyContent.value.trim()) return
  emit('reply', {
    parentReplyId: props.reply.id,
    content: replyContent.value
  })
  replyContent.value = ''
  showReply.value = false
}

const emitReply = (payload) => {
  emit('reply', payload)
}

const deleteReply = async (replyId) => {
  if (!confirm('确定要删除这条回复吗？')) return;
  try {
    await axios.delete(`/api/comment/reply/${replyId}`, { params: { userId: props.currentUserId } });
    emit('deleted');
  } catch (e) {
    alert('删除失败，请重试');
    console.error(e);
  }
}

</script>

<style scoped>
.reply-node {
  margin-top: 12px;
}
.reply-content {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.meta {
  color: #888;
  font-size: 12px;
  margin-left: 8px;
}
.reply-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  color: #6b7280;
  font-size: 1rem;
}
.icon-btn .icon {
  width: 20px;
  height: 20px;
  display: block;
}
.icon-btn.reply-btn {
  color: #3b82f6;
  background: #f3f4f6;
  font-weight: 500;
}
.icon-btn.reply-btn:hover {
  background: #e0e7ff;
  color: #2563eb;
}
.icon-btn.delete-btn {
  color: #ef4444;
  background: #fee2e2;
}
.icon-btn.delete-btn:hover {
  background: #f87171;
  color: #fff;
}
.reply-box {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.7rem;
}
.reply-box input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background: #f8fafc;
  transition: border 0.2s;
}
.reply-box input:focus {
  border-color: #3b82f6;
  outline: none;
  background: #fff;
}
.reply-box button {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.reply-box button:hover {
  background: #2563eb;
}
.reply-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
