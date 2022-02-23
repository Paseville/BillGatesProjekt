//include essential modules
require("dotenv").config()
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
app.listen(3000, function() {
  console.log("Server initalised on Port 3000")
})

//define post request on /create-new route
app.post("/create-new", function(req, res) {
  //get parameters from body of post request
  const iNewTableNumber = req.body.tableNumber
  const sNewRandomAuthKey = req.body.randomAuthKey
  const arrNewBoughtItems = req.body.boughtItems
  //create an Item object with postet parameters
  const newBill = new Bill({
    tableNumber: iNewTableNumber,
    randomAuthKey: sNewRandomAuthKey,
    boughtItems: arrNewBoughtItems,
    //always initalised with 0 on new entrys
    done: 0
  })
  //save new Bill document to Item collection
  newBill.save(function(err) {
    //errorhandling
    if (err) {
      console.log("Error while saving new element to Database (post to /create-new route ________________" + err)
    } else {
      console.log("Successfully added new entry to Database")
      res.send("Added Entry")
    }
  })
})

//get route for getting the 5 newest elements with a done status of 0
app.get("/get", function(req, res) {
  //search for Bills within database with attribute done = 0
  Bill.find({
    done: 0
  }, function(err, foundBills) {
    if (err) {
      console.log(err)
      res.send("an error has occurd on /get route")
    } else {
      //when database holds less than five documents for loop will throw an arror
      if (foundBills.length < 5) {
        console.log("less than five entrys in database found")
        res.send(foundBills)
      } else {
        //new elements are added at the end of database so start for loop at end of array
        //                                    JUST 5 OF THE ELEMENTS
        for (i = (foundBills.length - 1); i >= (foundBills.length - 6); i--) {
          console.log("At least five database entrys found")
          var newBills = []
          //add five newest found elements to array to send
          newElements.push(foundBills[i])
          res.send(newBills)
        }
      }

    }
  })
})

//get route for getting all elements which are not yet done
app.get("/get-all", function(req, res){
  //search for Bills within database with attribute done = 0
  Bill.find({done: 0}, function(err, foundBills){
    //error handling
    if (err){
      console.log("an error has occured in the /get-all route")
      res.send("an error has occurd on the get all rout")
    } else {
      console.log("all Bills have been sent successfully")
      res.send(foundBills)
    }
  })
})


//Update route for Updating done to 0 of item with itemID
app.get("/update/:billID", function(req, res){
  const billID = req.params.billID
  Bill.findById(billID, function(err, bill){
    if (err){
      res.send(err)
      console.log("an error has occured while searching for requested id")
    } else{
      //udate daone Status to 1
      bill.done = 1,
      console.log("successfully update item")
    }
    bill.save()
    res.send("updated successfully")
  })

})
