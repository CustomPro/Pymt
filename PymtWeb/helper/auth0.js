var config = require('../config/config.js');
var Client = require('node-rest-client').Client;
var client = new Client();

function createAuth0User(user, callback) {
  var token = require('../helper').token;

  if(!token) return callback(new Error('No token exists in server'), null)

  var args = {
    data: {
      "connection": config.auth0_connection,
      "name": user.first_name+ " " + user.last_name,
      "given_name": user.first_name,
      "family_name": user.last_name,
      "email": user.email,
      "password": user.password,
      "user_metadata": {
        "pin": user.pin,
        "role_id": user.role_id,
        "account_id": user.account_id
      },
      "email_verified": false,
      "verify_email": false,
      "app_metadata": {}
    },
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token.access_token
    }
  }
  var url = config.audience + 'users'
  client.post(url, args, function (data, response) {
    // parsed response body as js object
    console.log('------------------------- auth0 create user response body -------------------')
    console.log(data);
    if(data && !data.error) {
      callback(null, data)
    } else {
      return callback(new Error(data.error_description || data.message), null)
    }
  });
}


module.exports = {
  createAuth0User
}
