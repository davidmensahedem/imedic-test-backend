const express = require("express");
const { Transaction, validateTransaction } = require("../model/transaction");
const router = express.Router();
const _ = require("lodash");

// GET all transactions

router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    if (Object.keys(transactions).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transaction available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      transactions: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get Transactions",
    });
  }
});

// GET a single transaction

router.get("/transaction/:id", async (req, res) => {

  if (!req.params.id){
        return res.status(400).json({
        success: false,
        message: "ID Required",
        })
    }

  if (req.params.id.length != 24){
        return res.status(400).json({
        success: false,
        message: "Invalid ID",
        })
    }

  try {
    let transaction = await Transaction.findById(req.params.id)
    
    if (transaction === null) {
      return res.status(400).json({
        success: false,
        message: "No transaction with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successful",
      admin: _.pick(admin, [
        "_id",
        "from",
        "to",
        "orderID",
        "time",
        "date",
        "status",
        "transactionAmount",
        "transactionCode"
        
      ]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get Transaction",
    });
  }
});

// POST --  create an transaction

router.post("/transaction", async (req, res) => {
  const { error } = validateTransaction(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  let transaction = await Transaction.findOne({ _id: req.body._id });


  if (transaction !== null){
    return res.status(400).json({
        success: false,
        message: "Transaction already done",
    });
  }
    

  transaction = new Transaction();

  
  transaction.from = req.body.from;
  transaction.to = req.body.to;
  transaction.orderID = req.body.orderID;
  transaction.transactionAmount = req.body.transactionAmount;
  transaction.transactionCode = req.body.transactionCode ? req.body.transactionCode : "";
  transaction.time = new Date()
  .toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  .toLowerCase();




  try {
    transaction = await transaction.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Transaction created successfully",
        transaction: _.pick(transaction, [
            "_id",
          "from",
          "to",
          "orderID",
          "transactionAmount",
          "transactionCode",
          "status",
          "date",
          "time"
          
        ]),
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not transact",
    });
  }
});

// PUT -- update a particular transaction

router.put("/transaction/:id", async (req, res) => {


  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: "No transaction with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Transaction",
    });
  }



  try {
    let transaction = await Transaction.updateOne(
      { _id: req.params.id },
      {
        transactionCode: req.body.transactionCode,
        status: req.body.status,
       
        
      }
    );

    return res.status(200).json({
      success: true,
      message: "Transaction completed successfully",
      updated: transaction.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't transact",
    });
  }
});

// DELETE -- a transaction

router.delete("/transaction/:id", async (req, res) => {
    
  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      message: "ID is required",
    });
  }

  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: "No Transaction with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Transaction",
    });
  }

  try {
    let transaction = await Transaction.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      transaction
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't delete",
    });
  }
});

// Export the router object

module.exports = router;
