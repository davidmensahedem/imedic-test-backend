const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const itemSchema = new Schema({
  
  name: String,
  price: Number,
  description: String,
  itemCode: String,
  discount: Number,
  itemImage: String,
  tax: Number,
  availability: String,
  vendorID: { type: Schema.Types.ObjectId, ref: "Vendor" },
  prepTime: String
  
});

itemSchema.virtual('totalPrice').get(function() {
  return this.price + ( (this.price) * (5/100) );
});


const Item = mongoose.model("Item", itemSchema);

const validateItem = function (item) {
  const schema = Joi.object({
  
    name: Joi.string().min(3).required().label("Name"),
    price: Joi.number().min(1).required().label("Price"),
    description: Joi.string().min(3).required().label("Description"),
    discount: Joi.number().min(0).required().label("Discount"),
    itemImage: Joi.string().min(3).required().label("Item Image"),
    prepTime: Joi.string().min(3).required().label("Preparation Time"),
    tax: Joi.number().min(0).required().label("Discount"),
    availability: Joi.string().min(3).required().label("Availability"),
    vendorID: Joi.string().min(24).max(24).required().label("Vendor ID"),
    itemCode: Joi.string().min(3).required().label("Item Code"),


  });
  return schema.validate(item);
};

module.exports.Item = Item;
module.exports.validateItem = validateItem;
