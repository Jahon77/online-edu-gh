import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    username: '',
    name: '',
    id: null,
    role: null,
    phone: null,
    create_at: null
  })

  const setUser = (userInfo) => {
    user.value = { ...userInfo }
  }

  return {
    user,
    setUser
  }
})