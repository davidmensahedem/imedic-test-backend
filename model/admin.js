const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const adminSchema = new Schema({
  
  name: String,
  email: {type: String, unique:true},
  phonenumber: String,
  address: String,
  avatar: String,
  rate: Number,
  type: String,
  password: String,
  
});

adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      phonenumber: this.phonenumber,
      address: this.address,
      avatar: this.avatar,
      rate: this.rate,
      type: this.type     
     
    },
    process.env.JWT_SECRET_CODE
  );
  return token;
};

const Admin = mongoose.model("Admin", adminSchema);

const validateAdmin = function (admin) {
  const schema = Joi.object({
  
    name: Joi.string().min(3).required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    phonenumber: Joi.string().min(10).required().label("Phone Number"),
    address: Joi.string().min(3).required().label("Address"),
    avatar: Joi.string().min(3).required().label("Avatar"),
    rate: Joi.number().min(0.1).required().label("Rate"),
    type: Joi.string().min(1).required().label("Type"),
    password: Joi.string().min(3).required().label("Password"),

  });
  return schema.validate(admin);
};

module.exports.Admin = Admin;
module.exports.validateAdmin = validateAdmin;
