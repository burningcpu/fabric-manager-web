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
    <el-dialog v-dialogDrag :title="'交易内容'" :visible.sync="editorDialog" @close="modelClose" width="650px" top="10vh">
        <div v-if='!transationData'>无数据</div>
        <div v-if='transationData' slot :style="{'height':editorHeight + 'px'}" style="overflow-y:auto">
            <json-viewer :value="transationData" :expand-depth='5' copyable></json-viewer>
        </div>
    </el-dialog>
</template>
<script>
import { getFunctionAbi } from "@/util/api"
import errcode from "@/util/errcode";
import { debuglog } from 'util';
export default {
    name: 'editor',
    props: ['data', 'show', 'input', 'editorOutput'],
    data: function () {
        return {
            editorShow: true,
            aceEditor: null,
            transationData: this.data || null,
            modePath: 'ace/mode/solidity',
            editorDialog: this.show || false,
            eventSHow: false,
            eventTitle: "还原",
            funcData: "",
            methodId: "",
            abiType: "",
            inputData: [],
            decodeData: "",
            showDecode: true,
            buttonTitle: "解码",
            typesArray: this.input,
            inputButtonShow: true,
            editorHeight: ''
        }
    },
    mounted: function () {
        this.editorHeight = document.body.offsetHeight * 0.75
    },
    methods: {
        modelClose: function () {
            this.$emit('close')
        },
    }
}
</script>
<style>
.transation-content {
    /* width:200px; */
    word-wrap: break-word;
    word-break: break-all;
}
.transation-title {
    color: #333;
}
.string-color {
    color: #42b983;
}
.null-color {
    color: #e08331;
}
.other-color {
    color: #fc1e70;
}
.input-data {
    display: inline-block;
    width: 100%;
    padding: 10px;
    max-height: 200px;
    overflow: auto;
    word-break: break-all;
    word-wrap: break-word;
    box-sizing: border-box;
}
.transation-data {
    display: inline-block;
    width: 400px;
    vertical-align: top;
}
.label {
    vertical-align: top;
    padding-right: 5px;
}
</style>


