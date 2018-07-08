var connection = require('../config/connection.js');

function getAccountNames(callback) {
  var sql = 'select * from account'
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function getAllAccounts(account_id, user_id, merchant_id, callback) {
  var sql = 'select * from account'
  if(account_id) sql += ` where id = '${account_id}'`
  else if(merchant_id) sql += ` where merchant_id = '${merchant_id}'`
  else if(user_id) sql += ` where id = (select account_id from users where id = '${user_id}')`

  connection.query(sql, function(err, accounts) {
    if(err) callback(err, null)
    else {
      if(accounts && accounts.length) {
        accounts = accounts.map(account => ({
          "id": account.id,
          "physicalAddress": account.address,
          "street2": account.street,
          "city": account.city,
          "state": account.state,
          "zip": account.zip,
          "phoneNumber": account.phone_no,
          "accountId": account.account_no,
          "merchantId": account.merchant_id,
          "deviceSettings": JSON.parse(account.device_settings),
          "preferences": {
            "tipsEnabled": account.tip_enabled,
            "barTab": account.bar_tab,
            "taxRate": account.tax_rate,
            "signatureAmount": account.signature_amount,
            "cashEnabled": account.cash_enabled,
            "discountEnabled": account.discount_enabled,
            "FSAEnabled": account.fsa_enabled,
            "EBTEnabled": account.ebt_enabled,
            "tableTab": account.table_tab,
            "tableNum": account.table_num,
            "giftCards": account.gift_cards,
            "cashDiscount": account.cash_discount
          },
        }))
        var count = accounts.length
        var getChildren = () => {
          --count
          var account = accounts[count]
          var { getAllCategory } = require('./category')
          getAllCategory(account.id, (err, categories)=> {
            if(err) callback(err, null)
            else {
              account.categories = categories.map(it => ({
                "categoryId": it.id,
                "categoryName": it.name,
                "shortName": it.short_name,
                "categoryColor": it.color,
                "image": it.image
              }))

              var { getAllUsers } = require('./user')
              getAllUsers(account.id, (err, users) => {
                if(err) callback(err, null)
                else {
                  let owner = users.filter(user => user.role_id === 1)[0]
                  if(!owner) return callback(new Error('Owner not found for account no: ' + account.account_no), null)

                  account.firstName = owner.first_name
                  account.lastName = owner.last_name
                  account.emailAddress = owner.email
                  account.userPin = owner.pin
                  account.role = owner.role_id

                  users.splice(users.indexOf(owner), 1)

                  account.accountUsers = users.map(user => ({
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "emailAddress": user.email,
                    "userPin": user.pin,
                    "userId": user.id,
                    "role": user.role_id
                  }))
                  if(count -1 != -1) getChildren()
                  else callback(err, accounts)
                }

              })

            }
          })
        }

        getChildren()

      } else {
        callback(err, [])
      }
    }
  });
}

function createAccount(account, callback) {
  var sql = `
  insert into account (
    account_no,
    company_name,
    phone_no,
    address,
    street,
    city,
    state,
    zip,
    country,
    merchant_id,
    device_settings,
    tip_enabled,
    bar_tab,
    tax_rate,
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
    '${account.accountId}',
    '${account.company_name}',
    '${account.phoneNumber}',
    '${account.physicalAddress}',
    '${account.street2}',
    '${account.city}',
    '${account.state}',
    '${account.zip}',
    '${account.country}',
    '${account.merchantId}',
    '${JSON.stringify(account.deviceSettings)}',
    ${account.preferences.tipsEnabled},
    ${account.preferences.barTab},
    ${account.taxRate},
    ${account.preferences.signatureAmount},
    ${account.preferences.cashEnabled},
    ${account.preferences.discountEnabled},
    ${account.preferences.FSAEnabled},
    ${account.preferences.EBTEnabled},
    ${account.preferences.tableTab},
    ${account.preferences.tableNum},
    ${account.preferences.giftCards},
    ${account.preferences.cashDiscount},
    ${account.inventory_tracking}
  )
  `
  connection.query(sql, function(err, createdAccount) {
    if(err) callback(err, null)
    else {
      var { createCategory } = require('./category')
      var categories = account.categories
      var addCategory = () => {
        var category = categories.shift()
        var cat = {
          name: category.categoryName,
          short_name: category.shortName,
          color: category.categoryColor,
          image: category.image,
          active: 1,
          account_id: createdAccount.insertId
        }
        createCategory(cat, (err, result) => {
          if(err) callback(err, null)
          else {
            if(categories.length) addCategory()
            else {

              var users = account.accountUsers
              users.unshift({
                "firstName": account.firstName,
                "lastName": account.lastName,
                "emailAddress": account.emailAddress,
                "password": account.password,
                "userPin": account.userPin,
                "role": account.role
              })
              var addUser = () => {
                var user = users.shift()
                var usr = {
                  first_name: user.firstName,
                  last_name: user.lastName,
                  email: user.emailAddress,
                  password: user.password,
                  pin: user.userPin,
                  role_id: user.role,
                  auth0_user_id: account.accountId,
                  account_id: createdAccount.insertId
                }

                var { createAuth0User } = require('../helper/auth0')
                createAuth0User(usr, (err, result) => {
                  if(err) callback(err, null)
                  else {

                    usr.auth0_user_id = result.user_id

                    var { createUser } = require('./user')
                    createUser(usr, (err, result) => {
                      if(err) callback(err, null)
                      else {
                        if(users.length) addUser()
                        else {
                          callback(err, result)
                        }
                      }
                    })
                  }
                })
              }
              addUser()
            }
          }
        })
      }
      addCategory()
    }
  });
}


function updateAccount(account, callback) {
  var sql = `update account set
  account_no = '${account.accountId}',
  company_name = '${account.company_name}',
  phone_no = '${account.phoneNumber}',
  address = '${account.physicalAddress}',
  street = '${account.street2}',
  city = '${account.city}',
  state = '${account.state}',
  zip = '${account.zip}',
  country = '${account.country}',
  merchant_id = '${account.merchantId}',
  device_settings = '${JSON.stringify(account.deviceSettings)}',
  tip_enabled = ${account.preferences.tipsEnabled},
  bar_tab = ${account.preferences.barTab},
  tax_rate = ${account.taxRate},
  signature_amount = ${account.preferences.signatureAmount},
  cash_enabled = ${account.preferences.cashEnabled},
  discount_enabled = ${account.preferences.discountEnabled},
  fsa_enabled = ${account.preferences.FSAEnabled},
  ebt_enabled = ${account.preferences.EBTEnabled},
  table_tab = ${account.preferences.tableTab},
  table_num = ${account.preferences.tableNum},
  gift_cards = ${account.preferences.giftCards},
  cash_discount = ${account.preferences.cashDiscount},
  inventory_tracking = ${account.inventory_tracking}
  where id = ${account.id}`

  connection.query(sql, function(err, result) {
    if(err) callback(err, result)
    else {
      var updateAccountCategory = () => {
        var category = account.categories.shift()
        var { updateCategory } = require('./category')
        category = {
          name: category.categoryName,
          short_name: category.shortName,
          color: category.categoryColor,
          image: category.image,
          account_id: account.id,
          id: category.categoryId
        }
        updateCategory(category, (err, result) => {
          if(account.categories.length) updateAccountCategory()
          else {

            var owner = {
              first_name: account.firstName,
              last_name: account.lastName,
              email: account.emailAddress,
              password: account.password,
              pin: account.userPin,
              role_id: account.role,
              account_id: account.id
            }

            var { updateAuth0User } = require('../helper/auth0')
            updateAuth0User(owner, (err, result) => {
              if(err) callback(err, result)
              else {

                var { updateUserByRoleOwner } = require('./user')
                updateUserByRoleOwner(owner, (err, result) => {
                  if(err) callback(err, result)
                  else {
                    var updateAccountUser = () => {
                      var user = account.accountUsers.shift()
                      user = {
                        first_name: user.firstName,
                        last_name: user.lastName,
                        email: user.emailAddress,
                        password: user.password,
                        pin: user.userPin,
                        role_id: user.role,
                        id: user.userId,
                        account_id: account.id
                      }
                      updateAuth0User(user, (err, result) => {
                        if(err) callback(err, result)
                        else {

                          var { updateUser } = require('./user')
                          updateUser(user, (err, result) => {
                            if(err) callback(err, result)
                            else {
                              if(account.accountUsers.length) updateAccountUser()
                              else callback(err, result)
                            }
                          })

                        }
                      })
                    }
                    updateAccountUser()
                  }
                })
              }
            })

          }
        })
      }
      updateAccountCategory()
    }
  })

}

module.exports = {
  getAccountNames,
  getAllAccounts,
  createAccount,
  updateAccount
}
