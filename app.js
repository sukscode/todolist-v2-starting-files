//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

mongoose.connect("mongodb+srv://Admin-sukriti:Sukriti1%40@cluster0.wylb3.mongodb.net/todolistDB");
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome"
});

const item2=new Item({
  name:"Hi"
});

const item3=new Item({
  name:"Bye"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

const day = date.getDate();

Item.find({},function(err,foundItems) {

   if (foundItems.length===0) {
     Item.insertMany(defaultItems,function(err){
       if (err) {
         console.log(err);
       } else {
         console.log("success");
       }
     });
     res.redirect("/");
   } else {
     res.render("list", {listTitle: day, newListItems: foundItems});
   }
  });



});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList) {
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
      }
    }
  });



});


app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if (listName==date.getDate()) {
    item.save();
    res.redirect("/");

  } else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res) {
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;


  if (listName==date.getDate()) {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successs");
        res.redirect("/");
      }
    });

  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });

  }



});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
