var express = require('express');
var app = express();
var router = express.Router();
var multer = require('multer');
var path = require('path');
var jwt = require('jsonwebtoken');
var Client = require('node-rest-client').Client;
var client = new Client();
var config = require('../config/config.js');
var connection = require('../config/connection.js');

/***********************************************************************************************************************/
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        console.log("working1");
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage: storage }).single('userPhoto');
/***********************************************************************************************************************/
router.get('/', function(req, res){
  // var callbackUrl = 'http://localhost:3000/dashboard'
  // var parameters = 'response_type=code&client_id='+config.client_id+'&connection='+config.auth0_connection+'&redirect_uri='+callbackUrl
  // return res.redirect(config.auth0_url + 'authorize?' + parameters)
  return res.render('pages/index', {layout: false})
});

router.get('/logout',function(req, res){
  var callbackUrl = 'http://localhost:3000'
  var parameters = 'client_id='+config.client_id+'&returnTo='+callbackUrl
  return res.redirect(config.auth0_url + '/v2/logout?' + parameters)
});

/***********************************************************************************************************************/
router.get('/dashboard', function (req, res) {
  console.log('---------------- loggedin jwt user ------------')
  console.log(req.cookies.jwtToken)
  console.log(jwt.verify(req.cookies.jwtToken, config.secret))
  res.render('pages/dashboard');
});
/***********************************************************************************************************************/
router.get('/account', function (req, res) {
    res.render('pages/account');
});

/***********************************************************************************************************************/



/***********************************************************************************************************************/
router.post('/login',(req,res) => {
  var email = req.body.email;
  var password = req.body.password;

  if (email && password) {
    var args = {
      data: {
        "grant_type": "password",
        "username": email,
        "password": password,
        "audience": config.audience,
        "scope": "openid profile email",
        "client_id": config.client_id,
        "client_secret": config.client_secret
      },
      headers: {
        "Content-Type": "application/json"
      }
    }
    client.post(config.auth0_url + "/oauth/token", args, (data, response) => {
      // parsed response body as js object
      if(data && data.access_token) {
        args = {
          data: {
            "audience": config.audience,
            "scope": "openid profile email",
            "client_id": config.client_id,
            "client_secret": config.client_secret
          },
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+ data.access_token
          }
        }
        client.post(config.auth0_url + "/userinfo", args, (profile, response) => {
          // parsed response body as js object
          if(profile && profile.sub) {
            profile.access_token = data.access_token
            profile.id_token = data.id_token
  
            var { getAccountIdByUserId } = require('../db/user')
            getAccountIdByUserId(profile.sub, (err, result) => {
              if(err) return res.render('pages/error', { error: err.message });
              
              if (result.length > 0) {
                profile.account_id = result[0].account_id
              }
              var token = jwt.sign(profile, config.secret, {
                  expiresIn: 5000
              });
              res.cookie('jwtToken', token, { maxAge: 900000, httpOnly: true });
              res.redirect('dashboard');
            })
          } else {
            res.render('pages/error', {error: profile.error});
          }
        });
      }
    });
  } else {
    res.render('pages/error', {error: data.error_description || data.message});
  }
});
/***********************************************************************************************************************/
router.post('/forgotPassword',function(req,res) {
    var email = req.body.useremail;
    console.log('inside forgot password',email);
    var sql = "SELECT * FROM users WHERE email="+"'"+email+"'";
    connection.query(sql,(err,result) =>{
      if(result){
          res.redirect('/');
      }else{
          res.redirect('/forgotpasword',{error:"Please enter correct email"});
      }
    });

});
/***********************************************************************************************************************/
router.post('/updatePassword', (req,res)=>{
    var newpassword = req.body.password;
    var email = req.body.email;
    var sql = "UPDATE users WHERE email="+"'"+email+"'"+"SET password="+"'"+newpassword+"'";
    connection.query(sql, (err,result) =>{
        if(result){
            alert("Password updated successfully");
            res.redirect('/login');
        }
    });
});


/***********************************************************************************************************************/
router.post('/account',(req,res) => {
    var email = req.body.email;
    var pin = req.body.pin || 1234;
    var password = req.body.password || 'test';
    var company_name = req.body.company_name;
    var merchant_id = req.body.merchant_id
    var given_name = req.body.given_name;
    var family_name = req.body.family_name;
    var name = given_name +" " + family_name;
    var phone_no = req.body.phone_no;
    var tax_rate =  req.body.tax_rate;
    var company_address = req.body.company_address || req.body.company_address2;
    var state = req.body.state;
    var companyzip = req.body.companyzip;
    var role_id = req.body.role;
    var inventory_tracking = req.body.inventory_tracking
    if(inventory_tracking == 'on')
      inventory_tracking = 1;
    else
      inventory_tracking = 0;

    var helper = require('../helper');
    var userid = email;
    var args = {
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer ' + helper.token.access_token
      },
      data: {
        "connection": config.auth0_connection,
        "email": email,
        "password": password,
        "user_metadata": {},
        "email_verified": false,
        "verify_email": false,
        "app_metadata": {
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
      }
    }


    client.post(config.auth0_url + "/api/v2/users", args, (data, response) => {
      if (!data || !data.user_id)
        return res.render('pages/error', {error: data.error_description || data.message});
      var accountNo = data.user_id;
     // var merchantId = guid();

      var sql = `
        insert into account (
          account_no,
          company_name,
          phone_no,
          tax_rate,
          address,
          zip,
          merchant_id,
          tip_enabled,
          bar_tab,
          signature_amount,
          cash_enabled,
          discount_enabled,
          fsa_enabled,
          ebt_enabled,
          table_tab,
          table_num,
          gift_cards,
          cash_discount,
          inventory_tracking
        ) values (
          '${accountNo}',
          '${company_name}',
          '${phone_no}',
          ${tax_rate},
          '${company_address}',
          '${companyzip}',
          '${merchant_id}',
          1,
          1,
          10000,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          '${inventory_tracking}'
        )`;

      connection.query(sql, function(err,result) {
        if(err) return res.render('pages/error', { error: err.message })
        if(result) {
          var sqlQuery = `INSERT INTO users SET ?`
          var set = {
            first_name:given_name,
            last_name:family_name,
            email,
            pin,
            role_id,
            auth0_user_id: accountNo,
            account_id: result.insertId
          }
          connection.query(sqlQuery, set, (err, result) => {
            if(err) return res.render('pages/error', { error: err.message })
            return res.redirect('dashboard');
          })
        }
      });
    })
 
});

const guid = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
/***********************************************************************************************************************/
module.exports = router;

/***********************************************************************************************************************/
