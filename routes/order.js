const express = require("express");
const { Order, validateOrder } = require("../model/order");
const router = express.Router();
const _ = require("lodash");
const generateOrderCode = require("../utilities");

// GET all orders

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    if (Object.keys(orders).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order available",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get orders",
    });
  }
});

// GET a single order


router.get("/oneorder/:id", async (req, res) => {
       
    if (!req.params.id){
        return res.status(400).json({
        success: false,
        message: "ID Required",
        })
    }
    if (req.params.id.length != 24){
        return res.status(400).json({
        success: false,
        message: "Invalid ID",
        })
    }
  try {
    let order = await Order.findById(req.params.id).populate("customerID vendorID delivererID")
    
    if (order === null) {
      return res.status(400).json({
        success: false,
        message: "No order with this ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successful",
      order: _.pick(order, [
        "_id",
        "customerID",
        "vendorID",
        "delivererID",
        "orderDate",
        "paymentOption",
        "status",
        "orderCode",
        "orderTime",
        "paymentMode",
        "orderDetails",
        "orderAmount",
        "orderAddress"
  
        
      ])
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't get order",
    });
  }
});

// POST --  create an order

router.post("/order", async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
    
 
  let order = new Order({

    orderDetails:req.body.orderDetails,
    orderAmount:req.body.orderAmount,
    orderAddress:req.body.orderAddress,
    customerID : req.body.customerID,
    vendorID : req.body.vendorID,
    delivererID : req.body.delivererID,
    orderCode : generateOrderCode(), 
    orderTime : new Date()
    .toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    .toLowerCase()
   
  });

  
  

  try {
    order = await order.save();

    // get the order

    order = await Order.findById(order._id);

    
    return res
      .status(200)
      .json({
        success: true,
        message: "Order Added",
        order: _.pick(order, [
            "_id",
            "customerID",
            "vendorID",
            "delivererID",
            "orderDate",
            "paymentOption",
            "status",
            "paymentMode",
            "orderDetails",
            "orderAmount",
            "orderAddress"
          
        ]),
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not add",
    });
  }
});

// PUT -- update a particular order

router.put("/order/:id", async (req, res) => {


  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "No Order with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find Order",
    });
  }



  try {
    let order = await Order.updateOne(
      { _id: req.params.id },
      {

        customerID: req.body.customerID,
        vendorID: req.body.vendorID,
        delivererID: req.body.delivererID,
        paymentOption: req.body.paymentOption,
        paymentMode: req.body.paymentMode,
        status: req.body.status,
        orderDetails:req.body.orderDetails,
        orderAmount:req.body.orderAmount,
        orderAddress:req.body.orderAddress,

        
      }
    );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      updated: order.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't update",
    });
  }
});

// DELETE -- an Order

router.delete("/order/:id", async (req, res) => {
    
  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      message: "ID is required",
    });
  }

  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "No Order with this ID",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't find order",
    });
  }

  try {
    let order = await Order.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      order
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
