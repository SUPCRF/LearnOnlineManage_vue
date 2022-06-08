<template>
  <div>
    <div class="dormitory">
      <div class="searchWord">
        <el-button type="primary" class="add-btn" @click="addFormVisible = true"
          >添加博客</el-button
        >
        <el-dialog width="70%" :visible.sync="addFormVisible">
          <el-form :model="form">
            <el-form-item label="博客名称" :label-width="formLabelWidth">
              <el-input v-model="form.blogname" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="博客描述" :label-width="formLabelWidth">
              <el-input
                type="textarea"
                v-model="form.title"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <mavon-editor
            v-model="content"
            :placeholder="'请编辑你的内容 ···'"
            :ishljs="true"
            :scrollStyle="true"
            ref="md"
            :toolbarsBackground="'#f9f9f9'"
            :toolbars="toolbars"
            style="height: calc(100vh - 100px); margin-bottom: 20px"
            @imgAdd="$imgAdd"
            @imgDel="$imgDel"
            @change="change"
          />

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
            multiple="multiple"
          >
            <el-button
              slot="trigger"
              size="small"
              type="primary"
              @click="delFile"
              >上传博客封面</el-button
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
          <el-table-column label="博客名称" prop="blogName"></el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-tag type="primary" effect="dark" v-if="scope.row.state == -1"
                >待审核</el-tag
              >
              <el-tag type="success" effect="dark" v-if="scope.row.state == 0"
                >已通过</el-tag
              >
              <el-tag type="danger" effect="dark" v-if="scope.row.state == 1"
                >未通过</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            label="博客ID"
            prop="blogId"
            width="80"
          ></el-table-column>
          <el-table-column label="创建者ID" prop="userId"></el-table-column>
          <el-table-column label="创建者" prop="userName"></el-table-column>
          <el-table-column label="描述" prop="title"></el-table-column>
          <el-table-column label="创建时间" prop="createTime"></el-table-column>
          <el-table-column label="更新时间" prop="updateTime"></el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)"
                >查看</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
                >删除</el-button
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
        <el-dialog width="70%" :visible.sync="modifFormVisible">
          <el-row type="flex" justify="center">
            <el-col :span="20">
              <div class="grid-content bg-purple-dark">
                <div class="mavonEditor">
                  <mavon-editor
                    v-model="show_content"
                    :subfield="false"
                    :ishljs="true"
                    :scrollStyle="true"
                    defaultOpen="preview"
                    :toolbarsFlag="false"
                    :toolbarsBackground="'#f9f9f9'"
                    style="height: calc(100vh - 50px)"
                  />
                </div>
              </div>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer">
            <el-button @click="modifFormVisible = false">取消</el-button>
            <el-button type="primary" @click="unpass()">审核不通过</el-button>
            <el-button type="primary" @click="pass()">通过审核</el-button>
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
import "highlight.js/styles/github.css";
import "mavon-editor/dist/markdown/github-markdown.min.css";
import { addCodeBtn } from "@/utils/mavon";

@Meta({
  title: "论坛管理",
  icon: "el-icon-s-platform",
  name: "博客总览",
})
@Component()
export default class Index extends Vue {
  data() {
    return {
      addFormVisible: false,
      blogFlag: "",
      form: {
        blogname: "",
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
      modifForm: {
        typename: "",
      },
      rules: {
        typename: [
          { required: true, message: "请输入4字", trigger: "blur" },
          { min: 4, max: 4, message: "长度为4个字符", trigger: "blur" },
        ],
      },
      newForm: {},
      content: "",
      show_content: "",
      html: "",
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: false, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: true, // 帮助
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        navigation: true, // 导航目录
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        subfield: true, // 单双栏模式
        preview: false, // 预览
      },
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

  $imgAdd(pos, $file) {
    // 第一步.将图片上传到服务器.
    var formdata = new FormData();
    formdata.append("image", $file);
    this.img_file[pos] = $file;
    this.$http({
      url: "/api/edit/uploadimg",
      method: "post",
      data: formdata,
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => {
      let _res = res.data;
      // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
      this.$refs.md.$img2Url(pos, _res.url);
    });
  }
  $imgDel(pos) {
    delete this.img_file[pos];
  }
  change(value, render) {
    this.html = render;
    this.$nextTick((_) => {
      addCodeBtn();
    });
  }
  // 提交
  submit() {
    console.log(this.content);
    console.log(this.html);
  }

  delFile() {
    this.fileList = [];
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
    console.log(this.form.blogname);
    console.log(this.form.title);
    console.log(this.$store.state.userInfo.id);
    let formData = new FormData();
    let token = Cookies.get("token");
    // formData.append("theme", this.theme);
    formData.append("blogname", this.form.blogname);
    formData.append("userid", this.$store.state.userInfo.id);
    formData.append("usertype", "admin");
    formData.append("title", this.form.title);
    formData.append("md", this.content);
    formData.append("html", this.html);
    formData.append("blogpic", this.fileList[0].raw);

    axios({
      url: "http://localhost:8000/api/blog/save",
      method: "post",
      data: formData,
      headers: {
        Authorization: token,
      },
    }).then((res) => {
      console.log(res);
      if (res.data.code == 200) {
        console.log(res);
        this.addFormVisible = false; //dialog对话窗口关闭
        this.$message.success("success");
        location.reload();
      } else {
        this.$message({
          message: res.msg,
          type: "error",
        });
      }
    });
  }

  getInfo() {
    let _this = this;
    let token = Cookies.get("token");
    axios({
      url: "http://localhost:8000/api/blog/all",
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
  /* 操作--打开修改对话框 */
  handleEdit(index, row) {
    console.log(index + "   " + JSON.stringify(row));
    console.log(row.blogId);
    this.blogFlag = row.blogId;
    this.modifFormVisible = true;
    console.log(row.md);
    this.show_content = row.md
  }

  pass() {
    console.log(this.blogFlag);
    let blogid = this.blogFlag;
    let token = Cookies.get("token");
    let formdata = new FormData();
    formdata.append("blogId", blogid);
    console.log(formdata);
    axios({
      url: "http://localhost:8000/api/blog/pass",
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

  unpass() {
    console.log(this.blogFlag);
    let blogid = this.blogFlag;
    let token = Cookies.get("token");
    let formdata = new FormData();
    formdata.append("blogId", blogid);
    console.log(formdata);
    axios({
      url: "http://localhost:8000/api/blog/unpass",
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

  /* 操作--删除 */
  handleDelete(index, row) {
    this.$confirm("是否删除？", "确定删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        let blogid = row.blogId;
        console.log(row.blogId);

        let token = Cookies.get("token");
        let formdata = new FormData();
        formdata.append("blogId", blogid);
        console.log(formdata);
        axios({
          url: "http://localhost:8000/api/blog/delete",
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

<style lang="scss">
.markdown-container {
  .editor-btn {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}

pre.code {
  position: relative;
  border-radius: 3px;
  border: 1px solid #c3ccd0;
  overflow: hidden;
  padding-left: 60px !important;
  code {
    line-height: 30px !important;
  }
  ol.pre-numbering {
    position: absolute;
    top: 0;
    left: 5px;
    line-height: 30px;
    padding: 16px 0;
    list-style-type: none;
    counter-reset: sectioncounter;
    margin-bottom: 0;
    li {
      margin-top: 0 !important;
      &:before {
        content: counter(sectioncounter) "";
        counter-increment: sectioncounter;
        display: inline-block;
        width: 40px;
        text-align: center;
        border-right: solid 1px rgba(0, 0, 0, 0.53);
      }
    }
  }
  i.code-copy {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #464d5e;
    padding: 3px;
    margin: 3px 3px 0 0;
    font-size: 11px;
    border-radius: inherit;
    color: #f1f1f1;
    cursor: pointer;
    display: none;
  }
  &:hover i.code-copy {
    display: block;
  }
}
</style>
