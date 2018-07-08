const config = require('../config/config.js');
const connection = require('../config/connection.js');
const jwt = require('jsonwebtoken');
const request = require('request');
const parser = require('xml2json');

const balance = (req, res) => {
    let auth = req.headers.authorization
    if(!auth || auth.indexOf('Bearer ') !== 0) {
        return res.status(401).json({
        success: false,
        message: 'Unauthorized request',
        status: 401
        })
    }

    let jwtToken = auth.split(' ')[1]
    try {
        let currentUser = jwt.verify(jwtToken, config.secret);
        let payload = req.body
        let merchantId = payload.merchantId;
        let cardUsername = payload.username;
        let cardUserpass = payload.password
        let cardNumber = payload.cardNumber;
        let accountType = currentUser.email || currentUser.phoneNumber;
        let cardAction = payload.cardAction;
        let numPoints = payload.numPoints;

        let xml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Header>
            <UserCredentials xmlns="http://tempuri.org/">
              <userName>${cardUsername}</userName>
              <password>${cardUserpass}</password>
            </UserCredentials>
          </soap:Header>
          <soap:Body>
            <BalanceInquiryToSynergyServer xmlns="${config.giftcard_namespace}">
              <MerchantRockCommID>${merchantId}</MerchantRockCommID>
              <CustomerCardNumber>${cardNumber}</CustomerCardNumber>
              <NumPoints>${numPoints}</NumPoints>
              <CardAction>${cardAction}</CardAction>
              <CheckNumber>string</CheckNumber>
              <AccountType>${accountType}</AccountType>
              <ResponseFormat>Json</ResponseFormat>
            </BalanceInquiryToSynergyServer>
          </soap:Body>
        </soap:Envelope>`
        
        const opts = {
            body: xml,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                SOAPAction: config.giftcard_server_url + '/BalanceInquiryToSynergyServer'
            }
        }

        request.post(config.giftcard_server_url, opts, (err, response) => {
            if(err) {
                return res.status(400).json({
                success: false,
                message: err.message,
                status: 400
                })
            }
            let json = parser.toJson(xml);
            try {
                let balance = json["soap:Envelope"]["soap:Body"]["BalanceInquiryToSynergyServerResponse"]["BalanceInquiryToSynergyServerResult"];
                return res.status(200).json({
                    success: true,
                    message: {balance},
                    status: 200
                })    
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    status: 400
                })
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            success: false,
            message: err.message,
            status: 400
        })
    }
}

const load = (req, res) => {
    let auth = req.headers.authorization
    if(!auth || auth.indexOf('Bearer ') !== 0) {
        return res.status(401).json({
        success: false,
        message: 'Unauthorized request',
        status: 401
        })
    }

    let jwtToken = auth.split(' ')[1]
    try {
        let currentUser = jwt.verify(jwtToken, config.secret);
        let payload = req.body
        let merchantId = payload.merchantId;
        let cardUsername = payload.username;
        let cardUserpass = payload.password
        let cardNumber = payload.cardNumber;
        let accountType = currentUser.email || currentUser.phoneNumber;
        let cardAction = payload.cardAction;
        let numPoints = payload.numPoints;

        let xml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Header>
            <UserCredentials xmlns="http://tempuri.org/">
              <userName>${cardUsername}</userName>
              <password>${cardUserpass}</password>
            </UserCredentials>
          </soap:Header>
          <soap:Body>
            <LoadActivateGiftCard xmlns="${config.giftcard_namespace}">
              <MerchantRockCommID>${merchantId}</MerchantRockCommID>
              <CustomerCardNumber>${cardNumber}</CustomerCardNumber>
              <NumPoints>${numPoints}</NumPoints>
              <CardAction>${cardAction}</CardAction>
              <CheckNumber>string</CheckNumber>
              <AccountType>${accountType}</AccountType>
              <ResponseFormat>Json</ResponseFormat>
            </LoadActivateGiftCard>
          </soap:Body>
        </soap:Envelope>`
        
        const opts = {
            body: xml,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                SOAPAction: config.giftcard_server_url + '/LoadActivateGiftCard'
            }
        }

        request.post(config.giftcard_server_url, opts, (err, response) => {
            if(err) {
                return res.status(400).json({
                success: false,
                message: err.message,
                status: 400
                })
            }

            let json = parser.toJson(xml);
            try {
                let load = json["soap:Envelope"]["soap:Body"]["LoadActivateGiftCardResponse"]["LoadActivateGiftCardResult"];
                return res.status(200).json({
                    success: true,
                    message: {load},
                    status: 200
                })    
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    status: 400
                })
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            success: false,
            message: err.message,
            status: 400
        })
    }
}

const redeem = (req, res) => {
    let auth = req.headers.authorization
    if(!auth || auth.indexOf('Bearer ') !== 0) {
        return res.status(401).json({
        success: false,
        message: 'Unauthorized request',
        status: 401
        })
    }

    let jwtToken = auth.split(' ')[1]
    try {
        let currentUser = jwt.verify(jwtToken, config.secret);
        let payload = req.body
        let merchantId = payload.merchantId;
        let cardUsername = payload.username;
        let cardUserpass = payload.password
        let cardNumber = payload.cardNumber;
        let accountType = currentUser.email || currentUser.phoneNumber;
        let cardAction = payload.cardAction;
        let numPoints = payload.numPoints;

        let xml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Header>
            <UserCredentials xmlns="http://tempuri.org/">
              <userName>${cardUsername}</userName>
              <password>${cardUserpass}</password>
            </UserCredentials>
          </soap:Header>
          <soap:Body>
            <RedeemGiftCardOnlyToSynergyServer xmlns="http://tempuri.org/">
              <MerchantRockCommID>${merchantId}</MerchantRockCommID>
              <CustomerCardNumber>${cardNumber}</CustomerCardNumber>
              <CardAction>${cardAction}</CardAction>
              <NumPoints>${numPoints}</NumPoints>
              <AccountType>${accountType}</AccountType>
              <ResponseFormat>Xml</ResponseFormat>
            </RedeemGiftCardOnlyToSynergyServer>
          </soap:Body>
        </soap:Envelope>`
        
        const opts = {
            body: xml,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                SOAPAction: config.giftcard_server_url + '/RedeemGiftCardOnlyToSynergyServer'
            }
        }

        request.post(config.giftcard_server_url, opts, (err, response) => {
            if(err) {
                return res.status(400).json({
                success: false,
                message: err.message,
                status: 400
                })
            }
            let json = parser.toJson(xml);
            try {
                let redeem = json["soap:Envelope"]["soap:Body"]["RedeemGiftCardOnlyToSynergyServerResponse"]["RedeemGiftCardOnlyToSynergyServerResult"];
                return res.status(200).json({
                    success: true,
                    message: {redeem},
                    status: 200
                })    
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    status: 400
                })
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            success: false,
            message: err.message,
            status: 400
        })
    }
}

module.exports = {
    balance,
    load,
    redeem
}