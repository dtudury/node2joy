
//DataService.js

(function() { this.DataService = {};
   DataService.saveConfiguration = function(configuration) {
      $.ajax({
         url:"save?" + Model.id(),
         type:"POST",
         data: JSON.stringify(configuration),
         success: function(response) {
            TraceResponse("save")(response);
         }
      });
      Model.configuration(configuration);
   };
   DataService.initialLoad = function() {
      if(!Model.modified()) {
         DataService.loadConfiguration();
         console.log("unmodified?");
      } else {
         console.log("modified?");
      }
   }
   DataService.loadConfiguration = function() {
      var defaultConfiguration = {
         "categories": [
            {
               "name": "Personal",
               "sites": [
                  {
                     "url": "nodejitsu.com",
                     "user": "user"
                  },
                  {
                     "url": "gmail.com",
                     "user": "username"
                  },
                  {
                     "url": "amazon.com",
                     "user": "username"
                  },
                  {
                     "url": "facebook.com",
                     "user": "username"
                  },
                  {
                     "url": "github.com",
                     "user": "username"
                  },
                  {
                     "url": "skype",
                     "user": "user"
                  }
               ]
            },
            {
               "name": "Work",
               "sites": [
                  {
                     "url": "myoffice email",
                     "user": "username"
                  },
                  {
                     "url": "myoffice intranet",
                     "user": "username"
                  },
                  {
                     "url": "work skype",
                     "user": "username"
                  }
               ]
            },
            {
               "name": "Rarely Used",
               "sites": [
                  {
                     "url": "flickr.com",
                     "user": "new name"
                  },
                  {
                     "url": "ratchet.io",
                     "user": "new name"
                  },
                  {
                     "url": "mongohq.com",
                     "user": "new name"
                  },
                  {
                     "url": "mongolab.com",
                     "user": "new name"
                  },
                  {
                     "url": "jsfiddle.net",
                     "user": "new name"
                  }
               ]
            }
         ]
      };
      if(Model.id()) {
         $.ajax({
            url:"load?" + Model.id(),
            type:"POST",
            success: function(response) {
               TraceResponse("load")(response);
               if(response) Model.configuration(response);
               else Model.configuration(defaultConfiguration);
            }
         });
      } else {
         var modified = Model.modified();
         Model.configuration(defaultConfiguration);
         Model.modified(modified);
      }
   };
})();
