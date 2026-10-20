const transactionmodel=require('../models/transaction.model');
const ledgermodel=require('../models/ledger.model');
const accountmodel=require('../models/account.model');
const emailService=require('../services/email.service');
const mongoose=require('mongoose');


async function createTransaction(req,res) {

    /**
     * 1.Validate request
     */

    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;

    if(!fromAccount||!toAccount||!amount||!idempotencyKey){
       return res.status(400).json({
            message:"fromAccount, toAccount, amount and idempotencyKey are required fields"

        })
    }

    const fromuserAccount=await accountmodel.findOne({_id:fromAccount,});
    const touserAccount=await accountmodel.findOne({_id:toAccount,});

    if(!fromuserAccount||!touserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount "
        })
    }


    /**
     * 2. Check for idempotency
     */

    const isTransactionalreadyProcessed=await transactionmodel.findOne({idempotencyKey:idempotencyKey});   
    
    if(isTransactionalreadyProcessed){

    if(isTransactionalreadyProcessed.status==="completed"){
        return res.status(200).json({
            message:"Transaction already processed",
            transaction:isTransactionalreadyProcessed
        })
    } 

    if(isTransactionalreadyProcessed.status==="pending"){
       return res.status(200).json({
            message:"Transaction is still pending",
          
        })
    }

    if(isTransactionalreadyProcessed.status==="failed"){
        return res.status(500).json({
            message:"Transaction has failed", 
        })
    }

    if(isTransactionalreadyProcessed.status==="reversed"){
        return res.status(500).json({
            message:"Transaction has been reversed", 
        })
    } 

}

/**
 * 3. Check account status
 */

if(fromuserAccount.status!=="Active"||touserAccount.status!=="Active"){
    return res.status(400).json({
        message:"Both fromAccount and toAccount must be active"
    })
}

/** 
 * 4. Derive sender balance from ledger
 */
const balance=await fromuserAccount.getBalance();

if(balance<amount){
   return res.status(400).json({
        message:`Insufficient balance in fromAccount. Available balance is ${balance}`
    })
}


/**
 * Create Traansaction (pending)
 */

let transaction;


try{

const session=await mongoose.startSession();
session.startTransaction(); 

  transaction= (await transactionmodel.create([{
    fromAccount ,
    toAccount ,
    amount ,
    idempotencyKey ,
    status:"pending"
}],{session}))[0]; 

const debitLedgerEntry=await ledgermodel.create([{
    account:fromAccount,
    type:"debit",
    amount:amount,  
    transaction:transaction._id
}],{session})

 await new Promise(resolve => {
    setTimeout(resolve, 10000);
});
    

const creditLedgerEntry=await ledgermodel.create([{
    account:toAccount,
    type:"credit",
    amount:amount,  
    transaction:transaction._id
}],{session})   

 
await transactionmodel.findOneAndUpdate(
    {_id:transaction._id},
    {status:"completed"}, 
    {session}
);  

await session.commitTransaction();
session.endSession()
}
catch(err){
    await transactionmodel.findOneAndUpdate(
        {idempotencyKey:idempotencyKey},
        {status:"failed"}
    )
    return res.status(500).json({
        message:"Transaction failed",
        error:err.message
    })
}
await emailService.sendTransactionEmail(req.user.email,req.user.name,`Debited ${amount} from your account ${fromAccount} to account ${toAccount}`);{
    return res.status(201).json({
        message:"Transaction completed successfully",
        transaction:transaction
    })
}
  
} 


async function createInitialTransaction(req,res){
    const {toAccount,amount,idempotencyKey}=req.body;

    if( !toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
             message:"fromAccount, toAccount, amount and idempotencyKey are required fields"
           })
    }

    const touserAccount=await accountmodel.findOne({_id:toAccount,});

    if(!touserAccount){
        return res.status(400).json({
            message:"Invalid toAccount "
        })
    }


    const fromuserAccount=await accountmodel.findOne({
        // systemUser:true,
        user:req.user._id
    });

    if(!fromuserAccount){
        return res.status(400).json({
            message:"System user account not found"
        })
    }

    const session=await mongoose.startSession();
    session.startTransaction();

    const transaction=new transactionmodel({
        fromAccount:fromuserAccount._id,
        toAccount , 
        amount ,
        idempotencyKey ,
        status:"pending"
    }) 

    const debitLedgerEntry=await ledgermodel.create([{
        account:fromuserAccount._id,
        type:"debit",
        amount:amount,  
        transaction:transaction._id
    }],{session})

    const creditLedgerEntry=await ledgermodel.create([{
        account:toAccount,
        type:"credit",
        amount:amount,  
        transaction:transaction._id
    }],{session})

    transaction.status="completed";
    await transaction.save({session});

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message:"Transaction completed successfully",
        transaction:transaction
    })
 
}

    

module.exports={createTransaction,createInitialTransaction}