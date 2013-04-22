
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
