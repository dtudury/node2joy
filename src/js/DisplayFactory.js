
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
