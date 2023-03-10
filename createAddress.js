const sym = require("symbol-sdk");
const NODE = "https://sym-test-04.opening-line.jp:3001"

//Symbolに必要なパラメータ
const repo = new sym.RepositoryFactoryHttp(NODE);
const txRepo = repo.createTransactionRepository();
const nwRepo = repo.createNetworkRepository();
const epochAdjustment = 1667250467;
const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";
const networkType = 152;

const newAddress = sym.Account.generateNewAccount(networkType);

console.log(`address ${newAddress.address.plain()}`)
console.log(`publickey ${newAddress.publicKey}`)
console.log(`prevatekey ${newAddress.privateKey}`)
console.log(`https://testnet.symbol.fyi/accounts/${newAddress.address.plain()}`)
