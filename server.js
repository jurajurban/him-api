var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Item = require('./model/item');

//hello
var db = mongoose.connect('mongodb://localhost/him',
  { useNewUrlParser: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  //res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.listen(3004, function() {
  console.log('HIM API running on port 3004.');
});

app.post('/item', function(req, res, next){
  var item = new Item();
  item.parent = req.body.parent;
  item.name = req.body.name;
  item.description = req.body.description;
  item.type = req.body.type;
  item.fullPath = req.body.fullPath;
  item.save(function(err, savedItem) {
    if (err) {
      res.status(500).send({error: 'The item could not be saved!'});
    } else {
      res.status(200).send(savedItem);
    }
  })
});

app.put('/item', function(req, res, next){
  console.log(req.body);
  let id = req.body._id;
  Item.findById(id, function(err, foundItem){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the item.'});
    } else {
      foundItem.name = req.body.name;
      foundItem.type = req.body.type;
      foundItem.description = req.body.description;
      foundItem.save(function(err, updatedItem){
        if (err) {
          res.status(501).send({error: 'There was a problem updating the items.'});
        } else {
          res.status(200).send(updatedItem);
        }
      });
    }
  });
});

app.get('/item', function(req, res, next) {
  let id = req.query.id;
  Item.findById(id, function(err, foundItem){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the items.'});
    } else {
      res.status(200).send(foundItem);
    }
  });
});

app.get('/items', function(req, res, next) {
  let parent = req.query.parent;
  if (parent == null) {
    Item.find({parent: parent}, function(err, foundItems){
      if (err) {
        res.status(500).send({error: 'There was a problem fetching the items.'});
      } else {
        res.status(200).send({
          parentPath: [],
          items: foundItems,
          pathItems: []
        });
      }
    });
  } else {
    Item.find({parent: parent}, function(err, foundItems){
      if (err) {
        res.status(500).send({error: 'There was a problem fetching the items.'});
      } else {
        if (foundItems.length !== 0) {
          Item.find({_id: foundItems[0].fullPath}, function(err, pathItems){
            if (err) {
              res.status(500).send({error: 'There was a problem fetching the items.'});
            } else {
              res.status(200).send({
                parentPath: foundItems[0].fullPath,
                items: foundItems,
                pathItems: pathItems
              });
            }
          });
        } else {
          Item.findById(parent, function(err, foundParent){
            if (err) {
              res.status(500).send({error: 'There was a problem fetching the items.'});
            } else {
              var fullPath = [];
              if (foundParent.fullPath) {
                fullPath = foundParent.fullPath.concat(parent);
              } else {
                fullPath = [parent];
              }
              Item.find({_id: fullPath}, function(err, pathItems){
                if (err) {
                  res.status(500).send({error: 'There was a problem fetching the items.'});
                } else {
                  res.status(200).send({
                    parentPath: fullPath,
                    items: foundItems,
                    pathItems: pathItems
                  });
                }
              });
            }
          });
        }
      }
    });
  }
});

app.get('/parentItems', function(req, res, next) {
  let parent = req.query.parent;
  Item.findById(parent, function(err, foundItem){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the items.'});
    } else {
      Item.find({parent: foundItem.parent}, function(err, foundParent){
        if (err) {
          res.status(500).send({error: 'There was a problem fetching the items.'});
        } else {
          res.status(200).send(foundParent);
        }
      });
    }
  });
});

app.get('/parentPath', function(req, res, next) {
  let fullPath = req.query.id;
  console.log(fullPath);
  Item.find({_id: fullPath}, function(err, foundParents){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the items.'});
    } else {
      res.status(200).send(foundParents);
    }
  });
});

app.get('/allItems', function(req, res, next) {
  Item.find({}, function(err, foundItem){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the items.'});
    } else {
      res.status(200).send(foundItem);
    }
  });
});


app.get('/homes', function(req, res, next) {
  Item.find({parent: null}, function(err, foundItem){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the items.'});
    } else {
      res.status(200).send(foundItem);
    }
  });
});

app.get('/search', function(req, res, next) {
  var searchQuery = req.query.searchQuery;
  var searchRegExp = new RegExp(searchQuery, 'i');
  Item.find({name: {$regex: searchRegExp}}, function(err, foundItems){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the items.'});
    } else {
      res.status(200).send(foundItems);
    }
  });
});

app.delete('/item/remove', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  let itemId = req.body.id;
  Item.deleteOne({_id: itemId}, function(err, foundItem){
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the items.'});
    } else {
      res.status(200).send({success: 'Removed item with id '+itemId});
    }
  });
});

/*app.get('/wishlist', function(req, res){
  WishList.find({}).populate({path:'products', model: 'Product'}).exec(function(err, foundWishlist){
    //res.header('Access-Control-Allow-Origin', '*');
    if (err) {
      res.status(500).send({error: 'There was a problem fetching the wish lists.'});
    } else {
      res.status(200).send(foundWishlist);
    }
  });
});

app.post('/wishlist', function(req, res) {
  var wishList = new WishList();
  var newTitle = req.body.title;
  if (newTitle && newTitle !== "") {
    wishList.title = newTitle;
  }
  wishList.save(function(err, savedWishlist) {
    //res.header('Access-Control-Allow-Origin', '*');
    if (err) {
      res.status(500).send({error: 'The wish list could not be saved!'});
    } else {
      res.status(200).send(savedWishlist);
    }
  });
});

app.delete('/wishlist/product/remove', function(req, res) {
  var productId = req.body.productId;
  var wishListId = req.body.wishListId;
  if (!productId) {
    res.status(500).send({error: 'No product id provided!'});
  } else {
    if (!wishListId) {
      res.status(500).send({error: 'No wishlist id provided!'});
    } else {
      WishList.updateOne({_id: wishListId}, 
        {$pull: {products: productId}},
        function(err, updatedWishList) {
          if (err) {
            res.status(500).send({error: 'The product could not be removed from the wish list!'});
          } else {
            res.status(200).send(updatedWishList);
          }
        });
    }
  }
});

app.put('/wishlist/product/add', function(req, res) {
  var productID = req.body.productId; 
  if (!productID) {
    res.status(500).send({error: 'No product id provided!'});
  } else {
    Product.findOne({_id:req.body.productId}, function(err, foundProduct){
      //res.header('Access-Control-Allow-Origin', '*');
      if (err) {
        res.status(500).send({error: 'The product you tried to add could not be found!'});
      } else {
        WishList.updateOne({_id:req.body.wishListId},
          {$addToSet: {products: foundProduct._id} },
          function(err, updatedWishList) {
          if (err) {
            res.status(500).send({error: 'The product could not be added to the wish list!'});
          } else {
            res.status(200).send(updatedWishList);
          }
        });
      }
    });
  }
});*/