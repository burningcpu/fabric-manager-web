/*
 * Copyright 2014-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
    <div>
        <v-content-head :headTitle="'系统监控'" :headSubTitle="'主机监控'" @changGroup="changGroup"></v-content-head>
        <div class="module-wrapper">
            <div class="search-nodes-list">
                <div class="serch-nodes">
                    <span>节点</span>
                    <el-select v-model="nodeId" @change="changeNodes" style="width: 220px;">
                        <el-option v-for="item in nodesOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="more-search-table" style="padding-top:10px;">
                <div class="search-item">
                    <span>显示日期</span>
                    <el-date-picker v-model="currentDate" type="date" placeholder="选择日期" :picker-options="pickerOption" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd" :default-value="`${Date()}`" class=" select-32" @change="changeCurrentDate">
                    </el-date-picker>
                </div>
                <div class="search-item">
                    <span>对比日期</span>
                    <el-date-picker v-model="contrastDate" type="date" placeholder="选择日期" :picker-options="pickerOption" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd" class=" select-32" @change="changeContrastDate">
                    </el-date-picker>
                </div>
                <div class="search-item">
                    <span>起止时间</span>
                    <el-time-picker is-range v-model="startEndTime" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" class="time-select-32">
                    </el-time-picker>
                </div>
                <div class="search-item">
                    <span>数据粒度</span>
                    <el-radio-group v-model="timeGranularity">
                        <el-radio :label="60">5分钟</el-radio>
                        <el-radio :label="12">1分钟</el-radio>
                        <el-radio :label="1">5秒钟</el-radio>
                    </el-radio-group>
                    <el-button type="primary" @click="confirmParam()" size="small" style="margin-left: 12px;" :loading="sureing">确认</el-button>
                </div>
            </div>
            <div class="metric-content">
                <div class="metric-split-line"></div>
                <el-row v-loading="loadingInit">
                    <template v-for="item in metricData">
                        <el-col :xs='24' :sm="24" :md="24" :lg="12" :xl="12">
                            <v-metric-chart :chartOption="item" :reload="reloadNum" v-loading="loading"></v-metric-chart>
                        </el-col>
                    </template>
                </el-row>
            </div>
        </div>

    </div>
</template>
<script>
import contentHead from "@/components/contentHead";
import metricChart from "@/components/metricChart";
import { metricInfo, nodesHealth, getFronts } from "@/util/api";
import { format, numberFormat,formatData } from "@/util/util.js";
import errcode from "@/util/errcode";
export default {
    name: "hostMetric",
    components: {
        "v-content-head": contentHead,
        "v-metric-chart": metricChart
    },
    watch: {
        $route: function() {
            this.nodeId = this.$root.$route.query.nodeId;
        }
    },
    data() {
        return {
            sureing: false,
            loading: false,
            loadingInit: false,
            visibleNodesList: false,
            currentDate: format(new Date().getTime(), "yyyy-MM-dd"),
            contrastDate: null,
            startEndTime: [
                new Date(formatData()),
                new Date()
            ],
            timeGranularity: 60,
            pickerOption: {
                disabledDate(time) {
                    return time.getTime() > Date.now() - 8.64e6;
                }
            },
            chartParam: {
                gap: 60,
                beginDate: `${format(
                    new Date().getTime(),
                    "yyyy-MM-dd"
                )}T${format(
                    new Date(formatData()).getTime(),
                    "HH:mm:ss"
                )}`,
                endDate: `${format(
                    new Date().getTime(),
                    "yyyy-MM-dd"
                )}T${format(new Date().getTime(), "HH:mm:ss")}`,
                contrastBeginDate: "",
                contrastEndDate: "",
                groupId: localStorage.getItem('groupId') ? localStorage.getItem('groupId') : '1'
            },
            reloadNum: 1,
            metricData: [],
            nodesOptions: [],
            nodeId: this.$root.$route.query.nodeId || ""
        };
    },
    mounted() {
        this.getFrontTable();
    },
    methods: {
        changGroup(){
            this.getFrontTable()
        },
        changeNodes() {
            this.confirmParam();
        },
        getFrontTable() {
            getFronts({})
                .then(res => {
                    if (res.data.code === 0) {
                        if(res.data.totalCount !=0) {
                            this.nodesOptions = res.data.data.map(item => {
                                return {
                                    value: item.frontId,
                                    label: item.frontIp
                                };
                            });
                            if (this.nodeId) {
                                this.confirmParam();
                            } else {
                                this.nodeId = this.nodesOptions[0]["value"];
                                this.confirmParam();
                            }
                        }else {
                            this.$message({
                                message: "添加前置信息",
                                type: "error",
                                duration: 2500
                            })
                        }
                        
                    } else {
                        this.$message({
                            message: errcode.errCode[res.data.code].cn,
                            type: "error",
                            duration: 2000
                        });
                    }
                })
                .catch(err => {
                    this.$message({
                        message: "查询失败！",
                        type: "error",
                        duration: 2000
                    });
                });
        },
        changeCurrentDate($event) {
            this.startEndTime = [
                new Date(formatData()),
                new Date()
            ];
        },
        changeContrastDate($event) {},
        getChartData() {
            if (this.reloadNum === 1) {
                this.loadingInit = true;
            }
            this.loading = true;
            this.sureing = true;
            var reqData = {
                    nodeId: this.nodeId
                },
                reqQurey = {};
            reqQurey = this.chartParam;
            metricInfo(reqData, reqQurey)
                .then(res => {
                    this.loadingInit = false;
                    this.loading = false;
                    this.sureing = false;
                    if (res.data.code === 0) {
                        var data = res.data.data;
                        if (
                            data[0]["data"]["lineDataList"]["timestampList"]
                                .length > 0
                        ) {
                            var timestampList =
                                data[0]["data"]["lineDataList"][
                                    "timestampList"
                                ] || [];
                        } else {
                            var timestampList =
                                data[0]["data"]["contrastDataList"][
                                    "timestampList"
                                ] || [];
                        }
                        this.metricData = data;
                        this.metricData.forEach(item => {
                            item.gap = this.timeGranularity;
                            if (item.metricType === "cpu") {
                                item.metricName = "cpu";
                                item.metricUint = "利用率";
                                item.metricU = "%";
                            } else if (item.metricType === "memory") {
                                item.metricName = "内存";
                                item.metricUint = "利用率";
                                item.metricU = "%";
                            } else if (item.metricType === "disk") {
                                item.metricName = "硬盘";
                                item.metricUint = "利用率";
                                item.metricU = "%";
                            } else if (item.metricType === "txbps") {
                                item.metricName = "上行";
                                item.metricUint = "带宽";
                                item.metricU = "KB/s";
                            } else if (item.metricType === "rxbps") {
                                item.metricName = "下行";
                                item.metricUint = "带宽";
                                item.metricU = "KB/s";
                            }
                            if(this.chartParam.contrastBeginDate){
                                item.data.contrastDataList.contractDataShow = true
                            }else{
                                item.data.contrastDataList.contractDataShow = false
                            }
                            item.data.contrastDataList.timestampList = timestampList;
                            item.data.lineDataList.timestampList = timestampList;
                        });
                        this.reloadNum++;
                    } else {
                        this.metricData = [];
                        this.$message({
                            type: "error",
                            message: this.errcode.errCode[res.data.code].cn
                        });
                    }
                })
                .catch(err => {
                    this.$message({
                        type: "error",
                        message:
                            this.errcode.errCode[err.data.code].cn || "系统错误"
                    });
                });
        },
        confirmParam() {
            this.timeParam();
            this.getChartData();
        },
        timeParam() {
            let initStartTime = format(
                    new Date(this.startEndTime[0]).getTime(),
                    "HH:mm:ss"
                ),
                initEndTime = format(
                    new Date(this.startEndTime[1]).getTime(),
                    "HH:mm:ss"
                );
            if (this.currentDate) {
                this.beginDate = `${this.currentDate}T${initStartTime}`;
                this.endDate = `${this.currentDate}T${initEndTime}`;
            }
            if (this.currentDate && this.contrastDate) {
                this.beginDate = `${this.currentDate}T${initStartTime}`;
                this.endDate = `${this.currentDate}T${initEndTime}`;
                this.contrastBeginDate = `${this
                    .contrastDate}T${initStartTime}`;
                this.contrastEndDate = `${this.contrastDate}T${initEndTime}`;
            }
            if (!this.contrastDate) {
                this.beginDate = `${this.currentDate}T${initStartTime}`;
                this.endDate = `${this.currentDate}T${initEndTime}`;
                this.contrastBeginDate = "";
                this.contrastEndDate = "";
            }
            this.chartParam.beginDate = this.beginDate;
            this.chartParam.endDate = this.endDate;
            this.chartParam.contrastBeginDate = this.contrastBeginDate;
            this.chartParam.contrastEndDate = this.contrastEndDate;
            this.chartParam.gap = this.timeGranularity;
            this.chartParam.groupId = localStorage.getItem('groupId') ? localStorage.getItem('groupId') : '1';
        }
    }
};
</script>
<style scoped>
.serch-nodes {
    display: inline-block;
    margin-left: 58px;
    margin-top: 29px;
}
.serch-nodes > span {
    margin-right: 5px;
}
.serch-nodes /deep/ .el-input__inner {
    height: 32px;
    line-height: 32px;
}
.serch-nodes /deep/ .el-input__icon {
    line-height: 32px;
}
.search-item {
    display: inline-block;
    margin-bottom: 8px;
    margin-right: 12px;
}
.search-item > span {
    margin-right: 5px;
}
.metric-content {
    min-height: 700px;
}
.metric-split-line {
    margin: 0 30px;
    border-top: 2px dashed #f6f6f6;
}
</style>
