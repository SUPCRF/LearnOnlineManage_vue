<template>
  <div>
    <div class="dormitory">
      <div class="searchWord">
        <el-button type="primary" class="add-btn" @click="addFormVisible = true"
          >添加课程</el-button
        >
        <el-dialog title="添加课程" :visible.sync="addFormVisible">
          <el-form :model="form">
            <el-form-item label="课程名称" :label-width="formLabelWidth">
              <el-input v-model="form.coursename" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="课程描述" :label-width="formLabelWidth">
              <el-input
                type="textarea"
                v-model="form.title"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <el-upload
            class="upload"
            ref="upload"
            action="string"
            :file-list="fileList"
            :auto-upload="false"
            :http-request="uploadFile"
            :on-change="handleChange"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-progress="progressA"
            multiple="multiple"
          >
            <el-button slot="trigger" size="small" type="primary"
              >上传课程视频</el-button
            >
            <el-button slot="trigger" size="small" type="primary"
              >上传课程封面</el-button
            >
            <el-button
              style="margin-left: 10px"
              size="small"
              type="success"
              @click="submitUpload"
              >确定</el-button
            >
          </el-upload>
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
          <el-table-column label="课程名称" prop="courseName"></el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-tag type="primary" effect="dark" v-if="scope.row.state == 0"
                >良好</el-tag
              >
              <el-tag type="danger" effect="dark" v-if="scope.row.state == 1"
                >删除</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="创建者" prop="userName"></el-table-column>
          <el-table-column label="视频Url" prop="courseUrl"></el-table-column>
          <el-table-column label="描述" prop="title"></el-table-column>
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
                v-if="scope.row.state == 0"
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
                >删除</el-button
              >
              <el-button
                v-if="scope.row.state == 1"
                size="mini"
                type="primary"
                @click="handleStart(scope.$index, scope.row)"
                >恢复</el-button
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
        <el-dialog title="内容" width="70%" :visible.sync="modifFormVisible">
          <el-form :model="modifform">
            <el-form-item label="课程名称" :label-width="formLabelWidth">
              <el-input
                v-model="modifform.coursename"
                autocomplete="off"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item label="课程描述" :label-width="formLabelWidth">
              <el-input
                type="textarea"
                v-model="modifform.title"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="modifFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="modify()">确 定</el-button>
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
  title: "课程管理",
  icon: "el-icon-s-order",
  name: "课程总览",
})
@Component()
export default class Index extends Vue {
  data() {
    return {
      modifform: {
        coursename: "",
        title: "",
      },
      addFormVisible: false,
      blogFlag: "",
      form: {
        coursename: "",
        title: "",
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
      rules: {
        typename: [
          { required: true, message: "请输入4字", trigger: "blur" },
          { min: 4, max: 4, message: "长度为4个字符", trigger: "blur" },
        ],
      },
      newForm: {},
      fileList: [],
      multiple: true,
      formData: "",
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
  handleChange(file, fileList) {
    this.fileList = fileList;
  }
  uploadFile(file) {
    this.formData.append("file", file.file);
  }
  handleRemove(file, fileList) {
    console.log(file, fileList);
  }
  handlePreview(file) {
    console.log(file);
  }
  submitUpload() {
    console.log(this.form.coursename);
    console.log(this.form.title);
    console.log(this.$store.state.userInfo.id);
    let formData = new FormData();
    let token = Cookies.get("token");
    formData.append("coursename", this.form.coursename);
    formData.append("userid", this.$store.state.userInfo.id);
    formData.append("usertype", "admin");
    formData.append("title", this.form.title);
    formData.append("video", this.fileList[0].raw);
    formData.append("coursepic", this.fileList[1].raw);

    axios({
      url: "http://localhost:8000/api/course/save",
      method: "post",
      data: formData,
      headers: {
        Authorization: token,
      },
      // onUploadProgress: (progressEvent) => {
      //   let num = ((progressEvent.loaded / progressEvent.total) * 100) | 0; //百分比
      //   this.fileList.onProgress({ percent: num }); //进度条
      // },
    }).then((res) => {
      console.log(res);
      if (res.data.code == 200) {
        console.log(res);
        // this.fileList.onSuccess();
        this.$message.success("success");
        this.addFormVisible = false; //dialog对话窗口关闭
        location.reload();
      } else {
        this.$message({
          message: res.msg,
          type: "error",
        });
      }
    });
  }

  /**     文件正在上传时的钩子    **/
  progressA(event, file) {}
  /**     移除上传文件    **/
  handleRemove(file) {
    this.$refs.upload.abort(); //取消上传
    this.$message({ message: "成功移除" + file.name, type: "success" });
  }

  getInfo() {
    let _this = this;
    let token = Cookies.get("token");
    axios({
      url: "http://localhost:8000/api/course/all",
      method: "get",
      headers: { Authorization: token },
    }).then((res) => {
      console.log(res);
      if (res.data.code == 200) {
        // console.log("ok");
        console.log(res.data.data);
        this.resData.dormitory = res.data.data;
        this.bodyData = res.data.data;
        console.log(this.resData.dormitory);
      }
    });
  }

  //修改密码
  add() {
    let token = Cookies.get("token");
    let userid = this;
    let formdata = new FormData();
    formdata.append("username", this.form.username);
    formdata.append("sex", sex);
    formdata.append("phone", this.form.phone);
    formdata.append("email", this.form.email);
  }
  /* 操作--打开修改对话框 */
  handleEdit(index, row) {
    console.log(index + "   " + JSON.stringify(row));
    console.log(row.courseName);
    this.modifform.coursename = row.courseName;
    this.modifform.title = row.title;
    this.modifFormVisible = true;
  }

  /* 修改当前列的内容 */
  modify() {
    console.log(this.modifform.coursename);
    console.log(this.modifform.title);
    let coursename = this.modifform.coursename;
    let title = this.modifform.title;
    let token = Cookies.get("token");
    let formdata = new FormData();
    formdata.append("coursename", coursename);
    formdata.append("title", title);
    console.log(formdata);
    axios({
      url: "http://localhost:8000/api/course/modif",
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
            message: "成功！",
          });
          this.modifFormVisible = false;
          location.reload();
        } else if (res.data.code == 202) {
          this.$message({
            type: "error",
            message: "错误！",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleStart(index, row) {
    this.$confirm("是否恢复？", "确定恢复", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        let coursename = row.courseName;
        console.log(row.courseName);
        let token = Cookies.get("token");
        let formdata = new FormData();
        formdata.append("coursename", coursename);
        console.log(formdata);
        axios({
          url: "http://localhost:8000/api/course/start",
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
                message: "恢复成功！",
              });
              location.reload();
            } else if (res.data.code == 202) {
              this.$message({
                type: "error",
                message: "无法恢复！",
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
          message: "已取消恢复",
        });
      });
  }

  /* 操作--删除 */
  handleDelete(index, row) {
    this.$confirm("是否删除？", "确定删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        let coursename = row.courseName;
        console.log(row.courseName);
        let token = Cookies.get("token");
        let formdata = new FormData();
        formdata.append("coursename", coursename);
        console.log(formdata);
        axios({
          url: "http://localhost:8000/api/course/delete",
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
                message: "删除成功！",
              });
              location.reload();
            } else if (res.data.code == 202) {
              this.$message({
                type: "error",
                message: "无法删除！",
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
          message: "已取消删除",
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