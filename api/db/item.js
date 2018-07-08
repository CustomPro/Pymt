var connection = require('../config/connection.js');
var { getAllModifierWithItemId } = require('./modifier');

function setItemValues(item) {
  return {
    "itemId": item.itemId, //if new item system will generate with next number and starts at 5 numbers long
    "itemName": item.itemName,
    "image": item.image,
    "soldByWeight": item.soldByWeight,
    "trackInventory": item.trackInventory,
    "allowBackorder": item.allowBackorder,
    "isTaxable": item.isTaxable,
    "isEBT": item.isEBT,
    "isFSA": item.isFSA,
    "selectors": {
      "selectorId": item.selectorId,
      "selectorName": item.selectorName,
      "details": [
        {
          "itemId": item.details_itemId,
          "name": item.details_name,
          "cost": item.details_cost,
          "price": item.details_price,
          "quantityRemaining": item.details_quantityRemaining,
          "itemWeight": item.details_itemWeight
        }
      ]
    },
    "modifiers": []
  }
}

function getAllItems(account_id, item_id, callback) {
  var sql = `select i.id itemId, i.name itemName, i.image, i.sold_by_weight soldByWeight,
  i.track_inventory trackInventory, i.allow_backorder allowBackorder, i.selector_name selectorName,
  i.is_taxable isTaxable, i.is_ebt isEBT, i.is_fsa isFSA, i.selector_id selectorId,
  d.id details_itemId, d.name details_name, d.cost details_cost, d.price details_price,
  d.quantity_remaining details_quantityRemaining, d.item_weight details_itemWeight
  from items i left outer join item_detail d on d.item_id = i.id
  where account_id = ${account_id}`

  if(item_id) sql += ` and i.id = '${item_id}' order by i.id`
  else sql += ' order by i.id'

  connection.query(sql, function(err, result) {
    if(err) callback(err, result)
    if(!result || !result.length) return callback(err, result)
    else {
      var items = [setItemValues(result[0])]
      for(var i=0; i<result.length; i++) {
        var item = result[i+1]
        if(!item) break;
        var lastItem = items[items.length-1]
        if(item.itemId === lastItem.itemId) {
          lastItem.selectors.details.push({
            "itemId": item.details_itemId,
            "name": item.details_name,
            "cost": item.details_cost,
            "price": item.details_price,
            "quantityRemaining": item.details_quantityRemaining,
            "itemWeight": item.details_itemWeight
          })
        } else {
          var nextItem = setItemValues(item)
          items.push(nextItem)
        }
      }

      // add modifiers
      getAllModifierWithItemId(account_id, (err, result) => {
        if(err) callback(err, result)
        else {
          for(var i=0; i<items.length; i++) {
            var item = items[i]
            for(var j=0; j<result.length; j++) {
              var modifier = result[j]
              if(item.itemId === modifier.itemId) {
                var itemModifier = item.modifiers.filter(m => m.modifierId === modifier.modifierId)[0]
                if(itemModifier) {
                  itemModifier.modifiers[modifier.attribute] = modifier.value
                } else {
                  var modifiers = {}
                  modifiers[modifier.attribute] = modifier.value
                  var modifierItem = {
                    modifierId: modifier.modifierId,
                    modifierName: modifier.modifierName,
                    modifiers: modifiers
                  }
                  item.modifiers.push(modifierItem)
                }
              } else {
                continue
              }
            }
          }
          callback(null, items)
        }
      })
    }
  });
}

function createItem(item, callback) {
  if(!item.selectors) return callback(new Error('No selectors found in request item'), null)

  var sql = `insert into items (name, image, sold_by_weight, track_inventory, allow_backorder,
    is_taxable, is_ebt, is_fsa, selector_id, selector_name, account_id)
    values ('${item.itemName}', '${item.image}', ${item.soldByWeight}, ${item.trackInventory}, ${item.allowBackorder},
    ${item.isTaxable}, ${item.isEBT}, ${item.isFSA}, '${item.selectors.selectorId}', '${item.selectors.selectorName}', ${item.account_id})`
  connection.query(sql, function(err, createdItem) {
    if(err) callback(err, null)
    else {
      sql = `insert into item_modifier_map (item_id, modifier_id) values `
      sql += item.modifiers.map(m => `(${createdItem.insertId}, ${m.modifierId})`).join(',')
      console.log(sql)
      connection.query(sql, function(err, result) {
        if(err) callback(err, null)
        else {

          var addDetail = () => {
            var detail = item.selectors.details.shift()
            sql = `insert into item_detail (item_id, name, cost, price, quantity_remaining, item_weight)
            values (${createdItem.insertId}, '${detail.name}', ${detail.cost}, ${detail.price}, ${detail.quantityRemaining}, ${detail.itemWeight})`

            connection.query(sql, function(err, result) {
              if(err) callback(err, null)
              else {
                if(item.selectors.details.length) addDetail()
                else {
                  callback(err, result)
                }
              }
            })
          }
          addDetail()
        }
      })
    }
  });
}

function updateItem(item, callback) {
  if(!item.selectors) return callback(new Error('No selectors found in request item'), null)

  var sql = `update items set name = '${item.itemName}', image = '${item.image}', sold_by_weight = ${item.soldByWeight},
  track_inventory = ${item.trackInventory}, allow_backorder = ${item.allowBackorder}, is_taxable = ${item.isTaxable},
  is_ebt = ${item.isEBT}, is_fsa = ${item.isFSA}, selector_id = ${item.selectors.selectorId},
  selector_name = '${item.selectors.selectorName}' where account_id = ${item.account_id} and id = ${item.id}`
  connection.query(sql, function(err, result) {
    if(err) callback(err, result)
    else {

      sql = `delete from item_modifier_map where item_id = ${item.id}`
      connection.query(sql, function(err, result) {
        if(err) callback(err, result)
        else {
          sql = `insert into item_modifier_map (item_id, modifier_id) values `
          sql += item.modifiers.map(m => `(${item.id}, ${m.modifierId})`).join(',')

          connection.query(sql, function(err, result) {
            if(err) callback(err, null)
            else {

              sql = `delete from item_detail where item_id = ${item.id}`
              connection.query(sql, function(err, result) {
                if(err) callback(err, result)
                else {

                  var addDetail = () => {
                    var detail = item.selectors.details.shift()
                    sql = `insert into item_detail (item_id, name, cost, price, quantity_remaining, item_weight)
                    values (${item.id}, '${detail.name}', ${detail.cost}, ${detail.price}, ${detail.quantityRemaining}, ${detail.itemWeight})`

                    connection.query(sql, function(err, result) {
                      if(err) callback(err, null)
                      else {
                        if(item.selectors.details.length) addDetail()
                        else {
                          callback(err, result)
                        }
                      }
                    })
                  }
                  addDetail()
                }
              })
              
            }
          })
        }
      })


    }
  });
}

module.exports = {
  getAllItems,
  createItem,
  updateItem
}
