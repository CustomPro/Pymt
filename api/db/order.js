var connection = require('../config/connection.js');
var moment = require('moment');

function getAllOrder(accountId, tran_id, callback) {
  var where = `o.account_id = ${accountId}`
  if(tran_id) where += ` and o.transaction_id = '${tran_id}'`
  var sql = `SELECT oo.*, gr.amount gr_amount, gr.authcode gr_authcode, gr.last4 gr_last4, gl.amount gl_amount, gl.authcode gl_authcode, gl.last4 gl_last4, tp.amount tp_amount, tp.user tp_user, tp.approvalcode tp_approvalcode from (select c.id cart_id, c.cart_number, c.status, o.*
        from cart c inner join \`order\` o on o.id = c.order_id where ${where} and class_type = 0) oo
        LEFT JOIN giftcard_redeem gr on (oo.id = gr.order_id) 
        left JOIN giftcard_load gl on (oo.id = gl.order_id)
        LEFT JOIN order_tip tp on (oo.id = tp.order_id)`

  connection.query(sql, function(err, result) {
    if(err) callback(err, callback)
    else {
      var orders = []
      for(var i in result) {
        var order = result[i]
        var model = {
          "cartNumber": order.cart_id,
          "status": order.status,
          "tableId": order.cart_table_id,
          orderObj: {
            "orderId": order.id,
            "orderDate": order.order_date,
            "orderType": order.order_type,
            "tableNumber": order.table_number,
            "transactionId": order.transaction_id,
            "orderStatus": order.order_status,
            "cartTotal": order.cart_total,
            "discountPercent": order.discount_percent,
            "discountAmount": order.discount_amount,
            "itemQuantity": order.item_quantity,
            "items": [],
            "payment": [],
            "giftcardRedeem": {
              "amount": order.gr_amount,
              "auchCode": order.gr_authcode,
              "last4": order.gr_last4
            },
            "giftCardLoad": {
              "amount": order.gl_amount,
              "auchCode": order.gl_authcode,
              "last4": order.gl_last4
            },
            "tip":{
              "amount": order.tp_amount,
              "user": order.tp_user,
              "approvalCode": order.tp_approvalcode
            }
          }
        }
        orders.push(model)
      }

      var ordersWithItems = []
      var appendItem = () => {
        var _order = orders.shift()
        var sql = `select id, item_id, name, price, quantity, is_taxable, is_ebt, is_fsa
        from order_item where order_id = ${_order.orderObj.orderId}`

        connection.query(sql, function(err, orderItems) {
          if(err) callback(err, callback)
          else {
            _order.orderObj.items = orderItems.map(item => ({
              "orderItemId": item.id,
              "itemId": item.item_id,
              "name": item.name,
              "price": item.price,
              "quantity": item.quantity,
              "isTaxable": item.is_taxable,
              "isEBT": item.is_ebt,
              "isFSA": item.is_fsa,
              "modifiers": {}
            }))

            var sql = `select * from payment where order_id = ${_order.orderObj.orderId}`
            connection.query(sql, function(err, orderPayments){
              if(err) callback(err, callback)
              else {
                  _order.payment = orderPayments.map(p => ({
                      "paymentId": p.id,
                      "paymentType": p.type,
                      "signature": p.signature,
                      "amountTendered": p.amount_tendered,
                      "changeGiven": p.change_given,
                      "xmp": p.xmp
                  }))
                  if(!_order.orderObj.items.length) {
                    ordersWithItems.push(_order)
                    if(orders.length) appendItem()
                    else callback(err, ordersWithItems)
                  } else {

                    var ids = _order.orderObj.items.map(it => it.orderItemId).join(', ')
                    var sql = `select * from order_modifier where order_id = ${_order.orderObj.orderId} and order_item_id in (${ids})`
                    connection.query(sql, function(err, orderItemModifiers) {
                      if(err) callback(err, null)
                      else {
                        _order.orderObj.items.forEach(it => {
                          var mds = orderItemModifiers.filter(m => m.order_item_id === it.orderItemId)
                          mds.forEach(md => {
                            it.modifiers[md.name] = md.value
                          })
                        })
                        ordersWithItems.push(_order)
                        if(orders.length) appendItem()
                        else callback(err, ordersWithItems)
                      }
                    })

                  }
              }
            });
          }
        })
      }
      appendItem()
    }
  });
}

const createPaymentForOrder = (paymentObj, info, callback) => {
    var sql = `insert into payment (order_id, cash_id, type, signature, amount_tendered, change_given, xmp, account_id)
    values (${info.order_id}, ${info.cash_id}, '${paymentObj.paymentType}', '${paymentObj.signature}', ${paymentObj.amountTendered},
    ${paymentObj.changeGiven}, '${paymentObj.xmp}', ${info.account_id})`

    connection.query(sql, function(err, result) {
      callback(err, result)
    });
}

function createOrder(order, account_id, callback) {
  var paymentItems = order.orderObj.payment

  var sql = `select id from cash where account_id = ${account_id} and  day_opened = true and day_closed = false order by opening_date desc`

  connection.query(sql, function(err, result) {

    if(err) callback(err, callback)
    else {
      if(!order.orderObj.transactionId)
        order.orderObj.transactionId = Date.now().toString().split('').reverse().join('').substr(0, 8)
      
      order.orderObj.orderDate = moment().format('YYYY-MM-DD HH:mm:ss')
      var cash = result[0]

      if(cash) {
        sql = `insert into \`order\` (cash_id, order_date, order_type, table_number, transaction_id,
      order_status, cart_total, discount_percent, discount_amount, item_quantity, account_id)
      values (${cash.id}, '${order.orderObj.orderDate}',  '${order.orderObj.orderType}', '${order.orderObj.tableNumber}',
        '${order.orderObj.transactionId}', '${order.orderObj.orderStatus}', ${order.orderObj.cartTotal}, ${order.orderObj.discountPercent},
        ${order.orderObj.discountAmount}, ${order.orderObj.itemQuantity}, ${account_id})`

       
            connection.query(sql, function(err, createdOrder){
              if(err) callback(err, callback)
              else {
                var order_id = createdOrder.insertId
                var newCartNumber = Date.now().toString().split('').reverse().join('').substr(0, 8)
                var sql = `insert into cart (cart_number, status, order_id)
                values (${order.cartNumber || newCartNumber}, '${order.status}', ${createdOrder.insertId})`

                connection.query(sql, function(err, createdCart) {

                  if(err) callback(err, createdCart)
                  else {

                    var items = order.orderObj.items;
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
                                    //callback(err, result)
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
                    paymentItems.reverse();
                    var addPayment = () => {
                        var item = paymentItems.shift()
                        var info = {
                            account_id,
                            order_id: order_id,
                            cash_id: cash.id
                        }
                        createPaymentForOrder(item, info, (err, result) => {
                            if(err) callback(err, null)
                            else {
                                if(paymentItems.length) addPayment()
                                else callback(err, result)
                            }
                        })

                    }
                    addPayment();
// add giftcard_redeem //
                    let cardredeem = order.orderObj.giftcardRedeem;
                    if(cardredeem) {
                        sql = `insert into giftcard_redeem (order_id, amount, authcode, last4) values (${order_id}, ${cardredeem.redeemAmount}, '${cardredeem.authCode}', '${cardredeem.last4}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });
                    }
// add giftcard_load
                    let cardload = order.orderObj.giftCardLoad;
                    if(cardload) {
                        sql = `insert into giftcard_load (order_id, amount, authcode, last4) values (${order_id}, ${cardload.loadAmount}, '${cardload.authCode}', '${cardload.last4}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });

                    }
// add tip
                    let tip = order.orderObj.tip;
                    if(tip){
                        sql = `insert into order_tip (order_id, amount, user, approvalcode) values (${order_id}, ${tip.amount}, '${tip.user}', '${tip.approvalCode}')`
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

function updateOrder(order, account_id, callback) {
  var sql = `update order set name = '${order.name}', short_name = '${order.short_name}',
  color = '${order.color}', image = '${order.image}', active = ${order.active}
  where id = ${order.id} and account_id = ${order.account_id}`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function getOrdersByDateRange(account_id, from, to, callback) {
  var sql = `select id, order_date, transaction_id, order_status, cart_total, discount_percent, discount_amount, item_quantity from \`order\`
  where account_id = ${account_id} and class_type = 0 and order_date >= '${from}' and order_date <= '${to}'`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function getOrderInfoByTransactionId(account_id, transaction_id, callback) {
  var sql = `select id order_id, cash_id from \`order\`
  where account_id = ${account_id} and transaction_id = '${transaction_id}'`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

function getTipsByDateRange(account_id, from, to, callback) {
  var sql = `SELECT oo.*, tp.amount, tp.user, tp.approvalcode from (select id, order_date, transaction_id, order_status, cart_total, discount_percent, discount_amount, item_quantity from \`order\`
  where account_id = ${account_id} and order_date >= '${from}' and order_date <= '${to}') oo LEFT JOIN order_tip tp on (oo.id = tp.order_id) WHERE tp.amount is not null`
  connection.query(sql, function(err, result) {
    if(err) callback(err, null)
    else {
        let tips = result.map(tip => {
            return {                
                "amount": tip.amount,
                "user": tip.user,
                "approvalCode": tip.approvalcode
            }
          })
        callback(err, tips)
      }
    
  });
}
function getOrderTotalsByDateRange(account_id, from, to, callback) {
  var sql = `select order_date, sum(cart_total) orders_amount from \`order\`
  where account_id = '${account_id}' and class_type = 0 and order_date >= '${from}' and order_date <= '${to}' group by order_date`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

module.exports = {
  getAllOrder,
  createOrder,
  updateOrder,
  getOrderInfoByTransactionId,
  getOrdersByDateRange,
  getOrderTotalsByDateRange,
  getTipsByDateRange
}
