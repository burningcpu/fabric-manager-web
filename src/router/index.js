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
import Vue from 'vue'
import Router from 'vue-router'
import { getCookie } from '@/util/util'

const main = resolve => require(['@/views/index/main'], resolve);
const home = resolve => require(['@/views/home/home'], resolve);
const blockInfo = resolve => require(['@/views/blockInfo/blockInfo'], resolve);
const transactionInfo = resolve => require(['@/views/transactionInfo/transactionInfo'], resolve);
const front = resolve => require(['@/views/front/front'], resolve);
const hostDetail = resolve => require(['@/views/front/components/hostDetail'], resolve);
const contract = resolve => require(['@/views/chaincode/contract'], resolve);
const oldContract = resolve => require(['@/views/chaincode/oldContract'], resolve)
const rivateKeyManagement = resolve => require(['@/views/rivateKeyManagement/rivateKeyManagement'], resolve);
// const errorLogExport = resolve => require(['@/views/errorLogExport/errorLogExport'], resolve);
const hostMetric = resolve => require(['@/views/hostMetric'], resolve);
const nodesMetric = resolve => require(['@/views/nodesMetric'], resolve);
const accountInfo = resolve => require(['@/views/account/accountInfo'], resolve);
const transactionCharts = resolve => require(['@/views/transactionCharts/transactionCharts'], resolve);
// const unusualUser = resolve => require(['@/views/unusualUser/unusualUser'], resolve);
// const unusualContract = resolve => require(['@/views/unusualContract/unusualContract'], resolve);
// const authorManagement = resolve => require(['@/views/authorManagement'], resolve); 
// const certificate = resolve => require(['@/views/certificate'], resolve); 
// const permission = resolve => require(['@/views/permission'], resolve);
// const configManagement = resolve => require(['@/views/configManagement'], resolve);
// const cnsManagement = resolve => require(['@/views/cnsManagement'], resolve);
// const CRUDServiceManagement = resolve => require(['@/views/CRUDServiceManagement'], resolve);
// const emailAlarm = resolve => require(['@/views/alarm/emailAlarm'], resolve); 
// const emailAlarmType = resolve => require(['@/views/alarm/emailAlarmType'], resolve); 
Vue.use(Router);
const routes = [
    {
        path: '/',
        redirect: '/main',
    },
    {
        path: '/login',
        name: 'login',
        component: resolve => require(['@/views/login/login'], resolve),
    },
    {
        path: '/main',
        name: 'main',
        // redirect: '/home',
        leaf: true,
        menuShow: true,
        iconCls: 'wbs-icon-gailan sidebar-icon',
        component: main,
        children: [
            {
                path: '/home', component: home, name: '数据概览', menuShow: true, meta: { requireAuth: true }
            }
        ]
    },
    {
        path: '/',
        component: main,
        name: '区块浏览',
        menuShow: false,
        iconCls: 'wbs-icon-overview sidebar-icon',
        children: [
            { path: '/blockInfo', component: blockInfo, name: '区块信息', menuShow: true, meta: { requireAuth: true } },
            { path: '/transactionInfo', component: transactionInfo, name: '交易信息', menuShow: true, meta: { requireAuth: true } },
        ]
    },
    
    {
        path: '/',
        component: main,
        name: '链码管理',
        leaf: true,
        menuShow: true,
        iconCls: 'wbs-icon-heyueguanli sidebar-icon',
        children: [
            { path: '/contract', component: contract, name: '链码IDE', menuShow: true, meta: { requireAuth: true } }
        ]
    },
    {
        path: '/',
        component: main,
        name: '节点管理',
        leaf: true,
        menuShow: true,
        iconCls: 'wbs-icon-group sidebar-icon',
        children: [
            { path: '/front', component: front, name: '节点管理', menuShow: true, meta: { requireAuth: true } },
            { path: '/hostDetail', component: hostDetail, name: '节点详情', menuShow: true, meta: { requireAuth: true } }
        ]
    },
    {
        path: '/',
        component: main,
        name: '帐号管理',
        leaf: true,
        menuShow: false,
        iconCls: 'wbs-icon-key sidebar-icon',
        children: [
            { path: '/accountInfo', component: accountInfo, name: '帐号管理', menuShow: true, meta: { requireAuth: true } }
        ]
    },
    // {
    //     path: '/',
    //     component: main,
    //     name: '私钥管理',
    //     leaf: true,
    //     menuShow: true,
    //     iconCls: 'wbs-icon-lock sidebar-icon',
    //     children: [
    //         { path: '/privateKeyManagement', component: rivateKeyManagement, name: '私钥管理', menuShow: true, meta: { requireAuth: true } }
    //     ]
    // },
    
    // {
    //     path: '/',
    //     component: main,
    //     name: '系统监控',
    //     menuShow: true,
    //     iconCls: 'wbs-icon-monitor sidebar-icon',
    //     children: [
    //         // { path: '/errorLogExport', component: errorLogExport, name: '错误日志', menuShow: true, meta: { requireAuth: true } },
    //         { path: '/nodesMetric', component: nodesMetric, name: '节点监控', menuShow: true, meta: { requireAuth: false } },
    //         { path: '/hostMetric', component: hostMetric, name: '主机监控', menuShow: true, meta: { requireAuth: false } },
    //         { path: '/emailAlarm', component: emailAlarm, name: '邮件告警配置', menuShow: true, meta: { requireAuth: false } },
    //         { path: '/emailAlarmType', component: emailAlarmType, name: '告警类型配置', menuShow: true, meta: { requireAuth: false } },
    //     ]
    // },
    
    // {
    //     path: '/',
    //     component: main,
    //     name: '告警配置',
    //     menuShow: true,
    //     iconCls: 'wbs-icon-monitor sidebar-icon',
    //     children: [
    //         { path: '/emailAlarm', component: emailAlarm, name: '邮件告警配置', menuShow: true, meta: { requireAuth: false } },
    //         { path: '/emailAlarmType', component: emailAlarmType, name: '告警类型配置', menuShow: true, meta: { requireAuth: false } },
    //     ]
    // },
    
]
const router = new Router({
    routes
});
router.onError((error) => {
    const pattern = /Loading chunk (\d)+ failed/g;
    const isChunkLoadFailed = error.message.match(pattern);
    const targetPath = router.history.pending.fullPath;
    if (isChunkLoadFailed) {
        router.go(0);
        router.replace(targetPath);
    }
});

export default router
