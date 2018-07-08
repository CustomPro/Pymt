const config = require('../config/config.js');
const jwt = require('jsonwebtoken');

const allTables = (req, res) => {
    let auth = req.headers.authorization
    if(!auth || auth.indexOf('Bearer ') !== 0) {
        return res.status(401).json({
        success: false,
        message: 'Unauthorized request',
        status: 401
        })
    }
    let jwtToken = auth.split(' ')[1]

    try {
        let currentUser = jwt.verify(jwtToken, config.secret)
        let { getAllTables } = require('../db/table')

        getAllTables(currentUser.accountId, (err, tables)=> {
            if(err) {
              return res.status(400).json({
                success: false,
                message: err.message,
                status: 400
              })
            }

            return res.status(200).json({
              success: true,
              message: 'Table List',
              data: tables,
              status: 200
            })
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            status: 400
        })
    }
}

const create = (req, res) => {
    let auth = req.headers.authorization
    if(!auth || auth.indexOf('Bearer ') !== 0) {
        return res.status(401).json({
        success: false,
        message: 'Unauthorized request',
        status: 401
        })
    }
    let jwtToken = auth.split(' ')[1]

    try {
        let currentUser = jwt.verify(jwtToken, config.secret)
        let { createTable } = require('../db/table')

        createTable(currentUser.accountId, req.body, (err, tables)=> {
            if(err) {
              return res.status(400).json({
                success: false,
                message: err.message,
                status: 400
              })
            }
            return res.status(200).json({
              success: true,
              message: 'Successfully Created',
              status: 200
            })
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            status: 400
        })
    }
}

const update = (req, res) => {
    let auth = req.headers.authorization
    if(!auth || auth.indexOf('Bearer ') !== 0) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized request',
        status: 401
      })
    }
    let jwtToken = auth.split(' ')[1]

    try {
        let currentUser = jwt.verify(jwtToken, config.secret)
        let { updateTable } = require('../db/table')

        updateTable(currentUser.accountId, req.body, (err, tables)=> {
            if(err) {
              return res.status(400).json({
                success: false,
                message: err.message,
                status: 400
              })
            }
            return res.status(200).json({
              success: true,
              message: 'Successfully Updated',
              status: 200
            })
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            status: 400
        })
    }

}


module.exports = {
    allTables,
    create,
    update
}