const express = require("express");
const { Admin, validateAdmin } = require("../model/admin");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

// GET all admins

router.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find();
    if (Object.keys(admins).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No admin available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      admins: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get Admins",
    });
  }
});

// GET a single admin

router.get("/admin/:id", async (req, res) => {
    
  if (!req.params.id){
        return res.status(400).json({
        success: false,
        message: "ID Required",
        })
    }
  try {
    let admin = await Admin.findById(req.params.id)
    
    if (admin === null) {
      return res.status(400).json({
        success: false,
        message: "No Admin with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successful",
      admin: _.pick(admin, [
        "_id",
        "name",
        "email",
        "phonenumber",
        "address",
        "avatar",
        "rate",
        "type"
        
      ]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get Admin",
    });
  }
});

// POST --  create an admin

router.post("/admin", async (req, res) => {

  const { error } = validateAdmin(req.body);

  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  let admin = await Admin.findOne({ email: req.body.email });


  if (admin !== null){
    return res.status(400).json({
        success: false,
        message: "Admin already registered",
    });
  }
    

  admin = new Admin();

  
  admin.name = req.body.name;
  admin.email = req.body.email;
  admin.phonenumber = req.body.phonenumber;
  admin.address = req.body.address;
  admin.avatar = req.body.avatar;
  admin.rate = req.body.rate;
  admin.type = req.body.type;

  let adminPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  admin.password = await bcrypt.hash(req.body.password, adminPasswordSalt);

  try {
    admin = await admin.save();

    const token = admin.generateAuthToken();
    return res
      .status(200)
      .header("x-admin-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .json({
        success: true,
        message: "Admin Registered",
        admin: _.pick(admin, [
            "_id",
          "name",
          "email",
          "phonenumber",
          "address",
          "avatar",
          "rate",
          "type"
          
        ]),
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not register",
    });
  }
});

// PUT -- update a particular admin

router.put("/admin/:id", async (req, res) => {


  try {
    let admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "No Admin with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Admin",
    });
  }

  let adminPasswordSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_VALUE));
  req.body.password = await bcrypt.hash(req.body.password, adminPasswordSalt);

  try {
    let admin = await Admin.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        password: req.body.password,
        avatar: req.body.avatar,
        address: req.body.address,
        phonenumber: req.body.phonenumber,
        type: req.body.type
        
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      updated: admin.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't update",
    });
  }
});

// DELETE -- an Admin

router.delete("/admin/:id", async (req, res) => {
    
  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      message: "ID is required",
    });
  }

  try {
    let admin = await Admin.findById(req.params.id);
    if (admin === null) {
      return res.status(400).json({
        success: false,
        message: "No Admin with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Admin",
    });
  }

  try {
    let admin = await Admin.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
      admin
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
