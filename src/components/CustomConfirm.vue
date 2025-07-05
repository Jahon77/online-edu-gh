<template>
  <transition name="fade">
    <div v-if="show" class="custom-confirm-overlay" @click="closeOnOverlay && handleCancel">
      <div class="custom-confirm" @click.stop>
        <div class="custom-confirm-header" v-if="title">
          <h3>{{ title }}</h3>
        </div>
        <div class="custom-confirm-content">
          <p>{{ message }}</p>
        </div>
        <div class="custom-confirm-footer">
          <button class="btn cancel" @click="handleCancel">{{ cancelText }}</button>
          <button class="btn confirm" @click="handleConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CustomConfirm',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '确认'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm');
      this.$emit('close');
    },
    handleCancel() {
      this.$emit('cancel');
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.custom-confirm-overlay {
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

.custom-confirm {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.custom-confirm-header {
  margin-bottom: 15px;
}

.custom-confirm-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.custom-confirm-content {
  margin-bottom: 20px;
}

.custom-confirm-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 16px;
}

.custom-confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn.confirm {
  background-color: #F98C53;
  color: white;
}

.btn.confirm:hover {
  background-color: #f87b3a;
}

.btn.cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn.cancel:hover {
  background-color: #e8e8e8;
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