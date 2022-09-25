'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');             
const http = require('http');             
const socketIO = require('socket.io');
 
const crypto_project_BlockServer = require('./crypto_project_BlockServer.js');
let network;


const publicPath = path.join(__dirname,'../public');       
const port = process.env.PORT || 3000;
var app = express();

app.use((req,res,next) => {
    let now = new Date().toString();
    let log = `${now}  Method: ${req.method}  URL: ${req.url}`;
    fs.appendFile('server.log',log + '\n',(err) => {
      if (err) {
        console.log('Can not append to the file');
      }
    })
    next();
});
 
const server = http.createServer(app); 
const io = socketIO(server);   

app.use(express.static(publicPath)); 


io.on('connection', (socket) => {

    console.log('New browser client connected');

    socket.on('connectToNetwork', async (clientQuery,callback) => {
        console.log("clientQuery: ",clientQuery);
        network = clientQuery.selection;
        if (clientQuery.btnHTML === "Connect")
        {
          console.log(`We will connect to network:${network}`);
          crypto_project_BlockServer.init_CryptoServer(network);  //start crypto server and get info block by block

          callback({ 
            message: `Server has received a message from the client to connect to network: ${clientQuery.selection}`,
            groupedTickers: ""  
          });
        }
        else {
          console.log(`We will disconnect from network:${network}`);
          callback({ message: `Server has received a message from the client to disconnect from network: ${clientQuery.selection}`});
        }
    });


    crypto_project_BlockServer.setSocket(socket); 


    socket.on('disconnect', () => {
      console.log('User was disconnected');
    });

});


server.listen(port, () => {
  console.log(`Governance Server is up on port ${port}`);
});