const config = require('../config/config.js');
const jwt = require('jsonwebtoken');

const allTabs = (req, res) => {
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
        let { getAllTabs } = require('../db/tab')

        getAllTabs(currentUser.accountId, (err, tabs)=> {
            if(err) {
              return res.status(400).json({
                success: false,
                message: err.message,
                status: 400
              })
            }

            return res.status(200).json({
              success: true,
              message: 'Tab List',
              data: tabs,
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
        let { createTab } = require('../db/tab')

        createTab(currentUser.accountId, req.body, (err, tab)=> {
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
        let { updateTab } = require('../db/tab')

        updateTab(currentUser.accountId, req.body, (err, tab)=> {
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

module.exports = {
    allTabs,
    create,
    update
}