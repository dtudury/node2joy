var http = require("http");
var fs = require("fs");
var dataService = require("./dataService");

var _index = fs.readFileSync("./web/index.html");
var _channel = fs.readFileSync("./web/channel.html");
var _all_js = fs.readFileSync("./web/all.js");
var _all_css = fs.readFileSync("./web/all.css");

var _js_files = {
   "/all.js": fs.readFileSync("./web/all.js"),
   "/crypto/aes.js": fs.readFileSync("./web/crypto/aes.js"),
   "/crypto/hmac-md5.js": fs.readFileSync("./web/crypto/hmac-md5.js"),
   "/crypto/hmac-sha1.js": fs.readFileSync("./web/crypto/hmac-sha1.js"),
   "/crypto/hmac-sha224.js": fs.readFileSync("./web/crypto/hmac-sha224.js"),
   "/crypto/hmac-sha256.js": fs.readFileSync("./web/crypto/hmac-sha256.js"),
   "/crypto/hmac-sha384.js": fs.readFileSync("./web/crypto/hmac-sha384.js"),
   "/crypto/hmac-sha512.js": fs.readFileSync("./web/crypto/hmac-sha512.js"),
   "/crypto/md5.js": fs.readFileSync("./web/crypto/md5.js"),
   "/crypto/pbkdf2.js": fs.readFileSync("./web/crypto/pbkdf2.js"),
   "/crypto/rabbit.js": fs.readFileSync("./web/crypto/rabbit.js"),
   "/crypto/rc4.js": fs.readFileSync("./web/crypto/rc4.js"),
   "/crypto/sha1.js": fs.readFileSync("./web/crypto/sha1.js"),
   "/crypto/sha224.js": fs.readFileSync("./web/crypto/sha224.js"),
   "/crypto/sha256.js": fs.readFileSync("./web/crypto/sha256.js"),
   "/crypto/sha384.js": fs.readFileSync("./web/crypto/sha384.js"),
   "/crypto/sha512.js": fs.readFileSync("./web/crypto/sha512.js"),
   "/crypto/tripledes.js": fs.readFileSync("./web/crypto/tripledes.js")
}

dataService.initialize(startup);

function startup() {
   http.createServer(function(request, response) {
      var data = "";
      request.on("data", function(dataChunk) {
         data += dataChunk;
         if(data.length > 1e6) {
            data = "";
            response.writeHead(413, {"Content-Type": "text/plain"});
            request.connection.destroy();
         }
      });
      request.on("end", function() {
         var path_queryString = request.url.split("?");
         var path = path_queryString[0];
         var queryString = path_queryString[1];
         var name = path.split(".");
         var extension = name.pop();
         if(path == "/" || path == "/index.html") 
            serveCached(response, _index, "text/html");
         else if(path == "/channel.html")
            serveCached(response, _channel, "text/html");
         else if(path == "/all.css")
            serveCached(response, _all_css, "text/css");
         else if(path == "/save") 
            saveConfiguration(response, data, queryString);
         else if(path == "/load") 
            loadConfiguration(response, queryString);
         else if(extension == "js" && _js_files[path])
            serveCached(response, _js_files[path], "application/x-javascript");
         else serve404(response);
      });
   }).listen(8000);
}
function serveCached(response, content, contentType) {
   response.writeHead(200, {"Content-Type": contentType});
   response.end(content);
}
function saveConfiguration(response, request, id) {
   dataService.saveConfiguration(id, request);
   response.writeHead(200, {"Content-Type": "application/json"});
   response.end();
}
function loadConfiguration(response, id) {
   dataService.loadConfiguration(id, function(configuration) {
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(configuration);
   });
}
function serve404(response) {
   response.writeHead(404);
   response.end();
}
