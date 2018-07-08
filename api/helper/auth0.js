var config = require('../config/config.js');
var Client = require('node-rest-client').Client;
var client = new Client();
var jwt = require('jsonwebtoken');


function createAuth0User(user, callback) {
  var token = require('../helper').token;

  if(!token) return callback(new Error('No auth0 token received yet in server, try again after a few seconds'), null)
    userid = user.email;
    name = user.first_name+ ' ' + user.last_name;
    given_name = user.first_name;
    family_name =user.last_name;
    pin = user.pin;
    phone_no = user.phoneNumber;
    company_name = user.company_name;
    company_address = user.city+ ' ' +user.street2;
    tax_rate = user.taxRate;
    state = user.state;
    companyzip = user.zip;
    merchant_id = user.merchantId;
    role_id = user.role;
    inventory_tracking = user.inventory_tracking;
  var args = {
    data: {
      'connection': config.auth0_connection,
      'name': name,
      'given_name': given_name,
      'family_name': family_name,
      'email': user.email,
      'password': user.password,
      'user_metadata': {
        'pin': pin,
        'role_id': role_id,
        'account_id': user.account_id
      },
      'email_verified': false,
      'verify_email': false,
      'app_metadata': {
          userid,
          name,
          given_name,
          family_name,
          pin,
          phone_no,
          company_name,
          company_address,
          tax_rate,
          state,
          companyzip,
          merchant_id,
          role_id,
          inventory_tracking
      }
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token.access_token
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


function updateAuth0User(user, callback) {
  var token = require('../helper').token;

  if(!token) return callback(new Error('No auth0 token received yet in server, try again after a few seconds'), null)
console.log(user)
  var { getAuth0UserIdByUserId } = require('../db/user')
  getAuth0UserIdByUserId(user.account_id, user.id, user.role_id, (err, result) => {
    if(err) callback(err, result)
    else {
      console.log(result)
      if(!result || !result.length) callback(new Error('User not found'), null)

      var args = {
        data: {
          'connection': config.auth0_connection,
          // 'email': user.email,   // <----- auth0 return error: "Cannot update password and email simultaneously"
          'password': user.password,
          'user_metadata': {
            'pin': user.pin,
            'role_id': user.role_id,
            'account_id': user.account_id
          }
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token.access_token
        }
      }
      var url = config.audience + 'users/' + result[0].auth0_user_id
      client.patch(url, args, function (data, response) {
        // parsed response body as js object
        console.log('------------------------- auth0 update user response body -------------------')
        console.log(data);
        if(data && !data.error) {
          callback(null, data)
        } else {
          return callback(new Error(data.error_description || data.message), null)
        }
      });

    }
  })

}


function verifyAuth0Token(req, res, next) {
  var auth = req.headers.authorization
  if(!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
      status: 401
    })
  }
  var accessToken = auth.split(' ')[1]

  var args = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ accessToken
    }
  }
  client.post(config.auth0_url + 'userinfo', args, function (profile, response) {
    // parsed response body as js object
    console.log('------------------------- auth0 profile response body -------------------')
    console.log(profile);
    if(profile && !profile.error) {

      var { getAccountInfoByAuth0UserId } = require('../db/user')
      getAccountInfoByAuth0UserId(profile.sub, (err, result) => {
        if(err) {
          return res.status(400).json({
            success: false,
            message: err.message,
            status: 401
          })
        }
        var user = result[0]
        if(!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
            status: 404
          })
        }

        var credentials = {
          accessToken: accessToken,
          accountId: user.account_id,
          accountNo: user.account_no,
          userId: user.id,
          role: user.role_id,
          roleName: user.role_name,
          auth0UserId: user.auth0_user_id
        }

        var token = jwt.sign(credentials, config.secret, {
            expiresIn: 5000 //seconds
        });

        req.headers.authorization = 'Bearer ' + token
        next()
      })
    } else {
      return res.status(400).json({
        success: false,
        message: err.message,
        status: 402
      })
    }
  });
}



module.exports = {
  createAuth0User,
  updateAuth0User,
  verifyAuth0Token
}
