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
    var { getAllCategory } = require('../db/category')

    getAllCategory(currentUser.accountId, (err, result)=> {
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      var categories = result.map(category => ({
        categoryId: category.id,
        active: category.active,
        categoryName: category.name,
        categoryColor: category.color,
        image: category.image
      }))
      return res.status(200).json({
        success: true,
        message: 'Category list',
        data: categories,
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

    var id = req.params.id
    var { editCategory } = require('../db/category')

    editCategory(id, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      if(!result || !result.length) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
          status: 404
        })
      }
      var category = result[0]
      category = {
        categoryId: category.id,
        active: category.active,
        categoryName: category.name,
        categoryColor: category.color,
        image: category.image
      }
      return res.status(200).json({
        success: true,
        message: 'Category by id',
        data: category,
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
    var { createCategory } = require('../db/category')

    var payload = req.body
    createCategory({
      name: payload.categoryName,
      short_name: payload.categoryName.substr(0, 2),
      color: payload.categoryColor,
      image: payload.image,
      active: payload.active,
      account_id: currentUser.accountId
    }, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Category created successfully',
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
    var { updateCategory } = require('../db/category')

    var id = req.params.id
    var payload = req.body
    updateCategory({
      id: id,
      name: payload.categoryName,
      short_name: payload.categoryName.substr(0, 2),
      color: payload.categoryColor,
      image: payload.image,
      active: payload.active,
      account_id: currentUser.accountId
    }, (err, result)=>{
      if(err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          status: 400
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
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
