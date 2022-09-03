const express = require("express");
const {Joi} = require("joi");
const app = express();
const { default: mongoose } = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require('dotenv').config();


// The routes

const customerRoutes = require("./routes/customer.js");
const vendorRoutes = require("./routes/vendor.js");
const delivererRoutes = require("./routes/deliverer.js");
const adminRoutes = require("./routes/admin.js");
const itemRoutes = require("./routes/item.js");
const orderRoutes = require("./routes/order.js");
const transactionRoutes = require("./routes/transaction.js");



mongoose.connect(
    process.env.CONNECTION_KEY,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    (err) => {
      if(err){
        console.log(err)
      }else{
        console.log("Connection Successful")
      }
    }
  );


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));



// Use the routes

app.use(process.env.IMEDIC_API_VERSION, customerRoutes);
app.use(process.env.IMEDIC_API_VERSION,vendorRoutes);
app.use(process.env.IMEDIC_API_VERSION,delivererRoutes);
app.use(process.env.IMEDIC_API_VERSION,adminRoutes);
app.use(process.env.IMEDIC_API_VERSION,itemRoutes);
app.use(process.env.IMEDIC_API_VERSION,orderRoutes);
app.use(process.env.IMEDIC_API_VERSION,transactionRoutes);



if (app.get("env") === "development") {
  app.use(morgan("dev"));
  console.log("Morgan enabled");
}

app.get("/", (req, res) => {
  res.send("iMedic API (Version 1.0.0)");
});

  
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server listening on port ${port}... `);
});

