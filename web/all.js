
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

//Dispatcher.js

(function() { this.Dispatcher = {};
		
   var _dispatchers = {};

   Dispatcher.addListener = function(label, listener) {
      _getDispatcher(label).push(listener);
   };
   Dispatcher.dispatch = function(label) {
      var dispatcher = _getDispatcher(label);
      for(var i = 0; i < dispatcher.length; i++) {
         dispatcher[i]();
      }
   };
   function _getDispatcher(label) {
      if(!_dispatchers[label]) _dispatchers[label] = [];
      return _dispatchers[label];
   }
})();

//DisplayController.js

(function() { this.DisplayController = {};
   DisplayController.registerSaltInput = function($saltInput) {
      $saltInput
         .addClass("text ui-widget-content ui-corner-all")
         .css({'padding':'0.5em'})
         .change(function() {
            Model.salt($saltInput.val());
         });
   };

   DisplayController.registerLoginButton = function($loginButton) {
      $loginButton.button({ disabled: true }).click(function() {
         FacebookService.login();
      });
      Dispatcher.addListener("id", function() {
         if(Model.id()) {
            $loginButton.button({disabled:true});
         } else {
            $loginButton.button({disabled:false});
         }
      });
   };

   DisplayController.registerLogoutButton = function($logoutButton) {
      $logoutButton.button({ disabled: true }).click(function() {
         FacebookService.logout();
      });
      Dispatcher.addListener("id", function() {
         if(Model.id()) {
            $logoutButton.button({disabled:false});
         } else {
            $logoutButton.button({disabled:true});
         }
      });
   };

   DisplayController.registerCategoryTabs = function($categoryTabs) {
      Dispatcher.addListener("category", function() {
         $categoryTabs.empty();
         var configuration = Model.configuration();
         for(var i = 0; i < configuration.categories.length; i++) {
            var $categoryTab = DisplayFactory.makeCategoryTab(configuration.categories[i]);
            $categoryTabs.append($categoryTab);
         }
         var $newCategoryTab = DisplayFactory.makeNewCategoryTab();
         var category = Model.category();
         $categoryTabs.append($newCategoryTab);
         $categoryTabs.buttonset();
         $categoryTabs
            .find('button[name="' + category.name + '"]')
            .button( "disable")
            .addClass("ui-state-hover ui-state-active")
            .removeClass("ui-state-disabled ui-button-disabled")
            .find('i')
            .removeClass("icon-folder-close")
            .addClass("icon-folder-open");
      });
   };

   DisplayController.registerSiteList = function($siteList) {
      Dispatcher.addListener("category", function() {
         $siteList.empty();
         var category = Model.category();
         var sites = category.sites;
         for(var i = 0; i < sites.length; i++) {
            var $siteWidget = DisplayFactory.makeSiteWidget(sites[i], i);
            $siteList.append($siteWidget);
         }
         var $addSiteWidget = DisplayFactory.makeAddSiteWidget();
         $siteList.append($addSiteWidget);
         $siteList.sortable({
            items:"li:not(#addSiteWidget)",
            update:function(event, ui) {
               var newOrder = $siteList.sortable("toArray");
               var newSites = [];
               for(var i = 0; i < newOrder.length; i++) {
                  newSites[i] = sites[newOrder[i]];
               }
               Model.category().sites = newSites;
               Dispatcher.dispatch("category");
            }
         })
      });
   };

   DisplayController.registerConfigurationEditor = function($configurationEditor) {
      Dispatcher.addListener("configuration", function() {
         $configurationEditor.val(JSON.stringify(Model.configuration()));
      });
   };
   DisplayController.registerCategoryEditorButton = function($categoryEditorButton) {
      $categoryEditorButton.button().click(function() {
         var category = Model.category();
         DisplayFactory.popupCategoryDialog(category, false);
         /*
         var configuration = Model.configuration();
         var category = Model.category();
         var newCategories = [];
         for(var i = 0; i < configuration.categories.length; i++) {
            if(configuration.categories[i] != category) {
               newCategories.push(configuration.categories[i]);
            }
         }
         configuration.categories = newCategories;
         Dispatcher.dispatch("configuration");
         */
      });
   };
   DisplayController.registerSaveButton = function($saveButton) {
      $saveButton.button({disabled:true}).click(function() {
         DataService.saveConfiguration(Model.configuration());
      });
      Dispatcher.addListener("id", function() {
         if(Model.id()) {
            $saveButton.button({disabled:false});
         } else {
            $saveButton.button({disabled:true});
         }
      });
   };
   DisplayController.registerLoadButton = function($loadButton) {
      $loadButton.button({disabled:true}).click(function() {
         DataService.loadConfiguration();
      });
      Dispatcher.addListener("id", function() {
         if(Model.id()) {
            $loadButton.button({disabled:false});
         } else {
            $loadButton.button({disabled:true});
         }
      });
   };
})();

//DisplayFactory.js

(function() { this.DisplayFactory = {};

   DisplayFactory.makeCategoryTab = function(category) {
      var $categoryTab = $("<button name=\"" + category.name + "\"><i class='icon-folder-close'></i> " + category.name + "</button>");
      $categoryTab.click(function() {
         Model.category(category);
      });
      return $categoryTab;
   };

   DisplayFactory.makeNewCategoryTab = function() {
      var $newCategoryTab = $("<button><i class='icon-plus'></i></button>");
      $newCategoryTab.click(function() {
         var category = {
            name:"",
            sites:[]
         };
         DisplayFactory.popupCategoryDialog(category, true);
      });
      return $newCategoryTab;
   };

   DisplayFactory.makeSiteWidget = function(site, index) {
      var $siteWidget = $("<li id='" + index + "' class='ui-state-default'><i class='icon-globe'></i> " + site.user + " @ " + site.url + "</li>");
      $siteWidget.button().click(function() {
         DisplayFactory.popupSiteDialog(site, false);
      });
      return $siteWidget;
   };

   DisplayFactory.makeAddSiteWidget = function() {
      var $siteWidget = $("<li class='ui-state-default' id='addSiteWidget'><i class='icon-plus'></i></li>");
      $siteWidget.button().click(function() {
         var site = {url:"url", user:"username"}
         Model.category().sites.push(site);
         Dispatcher.dispatch("category");
         DisplayFactory.popupSiteDialog(site, true);
      });
      return $siteWidget;
   }

   DisplayFactory.popupCategoryDialog = function(category, isNew) {
      var $categoryDialog = $("<div title='Add New Category'></div>");
      $categoryDialog.append($("<label class='fixed-width' for='name'>Name: </label>"));
      var $categoryNameField = $("<input name='name' type='text' class='text ui-widget-content ui-corner-all'/>");
      $categoryNameField.val(category.name);
      $categoryDialog.append($categoryNameField);
      $(document.body).append($categoryDialog);

      var configuration = Model.configuration();
      var categories = configuration.categories;
      $categoryDialog.dialog({
         height: 180,
         width: 500,
         modal: true,
         buttons: {
            "Save": function() {
               category.name = $categoryNameField.val();
               if(isNew) {
                  categories.push(category);
               }
               Model.category(category);
               $categoryDialog.dialog("close");
               Dispatcher.dispatch("category");
            },
            "Cancel": function() {
               $categoryDialog.dialog("close");
            },
            "Delete": function() {
               if(!isNew) {
                  configuration.categories = removeMatching(categories, category);
                  Dispatcher.dispatch("configuration");
               }
               $categoryDialog.dialog("close");
            }
         }
      });
   };

   function makeRadio(label, index, checked, callback) {
      var $radio = $("<input type='radio' id='" + index + "' name='radio'" + (checked ? " checked='checked'" : "") + "/><label for='" + index + "'>" + label + "</label></input>")
         .click(function() {
            callback(index);
         });
      return $radio;
   }
   function makeCheckbox(label, index, checked, callback) {
      var $radio = $("<input type='checkbox' id='" + index + "'" + (checked ? " checked='checked'" : "") + "/><label for='" + index + "'>" + label + "</label></input>")
         .click(function() {
            callback(index);
         });
      return $radio;
   }

   DisplayFactory.popupAdvancedSiteDialog = function(site, isNew) {
      var $siteDialog = $("<div title='Password Generation Options'></div>");
      $siteDialog.append($("<b>" + site.user + " @ " + site.url + "</b><br/>"));

      $siteDialog.append($("<br/><label class='fixed-width' for='version'>Version: </label>"));
      var $siteVersionField = $("<input name='version' type='text' class='text ui-widget-content ui-corner-all' />");
      if(site.version) $siteVersionField.val(site.version);
      $siteDialog.append($siteVersionField);

      $siteDialog.append($("<br/><span class='fixed-width'>Hash Method:</span>"));
      var hasher = site.hasher;
      if(!hasher) hasher = 0;
      var $hasherRadios = $("<span></span>");
      var options = ["Custom(PBKDF2)", "MD5", "SHA-1"];
      for(var i = 0; i < options.length; i++) {
         $hasherRadios.append(makeRadio(options[i], i, hasher == i, function(index) {
            hasher = index;
            showCustom();
         }));
      }
      $hasherRadios.buttonset();
      $siteDialog.append($hasherRadios);

      $siteDialog.append($("<br/><label class='fixed-width' for='length'>Length: </label>"));
      var $siteLengthField = $("<input name='length' type='text' class='text ui-widget-content ui-corner-all' />");
      if(site.length) $siteLengthField.val(site.length);
      else $siteLengthField.val(16);
      $siteDialog.append($siteLengthField);



      var $custom;
      var outputs;
      showCustom();


      function showCustom() {
         if(hasher == 0) {
            $custom = $("<div></div>");

            $custom.append($("<span class='fixed-width'>Outputs:</span>"));
            outputs = site.outputs;
            if(!outputs) outputs = 0xf;
            var $outputsCheckboxes = $("<span></span>");
            var outputKinds = ["abc...", "ABC...", "123...", "!@#..."];
            for(var i = 0; i < outputKinds.length; i++) {
               var flag = 1 << i;
               $outputsCheckboxes.append(makeCheckbox(outputKinds[i], i, outputs & flag, function(index) {
                  outputs ^= 1 << index;
               }));
            }
            $outputsCheckboxes.buttonset();
            $custom.append($outputsCheckboxes);

            $custom.append($("<br/><label class='fixed-width' for='iterations'>Iterations: </label>"));
            var $siteIterationsField = $("<input name='iterations' type='text' class='text ui-widget-content ui-corner-all' />");
            if(site.iterations) $siteIterationsField.val(site.iterations);
            else $siteIterationsField.val(1);
            $custom.append($siteIterationsField);
            $siteDialog.append($custom);
         } else if($custom) $custom.remove();
      }


      $siteDialog.dialog({
         height: 340,
         width: 500,
         modal: true,
         buttons: {
            "Save": function() {
               site.hasher = hasher;
               site.version = $siteVersionField.val();
               site.length = $siteLengthField.val();
               site.outputs = outputs;
               $siteDialog.dialog("close");
               DisplayFactory.popupSiteDialog(site, isNew);
            },
            "Cancel": function() {
               $siteDialog.dialog("close");
               DisplayFactory.popupSiteDialog(site, isNew);
            },
            "Delete": function() {
               Model.category().sites = removeMatching(sites, site);
               Dispatcher.dispatch("category");
               $siteDialog.dialog("close");
            }
         }
      });
   }
   DisplayFactory.popupSiteDialog = function(site, isNew) {
      var $siteDialog = $("<div title='Generate Password'></div>");

      $siteDialog.append($("<br/><label class='fixed-width' for='website'>Location: </label>"));
      var $siteWebsiteField = $("<input name='website' type='text' class='text ui-widget-content ui-corner-all' />");
      $siteWebsiteField.val(site.url);
      $siteDialog.append($siteWebsiteField);

      $siteDialog.append($("<br/><label class='fixed-width' for='username'>User Name: </label>"));
      var $siteUsernameField = $("<input name='username' type='text' class='text ui-widget-content ui-corner-all' />");
      $siteUsernameField.val(site.user);
      $siteDialog.append($siteUsernameField);

      $siteDialog.append($("<br/>"));
      var $generateButton = $("<button><i class='icon-bolt'></i> Generate</button>")
         .button()
         .click(function() {
            var seed = Model.salt() + "|" + $siteUsernameField.val() + "|" + $siteWebsiteField.val();
            if(site.version) seed += "|" + site.version;
            console.log(seed);
            if(site.hasher == 1 || site.hasher == 2) {
               var hasher = (site.hasher == 1) ? CryptoJS.MD5 : CryptoJS.SHA1;
               var hash = hasher(seed);
               var encoding = CryptoJS.enc.Base64;
               var hashString = hash.toString(encoding);
               var length = site.length || 16;
               $passwordField.val(hashString.substr(0, length));
            } else {
               var iterations = site.iterations || 1;
               var outputs = site.outputs || 0xf;
               var length = site.length || 16;
               var hash = CryptoJS.PBKDF2("", seed, {keySize:512, iterations:iterations});
               var used = 0;
               var dictionary = "";
               if(outputs & (1 << 0)) {
                  var lowercase = "abcdefghijklmnopqrstuvwxyz";
                  dictionary += lowercase;
               }
               if(outputs & (1 << 1)) {
                  var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                  dictionary += uppercase;
               }
               if(outputs & (1 << 2)) {
                  var numbers = "01234567890";
                  dictionary += numbers;
               }
               if(outputs & (1 << 3)) {
                  var symbols = "`~@#%^&*()-_=+[]{}\\|;:'\",.<>/?";
                  dictionary += symbols;
               }
               console.log(dictionary);
               console.log(hash);
               var characterArray = [];
               for(var i = 0; i < length && used < hash.words.length; i++) {
                  var word = hash.words[used] >>> 0;
                  var characterIndex = word % dictionary.length;
                  characterArray.push(dictionary.charAt(characterIndex));
                  used++;
               }
               $passwordField.val(characterArray.join(""));
            }
         });
      $siteDialog.append($generateButton);

      $siteDialog.append($("<br/><label class='fixed-width' for='password'>Password: </label>"));
      var $passwordField = $("<input name='password' type='text' class='text ui-widget-content ui-corner-all' />");
      $siteDialog.append($passwordField);

      var $advancedButton = $("<button><i class='icon-cogs'></i></button>")
         .button()
         .click(function() {
            $siteDialog.dialog("close");
            DisplayFactory.popupAdvancedSiteDialog(site, isNew);
         });
      $siteDialog.append($advancedButton);

      $(document.body).append($siteDialog);
      var sites = Model.category().sites;
      $siteDialog.dialog({
         height: 340,
         width: 500,
         modal: true,
         buttons: {
            "Save": function() {
               site.url = $siteWebsiteField.val();
               site.user = $siteUsernameField.val();
               Dispatcher.dispatch("category");
               $siteDialog.dialog("close");
            },
            "Cancel": function() {
               if(isNew) {
                  Model.category().sites = removeMatching(sites, site);
                  Dispatcher.dispatch("category");
               }
               $siteDialog.dialog("close");
            },
            "Delete": function() {
               Model.category().sites = removeMatching(sites, site);
               Dispatcher.dispatch("category");
               $siteDialog.dialog("close");
            }
         }
      });
   };
   function removeMatching(elements, element) {
      var newElements = [];
      for(var i = 0; i < elements.length; i++) {
         if(elements[i] != element) newElements.push(elements[i]);
      }
      return newElements;
   }

})();

//FacebookService.js

(function() { this.FacebookService = {};
		
   FacebookService.setup = function() {
      window.fbAsyncInit = function() {
         FB.init({
            appId					: "365560336871019",
            channelUrl				: "//cryptopotamus.nodejitsu.com/channel.html",
            frictionlessRequests	: true,
            status					: true,
            cookie					: true
         });
         FB.getLoginStatus(function(response) {
            TraceResponse("FB.getLoginStatus")(response);
            _updateStatus(response);
            FB.Event.subscribe("auth.statusChange", function(response) {
               TraceResponse("auth.statusChange")(response);
               _updateStatus(response);
            });
         });
      };
      //start async load
      var id = "facebook-jssdk";
      if(document.getElementById(id)) {
         return;
      }
      var js = document.createElement("script");
      js.id = id;
      js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      document.getElementsByTagName("head")[0].appendChild(js);
      
   };
   function _updateStatus(response) {
      if(response.authResponse) {
         FB.api("/me?fields=third_party_id,username", _updateMe);
      } else {
         var hash = window.location.hash.replace('#', '');
         var hashlist = hash.split("&");
         var hashobject = {};
         for(var i = 0; i < hashlist.length; i++) {
            var pair = hashlist[i].split("=");
            hashobject[pair[0]] = pair[1];
         }
         if(hashobject.access_token) {
            FB.api("/me?access_token=" + hashobject.access_token + "&fields=third_party_id,username", _updateMe);
         } else {
            Model.id(null);
         }
      }
   }
   function _updateMe(response) {
      TraceResponse("/me")(response);
      Model.name(response.username);
      Model.facebook_id(response.id);
      Model.id(response.third_party_id);
   }
   FacebookService.login = function() {
      FB.login(TraceResponse("login"));
   };
   FacebookService.logout = function() {
      FB.logout(TraceResponse("logout"));
   };
})();

//Main.js

$(function() {
   Dispatcher.addListener("configuration", function() {
      var configuration = Model.configuration();
      if(configuration.categories && configuration.categories.length > 0) {
         Model.category(Model.configuration().categories[0]);
      }
   })
   Dispatcher.addListener("category", function() {
      Model.modified(true);
   });
   DisplayController.registerSaltInput($("#saltInput"));
   DisplayController.registerLoginButton($("#loginButton"));
   //DisplayController.registerConfigurationEditor($("#configurationEditor"));
   DisplayController.registerCategoryEditorButton($("#categoryEditorButton"));
   DisplayController.registerSaveButton($("#saveButton"));
   DisplayController.registerLoadButton($("#loadButton"));
   DisplayController.registerCategoryTabs($("#categoryTabs"));
   DisplayController.registerSiteList($("#siteList"));
   Dispatcher.addListener("id", DataService.initialLoad);
   FacebookService.setup();

   /*
   //var hash = CryptoJS.PBKDF2("password", "salt", {keySize:1, iterations:1, hasher:CryptoJS.algo.SHA256})
   for(var k = 1; k < 10; k++) {
      var hash = CryptoJS.PBKDF2("password", "salt", {keySize:1, iterations:k, hasher:CryptoJS.algo.SHA256})
      var output = "";
      for(var i = 0; i < hash.words.length; i++) {
         var string = (hash.words[i] >>> 0).toString(16);
         while(string.length < 8) string = "0" + string;
         output += string;
      }
      console.log(output);
   }
       var t0 = (new Date()).getTime();
    
    writeTestOutput("password", "salt", 1, 32,
                    "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b");
    writeTestOutput("password", "salt", 2, 32,
                    "ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43");
    writeTestOutput("password", "salt", 4096, 32,
                    "c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a");
//    writeTestOutput("password", "salt", 16777216, 32,
//                    "cf81c66fe8cfc04d1f31ecb65dab4089f7f179e89b3b0bcb17ad10e3ac6eba46");
    writeTestOutput("passwordPASSWORDpassword", "saltSALTsaltSALTsaltSALTsaltSALTsalt", 4096, 40,
                    "348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c4e2a1fb8dd53e1c635518c7dac47e9");
    writeTestOutput("pass\0word", "sa\0lt", 4096, 16,
                    "89b69d0516f829893c696226650a8687");
    writeTestOutput("password", "salt", 32768, 32,
                    "2e179fd7692d201c2ff8aec6628af50b5d637a760668767ba8c56fb36828bad7");
    
    var t1 = (new Date()).getTime();
    
    console.log("test complete " + ((t1 - t0) / 1000));
    */
});

function writeTestOutput(password, salt, iterations, keyLength, correctOutput) {
   var wordArray = CryptoJS.PBKDF2(password, salt, {keySize:keyLength / 32, iterations:iterations, hasher:CryptoJS.algo.SHA256}).words;
   var output = "";
   for (var i = 0; i < wordArray.length; i++) {
      string = (wordArray[i] >>> 0).toString(16);
      while (string.length < 8) string = "0" + string;
      output += string;
   }
   if(output == correctOutput) {
      console.log("correct");
   } else {
      console.log("incorrect");
   }
   console.log(output);
}

//Model.js

(function() { this.Model = {};
   var _attributes = ["id", "name", "facebook_id", "configuration", "category", "salt", "modified"];

   for(var i = 0; i < _attributes.length; i++) {
      var _attribute = _attributes[i];
      Model[_attribute] = _createAttribute(_attribute);
   }

   function _createAttribute(attribute) {
      var _value;
      return function() {
			if(arguments.length > 0) {
				_value = arguments[0];
				Dispatcher.dispatch(attribute);
			}
			return _value;
      };
   }
})();

//TraceResponse.js

(function() { this.TraceResponse = function traceResponse(label) {
      return function(response) {
         console.log(label + "---");
         console.log(JSON.stringify(response, null, "\t"));
      }
   }
})();
