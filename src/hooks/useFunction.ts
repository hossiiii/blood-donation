import { RepositoryFactoryHttp, Account} from 'symbol-sdk'
const NODE = "https://sym-test-04.opening-line.jp:3001"
const repo = new RepositoryFactoryHttp(NODE);
const networkType = 152;
  
export const createAccount = ()=>{
    const newAddress = Account.generateNewAccount(networkType);
    return {
        privateKey: newAddress.privateKey,
        publicKey: newAddress.publicKey,
        address: newAddress.address.plain()
    };
};