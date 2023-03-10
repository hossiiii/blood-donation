const sym = require("symbol-sdk");
const arg = process.argv[2]

const NODE = "https://sym-test-04.opening-line.jp:3001"

//Symbolに必要なパラメータ
const repo = new sym.RepositoryFactoryHttp(NODE);
const txRepo = repo.createTransactionRepository();
const nwRepo = repo.createNetworkRepository();
const epochAdjustment = 1667250467;
const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";
const networkType = 152;

const newAddress = sym.Account.generateNewAccount(networkType);

console.log("= このアドレスにMOSAIC×4作成（200XYM）と手数料分以上のXYMを以下の方法で入金して下さい =")
console.log("")
console.log(newAddress.address.plain())
console.log("")
if(arg == "main") console.log("社内の誰かにXYMを送ってもらって下さい。")
if(arg == "test") console.log("このURLから入金して下さい。")
if(arg == "test") console.log(`https://testnet.symbol.tools/?recipient=${newAddress.address.plain()}`)
console.log("")
console.log("= これが秘密鍵になります。以下用途で使用し、用途が終わったらローカルに保存しないで下さい =")
console.log("")
console.log(newAddress.privateKey)
console.log("")
console.log("= 1. 環境構築の次の工程でMOSAICを作成する時 =")
console.log("= 2. AzureFunctionsで呼び出すためKeyVaultに保管する時 =")
console.log("")