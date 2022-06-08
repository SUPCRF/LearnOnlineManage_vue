<template>
  <div class="h-conatiner">
    <div class="h-size">
      <el-avatar :size="40" :src="avatarSrc" @error="errorHandler">
        <img
          src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
        />
      </el-avatar>
      <el-dropdown trigger="hover" size="medium">
        <span class="el-dropdown-link">
          {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            ><a :href="'/business/asystem/userinfo'" class="header-a"
              >个人信息</a
            ></el-dropdown-item
          >
          <el-dropdown-item @click.native="logoutFn">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'

export default {
  data() {
    return {
      username: "请登录",
      avatarSrc: "",
    };
  },
  created() {
    let token = Cookies.get("token");
    if (!token) {
    } else {
      this.username = this.$store.state.userInfo.username;
      this.avatarSrc = this.$store.state.userInfo.avatar;
    }
  },
  methods: {
    errorHandler() {
      return true;
    },

    // logoutFn() {
    //   const _this = this
    //   _this.$axios.get('/login/logout', {
    //     headers: {
    //       "Authorization": localStorage.getItem("token")
    //     }
    //   }).then(res => {
    //     _this.$store.commit("REMOVE_INFO")
    //     _this.$router.push('/login')
    //   })
    // },

    logoutFn() {
      this.$confirm("确认退出吗?", "提示", {
        type: "warning",
      })
        .then(() => {
          this.$api.login.logoutFn().then((res) => {
            if (res.code == 200) {
              this.$store.commit("REMOVE_INFO")
              this.$router.push("/login");
              Cookies.remove("token");
            } else {
              this.$message({
                message: res.msg,
                type: "error",
              });
            }
          });
        })
        .catch(() => {});
    },
  },
};
</script>

<style scoped>
.h-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.h-size {
  position: relative;
  width: 180px;
  height: 40px;
  float: right;
}

.el-avatar {
  margin-top: 10px;
  margin-right: 10px;
}

.el-dropdown {
  position: absolute;
  height: 40px;
}

.el-dropdown-link {
  cursor: pointer;
}

.el-icon-arrow-down {
  font-size: 12px;
}

el-dropdown-item a{
  color: black;
}
</style>