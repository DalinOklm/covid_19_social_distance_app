const users = require('../Model/users_database')
const Admin = require('../Model/admin_database')
const express = require('express')
const mongoose = require('mongoose')
const iot = require('../server')
const users_waiting = require('../Model/user_waiting')
const In_storeUser = require("../Model/in_store_user")
const Annoucement = require("../Model/annoucement")

const router = express.Router()


 // Annoucement.find({}, null, {sort: {date: 1}}, function(err, docs) { console.log(docs) });
 // Annoucement.find({}, null, {sort: '-date'}, function(err, docs) { console.log(docs) });
  //Annoucement.find({}).sort([['updatedAt', -1]]).exec(function(err, docs) { console.log(docs) });

    router.get('/dashboard', async (req, res) => {
        var users_fromDB = await users.find({})
        var user_waitingfromDB = await users_waiting.find({})
        var in_store_userObject = await In_storeUser.find({})
        var annoucement_object = await Annoucement.find({})
      

      if(users_fromDB.length <= 0)
      {
        res.render('dashboard',{USERS_fromDB: users_fromDB , 
                             customer_token_id: 'default',
                             USERS_waitingfromDB: user_waitingfromDB,
                            in_store_usersfromDB: in_store_userObject,
                            admin_annoucement_toClient: annoucement_object });
      }  else{
        res.render('dashboard', {USERS_fromDB: users_fromDB , 
            customer_token_id: users_fromDB[0].tokens[0].token,
            USERS_waitingfromDB: user_waitingfromDB,
            in_store_usersfromDB: in_store_userObject,
            admin_annoucement_toClient: annoucement_object});  
      }
    //res.render('dashboard2')

    })
    
    router.get('/register_admin', (req, res) => {
        res.render('register_admin')
    })

    router.get('/login_admin', async (req, res) => {

        res.render('login_admin')
    })


    router.post('/login_admin_post', async (req, res) => {
        try {
       await console.log("req.body.username: "+req.body.username)
       await console.log("req.body.password: "+req.body.password)
      const admin = await Admin.findBy_Identity(req.body.username, req.body.password)
      const token = admin.makeToken()
       console.log("admin: "+admin)
      // res.send(admin)     
       res.redirect("/dashboard")
        } catch (e) {
            console.log("e: "+e)
            res.render('login_admin_error')
        }
    })


    
    
    router.get('/', (req, res) => {
        res.render('user_register') 
    })

    router.get('/user_login', (req, res) => {
        res.render('user_login') 
    })
    
    


module.exports = router