const sym = require("symbol-sdk");
const WebSocket = require('ws');
const arg1 = process.argv[2]
const arg2 = process.argv[3]

//引数からテストネットかメインネットかを判断し、参照するプロパティを変更する
let properties_path = ""
if(arg1 == null){
  console.log("第一引数に test もしくは main を指定して下さい")
  return
}else if(arg1 == "main"){
  properties_path = "../properties/mainNetProperties";
}else if(arg1 == "test"){
  properties_path = "../properties/testNetProperties";
}else{
  console.log("引数に test もしくは main を指定して下さい")
  return
}

if(arg2 == null){
  console.log("第二引数に事前に作成した秘密鍵を指定して下さい")
  return
}

const NODE = "https://sym-test-04.opening-line.jp:3001"

//Symbolに必要なパラメータ
const repo = new sym.RepositoryFactoryHttp(NODE);
const txRepo = repo.createTransactionRepository();
const nwRepo = repo.createNetworkRepository();
const epochAdjustment = 1667250467;
const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";
const networkType = 152;

//トランザクション通知後の監視用エンドポイント
const wsEndpoint = NODE.replace('http', 'ws') + "/ws";

(async() =>{
  admin = sym.Account.createFromPrivateKey(
    arg2,
    networkType
  );
  
  isSupplyMutable = false;
  isTransferable = false;
  isRestrictable = false;
  isRevokable = false;
  
  nonce = sym.MosaicNonce.createRandom();
  mosaicDefTx = sym.MosaicDefinitionTransaction.create(
      sym.Deadline.create(epochAdjustment),
      nonce,
      sym.MosaicId.createFromNonce(nonce, admin.address),
      sym.MosaicFlags.create(isSupplyMutable, isTransferable, isRestrictable, isRevokable),
      0,
      sym.UInt64.fromUint(0),
      networkType
  );
  
  mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
      sym.Deadline.create(epochAdjustment),
      mosaicDefTx.mosaicId,
      sym.MosaicSupplyChangeAction.Increase,
      sym.UInt64.fromUint(8999999999000000),
      networkType
  );
  
  aggregateArray = [
      mosaicDefTx.toAggregate(admin.publicAccount),
      mosaicChangeTx.toAggregate(admin.publicAccount),
  ]
  
  aggregateTx = sym.AggregateTransaction.createComplete(
      sym.Deadline.create(epochAdjustment),
      aggregateArray,
      networkType,[],
  ).setMaxFeeForAggregate(100, 0);

  //トランザクションをアナウンスする
  signedTx = admin.sign(aggregateTx,generationHash);
  txRepo.announce(signedTx).subscribe(x=>console.log(""));
  const transactionStatusUrl = NODE + "/transactionStatus/" + signedTx.hash

  //アナウンスしたトランザクションの監視を開始する
  const ws = new WebSocket(wsEndpoint);
  ws.onopen = function (e) {
  }
  const res =  await (()=>{
    return new Promise((resolve, reject) => {
      ws.onmessage = function (event) {
        response = JSON.parse(event.data);
        if('uid' in response){
            uid=response.uid;
            body = '{"uid":"' + uid +'","subscribe":"block"}'; //監視のセッションがノード側で切断されないように定期的にブロックを検知する設定
            transaction= '{"uid":"'+uid+'","subscribe":"unconfirmedAdded/' + admin.address.plain() + '"}' //宛先アドレスが含まれる未承認のアドレスを検知する設定
            ws.send(body);
            ws.send(transaction);
        }
        if(response.topic=='unconfirmedAdded/'+ admin.address.plain()){ //宛先アドレスが含まれる未承認のアドレスを検知した場合
          console.log("= 以下のモザイクを発行しました =")
          console.log("")
          console.log(`MosaicID: ${response.data.transaction.transactions[1].transaction.mosaicId}`)
          console.log(`Amount: ${response.data.transaction.transactions[1].transaction.delta}`)
          console.log("")
          console.log(transactionStatusUrl);
          console.log("")
          ws.close();
          resolve("OK");
        }
      }
    })
  })();
})();