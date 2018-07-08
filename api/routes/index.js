var express = require('express');
var app = express();
var router = express.Router();
var { verifyAuth0Token } = require('../helper/auth0')
// var multer = require('multer');
// var path = require('path');

var account = require('../controller/account')
var category = require('../controller/category')
var item = require('../controller/item')
var modifier = require('../controller/modifier')
var order = require('../controller/order')
var payment = require('../controller/payment')
var cash = require('../controller/cash')
var login = require('../controller/login')
var giftcard = require('../controller/giftcard')
var tab = require('../controller/tab')
var table = require('../controller/table')

// Login
router.post('/api/accounts/user/post/pin', login.login)
router.use(verifyAuth0Token)
router.post('/api/accounts/user/post/pin/verified', login.login)

// Account
router.get('/api/accounts/get/accounts', account.index)
router.get('/api/accounts/get/account/:id', account.edit)
router.get('/api/accounts/get/account/user/:userId', account.edit)
router.get('/api/accounts/get/account/merchant/:merchantId', account.edit)
router.post('/api/accounts/post/create', account.create)
router.post('/api/accounts/post/edit/:id', account.update)

// Category
router.get('/api/categories/get/allCategories', category.index)
router.get('/api/categories/get/edit/:id', category.edit)
router.post('/api/categories/post/create', category.create)
router.post('/api/categories/post/edit/:id', category.update)

// Item
router.get('/api/items/get/items', item.index)
router.get('/api/items/get/item/:id', item.edit)
router.post('/api/items/post/create', item.create)
router.post('/api/items/post/edit/:id', item.update)
router.get('/api/items/get/modifiers/:id', item.modifiers)

// Modifier
router.get('/api/item/get/modifiers', modifier.index)
router.get('/api/item/get/modifiers/:id', modifier.edit)
router.post('/api/item/post/modifiers/create', modifier.create)
router.post('/api/item/post/modifiers/edit/:id', modifier.update)

// Order
router.post('/api/carts/post/cart', order.create)
router.get('/api/carts/get/carts', order.index)

router.get('/api/history/get/allOrders', order.orders)
router.get('/api/history/get/allOrders/simple/byDate/:from/:to', order.report)
router.get('/api/history/get/orderTotals/:from/:to', order.totals)
router.get('/api/history/get/allTips/:from/:to', order.tips)
router.get('/api/history/get/order/:id', order.edit)


// Payment
router.post('/api/payment/post', payment.create)
router.post('/api/receipt/post/:contact', payment.send)

// Cash
router.post('/api/manager/post/openingAmount', cash.openDay)
router.post('/api/manager/post/closingAmount', cash.closeDay)
// router.post('/api/manager/post/tillAmount', cash.setEODTillAmount)   //<------ No matching ui found for this api in walk through pdf
router.post('/api/manager/post/dropAmount', cash.safeDrop)
router.get('/api/manager/get/cashDrop', cash.getCurrentCashDrops)
router.get('/api/manager/get/closingAmount', cash.getClosing)

// Tab
router.get('/api/tabs/get/allTabs', tab.allTabs)
router.post('/api/tabs/post/createTab', tab.create)
router.post('/api/tabs/post/updateTab/:id', tab.update)

// Table
router.get('/api/table/get/allTables', table.allTables)
router.post('/api/table/post/createTable', table.create)
router.post('/api/table/post/updateTable/:id', table.update)

//GiftCard
router.get('/api/giftcard/balance', giftcard.balance)
router.get('/api/giftcard/load', giftcard.load)
router.get('/api/giftcard/redeem', giftcard.redeem)

/***********************************************************************************************************************/
// var storage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, '../uploads');
//     },
//     filename: function (req, file, callback) {
//         callback(null, file.fieldname + '-' + Date.now());
//     }
// });
// var upload = multer({ storage: storage }).array('userPhoto', 2);




module.exports = router;

/***********************************************************************************************************************/
