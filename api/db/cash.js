var connection = require('../config/connection.js');

function createCashOpen(opening, callback) {
  var opening_date = Date.now()
  var sql = `select count(0) count from cash where day_opened = true and day_closed = false and account_id = ${opening.account_id}`
  connection.query(sql, function(err, result) {
    if(err) return callback(err, null)
    else {
      var dayOpened = result[0]
      if(dayOpened && dayOpened.count > 0) {
        return callback(new Error('Close current day first before opening a new day'), null)
      } else {
        sql = `insert into cash (opening_amount, opening_date, account_id, day_opened, opening_user_id)
        values (${opening.opening_amount}, '${opening.opening_date}', ${opening.account_id}, true, '${opening.verify_by}')`
        connection.query(sql, function(err, result) {
          callback(err, result)
        });
      }
    }
  });
}

function updateCashClose(closing, callback) {
  // var closing_date = Date.now()
  checkDayOpened(closing.account_id, (err, result) => {
    if(err) callback(err, result)
    else {
      var cash = result[0]
      if(cash) {
        sql = `update cash set closing_amount = ${closing.closing_amount}, card_amount = ${closing.card_amount},
        card_batch_number = ${closing.card_batch_number}, card_transaction_count = ${closing.card_transaction_count},
        sales_amount = ${closing.sales_amount}, total_drop_amount = ${closing.total_drop_amount}, closing_date = '${closing.closing_date}',
        day_closed = true, closing_user_id = '${closing.verify_by}', eod_till_user_entry = '${closing.eod_till_user_entry}',
        eod_till_user_id = '${closing.verify_by}', eod_till_entry_date = '${closing.closing_date}'
        where account_id = ${closing.account_id} and day_opened = true and day_closed = false`
        console.log(sql)
        connection.query(sql, function(err, result) {
          callback(err, result)
        });
      } else {
        callback(new Error('Day has not been opened yet. Open a day by entering opening amount.'), null)
      }
    }
  })
}

function endDay(eod_till_user_entry, account_id, user_id, callback) {
  checkDayOpened(account_id, (err, result) => {
    if(err) callback(err, null)
    else {
      var cash = result[0]
      if(cash) {
        var eod_till_entry_date = Date.now()
        var sql = `update cash set eod_till_user_entry = '${eod_till_user_entry}',
        eod_till_user_id = ${user_id}, eod_till_entry_date = '${eod_till_entry_date}'
        where account_id = ${account_id} and cash_id = ${cash.id}`
        connection.query(sql, function(err, result) {
          callback(err, result)
        });
      } else {
        callback(new Error('Day has not been opened yet. Open a day by entering opening amount.'), null)
      }
    }
  })
}

function dropCash(drop, callback) {
  // var drop_time = new Date()
  checkDayOpened(drop.account_id, (err, result) => {
    if(err) callback(err, null)
    else {
      var cash = result[0]
      if(cash) {
        sql = `insert into cash_drop (amount, drop_time, drop_by, cash_id)
        values ('${drop.drop_amount}', '${drop.drop_time}', '${drop.drop_by}', '${cash.id}')`
        connection.query(sql, function(err, result) {
          callback(err, result)
        });
      } else {
        callback(new Error('Day has not been opened yet. Open a day by entering opening amount.'), null)
      }
    }
  })
}

function getCashDrops(account_id, callback) {
  checkDayOpened(account_id, (err, result) => {
    var cash = result[0]
    if(cash) {
      sql = `select * from cash_drop where cash_id = ${cash.id} order by drop_time desc`
      connection.query(sql, function(err, result) {
        if(err)  callback(err, null)
        else {
          cash.drops = result
          callback(err, cash)
        }
      });
    } else {
      callback(new Error('Day has not been opened yet. Open a day by entering opening amount.'), null)
    }
  })
}

function checkDayOpened(account_id, callback) {
  var sql = `select * from cash where account_id = ${account_id} and
  day_opened = true and day_closed = false order by opening_date desc`
  connection.query(sql, function(err, result) {
    callback(err, result)
  })
}

module.exports = {
  createCashOpen,
  updateCashClose,
  endDay,
  dropCash,
  getCashDrops,
  checkDayOpened
}
