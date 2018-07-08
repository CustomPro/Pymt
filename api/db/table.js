const connection = require('../config/connection.js');
const { createOrder, updateOrder } = require('./order');

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

const createTable = (accountId, param, callback) => {
    let tableNumber = param.tableNumber;
    let tableStatus = param.tableStatus;
    let orderObj = param.orderObj;

    if (!tableNumber || !tableStatus || !orderObj) {
        callback(new Error('Validation Error'), null);
    } else {
        orderId = orderObj.orderId
        if(!orderId)
            orderId = null
        const sql = `INSERT INTO \`table\` (number, status, order_id, account_id) VALUES (${tableNumber}, '${tableStatus}', ${orderId}, ${accountId})`
        
        connection.query(sql, (err, result) => {
            if (err) callback(err, null);
            else {
                orderObj.tableId = result.insertId;
                orderObj.orderObj.tableNumber = tableNumber;
                createOrder(orderObj, accountId, callback);
            }
        })
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