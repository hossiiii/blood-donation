const sym = require("symbol-sdk");
const NODE = "https://sym-test-04.opening-line.jp:3001"
const repo = new sym.RepositoryFactoryHttp(NODE);
const networkType = 152;

//Symbolに必要なパラメータ

const newAddress = sym.Account.generateNewAccount(networkType);
console.log(`address ${newAddress.address.plain()}`)
console.log(`publickey ${newAddress.publicKey}`)
console.log(`prevatekey ${newAddress.privateKey}`)
console.log(`https://testnet.symbol.fyi/accounts/${newAddress.address.plain()}`)
