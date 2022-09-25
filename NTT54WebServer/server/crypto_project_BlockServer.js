'use strict';
require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const {v4: uuidv4}  = require('uuid');   
const chalk = require('chalk');


const {getWeb3, getSmartContractAbstraction } = require('./web3_setup.js');
const {encrypt, decrypt}  = require('./encryption.js');   
const {query_AllAfterBlockNum}  = require('./Queries');   //PRACTICE BLOCK NUMBER 2870440



//LOAD BLOKC NUMBER TO START READING FROM
let lastUpdate_block_number = 2870440; 
let lastSavedIndexedBlockNumberRead = 2870440;

let socket = {};                                                     
const setSocket = (frontEndSocket) => { socket = frontEndSocket; };    
let _web3;
let ntt54Channels_sc, DEV;

// ****************************************************************************
const SC_NTT54_CHANNELS_ADDRESS = "0xB86f967c067d536bd995050F7806f2A7943756D9";
// ****************************************************************************

const CHANNELADMIN_PUBLICKEY = "0x329D1d285E7e7FE06303884e4Fd484b7581cFe54";

const tokenAddress = "0x0000000000000000000000000000000000000802";    //DEV
const ntt54Channels_Artifact = require('./Abis/ntt54_Channels.json');  
const ERC20_Artifact = require('./Abis/IERC20.json');  
const { dirname } = require('path');



const getSubscriberEncryptedMobileToken = async (subscriberAddress) => {
    const encryptedMobileToken = await ntt54Channels_sc.methods.getSubscriberEncryptedMobileToken(subscriberAddress).call({from: CHANNELADMIN_PUBLICKEY });
    console.log(`encryptedMobileToken:`,encryptedMobileToken);
    return encryptedMobileToken;
}

const getChannelHasPendingNotifications = async (channelId) => {
    const channelHasPendingNotifications = await ntt54Channels_sc.methods.channelHasPendingNotifications(channelId).call();
    console.log(`channelHasPendingNotifications:`,channelHasPendingNotifications);
    return channelHasPendingNotifications;
}

const getChannelOwnersList = async () => {
    const channelOwnersList = await ntt54Channels_sc.methods.getChannelOwnersList().call();
    console.log(`channelOwnersList:`,channelOwnersList);
}

const getChannelAdminOwnedChannels = async (channelAdminAdresss) => {
    const channelAdminOwnedChannels = await ntt54Channels_sc.methods.getChannelAdminOwnedChannels(channelAdminAdresss).call();
    console.log(`channelAdminOwnedChannels:`,channelAdminOwnedChannels);
}

//Read Peniding Notification from channel channelId
const getPendingNotifications = async (channelId) => {
    // const pendingNotificationsCIDs = await ntt54Channels_sc.methods.getPendingNotification(channelId).call();
    const pendingNotificationsCIDs = await ntt54Channels_sc.methods.getPendingNotification(channelId).call({from: CHANNELADMIN_PUBLICKEY });
    console.log(`pendingNotificationsCIDs: `,pendingNotificationsCIDs);
    // console.log(`pendingNotificationsCIDs[0]: `,pendingNotificationsCIDs[0]);
    // pendingNotificationsCIDs: [
    //     '085e6f03-a677-43af-b6a6-ab159fef0ec0',
    //     'eae25f75-f192-4fd9-9fa5-0b0724af5466',
    //     '0412a664-6586-4477-b686-f050bfa3c68e',
    //     '95335423-cfa4-4b26-93cb-871bedacded6',
    //     '1dbe2b10-11b3-4c42-8064-975897c431a7',
    //     '6e8a5233-dd94-4a18-9b12-b0e34ac2c107',
    //     '93597b08-ac8a-45f8-8e71-ce396023a9c7',
    //     '4ce447c1-aef0-4ba0-93fb-35d08730e2f1',
    //     '63e388d6-3832-4add-aa11-a1d36a315902',
    //     '342062a2-9d52-495c-a30d-194a4e1c5d9b',
    //     'f1fe9717-3a99-413e-af08-e28b5065e301',
    //     '1cd8610b-84e0-46cc-b85a-fd1f5cca3e81',
    //     '2e1d2b39-16ef-4caa-a83c-da4bcc42fb37',
    //     'a95bb649-2495-4502-b903-d0b49673e0a8'
    //   ]


    // socket.emit('channelSpecs',{
    //     channleAdmin: channelSpecs[0],
    //     channelCreationBlockNumber: channelSpecs[1],
    //     channelCreationTimestamp: channelSpecs[2],
    //     channelIsActive: channelSpecs[8],
    //     channleId: channelSpecs[3],
    //     channelName: channelSpecs[4],
    //     channelTicker: channelSpecs[5],
    //     channelMetadataCid: channelSpecs[6],
    //     channelSubscribersArray: channelSpecs[7],
    // });

    return pendingNotificationsCIDs;
}


//#region getChannelSpecs & tokens
const getChannelSpecs = async (channelId) => {
    const channelSpecs = await ntt54Channels_sc.methods.getChannelSpecs(channelId).call();
    // console.log(`channelSpecs:`,channelSpecs);
    const channelSpecifications = {
        channleAdmin: channelSpecs[0],
        channelCreationBlockNumber: channelSpecs[1],
        channelCreationTimestamp: channelSpecs[2],
        channleId: channelSpecs[3],
        channelName: channelSpecs[4],
        channelTicker: channelSpecs[5],
        channelMetadataCid: channelSpecs[6],
        channelSubscribersArray: channelSpecs[7],
        channelIsActive: channelSpecs[8],
    }
    // channelSpecs: [
    //     '0xB23B6b13f919455eEa94B23397CBb65FE2341e54',
    //     '2892928',
    //     '1664003256',
    //     '1',
    //     'Governance Broadcasting Channel',
    //     'GBC',
    //     'empty',
    //     [ '0xa95b7843825449DC588EC06018B48019D1111000' ],
    //     true,
    //     admin: '0xB23B6b13f919455eEa94B23397CBb65FE2341e54',
    //     creationBlockNumber: '2892928',
    //     creationTimestamp: '1664003256',
    //     id: '1',
    //     name: 'Governance Broadcasting Channel',
    //     ticker: 'GBC',
    //     metadataCid: 'empty',
    //     subscribers: [ '0xa95b7843825449DC588EC06018B48019D1111000' ],
    //     active: true
    //   ]
    console.log(chalk.cyan.inverse(`channelSpecifications:`,JSON.stringify(channelSpecifications)));
    const channelSubscribersArray = channelSpecs[7];
    let subscribers = [];
    console.log(`Starting retrieving Mobile Tokens`);

    for (let i=0; i<channelSubscribersArray.length; i++)
    {
        console.log(`Getting Mobile Token for ${channelSubscribersArray[i]} `);
        const encryptedMobileToken =  await getSubscriberEncryptedMobileToken(channelSubscribersArray[i]);
        subscribers.push({subscriber: channelSubscribersArray[i], encryptedMobileToken,});
    }

    // console.log(`Finished retrieving Mobile Tokens subscribers: `,subscribers);
    // {
    //     subscriber: '0xB9A6817688FaC3E2E0955bb9B595E119E3c1000A',
    //     encryptedMobileToken: ' something '
    // }


    socket.emit('channelSpecs',{
        channleAdmin: channelSpecs[0],
        channelCreationBlockNumber: channelSpecs[1],
        channelCreationTimestamp: channelSpecs[2],
        channelIsActive: channelSpecs[8],
        channleId: channelSpecs[3],
        channelName: channelSpecs[4],
        channelTicker: channelSpecs[5],
        channelMetadataCid: channelSpecs[6],
        channelSubscribersArray: subscribers
    });

    return {channelSpecifications, subscribers};
}
//#endregion 

// const changeChanelAdmin = async (newChannelAdmin, channelID) => {
//     if (_web3 && ntt54Channels_sc)
//     {
//         console.log("Ready To Change the Channele Admin");
//         await ntt54Channels_sc.methods.changeChannelAdmin(newChannelAdmin, channelID).send({from: CHANNELADMIN_PUBLICKEY })
//                             .on('confirmation',async (confirmationNumber, receipt) =>  {
//                                 if (confirmationNumber === 1)
//                                 {
//                                     console.log(`Transaction to channelChannelAdmin has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`); 
//                                 }
//                             });
//     }
// };



const releaseChannelNotification = async (channelId) => {
    if (_web3 && ntt54Channels_sc)
    {
        console.log("Ready releaseChannelNotification from smart contract");
        await ntt54Channels_sc.methods.releaseChannelNotification(channelId).send({from: CHANNELADMIN_PUBLICKEY })
        .on('confirmation',async (confirmationNumber, receipt) =>  {
            if (confirmationNumber === 1)
            {
                console.log(`Transaction to releaseChannelNotification  has been mined confirmationNumber: ${confirmationNumber} gasUsed: ${receipt.gasUsed}`); 
            }
        });
    }
};



let init_ntt54Channels_sc = async (network="MoonbaseAlpha") => {
    console.log(`ntt54Oracle_Artifact is initialised`);    
    _web3 = await getWeb3("MoonbaseAlpha");     

    const accounts = await _web3.eth.getAccounts();
    console.log(`ntt54Channels_Artifact => accounts: `,accounts);

    const networkId = await _web3.eth.net.getId();
    console.log(`networkId: `,networkId);

    ntt54Channels_sc = new _web3.eth.Contract( ntt54Channels_Artifact.abi, SC_NTT54_CHANNELS_ADDRESS);
    DEV = new _web3.eth.Contract( ERC20_Artifact.abi, tokenAddress);
    
    const channel_admin_balance = await DEV.methods.balanceOf(CHANNELADMIN_PUBLICKEY).call();
    console.log(`channel_admin_balance ${channel_admin_balance}`);

    const networkAdmin = await ntt54Channels_sc.methods.networkAdmin().call();
    console.log(`networkAdmin ${networkAdmin}`);
    const registredChannelAdministratorBalance = await ntt54Channels_sc.methods.getChannelAdminBalance(tokenAddress,CHANNELADMIN_PUBLICKEY).call();
    console.log(`registredChannelAdministratorBalance ${registredChannelAdministratorBalance}`);

    const ownedChannelsArray = await ntt54Channels_sc.methods.getChannelAdminOwnedChannels(CHANNELADMIN_PUBLICKEY).call();
    console.log(`ownedChannelsArray:`,ownedChannelsArray);

    await getChannelSpecs(1)
    console.log(`Got getChannelSpecs`);

    await getPendingNotifications(1);
    console.log(`Got getPendingNotifications`);

    await getChannelOwnersList();
    console.log(`Got all Owners of channels`);

    await getChannelAdminOwnedChannels("0xB23B6b13f919455eEa94B23397CBb65FE2341e54");
    console.log(`Got all Channels that acccount 0xB23B6b13f919455eEa94B23397CBb65FE2341e54 owns`);

    await getSubscriberEncryptedMobileToken("0xB9A6817688FaC3E2E0955bb9B595E119E3c1000A");
    console.log(`Got encryptedMobileToken for account 0xB9A6817688FaC3E2E0955bb9B595E119E3c1000A`);

    // await changeChanelAdmin("0xB23B6b13f919455eEa94B23397CBb65FE2341e54",1);
    // console.log(`changeChanelAdmin is DONE DONE`);
};



//#region Read Write Files (to be converted to IPFS or Arweave)
const path_LastBlockNumber = `./data/lastBlockNumber.txt` ;
const path_readNotificationsCIDs = `./data/readNotificationsCIDs.txt`; //holds all CIDs of notifications the server has already read
const path_readNotifications =  __dirname + `/data/readNotificationsCIDs.txt` ;  
const path_deliveredNotifications =  __dirname + `/data/deliveredNotifs.txt` ;  


const readJSON = (path) => {
    return new Promise((resolve,reject) => {
        fs.readFile(path,'utf8', (err, data1) => {
              if (err)
              {
                //   console.log(chalk.red.inverse(`crudJSON=>readJSON-> Error reading JSON at path: ${path} error: `,err));
                  console.log(`crudJSON=>readJSON-> Error reading JSON at path: ${path} error: `,err);
                  reject(err);
                  return;
              }  ;
              console.log(`crudJSON=>readJSON-> Success Read JSON at path: ${path}`);
              resolve(data1);
        });
    });
}

const writeToJSON = (saveFileAtPath,dataFile) => {
    return new Promise((resolve,reject) => {
        let dataArrayJSON = JSON.stringify(dataFile);
        fs.writeFile(saveFileAtPath, dataArrayJSON, (err) => {
              if (err)
              {
                //   console.log(chalk.red.inverse(`crudJSON=>readJSON-> Error reading JSON at path: ${path} error: `,err));
                  console.log(`crudJSON=>writeToJSON-> Error writing FileJSON at path: ${saveFileAtPath} error: `,err);
                  reject(err);
                  return;
              }  ;
              console.log(`crudJSON=>writeToJSON-> Success Write JSON at path: ${saveFileAtPath}`);
              resolve();
        });
    });
}


const appendToJSON = (saveFileAtPath,data) => {
    return new Promise( async (resolve,reject) => {
        const _data1 = await readJSON(saveFileAtPath);
        console.log(`_data1 ${typeof _data1} : `,_data1);
        const data1 = JSON.parse(_data1);
        const dataFile = [...data,...data1];
        const dataArrayJSON = JSON.stringify(dataFile);

        fs.writeFile(saveFileAtPath, dataArrayJSON, (err) => {
            if (err) {  console.log(chalk.red.inverse(`crudJSON=>writeinAppendToJSON-> Error writing FileJSON at path: ${saveFileAtPath} error: `,err)); throw err; }
            console.log(`crudJSON=>writeinAppendToJSON-> Success Write JSON at path: ${saveFileAtPath}`);
            resolve(true)
        });
    });
}
//#endregion 


//#region
const sendPushNotificationHandler = async (expoToken="", dataJSON) => {

    const response = await axios({
        method: 'post',
        url: 'https://exp.host/--/api/v2/push/send',
        headers: {
            'Content-Type': 'application/json',
        },
        data: dataJSON

    })
    console.log(`AXIOS REPSONSE status: ${response.status} statusText: ${response.statusText} data: ${response.data}`);

    
    //  Example for dataJSON
    // data: dataJSON

    // data: JSON.stringify({
    //     to: `ExponentPushToken[${expoToken}]`,
    //     title: 'Test sent from iPhone',
    //     body: 'This is a test that was sent from an iPhone to my Adnroid phone. Has it worked?'
    //     sound: default
    // })


    //multiple notifications to many users UP to 100 notifications
    // data: JSON.stringify(
    //     [
    //         {
    //          to: `ExponentPushToken[${expoToken}]`,
    //          title: 'Test sent from iPhone',
    //          body: 'This is a test that was sent from an iPhone to my Adnroid phone. Has it worked?'
    //         },
    //         {
    //             to: `ExponentPushToken[${expoToken}]`,
    //             title: 'Test sent from macbook',
    //             body: 'This is a test that was sent from an macbook to my Adnroid phone. Has it worked?'
    //         },
    //     ]
    // )

    return response.status;
}
//#endregion


//#region sendPushNotifications  subscribers=[{subscriber: 0x1234..1000, encryptedMobileToken,}] uniqeuPendingNotificationCIDs=[CID1, CID2]
const sendPushNotifications = async (subscribers, uniqeuPendingNotificationCIDs) => {	 
    console.log(`sendPushNotifications ==> subscribers: `,subscribers);
    if (subscribers.length===0 || uniqeuPendingNotificationCIDs.length===0) 
    {
        console.log(`No New Notifications will be sent because subscribers.length=${subscribers.length} and uniqeuPendingNotificationCIDs.length=${uniqeuPendingNotificationCIDs.length}`);
        return;
    }


    for (let j=0; j<uniqeuPendingNotificationCIDs.length; j++)
    {
        const uId = uniqeuPendingNotificationCIDs[j];
        const path_PendingNotifications =  __dirname + `/../../../NotificationCIDs/${uId}.txt` ;  //reads from Desktop
        const notifs = JSON.parse(await readJSON(path_PendingNotifications));
        console.log(`The following notification will be sent to sunscribers notifs: `,notifs);

        for (let i=0; i<subscribers.length; i++)
        {
            console.log(`Sending PUSH notification to subscriber address ${subscribers[i].subscriber} with encryptedMobileToken: ${subscribers[i].encryptedMobileToken}`);
            let deliveredNotifsArray = [], bulkotifications = [];
            for (let k=0; k<notifs.length; k++)
            {
                const notification = notifs[k];
                const deliverednotification = {subcriberAddress: subscribers[i].subscriber, subscriberToken: subscribers[i].encryptedMobileToken, ...notification};
                deliveredNotifsArray.push(deliverednotification);

                const encryptedDeviceToken = subscribers[i].encryptedMobileToken;
                const decryptedDeviceToken = decrypt(encryptedDeviceToken);
                console.log(`decryptedDeviceToken : `,decryptedDeviceToken);

                //BULK NOTIFICATIONS (up to 100 incuding other tokens)
                bulkotifications.push({
                    to: `ExponentPushToken[${decryptedDeviceToken}]`,
                    title: notification.title,
                    body: notification.body
                })

                //single notification
                // const dataJSON = JSON.stringify({
                //     to: `ExponentPushToken[${deviceToken}]`,
                //     title: notification.title,
                //     body: notification.body
                // })
                
            }
             
            //SEND PUSH
            const dataJSON = JSON.stringify(bulkotifications);
            await sendPushNotificationHandler("", dataJSON);

             
            await appendToJSON(path_deliveredNotifications,deliveredNotifsArray);
            const updatedDeliveredNotifsJSON = await readJSON(path_deliveredNotifications);
            console.log(`updatedDeliveredNotifsJSON: `,updatedDeliveredNotifsJSON);

            socket.emit('newNotificationsSubmitted',{
                        ticks : updatedDeliveredNotifsJSON,
                        createdAt: new Date().getTime()
            });

        }

    }

    return "PUSH NOTIFICATIONS SENT";
}
//#endregion sendPushNotifications






// Notification Payload Schema 
// let notificationPaylod = {
//     id
//     eventTrigger
//     blockNum
//     timestamp
//     title 
//     body
// }

// const url = 'https://api.subquery.network/sq/Entity54/MoonbaseAlphaGov' ;
// // const url = 'https://api.subquery.network/sq/Entity54/MoonbaseAlphaGovernance' ;

//#region sendGraphQLRequestFromNum
// const sendGraphQLRequestFromNum = async (blockNum="", web3) => {	 
//     console.log(`====> SENDING  A SUBQUERY sendGraphQLRequestFromNum for blockNum: ${blockNum}`);
//     let pendingNotificationsArray = [], lastBlockNumberIndexed = blockNum-1;
    
//     const query = query_AllAfterBlockNum(blockNum);
//     axios({ url: `${url}`, method: 'post', data: { query: query } })
//     .then( async (result) => {
//             // console.log("====> GRAPHQL sendRequest 4 ======> : ",result.data)
//             // console.log("====> GRAPHQL sendRequest JSON.stringify(result.data)  ======> : ",JSON.stringify(result.data))

//             //voteds
//             const voteds_dataArray = result.data.data.voteds.nodes;
//             // console.log("====> GRAPHQL voted_dataArray : ",JSON.stringify(voted_dataArray));
//             console.log(" ===========>>>>>> GRAPHQL voted_dataArray");
//             if (voteds_dataArray.length>0)
//             {
//                 voteds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.voterAccountId: ${elem.voterAccountId} elem.refIndex: ${elem.refIndex} elem.voteBalance: ${elem.voteBalance} elem.voteConvictionNum: ${elem.voteConvictionNum} elem.voteLock: ${elem.voteLock} elem.voteDirection: ${elem.voteDirection} elem.voteAye: ${elem.voteAye} elem.voteNay: ${elem.voteNay} elem.voteTypeStandard: ${elem.voteTypeStandard}  elem.extrinsicHash: ${elem.extrinsicHash}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "voted",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `New ${elem.voteDirection} Vote for referendum:${elem.refIndex}`, 
//                         body: `Account ${elem.voterAccountId} has just voted ${elem.voteDirection} for referendum ${elem.refIndex} with ${elem.voteBalance} tokens and ${elem.voteLock} conviction.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`voteds_dataArray is blank`);

//             //preImageNoteds
//             const preImageNoteds_dataArray = result.data.data.preImageNoteds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL preImageNoteds_dataArray");
//             // console.log("====> GRAPHQL preImageNoteds_dataArray : ",JSON.stringify(preImageNoteds_dataArray));
//             if (preImageNoteds_dataArray.length>0)
//             {
//                 preImageNoteds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.preImageHash: ${elem.preImageHash} elem.preImageAccountId: ${elem.preImageAccountId} elem.preImageStorageFees: ${elem.preImageStorageFees} elem.extrinsicHash: ${elem.extrinsicHash}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "preImageNoted",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `New preImage submitted`, 
//                         body: `Account ${elem.preImageAccountId} has just submitted preImage with hash ${elem.preImageHash} paying ${elem.preImageStorageFees} tokens.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`preImageNoteds_dataArray is blank`);

//             //proposeds
//             const proposeds_dataArray = result.data.data.proposeds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL proposeds_dataArray");
//             // console.log("====> GRAPHQL proposeds_dataArray : ",JSON.stringify(proposeds_dataArray));
//             if (proposeds_dataArray.length>0)
//             {
//                 proposeds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.proposalIndex: ${elem.proposalIndex} elem.proposalDeposit: ${elem.proposalDeposit} elem.proposalAccountId: ${elem.proposalAccountId} elem.extrinsicHash: ${elem.extrinsicHash}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "proposed",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `New proposal submitted`, 
//                         body: `Account ${elem.proposalAccountId} has just submitted proposal ${elem.proposalIndex} paying ${elem.proposalDeposit} tokens.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`proposeds_dataArray is blank`);


//             //secondeds
//             const secondeds_dataArray = result.data.data.secondeds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL secondeds_dataArray");
//             // console.log("====> GRAPHQL secondeds_dataArray : ",JSON.stringify(secondeds_dataArray));
//             if (secondeds_dataArray.length>0)
//             {
//                 secondeds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.proposalIndex: ${elem.proposalIndex} elem.seconderAccountId: ${elem.seconderAccountId} elem.secondedAmount: ${elem.secondedAmount} elem.extrinsicHash: ${elem.extrinsicHash}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "seconded",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Proposal ${elem.proposalIndex} has been seconded`, 
//                         body: `Account ${elem.seconderAccountId} has just endorsed proposal ${elem.proposalIndex} paying ${elem.secondedAmount} tokens.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`secondeds_dataArray is blank`);

//             //tableds
//             const tableds_dataArray = result.data.data.tableds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL tableds_dataArray");
//             // console.log("====> GRAPHQL tableds_dataArray : ",JSON.stringify(tableds_dataArray));
//             if (tableds_dataArray.length>0)
//             {
//                 tableds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.proposalIndex: ${elem.proposalIndex} elem.depositAmount: ${elem.depositAmount} elem.referendumIndex: ${elem.referendumIndex} elem.depositors: `,elem.depositors);
//                     let listOfDepositors="";
//                     elem.depositors.forEach(depositorAddress => listOfDepositors +=`${depositorAddress}, `);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "tabled",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Proposal ${elem.proposalIndex} has been tabled for referendum`, 
//                         body: `Proposal ${elem.proposalIndex} has been tabled for referendum ${elem.referendumIndex}. The proposal had ${elem.depositAmount} tokens deposited by each of the following depositors ${listOfDepositors}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`tableds_dataArray is blank`);

//             //passeds
//             const passeds_dataArray = result.data.data.passeds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL passeds_dataArray");
//             // console.log("====> GRAPHQL passeds_dataArray : ",JSON.stringify(passeds_dataArray));
//             if (passeds_dataArray.length>0)
//             {
//                 passeds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.referendumIndex: ${elem.referendumIndex} elem.scheduledEnactmentBlock: ${elem.scheduledEnactmentBlock}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "passed",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Referendum ${elem.referendumIndex} has been passed`, 
//                         body: `Referendum ${elem.referendumIndex} passed at block ${elem.blockNum} and timestamp ${elem.timestamp}. Enactment period is scheduled for block: ${elem.scheduledEnactmentBlock}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`passeds_dataArray is blank`);

//             //notPasseds
//             const notPasseds_dataArray = result.data.data.notPasseds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL notPasseds_dataArray");
//             // console.log("====> GRAPHQL notPasseds_dataArray : ",JSON.stringify(notPasseds_dataArray));
//             if (notPasseds_dataArray.length>0)
//             {
//                 notPasseds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.referendumIndex: ${elem.referendumIndex}.`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "notPassed",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Referendum ${elem.referendumIndex} has NOT been passed`, 
//                         body: `Referendum ${elem.referendumIndex} did NOT pass at block ${elem.blockNum} and timestamp ${elem.timestamp}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`notPasseds_dataArray is blank`);

//             //executeds
//             const executeds_dataArray = result.data.data.executeds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL executeds_dataArray");
//             // console.log("====> GRAPHQL executeds_dataArray : ",JSON.stringify(executeds_dataArray));
//             if (executeds_dataArray.length>0)
//             {
//                 executeds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.referendumIndex: ${elem.referendumIndex} elem.result: ${elem.result} elem.proposalHash: ${elem.proposalHash} elem.providerAccount: ${ elem.providerAccount} elem.refundedAmountString: ${elem.refundedAmountString} elem.refundedAmount: ${elem.refundedAmount}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "executed",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `PreImage of referendum ${elem.referendumIndex} has been executed`, 
//                         body: `PreImage with hash ${elem.proposalHash} of referendum ${elem.referendumIndex} has been executed. The amount of ${elem.refundedAmount} tokens will be refunded to preimage provider account: ${elem.providerAccount}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`executeds_dataArray is blank`);

//             //proposalCanceleds
//             const proposalCanceleds_dataArray = result.data.data.proposalCanceleds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL proposalCanceleds_dataArray");
//             // console.log("====> GRAPHQL proposalCanceleds_dataArray : ",JSON.stringify(proposalCanceleds_dataArray));
//             if (proposalCanceleds_dataArray.length>0)
//             {
//                 proposalCanceleds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.referendumIndex: ${elem.referendumIndex}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "proposalCanceled",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Proposal ${elem.referendumIndex} has been cancelled`, 
//                         body: `Proposal ${elem.referendumIndex} was cancelled at block ${elem.blockNum} and timestamp ${elem.timestamp}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`proposalCanceleds_dataArray is blank`);

//             //referendumCanceleds
//             const referendumCanceleds_dataArray = result.data.data.referendumCanceleds.nodes;
//             console.log(" ===========>>>>>> GRAPHQL referendumCanceleds_dataArray");
//             // console.log("====> GRAPHQL referendumCanceleds_dataArray : ",JSON.stringify(referendumCanceleds_dataArray));
//             if (referendumCanceleds_dataArray.length>0)
//             {
//                 referendumCanceleds_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.referendumIndex: ${elem.referendumIndex}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "referendumCanceled",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Referendum ${elem.referendumIndex} has been cancelled`, 
//                         body: `Referendum ${elem.referendumIndex} was cancelled at block ${elem.blockNum} and timestamp ${elem.timestamp}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`referendumCanceleds_dataArray is blank`);

//             //removeVoteCalls
//             const removeVoteCalls_dataArray = result.data.data.removeVoteCalls.nodes;
//             console.log(" ===========>>>>>> GRAPHQL removeVoteCalls_dataArray");
//             // console.log("====> GRAPHQL removeVoteCalls_dataArray : ",JSON.stringify(removeVoteCalls_dataArray));
//             if (removeVoteCalls_dataArray.length>0)
//             {
//                 removeVoteCalls_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.signerAccountId: ${elem.signerAccountId} elem.argsIndex: ${elem.argsIndex}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "removeVoteCall",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Account ${elem.signerAccountId} has removed vote`, 
//                         body: `Account ${elem.signerAccountId} removed vote from referendum ${elem.argsIndex} at block ${elem.blockNum} and timestamp ${elem.timestamp}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`removeVoteCalls_dataArray is blank`);

//             //unlockCalls
//             const unlockCalls_dataArray = result.data.data.unlockCalls.nodes;
//             console.log(" ===========>>>>>> GRAPHQL proposalCanceleds_dataArray");
//             // console.log("====> GRAPHQL unlockCalls_dataArray : ",JSON.stringify(unlockCalls_dataArray));
//             if (unlockCalls_dataArray.length>0)
//             {
//                 unlockCalls_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.signerAccountId: ${elem.signerAccountId} elem.argsTargetAccountId: ${elem.argsTargetAccountId}`);
//                     const notificationPayload = {
//                         id: elem.id,
//                         eventTrigger: "unlockCall",
//                         blockNum: elem.blockNum,
//                         timestamp: elem.timestamp,
//                         title: `Account ${elem.argsTargetAccountId} received unlocked tokens`, 
//                         body: `Account ${elem.signerAccountId} unlocked tokens for account ${elem.argsTargetAccountId} at block ${elem.blockNum} and timestamp ${elem.timestamp}.`
//                     }
//                     pendingNotificationsArray.push(notificationPayload);
//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`unlockCalls_dataArray is blank`);


//             //activeProposalsReferendaLists
//             const activeProposalsReferendaLists_dataArray = result.data.data.activeProposalsReferendaLists.nodes;
//             console.log(" ===========>>>>>> GRAPHQL activeProposalsReferendaLists_dataArray");
//             // console.log("====> GRAPHQL activeProposalsReferendaLists_dataArray : ",JSON.stringify(activeProposalsReferendaLists_dataArray));
//             if (activeProposalsReferendaLists_dataArray.length>0)
//             {
//                 activeProposalsReferendaLists_dataArray.forEach((elem) => {
//                     // console.log(`elem.id: ${elem.id} elem.blockNum: ${elem.blockNum} elem.timestamp: ${elem.timestamp} elem.now: ${elem.now} elem.lowestUnbaked: ${elem.lowestUnbaked} elem.referendumCount: ${elem.referendumCount} elem.publicPropsLength: ${elem.publicPropsLength}`);
//                     console.log(` ******************************************************************* `);
//                     console.log(` BlokcNumber: ${elem.blockNum} Timestmap: ${elem.timestamp} LowestUnbaked: ${elem.lowestUnbaked} ReferendumCount: ${elem.referendumCount} ProposalCount: ${elem.publicPropsLength}`);
//                     let referendaList = "", referendaArray=[];
//                     if (elem.referendaArray)
//                     {
//                         const referendaArray = JSON.parse(elem.referendaArray)
//                         // console.log(`|||||>>>> elem.referendaArray ${typeof referendaArray} <<<|||||: `,elem.referendaArray);
//                         const referendaHeaders = `Index\tEndBlock\tProposalHash\tEnactmentDelay\tAYES\tNAYS\tturnout\n`
//                         referendaArray.forEach(referendum => referendaList +=`${referendum.referendumIndex}\t${referendum.refrendumEndBlock}\t${referendum.refrendumProposalHash}\t${referendum.refrendumDelay}\t${web3.utils.fromWei(referendum.refrendumTally.ayes)}\t${web3.utils.fromWei(referendum.refrendumTally.nays)}\t${web3.utils.fromWei(referendum.refrendumTally.turnout)}\n`);
//                     }
//                     console.log(referendaList);

//                     let proposaList = "";
//                     if (elem.proposalList)
//                     {
//                         const proposalArray = JSON.parse(elem.proposalList)
//                         console.log(`|||||>>>> elem.proposalList ${typeof  proposalArray} : `,elem.proposalList);

//                     }
//                     console.log(`proposaList: `,proposaList);

//                     console.log(` ******************************************************************* `);

//                     lastBlockNumberIndexed = Math.max(lastBlockNumberIndexed, Number(elem.blockNum));
//                 })
//             }
//             else console.log(`activeProposalsReferendaLists_dataArray is blank`);



//             if ( lastBlockNumberIndexed>(blockNum-1)) await writeToJSON(path_LastBlockNumber, lastBlockNumberIndexed);
            
            
//             if (pendingNotificationsArray.length>0) {
//                 //SAVE pendingNotificationsArray INTO FILE
//                 const uId = uuidv4();
//                 console.log(`UUIDV4: `,uId);
//                 // const path_PendingNotifications = `./data/${uId}.txt` ;
//                 const path_PendingNotifications =  __dirname + `/../../../NotificationCIDs/${uId}.txt` ;  //saves on Desktop
//                 await writeToJSON(path_PendingNotifications, pendingNotificationsArray);


//                 socket.emit('newNotificationsSubmitted',{
//                             ticks : pendingNotificationsArray,
//                             createdAt: new Date().getTime()
//                 });

//                 //PASS FILE UNIQUE IDENTIFIER TO SMART CONTRACT
//                 await submitNotification(1, uId);
//                 console.log(chalk.cyan.inverse(`NEW NOTIFCATION FILE UUID HAS BEEN SUBMITTED TO THE SMART CONTRACT`));
                
//             }

//             return {voteds_dataArray, preImageNoteds_dataArray, proposeds_dataArray, secondeds_dataArray, tableds_dataArray, passeds_dataArray, notPasseds_dataArray, executeds_dataArray, proposalCanceleds_dataArray, referendumCanceleds_dataArray, removeVoteCalls_dataArray, unlockCalls_dataArray, activeProposalsReferendaLists_dataArray};
//     });
// };
//#endregion sendGraphQLRequestFromNum



//#region *** CRYPTO NETWORK WEB SOCKET  ****
let init_CryptoServer = async (network) => {
    const web3 = getWeb3(`moonbaseAlpha_socket`);  

    console.log(`Establishing connection with smart contract`);
    await init_ntt54Channels_sc()
    console.log(chalk.inverse.cyan(`Established connection with smart contract`));

    //Load past sent Push notification to front end
    const updatedDeliveredNotifsJSON = await readJSON(path_deliveredNotifications);
    console.log(`updatedDeliveredNotifsJSON: `,updatedDeliveredNotifsJSON);

    socket.emit('newNotificationsSubmitted',{
                ticks : updatedDeliveredNotifsJSON,
                createdAt: new Date().getTime()
    });



    console.log(chalk.yellow.inverse(`Subscribing to Blockchain Blocks for network:moonbaseAlpha ...`));
    web3.eth.subscribe('newBlockHeaders')
    .on('data', async block => {
        console.log(`MOONBASEALPHA  Block:#${block.number} block.timestamp: ${block.timestamp}`);
        
        lastSavedIndexedBlockNumberRead = Number(await readJSON(path_LastBlockNumber));
        console.log(`lastSavedIndexedBlockNumberRead: ${lastSavedIndexedBlockNumberRead}`);
        
        
        if (block.number > lastSavedIndexedBlockNumberRead ) {
            await writeToJSON(path_LastBlockNumber, block.number);
            console.log(`|||||> Time to check for PUSH notifictions`);
         
            //Step 1 READ ALL NOTIFICATIONS CIDS READ ALREADY
            const notificationCIDsAlreadyRead = JSON.parse(await readJSON(path_readNotificationsCIDs));
            console.log(` ||> Step 1 <|| notificationCIDsAlreadyRead ${notificationCIDsAlreadyRead.length}: `,notificationCIDsAlreadyRead);
           
         
            //Step 2 GET PENDING NOTIFICATIONS FROMS SMART CONTRACT FOR CHANNEL 1
            //NOTE: In  future version we could also pick up the emitted even with notification when we releaseChannelNotification in smart contract
            const pendingNotificationsCIDs = await getPendingNotifications(1);
            const channelHasPendingNotificationsSTART = await getChannelHasPendingNotifications(1); //for debugging only
            console.log(` ||> Step 2 <|| channelHasPendingNotificationsSTART: ${channelHasPendingNotificationsSTART} pendingNotificationsCIDs: `,pendingNotificationsCIDs);
        
            
            //Step 3 CHECK IF WE HAVE ALREADY READ ANY pendingNotificationsCIDs
            if (pendingNotificationsCIDs.length>0)
            {
                let uniqeuPendingNotificationCIDs = []
                for (let i=0; i<pendingNotificationsCIDs.length; i++)
                {
                    if (!notificationCIDsAlreadyRead.includes(pendingNotificationsCIDs[i])) uniqeuPendingNotificationCIDs.push(pendingNotificationsCIDs[i]);
                }
                console.log(` ||> Step 3 <|| uniqeuPendingNotificationCIDs: `,uniqeuPendingNotificationCIDs);
                
                //Step 4 APPEND NEW NOTIFICATIONS AS READ
                await appendToJSON(path_readNotifications,uniqeuPendingNotificationCIDs);
           
                const justCheckingDataCID = await readJSON(path_readNotifications);
                console.log(` ||> Step 4 <|| justCheckingDataCID: `,justCheckingDataCID);
                
        
                let subscribers = [];
                //Step 5  GET CHANNEL SUBSCRIBERS
                if (uniqeuPendingNotificationCIDs.length>0)
                {
                    const response = await getChannelSpecs(1);
                    subscribers = response.subscribers;
                }
                console.log(` ||> Step 5 <|| subscribers: `,subscribers);
        
        
                //STEP 6 RELEASE NOTIFICATION FROM SMART CONTRACT
                await releaseChannelNotification(1);
                const channelHasPendingNotificationsEND = await getChannelHasPendingNotifications(1);
                console.log(` ||> Step 6 <|| channelHasPendingNotificationsEND: `,channelHasPendingNotificationsEND);
        
        
                //Step 7 SEND PUSH NOTIFICATIONS
                const results = await sendPushNotifications(subscribers,uniqeuPendingNotificationCIDs);
                console.log(chalk.inverse.cyan(` ||> Step 7 <|| NEW NOTIFICACTIONS results: `,results));
        
            }
            else {
                console.log(chalk.inverse.yellow(` ||> Step 3 <|| No new notifications to send`));
            }
            
            
        }

        socket.emit('cryptoServer',{
            network: "Moonbase Alpha",
            block_number  : block.number,
            block_timestamp  : block.timestamp,
            lastUpdate_block_number: lastSavedIndexedBlockNumberRead,
            // nextUpdate_block_number,
        });

    })
    .on('error',error => {
        console.log(error);
    });

};
//#endregion *** CRYPTO NETWORK WEB SOCKET  ****


module.exports = {
                    setSocket,
                    init_CryptoServer,
                 }