var config = require('../config/config.js');
var connection = require('../config/connection.js');
var jwt = require('jsonwebtoken');

function login(req, res) {
  var payload = req.body
  // payload placeholder

  // payload = {
  //   'userPin': '1234',
  //   'auth0UserId': 1234
  // }

  // -------------------- this will add auth0UserId extracting from authorization header if no auth0UserId found in payload ------------------
  let tokenVerifiedUrl = '/api/accounts/user/post/pin/verified'
  if(!payload.auth0UserId && (req.url !== tokenVerifiedUrl)) {
    return res.redirect(307, tokenVerifiedUrl) //Verify auth0 token
  }
  if(!payload.auth0UserId && (req.url === tokenVerifiedUrl)) {
    var auth = req.headers.authorization
    var jwtToken = auth.split(' ')[1]
    try {
      var currentUser = jwt.verify(jwtToken, config.secret)
      payload.auth0UserId = currentUser.auth0UserId
    } catch (err) {
      console.error(err)
      return res.status(400).json({
        success: false,
        message: err.message,
        status: 400
      })
    }
  }
  // -------------------- end stupid code ------------------

  var { loginUser } = require('../db/user')

  loginUser(payload.auth0UserId, payload.userPin, (err, result)=> {
    if(err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        status: 400
      })
    }
    var user = result[0]
    if(!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials',
        status: 401
      })
    }
    var data = {
    	'userId': user.user_id,
      'auth0UserId': payload.auth0UserId,
      'accountId': user.account_id,
      'accountNo': user.account_no,
      'role': user.role_id,
      'roleName': user.role
    }
    var token = jwt.sign(data, config.secret, {
      expiresIn: 5000 //seconds
    });
    data.token = token
    return res.status(200).json({
      success: true,
      message: 'Login success',
      data: data,
      status: 200
    })
  })
}


module.exports = {
  login
}
