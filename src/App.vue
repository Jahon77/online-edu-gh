<script setup>
import http from './utils/http'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let heartbeatTimer = null
let heartbeatFailCount = 0
const MAX_FAIL = 3

function sendHeartbeat() {
  http.post('/heartbeat')
    .then(() => {
      heartbeatFailCount = 0
    })
    .catch(() => {
      heartbeatFailCount++
      if (heartbeatFailCount >= MAX_FAIL) {
        // 自动退出
        http.post('/logout').finally(() => {
          // 清理本地token和cookie
          document.cookie = 'satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          localStorage.removeItem('satoken')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          localStorage.removeItem('user')
          sessionStorage.clear()
          router.push('/login')
        })
      }
    })
}

onMounted(() => {
  sendHeartbeat()
  heartbeatTimer = setInterval(sendHeartbeat, 30000)
})

onUnmounted(() => {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
})
</script>

<template>
  <router-view/>
</template>

<style scoped>

</style>
