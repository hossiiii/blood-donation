const sym = require("symbol-sdk");

(async() =>{

    // var timeD = Math.floor(num / (24 * 60 * 60));
    // var timeH = Math.floor(num % (24 * 60 * 60) / (60 * 60));
    // var timeM = Math.floor(num % (24 * 60 * 60) % (60 * 60) / 60);
    // var timeS = num % (24 * 60 * 60) % (60 * 60) % 60;
    // var timeDMS = timeD + '日' + timeH + '時間' + timeM + '分' + timeS + '秒';
    // console.log(timeDMS)            

    const userAddress = process.argv[2]; //ユーザーのアドレス
    const NODE = "https://sym-test-04.opening-line.jp:3001"
    
    //Symbolに必要なパラメータ
    const repo = new sym.RepositoryFactoryHttp(NODE);
    const txRepo = repo.createTransactionRepository();
    const metaRepo = repo.createMetadataRepository();
    const accountRepo = repo.createAccountRepository();
    const chainRepo = repo.createChainRepository();

    const nwRepo = repo.createNetworkRepository();
    const epochAdjustment = 1667250467;
    const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";
    const networkType = 152;
        
    //自分が登録した血液アカウントのリストを取得する関数
    const list = []
    const scopedMetadataKeyName = sym.KeyGenerator.generateUInt64Key("blood-donation-name").toHex()
    const metadataEntriesName = await metaRepo.search({
        metadataType: sym.MetadataType.Account,
        scopedMetadataKey: scopedMetadataKeyName,
        pageNumber: 1,
        pageSize: 100
    }).toPromise()
    for (let index = 0; index < metadataEntriesName.data.length; index++) {
        if(metadataEntriesName.data[index].metadataEntry.value == userAddress) {
            list.push(metadataEntriesName.data[index].metadataEntry.targetAddress)
        }
    }

    //血液アカウントのリストを渡すとその履歴を表示させる関数
    const chainInfo = await chainRepo.getChainInfo().toPromise();
    const height = chainInfo.height.compact()
    const dictList = []

    for (let i = 0; i < list.length; i++) {
        const dict = {}
        dict["address"] = list[i].plain()
        const accountInfo = await accountRepo.getAccountInfo(list[i]).toPromise();
        dict["amount"] = accountInfo.mosaics[0].amount.toString()
        const history = []
        await txRepo.search({
         type:[
            sym.TransactionType.AGGREGATE_COMPLETE,
            sym.TransactionType.AGGREGATE_BONDED
         ],
          group: sym.TransactionGroup.Confirmed,
          address:list[i],
          pageSize:100
        }).toPromise().then(async(x)=>{
            for (let idx = 0; idx < x.data.length; idx++) {
                const aggTx = await txRepo.getTransaction(x.data[idx].transactionInfo.hash,sym.TransactionGroup.Confirmed,).toPromise();
                if(aggTx.innerTransactions[0].type === 16724){
                    const num = (height - aggTx.transactionInfo.height.compact())*30
                    history.push(
                        {
                            name:aggTx.innerTransactions[0].message.payload,
                            action:aggTx.innerTransactions[1].message.payload,
                            seconds:num
                        }    
                    )
                }
            }
            dict["history"] = history
        });
        dictList.push(dict)
    }
    console.log(dictList)
})();