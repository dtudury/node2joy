var mongodb = require("mongodb");

var _collection;

exports.initialize = function(callback) {
   var db = new mongodb.Db("cryptopotamus", new mongodb.Server("dbh83.mongolab.com", 27837, {}), {safe:false});
   db.open(function (error, db_p) {
      if(error) {throw error;}
      db.authenticate("dtudury", "2rA3puTcHdjQdmCh", function(error, replies) {
         if(error) {throw error;}
         db.createCollection("Configurations", function(error, collection) {
            if(error) {throw error;}
            console.log("db up");
            _collection = collection;
            callback();
         }); 
      }); 
   });
};
exports.saveConfiguration = function(id, configuration) {
   _collection.findOne({_id:id}, function(error, item) {
      if(error) {throw error;}
      if(item) {
         item.c = configuration;
         _collection.save(item);
      } else {
         _collection.insert({_id:id, c:configuration});
      }
   });
};
exports.loadConfiguration = function(id, callback) {
   _collection.findOne({_id:id}, function(error, item) {
      if(error) {throw error;}
      if(item) {
         callback(item.c);
      } else {
         callback(null);
      }
   });
};
