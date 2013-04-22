
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
