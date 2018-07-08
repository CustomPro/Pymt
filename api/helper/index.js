var Client = require('node-rest-client').Client;
var client = new Client();
var config = require('../config/config')

module.exports.getAuth0Token = function() {
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
  var url = config.auth0_url+ "oauth/token"

  client.post(url, args, function (data, response) {
    module.exports.token = data
  });
}


module.exports.sendMail = function(to, subject, text, html, attachment, callback) {
  var mailgun = require("mailgun-js");
  var api_key = config.mailgun_apikey;
  var DOMAIN = config.mailgun_domain;
  var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

  var attch = ''
  if(attachment) attch = new mailgun.Attachment({data: attachment.file, filename: attachment.filename});

  var data = {
    from: config.mailgun_sender,
    to: to,
    subject: subject,
    text: text,
    html: html,
    attachment: attch
  };

  mailgun.messages().send(data, function (error, body) {
    if(callback) callback(error, body)
  });
}

module.exports.sendSMS = (to, content, callback) => {
  var client = require('twilio')(
    config.twilio_sid,
    config.twilio_auth_token
  );

  client.messages.create({
    from: config.twilio_sender,
    to: to,
    body: content
  }, (error, body) => {
    if(callback) callback(error, body);
  });
}
