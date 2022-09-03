const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const customerSchema = new Schema({
  
  name: String,
  address: String,
  email: {type: String, unique:true},
  phonenumber: String,
  avatar: String,
  password: String,
  type: String,
  account: {type:Number,default:0}
});

customerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      address: this.address,
      email: this.email,
      phonenumber: this.phonenumber,
      avatar: this.avatar,      
      type: this.type    
     
    },
    process.env.JWT_SECRET_CODE
  );
  return token;
};

const Customer = mongoose.model("Customer", customerSchema);

const validateCustomer = function (customer) {
  const schema = Joi.object({
  
    name: Joi.string().min(3).required().label("Name"),
    address: Joi.string().min(3).required().label("Address"),
    avatar: Joi.string().min(3).required().label("Avatar"),
    email: Joi.string().email().required().label("Email"),
    phonenumber: Joi.string().min(10).required().label("Phone Number"),
    password: Joi.string().min(3).required().label("Password"),
    type: Joi.string().min(3).required().label("Type"),
  });
  return schema.validate(customer);
};

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
