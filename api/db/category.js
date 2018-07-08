var connection = require('../config/connection.js');

function getAllCategory(account_id, callback) {
  var sql = `select * from category where account_id = ${account_id}`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function editCategory(category_id, callback) {
  var sql = `select * from category where id = ${category_id}`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function createCategory(category, callback) {
  var sql = `insert into category (name, short_name, color, image, active, account_id)
  values ('${category.name}', '${category.short_name}', '${category.color}', '${category.image}',
  ${category.active}, ${category.account_id})`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function updateCategory(category, callback) {
  category.active = typeof category.active === 'undefined' || category.active
  var sql = `update category set name = '${category.name}', short_name = '${category.short_name}',
  color = '${category.color}', image = '${category.image}', active = ${category.active}
  where id = ${category.id} and account_id = ${category.account_id}`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

module.exports = {
  getAllCategory,
  editCategory,
  createCategory,
  updateCategory
}
