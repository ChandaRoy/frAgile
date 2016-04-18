var express = require('express'),
  router = express.Router();

module.exports = function(passport){
  console.log("called authhandler");
	//sends successful login state back to angular
	router.get('/success', function(req, res){
		//res.send({error:null});
    	res.send({ error: "Registered Sucessfully"});
    console.log("In success");
    console.log(req.body);
  //  res.status(200).json();
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		res.send({ error: "Invalid email id or password"});
		// req.session.user=null;
	});
	router.use('/login',function(req,res,next) {
  //  console.log(req.body);
  //  console.log(passport);
    next();
  });
	router.post('/login', passport.authenticate('local-login', {
		successRedirect: '/home.html',
		failureRedirect: '/auth/failure'
	}));

	//sign up
  router.use('/register',function(req,res,next) {
    console.log("Request Body.",req.body);
    next();
  });
	router.post('/register', passport.authenticate('sign-up', {
		successRedirect: '/index.html',
		failureRedirect: '/auth/failure'
	}));

  router.get('/home',function(req,res) {
    console.log("blah");
  });

  router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));

  	router.get('/facebook/callback',
  	passport.authenticate('facebook', { successRedirect: '/home.html',
  																			failureRedirect: '/index.html' }));
  	//login using google
  	router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    router.get('/google/callback',
  	passport.authenticate('google', { successRedirect: '/home.html',
  																			failureRedirect: '/index.html'}));

	return router;

}