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
import url from './url'
import { post, get, patch, put, deleted } from './http'
import { reviseParam } from './util'
import qs from 'qs'

//login
export function login(data, code, token) {
    return post({
        url: `${url.ORG_LIST}/account/login?checkCode=${code}`,
        // url: `${url.ORG_LIST}/account/login`,
        method: 'post',
        data: qs.stringify(data),
        headers: {
            'Content-Type': "application/x-www-form-urlencoded",
            'token': token
        }
    })
}

export function getPictureCheckCode() {
    return get({
        url: `${url.ORG_LIST}/account/pictureCheckCode`,
        method: 'get'
    })
}

//init change passWord
export function resetPassword(data) {
    return put({
        url: `${url.ORG_LIST}/account/passwordUpdate`,
        method: 'put',
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getGeneral  params  (required) channelId
export function getGeneral (data) {
    return get({
        url: `${url.ORG_LIST}/channel/general/${data}`,
        method: "get",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getBlockNumber    params(required)   chainnelId blockNumber 
export function getBlockDetail (data,list) {
    const params = reviseParam(data, list);
    return get({
        url: `${url.ORG_LIST}/block/blockNumber/${params.str}`,
        method: 'get',
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }  
    })
}

//getBlockList   params (required)   chainnelId pageNumber pageSize
export function  getBlockList (data,list) {
    const params = reviseParam(data, list);
    return get({
        url: `${url.ORG_LIST}/block/blockList/${params.str}`,
        method: 'get',
        params: params.querys,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//delete front params (required)  frontId
export function  deleteFront (data) {
    return deleted({
        url: `${url.ORG_LIST}/front/${data}`,
        method: 'delete',
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getFrontList   params frontId channelId

export function getFrontList (data) {
    return get({
        url: `${url.ORG_LIST}/front/frontList`,
        method: "get",
        params: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//addFront   params (required) frontInfo

export function addFront (data) {
    return post({
        url: `${url.ORG_LIST}/front/new`,
        method: "post",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}


//getPeer params  (required) peerId

export function getPeer (data) {
    return get({
        url: `${url.ORG_LIST}/peer/peerInfo/${data}`,
        method: "get",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getPeerList   params  (required)  channelId pageNumber PageSize  /  peerName

export function getPeerList (data,list) {
    const params = reviseParam(data, list);
    return get({
        url: `${url.ORG_LIST}/peer/peerList/${params.str}`,
        method: 'get',
        params: params.querys,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getTransactionList  params (required) channelId pageNumber pageSize  /  transactionHash blockNumber

export function getTransactionList (data,list) {
    const params = reviseParam(data, list);
    return get({
        url: `${url.ORG_LIST}/transaction/transList/${params.str}`,
        method: 'get',
        params: params.querys,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getTransactionDetail   params (required) channelId txId

export function getTransactionDetail (data,list) {
    const params = reviseParam(data, list);
    return get({
        url: `${url.ORG_LIST}/transaction/detail/${params.str}`,
        method: 'get',
        params: params.querys,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getChannelList 
export function getChannelList () {
    return get({
        url: `${url.ORG_LIST}/channel/all`,
        method: "get",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getTransactionDaily  params (required) channelId

export function getTransactionDaily (data) {
    return get({
        url: `${url.ORG_LIST}/transaction/transDaily/${data}`,
        method: "get",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}
 //addAccount params (required) info
export function addAccount (data) {
    return post ({
        url: `${url.ORG_LIST}/account/accountInfo`,
        method: "post",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//deleteAccount params (reqiured) account
export function deleteAccount (data) {
    return deleted ({
        url: `${url.ORG_LIST}/account/${data}`,
        method: "delete",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getAccountList params (reqiured) pageNumber,pageSize   /  account
export function getAccountList (data,list) {
    const params = reviseParam(data, list);
    return get({
        url: `${url.ORG_LIST}/account/accountList/${params.str}`,
        method: 'get',
        params: params.querys,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}


//updateAccountInfo  params (reqiured) info 
export function updateAccountInfo (data) {
    return put({
        url: `${url.ORG_LIST}/account/accountInfo`,
        method: "put",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//roleList    params (reqiured) pageNumber,pageSize,roleId,roleName
export function roleList (data,list) {
    const params = reviseParam(data, list);
    return get({
        url: `${url.ORG_LIST}/role/roleList/${params.str}`,
        method: "get",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//loginOut 
export function loginOut () {
    return get({
        url: `${url.ORG_LIST}/account/logout`,
        method: "get",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getChainCodeList params (reqiured) channelId pageNumber pageSize
export function getChainCodeList (data) {
    return post ({
        url: `${url.ORG_LIST}/chainCode/chainCodeList`,
        method: "post",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}


//addChainCode  params (reqiured) channelId chainCodeName chainCodesource
export function addChainCode (data) {
    return post ({
        url: `${url.ORG_LIST}/chainCode`,
        method: "post",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//updateChainCode  params (reqiured) channelId chainCodeId chainCodeSource
export function updateChainCode (data) {
    return put ({
        url: `${url.ORG_LIST}/chainCode/update`,
        method: "put",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//deleteChainCode   params (required) channelId chainCodeId
export function deleteChainCode (data,list) {
    const params = reviseParam(data, list);
    return deleted ({
        url: `${url.ORG_LIST}/chainCode/${params.str}`,
        method: "delete",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//deployChainCode   params (required) chainCodeName,chainCodePk,chainCodeSource,chainCodeVersion,channelId,initParams
export function deployChainCode (data) {
    return post ({
        url: `${url.ORG_LIST}/chainCode/deploy`,
        method: "post",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//sendTransaction 
export function sendTransaction (data) {
    return post ({
        url: `${url.ORG_LIST}/chainCode/transaction`,
        method: "post",
        data: data,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getPerformanceConfig
export function getPerformanceConfig (data) {
    return get ({
        url: `${url.ORG_LIST}/performance/config/${data}`,
        method: "get",
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}

//getPerformanceRatio
export function getPerformanceRatio (data,list) {
    return get ({
        url: `${url.ORG_LIST}/performance/ratio/${data}`,
        method: "get",
        params: list,
        headers: {
            Authorization: "Token " + localStorage.getItem("token") || ""
        }
    })
}