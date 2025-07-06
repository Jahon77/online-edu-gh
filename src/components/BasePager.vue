<template>
  <div class="pager" v-if="totalPages > 0">
    <button class="pager-btn" @click="goFirst" :disabled="page === 1">首页</button>
    <button class="pager-btn" @click="goPrev" :disabled="page === 1">上一页</button>

    <input
      type="number"
      v-model.number="inputPage"
      @keydown.enter="commitPage"
      :min="1"
      :max="totalPages"
      class="page-input"
    />
    <span class="slash">/</span>
    <span class="total">{{ totalPages }}</span>

    <button class="pager-btn" @click="goNext" :disabled="page === totalPages">下一页</button>
    <button class="pager-btn" @click="goLast" :disabled="page === totalPages">末页</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true }, // v-model
  totalItems: { type: Number, required: true },
  pageSize: { type: Number, default: 5 }
})

const emits = defineEmits(['update:modelValue'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const page = computed({
  get: () => Math.min(props.modelValue, totalPages.value),
  set: (val) => emits('update:modelValue', val)
})

const inputPage = ref(page.value)

watch(page, (val) => {
  inputPage.value = val
})

function commitPage() {
  if (inputPage.value < 1) inputPage.value = 1
  if (inputPage.value > totalPages.value) inputPage.value = totalPages.value
  page.value = inputPage.value
}

function goPrev() {
  if (page.value > 1) page.value -= 1
}
function goNext() {
  if (page.value < totalPages.value) page.value += 1
}
function goFirst() {
  page.value = 1
}
function goLast() {
  page.value = totalPages.value
}
</script>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}
.pager-btn {
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}
.pager-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
.pager-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-input {
  width: 48px;
  text-align: center;
  padding: 0.3rem 0.2rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
}
.slash {
  font-weight: 600;
  color: #374151;
}
.total {
  width: 32px;
  text-align: center;
  font-weight: 600;
  color: #374151;
}
</style> 