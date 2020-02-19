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
let data = {
    "id": 1,
    "jsonrpc":"2.0",
    "result":{
        "blockHash":"0xb91a021f40f022a3351bd7cb1d319c86a10f20bcb46b75f33c1d6869b7ad7bdc",
        "blockNumber":"0x48",
        "from":"0x64fa644d2a694681bd6addd6c5e36cccd8dcdde3",
        "gas":"0x1c9c380",
        "gasPrice":"0x0",
        "hash":"0x7fdacfd98d8cbba32e4da30afe90680f5fbcf1890bc56e105dfd756c5e62d1d3",
        "input":"0x6060604052341561000c57fe5b5b61030e8061001c6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063549262ba14610046578063ebdf86ca146100df575bfe5b341561004e57fe5b610056610203565b60405180806020018281038252838181518152602001915080519060200190808383600083146100a5575b8051825260208311156100a557602082019150602081019050602083039250610081565b505050905090810190601f1680156100d15780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34156100e757fe5b61017a600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610248565b60405180806020018281038252838181518152602001915080519060200190808383600083146101c9575b8051825260208311156101c9576020820191506020810190506020830392506101a5565b505050905090810190601f1680156101f55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61020b6102ce565b604060405190810160405280600581526020017f48656c6c7000000000000000000000000000000000000000000000000000000081525090505b90565b6102506102ce565b61025a8383610263565b90505b92915050565b61026b6102ce565b6102736102ce565b6000600085516040518059106102865750595b908082528060200260200182016040525b5092506102a26102c4565b91506000600060006000600060008a8c8a8a2f90508293505b50505092915050565b6000602090505b90565b6020604051908101604052806000815250905600a165627a7a723058200234960fca3511b4f8de35f1236ca2acfdaa2f2addcfa310df4cbddbf5e85f110029",
        "nonce":"0x2149a84",
        "to":null,
        "transactionIndex":"0x0",
        "value":"0x0"
    }
};
let data2 = {
	"id":1,
	"jsonrpc":"2.0",
	"result":{
		"blockHash":"0x04db9ef778d57f0d3c3b6ddbe3cf4bc13f9e4373f5eddee4d92fa0a6f1b73d1f",
		"blockNumber":"0x64",
		"from":"0x64fa644d2a694681bd6addd6c5e36cccd8dcdde3",
		"gas":"0x1c9c380",
		"gasPrice":"0x0",
		"hash":"0x131bf57f81b82479f8bfb1363c0cdff3bf24850a411e68ced90ff221693b2b14",
		"input":"0x66c99139000000000000000000000000000000000000000000000000000000000000000f",
		"nonce":"0x49787c4",
		"to":"0x60d4ee5c461677840ab3552a6845fdf7db4a5317",
		"transactionIndex":"0x0",
		"value":"0x0"
	}
}
const STATES = {
    "0": "未保存",
    "1": "未部署",
    "2": "部署成功",
    "3": "部署失败",
};
const CODE = `package main

import (
    "fmt"
    "strconv"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    pb "github.com/hyperledger/fabric/protos/peer"
)

type LGSimpleChaincode struct {
}

func (t *LGSimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
    fmt.Println("LGSimpleChaincode -> Init")
    _, args := stub.GetFunctionAndParameters()
    var A, B string
    var Aval, Bval int
    var err error

    if len(args) != 4 {
        return shim.Error("参数数量不对")
    }

    A = args[0]
    Aval, err = strconv.Atoi(args[1])
    if err != nil {
        return shim.Error("参数值类型不对")
    }

    B = args[2]
    Bval, err = strconv.Atoi(args[3])
    if err != nil {
        return shim.Error("参数值类型不对")
    }

    err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
    if err != nil {
        return shim.Error(err.Error())
    }

    err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
    if err != nil {
        return shim.Error(err.Error())
    }

    return shim.Success(nil)
}

func (t *LGSimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
    fmt.Println("LGSimpleChaincode -> Invoke")

    function, args := stub.GetFunctionAndParameters()
    if function == "invoke" {

        return t.invoke(stub, args)
    } else if function == "delete" {

        return t.delete(stub, args)
    } else if function == "query" {

        return t.query(stub, args)
    }

    return shim.Error("方法名不对，只支持 invoke，delete，query")
}

//交易转账
func (t *LGSimpleChaincode) invoke(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    var A, B string
    var Aval, Bval int
    var X int
    var err error

    if len(args) != 3 {
        return shim.Error("参数数量不对")
    }

    A = args[0]
    B = args[1]

    Avalbytes, err := stub.GetState(A)
    if err != nil {
        return shim.Error("没找到第一个的用户金额")
    }
    if Avalbytes == nil {
        return shim.Error("第一个用户金额为nil")
    }
    Aval, _ = strconv.Atoi(string(Avalbytes))

    Bvalbytes, err := stub.GetState(B)
    if err != nil {
        return shim.Error("没找到第二个的用户金额")
    }
    if Bvalbytes == nil {
        return shim.Error("第二个用户金额为nil")
    }
    Bval, _ = strconv.Atoi(string(Bvalbytes))

    X, err = strconv.Atoi(args[2])
    if err != nil {
        return shim.Error("转账金额异常")
    }
    Aval = Aval - X
    Bval = Bval + X
    fmt.Printf("Aval = %d, Bval = %d\n", Aval, Bval)

    //重新更新用户金额
    err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
    if err != nil {
        return shim.Error(err.Error())
    }

    err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
    if err != nil {
        return shim.Error(err.Error())
    }

    return shim.Success(nil)
}

func (t *LGSimpleChaincode) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    if len(args) != 1 {
        return shim.Error("参数异常")
    }
    A := args[0]

    err := stub.DelState(A)
    if err != nil {
        return shim.Error("删除用户异常")
    }

    return shim.Success(nil)
}

func (t *LGSimpleChaincode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    var A string
    var err error

    if len(args) != 1 {
        return shim.Error("查询参数异常")
    }

    A = args[0]

    Avalbytes, err := stub.GetState(A)
    if err != nil {
        jsonResp := "{\"Error\":\"用户金额查询异常 " + A + "\"}"
        return shim.Error(jsonResp)
    }

    if Avalbytes == nil {
        jsonResp := "{\"Error\":\"用户金额为nil " + A + "\"}"
        return shim.Error(jsonResp)
    }

    jsonResp := "{\"Name\":\"" + A + "\",\"Amount\":\"" + string(Avalbytes) + "\"}"
    fmt.Printf("Query Response:%s\n", jsonResp)
    return shim.Success(Avalbytes)
}

func main() {
    err := shim.Start(new(LGSimpleChaincode))
    if err != nil {
        fmt.Printf("链码部署失败: %s", err)
    }
}
`
const COMPILE_INFO = ["<div>合约开始编译</div>","<div>合约编译中...</div>"]
export default {
    STATES,
    COMPILE_INFO,
    CODE
}
