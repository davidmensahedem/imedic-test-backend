const express = require("express");
const { Deliverer, validateDeliverer } = require("../model/deliverer");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

// GET all deliverers

router.get("/deliverers", async (req, res) => {
  try {
    const deliverers = await Deliverer.find();
    if (Object.keys(deliverers).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No deliverer available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      deliverers: deliverers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get deliverers",
    });
  }
});

// GET a single deliverer

router.get("/deliverer/:id", async (req, res) => {
  if (!req.params.id){
        return res.status(400).json({
        success: false,
        message: "ID Required",
        })
    }
  try {
    let deliverer = await Deliverer.findById(req.params.id).populate("vendorID")
    
    if (deliverer === null) {
      return res.status(400).json({
        success: false,
        message: "No Deliverer with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successful",
      deliverer: _.pick(deliverer, [
        "_id",
        "name",
        "phonenumber",
        "avatar",
        "type",
        "vendorID",
        "account",
        "rate"
        
      ]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get deliverer",
    });
  }
});




  // GET all delivery fee of a particular vendor

  router.post("/deliveryfee", async (req, res) => {
    try {
      const deliverer = await Deliverer.find({vendorID:req.body.vendorID});
      if (Object.keys(deliverer).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No deliverer available"
        });
      }
      res.status(200).json({
        success: true,
        message: "Successful",
        deliveryFee: _.pick(deliverer[0],[
            "rate",
            "_id"
        ])
        
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Couldn't get the delivery fee",
      });
    }
  });







// POST --  create a deliverer

router.post("/deliverer", async (req, res) => {
  const { error } = validateDeliverer(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  let deliverer = await Deliverer.findOne({ email: req.body.email });


  if (deliverer !== null){
    return res.status(400).json({
        success: false,
        message: "Deliverer already registered",
    });
  }
    

  deliverer = new Deliverer();

  
  deliverer.name = req.body.name;
  deliverer.email = req.body.email;
  deliverer.phonenumber = req.body.phonenumber;
  deliverer.avatar = req.body.avatar;
  deliverer.type = req.body.type;
  deliverer.vendorID = req.body.vendorID;
  deliverer.rate = req.body.rate;

  let delivererPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  deliverer.password = await bcrypt.hash(req.body.password, delivererPasswordSalt);

  try {
    deliverer = await deliverer.save();

    const token = deliverer.generateAuthToken();
    return res
      .status(200)
      .header("x-deliverer-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .json({
        success: true,
        message: "Deliverer Registered",
        deliverer: _.pick(deliverer, [
          "_id",
          "name",
          "email",
          "avatar",
          "type",
          "phonenumber",
          "vendorID",
          "account",
          "rate"
          
        ]),
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not register",
    });
  }
});

// PUT -- update a particular Deliverer

router.put("/deliverer/:id", async (req, res) => {


  try {
    let deliverer = await Deliverer.findById(req.params.id);
    if (!deliverer) {
      return res.status(400).json({
        success: false,
        message: "No deliverer with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Deliverer",
    });
  }

  let delivererPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  req.body.password = await bcrypt.hash(req.body.password, delivererPasswordSalt);

  try {
    let deliverer = await Deliverer.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        password: req.body.password,
        avatar: req.body.avatar,
        phonenumber: req.body.phonenumber,
        type: req.body.type,
        vendorID: req.body.vendorID,
        account: req.body.account,
        rate: req.body.rate
        
      }
    );

    return res.status(200).json({
      success: true,
      message: "Deliverer updated successfully",
      updated: deliverer.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't update",
    });
  }
});

// DELETE -- a Deliverer

router.delete("/deliverer/:id", async (req, res) => {
    
  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      message: "ID is required",
    });
  }

  try {
    let deliverer = await Deliverer.findById(req.params.id);
    if (!deliverer) {
      return res.status(400).json({
        success: false,
        message: "No deliverer with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Deliverer",
    });
  }

  try {
    let deliverer = await Deliverer.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Deliverer deleted successfully",
      deliverer
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
