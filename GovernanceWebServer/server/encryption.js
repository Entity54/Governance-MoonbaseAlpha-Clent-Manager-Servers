'use strict';
require('dotenv').config();
const crypto = require ("crypto");

const algorithm = "aes-256-cbc"; 

// // generate 16 bytes of random data
// const initVector = crypto.randomBytes(16)
// console.log(`initVector: `,initVector);
// const bufferTobase64String_initVector = initVector.toString('base64');
// console.log(`bufferTobase64String_initVector: `,bufferTobase64String_initVector);
// const base64StringToBuffer = Buffer.from(bufferTobase64String_initVector,'base64');
// console.log(`base64StringToBuffer: `,base64StringToBuffer);

// const initVector = Buffer.from(process.env.INITVECTOR ,'base64');
//FOR HACKATHON ONLY
const initVector = Buffer.from("0qnU7NjBBZFKsLtm5uVLdQ==" ,'base64');


// // secret key generate 32 bytes of random data
// const Securitykey = crypto.randomBytes(32) 
// console.log(`Securitykey: `,Securitykey);
// const bufferTobase64String_Securitykey = Securitykey.toString('base64');
// console.log(`bufferTobase64String_Securitykey: `,bufferTobase64String_Securitykey);
// const base64StringToBuffer_Securitykey = Buffer.from(bufferTobase64String_Securitykey,'base64');
// console.log(`base64StringToBuffer_Securitykey: `,base64StringToBuffer_Securitykey);

// const Securitykey = Buffer.from(process.env.SECURITYKEY ,'base64');
//FOR HACKATHON ONLY
const Securitykey = Buffer.from("wItHBcuE5pSA6jcjnAIGVP0kqM2KnZDld1ipZAUoQAI=" ,'base64');


const encrypt = (message = "This is a secret message") => {
    const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
    let encryptedData = cipher.update(message, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    console.log("Encrypted message: " + encryptedData);
    return encryptedData;
}

const decrypt = (encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    console.log("Decrypted message: " + decryptedData);
    return decryptedData;

}


const myEncryptedData = encrypt("Hello Moonbeam Moonriver and MoonbaseAlpha");
decrypt(myEncryptedData);

module.exports = {
    encrypt,
    decrypt,
 }