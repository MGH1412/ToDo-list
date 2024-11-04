//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
/* added */
const mongoose = require ("mongoose");
const _ = require("lodash");
/*********/
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

/* added */
//mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});
//mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://mahdighaemi1412:d1nwfq0IKO5vDuX1@cluster0.fugly.mongodb.net/todolistDB");

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name : "Welcoe to your todolist!"
});
const item2 = new Item ({
  name : "WHit the + button to add a new item."
});
const item3 = new Item ({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listsSchema ={
  name : String ,
  items : [itemsSchema] ,
};
const List = mongoose.model("List", listsSchema); 



// Item.insertMany(defaultItems, function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully saved default items to DB.");
//   }
// });

// Item.insertMany(defaultItems).then(function () {
//   console.log("Successfully saved default items to DB");
// }).catch(function (err) {
//   console.log(err);
// });
/*********/

app.get("/", function(req, res) {

  //const day = date.getDate();

  /* added */

  // Item.find({},function(err,foundItems){
  //   res.render("list", {listTitle: "Today", newListItems: foundItems});
  // });

    Item.find({})
    
       .then(foundItems => {
          if (foundItems.length ===0 ) {

            Item.insertMany(defaultItems).then(function () {
              console.log("Successfully saved default items to DB");
            }).catch(function (err) {
              console.log(err);
            });

           res.redirect("/");
          
          } else {

            res.render("list", {listTitle: "Today", newListItems: foundItems});

          }
     })
       .catch(err => {
           console.log(err);
   });
  /*********/

  //res.render("list", {listTitle: day, newListItems: items});
  
});

app.post("/", function(req, res){

  /* added */
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name : itemName ,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName}) 
    .then(foundList => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
    .catch(err => {
      console.log(err);
  });

  }

  // item.save();
  // res.redirect("/");

  /*********/

  //const item = req.body.newItem;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

/* added */
app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox ;
  const listName = req.body.listName ;

  if (listName === "Today") {

    Item.findByIdAndDelete(checkedItemId)
    .then(deletedId => {
      if (deletedId) {
        console.log('Id deleted successfully:', deletedId);
        res.redirect("/");
      } else {
        console.log('Id not found');
      }
    })
    .catch(error => {
      console.error('Error deleting Id:', error);
    });

  } else {
    List.findOneAndUpdate ({name : listName} , {$pull: { items : {_id : checkedItemId}}} ) 
      
      .then((foundList) => {
;
        res.redirect("/" + listName);
      });
      


  }

  // Item.findByIdAndDelete(checkedItemId)
  // .then(deletedId => {
  //   if (deletedId) {
  //     console.log('Id deleted successfully:', deletedId);
  //     res.redirect("/");
  //   } else {
  //     console.log('Id not found');
  //   }
  // })
  // .catch(error => {
  //   console.error('Error deleting Id:', error);
  // });


  });

/*********/

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

/* added */
app.get("/:customListName" , function(req,res) {

  const customListName = _.capitalize(req.params.customListName);

  // List.findOne({name : customListName} , function(err,foundList){
  //   if (!err){
  //     if (!foundList) {
  //       console.log("does not Exist!");
  //     } else {
  //       console.log("Exist!");
  //     }
  //   }
  // });
  List.findOne({name : customListName}) 
    .then(foundList => {
      if (!foundList) {

        // Creat a new list.
        const list = new List ({
          name : customListName ,
          items : defaultItems ,
        });
        list.save();
        res.redirect("/"+ customListName);
      } else {
        // Show existing list.
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    })
    .catch(err => {
      console.log(err);
  });
});

/*********/


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
