<template>
  <div class="setting-page">
    <div class="setting-card">
      <h2 class="setting-title">个人信息设置</h2>
      <div class="avatar-section">
        <ImageUpload v-model="form.avatar" :maxSize="2*1024*1024" :acceptTypes="['image/jpeg','image/png']" />
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px" class="info-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家" prop="country">
              <el-select v-model="form.country" placeholder="请选择国家" filterable>
                <el-option label="中国" value="中国" />
                <el-option label="美国" value="美国" />
                <el-option label="日本" value="日本" />
                <el-option label="英国" value="英国" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入城市" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编" prop="zipcode">
              <el-input v-model="form.zipcode" placeholder="请输入邮编" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" clearable />
        </el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="onSubmit">确认</el-button>
          <el-button @click="onCancel">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import http from '@/utils/http'
import ImageUpload from '@/components/ImageUpload.vue'

const userStore = useUserStore()
const formRef = ref(null)
const form = ref({
  avatar: userStore.user.avatar || '',
  name: userStore.user.name || '',
  phone: userStore.user.phone || '',
  email: userStore.user.email || '',
  country: userStore.user.country || '中国',
  city: userStore.user.city || '',
  address: userStore.user.address || '',
  zipcode: userStore.user.zipcode || ''
})

const rules = {
  name: [ { required: true, message: '请输入姓名', trigger: 'blur' } ],
  phone: [ { required: true, message: '请输入手机号', trigger: 'blur' } ],
  email: [ { required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' } ],
  country: [ { required: true, message: '请选择国家', trigger: 'change' } ],
  city: [ { required: true, message: '请输入城市', trigger: 'blur' } ],
  address: [ { required: true, message: '请输入详细地址', trigger: 'blur' } ],
  zipcode: [ { required: true, message: '请输入邮编', trigger: 'blur' } ]
}

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    try {
      // 假设后端有 /user/profile 接口，PUT方法
      const res = await http.put('/user/profile', form.value)
      if (res.data.status === 200) {
        ElMessage.success('保存成功！')
        userStore.setUser({ ...userStore.user, ...form.value })
      } else {
        ElMessage.error(res.data.message || '保存失败')
      }
    } catch (e) {
      ElMessage.error('保存失败，请重试')
    }
  })
}
const onCancel = () => {
  // 重置为store中的用户信息
  form.value = {
    avatar: userStore.user.avatar || '',
    name: userStore.user.name || '',
    phone: userStore.user.phone || '',
    email: userStore.user.email || '',
    country: userStore.user.country || '中国',
    city: userStore.user.city || '',
    address: userStore.user.address || '',
    zipcode: userStore.user.zipcode || ''
  }
}
</script>

<style scoped>
.setting-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  background: var(--background-color);
  padding: 40px 0;
}
.setting-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e0e0e0;
  padding: 36px 40px 32px 40px;
  min-width: 420px;
  max-width: 520px;
  width: 100%;
}
.setting-title {
  font-size: 1.5rem;
  color: var(--main-orange);
  margin-bottom: 28px;
  text-align: center;
  font-weight: 600;
}
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}
.info-form {
  margin-top: 0;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  margin-top: 18px;
}
</style>

