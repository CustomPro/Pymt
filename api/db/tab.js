const connection = require('../config/connection.js');
const { createPayment, updatePayment } = require('./payment');
const { createOrder, updateOrder } = require('./order');
var moment = require('moment');

const getAllTabs = (accountId, callback) => {
    const sql = `select t.id as tabId, t.first_name as firstname, t.last_name as lastname, o.*, p.* from \`tab\` t left join \`order\` o on t.order_id = o.id 
        left join payment p on t.payment_id = p.id where t.account_id =  ${accountId}`

    connection.query(sql, (err, result) => {
        if(err) callback(err, null)
        else {
            let tabs = result.map(tab => {
                return {
                    "tabId": tab.tabId,
                    "firstName": tab.firstname,
                    "lastName": tab.lastname,
                    orderObj: {
                        "orderId": tab.order_id,
                        "orderDate": tab.order_date,
                        "orderType": tab.order_type,
                        "tableNumber": tab.table_number,
                        "transactionId": tab.transaction_id,
                        "orderStatus": tab.order_status,
                        "cartTotal": tab.cart_total,
                        "discountPercent": tab.discount_percent,
                        "discountAmount": tab.discount_amount,
                        "itemQuantity": tab.item_quantity,
                        "items": []
                    },
                    paymentObj: {
                        "type": tab.type,
                        "signature": tab.signature,
                        "amountTendered": tab.amount_tendered,
                        "changeGiven": tab.change_given,
                        "amountPaid": tab.amount_paid,
                        "xmp": tab.xmp
                    }
                }
            })
            callback(err, tabs);
        }
    })
}

const createPaymentForTab = (paymentObj, info, callback) => {
    var sql = `insert into payment (order_id, cash_id, type, signature, amount_tendered, change_given, xmp, account_id)
    values (${info.order_id}, ${info.cash_id}, '${paymentObj.paymentType}', '${paymentObj.signature}', ${paymentObj.amountTendered},
    ${paymentObj.changeGiven}, '${paymentObj.xmp}', ${info.account_id})`

    connection.query(sql, function(err, result) {
      if(err) callback(err, null)
      else{
        sql = `INSERT INTO \`tab\` (first_name, last_name, order_id, payment_id, account_id) VALUES 
                        ('${info.firstName}', '${info.lastName}', ${info.order_id}, ${result.insertId}, ${info.account_id})`
        connection.query(sql, function(err, result){
            callback(err, result)
        })
      }
    });



}
const createTab = (accountId, param, callback) => {
    let firstName = param.firstname;
    let lastName = param.lastname;
    let tabId = param.tabId;
    let orderItems = param.items;
    let paymentItems = param.payment;

    if (!firstName || !tabId || !orderItems || !paymentItems) {
        callback(new Error('Validation Error'), null);
    } else {

        var sql = `select id from cash where account_id = ${account_id} and
        day_opened = true and day_closed = false order by opening_date desc`

        connection.query(sql, function(err, result) {

            if(err) callback(err, callback)
            else {
                var cash = result[0]

              if(cash) {
                var orderDate = moment().format('YYYY-MM-DD HH:mm:ss')
                sql = `insert into \`order\` (cash_id, order_date, order_type, table_number, transaction_id, order_status, cart_total, discount_percent, discount_amount, item_quantity, account_id, class_type)
                  values (${cash.id}, '${orderDate}',  '', '${param.tabId}','', '${param.status}','', '','', '', ${account_id}, 2)`
                connection.query(sql, function(err, createdOrder){
                  if(err) callback(err, callback)
                  else {

                    var newCartNumber = Date.now().toString().split('').reverse().join('').substr(0, 5)
                    var sql = `insert into cart (cart_number, status, table_id, order_id) values (${tabId}, '${param.status}', '', ${createdOrder.insertId})`
                    connection.query(sql, function(err, createdCart) {

                      if(err) callback(err, createdCart)
                      else {
                        var items = orderItems;
                        items.reverse();

                        var addItem = () => {
                          var item = items.shift()
                          sql = `insert into order_item (order_id, item_id, name, price, quantity, is_taxable, is_ebt, is_fsa)
                          values (${createdOrder.insertId}, '${item.itemId}', '${item.name}', ${item.price}, ${item.quantity},
                            ${item.isTaxable}, ${item.isEBT}, ${item.isFSA})`

                          connection.query(sql, function(err, createdOrderItem) {

                            if(err) callback(err, null)
                            else {

                              var modifiers = item.modifiers
                              var mods = Object.keys(modifiers)
                              var addModifire = () => {
                                var key = mods.shift()
                                var value = modifiers[key]
                                sql = `insert into order_modifier (order_id, order_item_id, name, value)
                                values (${createdOrder.insertId}, ${createdOrderItem.insertId}, '${key}', '${value}')`
                                connection.query(sql, function(err, result) {
                                  if(err) callback(err, null)
                                  else {
                                    if(mods.length) addModifire()
                                    else {
                                      if(items.length) addItem()
                                      else {
                                        callback(err, result)
                                      }
                                    }
                                  }
                                })
                              }
                              addModifire()
                            }
                          })
                        }
                        addItem()
                      }
                    })

                    paymentItems.reverse();
                    var addPayment = () => {
                        var item = paymentItems.shift()
                        var info = {
                            firstname: firstName,
                            lastname: lastName,
                            account_id: accountId,
                            order_id: createdOrder.insertId,
                            cash_id: cash.id
                        }
                        createPaymentForTab(item, info, (err, result) => {
                            if(err) callback(err, null)
                            else {
                                if(paymentItems.length) addPayment()
                                else callback(err, result)
                            }
                        });

                    }
                    addPayment();                    
                    }
                });
              } else {
                    var error = new Error('Cash record not found')
                    callback(err, null)
                }
            }

        });
        
    }
}

const updateTab = (accountId, param, callback) => {
    let orderObj = param.orderObj;
    let paymentObj = param.paymentObj;

    if (!param.id) {
        callback(new Error('Validation Error'), null);
    } else {
        updateOrder(orderObj, accountId, (err, result) => {
            if (err) callback(err, null);
            else {
                updatePayment(paymentObj, callback);
            }
        })
    }
}

module.exports = {
    getAllTabs,
    createTab,
    updateTab
}