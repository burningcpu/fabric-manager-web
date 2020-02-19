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
        <el-dialog title="发送交易" :visible.sync="dialogVisible" :before-close="modelClose" class="dialog-wrapper" width="433px" :center="true">
            <div>
                <el-form :model="sendForm" :rules="rules" ref="sendForm" label-width="100px" class="demo-ruleForm">
                    <el-form-item label="方法名称" prop="funcName" >
                        <el-input v-model="sendForm.funcName" style="width: 210px;"></el-input>
                    </el-form-item>
                    <el-form-item label="方法对象" prop="funcObj" >
                        <el-input v-model="sendForm.funcObj" style="width: 210px;"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="modelClose">取 消</el-button>
                <el-button type="primary" @click="submit('sendForm')" v-loading="loading">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { sendTransaction } from "@/util/api"
import errcode from "@/util/errcode";
export default {
    name: "addFile",
    props: ['show','data','id'],
    data: function(){
        return {
            dialogVisible: this.show,
            sendForm: {
                funcName: "",
                chainCodeVersion: ""
            },
            disabled: false,
            folderId: this.id,
            loading: false,
            rules: {
               funcName: [
                    {
                        required: true,
                        message: "请输入方法名称",
                        trigger: "blur"
                    },
                    {
                        min: 1,
                        max: 32,
                        message: "长度在 1 到 32 个字符",
                        trigger: "blur"
                    }
               ],
               funcObj: [
                    {
                        required: true,
                        message: "请输入方法对象",
                        trigger: "blur"
                    },
               ] 
            },
            options: [],
        }
    },
    methods: {
        submit: function(formName){
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let data = {
                        // chainCodeName: this.data.chainCodeName,
                        chainCodePk: this.data.chainCodePk,
                        chainCodeId: this.data.chainCodeId,
                        methodName: this.sendForm.funcName,
                        channelId: localStorage.getItem("channelId")
                    }
                    let arry = this.sendForm.funcObj.split(",");
                    data.methodParams = arry
                    this.sendData(data)
                }else{
                    return false
                }
            })
        },
        modelClose: function(){
            this.$emit("close")
        },
        sendData: function (data) {
            this.loading = true
            let reqData = data
            sendTransaction(reqData).then(res => {
                this.loading = false
                if (res.data.code === 0) {
                        this.$message({
                            type: "success",
                            message: '发送交易成功'
                        });
                    this.$emit('success',res.data.data)
                } else {
                    this.$message({
                        type: "error",
                        message: errcode.errCode[res.data.code].cn
                    });
                }
            })
                .catch(err => {
                    this.loading = false
                    this.$message({
                        type: "error",
                        message: "系统错误！"
                    });
                    this.$message.closeAll()
                });
        },
    }
}
</script>

