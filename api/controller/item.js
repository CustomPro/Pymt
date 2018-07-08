var config = require('../config/config.js');
var connection = require('../config/connection.js');
var jwt = require('jsonwebtoken');

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
    var { getAllItems } = require('../db/item')

    getAllItems(currentUser.accountId, null, (err, result)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      var items = {
        allItems: result
      }
      return res.status(200).json({
        success: true,
        message: 'Item list',
        data: items,
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
    var { getAllItems } = require('../db/item')
    var item_id = req.params.id

    getAllItems(currentUser.accountId, item_id, (err, items)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Item by id',
        data: items[0],
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
    if(currentUser.role > 2) {    //Owner = 1, Manage = 2, if not, Permission denined
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        status: 403
      })
    }
    var { createItem } = require('../db/item')
    var payload = req.body
    // fake load
    // payload = {
    //   "itemName": "Pizza",
    //   "image": "data:image/jpeg;base64,/9j/4RiDRXhpZgAATU0AKgA",
    //   "soldByWeight": "true",
    //   "trackInventory": "false",
    //   "allowBackorder": true,
    //   "isTaxable": true,
    //   "isEBT": "false",
    //   "isFSA": "false",
    //   "selectors": {
    //     "selectorId": 2,
    //     "selectorName": "Pizza Hut",
    //     "details": [
    //       {
    //         "name": "Chilli Pizza",
    //         "cost": 9.3,
    //         "price": 13.1,
    //         "quantityRemaining": 11,
    //         "itemWeight": 4.5
    //       },
    //       {
    //         "name": "Pizza Prawn",
    //         "cost": 11.15,
    //         "price": 16.12,
    //         "quantityRemaining": 10,
    //         "itemWeight": 4.0
    //       }
    //     ]
    //   },
    //   "modifiers": [
    //     {
    //       "modifierId": 2,
    //       "modifierName": "sausage",
    //       "modifiers": {
    //           "Chilli": "0.25",
    //           "Garlic": "0.2",
    //           "Tomato": "1",
    //           "Carot": "1.5",
    //           "Butter": "1.8"
    //       }
    //     }
    //   ],
    // }
    payload.account_id = currentUser.accountId

    createItem(payload, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Item created successfully',
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


function update(req, res) {
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
    var { updateItem } = require('../db/item')
    var payload = req.body
    // fake load
   /* payload = {
      "itemName": "Oishii",
      "image": "data:image/jpeg;base64,/9j/4RiDRXhpZgAATU0AKgA",
      "soldByWeight": "true",
      "trackInventory": "false",
      "allowBackorder": true,
      "isTaxable": true,
      "isEBT": "false",
      "isFSA": "false",
      "selectors": {
        "selectorId": 2,
        "selectorName": "Pizza Hut",
        "details": [
          {
            "name": "Chilli Pizza",
            "cost": 9.3,
            "price": 13.1,
            "quantityRemaining": 11,
            "itemWeight": 4.5
          },
          {
            "name": "Oishii Snack",
            "cost": 11.15,
            "price": 16.12,
            "quantityRemaining": 10,
            "itemWeight": 4.0
          }
        ]
      },
      "modifiers": [
        {
          "modifierId": 1,
          "modifierName": "condiments",
          "modifiers": {
              "Chilli": "0.25",
              "Garlic": "0.2",
              "Tomato": "1",
              "Carot": "1.5",
              "Butter": "1.8"
          }
        }
      ],
    }*/
    payload.account_id = currentUser.accountId
    payload.id = req.params.id
    updateItem(payload, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Item updated successfully',
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

function modifiers(req, res) {
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
    var { getModifiersForItem } = require('../db/modifier')
    var item_id = req.params.id

    getModifiersForItem(currentUser.accountId, item_id, (err, result)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Item\'s modifiers list',
        data: result,
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
  index,
  edit,
  create,
  update,
  modifiers
}
