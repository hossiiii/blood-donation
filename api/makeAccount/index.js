module.exports = async function (context, req) {
  const sym = require("symbol-sdk");

  //関数実行時の引数
  const transfer_amount = (req.query.transfer_amount || (req.body && req.body.transfer_amount));
  const userPublicKey = (req.query.userPublicKey || (req.body && req.body.userPublicKey));
  const role = (req.query.role || (req.body && req.body.role));
  const name = (req.query.name || (req.body && req.body.name));

  context.log({transfer_amount})
  context.log({userPublicKey})
  context.log({role})
  context.log({name})
    
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

  ///管理者アカウントオブジェクトの作成
  const admin = sym.Account.createFromPrivateKey(
    adminPrivateKey,
    networkType
  );
  
  const keyRole = sym.KeyGenerator.generateUInt64Key("blood-donation-role");
  const valueRole = role;
  const metadataRoleTx = await metaService.createAccountMetadataTransaction(
    undefined,
    networkType,
    newAccount.address, //メタデータ記録先アドレス
    keyRole,valueRole, //Key-Value値
    admin.address //メタデータ作成者アドレス
  ).toPromise();

  const keyName = sym.KeyGenerator.generateUInt64Key("blood-donation-name");
  const valueName = name;
  const metadataNameTx = await metaService.createAccountMetadataTransaction(
    undefined,
    networkType,
    newAccount.address, //メタデータ記録先アドレス
    keyName,valueName, //Key-Value値
    admin.address //メタデータ作成者アドレス
  ).toPromise();

  //指定アドレスからのみ受信可能
  // const restrictionTx = sym.AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
  //   sym.Deadline.create(epochAdjustment),
  //   sym.AddressRestrictionFlag.AllowIncomingAddress, //アドレス制限フラグ
  //   [admin.address],//設定アドレス
  //   [],//解除アドレス
  //   networkType
  // )
  
  //宛先へからモザイクを送付するトランザクションの作成
  const innerTx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    sym.Address.createFromRawAddress(newAccount.address.plain()),
    [
      new sym.Mosaic( 
          new sym.MosaicId("44F7C1A0F1491C3D"),
          sym.UInt64.fromUint(transfer_amount)
      ),
    ],
    sym.EmptyMessage,
    networkType
  )

  const aggregateArray = [
    metadataRoleTx.toAggregate(admin.publicAccount),
    metadataNameTx.toAggregate(admin.publicAccount),
    // restrictionTx.toAggregate(newAccount),
    innerTx.toAggregate(admin.publicAccount),
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
        "transfer_amount": transfer_amount,
        "userPublicKey": userPublicKey,
        "role": role,
        "name": name,
        "signedHash": signedHash,
        "signedPayload": signedPayload        
        }
      },
    contentType: 'application/json'
  };
  return
}