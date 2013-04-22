
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
