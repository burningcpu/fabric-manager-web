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
        <el-dialog title="合约版本" :visible.sync="dialogVisible" :before-close="close" class="dialog-wrapper" width="433px" :center="true">
            <div>
                <el-form :model="folderFrom" :rules="rules" ref="folderFrom" label-width="100px" class="demo-ruleForm">
                    <el-form-item label="合约版本" prop="chainCodeVersion" >
                        <el-input v-model="folderFrom.chainCodeVersion" style="width: 210px;"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="close" >取 消</el-button>
                <el-button type="primary" @click="submit('folderFrom')">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: "selectCatalog",
    props: ['show'],
    data: function(){
        return {
            options: [],
            folderFrom: {
                chainCodeVersion: ""
            },
            rules: {
                chainCodeVersion: [
                    {
                        required: true,
                        message: "请选择文件夹",
                        trigger: "blur"
                    }
                ]
            },
            dialogVisible: this.show
        }
    },
    methods: {
        submit: function(formName){
            this.$refs[formName].validate(valid => {
                if (valid) {
                    this.$emit("success",this.folderFrom.chainCodeVersion)
                }else{
                    return false
                }
            })
        },
        close: function(){
            this.$emit("close")
        }
    }
}
</script>

