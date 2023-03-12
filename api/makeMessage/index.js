module.exports = async function (context, req) {
  const sym = require("symbol-sdk");

  //関数実行時の引数
  const userPublicKey = (req.query.userPublicKey || (req.body && req.body.userPublicKey));
  const bloodAddressPlain = (req.query.bloodAddressPlain || (req.body && req.body.bloodAddressPlain));
  const action = (req.query.action || (req.body && req.body.action));
  const message = (req.query.message || (req.body && req.body.message));

  context.log({userPublicKey})
  context.log({bloodAddressPlain})
  context.log({action})
  context.log({message})
    
  const adminPrivateKey = "1E5EB2611CB54E75B3BEB3B66185CDA6E5EAAEB005B6AB7E05DD24AB5E08B1D9"; //管理者の暗号鍵はkeyvoltにあり、Functionsの環境変数として登録している。
  const NODE = "https://sym-test-04.opening-line.jp:3001"

  //Symbolに必要なパラメータ
  const repo = new sym.RepositoryFactoryHttp(NODE);
  const txRepo = repo.createTransactionRepository();
  const nwRepo = repo.createNetworkRepository();
  const metaRepo = repo.createMetadataRepository();
  const mosaicRepo = repo.createMosaicRepository();
  const metaService = new sym.MetadataTransactionService(metaRepo);
  const nsRepo = repo.createNamespaceRepository();
  const epochAdjustment = 1667250467;
  const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";
  const networkType = 152;

  //新規アカウントオブジェクトの作成  
  const newAccount = sym.PublicAccount.createFromPublicKey(userPublicKey,networkType);

  //新規アカウントオブジェクトの作成  
  const bloodAccount = sym.Address.createFromRawAddress(bloodAddressPlain,networkType);

  //管理者アカウントオブジェクトの作成
  const admin = sym.Account.createFromPrivateKey(
    adminPrivateKey,
    networkType
  );
  
  //ここでuserのメタ情報を取得する
  const scopedMetadataKeyName = sym.KeyGenerator.generateUInt64Key("blood-donation-name").toHex()
  const metadataEntriesName = await metaRepo.search({
      targetAddress:newAccount.address,
      metadataType: sym.MetadataType.Account,
      scopedMetadataKey: scopedMetadataKeyName,
      pageNumber: 1,
      pageSize: 1
  }).toPromise()
  console.log(metadataEntriesName.data[0].metadataEntry.value)
  const name = metadataEntriesName.data[0].metadataEntry.value

  const scopedMetadataKeyRole = sym.KeyGenerator.generateUInt64Key("blood-donation-role").toHex()
  const metadataEntriesRole = await metaRepo.search({
      targetAddress:newAccount.address,
      metadataType: sym.MetadataType.Account,
      scopedMetadataKey: scopedMetadataKeyRole,
      pageNumber: 1,
      pageSize: 1
  }).toPromise()
  console.log(metadataEntriesRole.data[0].metadataEntry.value)
  const role = metadataEntriesRole.data[0].metadataEntry.value

  //ここにuserのblood-donation-nameをメッセージに埋め込む処理を書く
  const innerTx1 = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    bloodAccount,
    [],
    sym.PlainMessage.create(name),
    networkType
  )

  //ここにuserのblood-donation-roleをメッセージに埋め込む処理を書く
  const innerTx2 = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    bloodAccount,
    [],
    sym.PlainMessage.create(action),
    networkType
  )

  //管理者用のダミートランザクションの作成
  const innerTx3 = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    admin.address,
    [],
    sym.EmptyMessage,
    networkType
  )

  const aggregateArray = [
    innerTx1.toAggregate(newAccount),
    innerTx2.toAggregate(newAccount),
    innerTx3.toAggregate(admin.publicAccount),
  ]

  const aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    aggregateArray,
    networkType,[]
  ).setMaxFeeForAggregate(100, 1); // 第二引数に連署者の数:1
  
  const signedTx =  admin.sign(aggregateTx,generationHash);
  const signedHash = signedTx.hash;
  const signedPayload = signedTx.payload;

  context.res = {
    status: 200,
    body: {
      "result": "OK",
      "data":{
        "userPublicKey": userPublicKey,
        "bloodAddressPlain": bloodAddressPlain,
        "name": name,
        "role": role,        
        "action": action,        
        "message": message,        
        "signedHash": signedHash,
        "signedPayload": signedPayload        
        }
      },
    contentType: 'application/json'
  };
  return
}