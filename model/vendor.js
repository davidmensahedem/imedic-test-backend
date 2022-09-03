const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const vendorSchema = new Schema({
  
  name: String,
  address: String,
  availability: String,
  rate: Number,
  phonenumber: String,
  email: {type: String, unique:true},
  avatar: String,
  password: String,
  type: String,
  items:[{ type: Schema.Types.ObjectId, ref: "Item" }],
  account: {type:Number,default:0}

  
  
});

vendorSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      address: this.address,
      email: this.email,
      phonenumber: this.phonenumber,
      rate: this.rate,
      availability: this.availability,      
      type: this.type     
     
    },
    process.env.JWT_SECRET_CODE
  );
  return token;
};

const Vendor = mongoose.model("Vendor", vendorSchema);

const validateVendor = function (vendor) {
  const schema = Joi.object({
  
    name: Joi.string().min(3).required().label("Name"),
    address: Joi.string().min(3).required().label("Address"),
    avatar: Joi.string().min(3).required().label("Avatar"),
    email: Joi.string().email().required().label("Email"),
    phonenumber: Joi.string().min(10).required().label("Phone Number"),
    password: Joi.string().min(3).required().label("Password"),
    availability: Joi.string().min(3).required().label("Availability"),
    rate: Joi.number().min(0.1).required().label("Rate"),
    type: Joi.string().min(1).required().label("Type")

  });
  return schema.validate(vendor);
};

module.exports.Vendor = Vendor;
module.exports.validateVendor = validateVendor;
