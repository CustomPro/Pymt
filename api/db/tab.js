const connection = require('../config/connection.js');
const { createPayment, updatePayment } = require('./payment');
const { createOrder, updateOrder } = require('./order');
var moment = require('moment');

const getAllTabs = (accountId, callback) => {
    var sql = `SELECT oo.*, t.first_name, t.last_name, t.status, gr.amount gr_amount, gr.authcode gr_authcode, gr.last4 gr_last4, gl.amount gl_amount, gl.authcode gl_authcode, gl.last4 gl_last4, tp.amount tp_amount, tp.user tp_user, tp.approvalcode tp_approvalcode from (select c.id cart_id, c.cart_number, c.status, o.id order_id, o.class_type
        from cart c inner join \`order\` o on o.id = c.order_id where account_id = ${accountId} and class_type = 2) oo
        LEFT JOIN (SELECT DISTINCT order_id, first_name, last_name, status from \`tab\` where account_id = ${accountId}) t on (oo.order_id = t.order_id)
        LEFT JOIN giftcard_redeem gr on (oo.order_id = gr.order_id) 
        left JOIN giftcard_load gl on (oo.order_id = gl.order_id)
        LEFT JOIN order_tip tp on (oo.order_id = tp.order_id)`

        connection.query(sql, (err, result) => {
        if(err) callback(err, null)
        else {
            let tabs = result.map(tab => {
                return {
                    "tabId": tab.cart_number,
                    "firstName": tab.first_name,
                    "lastName": tab.last_name,
                    "status": tab.status,
                    "orderId": tab.order_id,
                    "items": [],
                    "payment": [],
                    "giftcardRedeem": {
                        "amount": tab.gr_amount,
                        "auchCode": tab.gr_authcode,
                        "last4": tab.gr_last4
                    },
                    "giftCardLoad": {
                        "amount": tab.gl_amount,
                        "auchCode": tab.gl_authcode,
                        "last4": tab.gl_last4
                    },
                    "tip":{
                        "amount": tab.tp_amount,
                        "user": tab.tp_user,
                        "approvalCode": tab.tp_approvalcode
                    }
                }
            })
            var orders = tabs
            var ordersWithItems = []
              var appendItem = () => {
                var _order = orders.shift()
                var sql = `select id, item_id, name, price, quantity, is_taxable, is_ebt, is_fsa
                from order_item where order_id = ${_order.orderId}`
                console.log(sql)
                connection.query(sql, function(err, orderItems) {
                  if(err) callback(err, callback)
                  else {
                    _order.items = orderItems.map(item => ({
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
                    var sql = `select * from payment where order_id = ${_order.orderId}`
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

                            if(!_order.items.length) {
                              ordersWithItems.push(_order)
                              if(orders.length) appendItem()
                              else callback(err, ordersWithItems)

                            } else {

                              var ids = _order.items.map(it => it.orderItemId).join(', ')
                              var sql = `select * from order_modifier where order_id = ${_order.orderId} and order_item_id in (${ids})`
                              connection.query(sql, function(err, orderItemModifiers) {
                                if(err) callback(err, null)
                                else {
                                  _order.items.forEach(it => {
                                    var mds = orderItemModifiers.filter(m => m.order_item_id === it.orderItemId)
                                    mds.forEach(md => {
                                      it.modifiers[md.name] = md.value
                                    })
                                  })
                                  console.log(_order)
                                  ordersWithItems.push(_order)
                                  if(orders.length) appendItem()
                                  else callback(err, ordersWithItems)
                                }
                              }) 

                            }

                        }
                    })
                    
                  }
                })
              }

              appendItem()
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
        
      }
    });
}

const createTab = (accountId, param, callback) => {
    let firstName = param.firstName;
    let lastName = param.lastName;
    let tabId = param.tabId;
    let orderItems = param.items;
    let paymentItems = param.payment;
    let account_id = accountId;

    if (!firstName || !tabId || !orderItems || !paymentItems) {
        callback(new Error('Validation Error'), null);
    } else {

        var sql = `select id from cash where account_id = ${account_id} and
        day_opened = true and day_closed = false order by opening_date desc`

        connection.query(sql, function(err, result) {

            if(err) callback(err, null)
            else {
                var cash = result[0]

              if(cash) {
                var orderDate = moment().format('YYYY-MM-DD HH:mm:ss')
                sql = `insert into \`order\` (cash_id, order_date, table_number,  order_status, account_id, class_type)
                  values (${cash.id}, '${orderDate}',  '${param.tabId}', '${param.status}', ${account_id}, 2)`
                connection.query(sql, function(err, createdOrder){
                  if(err) callback(err, null)
                  else {

                    var sql = `insert into cart (cart_number, status, order_id) values (${tabId}, '${param.status}', ${createdOrder.insertId})`
                    connection.query(sql, function(err, createdCart) {

                      if(err) callback(err, createdCart)
                      else {
                        var items = orderItems;
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
                                      sql = `INSERT INTO \`tab\` (first_name, last_name, status, order_id, account_id) VALUES 
                                                ('${firstName}', '${lastName}', '${param.status}', ${createdOrder.insertId}, ${account_id})`
                                        connection.query(sql, function(err, result){
                                            callback(err, result)
                                        })
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
/*
//// add payment and tap///
                    paymentItems.reverse();
                    var addPayment = () => {
                        var item = paymentItems.shift()
                        var info = {
                            firstName: firstName,
                            lastName: lastName,
                            status: param.status,
                            account_id,
                            order_id: createdOrder.insertId,
                            cash_id: cash.id
                        }
                        createPaymentForTab(item, info, (err, result) => {
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
                    */
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

const updateTab = (account_id,tabId, param, callback) => {
    let items = param.items;
    let paymentItems = param.payment;

    var cash = ""
    var sql = `select id from cash where account_id = ${account_id} and day_opened = true and day_closed = false order by opening_date desc`
    connection.query(sql, function(err, result) {

        if(err) callback(err, null)
        else {
            cash = result[0]
        }
    });
    var sql = `select order_id from cart where cart_number = ${tabId} and status != 'CLOSED'`    
    connection.query(sql, function(err, result) {

        if(err) callback(err, null)
        else {
            var order = result[0]
            var order_id = order.order_id
            if(order_id){            
                sql = `update \`cart\` set status= '${param.status}' where order_id = ${order_id}`
                connection.query(sql, function(err, result) {
                if(err) callback(err, null)
                else {
                    var addItem = () => {
                          var item = items.shift()
                          sql = `insert into order_item (order_id, item_id, name, price, quantity, is_taxable, is_ebt, is_fsa)
                          values (${order_id}, '${item.itemId}', '${item.name}', ${item.price}, ${item.quantity}, ${item.isTaxable}, ${item.isEBT}, ${item.isFSA})`

                          connection.query(sql, function(err, createdOrderItem) {

                            if(err) callback(err, null)
                            else {

                              var modifiers = item.modifiers
                              var mods = Object.keys(modifiers)
                              var addModifire = () => {
                                var key = mods.shift()
                                var value = modifiers[key]
                                sql = `insert into order_modifier (order_id, order_item_id, name, value)
                                values (${order_id}, ${createdOrderItem.insertId}, '${key}', '${value}')`
                                connection.query(sql, function(err, result) {
                                  if(err) callback(err, null)
                                  else {
                                    if(mods.length) addModifire()
                                    else {
                                      if(items.length) addItem()
                                      else {
                                        sql = `update \`tab\` set first_name = '${param.firstName}', last_name = '${param.lastName}', status= '${param.status}' where order_id = ${order_id}`
                                        connection.query(sql, function(err, result) {
                                        if(err) callback(err, null)
                                        else {
                                            callback(err, result)
                                        }
                                        });
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
//// add payment and tap///
                    paymentItems.reverse();
                    var addPayment = () => {
                        var item = paymentItems.shift()
                        var info = {
                            account_id,
                            order_id: order_id,
                            cash_id: cash.id
                        }
                        createPaymentForTab(item, info, (err, result) => {
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
                        sql = `insert into giftcard_redeem (order_id, amount, authcode, last4) values (${order_id}, ${cardredeem.redeemAmount}, '${cardredeem.authCode}', '${cardredeem.last4}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });
                    }
// add giftcard_load
                    let cardload = param.giftCardLoad;
                    if(cardload) {
                        sql = `insert into giftcard_load (order_id, amount, authcode, last4) values (${order_id}, ${cardload.loadAmount}, '${cardload.authCode}', '${cardload.last4}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });

                    }
// add tip
                    let tip = param.tip;
                    if(tip){
                        sql = `insert into order_tip (order_id, amount, user, approvalcode) values (${order_id}, ${tip.amount}, '${tip.user}', '${tip.approvalCode}')`
                        connection.query(sql, function(err, result) {
                          if(err) callback(err, null);
                          });

                    }
                } 
            });
        
    } else {
        var error = new Error('TabId record not found')
        callback(err, null)
    }
}
});
}

module.exports = {
    getAllTabs,
    createTab,
    updateTab
}