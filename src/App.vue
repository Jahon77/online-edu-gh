<script setup>

</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['CourseList', 'CourseDetail', 'Dashboard', 'StudentCenterCourseList', 'CourseFilterPage', 'StudentCoursePlayer']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<style scoped>

</style>
