const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const transactionSchema = new Schema({
  
  from: Schema.Types.ObjectId,
  to: Schema.Types.ObjectId,
  orderID: {type:Schema.Types.ObjectId,ref:"Order"},
  time: String,
  date: {type:Date,default:Date.now},
  status: {type:String,default:"Pending"},
  transactionAmount:{type:Number},
  transactionCode:{type:String,default:""}
  
});



const Transaction = mongoose.model("Transaction", transactionSchema);

const validateTransaction = function (transactoin) {
  const schema = Joi.object({
  
    from: Joi.string().min(24).max(24).required().label("From"),
    to: Joi.string().min(24).max(24).required().label("To"),
    orderID: Joi.string().min(24).max(24).required().label("Order ID"),
    transactionAmount: Joi.number().min(1).required().label("Transaction Amount"),
    transactionCode: Joi.number().min(1).required().label("Transaction Code"),

  });
  return schema.validate(transactoin);
};

module.exports.Transaction = Transaction;
module.exports.validateTransaction = validateTransaction;
