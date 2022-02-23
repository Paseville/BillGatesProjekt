//include essential modules
const ejs = require("ejs")
const express = require("express")
const bodyParser = require("body-parser")
const app = express();
const mongoose = require("mongoose")

//initalise ejs
app.set('view engine', 'ejs');

//initalise bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

//define folder for public css sheets etc
app.use(express.static("public"));

//connect to MongoDatabase
mongoose.connect("mongodb://localhost:27017/Bills")

//define item Attributes for Database
const itemSchema = {
  itemName: String,
  itemPrice: Number
}

//define bill attributes for database
const billSchema = {
  tableNumber: Number,
  randomAuthKey: String,
  boughtItems: [itemSchema],
  done: Number
}

const Item = mongoose.model("item", itemSchema)
const Bill = mongoose.model("bill", billSchema)

//Initalise server on Port 3000
app.listen(3000, function(){
  console.log("Server initalised on Port 3000")
})

//define post request on /create-new route
app.post("/create-new", function(req, res){
  //get parameters from body of post request
  const iNewTableNumber = req.body.tableNumber
  const sNewRandomAuthKey = req.body.randomAuthKey
  const arrNewBoughtItems = req.body.boughtItems
  //create an Item object with postet parameters
  const newBill = new Bill({
    Table: iNewTableNumber,
    randomAuthKey: sNewRandomAuthKey,
    boughtItems: arrNewBoughtItems,
    //always initalised with 0 on new entrys
    done: 0
  })
  //save new document to Item collection
  newBill.save(function(err){
    //errorhandling
    if(err){
      console.log("Error while saving new element to Database ________________" + err)
    } else{
      console.log("Successfully added new entry to Database")
      res.send("Added Entry")
    }
  })
})
