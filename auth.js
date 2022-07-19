const passport = require('passport')
const BearerStrategy = require('passport-http-bearer')
const UserModel = require('./users/model')

//this is a verifier callback function -
//its tells if the access token is correct or incorrect.
//this works so long as you include authorization key in your header in 
//postman. The value needed is "bearer correct" because (token === 'correct')
passport.use(new BearerStrategy(
  function(accessToken, done) {
    UserModel.findOne( { accessToken })
      .then((foundUser)=>{
        if(foundUser){
          return done(null, foundUser) //this object gets attached to req.user and is accessible because it is a middleware
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

module.exports = passport