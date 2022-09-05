const express = require("express");
const { Order, validateOrder } = require("../model/order");
const router = express.Router();
const _ = require("lodash");
const generateOrderCode = require("../utilities");
const { default: axios } = require("axios");
const { Transaction } = require("../model/transaction");
const { Vendor } = require("../model/vendor");
const { Deliverer } = require("../model/deliverer");
const { Admin } = require("../model/admin");
const {generateSanboxAccessAPI,getAccessToken,getTransactionStatus,generateTransactionCode} = require("../utilities/momo");


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

    
    var transactionStatus = null;

    try {
        
        //get Token

        let parsedOrderAmount = parseInt(req.body.orderAmount);

        let tokenResults = await getAccessToken().success;

        if( tokenResults){
            transactionStatus = await getTransactionStatus(parsedOrderAmount,"0558157666");
        }else{
            await generateSanboxAccessAPI();
            transactionStatus = await getTransactionStatus(parsedOrderAmount,"0558157666");
        }

    }catch (error) {
        console.log("could not get transaction status");
    }
    

    try {

        if(transactionStatus.data.status){

            var newOrder = new Order({

                orderDetails:req.body.orderDetails,
                orderAmount:transactionStatus.data.amount,
                orderAddress:req.body.orderAddress,
                customerID : req.body.customerID,
                vendorID : req.body.vendorID,
                delivererID : req.body.delivererID,
                orderCode : generateOrderCode(), 
                status:"Completed", 
                orderTime : new Date()
                .toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
                .toLowerCase()
               
            });

                
            newOrder = await newOrder.save();
        
            newOrder = await Order.findById(newOrder._id);

            let admin = await Admin.findById(process.env.ADMIN_ID);
            let adminShare = (admin.rate/100) * newOrder.orderAmount;
            adminShare = adminShare.toFixed(2);
            adminShare = parseFloat(adminShare);

            await Admin.updateOne({_id:admin._id},{
                account:(admin.account + adminShare)
            });



            try {

                var transactionTime = new Date()
                .toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
                .toLowerCase()




                // first transaction
                let newTransaction = new Transaction({

                    from:newOrder.customerID,
                    to:"63126b86b3551da87a054ab4",
                    orderID:newOrder._id,
                    transactionAmount:newOrder.orderAmount,
                    transactionCode:transactionStatus.data.financialTransactionId,
                    time : transactionTime,
                    
                    status:transactionStatus.data.status

                });
                newTransaction = await newTransaction.save();


                // second transaction
                let vendorID = await Vendor.findById(newOrder.vendorID);
                
                let vendorShare = (vendorID.rate/100) * newOrder.orderAmount;
                vendorShare = vendorShare.toFixed(2);
                vendorShare = parseFloat(vendorShare);
                

                await Vendor.updateOne({_id:newOrder.vendorID},{
                    account:(vendorID.account + vendorShare)
                })



                let secondTransaction = new Transaction({

                    from:"63126b86b3551da87a054ab4",
                    to:newOrder.vendorID,
                    orderID:newOrder._id,
                    transactionAmount:vendorShare,
                    transactionCode:generateTransactionCode(),
                    time : transactionTime,
                    
                    status:transactionStatus.data.status

                });
                secondTransaction = await secondTransaction.save();



                // third transaction
                let delivererID = await Deliverer.findById(newOrder.delivererID);

                let delivererShare = (delivererID.rate/100) * newOrder.orderAmount;
                delivererShare = delivererShare.toFixed(2);
                delivererShare = parseFloat(delivererShare);
                
                

                await Deliverer.updateOne({_id:newOrder.delivererID},{
                    account:(delivererID.account + delivererShare)
                })


                let thirdTransaction = new Transaction({

                    from:"63126b86b3551da87a054ab4",
                    to:newOrder.delivererID,
                    orderID:newOrder._id,
                    transactionAmount:delivererShare,
                    transactionCode:generateTransactionCode(),
                    time : transactionTime,
                    
                    status:transactionStatus.data.status

                });
                thirdTransaction = await thirdTransaction.save();


                


                return res
                .status(200)
                .json({
                  success: true,
                  message: "Transaction created successfully",
                  transaction: [newTransaction,secondTransaction,thirdTransaction]
                });



            } catch (error) {
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Transaction couldn't be processed"
                
                });
            }

            
           

        }else{
            
            return res
            .status(400)
            .json({
                success: true,
                message: "Order couldn't be processed due to failed transaction"
            
            });
        }
        

    } catch (error) {
            
        console.log(error)
        
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
