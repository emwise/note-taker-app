//I dont use this anymore, i use my own auth function...

const passport = require('passport')
const BearerStrategy = require('passport-http-bearer')
const UserModel = require('./users/model')

//this is a verifier callback function -
//its tells if the access token is correct or incorrect.
//this works so long as you include authorization key in your header in 
//postman. The value needed is "bearer ${token}" 
passport.use(new BearerStrategy(
  function(accessToken, done) {
    UserModel.findOne( { accessToken })
      .then((foundUser)=>{
        if(foundUser){
          return done(null, {
            id: foundUser._id,
            accessToken: foundUser.accessToken
          }) //this object gets attached to req.user and is accessible because it is a middleware
        }else{
          return done(null, false)
        }
      })
      .catch((err)=>{
        done(err)
      })


    //this below code is from the website
    // User.findOne({ token: token }, function (err, user) {
    //   if (err) { return done(err); }
    //   if (!user) { return done(null, false); }
    //   return done(null, user, { scope: 'all' });
    // });
  }
));

// auth.use(
//   //replaces passport.authenticate()
//   function auth(req, res, next){
//     const accessToken = req.cookies['Authentication'];
//     const userEmail = req.cookies['Email'];
//     console.log(accessToken)
//     UserModel.findOne({ email: userEmail})
//       .then((userDocument)=>{
//         console.log(userDocument.accessToken)
//         if(accessToken === userDocument.accessToken){
//           req.userDocument = userDocument;
//           next()
//         }else{
//           res.send('unauthorized');
//         }
//       })
//   }
// )




module.exports = passport

// module.exports = {
//   passport: passport, 
//   auth: auth
// }