//include essential modules
require("dotenv").config()
const ejs = require("ejs")
const express = require("express")
const bodyParser = require("body-parser")
const app = express();
const mongoose = require("mongoose")

const apiKey = process.env.API_KEY

//initalise ejs
app.set('view engine', 'ejs');

//initalise bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));
//Damit auch json geparsed werden kann brauch man für create new
app.use(bodyParser.json())

//define folder for public css sheets etc
app.use(express.static(__dirname + '/public'))

//connect to MongoDatabase
mongoose.connect("mongodb+srv://Paseville:"+process.env.PW+"@cluster0.dd3xx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")

console.log("link to Database established")

//define item Attributes for Database
const itemSchema = new mongoose.Schema ({
  itemName: String,
  itemPriceOne: Number,
  itemsBought: Number,
  itemPriceAll: Number
})

//define bill attributes for database
const billSchema = new mongoose.Schema({
  tableNumber: Number,
  randomAuthKey: String,
  boughtItems: [itemSchema],
  totalBill: Number,
  done: Number,
  waiter: String,
}, {
  //set timestamps to true so on new entry creation automatically gets a created time and date
  timestamps: {createdAt: 'created_at'}
})

const Item = mongoose.model("item", itemSchema)
const Bill = mongoose.model("bill", billSchema)

//Initalise server on Port 3000
app.listen(process.env.PORT, function() {
  console.log("Server initalised on Port 3000")
})

//define post request on /create-new route
app.post("/create-new", function(req, res) {
  //test if the user has the right key
  if (req.query.auth === apiKey) {
    console.log("error after authentification")
    console.log(req.body)

    //get parameters from body of post request
    var price = 0
    const iNewTableNumber = req.body.tableNumber
    const sNewRandomAuthKey = req.body.randomAuthKey
    const arrNewBoughtItems = req.body.boughtItems
    const completeBill = req.body.totalBill
    //create an Item object with postet parameters
    const newBill = new Bill({
      tableNumber: iNewTableNumber,
      randomAuthKey: sNewRandomAuthKey,
      boughtItems: arrNewBoughtItems,
      totalBill: completeBill,
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
  } else {
    res.send("Access Denied wrong Key")
  }

})

//get route for getting the 5 newest elements with a done status of 0
app.get("/get", function(req, res) {
  //Test if user has the right key
  if (req.query.auth === apiKey) {
    //search for Bills within database with attribute done = 0
    Bill.find({
      done: 0
    }, function(err, foundBills) {
      if (err) {
        console.log(err)
        res.send("______________an error has occurd on /get route")
      } else {
        //when database holds less than five documents for loop will throw an arror
        if (foundBills.length < 5) {
          console.log("less than five entrys in database found")
          res.send(foundBills)
        } else {
          var newBills = []
          console.log("At least five database entrys found")
          //new elements are added at the end of database so start for loop at end of array
          //                                    JUST 5 OF THE ELEMENTS
          for (i = (foundBills.length - 1); i >= (foundBills.length - 5); i--) {


            //add five newest found elements to array to send
            newBills.push(foundBills[i])

          }
          res.send(newBills)
        }

      }
    })
  } else {
    res.send("Access Denied wrong key")
  }

})

//get route for getting all elements which are not yet done
app.get("/get-all", function(req, res) {
  //Test if user has the right key
  if (req.query.auth === apiKey) {
    //search for Bills within database with attribute done = 0
    Bill.find({
    }, function(err, foundBills) {
      //error handling
      if (err) {
        console.log("an error has occured in the /get-all route")
        res.send("an error has occurd on the get all rout")
      } else {
        console.log("all Bills have been sent successfully")
        res.send(foundBills)
      }
    })
  } else {
    res.send("Access Denied wrong key")
  }

})


//Update route for Updating done to 0 of item with itemID
app.get("/update/:billID", function(req, res) {
  //Test if user has the right key
  if (req.query.auth === apiKey) {
    const billID = req.params.billID
    Bill.findById(billID, function(err, bill) {
      if (err) {
        res.send(err)
        console.log("an error has occured while searching for requested id")
      } else {
        //udate daone Status to 1
        bill.done = 1,
          console.log("successfully update item")
      }
      bill.save()
      res.send("updated successfully")
    })

  } else {
    res.send("Acess Denied wrong key")
  }

})

//render html file for responding billID
app.get("/see/:billID", function(req, res) {
  const billID = req.params.billID
  Bill.findById(billID, function(err, foundBill) {
    //Authorize user that you cannot randomly find another Bill while trying out differnt bill IDs
    if (!err && (req.query.auth === foundBill.randomAuthKey)) {
      console.log(foundBill)
      res.render("list", {
        orders: foundBill.boughtItems,
        doc: foundBill
      })
    } else {
      res.send("No such bill found on database")
    }

  })

})
