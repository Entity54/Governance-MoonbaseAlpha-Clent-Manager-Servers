'use strict';
require('dotenv').config();
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

  
//Return a new Web3 instance. For this we need the blockchain network id
const getWeb3 = (networkID_Description) => {
    console.log(`...Setting up Web3`);
    let web3;
    
    if( networkID_Description.toLowerCase()==="moonbasealpha_socket")
    {
        web3 = new Web3(
            new Web3.providers.WebsocketProvider(process.env.MOONBASEALPHA_WSS)
        );
    }
    else if( networkID_Description.toLowerCase()==="moonbasealpha")
    {
        const provider = new HDWalletProvider(
            {
                privateKeys: [process.env.NETWORKADMIN_PRIVATEKEY],
                providerOrUrl: "https://moonbeam-alpha.api.onfinality.io/public", 
                addressIndex: 0,
                numberOfAddresses: 1,
            }
        );
        web3 =  new Web3(provider);
    }

    return web3;
   
    //provider.engine.stop();
}


const getSmartContractAbstraction = async (web3,contractArtifact) => {
    
    console.log(`...retrieving web3.eth.net.getId`);
    const networkId = await web3.eth.net.getId();

    const deployedNetwork = contractArtifact.networks[networkId];
    const contractAbstraction = new web3.eth.Contract( contractArtifact.abi, deployedNetwork && deployedNetwork.address );
    return {contractAbstraction, contractAddress: deployedNetwork.address };
};


module.exports = {
                    getWeb3,                      //returns a web3 object
                    getSmartContractAbstraction,  //returns a smart contract abstraction of the provided smart contract artifact
                  };
