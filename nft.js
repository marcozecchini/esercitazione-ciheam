const Web3 = require('web3');
const NFT_CIHEAM = require('./contracts/MyCIHEAMToken.json')
const acc = require('./account.json');

const web3 = new Web3(new Web3.providers.HttpProvider('http://0.0.0.0:22000'));

const account = web3.eth.accounts.decrypt(acc, "");
console.log("User address: " + account.address);

const wallet = web3.eth.accounts.wallet.add(account);


function main(){
    NFT_Contract = new web3.eth.Contract(NFT_CIHEAM.abi, NFT_CIHEAM.address);
    web3.eth.getTransactionCount(account.address).then((nonce) => {
        console.log(nonce+1);
        const newReq =  NFT_Contract.methods.mint(account.address, nonce+1, web3.utils.sha3(nonce.toString()));
        /**
         * Manda una nuova transazione
         */
        newReq.estimateGas({from: account.address}).then((gas)=> {
            console.log(`Gas previsto: ${gas}`);
            newReq.send({from: account.address, gas: gas}).
            once('transactionHash', txhash => {
                console.log(`Mining newSend transaction ...`);
                console.log(`Transaction hash: ${txhash}`);
            }).then((r) => {
                /**
                 * Invoca una funzione che non aggiorna lo stato
                 */
                let readReq = NFT_Contract.methods.tokenURI(nonce+1);
                readReq.call().then(r => {
                    console.log(`I metadati salvati nell'NFT sono: ${r}`);
                })
            });
        });
    });
    
}

main()