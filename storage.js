const Web3 = require('web3');
const Storage = require('./contracts/Storage.json')
const acc = require('./account.json');

const web3 = new Web3(new Web3.providers.HttpProvider('http://0.0.0.0:22000'));

const account = web3.eth.accounts.decrypt(acc, "");
console.log("User address: " + account.address);

const wallet = web3.eth.accounts.wallet.add(account);


function main(){
    StorageContract = new web3.eth.Contract(Storage.abi, Storage.address);
    const newReq =  StorageContract.methods.store(6);
    /**
     * Manda una nuova transazione
     */
    newReq.estimateGas({from: account.address}).then((gas)=> {
        newReq.send({from: account.address, gas: Math.trunc(gas*(1.5))}).
        once('transactionHash', txhash => {
            console.log(`Mining newSend transaction ...`);
            console.log(`Transaction hash: ${txhash}`);
        }).then((r) => {
            /**
             * Invoca una funzione che non aggiorna lo stato
             */
            let readReq = StorageContract.methods.retrieve();
            readReq.call().then(r => {
                console.log(r);
            })
        });
    });
}

main()