import {Account, Address, CosignatureSignedTransaction, CosignatureTransaction, RepositoryFactoryHttp, SignedTransaction, TransactionGroup, TransactionMapping, TransactionType} from 'symbol-sdk'

const NODE = "https://sym-test-04.opening-line.jp:3001"
const repo = new RepositoryFactoryHttp(NODE);
const networkType = 152;  
const txRepo = repo.createTransactionRepository();
const chainRepo = repo.createChainRepository();
const accountRepo = repo.createAccountRepository();
// const metaRepo = repo.createMetadataRepository();
// const nwRepo = repo.createNetworkRepository();
// const epochAdjustment = 1667250467;
const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";

export const getDateTime = (seconds:number ) :string=>{
    let timeD = Math.floor(seconds / (24 * 60 * 60));
    let timeH = Math.floor(seconds % (24 * 60 * 60) / (60 * 60)).toString();
    if (timeH.length === 1) timeH = "0" + timeH;
    let timeM = Math.floor(seconds % (24 * 60 * 60) % (60 * 60) / 60).toString();
    if (timeM.length === 1) timeM = "0" + timeM;
    let timeS = (seconds % (24 * 60 * 60) % (60 * 60) % 60).toString();
    if (timeS.length === 1) timeS = "0" + timeS;    
    let timeDMS = (timeD>0)?`${timeD} day ${timeH}:${timeM}:${timeS}`:`${timeH}:${timeM}:${timeS}`    
    return timeDMS;
};

export const createAccount = ()=>{
    const newAddress = Account.generateNewAccount(networkType);
    return {
        privateKey: newAddress.privateKey,
        publicKey: newAddress.publicKey,
        address: newAddress.address.plain()
    };
};

export const createAccountFromPrivateKey = (privateKey:string)=>{
    const newAddress = Account.createFromPrivateKey(
        privateKey,
        networkType
    );
    return {
        privateKey: newAddress.privateKey,
        publicKey: newAddress.publicKey,
        address: newAddress.address.plain()
    };
};

export const offlineSignature = async (userPrivateKey:string,signedHash:string,signedPayloadSource:string): Promise<boolean> => {
    let signedPayload = signedPayloadSource
    const adminPublicKey = "C8F1DDF9DA847FCAE15D6AC7C59FCB1D5F1B8DF36452BA596A668D7F293B8449"
    const newAddress = Account.createFromPrivateKey(
        userPrivateKey,
        networkType
    );

    const bobSignedTx = CosignatureTransaction.signTransactionPayload(newAddress, signedPayload, generationHash);
    const bobSignedTxSignature = bobSignedTx.signature;
    const bobSignedTxSignerPublicKey = bobSignedTx.signerPublicKey;
    
    const cosignSignedTxs = [
        new CosignatureSignedTransaction(signedHash,bobSignedTxSignature,bobSignedTxSignerPublicKey)
    ];
    const recreatedTx = TransactionMapping.createFromPayload(signedPayload);
    
    cosignSignedTxs.forEach((cosignedTx) => {
        signedPayload += cosignedTx.version.toHex() + cosignedTx.signerPublicKey + cosignedTx.signature;
    });
    
    const size = `00000000${(signedPayload.length / 2).toString(16)}`;
    const formatedSize = size.substr(size.length - 8, size.length);
    const littleEndianSize = formatedSize.substr(6, 2) + formatedSize.substr(4, 2) + formatedSize.substr(2, 2) + formatedSize.substr(0, 2);
    signedPayload = littleEndianSize + signedPayload.substr(8, signedPayload.length - 8);
    const signedTx = new SignedTransaction(signedPayload, signedHash, adminPublicKey, recreatedTx.type, recreatedTx.networkType);
    console.log(signedTx);
    await txRepo.announce(signedTx).toPromise();
    const repositoryFactory = new RepositoryFactoryHttp(NODE, {
        websocketUrl: `${NODE.replace('http', 'ws')}/ws`,
        websocketInjected: WebSocket
        });

    const listener = repositoryFactory.createListener();
    let isTransactionConfirmed = false;
    try {
        await txRepo.announce(signedTx).toPromise();

        listener.open().then(() => {
            listener.newBlock();
            listener.confirmed(newAddress.address, signedTx.hash)
            .subscribe(tx => {
                listener.close();
                isTransactionConfirmed = true;
            });
        });

        while (!isTransactionConfirmed) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error(error);
        return false;
    }
    return isTransactionConfirmed;
};


export const getHistory = async (list:string[]): Promise<{address: string, amount: string, history: { address:string ,name: string, action: string, seconds: number }[]}[]>  => {
    const chainInfo = await chainRepo.getChainInfo().toPromise();
    const height = chainInfo!.height.compact()
    const dictList: {address: string, amount: string, history: { address:string , name: string, action: string, seconds: number }[]}[] = [];

    for (let i = 0; i < list.length; i++) {
        const dict = {} as {address: string, amount: string, history: { address:string , name: string, action: string, seconds: number }[]};
        dict["address"] = list[i]
        const accountInfo = await accountRepo.getAccountInfo(Address.createFromRawAddress(list[i])).toPromise();
        dict["amount"] = accountInfo!.mosaics[0].amount.toString()
        const history: { address:string , name: string, action: string, seconds: number }[] = [];
        await txRepo.search({
         type:[
            TransactionType.AGGREGATE_COMPLETE,
            TransactionType.AGGREGATE_BONDED
         ],
          group: TransactionGroup.Confirmed,
          address:Address.createFromRawAddress(list[i]),
          pageSize:100
        }).toPromise().then(async(x)=>{
            for (let idx = 0; idx < x!.data.length; idx++) {
                const aggTx = await txRepo.getTransaction(x!.data[idx]!.transactionInfo?.hash!,TransactionGroup.Confirmed,).toPromise()
                // @ts-ignore
                if(aggTx!.innerTransactions[0].type === 16724){
                    const num = (height - aggTx!.transactionInfo!.height.compact())*30
                    history.push(
                        {
                            // @ts-ignore
                            address:aggTx.innerTransactions[0].signer.address.address,
                            // @ts-ignore
                            name:aggTx.innerTransactions[0].message.payload,
                            // @ts-ignore
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
    return dictList.flatMap((dict)=>dict);
};

export const getBloodList = async (userAddress:string): Promise<string[]>  => {
    const list : string[] = []
    await txRepo.search({
        type:[
           TransactionType.AGGREGATE_COMPLETE,
           TransactionType.AGGREGATE_BONDED
        ],
         group: TransactionGroup.Confirmed,
         address:Address.createFromRawAddress(userAddress),
         pageSize:100
       }).toPromise().then(async(x)=>{
           for (let idx = 0; idx < x!.data.length; idx++) {
               const aggTx = await txRepo.getTransaction(x!.data[idx]!.transactionInfo?.hash!,TransactionGroup.Confirmed,).toPromise()
               // @ts-ignore
               if(aggTx!.innerTransactions[0].type === 16724){
                // @ts-ignore
                list.push(aggTx.innerTransactions[0].recipientAddress.address)
               }
           }
       });
    return list;
};