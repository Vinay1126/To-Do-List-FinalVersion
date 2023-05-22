//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Vinay:Vinuay1126@cluster0.jfugjrq.mongodb.net/todolistDB');


const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome!"
})

const item2 = new Item({
  name: "Hit + to add new items"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = new mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  // home page where item processing will take place

  const getDocument = async () => {
    try {
      const result = await Item.find({})

      // checking if database is empty than inputing default values

      if (result.length === 0) {
        Item.insertMany([item1, item2, item3])
        res.redirect("/");
      }

      // else showing the values present in database

      else {
        res.render("list", { listTitle: "Today", newListItems: result })
      }
    } catch (err) {
      console.log(err);
    }
  }
  getDocument();
});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  const getDocument = async () => {
    try {
      const result = await List.findOne({ name: customListName })
      if (!result) {

        // create a new list

        const list = new List({
          name: customListName,
          items: [item1, item2, item3]
        })
        list.save();
        res.redirect("/" + customListName)
      }
      else {

        // show an existing list

        res.render("list", { listTitle: result.name, newListItems: result.items })
      }
    } catch (err) {
      console.log(err);
    }
  }
  getDocument();

})


app.post("/", function (req, res) {

  // taking items input and saving them in database

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  // checking if its home route, than simply redirecting there

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }

  // otherwise adding the item in the new list and redirecting to the specific route

  else {
    const getDocument = async () => {
      try {
        const result = await List.findOne({ name: listName })
        result.items.push(item);
        result.save();
        res.redirect("/" + listName);

      } catch (err) {
        console.log(err);
      }

    }
    getDocument();
  }
});


app.post("/delete", function (req, res) {

  // here take item id from list.ejs and delete it using async await

  const deleteItem = req.body.delItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    const deleteDocument = async (_id) => {
      try {
        const result = await Item.findByIdAndDelete({ _id });
        // .deleteOne({_id});
        console.log(result);
        res.redirect("/")
      } catch (err) {
        console.log(err);
      }
    }

    deleteDocument(deleteItem);
  }
  else {
    const deleteDocument = async (_id) => {
      try {
        const result = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: deleteItem } } });
        res.redirect("/" + listName);
      } catch (err) {
        console.log(err);
      }
    }
    deleteDocument(deleteItem);
  }


});


app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
