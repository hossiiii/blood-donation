const sym = require("symbol-sdk");
Buffer = require("buffer").Buffer;
const axios = require("axios");

(async() =>{
    const userPrivateKey = process.argv[2]; //ユーザーの秘密鍵
    const adminPublicKey = process.argv[3]; //管理者の公開鍵
    const signedHash = process.argv[4]; //署名済みトランザクションのハッシュ
    let signedPayload = process.argv[5]; //署名済みトランザケションのペイロード
    const NODE = "https://sym-test-04.opening-line.jp:3001"
    
    //Symbolに必要なパラメータ
    const repo = new sym.RepositoryFactoryHttp(NODE);
    const txRepo = repo.createTransactionRepository();
    const nwRepo = repo.createNetworkRepository();
    const epochAdjustment = 1667250467;
    const generationHash = "49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4";
    const networkType = 152;
    
    const newAddress = sym.Account.createFromPrivateKey(
        userPrivateKey,
        networkType
    );
    
    const tx = sym.TransactionMapping.createFromPayload(signedPayload);
    console.log(tx);
    
    const res = tx.signer.verifySignature(
        tx.getSigningBytes([...Buffer.from(signedPayload,'hex')],[...Buffer.from(generationHash,'hex')]),
        tx.signature
    );
    console.log(res);
    
    const bobSignedTx = sym.CosignatureTransaction.signTransactionPayload(newAddress, signedPayload, generationHash);
    const bobSignedTxSignature = bobSignedTx.signature;
    const bobSignedTxSignerPublicKey = bobSignedTx.signerPublicKey;
    
    const cosignSignedTxs = [
        new sym.CosignatureSignedTransaction(signedHash,bobSignedTxSignature,bobSignedTxSignerPublicKey)
    ];
    const recreatedTx = sym.TransactionMapping.createFromPayload(signedPayload);
    
    cosignSignedTxs.forEach((cosignedTx) => {
        signedPayload += cosignedTx.version.toHex() + cosignedTx.signerPublicKey + cosignedTx.signature;
    });
    
    const size = `00000000${(signedPayload.length / 2).toString(16)}`;
    const formatedSize = size.substr(size.length - 8, size.length);
    const littleEndianSize = formatedSize.substr(6, 2) + formatedSize.substr(4, 2) + formatedSize.substr(2, 2) + formatedSize.substr(0, 2);
    signedPayload = littleEndianSize + signedPayload.substr(8, signedPayload.length - 8);
    const signedTx = new sym.SignedTransaction(signedPayload, signedHash, adminPublicKey, recreatedTx.type, recreatedTx.networkType);
    
    await txRepo.announce(signedTx).toPromise();
    console.log(signedTx);
})();