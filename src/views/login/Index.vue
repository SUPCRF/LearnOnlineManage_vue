<template>
  <div class="container">
    <div class="login">
      <span class="login_title1"
        >后&nbsp;台&nbsp;管&nbsp;理&nbsp;系&nbsp;统</span
      >
      <span class="login_title2"
        >用&nbsp;&nbsp;户&nbsp;&nbsp;登&nbsp;&nbsp;录&nbsp;|&nbsp;Sign</span
      >
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="ruleForm"
        class="login-ruleForm"
      >
        <el-form-item prop="username">
          <el-input
            v-model="ruleForm.username"
            autocomplete="off"
            placeholder="请输入账号"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="ruleForm.password"
            autocomplete="off"
            placeholder="请输入密码"
            @keyup.enter.native="loginFn"
          ></el-input>
        </el-form-item>
        <el-form-item prop="verifyCode" class="login_verifyCode">
          <el-input
            v-model.number="ruleForm.verifyCode"
            placeholder="请输入验证码"
            style="width: 260px"
            @keyup.enter.native="loginFn"
          ></el-input>
          <div class="identifybox">
            <div @click="refreshCode">
              <s-identify :identifyCode="identifyCode"></s-identify>
            </div>
          </div>
        </el-form-item>
        <el-form-item class="login_btn">
          <el-button type="primary" auto-complete="off" @click="loginFn"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
      <div class="fwq">
        <span class="fwq-status"
          >服务器状态:&nbsp;<el-link :type="statusType" :underline="false"
            >{{ status
            }}<i :class="statusIcon" class="el-icon--right"></i></el-link
        ></span>
        <span class="fwq-timeout"
          >延时:&nbsp;<el-link type="info" :underline="false">{{
            timeout + " ms"
          }}</el-link></span
        >
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import axios from "axios";
import { Vue, Component } from "vue-property-decorator";
import { Meta } from "ea-router";

import SIdentify from "@/components/canvas.vue";

@Meta({
  title: "登录",
})
@Component({
  components: {
    SIdentify,
  },
})
export default class Login extends Vue {
  data() {
    let verifyCode = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("验证码不能为空"));
      } else if (value != this.identifyCode) {
        callback(new Error("验证码不正确"));
      } else {
        callback();
      }
    };
    let username = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入账号"));
      } else {
        callback();
      }
    };
    let password = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        username: "supcrf",
        password: "123456",
        verifyCode: "",
      },
      rules: {
        username: [{ validator: username, trigger: "blur" }],
        password: [{ validator: password, trigger: "blur" }],
        verifyCode: [{ validator: verifyCode, trigger: "blur" }],
      },
      identifyCodes: "1234567890",
      identifyCode: "",
      statusType: "",
      status: "",
      statusIcon: "",
      timeout: -1,
    };
  }

  mounted() {
    (this.identifyCode = ""), this.makeCode(this.identifyCodes, 4);
  }

  created() {
    let start = Date.now();
    let url = "http://localhost:8000/api/login/timeout";
    const _this = this;
    axios
      .post(url)
      .then(function (res) {
        let millis = Date.now() - start;
        // console.log(millis);
        // console.log(Math.floor(millis / 1000 / 1000) + "ms");
        _this.timeout = Math.floor(millis / 1000 / 1000);
      })
      .catch(function (res) {
        console.log(res);
      });
    if (this.timeout < 100) {
      this.statusType = "success";
      this.status = "正常";
      this.statusIcon = "el-icon-success";
    } else if (this.timeout < 1000) {
      this.statusType = "warning";
      this.status = "一般";
      this.statusIcon = "el-icon-warning";
    } else {
      this.statusType = "danger";
      this.status = "较差";
      this.statusIcon = "el-icon-error";
    }
  }

  // loginFn() {
  //   this.$refs["ruleForm"].validate((valid) => {
  //     if (valid) {
  //       const _this = this
  //       this.$axios.post('/login/admin', this.ruleForm).then(res => {
  //         const jwt = res.headers['authorization']
  //         const userInfo = res.data.data
  //         _this.$store.commit("SET_TOKEN", jwt)
  //         _this.$store.commit("SET_USERINFO", userInfo)
  //         _this.$router.push("/business/");
  //       })
  //     } else {
  //       return false;
  //     }
  //   });
  // }

  loginFn() {
    this.$refs["ruleForm"].validate((valid) => {
      if (valid) {
        const _this = this;
        this.$api.login
          .loginFn({
            username: this.ruleForm.username,
            password: this.ruleForm.password,
          })
          .then((res) => {
            // console.log(res);
            // console.log(this.$store);
            // console.log(res.headers);
            if (res.code == 200) {
              // const jwt = res.headers["authorization"];
              const jwt = res.data.token;
              console.log(jwt);
              const userInfo = res.data;
              console.log(userInfo);
              // Cookies.set("token", res.headers["authorization"]);
              Cookies.set("token", jwt); // 放置token到Cookie
              // this.$store.state.userInfo = res.data.data;

              this.$store.commit("SET_TOKEN", jwt);
              this.$store.commit("SET_USERINFO", userInfo);

              // _this.$router.push("/business/");
              console.log(this.$store.state.userInfo);
              this.$router.push("/business/"); // 登录成功，跳转到主页
              this.$notify({
                title: "登录成功",
                type: "success",
              });
            } else {
              console.log(res);
              console.log(this.$store);
              this.$notify.error({
                title: "登录失败",
                message: res.message,
              });
            }
          });
      } else {
        return false;
      }
    });
  }

  randomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  refreshCode() {
    this.identifyCode = "";
    this.makeCode(this.identifyCodes, 4);
  }

  makeCode(o, l) {
    for (let i = 0; i < l; i++) {
      this.identifyCode += this.identifyCodes[
        this.randomNum(0, this.identifyCodes.length)
      ];
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #2d3a4b;
  width: 100%;
  height: 100vh;
}

.login {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 400px;
  height: 400px;
  margin-left: -200px;
  margin-top: -200px;
}

.login .login_title1 {
  display: inline-block;
  width: 100%;
  color: white;
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 40px;
}

.login .login_title2 {
  display: inline-block;
  width: 100%;
  color: white;
  font-size: 18px;
  font-weight: 400;
  margin-left: 5px;
  margin-bottom: 20px;
}

.login .login_btn {
  display: inline-block;
  width: 100%;
  text-align: center;
}

.login .login_btn button {
  width: 100%;
}

.login .login_verifyCode {
  float: left;
  position: relative;
}

.login .login_verifyCode .identifybox {
  position: absolute;
  top: 1px;
  left: 237px;
  margin-left: 50px;
}

.fwq {
  width: 100%;
  height: 20px;
  text-align: justify;
}

.fwq:after {
  content: "";
  display: inline-block;
  overflow: hidden;
  width: 100%;
}

.fwq span {
  height: 20px;
  display: inline-block;
  line-height: 20px;
  color: white;
}

.fwq-status {
  width: 200px;
}

.fwq-timeout {
  width: 200px;
  text-align: right;
}
</style>