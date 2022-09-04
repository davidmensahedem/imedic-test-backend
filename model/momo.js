const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const momoSchema = new Schema({
  
  uuid4Code: String,
  apiKeyCode: {type: String},
  token:{type:String}


});



const Momo = mongoose.model("Momo", momoSchema);

const validateMomo = function (credentials) {
  const schema = Joi.object({
  
    uuid4Code: Joi.string().min(3).required().label("uuid4Code"),
    apiKeyCode: Joi.string().min(3).required().label("apiKeyCode"),

  });
  return schema.validate(credentials);
};

module.exports.Momo = Momo;
module.exports.validateMomo = validateMomo;
