var Client = require('node-rest-client').Client;
var client = new Client();
var config = require('../config/config')

var getAuth0Token = function() {
  var args = {
    data: {
      "client_id": config.client_id,
      "client_secret": config.client_secret,
      "audience": config.audience,
    	"grant_type": "client_credentials"
    },
    headers: {
      "Content-Type": "application/json"
    }
  }
  var url = config.auth0_url+ "/oauth/token"

  client.post(url, args, function (data, response) {
    console.log(data);
    module.exports.token = data
  });
}


module.exports.getAuth0Token = getAuth0Token;
