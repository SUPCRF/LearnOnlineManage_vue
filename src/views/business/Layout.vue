<template>
  <el-container>
    <el-aside width="210px"><Aside /></el-aside>
    <el-container>
      <el-header><Header /></el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script>
import Header from '@/components/Header.vue'
import Aside from '@/components/Aside.vue'
export default {
  components: { Header, Aside },
}
</script>

<style>
.el-container {
  height: 100vh;
}

.el-header {
  background-color: #FFFFFF;
  color: #333;
  text-align: center;
  line-height: 60px;
  border-bottom: 2px solid;
}

.el-aside {
  background-color: #272A36;
  color: #333;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  /* line-height: 160px; */
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}
</style>