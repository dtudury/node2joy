
//TraceResponse.js

(function() { this.TraceResponse = function traceResponse(label) {
      return function(response) {
         console.log(label + "---");
         console.log(JSON.stringify(response, null, "\t"));
      }
   }
})();
