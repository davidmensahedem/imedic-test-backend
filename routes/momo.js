const express = require("express");
const { Momo, validateMomo } = require("../model/momo");
const router = express.Router();
const _ = require("lodash");

// GET all vendors

router.get("/momocode", async (req, res) => {
  try {
    const momocredentials = await Momo.find();
    if (Object.keys(momocredentials).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No momo credential available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      momocredentials: momocredentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get momo credentials",
    });
  }
});



// POST --  create a momo credential

router.post("/momocode", async (req, res) => {
  const { error } = validateMomo(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
    

  let momo = new Momo();

  
  momo.uuid4Code = req.body.uuid4Code;
  momo.apiKeyCode = req.body.apiKeyCode;


  try {
    momo = await Momo.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "momo credentials created",
        momoCredentials:momo
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not create momo credentials",
    });
  }
});


// DELETE -- momo credentials

router.delete("/momo", async (req, res) => {
    
  try {
    await Momo.deleteMany({});
    return res.status(200).json({
      success: true,
      message: "momo deleted successfully"
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
