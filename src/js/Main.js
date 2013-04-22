
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
