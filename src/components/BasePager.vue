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
}
.pager-btn {
  padding: 0.3rem 0.8rem;
  background-color: #f3f4f6;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
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