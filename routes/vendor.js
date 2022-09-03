const express = require("express");
const { Vendor, validateVendor } = require("../model/vendor");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

// GET all vendors

router.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find();
    if (Object.keys(vendors).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No vendor available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      vendors: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get vendors",
    });
  }
});

// GET a single vendor

router.get("/vendor/:id", async (req, res) => {
  if (!req.params.id){
        return res.status(400).json({
        success: false,
        message: "ID Required",
        })
    }
  try {
    let vendor = await Vendor.findById(req.params.id).populate({path:"items",select:"name price description discount tax availability prepTime"})
    
    if (vendor === null) {
      return res.status(400).json({
        success: false,
        message: "No Vendor with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successful",
      vendor: _.pick(vendor, [
        "_id",
        "name",
        "address",
        "phonenumber",
        "avatar",
        "rate",
        "availabilty",
        "email",
        "type",
        "items",
        "account"
        
      ]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get vendor",
    });
  }
});

// POST --  create a vendor

router.post("/vendor", async (req, res) => {
  const { error } = validateVendor(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  let vendor = await Vendor.findOne({ email: req.body.email });


  if (vendor !== null){
    return res.status(400).json({
        success: false,
        message: "Vendor already registered",
    });
  }
    

  vendor = new Vendor();

  
  vendor.name = req.body.name;
  vendor.email = req.body.email;
  vendor.address = req.body.address;
  vendor.phonenumber = req.body.phonenumber;
  vendor.avatar = req.body.avatar;
  vendor.availability = req.body.availability;
  vendor.rate = req.body.rate;
  vendor.type = req.body.type;

  let vendorPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  vendor.password = await bcrypt.hash(req.body.password, vendorPasswordSalt);

  try {
    vendor = await vendor.save();

    const token = vendor.generateAuthToken();
    return res
      .status(200)
      .header("x-vendor-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .json({
        success: true,
        message: "Vendor Registered",
        vendor: _.pick(vendor, [
            "_id",
          "name",
          "email",
          "address",
          "avatar",
          "phonenumber",
          "rate",
          "availability",
          "type",
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

// PUT -- update a particular Vendor

router.put("/vendor/:id", async (req, res) => {


  try {
    let vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: "No vendor with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Vendor",
    });
  }

  let vendorPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  req.body.password = await bcrypt.hash(req.body.password, vendorPasswordSalt);

  try {
    let vendor = await Vendor.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        password: req.body.password,
        avatar: req.body.avatar,
        address: req.body.address,
        phonenumber: req.body.phonenumber,
        type: req.body.type,
        account: req.body.account,
        
      }
    );

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      updated: vendor.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't update",
    });
  }
});

// DELETE -- a Vendor

router.delete("/vendor/:id", async (req, res) => {
    
  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      message: "ID is required",
    });
  }

  try {
    let vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: "No vendor with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Vendor",
    });
  }

  try {
    let vendor = await Vendor.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
      vendor
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
