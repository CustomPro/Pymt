var connection = require('../config/connection.js');

function getUserRoles(callback) {
  var sql = 'select id, name from user_role'
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function getAllUsers(account_id, callback) {
  var sql = `select * from users where account_id = ${account_id}`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function createUser(user, callback) {
  var sql = `
  insert into users (first_name, last_name, email, pin, role_id, auth0_user_id, account_id)
  values ('${user.first_name}', '${user.last_name}', '${user.email}',
  '${user.pin}', ${user.role_id}, '${user.auth0_user_id}', ${user.account_id})
  `
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function editUser(auth0_user_id, callback) {
  var sql = `select * from users where auth0_user_id = '${auth0_user_id}'`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function deleteUser(auth0_user_id, callback) {
  var sql = `delete from users where auth0_user_id = '${auth0_user_id}'`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function getAccountIdByUserId(auth0_user_id, callback) {
  var sql = `select account_id from users where auth0_user_id = '${auth0_user_id}'`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function loginUser(auth0_user_id, pin, callback) {
  var sql = `select u.id user_id, u.account_id, r.id role_id, r.name role from users u inner join user_role r
where auth0_user_id = '${auth0_user_id}' and pin = '${pin}' and r.id = u.role_id`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

module.exports = {
  getUserRoles,
  getAccountIdByUserId,
  createUser,
  editUser,
  deleteUser,
  loginUser,
  getAllUsers
}
