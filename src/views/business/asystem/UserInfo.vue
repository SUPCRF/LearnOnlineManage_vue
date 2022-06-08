<template>
  <div class="container">
    <section>
      <img v-if="!progressFlag" class="head-img" :src="avatarSrc" />
      <div v-show="progressFlag" class="head-img">
        <el-progress
          type="circle"
          :percentage="progressPercent"
          :width="100"
          style="margin-left: 250px"
        ></el-progress>
      </div>
      <el-upload
        class="img-btn"
        action="#"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
        :http-request="uploadImg"
      >
        <el-button type="success" plain round size="mini" class="changeimg-btn"
          >更改头像</el-button
        ></el-upload
      >
    </section>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="demo-ruleForm"
      hide-required-asterisk
    >
      <el-form-item label="账号" prop="userName">
        <el-input v-model="ruleForm.userName" disabled></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="companyName">
        <el-input v-model="ruleForm.sex"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input v-model="ruleForm.phone"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="ruleForm.email"></el-input>
      </el-form-item>
      <el-form-item label="出生日期" prop="mobile">
        <el-input v-model="ruleForm.birth" disabled></el-input>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary" @click="modifyPersonalInfo()"
          >确认提交</el-button
        >
        <el-button type="primary" @click="dialogFormVisible = true"
          >修改密码</el-button
        >
      </el-form-item>
    </el-form>

    <el-dialog
      title="修改密码"
      :visible.sync="dialogFormVisible"
      width="40%"
      center
    >
      <el-form
        :model="form"
        :rules="rulesForm"
        ref="form"
        hide-required-asterisk
      >
        <el-form-item
          label="旧密码"
          :label-width="formLabelWidth"
          prop="oldPass"
        >
          <el-input v-model="form.oldPass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="新密码"
          :label-width="formLabelWidth"
          prop="newPass"
        >
          <el-input v-model="form.newPass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="确认新密码"
          :label-width="formLabelWidth"
          prop="checkPass"
        >
          <el-input v-model="form.checkPass" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyPwd()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import { Meta } from "ea-router";
import axios from "axios";
import Cookies from "js-cookie";

@Meta({
  title: "系统管理",
  icon: "el-icon-s-tools",
  name: "用户信息",
})
@Component
export default class UserInfo extends Vue {
  data() {
    return {
      avatarSrc: "",
      times: "0",
      progressFlag: false,
      progressPercent: 0,
      percentage: 0,
      disabled: false,
      ruleForm: {
        id: "",
        userName: "",
        sex: "",
        phone: "",
        email: "",
        birth: "",
      },
      rules: {
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        phone: [
          { pattern: /^1[3|4|5|7|8][0-9]\d{8}$/, message: "请输入合法手机号" },
        ],
      },
      dialogFormVisible: false,
      form: {
        oldPass: "",
        newPass: "",
        checkPass: "",
      },
      rulesForm: {
        oldPass: [{ required: true, message: "请输入密码", trigger: "blur" }],
        newPass: [{ required: true, message: "请输入新密码", trigger: "blur" }],
        checkPass: [
          { required: true, message: "请输入新密码", trigger: "blur" },
        ],
      },
      formLabelWidth: "120px",
    };
  }

  mounted() {
    this.getUserInfo();
  }

  getUserInfo() {
    let token = Cookies.get("token");
    let formdata = new FormData();
    formdata.append("userType", "admin");
    formdata.append("userId", this.$store.state.userInfo.id);
    axios({
      url: "http://localhost:8000/api/common/userInfo",
      method: "post",
      data: formdata,
      headers: { Authorization: token },
    }).then((res) => {
      console.log(res);
      if (res.status == 200) {
        console.log("ok");
        console.log(res.data.data);
        this.ruleForm.id = res.data.data.id;
        this.ruleForm.userName = res.data.data.username;
        if (res.data.data.sex === 0) {
          this.ruleForm.sex = "男";
        } else {
          this.ruleForm.sex = "女";
        }
        this.ruleForm.phone = res.data.data.phone;
        this.ruleForm.email = res.data.data.email;
        this.ruleForm.birth = res.data.data.birth;
        this.avatarSrc = res.data.data.avatar;
      }
    });
  }

  modifyPersonalInfo() {
    this.$refs.ruleForm.validate((val) => {
      if (val) {
        let sex = 0;
        if (this.ruleForm.sex === "女") {
          sex = 1;
        }
        let token = Cookies.get("token");
        let formdata = new FormData();
        formdata.append("userId", this.ruleForm.id);
        formdata.append("sex", sex);
        formdata.append("phone", this.ruleForm.phone);
        formdata.append("email", this.ruleForm.email);
        axios({
          url: "http://localhost:8000/api/admin-user/updateInfo",
          method: "post",
          data: formdata,
          headers: { Authorization: token },
        }).then((res) => {
          console.log(res);
          if (res.status == 200) {
            console.log("ok");
            this.$message.success("修改成功！");
            this.getUserInfo();
          } else {
            this.$message({
              message: res.msg,
              type: "error",
            });
          }
        });
      }
    });
  }

  resetForm(formName) {
    this.$refs[formName].resetFields();
  }
  uploadImg(f) {
    console.log(f);
    this.progressFlag = true;
    let formdata = new FormData();
    formdata.append("file", f.file);
    formdata.append("bucketName", "edu");
    formdata.append("userType", "admin");
    formdata.append("userId", this.ruleForm.id);
    console.log(formdata.get("uid"));

    console.log(formdata);
    let token = Cookies.get("token");
    axios({
      url: "http://localhost:8000/api/minio/changeAvatar",
      method: "post",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data", Authorization: token },
      onUploadProgress: (progressEvent) => {
        this.progressPercent =
          (progressEvent.loaded / progressEvent.total) * 100;
      },
    })
      .then((res) => {
        console.log(res);
        this.avatarSrc = res.data.data;
        this.$store.state.userInfo.avatar = res.data.data;
        if (this.progressPercent === 100) {
          this.progressFlag = false;
          this.progressPercent = 0;
        }
      })
      .then((error) => {
        console.log(error);
      });
  }

  beforeAvatarUpload(file) {
    const isJPG = file.type === "image/jpeg";
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isJPG) {
      this.$message.error("上传头像图片只能是 JPG 格式!");
    }
    if (!isLt2M) {
      this.$message.error("上传头像图片大小不能超过 2MB!");
    }
    return isJPG && isLt2M;
  }

  modifyPwd() {
    this.$refs.form.validate((valid) => {
      if (valid) {
        let token = Cookies.get("token");
        let formdata = new FormData();
        let oldPass = this.$md5(this.form.oldPass);
        let newPass = this.$md5(this.form.newPass);
        formdata.append("userId", this.ruleForm.id);
        formdata.append("oldPass", oldPass);
        formdata.append("newPass", newPass);
        axios({
          url: "http://localhost:8000/api/admin-user/updatePass",
          method: "post",
          data: formdata,
          headers: { Authorization: token },
        }).then((res) => {
          console.log(res);
          if (res.data.code == 200) {
            this.dialogFormVisible = false; //dialog对话窗口关闭
            this.$message.success("修改成功,3秒后跳转到登录页！");
            setTimeout(() => {
              this.logout(); //调用跳转到登陆页的方法
            }, 3000);
          } else {
            this.$message({
              message: res.msg,
              type: "error",
            });
            // this.status = -1;
          }
        });
      }
    });
  } //修改成功后重新返回登陆页

  created() {
    console.log(this.$md5("123456"));
  }

  async logout() {
    this.$router.push(`/login`);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/style/mixin.scss";
.container {
  width: 600px;
  margin: auto;
  padding-top: 10px;
  @media screen and (max-width: 800px) {
    width: 100%;
  }
  .head-img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    &:hover {
      transform: rotate(666turn);
      transition-duration: 59s;
      transition-timing-function: cubic-bezier(0.34, 0, 0.84, 1);
    }
    @media screen and (max-width: 500px) {
      width: 100px;
      height: 100px;
    }
  }

  .img-btn {
    margin-top: -10px;
    margin-left: 220px;
    @media screen and (max-width: 500px) {
      margin-top: -100px;
      margin-left: 300px;
    }
  }
  .changeimg-btn {
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: -220px;
  }
}
</style>
