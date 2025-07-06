<template>
  <transition name="fade">
    <div v-if="show" class="custom-alert-overlay" @click="closeOnOverlay && $emit('close')">
      <div class="custom-alert" @click.stop>
        <div class="custom-alert-header" v-if="title">
          <h3>{{ title }}</h3>
        </div>
        <div class="custom-alert-content">
          <p>{{ message }}</p>
        </div>
        <div class="custom-alert-footer">
          <button class="btn confirm" @click="$emit('close')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CustomAlert',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.custom-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.custom-alert {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.custom-alert-header {
  margin-bottom: 15px;
}

.custom-alert-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.custom-alert-content {
  margin-bottom: 20px;
}

.custom-alert-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 16px;
}

.custom-alert-footer {
  display: flex;
  justify-content: flex-end;
}

.btn.confirm {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.confirm:hover {
  background-color: #f87b3a;
  transform: translateY(-1px);
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 