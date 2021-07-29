const Web3 = require('web3');
const SimpleSale = require('./contracts/SimpleSale.json')
const NFT_CIHEAM = require('./contracts/MyCIHEAMToken.json')
const acc = require('./account.json');
const acc2 = require('./account_bidder.json');


function main() {


    const web3 = new Web3(new Web3.providers.HttpProvider('http://0.0.0.0:22000'));

    const account = web3.eth.accounts.decrypt(acc, "");
    const account2 = web3.eth.accounts.decrypt(acc, "");

    console.log("Seller address: " + account.address);
    console.log("Buyer address: " + account2.address);

    const wallet = web3.eth.accounts.wallet.add(account);
    web3.eth.accounts.wallet.add(account2);

    let SimpleSaleContract;

    
    let NFT_Contract = new web3.eth.Contract(NFT_CIHEAM.abi, NFT_CIHEAM.address);

    SimpleSaleContract = new web3.eth.Contract(SimpleSale.abi);
    SimpleSaleContract.options.data = '0x'+SimpleSale.bytecode.object;

    let newDeploy = SimpleSaleContract.deploy({arguments: [10000, 7, NFT_Contract._address]})
    
        newDeploy.send({
            from: account.address,
            gas: 70000000,
        })
        .once('transactionHash', txhash => {
            console.log(`Mining ContractCreation transaction ...`);
            console.log(`Transaction hash: ${txhash}`);
        })
        .then(function(newContractInstance) {
            SimpleSaleContract = new web3.eth.Contract(SimpleSale.abi, newContractInstance.options.address)// instance with the new contract address
            console.log(`contract address: ${SimpleSaleContract.options.address}`);
            
            const approveReq = NFT_Contract.methods.approve(SimpleSaleContract.options.address, 7);
            approveReq.estimateGas({from: account.address}).then((gas) => {
                approveReq.send({from: account.address, gas: Math.trunc(gas*(1.5))})
                .once('transactionHash', txhash => {
                    console.log(`Mining newSend transaction ...`);
                    console.log(`Transaction hash: ${txhash}`);
                }).then((r) => {
                    const newReq = SimpleSaleContract.methods.pay();
                        newReq.estimateGas({from: account2.address, value: 10000}).then((gas)=> {


                            newReq.send({from: account2.address,gas: Math.trunc(gas*(1.5)), value: 10000}).
                            once('transactionHash', txhash => {
                                console.log(`Mining Pay transaction ...`);
                                console.log(`Transaction hash: ${txhash}`);
                            }).then((r) => {
                                SimpleSaleContract.events.SaleEnded().on('data', (event) => {
                                    console.log(`Il compratore è: ${event.returnValues.winner}`);
                                    
                                });
                            });
                        });
                });
            })
            

        });
        

    }

    main()
