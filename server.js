const express = require('express')
const mongoose = require('mongoose')
const moment = require('moment')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const App_router = require("./Controle/router")
const users = require('./Model/users_database')
const admin = require('./Model/admin_database')
const users_waiting = require('./Model/user_waiting')
const In_storeUser = require('./Model/in_store_user')
const Annoucement = require('./Model/annoucement')
const auth = require('./Middleware/auth')


var moment_object = moment()

//**************

const cookieParser = require('cookie-parser')
 
//app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

//************** 

// view engine that allow us to mix HTM and Javascrip
app.set('view engine', 'ejs')

// allow us to access form fields 
//from the request in the router
app.use(express.urlencoded({ extended: false }))

// register the router
app.use(App_router)


const port = process.env.PORT || 3000

server.listen(process.env.PORT || port, function(){
    console.log('listen to port '+ port);
});



   
io.sockets.on('connection', function(socket) {
    
    //console.log('a user connected');
 
    // testing client and server connection
    socket.emit('back', 'hello you best serously ouut')

   // socket.on('best', async function(data){
      //  const _total_before = await users.find({})
       // console.log(data)
       // console.log('_total_before.length: '+_total_before.length)
    // io.sockets.emit('more_submit',  _total.length)

    
    app.post('/userdata',  async (req, res) => {
        // using the instance of the database 
        //we store all the data (in the mongoose model) that the users enter in each field 
        let user_database = new users({
            name: req.body.name,
            surname: req.body.surname,
            cellnumber: req.body.cellnumber ,
            age: req.body.age,
            item: req.body.item,
            username: req.body.username,
            password: req.body.password
        })
        try {

             // save the user data in the database
             await user_database.save()

            //make a token
            const token = await user_database.makeToken()
           // console.log("user_database._id: "+user_database._id)
            //console.log('here token._id: '+token._id)
             res.cookie('auth_token', token)
          

            // get all document from the database
            const _total = await users.find({})

           await io.sockets.emit('more_submit',  {total: _total.length, 
                                               surname: user_database.surname,
                                                name: user_database.name,
                                                cellnumber: user_database.cellnumber,
                                                age: user_database.age,
                                                item: user_database.item, 
                                                button_next_id: token, 
                                                user_id: user_database._id})

           await io.sockets.emit('landed', 'here we are')
    
           //console.log("user_database: "+user_database)
           // redirect the user to the interface
            res.redirect("/user_ui")
    
        } catch (e) {
            res.send('error tout')
        }
    
        //console.log(user_database)
        
        }) // end of user post request

    

   // }) // end of socket listen from client

      app.post('/admindata', async (req, res) => {
            // using the instance of the database 
            //we store all the data (in the mongoose model) that the users enter in each field 
            let admin_database = new admin({
                storename: req.body.storename,
                address: req.body.address,
                shoppingcenter: req.body.shoppingcenter ,
                username: req.body.username,
                password: req.body.password,
                storemanager: req.body.storemanager
            })
            try {
                // save the user data in the database
                admin_database = await admin_database.save()
                // get all document from the database
                const _totaladmin = await admin.find({})
                console.log("_totaladmin: "+_totaladmin)
                // notify everyone that someone was added to the line (in real-time)
              // await io.sockets.emit('more_submit',  {total: _total.length, surname: user_database.surname, name: user_database.name})
        
               // redirect the user to the interface
                res.redirect("/dashboard")
            } catch (e) {
                res.send('error tout')
            }
        
            //console.log(user_database)
            
            }) // end of user post request


            
    app.post('/user_login', async (req, res) => {
        try {
    //    await console.log("req.body.username: "+req.body.username)
    //    await console.log("req.body.password: "+req.body.password)
      const user = await users.findBy_Identity(req.body.username, req.body.password)
     // console.log("findBy_Identity done ")
      const token = await user.makeToken()
     // console.log("makeToken done ")
      // set the token as cookie
      res.cookie('auth_token', token)
    //  const token = user.makeToken()
     //  console.log("user: "+user)
      // res.send(admin)     
       res.redirect("/user_ui")
        } catch (e) {
            console.log("162 e: "+e)
            res.render('user_login')
        }
    })
          
 
        
    app.get('/user_ui', auth , async (req, res) => {
        var users_fromDB = await users.find({})
        var annoucementObject = await Annoucement.find({})
        
      const token = req.cookies['auth_token']
    // console.log('token.length: '+token.length)
   // console.log('/user_ui req.cookies[auth_token]: '+token)
   //console.log("users_fromDB[0].name: "+users_fromDB[0].name)
res.render('user_ui', {USERS_fromDB: users_fromDB, 
                      owner:  req.user.name, 
                      customer_token: token,
                       user_id: req.user._id,
                    annoucement_toClient: annoucementObject})
    })    

   
    app.get('/hqDashboard', (req, res) =>{
        res.render('hq_Dashboard')
    })

    // admin calling customer
    socket.on('this_customer', function(data){
     //   console.log("This_customer: "+data.customer_id)
      //  console.log("data.msg: "+data.msg)
        io.sockets.emit('call_customer',{msg: data.msg, looking_customer: data.customer_id })
    })

    //customer reponse
    socket.on('on_my_way', async (data) =>{
       // user = await users.findOne({ _id: docToken._id, 'tokens.token': data.customer_res_token })
       // console.log('req.user: '+req.user) 
       // console.log('customer response data.msg: '+data.msg)
       // console.log('data.customer id: '+data.customer_res_id)

    
const _user = await users.findOne({ _id: data.customer_res_id })

       // console.log('_user: '+_user)
       var user_waitingObject = new users_waiting({
        name: _user.name,
        surname: _user.surname,
        cellnumber: _user.cellnumber ,
        age: _user.age,
        item: _user.item,
        username: _user.username,
        password: _user.password
       })

       await user_waitingObject.save()

        // console.log('_user.name: '+_user.name)
        // console.log('_user.surname: '+_user.surname)
        // console.log('_user.cellnumber: '+_user.cellnumber)
        // console.log('_user.age: '+_user.age)
        // console.log('_user.item: '+_user.item)
        // console.log('_user.username: '+_user.username)
        // console.log('_user.password: '+_user.password)
        // console.log('_user.tokens[0].toke: '+_user.tokens[0].token)

       // var user_details = await users.findById(data.customer_res_id)
      // console.log('server confirm users: '+user_details)
      //  console.log('data.customer_id: '+data.customer_res_id)

       
    // var user_details = await users.findById(data.customer_res_id)
    // console.log('server confirm users: '+user_details)
        
    var users_waiting_total = await users_waiting.find({})
  //  console.log("228 user_waitingObject._id: "+user_waitingObject._id)
    io.sockets.emit('to_admin', {msg:'customer said she/he coming',
                             name: _user.name,
                             surname: _user.surname, 
                             item: _user.item,
                             cellnumber: _user.cellnumber, 
                             age: _user.age,
                             user_waiting_total: users_waiting_total.length,
                             user_id_to_remove: data.customer_res_id,
                             user_token: _user.tokens[0].token,
                             waiting_user_id: user_waitingObject._id,
                             total_user_waiting:  users_waiting_total.length
                            })

                                
        await users.deleteOne({_id: data.customer_res_id})

        var users_fromDB = await users.find({})
        io.sockets.emit('updated_users_count', users_fromDB.length)
    }) // end of "on my way event"


    socket.on("User_present", async function(data) {
       // console.log('249 user present_user_id: '+data.present_user_id)
      //  console.log('data.msg: '+data.msg)

      // const user_waitingObject = await users_waiting.findOne({ _id: data.present_user_id })
       const _users_waiting_instance = await users_waiting.findOne({ _id: data.present_user_id })
      // console.log("254 wainting list: "+_users_waiting_instance)

       // console.log('_user: '+_user)
       var in_storeUserObject = new In_storeUser({
        name: _users_waiting_instance.name,
        surname: _users_waiting_instance.surname,
        cellnumber: _users_waiting_instance.cellnumber ,
        age: _users_waiting_instance.age,
        item: _users_waiting_instance.item,
        username: _users_waiting_instance.username,
        password: _users_waiting_instance.password
       })

       await in_storeUserObject.save()

       //In_storeUser
       const In_storeUser_instance = await In_storeUser.find({})
     //  console.log("281 In_storeUser.length: "+In_storeUser_instance.length)
      
     io.sockets.emit('User_present_response', {msg: "update waiting list count",
                                        //   waiting_list_count: _user_waiting.length,
                                           name: _users_waiting_instance.name,
                                           surname: _users_waiting_instance.surname, 
                                           item: _users_waiting_instance.item,
                                           age: _users_waiting_instance.age, 
                                           cellnumber: _users_waiting_instance.cellnumber,
                                         //  user_id_to_remove: data.customer_res_id,
                                         //  user_token: _user.tokens[0].token,
                                         inStore_user_id: in_storeUserObject._id,
                                           totatl_user_inStore:  In_storeUser_instance.length
                                        })

                                        
                                        await users_waiting.deleteOne({ _id: data.present_user_id })
                                        const _user_waiting = await users_waiting.find({})
                                      //  console.log("285 _user_waiting.length: "+_user_waiting.length)

                                        io.sockets.emit('updated_waitinglist_count', _user_waiting.length)

    })


    // socket.on("remove_from_waintingList", async function(data){
    //     console.log("295 data: "+data)
    // var _users_to_remove = users_waiting.findOne({_id: data})
    // console.log("297 user doc to removee: "+_users_to_remove)
    // })


    socket.on("remove_from_inStoreList", async function(data){
       // console.log("302 remove_from_inStoreList event: "+data.present_user_id)
   // var _users_to_remove = await In_storeUser.findOne({_id: data.present_user_id})
   // await users_waiting.deleteOne({ _id: data.present_user_id })
   await In_storeUser.deleteOne({_id: data.present_user_id})
   var updata_inStoreList_count = await In_storeUser.find({})
   socket.emit("updata_instore_count", updata_inStoreList_count.length)
    })


    socket.on("new_post", async function(data){

        var _annoucement = new Annoucement({
            title: data.title,
            subtitle: data.subtitle,
            paragraph : data.description
        })

        await _annoucement.save()

        // console.log("data.title: "+data.title)
        // console.log("data.subtitle: "+data.subtitle)
        // console.log("data.description: "+data.description)

        io.sockets.emit("admin_new_post", {title: data.title, subtitle: data.subtitle, description: data.description})
    })

    socket.on("ask_for_time", async function(data){
    //    console.log("ask time: "+data.msg)
    //     console.log("user_time ask id: "+data.time_user_id)

       var users_doc = await users.findOne({ _id: data.time_user_id }) 
       
       if (users_doc) {
        // console.log("354 now and entry compare time: "+moment(users_doc.updatedAt).startOf('second').fromNow(Date.now))
        // console.log("355 **************************************************")
        var time_waited_res = moment(users_doc.updatedAt).startOf('second').fromNow(moment_object)
        io.sockets.emit("time_waited_res", {msg: time_waited_res, user_waited_id: data.time_user_id})
           // console.log(users_doc.updatedAt)
       }else
       {
           console.log("no user found")
       }
   
    })

  async function wainting_list_clock() {
       var users_waitinList = await users_waiting.find({})
      // console.log(users_waitinList)
    //   if (users_waitinList.length < 0) {
        for (let index = 0; index < users_waitinList.length; index++) {

            var time_waited_res = moment(users_waitinList[index].updatedAt).startOf('second').fromNow(moment_object)
           // console.log("time: "+time_waited_res)
              io.sockets.emit("waiting_list_clock", {msg: time_waited_res, update_time_user_id : users_waitinList[index]._id} )
          }
          setTimeout(wainting_list_clock, 60000);
    //   } else {
    //       console.log("378 no user find in waiting")
    //   }
      
   }

   wainting_list_clock()


   async function inStore_list_clock() {
    var users_storeUser = await In_storeUser.find({})
   // console.log(users_waitinList)
 //   if (users_waitinList.length < 0) {
     for (let index = 0; index < users_storeUser.length; index++) {

         var time_inStore_res = moment(users_storeUser[index].updatedAt).startOf('second').fromNow(moment_object)
        // console.log("time: "+time_waited_res)
           io.sockets.emit("inStore_list_clock", {msg: time_inStore_res, update_time_user_id_inStore : users_storeUser[index]._id} )
       }
       setTimeout(inStore_list_clock, 60000);
 //   } else {
 //       console.log("378 no user find in waiting")
 //   }
   
}

inStore_list_clock()
    
}) // end of socket connection event

