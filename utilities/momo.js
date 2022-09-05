const { v4 :uuidv4 } = require('uuid')
const { default: axios } = require("axios");
const generateOrderCode = require('./index');
const {Momo} = require("../model/momo");

// Momo Operations


var generateSandboxAPIKey,getSandboxAccessToken,thirdU4Code = null;

// uuid v4 code
var u4code = uuidv4();


// Sandbox User Provisioning


async function generateSanboxAccessAPI(){

    // Generate User

    try {
           
        await axios.post(process.env.CREATE_USER_URL,{
            "providerCallbackHost": process.env.WEBHOOK_URL,
          },{
            headers: {
                "Content-Type":"application/json",
                "X-Reference-Id":u4code,
                "Ocp-Apim-Subscription-Key":process.env.OCP_APIM_SUBSCRIPTION_KEY,
            },
        })
           
        console.log("Create User Successful");
    
    } catch (error) {
        console.log("can't create user");
    }

    // Get API user information (A new uuid is required)

    try {
        
        let secondU4Code = uuidv4();

        await axios.get(`${process.env.APP_USER_INFO_URL}/${u4code}`,{
            // params:{
            //     "X-Reference-Id":u4code
            // },
            headers: {
                "Content-Type":"application/json",
                "Ocp-Apim-Subscription-Key":process.env.OCP_APIM_SUBSCRIPTION_KEY,
            },
        })

        console.log("User Information Success");
        
    } catch (error) {
        console.log("User Information Failed")
    }


    try {

        thirdU4Code = uuidv4();

        generateSandboxAPIKey = await axios.post(`https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${u4code}/apikey`,{},{
           
            headers: {
                "Ocp-Apim-Subscription-Key":process.env.OCP_APIM_SUBSCRIPTION_KEY
            }
        })

        
        
    } catch (error) {
        console.log("API Key Failed")
    }

    // Get the Access Token 


    try {
        
        getSandboxAccessToken = await axios.post(process.env.ACCESS_TOKEN_URL,{},{
            auth:{
                username:u4code,
                password:generateSandboxAPIKey.data.apiKey
            },
            
            headers: {
                "Content-Type":"application/json",
                "Ocp-Apim-Subscription-Key":process.env.OCP_APIM_SUBSCRIPTION_KEY,
            }
        })

        console.log("Token Successful");

    } catch (error) {
        console.log(error)
    }

    try {
        let checkMomo = await Momo.find();
        if(checkMomo.length === 0){
            await Momo.deleteMany({})
        }
    } catch (error) {
        console.log("momo deletion failed")
    }


    
    // save the credentials

    let momoCredentials = new Momo({
        uuid4Code: u4code,
        apiKeyCode: generateSandboxAPIKey.data.apiKey,
        token:`Bearer ${getSandboxAccessToken.data.access_token}`
    });

    try {
        momoCredentials = await momoCredentials.save();
    } catch (error) {
        console.log("momo credentials Failed");
    }





}



async function getAccessToken(){

    // Get the Access Token 

    let momoCode = await Momo.find();

    try {

        let accessToken = await axios.post(process.env.ACCESS_TOKEN_URL,{},{
            auth:{
                username:momoCode[momoCode.length-1].uuid4Code,
                password:momoCode[momoCode.length-1].apiKeyCode
            },
            
            headers: {
                "Content-Type":"application/json",
                "Ocp-Apim-Subscription-Key":process.env.OCP_APIM_SUBSCRIPTION_KEY,
            }
        })
        
        return {
            success:true,
            token:accessToken.access_token
        };


      } catch (error) {


        return {
            success:false
        };


    }

    

   
}


// Request to Pay and get transaction status

async function getTransactionStatus(amount,momoNumber = "0558157666"){

    let requestU4Code = uuidv4();

    let momoCode = await Momo.find();

    try {
        
        // request to pay
        await axios.post(process.env.REQUEST_TO_PAY_URL,{
            "amount": `${amount}`,
            "currency": "EUR",
            "externalId": `${generateOrderCode()}`,
            "payer": {
            "partyIdType": "MSISDN",
            "partyId": `${momoNumber}`
            },
            "payerMessage": "Pay for item",
            "payeeNote": "iMedic"
        },{
            headers: {
                "Authorization":`${momoCode[momoCode.length-1].token}`,
                "X-Reference-Id":requestU4Code,
                "Ocp-Apim-Subscription-Key":process.env.OCP_APIM_SUBSCRIPTION_KEY,
                "X-Target-Environment":process.env.SANDBOX_ENV
            },
        })

        console.log("request to pay successful")


    } catch (error) {
        console.log(error);
    }


    // get the transaction status

    try {

        var transactionStatus = await axios.get(`${process.env.TRANSACTION_STATUS_URL}/${requestU4Code}`,{
            
            headers: {
                "Content-Type":"application/json",
                "X-Target-Environment":process.env.SANDBOX_ENV,
                "Ocp-Apim-Subscription-Key":process.env.OCP_APIM_SUBSCRIPTION_KEY,
                "Authorization":`${momoCode[momoCode.length-1].token}`
            },
        })
    
        console.log("Transaction Successful")
        return transactionStatus;
    
        
    } catch (error) {
        console.log("Transaction Status Failed");
    }

    

}

// generate transaction code

const generateTransactionCode = function () {
          
    // Declare a string variable which stores all string

    var string = process.env.TRANSACTION_CODE_KEY;
    let code = '';
      
    // Find the length of string
    var len = string.length;
    for (let i = 0; i < 9; i++ ) {
        code += string[Math.floor(Math.random() * len)];
    }

    return code;
}







// Export the functions

module.exports.generateSanboxAccessAPI= generateSanboxAccessAPI;
module.exports.getAccessToken= getAccessToken;
module.exports.getTransactionStatus= getTransactionStatus;
module.exports.generateTransactionCode= generateTransactionCode;



