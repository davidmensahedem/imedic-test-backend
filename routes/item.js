const express = require("express");
const { Item, validateItem } = require("../model/item");
const { Vendor} = require("../model/vendor");
const router = express.Router();
const _ = require("lodash");
const generateOrderCode = require("../utilities");


// GET all items

router.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    if (Object.keys(items).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No item available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      items: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get Items",
    });
  }
});


// GET all items of a particular vendor

router.post("/vendoritems", async (req, res) => {
    try {
      const items = await Item.find({vendorID:req.body.vendorID});
      if (Object.keys(items).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No item available",
        });
      }
      res.status(200).json({
        success: true,
        message: "Successful",
        vendorItems: items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Couldn't get Items",
      });
    }
  });










// GET a single item

router.get("/item/:id", async (req, res) => {
  if (!req.params.id){
        return res.status(400).json({
        success: false,
        message: "ID Required",
        })
    }
  try {
    let item = await Item.findById(req.params.id).populate({path:"vendorID"})
    
    if (item === null) {
      return res.status(400).json({
        success: false,
        message: "No Item with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successful",
      item: _.pick(item, [
        "_id",
        "name",
        "price",
        "description",
        "discount",
        "itemImage",
        "tax",
        "availability",
        "vendorID",
        "itemCode",
        "prepTime"
        
      ]),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get Item",
    });
  }
});

// POST --  create an item

router.post("/item", async (req, res) => {
  const { error } = validateItem(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  let item = await Item.findOne({ itemCode: req.body.itemCode });


  if (item){
    return res.status(400).json({
        success: false,
        message: "Item already added",
    });
  }
    

  item = new Item({
    name : req.body.name,
    price : req.body.price,
    description : req.body.description,
    itemCode : generateOrderCode(),
    discount : req.body.discount,
    itemImage : req.body.itemImage,
    tax : req.body.tax,
    availability : req.body.availability,
    vendorID : req.body.vendorID,
    prepTime : req.body.prepTime
  });

  
  

  try {
    item = await item.save();

    await Vendor.findByIdAndUpdate(
        item.vendorID,
        {
          $push: {
            items: item._id,
          },
        },
        { new: true }
    );
  
    
    return res
      .status(200)
      .json({
        success: true,
        message: "Item Added",
        item: _.pick(item, [
            "_id",
          "name",
          "price",
          "description",
          "itemCode",
          "discount",
          "tax",
          "availability",
          "vendorID",
          "prepTime"
          
        ]),
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not add",
    });
  }
});

// PUT -- update a particular item

router.put("/item/:id", async (req, res) => {


  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(400).json({
        success: false,
        message: "No Item with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Item",
    });
  }



  try {
    let item = await Item.updateOne(
      { _id: req.params.id },
      {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        itemCode: req.body.itemCode,
        discount: req.body.discount,
        itemImage: req.body.itemImage,
        tax: req.body.tax,
        availability: req.body.availability,
        vendorID: req.body.vendorID,
        prepTime: req.body.prepTime
        
      }
    );

    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      updated: item.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't update",
    });
  }
});

// DELETE -- an Item

router.delete("/item/:id", async (req, res) => {
    
  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      message: "ID is required",
    });
  }

  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(400).json({
        success: false,
        message: "No Item with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Item",
    });
  }

  try {
    let item = await Item.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      item
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
