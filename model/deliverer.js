const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const delivererSchema = new Schema({
  
  name: String,
  email: {type: String, unique:true},
  phonenumber: String,
  avatar: String,
  password: String,
  type: String,
  vendorID: { type: Schema.Types.ObjectId, ref: "Vendor" },
  account: {type:Number,default:0},
  rate:{type:Number}

});

delivererSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      phonenumber: this.phonenumber,
      avatar: this.avatar,      
      type: this.type, 
      vendorID: this.vendorID,
      rate: this.rate
     
    },
    process.env.JWT_SECRET_CODE
  );
  return token;
};

const Deliverer = mongoose.model("Deliverer", delivererSchema);

const validateDeliverer = function (deliverer) {
  const schema = Joi.object({
  
    name: Joi.string().min(3).required().label("Name"),
    avatar: Joi.string().min(3).required().label("Avatar"),
    email: Joi.string().email().required().label("Email"),
    phonenumber: Joi.string().min(10).required().label("Phone Number"),
    password: Joi.string().min(3).required().label("Password"),
    type: Joi.string().min(3).required().label("Type"),
    vendorID: Joi.string().min(24).max(24).required().label("Vendor ID"),
    rate: Joi.number().min(1).required().label("Rate")

  });
  return schema.validate(deliverer);
};

module.exports.Deliverer = Deliverer;
module.exports.validateDeliverer = validateDeliverer;
