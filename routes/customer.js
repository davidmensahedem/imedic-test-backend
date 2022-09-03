const express = require("express");
const { Customer, validateCustomer } = require("../model/customer");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

// GET all customers

router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find();
    if (Object.keys(customers).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No customer available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      customers: _.pick(customers,[
        "name",
        "address",
        "email",
        "phonenumber",
        "avatar",
        "type",
        "account",
        
      ]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get customers",
    });
  }
});

// GET a single customer

router.get("/customer/:id", async (req, res) => {
  if (!req.params.id){
        return res.status(400).json({
        success: false,
        message: "ID Required",
        })
    }
  try {
    let customer = await Customer.findById(req.params.id)
    
    if (customer === null) {
      return res.status(400).json({
        success: false,
        message: "No Customer with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successful",
      customer: _.pick(customer, [
        "_id",
        "name",
        "address",
        "phonenumber",
        "avatar",
        "type",
        "account"
        
      ]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get customer",
    });
  }
});

// POST --  create a customer

router.post("/customer", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  let customer = await Customer.findOne({ email: req.body.email });


  if (customer !== null){
    return res.status(400).json({
        success: false,
        message: "Customer already registered",
    });
  }
    

  customer = new Customer();

  
  customer.name = req.body.name;
  customer.email = req.body.email;
  customer.address = req.body.address;
  customer.phonenumber = req.body.phonenumber;
  customer.avatar = req.body.avatar;
  customer.type = req.body.type;

  let customerPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  customer.password = await bcrypt.hash(req.body.password, customerPasswordSalt);

  try {
    customer = await customer.save();

    const token = customer.generateAuthToken();
    return res
      .status(200)
      .header("x-customer-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .json({
        success: true,
        message: "Customer Registered",
        customer: _.pick(customer, [
          "_id",
          "name",
          "email",
          "address",
          "avatar",
          "type",
          "phonenumber",
          "account"
          
        ]),
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not register",
    });
  }
});

// PUT -- update a particular Customer

router.put("/customer/:id", async (req, res) => {


  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "No customer with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Customer",
    });
  }

  let customerPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  req.body.password = await bcrypt.hash(req.body.password, customerPasswordSalt);

  try {
    let customer = await Customer.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        password: req.body.password,
        avatar: req.body.avatar,
        address: req.body.address,
        phonenumber: req.body.phonenumber,
        type: req.body.type,
        account: req.body.account
        
      }
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      updated: customer.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't update",
    });
  }
});

// DELETE -- a Customer

router.delete("/customer/:id", async (req, res) => {
    
  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      message: "ID is required",
    });
  }

  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "No customer with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Customer",
    });
  }

  try {
    let customer = await Customer.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      customer
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
