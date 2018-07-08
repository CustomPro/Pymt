var config = require('../config/config.js');
var connection = require('../config/connection.js');
var jwt = require('jsonwebtoken');
var moment = require('moment');

function openDay(req, res) {
  var auth = req.headers.authorization
  if(!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
      status: 401
    })
  }
  var jwtToken = auth.split(' ')[1]
  try {
    var currentUser = jwt.verify(jwtToken, config.secret)
    if(currentUser.role > 2) {    //Owner = 1, Manage = 2, if not, Permission denined
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        status: 403
      })
    }
    var { createCashOpen } = require('../db/cash')
    var payload = req.body
    updateTime = new Date();
    payload.updateTime = updateTime
    payload.verifiedBy = payload.verifiedBy || currentUser.userId
    // fake placeholder
   /* payload = {
      "openingAmount": 455.99,
      "updateTime": "2018-05-21T19:06:18.537Z",
      "verifiedBy": 23
    }*/
    var updateTime = moment(payload.updateTime)
    if(!updateTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updateTime format',
        status: 400
      })
    }
    var opening = {
      opening_amount: payload.openingAmount,
      opening_date: updateTime.format('YYYY-MM-DD HH:mm:ss'),
      verify_by: payload.verifiedBy,
      account_id: currentUser.accountId
    }

    createCashOpen(opening, (err, result)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Day open success',
        status: 200
      })
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

function closeDay(req, res) {
  var auth = req.headers.authorization
  if(!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
      status: 401
    })
  }
  var jwtToken = auth.split(' ')[1]
  try {
    var currentUser = jwt.verify(jwtToken, config.secret)
    if(currentUser.role > 2) {    //Owner = 1, Manage = 2, if not, Permission denined
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        status: 403
      })
    }

    calculateClosing(currentUser.accountId, (err, result) => {
      if(err) return res.status(400).json({
        success: false,
        message: err.message,
        status: 400
      })
      var { updateCashClose } = require('../db/cash')
      var payload = req.body
      updateTime = new Date();
      payload.updateTime = updateTime
      payload.verifiedBy = payload.verifiedBy || currentUser.userId
      // fake payload
      // payload = {
      //   "closingAmount": 455.99,
      //   "updateTime": "2018-05-21T19:06:18.537Z",
      //   "verifiedBy": 23,
      //   "cardAmount": 283848.92,
      //   "cardBatchNumber": 2934785,
      //   "cardTransactionCount": 83,
      // }
      var updateTime = moment(payload.updateTime)
      if(!updateTime.isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid updateTime format',
          status: 400
        })
      }
      var closing = {
        closing_amount: result.currentClosingAmount,
        eod_till_user_entry: payload.closingAmount,
        card_amount: payload.cardAmount,
        card_batch_number: payload.cardBatchNumber,
        card_transaction_count: payload.cardTransactionCount,
        sales_amount: result.totalSalesAmount,
        total_drop_amount: result.totalDropsAmount,
        account_id: currentUser.accountId,
        verify_by: payload.verifiedBy,
        closing_date: updateTime.format('YYYY-MM-DD HH:mm:ss')
      }
      updateCashClose(closing, (err, result)=> {
        if(err) {
          return res.status(400).json({
            success: false,
            message: err.message,
            status: 400
          })
        }
        return res.status(200).json({
          success: true,
          message: 'Day close success',
          status: 200
        })
      })
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

function setEODTillAmount(req, res) {
  var payload = req.body
  // payload placeholder

  // payload = {
  // "tillAmount": 455.99,
  // "updateTime": "2018-05-21T19:06:18.537Z",
  // "verifiedBy": "userId"
  // }
  var auth = req.headers.authorization
  if(!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
      status: 401
    })
  }
  var jwtToken = auth.split(' ')[1]
  try {
    var currentUser = jwt.verify(jwtToken, config.secret)
    if(currentUser.role > 2) {    //Owner = 1, Manage = 2, if not, Permission denined
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        status: 403
      })
    }
    var { endDay } = require('../db/cash')

    endDay(payload.tillAmount, currentUser.accountId, currentUser.userId, (err, result)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      // Generate cash report and send email
      return res.status(200).json({
        success: true,
        message: 'Till amount set success and generated cash report',
        status: 200
      })
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

function safeDrop(req, res) {
  var auth = req.headers.authorization
  if(!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
      status: 401
    })
  }
  var jwtToken = auth.split(' ')[1]
  try {
    var currentUser = jwt.verify(jwtToken, config.secret)
    if(currentUser.role > 2) {    //Owner = 1, Manage = 2, if not, Permission denined
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        status: 403
      })
    }
    var { dropCash } = require('../db/cash')
    var payload = req.body
    updateTime = new Date();
    payload.dropTime = updateTime
    payload.dropBy = payload.dropBy || currentUser.userId
    // fake payload
    // payload = {
    //   "dropAmount": 455.99,
    //   "dropTime": "2018-05-21T19:06:18.537Z",
    //   "dropBy": 23
    // }
    var dropTime = moment(payload.dropTime)
    if(!dropTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dropTime format',
        status: 400
      })
    }
    var drop = {
      drop_amount: payload.dropAmount,
      drop_time: dropTime.format('YYYY-MM-DD HH:mm:ss'),
      drop_by: payload.dropBy,
      account_id: currentUser.accountId
    }

    dropCash(drop, (err, result)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Cash drop success',
        status: 200
      })
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

function drops(account_id, callback) {
  var { getCashDrops } = require('../db/cash')

  getCashDrops(account_id, (err, cash)=> {
    if(err) {
      return callback(err, null)
    }
    var drops = cash.drops
    var total = 0
    drops = drops.map((drop, i) => {
      total += drop.amount
      return {
        dropAmount: drop.amount,
        dropTime: drop.drop_time,
        dropBy: drop.drop_by
      }
    })
    var data = {
      cashDrop: {
        total: total,
        lastUpdate: (drops.length && drops[0].dropTime) || new Date(),
        drops: drops
      }
    }
    callback(null, { cash, drop: data })
  })
}

function getCurrentCashDrops(req, res) {
  var auth = req.headers.authorization
  if(!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
      status: 401
    })
  }
  var jwtToken = auth.split(' ')[1]
  try {
    var currentUser = jwt.verify(jwtToken, config.secret)
    if(currentUser.role > 2) {    //Owner = 1, Manage = 2, if not, Permission denined
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        status: 403
      })
    }
    drops(currentUser.accountId, (err, data)=>{
      if(err) return res.status(400).json({
        success: false,
        message: err.message,
        status: 400
      })
      return res.status(200).json({
        success: true,
        message: 'Current cash drops',
        data: data.drop,
        status: 200
      })
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

function calculateClosing(account_id, callback) {
  var { getCurrentTotalSaleAmount } = require('../db/payment')
  getCurrentTotalSaleAmount(account_id, (err, result) => {
    if(err) return callback(err, result)

    drops(account_id, (err, data) => {
      if(err) return callback(err, result)

      var totalSalesAmount = 0
      if(result && result.length) totalSalesAmount = result[0].total_sales_amount

      var totalDropsAmount = data.drop.cashDrop.total
      var openingAmount = data.cash.opening_amount

      var closing_amount = (openingAmount + totalSalesAmount) - totalDropsAmount
      var last_update = new Date()
      var closingAmount = {
        "currentOpeningAmount": openingAmount,
        "currentClosingAmount": closing_amount,
        "totalDropsAmount": totalDropsAmount,
        "totalSalesAmount": totalSalesAmount,
        "lastUpdate": last_update,
        "cashDrop": data.drop
      }
      callback(null, closingAmount)
    })

  })
}

function getClosing(req, res) {
  var auth = req.headers.authorization
  if(!auth || auth.indexOf('Bearer ') !== 0) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
      status: 401
    })
  }
  var jwtToken = auth.split(' ')[1]
  try {
    var currentUser = jwt.verify(jwtToken, config.secret)
    if(currentUser.role > 2) {    //Owner = 1, Manage = 2, if not, Permission denined
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        status: 403
      })
    }
    calculateClosing(currentUser.accountId, (err, result) => {
      if(err) return res.status(400).json({
        success: false,
        message: err.message,
        status: 400
      })

      var data = {
        currentOpeningAmount: result.currentOpeningAmount,
        currentClosingAmount: result.currentClosingAmount,
        lastUpdate: result.lastUpdate,
        cashDrop: result.cashDrop
      }

      return res.status(200).json({
        success: true,
        message: 'Current closing amount',
        data: data,
        status: 200
      })

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
  openDay,
  closeDay,
  setEODTillAmount,
  safeDrop,
  getCurrentCashDrops,
  getClosing
}
