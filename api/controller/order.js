var config = require('../config/config.js');
var connection = require('../config/connection.js');
var jwt = require('jsonwebtoken');
var moment = require('moment');

function index(req, res) {
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
    var { getAllOrder } = require('../db/order')

    getAllOrder(currentUser.accountId, null, (err, orders)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Order list',
        data: orders,
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

function orders(req, res) {
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
    var { getAllOrder } = require('../db/order')

    getAllOrder(currentUser.accountId, null, (err, orders)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      orders = orders.map(order => order.orderObj)
      return res.status(200).json({
        success: true,
        message: 'Order History list',
        data: orders,
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

function edit(req, res) {
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
    var { getAllOrder } = require('../db/order')

    var tran_id = req.params.id

    getAllOrder(currentUser.accountId, tran_id, (err, orders)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      orders = orders.map(order => order.orderObj)
      return res.status(200).json({
        success: true,
        message: 'Order By Transaction Id',
        data: orders[0],
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

function create(req, res) {
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
    var { createOrder } = require('../db/order')

    var payload = req.body
    // fake payload
    // payload = {
    //   "cartNumber": Math.floor(Math.random(10)*30000), //cartNumber is unique across platform assigned new if null
    //   "status": "UNPAID",
    //   "tableId": "1",
    //   "orderObj": {
    //     "orderDate": moment(new Date("2018-05-21T22:14:05.255Z")).format('YYYY-MM-DD HH:mm:ss'),
    //     "orderType": 'CASH_ON_DELIVERY',
    //     "tableNumber": 12,
    //     "transactionId": Math.floor(Math.random(10)*30000), //cartNumber is unique across platform assigned new if null
    //     "orderStatus": "CART",
    //     "cartTotal": 7.34,
    //     "discountPercent": "0",
    //     "discountAmount": 0,
    //     "itemQuantity": 5,
    //     "items": [
    //       {
    //         "itemId": 40,
    //         "name": "Cheeseburger Small",
    //         "price": 3.00,
    //         "quantity": 1,
    //         "isTaxable": false,
    //         "isEBT": true,
    //         "isFSA": true,
    //         "modifiers": {
    //         "Cheese": 0.5,
    //         "Tomato": 0
    //         }
    //       },
    //       {
    //         "itemId": 41,
    //         "name": "Cheeseburger Medium",
    //         "price": 4.00,
    //         "quantity": 2,
    //         "isTaxable": true,
    //         "isEBT": false,
    //         "isFSA": false,
    //         "modifiers": {}
    //       },
    //     ]
    //   }
    // }
    payload.cartNumber = Math.floor(Math.random(10)*30000)
    payload.orderObj.orderDate = moment().format('YYYY-MM-DD HH:mm:ss')
    if(!payload.orderObj.transactionId)
        payload.orderObj.transactionId = Math.floor(Math.random(10)*30000)
      
    createOrder(payload, currentUser.accountId, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Order created successfully',
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


function report(req, res) {
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
    var { getOrdersByDateRange } = require('../db/order')

    var from = moment(req.params.from, 'MMDDYYYY')
    var to = moment(req.params.to, 'MMDDYYYY')

    if(!from.isValid() || !to.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format (Must Be: MMDDYYYY)',
        status: 400
      })
    }

    getOrdersByDateRange(currentUser.accountId, from.format('YYYY-MM-DD HH:mm:ss'), to.format('YYYY-MM-DD HH:mm:ss'), (err, orders)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      orders = orders.map(order => ({
        "orderDate": order.order_date,
        "transactionId": order.transaction_id,
        "orderStatus": order.order_status,
        "cartTotal": order.cart_total,
        "discountPercent": order.discount_percent,
        "discountAmount": order.discount_amount,
        "itemQuantity": order.item_quantity
      }))
      return res.status(200).json({
        success: true,
        message: 'Simple order list by date range',
        data: orders,
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

function totals(req, res) {
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
    var { getOrderTotalsByDateRange } = require('../db/order')

    var from = moment(req.params.from, 'MMDDYYYY')
    var to = moment(req.params.to, 'MMDDYYYY')

    if(!from.isValid() || !to.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format (Must Be: MMDDYYYY)',
        status: 400
      })
    }

    getOrderTotalsByDateRange(currentUser.accountId, from.format('YYYY-MM-DD HH:mm:ss'), to.format('YYYY-MM-DD HH:mm:ss'),
    (err, orders)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      orders = orders.map(order => ({
        "date": order.order_date,
        "ordersAmount": order.orders_amount
      }))
      return res.status(200).json({
        success: true,
        message: 'Daily Order Total Amounts',
        data: orders,
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

function tips(req, res) {
  var from = moment(req.params.from, 'MMDDYYYY')
  var to = moment(req.params.to, 'MMDDYYYY')
  var tips = [
    //this is an array of users and their tip amount based off the provided range
    {
      "userId": "",
      "tipAmount": 4.50,
      "lastUpdated": "2018-05-21T19:11:26.777Z",
    },
    {
      "userId": "",
      "tipAmount": 4.50,
      "lastUpdated": "2018-05-21T19:11:26.777Z",
    },
    {
      "userId": "",
      "tipAmount": 4.50,
      "lastUpdated": "2018-05-21T19:11:26.777Z",
    }
  ]

  return res.status(200).json({
    success: true,
    message: 'Order user tips',
    data: tips,
    status: 200
  })
}

module.exports = {
  index,
  orders,
  edit,
  create,
  totals,
  report,
  tips
}
