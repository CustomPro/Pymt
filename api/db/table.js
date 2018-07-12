const connection = require('../config/connection.js');
const { createOrder, updateOrder } = require('./order');
var moment = require('moment');

const getAllTables = (accountId, callback) => {
    const sql = `select t.id as tableId, t.number as tableNumber, t.status as tableStatus, o.*  
        from \`table\` t left join \`order\` o on t.order_id = o.id where t.account_id = ${accountId}`

    connection.query(sql, (err, result) => {
        if(err) callback(err, null)
        else {
            let tables = result.map(table => {
                return {
                    "tableId": table.tableId,
                    "tableNumber": table.tableNumber,
                    "status": table.tableStatus,
                    orderObj: {
                        "orderId": table.id,
                        "orderDate": table.order_date,
                        "orderType": table.order_type,
                        "tableNumber": table.table_number,
                        "transactionId": table.transaction_id,
                        "orderStatus": table.order_status,
                        "cartTotal": table.cart_total,
                        "discountPercent": table.discount_percent,
                        "discountAmount": table.discount_amount,
                        "itemQuantity": table.item_quantity,
                    }
                }
            })
            callback(err, tables);
        }
    })
}

const createPaymentForTable = (paymentObj, info, callback) => {
    var sql = `insert into payment (order_id, cash_id, type, signature, amount_tendered, change_given, xmp, account_id)
    values (${info.order_id}, ${info.cash_id}, '${paymentObj.paymentType}', '${paymentObj.signature}', ${paymentObj.amountTendered},
    ${paymentObj.changeGiven}, '${paymentObj.xmp}', ${info.account_id})`
console.log(sql)
    connection.query(sql, function(err, result) {
      if(err) callback(err, null)
      else{
        sql = `INSERT INTO \`table\` (\`number\`, \`status\`, order_id, payment_id, account_id) VALUES 
                        ('${info.number}', '${info.status}', ${info.order_id}, ${result.insertId}, ${info.account_id})`
        connection.query(sql, function(err, result){
            callback(err, result)
        })
      }
    });
}

const createTable = (accountId, param, callback) => {
    let tableNumber = param.number;
    let tableId = param.tableId;
    let account_id = accountId;

    if (!firstName || !tableId) {
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
                sql = `insert into \`order\` (cash_id, order_date, table_number,  order_status, account_id, class_type)
                  values (${cash.id}, '${orderDate}',  '${param.tableId}', '${param.status}', ${account_id}, 1)`
                connection.query(sql, function(err, createdOrder){
                  if(err) callback(err, callback)
                  else {

                    var newCartNumber = Date.now().toString().split('').reverse().join('').substr(0, 5)
                    var sql = `insert into cart (cart_number, status, order_id) values (${tableId}, '${param.status}', ${createdOrder.insertId})`
                    connection.query(sql, function(err, createdCart) {

                      if(err) callback(err, createdCart)
                      else {
                        var items = param.items;
                        items.reverse();

                        var addItem = () => {
                          var item = items.shift()
                          sql = `insert into order_item (order_id, item_id, name, price, quantity, is_taxable, is_ebt, is_fsa)
                          values (${createdOrder.insertId}, '${item.itemId}', '${item.name}', ${item.price}, ${item.quantity}, ${item.isTaxable}, ${item.isEBT}, ${item.isFSA})`

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
//// add payment and tap///
                    paymentItems = param.payment
                    paymentItems.reverse();
                    var addPayment = () => {
                        var item = paymentItems.shift()
                        var info = {
                            number: tableNumber,
                            status: param.status
                            account_id,
                            order_id: createdOrder.insertId,
                            cash_id: cash.id
                        }
                        createPaymentForTable(item, info, (err, result) => {
                            if(err) callback(err, null)
                            else {
                                if(paymentItems.length) addPayment()
                                else callback(err, result)
                            }
                        })

                    }
                    addPayment();
// add giftcard_redeem //
                    let cardredeem = param.giftcardRedeem;
                    if(cardredeem) {
                        sql = `insert into giftcard_redeem (order_id, amount, authcode, last4) values (${createdOrder.insertId}, ${cardredeem.redeemAmount}, '${cardredeem.authCode}', '${cardredeem.last4}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });
                    }
// add giftcard_load
                    let cardload = param.giftCardLoad;
                    if(cardload) {
                        sql = `insert into giftcard_load (order_id, amount, authcode, last4) values (${createdOrder.insertId}, ${cardload.loadAmount}, '${cardload.authCode}', '${cardload.last4}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });

                    }
// add tip
                    let tip = param.tip;
                    if(tip){
                        sql = `insert into order_tip (order_id, amount, user, approvalcode) values (${createdOrder.insertId}, ${tip.amount}, '${tip.user}', '${tip.approvalCode}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });

                    }
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

const updateTable = (accountId, param, callback) => {
    let tableId = param.tableId;
    let tableNumber = param.tableNumber;
    let tableStatus = param.tableStatus;
    let orderObj = param.orderObj;

    if (!tableNumber || !tableStatus || !orderObj) {
        callback(new Error('Validation Error'), null);
    } else {
        const sql = `UPDATE \'table'\ SET ? WHERE id=${tableId} AND account_id=${accountId}`
        
        const set = {
            number: tableNumber,
            status: tableStatus,
            accountId
        }
        connection.query(sql, set, (err, result) => {
            if (err) callback(err, null);
            else {
                updateOrder(orderObj, callback);
            }
        })
    }
}

module.exports = {
    getAllTables,
    createTable,
    updateTable
}