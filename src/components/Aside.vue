<template>
  <el-menu
    class="sidebar-menu"
    router
    :default-active="$route.path"
    :show-timeout="200"
    background-color="#272a36"
    text-color="#e7e7e7"
    active-text-color="#ff6600"
  >
    <el-scrollbar wrap-class="scrollbar-wrapper" style="height: 100%">
      <template
        v-for="group in this.$router.options.routes[1].children[1].children"
      >
        <el-submenu
          v-if="
            group.children &&
            group.children.length > 0 &&
            group.children.path !== ''
          "
          :key="group.id"
          :index="group.path"
        >
          <template slot="title">
            <i :class="group.children[0].meta.icon"></i>
            <span slot="title">{{ group.children[0].meta.title }}</span>
          </template>
          <el-menu-item
            v-for="menu in group.children"
            :key="menu.id"
            :index="'/business/' + group.path + '/' + menu.path"
          >
            <template>
              <i
                class="icon iconfont icon-pointer"
                style="vertical-align: baseline"
              />
              {{ menu.meta.name }}
            </template>
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-else :key="group.id" :index="'/business/' + group.path">
          <i :class="group.meta.icon"></i>
          <span slot="title">{{ group.meta.title }}</span>
        </el-menu-item>
      </template>
    </el-scrollbar>
  </el-menu>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.el-menu {
  border-right: 0;
}
</style>