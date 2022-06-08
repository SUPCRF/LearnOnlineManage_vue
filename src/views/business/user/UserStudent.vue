<template>
  <div>
    <div class="dormitory">
      <div class="searchWord">
        <el-button type="primary" class="add-btn" @click="addFormVisible = true"
          >添加用户</el-button
        >
        <el-dialog title="添加用户" :visible.sync="addFormVisible">
          <el-form :model="form">
            <el-form-item label="用户名" :label-width="formLabelWidth">
              <el-input v-model="form.username" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="性别" :label-width="formLabelWidth">
              <el-input v-model="form.sex" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="手机" :label-width="formLabelWidth">
              <el-input v-model="form.phone" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" :label-width="formLabelWidth">
              <el-input v-model="form.email" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="add()">确 定</el-button>
          </div>
        </el-dialog>

        <el-autocomplete
          class="inline-input"
          v-model="search"
          :fetch-suggestions="querySearch"
          placeholder="请输入搜索内容"
          prefix-icon="el-icon-search"
          :trigger-on-focus="false"
          @select="handleSelect"
        ></el-autocomplete>
      </div>

      <div class="dormitoryData">
        <el-table
          ref="table"
          :data="
            tables.slice((currentPage - 1) * pageSize, currentPage * pageSize)
          "
          tooltip-effect="dark"
          stripe
          border
          style="width: 100%"
          max-height="500"
          :key="sTable"
          :header-cell-style="headClass"
          :cell-style="rowClass"
        >
          <el-table-column fixed type="selection" width="45"></el-table-column>
          <el-table-column
            label="序号"
            type="index"
            width="65"
          ></el-table-column>
          <el-table-column label="用户名" prop="username"></el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-tag type="primary" effect="dark" v-if="scope.row.state == 0"
                >启用</el-tag
              >
              <el-tag type="danger" effect="dark" v-if="scope.row.state == 1"
                >停用</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            label="性别"
            prop="sex"
            :formatter="functionsex"
            width="60"
          ></el-table-column>
          <el-table-column label="手机" prop="phone"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="出生日期" prop="birth"></el-table-column>
          <el-table-column label="创建时间" prop="createTime"></el-table-column>
          <el-table-column label="更新时间" prop="updateTime"></el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="primary"
                v-if="scope.row.state == 1"
                @click="handleStart(scope.$index, scope.row)"
                >启用</el-button
              >
              <el-button
                size="mini"
                type="danger"
                v-if="scope.row.state == 0"
                @click="handleDelete(scope.$index, scope.row)"
                >停用</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 15px">
          <el-pagination
            align="center"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[1, 5, 10, 20]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="resData.dormitory.length"
          >
          </el-pagination>
        </div>
        <el-dialog title="编辑内容" :visible.sync="modifFormVisible">
          <el-form
            ref="modifForm"
            :model="modifForm"
            :rules="rules"
            label-position="left"
            label-width="90px"
          >
            <el-form-item label="用户名" :label-width="formLabelWidth">
              <el-input
                v-model="modifForm.username"
                autocomplete="off"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item label="性别" :label-width="formLabelWidth">
              <el-input
                v-model="modifForm.sex"
                autocomplete="off"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item label="手机" :label-width="formLabelWidth">
              <el-input v-model="modifForm.phone" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" :label-width="formLabelWidth">
              <el-input v-model="modifForm.email" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="modifFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="modifyUser()">确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { Vue, Component, Watch } from "vue-property-decorator";
import { Meta } from "ea-router";
import axios from "axios";
import Cookies from "js-cookie";

@Meta({
  title: "用户管理",
  icon: "el-icon-user-solid",
  name: "学生用户",
})
@Component()
export default class Index extends Vue {
  data() {
    return {
      addFormVisible: false,
      form: {
        username: "",
        sex: "",
        phone: "",
        email: "",
      },
      formLabelWidth: "80px",
      sTable: 1,
      currentPage: 1, // 当前页码
      total: 20, // 总条数
      pageSize: 5, // 每页的数据条数
      bodyData: [],
      restaurants: [],
      resData: {
        code: 1,
        dormitory: [],
      },
      search: "",
      modifFormVisible: false,
      modifForm: {
        username: "",
        sex: "",
        phone: "",
        email: "",
      },
      rules: {
        typename: [
          { required: true, message: "请输入4字", trigger: "blur" },
          { min: 4, max: 4, message: "长度为4个字符", trigger: "blur" },
        ],
      },
      newForm: {},
    };
  }

  @Watch()
  tableLoading() {
    ++this.sTable;
  }

  mounted() {
    this.getInfo();
    this.getEdit();

    this.restaurants = this.loadAll();
  }

  functionsex(row, column) {
    return row.sex == "1" ? "女" : row.sex == "0" ? "男" : "保密";
  }

  getInfo() {
    let _this = this;
    let token = Cookies.get("token");
    axios({
      url: "http://localhost:8000/api/student-user/all",
      method: "get",
      headers: { Authorization: token },
    }).then((res) => {
      console.log(res);
      if (res.data.code == 200) {
        console.log(res.data.data);
        this.resData.dormitory = res.data.data;
        this.bodyData = res.data.data;
        console.log(this.resData.dormitory);
      }
    });
  }

  add() {
    let token = Cookies.get("token");
    let formdata = new FormData();
    formdata.append("username", this.form.username);
    let sex = 0;
    if (this.form.sex === "女") {
      sex = 1;
    }
    formdata.append("sex", sex);
    formdata.append("phone", this.form.phone);
    formdata.append("email", this.form.email);
    axios({
      url: "http://localhost:8000/api/student-user/save",
      method: "post",
      data: formdata,
      headers: { Authorization: token },
    }).then((res) => {
      console.log(res);
      if (res.data.code == 200) {
        console.log(res);
        this.addFormVisible = false; //dialog对话窗口关闭
        this.$message.success("ok");
        location.reload();
      } else {
        this.$message({
          message: res.msg,
          type: "error",
        });
      }
    });
  }

  /* 操作--打开修改对话框 */
  handleEdit(index, row) {
    console.log(index + "   " + JSON.stringify(row));
    this.modifForm.index = index + (this.currentPage - 1) * this.pageSize;
    this.modifForm.username = row.username; // 当前行的typename
    if (row.sex === "1") {
      this.modifForm.sex = "女";
    } else {
      this.modifForm.sex = "男";
    }
    this.modifForm.phone = row.phone;
    this.modifForm.email = row.email;
    this.modifFormVisible = true;
  }

  /* 修改当前列的内容 */
  modifyUser() {
    console.log(this.modifForm.username);
    console.log(this.modifForm.sex);
    console.log(this.modifForm.phone);
    console.log(this.modifForm.email);

    let token = Cookies.get("token");
    let formdata = new FormData();
    formdata.append("username", this.modifForm.username);
    formdata.append("phone", this.modifForm.phone)
    formdata.append("email", this.modifForm.email)
    console.log(formdata);
    axios({
      url: "http://localhost:8000/api/student-user/modif",
      method: "post",
      data: formdata,
      headers: { Authorization: token },
    })
      .then((res) => {
        console.log();
        console.log(res);
        if (res.data.code == 200) {
          console.log(res);
          this.modifFormVisible = false;
          this.$message({
            type: "success",
            message: "编辑成功！",
          });
          location.reload();
        } else if (res.data.code == 202) {
          this.$message({
            type: "error",
            message: "无法编辑！",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleStart(index, row) {
    this.$confirm("是否启用？", "确定启用", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        let username = row.username;
        console.log(row.username);
        let token = Cookies.get("token");
        let formdata = new FormData();
        formdata.append("username", username);
        console.log(formdata);
        axios({
          url: "http://localhost:8000/api/student-user/start",
          method: "post",
          data: formdata,
          headers: { Authorization: token },
        })
          .then((res) => {
            console.log();
            console.log(res);
            if (res.data.code == 200) {
              console.log(res);
              this.$message({
                type: "success",
                message: "启用成功！",
              });
              location.reload();
            } else if (res.data.code == 202) {
              this.$message({
                type: "error",
                message: "无法启用！",
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch(() => {
        this.$message({
          type: "info",
          message: "已取消启用",
        });
      });
  }

  /* 操作--删除 */
  handleDelete(index, row) {
    this.$confirm("是否停用？", "确定停用", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        let username = row.username;
        console.log(row.username);
        let token = Cookies.get("token");
        let formdata = new FormData();
        formdata.append("username", username);
        console.log(formdata);
        axios({
          url: "http://localhost:8000/api/student-user/delete",
          method: "post",
          data: formdata,
          headers: { Authorization: token },
        })
          .then((res) => {
            console.log();
            console.log(res);
            if (res.data.code == 200) {
              console.log(res);
              this.$message({
                type: "success",
                message: "停用成功！",
              });
              location.reload();
            } else if (res.data.code == 202) {
              this.$message({
                type: "error",
                message: "无法停用！",
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch(() => {
        this.$message({
          type: "info",
          message: "已取消停用",
        });
      });
  }

  // 模糊搜索
  get tables() {
    const search = this.search;
    if (search) {
      // filter() 方法创建一个新的数组，新数组中的元素是通过检查指定数组中符合条件的所有元素。
      // 注意： filter() 不会对空数组进行检测。
      // 注意： filter() 不会改变原始数组。
      return this.bodyData.filter((data) => {
        // some() 方法用于检测数组中的元素是否满足指定条件;
        // some() 方法会依次执行数组的每个元素：
        // 如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测;
        // 如果没有满足条件的元素，则返回false。
        // 注意： some() 不会对空数组进行检测。
        // 注意： some() 不会改变原始数组。
        return Object.keys(data).some((key) => {
          for (const index in this.bodyData) {
            if (this.bodyData[index].checked) {
              this.$nextTick(() => {
                this.$refs.table.toggleRowSelection(this.bodyData[index], true);
              });
            }
          }
          // indexOf() 返回某个指定的字符在某个字符串中首次出现的位置，如果没有找到就返回-1；
          // 该方法对大小写敏感！所以之前需要toLowerCase()方法将所有查询到内容变为小写。
          return String(data[key]).toLowerCase().indexOf(search) > -1;
        });
      });
    }
    for (const index in this.bodyData) {
      if (this.bodyData[index].checked) {
        this.$nextTick(() => {
          this.$refs.table.toggleRowSelection(this.bodyData[index], true);
        });
      }
    }
    return this.bodyData;
  }

  getEdit() {
    // 模拟后台返回数据赋值
    this.bodyData = this.resData.dormitory;
    // 根据数据字段设置选中状态
    for (const index in this.bodyData) {
      if (this.bodyData[index].checked) {
        this.$nextTick(() => {
          this.$refs.table.toggleRowSelection(this.bodyData[index], true);
        });
      }
    }
  }

  headClass() {
    //表头居中显示
    return "text-align:center";
  }

  rowClass() {
    //表格数据居中显示
    return "text-align:center";
  }

  //每页条数改变时触发 选择一页显示多少行
  handleSizeChange(val) {
    console.log(`每页 ${val} 条`);
    this.currentPage = 1;
    this.pageSize = val;
  }
  //当前页改变时触发 跳转其他页
  handleCurrentChange(val) {
    console.log(`当前页: ${val}`);
    this.currentPage = val;
  }

  querySearch(queryString, cb) {
    var restaurants = this.restaurants;
    var results = queryString
      ? restaurants.filter(this.createFilter(queryString))
      : restaurants;
    // 调用 callback 返回建议列表的数据
    cb(results);
  }
  createFilter(queryString) {
    return (restaurant) => {
      return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      );
    };
  }
  loadAll() {
    return [{ value: "三", address: "长" }];
  }
  handleSelect(item) {
    console.log(item);
  }
}
</script>

<style>
.searchWord {
  margin-bottom: 10px;
}
.searchWord {
  position: relative;
}
.add-btn {
  position: absolute;
  left: 2px;
}
.inline-input {
  width: 500px;
}
</style>