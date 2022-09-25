'use strict';
var socket = io();


const cha_admin = document.getElementById("cha_admin");
const cha_block = document.getElementById("cha_block");
const cha_timestamp = document.getElementById("cha_timestamp");
const cha_active = document.getElementById("cha_active");
const cha_Id = document.getElementById("cha_Id");
const cha_name = document.getElementById("cha_name");
const cha_ticker = document.getElementById("cha_ticker");
const cha_metadata = document.getElementById("cha_metadata");


// let polkadot_List="polkadotList", kusama_List="kusamaList", top100_List="TOP100", custom_list= "customList";
// const status_CoinGecko = document.getElementById("status_CoinGecko");
const blockNum_lbl = document.getElementById("blockNum_lbl");
const blockTS_lbl = document.getElementById("blockTS_lbl");
const lastUpdate_lbl = document.getElementById("lastUpdate_lbl");
// const nextUpdate_lbl = document.getElementById("nextUpdate_lbl");
// const updatefreq_Inpt = document.getElementById("updatefreq_Inpt");
// const setUpdateFrequency = document.getElementById("setUpdateFrequency");
// const administratorAddress_inpt = document.getElementById("administratorAddress_inpt");
// // const updateAdminBtn = document.getElementById("updateAdminBtn");
// const priceReporterAddress_inpt = document.getElementById("priceReporterAddress_inpt");
// const updateBtnPriceReporter = document.getElementById("updateBtnPriceReporter");
// const updateGasFee_Inpt = document.getElementById("updateGasFee_Inpt");
// const administratorBalance_inpt = document.getElementById("administratorBalance_inpt");
// const priceReporterBalance_inpt = document.getElementById("priceReporterBalance_inpt");
// const form_createNewOracle = document.getElementById("frm-createNewOracle");
// const new_oracleSC_address = document.getElementById("new_oracleSC_address");
// const form_manage_reporters = document.getElementById("frm-manage_reporters");
// const validReporterAddress = document.getElementById("validReporterAddress");
// const approvedReporterResult = document.getElementById("approvedReporterResult");
// const checkReporterBtn = document.getElementById("checkReporterBtn");
// const form_manage_tickers = document.getElementById("frm-manage_tickers");
// const textArea_tickers = document.getElementById("textArea_tickers");
// const textArea_OracleStoredTickers = document.getElementById("textArea_OracleStoredTickers");
// const polkadotList = document.getElementById("polkadotList");
// polkadotList.addEventListener('click' ,function () { textArea_tickers.value = polkadot_List });
// const kusamaList = document.getElementById("kusamaList");
// kusamaList.addEventListener('click' ,function () { textArea_tickers.value = kusama_List});
// const top100 = document.getElementById("top100");
// top100.addEventListener('click' ,function () { textArea_tickers.value= top100_List });
// const customTickersList = document.getElementById("customTickersList");
// customTickersList.addEventListener('click' ,function () { textArea_tickers.value= custom_list });
// const frm_removeTicker = document.getElementById("frm-removeTicker");
// const tickerToRemove = document.getElementById("tickerToRemove");
// const tickerRemovalStatus = document.getElementById("tickerRemovalStatus");
// const form_getData = document.getElementById("frm-getData");
// const ticker_exist = document.getElementById("ticker_exist");
// const tik = document.getElementById("tik");
// const ticker_ts = document.getElementById("ticker_ts");
// const price = document.getElementById("price");
// const marketCap = document.getElementById("marketCap");
// const tokenAdress = document.getElementById("tokenAdress");
// const form_getAllData = document.getElementById("frm-getAllData");
// const textArea_dataSnapshot = document.getElementById("textArea_dataSnapshot");
// const network_selection = document.getElementById("network_selection");
// network_selection.disabled = true;
const connectToNetworkBtn = document.getElementById("connectToNetworkBtn");

// //Minting and Managing Liquidity
// const mintBtn = document.getElementById("mintBtn");
// const changeAdminTokenID_ERC20 = document.getElementById("changeAdminTokenID_ERC20");
// const changeAdminNewAddress = document.getElementById("changeAdminNewAddress");
// const changeERC20admin_btn = document.getElementById("changeERC20admin_btn");
// const newLiquidityOwnerAddress_inpt = document.getElementById("newLiquidityOwnerAddress_inpt");
// const approvenewLiquidityOwner_btn = document.getElementById("approvenewLiquidityOwner_btn");
// const textArea_FactoryTerminal = document.getElementById("textArea_FactoryTerminal");
// const changeOfAdminERC20_lbl = document.getElementById("changeOfAdminERC20_lbl");
// const tokenFactoryAddresslbl = document.getElementById("tokenFactoryAddresslbl");
// const tokenFactoryAdminAddresslbl = document.getElementById("tokenFactoryAdminAddresslbl");



//ERC20 Management
const balance_erc20address = document.getElementById("balance_erc20address");
const balance_Accountaddress = document.getElementById("balance_Accountaddress");
const getBalance_btn = document.getElementById("getBalance_btn");
const getBalance_lbl = document.getElementById("getBalance_lbl");

const allowance_erc20address = document.getElementById("allowance_erc20address");
const allowance_Accountaddress = document.getElementById("allowance_Accountaddress");
const getAllowance_btn = document.getElementById("getAllowance_btn");
const getAllowance_lbl = document.getElementById("getAllowance_lbl");

const admin_erc20address = document.getElementById("admin_erc20address");
const getAdmin_btn = document.getElementById("getAdmin_btn");
const getAdmin_lbl = document.getElementById("getAdmin_lbl");

const mint_erc20address = document.getElementById("mint_erc20address");
const mint_Accountaddress = document.getElementById("mint_Accountaddress");
const mint_amount = document.getElementById("mint_amount");
const mint_btn = document.getElementById("mint_btn");
const mint_lbl = document.getElementById("mint_lbl");




 

//#region socket connect
socket.on('connect', function () {
  // console.log(`Connected to server at ${moment.utc().format()}`);

  connectToNetworkBtn.addEventListener('click' ,function () {
    console.log(`The user has chosen to connect to ${network_selection.value} NETWORK`);

    socket.emit('connectToNetwork', 
      {
        selection        : `${network_selection.value}`, 
        btnHTML          :  connectToNetworkBtn.innerHTML,
        new_blockUpdateFrequency  : "" //updatefreq_Inpt.value, 
      }, function (servermessage) {
            console.log(`> `,servermessage);

            if (servermessage.message === `Server has received a message from the client to connect to network: ${network_selection.value}`)
            {
              connectToNetworkBtn.innerHTML= "Disconnect";
              document.getElementById("networkConnection").innerHTML = `CONNECTED TO ${network_selection.value.toUpperCase()}`;
              network_selection.disabled = true;
              // polkadot_List = (servermessage.groupedTickers.polkadot_Tickers).join();
              // kusama_List = (servermessage.groupedTickers.kusama_Tickers).join();
              // top100_List = (servermessage.groupedTickers.mc_top100_Tickers).join();
              // custom_list = "TOP_MC" + ",Kusama" + ",Polkadot";
              // Object.assign(status_CoinGecko.style,{color:"#04ff10"});
              // Object.assign(networkConnection.style,{borderStyle:"inset", borderColor: "#05b7ed"});
            }
            else
            {
              connectToNetworkBtn.innerHTML= "Connect";
              document.getElementById("networkConnection").innerHTML = `Not Connected to a Network`;
              network_selection.disabled = false;
              // Object.assign(status_CoinGecko.style,{color:"#ff0000"});
              // Object.assign(networkConnection.style,{borderStyle:"inset", borderColor: "#000000"});
            }
      }
    );
  });

  // updateBtnPriceReporter.addEventListener('click' ,function () {
  //   console.log(`The user has chosen to use a new Price Reporter Address: ${priceReporterAddress_inpt.value}`);
  //   socket.emit('updatePriceReporter', 
  //     {
  //       new_PriceReporter  : `${network_priceReporterAddress_inptselection.value}`, 
  //     }
  //   );
  // });

  // setUpdateFrequency.addEventListener('click' ,function () {
  //   console.log(`The user has chosen to use a new Update Frequency in Blocks: ${updatefreq_Inpt.value}`);
  //   socket.emit('updateFrequency', 
  //     {
  //       new_blockUpdateFrequency  : updatefreq_Inpt.value, 
  //     }
  //   );
  // });

  // form_createNewOracle.addEventListener('submit' ,function (e) {
  //   e.preventDefault();
  //   const confirmNewOracleSC = e.target.elements[0].checked;
  //   const reporterApproveChecked = e.target.elements[1].checked;
  //   console.log(`confirmNewOracleSC: ${confirmNewOracleSC}`);

  //   socket.emit('createNewOracle', { admin: administratorAddress_inpt.value });
  // });

  // form_manage_reporters.addEventListener('submit' ,function (e) {
  //   e.preventDefault();
  //   const priceReporterAddress = e.target.elements[0].value;
  //   const reporterApproveChecked = e.target.elements[1].checked;
  //   console.log(`priceReporterAddress: ${priceReporterAddress} reporterApproveChecked: ${reporterApproveChecked}`);

  //   socket.emit('managePriceReporter', { admin: administratorAddress_inpt.value, priceReporterAddress: `${priceReporterAddress}`, priceReporterApproveChecked: reporterApproveChecked });
  // });

  // checkReporterBtn.addEventListener('click' ,function () {
  //   console.log(`priceReporter Address to check: ${validReporterAddress.value}`);

  //   socket.emit('checkReporterVailidity', { reporterAddress : validReporterAddress.value });
  // });

  // form_manage_tickers.addEventListener('submit' ,function (e) {
  //   e.preventDefault();
  //   const _textArea_tickers = e.target.elements[0].value;
  //   console.log(`textArea_tickers: `,_textArea_tickers);

  //   socket.emit('manageTickers', { admin: administratorAddress_inpt.value, tickersLongString: `${_textArea_tickers}`});
  //   textArea_tickers.value = "Request has been submitted. Please wait";
  // });

  // frm_removeTicker.addEventListener('submit' ,function (e) {
  //   e.preventDefault();
  //   const removeTicker = e.target.elements[0].value;
  //   console.log(`removeTicker: `,removeTicker);
  //   socket.emit('remove_Ticker', { removeTicker, });
  // });

  // form_getData.addEventListener('submit' ,function (e) {
  //   e.preventDefault();
  //   const getDataForTicker = e.target.elements[0].value;
  //   console.log(`getDataForTicker: `,getDataForTicker);

  //   socket.emit('getData', { ticker : getDataForTicker.toLowerCase() });
  // });

  // form_getAllData.addEventListener('submit' ,function (e) {
  //   e.preventDefault();
  //   let textAreaForAllData = e.target.elements[0].value;
  //   if (textAreaForAllData==="") textAreaForAllData="ALL";
  //   console.log(`textAreaForAllData: `,textAreaForAllData);

  //   socket.emit('getAllDataSnapshot', { allTickers : textAreaForAllData });
  // });


  // mintBtn.addEventListener('click' ,function () {
  //   console.log(`The user has chosen to mint ERC20 tokens with name,ticker,totalSupply as shown on Oracle`);
  //   socket.emit('mintTokens', {});
  // });


  // changeERC20admin_btn.addEventListener('click' ,function () {
  //   console.log(`The user has chosen to update to ${changeAdminNewAddress.value} as the new admin of ERC20 tokens with ID ${changeAdminTokenID_ERC20.value} If empty it means for all tokens that current admin is not equal to new admin`);
  //   socket.emit('changeERC20Admin', 
  //     {
  //       tokensToChangeAdminString  : changeAdminTokenID_ERC20.value, 
  //       newERC20AdminAddress  : changeAdminNewAddress.value, 
  //     }
  //   );
    
  // });

  // approvenewLiquidityOwner_btn.addEventListener('click' ,function () {
  //   console.log(`The user has chosen to approve address ${newLiquidityOwnerAddress_inpt.value} so all held liquidity can be transferred to it`);
  //   if(newLiquidityOwnerAddress_inpt.value!=="")
  //   {
  //     socket.emit('approveNewLiquidityOwner', { newLiquidityOwnerAddress : newLiquidityOwnerAddress_inpt.value, } );
  //   }
  // });




  // getBalance_btn.addEventListener('click' ,function () {
  //     socket.emit('erc20_getBalanceBtn', { erc20Address : balance_erc20address.value, accountAddress: balance_Accountaddress.value });
  // });
  // getAllowance_btn.addEventListener('click' ,function () {
  //     socket.emit('erc20_getAllowanceBtn', { erc20Address : allowance_erc20address.value, accountAddress: allowance_Accountaddress.value });
  // });
  // getAdmin_btn.addEventListener('click' ,function () {
  //     socket.emit('erc20_getAdminBtn', { erc20Address : admin_erc20address.value,  });
  // });
  // mint_btn.addEventListener('click' ,function () {
  //     socket.emit('erc20_mintBtn', { erc20Address : mint_erc20address.value, accountAddress: mint_Accountaddress.value, amount: mint_amount.value });
  // });






  socket.on('channelSpecs', function (msg) {
    console.log(`channelSpecs |||||> `,msg);

    cha_admin.value = msg.channleAdmin;
    cha_block.value = msg.channelCreationBlockNumber;
    cha_timestamp.value = msg.channelCreationTimestamp;
    cha_active.value = msg.channelIsActive;

    cha_Id.value = msg.channleId;
    cha_name.value = msg.channelName;
    cha_ticker.value = msg.channelTicker;
    cha_metadata.value = msg.channelMetadataCid;
    
    // let subscriberObj = [];
    // msg.channelSubscribersArray.forEach((elem) => {
    //   let subObj =
    //     {
    //       address: elem.subscriber,
    //       token: elem.encryptedMobileToken,
    //     }
    //     subscriberObj.push(subObj);
    // })
    updateSubscribersTable(msg.channelSubscribersArray);
  });




  // socket.on('response_erc20_getAllowanceBtn', function (msg) {
  //   getAllowance_lbl.innerHTML = msg.allowance;
  // });
  // socket.on('response_erc20_getAdminBtn', function (msg) {
  //   getAdmin_lbl.innerHTML = msg.erc20Admin;
  // });
  // socket.on('response_erc20_mintBtn', function (msg) {
  //   mint_lbl.innerHTML = msg.message;
  // });

 
  // socket.on('coinGecko_setup', function (msg) {
  //   console.log(`Coingecko is setup at ${new Date(msg.createdAt).toISOString()}`);
  //   network_selection.disabled = false;
  // });

  // socket.on('retrievedOracleTickers', function (msg) {
  //   textArea_OracleStoredTickers.value = "................."
  // });

  // socket.on('retrievedALLTickerData', function (msg) {
  //   textArea_dataSnapshot.value = "data is coming here"
  // });

  // socket.on('showGasUsed', function (msg) {
  //   updateGasFee_Inpt.value = msg.gasUsed;
  //   priceReporterBalance_inpt.value = msg.priceReporterBalance;
  // });

  socket.on('cryptoServer', function (msg) {
    // console.log(`network: ${msg.network} block_number: ${msg.block_number} block_timestamp: ${msg.block_timestamp} msg.lastUpdate_block_number: ${msg.lastUpdate_block_number} msg.nextUpdate_block_number: ${msg.nextUpdate_block_number}`);
    document.getElementById("networkConnection").innerHTML = `CONNECTED TO ${msg.network.toUpperCase()}`;
    Object.assign(networkConnection.style,{borderStyle:"inset", borderColor: "#ffbb00"});
    
    blockNum_lbl.innerHTML = msg.block_number;
    // blockTS_lbl.innerHTML = msg.block_timestamp==="0"?"0" : new Date(1000*Number(msg.block_timestamp)).toISOString();
    blockTS_lbl.innerHTML = msg.block_timestamp==="0"?"0" : new Date(Number(msg.block_timestamp)).toISOString();

    lastUpdate_lbl.innerHTML = msg.lastUpdate_block_number;
    // nextUpdate_lbl.innerHTML = msg.nextUpdate_block_number;
  });


  

  // socket.on('oracleSCspecs', function (msg) {
  //   new_oracleSC_address.value = msg.oraclSC_address;
  //   administratorAddress_inpt.value = msg.admin_address;
  // });

  // socket.on('isPriceReporter', function (msg) {
  //   approvedReporterResult.innerHTML = msg.approvedPriceReporter;
  //   if (validReporterAddress.value!==msg.priceReporterAddress) {
  //     validReporterAddress.value = msg.priceReporterAddress;
  //   }
  //   if (msg.approvedPriceReporter) {
  //     Object.assign(validReporterAddress.style,{borderStyle:"inset",backgroundColor:"#58D68D"});
  //     priceReporterAddress_inpt.value = msg.priceReporterAddress;
  //   }
  //   else {
  //     Object.assign(validReporterAddress.style,{borderStyle:"inset",backgroundColor:"#DE540C"});
  //     priceReporterAddress_inpt.value = "Provided Address is NOT a valid Price Reporter";
  //   }
  // });

  // socket.on('approvePriceReporter', function (msg) {
  //   // console.log(`approvePriceReporter has updated the PriceReporter ${msg.priceReporterAddress} status to ${msg.status}`);
  //   if (msg.status) Object.assign(priceReporterAddress.style,{borderStyle:"inset",backgroundColor:"#58D68D"});
  //   else Object.assign(priceReporterAddress.style,{borderStyle:"inset",backgroundColor:"#DE540C"});

  //   updateGasFee_Inpt.value = msg.gasUsed;
  //   administratorBalance_inpt.value = msg.adminBalance;
  // });

  // socket.on('getTickers', function (msg) {
  //   if (msg.tickers)
  //   {
  //     const tickers = msg.tickers;
  //     const tickersString = tickers.join();
  //     textArea_OracleStoredTickers.value = tickersString;
  //   }
  //   // textArea_tickers.value="";
  // });


  // socket.on('updatedTickers', function (msg) {
  //     console.log(`Administrator Updated Tickers at ${msg.createdAt}`);
  //     updateGasFee_Inpt.value = msg.gasUsed;
  //     administratorBalance_inpt.value = msg.adminBalance;
  // });


  // socket.on('updatedTokenAddresses', function (msg) {
  //   console.log(`Administrator Updated Token Addresses at ${msg.createdAt}`);
  //   updateGasFee_Inpt.value = msg.gasUsed;
  //   administratorBalance_inpt.value = msg.adminBalance;
  // });


  // socket.on('tickerRemoved', function (msg) {
  //   tickerRemovalStatus.value = msg.status;
  //   updateGasFee_Inpt.value = msg.gasUsed;
  //   administratorBalance_inpt.value = msg.adminBalance;
  // });


  // socket.on('getDataforTicker', function (msg) {
  //   ticker_exist.value = msg.tickerExists;
  //   tik.value = msg.tik;
  //   console.log(`getDataforTicker > msg.timestamp ${typeof msg.timestamp} ${msg.timestamp}`);
  //   ticker_ts.value = msg.timestamp==="0"?"0" : new Date(1000*Number(msg.timestamp)).toISOString();
  //   price.value = msg.last_price;
  //   marketCap.value = msg.marketCap;
  //   tokenAdress.value = msg.tokenAddress;
  // });


  // socket.on('quotes', function (msg) {
  //   // let quotesObj = [];
  //   // let ticks = msg.ticks;
  //   // ticks.forEach((tick) => {
  //   //     let tickObj =
  //   //       {
  //   //         symbol         : tick.symbol.toUpperCase(),
  //   //         timestamp      : tick.last_updated,
  //   //         price          : tick.current_price,
  //   //         market_cap     : tick.market_cap,
  //   //       }
  //   //       quotesObj.push(tickObj);
  //   // });

  //   // updateQuotesTable(quotesObj);
  //   updateQuotesTable(msg.ticks);

  // });

  socket.on('newNotificationsSubmitted', function (msg) {
    const updatedDeliveredNotifsArray = JSON.parse(msg.ticks);
    if (updatedDeliveredNotifsArray.length>0) updateNotifsTable(updatedDeliveredNotifsArray);
  });


  // socket.on('getAllData', function (msg) {
  //   const tickers = msg.tickers;
  //   const timestamp = msg.timestamp;
  //   const prices = msg.prices;
  //   const mcs = msg.mcs;
  //   const tokenAddresses = msg.tokenAddresses;

  //   const requestedTickers = msg.requestedTickers;
  //   let symbolListArray = requestedTickers.toLowerCase().split(","); 
  //   // console.log(`symbolListArray: `,symbolListArray);
    
  //   let tickdata = "";
  //   for (let i=0; i < tickers.length; i++) {
  //     const ts = timestamp[i]==="0"?"0" : new Date(1000*Number(timestamp[i])).toISOString();
  //     tickdata +=`${tickers[i]}\t\t${ts}\t\t${prices[i]}\t\t${mcs[i]}\t\t${tokenAddresses[i]}\t\n`;      
  //   }
  //   textArea_dataSnapshot.value = tickdata;
  // });

  // socket.on('quote_SC', function (msg) {
  //   let quotesObj = [];
  //   const ticks = msg.tickers;
  //   const tiks = msg.tiks;
  //   const timestamp = msg.timestamp;
  //   const prices = msg.prices;
  //   const mcs = msg.mcs;
  //   const tokenAddresses = msg.tokenAddresses;

  //   for (let i=0; i < ticks.length; i++) {
  //       let tickObj =
  //         {
  //           symbol         : ticks[i].toUpperCase(),
  //           tik            : tiks[i].toUpperCase(),
  //           timestamp      : timestamp[i]==="0"?"0" : new Date(1000*Number(timestamp[i])).toISOString(),
  //           price          : prices[i],
  //           market_cap     : mcs[i],
  //           tokenAddress   : tokenAddresses[i],
  //         }
  //         quotesObj.push(tickObj);
  //   };

  //   updateQuotesTable(quotesObj);
  // });



  // socket.on('mintManagerSpecs', function (msg) {
  //   tokenFactoryAddresslbl.value      = msg.ntt54MintManagerSC_address;
  //   tokenFactoryAdminAddresslbl.value = msg.admin_address;
  // });

  // socket.on('mintedTokensProcedure', function (msg) {
  //   const tokenIDs = msg.tokenIDs;
  //   const tokenTickers = msg.tokenTickers;
  //   const totalSupply = msg.totalSupply;
  //   const tokenAddressses = msg.tokenAddressses;
    
  //   let tickdata = "";
  //   for (let i=0; i < tokenIDs.length; i++) {
  //     tickdata +=`${tokenIDs[i]}\t\t\t${tokenTickers[i]}\t\t${totalSupply[i]}\t\t${tokenAddressses[i]}\t\n`;      
  //   }
  //   textArea_FactoryTerminal.value = tickdata;
  // });

  // socket.on('mintedTokensTerminal', function (msg) {
  //   textArea_FactoryTerminal.value += msg.message+"\n";
  // });

  // socket.on('resultOfChangeERC20Admin', function (msg) {
  //   changeOfAdminERC20_lbl.innerHTML = `Result: ${msg.result} Total gas used: ${msg.gasUsed}`;
  // });


  const updateNotifsTable = function (notifsObjArray) {
    jQuery('notifsTable').html('');
    notifsObjArray.forEach((quoteObj) => {
      let rowTemplate = jQuery('#notifsTemplate').html();
      let rowTemplatehtml = Mustache.render(rowTemplate, quoteObj);
      jQuery('#notifsTable').append(rowTemplatehtml);
    });
  };

  const updateSubscribersTable = function (subscribersArray) {
    jQuery('subscriberTable').html('');
    subscribersArray.forEach((subscriberObj) => {
      let rowTemplate = jQuery('#subscribersTemplate').html();
      let rowTemplatehtml = Mustache.render(rowTemplate, subscriberObj);
      jQuery('#subscriberTable').append(rowTemplatehtml);
    });
  };



});
//#endregion socket connect

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});