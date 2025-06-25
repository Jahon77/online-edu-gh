<template>
  <main class="page-wrapper">
    <Header/>
    <HeaderSelect/>
    <div class="main-content">
      <slot></slot>
    </div>

    <Footer/>
  </main>
</template>

<script>
import Header from "../commen/header/header.vue";
import Footer from "../commen/footer/footer.vue";
import HeaderSelect from "../commen/header/header-select.vue";
export default {
  name: "layout",
  components:{Header, Footer,HeaderSelect}
}
</script>

<style scoped>
.main-content{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
