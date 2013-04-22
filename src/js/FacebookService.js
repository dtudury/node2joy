
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
