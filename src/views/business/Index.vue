<template>
  <div>
    <el-row :gutter="20" class="mgb20">
      <el-col :span="6">
        <el-card>
          <div class="grid-content">
            <div class="grid-content-center">
              <div
                style="font-size: 30px; font-weight: bold; margin-bottom: 5px"
              >
                {{ teacherCount }}
              </div>
              <div>教 师 数 量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="grid-content">
            <div class="grid-content-center">
              <div
                style="font-size: 30px; font-weight: bold; margin-bottom: 5px"
              >
                {{ studentCount }}
              </div>
              <div>学 生 数 量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="grid-content">
            <div class="grid-content-center">
              <div
                style="font-size: 30px; font-weight: bold; margin-bottom: 5px"
              >
                {{ courseCount }}
              </div>
              <div>课 程 数 量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="grid-content">
            <div class="grid-content-center">
              <div
                style="font-size: 30px; font-weight: bold; margin-bottom: 5px"
              >
                {{ blogCount }}
              </div>
              <div>博 客 数 量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mgb20">
      <el-col :span="12">
        <div
          id="main-1"
          style="width: 100%; height: 400px; background-color: white"
        ></div>
      </el-col>
      <el-col :span="12">
        <div
          id="main-2"
          style="width: 100%; height: 400px; background-color: white"
        ></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import { Meta } from "ea-router";
import axios from "axios";
import Cookies from "js-cookie";

@Meta({
  title: "首页",
  icon: "el-icon-s-home",
})
@Component
export default class Index extends Vue {
  data() {
    return {
      teacherCount: 0,
      studentCount: 0,
      courseCount: 0,
      blogCount: 0,
    };
  }

  created() {
    this.getCount();
  }

  mounted() {
    // this.getCount();
    this.Echarts1();
    this.Echarts2();
  }

  updated() {
    this.Echarts1();
    this.Echarts2();
  }

  

  getCount() {
    let token = Cookies.get("token");
    axios({
      url: "http://localhost:8000/api/common/counts",
      method: "get",
      headers: { Authorization: token },
    }).then((res) => {
      if (res.data.code == 200) {
        console.log(res.data.data);
        this.teacherCount = res.data.data.teacher;
        this.studentCount = res.data.data.student;
        this.courseCount = res.data.data.course;
        this.blogCount = res.data.data.blog;
      } else {
        this.$message({
          message: res.msg,
          type: "error",
        });
      }
    });
  }

  Echarts1() {
    // 基于准备好的dom，初始化echarts实例
    let myChart = this.$echarts.init(document.getElementById("main-1"));
    console.log(this.teacherCount);

    // 指定图表的配置项和数据
    let option = {
      title: {
        text: "用户比例",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "访问来源",
          type: "pie",
          radius: "50%",
          data: [
            { value: this.teacherCount, name: "教师" },
            { value: this.studentCount, name: "学生" },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
  }

  Echarts2() {
    // 基于准备好的dom，初始化echarts实例
    let myChart = this.$echarts.init(document.getElementById("main-2"));

    // 指定图表的配置项和数据
    let option = {
      tooltip: {
        trigger: "item",
      },
      legend: {
        top: "5%",
        left: "center",
      },
      series: [
        {
          name: "课程博客比例",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "40",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: this.courseCount, name: "课程" },
            { value: this.blogCount, name: "博客" },
          ],
        },
      ],
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
  }
}
</script>

<style scoped>
/* @import "../../assets/style/main.css"; */
.mgb20 {
  margin-bottom: 20px;
}
.grid-content {
  display: flex;
  align-items: center;
  height: 50px;
}
.grid-content-center {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: darkgray;
}
</style>