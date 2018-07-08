var connection = require('../config/connection.js');

function setItemValues(item) {
  var modifier = {
    "modifierId": item.modifier_id,
    "modifierName": item.modifier_name,
    "modifiers": {

    }
  }
  modifier.modifiers[item.attribute] = item.value
  return modifier
}

function getAllModifier(account_id, modifier_id, callback) {
  var sql = `select m.id modifier_id, m.name modifier_name, a.name attribute, a.value from modifier m
  left outer join modifier_attribute a on m.id = a.modifier_id where account_id = ${account_id}`

  if(modifier_id) sql += ` and m.id = '${modifier_id}'`

  connection.query(sql, function(err, result) {
    if(err) callback(err, result)
    if(!result || !result.length) return callback(err, result)
    else {
      var modifiers = [setItemValues(result[0])]
      for(var i = 0; i < result.length; i++) {
        var modifier = result[i+1]
        if(!modifier) break;
        var lastItem = modifiers[modifiers.length -1]
        if(lastItem.modifierId === modifier.modifier_id) {
          lastItem.modifiers[modifier.attribute] = modifier.value
        } else {
          modifiers.push(setItemValues(modifier))
        }
      }
      callback(null, modifiers)
    }
  });
}

function getModifiersForItem(account_id, item_id, callback) {
  var sql = `select i.id item_id, m.id modifier_id, m.name modifier_name, a.name attribute, a.value
from item_modifier_map p inner join modifier m on m.id = p.modifier_id inner join items i on i.id = p.item_id
inner join modifier_attribute a on m.id = a.modifier_id where i.account_id = ${account_id} and i.id = ${item_id}`

  connection.query(sql, function(err, result) {
    if(err) callback(err, result)
    if(!result || !result.length) return callback(err, result)
    else {
      var modifiers = [setItemValues(result[0])]
      for(var i = 0; i < result.length; i++) {
        var modifier = result[i+1]
        if(!modifier) break;
        var lastItem = modifiers[modifiers.length -1]
        if(lastItem.modifierId === modifier.modifier_id) {
          lastItem.modifiers[modifier.attribute] = modifier.value
        } else {
          modifiers.push(setItemValues(modifier))
        }
      }
      callback(null, modifiers)
    }
  });
}

function createModifier(modifier, callback) {
  var sql = `insert into modifier (name, account_id) values ('${modifier.modifierName}', ${modifier.account_id})`
  connection.query(sql, function(err, result) {
    if(err) callback(err, result)
    else {
      var modifiers = modifier.modifiers
      var mods = Object.keys(modifiers)

      var addModifire = () => {
        var key = mods.shift()
        var value = modifiers[key]
        sql = `insert into modifier_attribute (modifier_id, name, value)
        values (${result.insertId}, '${key}', '${value}')`
        connection.query(sql, function(err, result) {
          if(err) callback(err, null)
          else {
            if(mods.length) addModifire()
            else {
              callback(err, result)
            }
          }
        })
      }
      addModifire()
    }
  });
}

function updateModifier(modifier, callback) {
  var sql = `update modifier set name = '${modifier.modifierName}' where id = ${modifier.id} and account_id = ${modifier.account_id}`
  connection.query(sql, function(err, result) {
    if(err) callback(err, result)
    else {
      sql = `delete from modifier_attribute where modifier_id = ${modifier.id}`
      connection.query(sql, function(err, result) {
        if(err) callback(err, result)
        else {
          var modifiers = modifier.modifiers
          var mods = Object.keys(modifiers)

          var addModifire = () => {
            var key = mods.shift()
            var value = modifiers[key]
            sql = `insert into modifier_attribute (modifier_id, name, value)
            values (${modifier.id}, '${key}', '${value}')`
            connection.query(sql, function(err, result) {
              if(err) callback(err, null)
              else {
                if(mods.length) addModifire()
                else {
                  callback(err, result)
                }
              }
            })
          }
          addModifire()
        }
      })
    }
  });
}

function getAllModifierWithItemId(account_id, callback) {
  var sql = `select i.id itemId, f.id modifierId, f.name modifierName, a.name attribute, a.value value
  from items i inner join item_modifier_map p on i.id = p.item_id inner join modifier f on f.id = p.modifier_id
  left outer join modifier_attribute a on a.modifier_id = f.id where f.account_id = ${account_id} order by itemId, modifierId`
  connection.query(sql, function(err, result) {
    callback(err, result)
  });
}

module.exports = {
  getAllModifier,
  createModifier,
  updateModifier,
  getAllModifierWithItemId,
  getModifiersForItem
}
