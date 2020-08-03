// middleware file
const jwt = require('jsonwebtoken')
const User = require('../Model/users_database')

const auth = async(req, res, next) => {
    try {
        // grab the token from the header key, in the request
        // new code
        const token = req.cookies['auth_token']

        // old code, looking for token in request
       // const token = req.header('Authorization').replace('Bearer ','')

        // check if it a valid token
        // this is a object that contain the user's ID
        const docToken = jwt.verify(token,'thisrun')
       // console.log("docToken._id: "+ docToken._id)

        // in the token document, there is an ID associated with the user
        // use that id to find the user in the database
        const user = await User.findOne({ _id: docToken._id, 'tokens.token': token })

        // if no user were find, throw an error
        if(!user)
        {
          throw new Error();
        }

        // add 'user' property to the request method and 
        // assign the user find in the database
        req.user = user;
        req.token = token;
    

        // the 'next' method tell nodejs to move to the next codes
        next()

    } catch (e) {
      //  res.status(401).send("error: please login")
      console.log('error occur in Auth file')
    }
}

// export the auth method, so we can use it in the router file
module.exports = auth