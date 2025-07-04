<template>
  <div class="reply-node" :style="{marginLeft: level * 24 + 'px'}">
    <div class="reply-content">
      <span>{{ reply.userName || '用户' }}：</span>
      <span>{{ reply.content }}</span>
      <span class="meta">{{ reply.createdAt }}</span>
      <button @click="showReply = !showReply" class="reply-btn">回复</button>
    </div>
    <div v-if="showReply" class="reply-box">
      <input v-model="replyContent" placeholder="回复..." />
      <button @click="submitReply">提交</button>
    </div>
    <div v-if="reply.children && reply.children.length">
      <ReplyNode
        v-for="child in reply.children"
        :key="child.id"
        :reply="child"
        :level="level + 1"
        @reply="emitReply"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  reply: Object,
  level: { type: Number, default: 0 }
})
const emit = defineEmits(['reply'])
const showReply = ref(false)
const replyContent = ref('')

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
  gap: 8px;
}
.meta {
  color: #888;
  font-size: 12px;
  margin-left: 8px;
}
.reply-btn {
  margin-left: 8px;
  color: #409eff;
  background: none;
  border: none;
  cursor: pointer;
}
.reply-box {
  margin: 8px 0 0 0;
  display: flex;
  gap: 8px;
}
.reply-box input {
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.reply-box button {
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}
</style>
