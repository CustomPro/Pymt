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
    var { getAllModifier } = require('../db/modifier')

    getAllModifier(currentUser.accountId, null, (err, modifiers)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Modifier list',
        data: modifiers,
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
    var { getAllModifier } = require('../db/modifier')
    var modifier_id = req.params.id

    getAllModifier(currentUser.accountId, modifier_id, (err, modifiers)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Modifier by id',
        data: modifiers[0],
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
    var { createModifier } = require('../db/modifier')

    var payload = req.body
    payload.account_id = currentUser.accountId
    createModifier(payload, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Modifier created successfully',
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
    var { updateModifier } = require('../db/modifier')

    var payload = req.body
    //fale payload
    // payload = {
    //   "modifierName": "condiments",
    //   "modifiers": {
    //     "Lettuce": 2.2,
    //     "Tomato": 1.4,
    //     "Onion": 1.8,
    //     "Ketchup": 0.85,
    //     "Mustard": 1.99,
    //     "Pickle": null
    //     }
    // }
    payload.account_id = currentUser.accountId
    payload.id = req.params.id

    updateModifier(payload, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Modifier updated successfully',
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
  update
}
