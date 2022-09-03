const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const orderSchema = new Schema({
  orderDetails:String,
  orderAmount:Number,
  orderAddress:String,
  customerID:  { type: Schema.Types.ObjectId, ref: "Customer" },
  vendorID:  { type: Schema.Types.ObjectId, ref: "Vendor" },
  delivererID:  { type: Schema.Types.ObjectId, ref: "Deliverer" },
  orderDate: {type: Date, default:Date.now},
  paymentOption: {type: String, default:"Momo"},
  paymentMode: {type: String, default:"Delivery"},
  status: {type: String,default:"Pending"},
  orderTime: {type: String},
  orderCode:String
  
});



const Order = mongoose.model("Order", orderSchema);

const validateOrder = function (order) {
  const schema = Joi.object({

    orderDetails:Joi.string().min(3).required().label("Order Details"),
    orderCode:Joi.string().min(3).required().label("Order Code"),
    orderAmount:Joi.number().min(1).required().label("Order Amount"),
    orderAddress:Joi.string().min(3).required().label("Order Address"),
    customerID: Joi.string().min(24).max(24).required().label("Customer"),
    vendorID: Joi.string().min(24).max(24).required().label("Vendor"),
    delivererID: Joi.string().min(24).max(24).required().label("Deliverer"),


  });
  return schema.validate(order);
};

module.exports.Order = Order;
module.exports.validateOrder = validateOrder;
