var Member = require('./models/member');
var Event = require('./models/event');


module.exports = function(app, passport) {

// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.redirect("/login");
	});
	app.get('/events', isLoggedIn, function(req, res) {
		res.sendfile("./public/events.html");
	});

	app.get('/ready', isLoggedIn, function(req, res) {
		res.sendfile("./public/ready.html");
	});
	app.get('/imported', isLoggedIn, function(req, res) {
		res.sendfile("./public/imported.html");
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/events', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		
// api ---------------------------------------------------------------------
	

	// get all events	
	app.get('/api/events', isLoggedIn, function(req, res) {
		Event.find({status:'PENDING', user:req.user.email},function(err, events) {
			if (err)
				res.send(err)
			res.json(events); 
		});
	});

	// get events	
	app.get('/api/events/:status', isLoggedIn, function(req, res) {
		Event.find({status:req.params.status, user:req.user.email},function(err, events) {
			if (err)
				res.send(err)
			res.json(events); 
		});
	});

	// get events	
	app.get('/api/all/events/:status', checkUserCredentials, function(req, res) {
		Event.find({status:req.params.status},function(err, events) {
			if (err)
				res.send(err)
			res.json(events); 
		});
	});

	app.get('/api/event/:event_id', isLoggedIn, function(req, res) {
		var ObjectId = require('mongoose').Types.ObjectId; 
		var query = { _id: new ObjectId(req.params.event_id) };
		Event.find(query, function(err, events) {
			if (err)
				res.send(err)
			res.json(events); 
		});
	});

	app.post('/api/events', isLoggedIn, function(req, res) {
		if((!req.body.name) && (!req.body.status)) {
			console.log("Request to update event with no data:" + req.body);
			return;
		}
		var upsertData = {
		  name: req.body.name,
		  date: req.body.date,
		  status: req.body.status,
		  days: req.body.days,
		  user: req.user.email
		};
		//var upsertData = event.toObject();
		if(req.body._id != null) {
			//delete upsertData._id
			var ObjectId = require('mongoose').Types.ObjectId; 
			Event.update({_id: new ObjectId(req.body._id)}, 
				upsertData, 
				{}, 
			 	function(err, numAffected) {

					if (err)
						res.send(err);
					Event.find({status:'PENDING',user:req.user.email},function(err, events) {
						if (err)
							res.send(err)
						res.json(events);
					});
				}
			);
		} else {
			Event.create(upsertData, 
			 	function(err, todo) {
					if (err)
						res.send(err);
						Event.find({status:'PENDING',user:req.user.email},function(err, events) {
							if (err)
								res.send(err)
							res.json(events);
						});
				}
			);
		}
	});

	app.post('/api/attendants', isLoggedIn, function(req, res) {
		var upsertData = {
		  attendants: req.body.attendants,
		};
		var ObjectId = require('mongoose').Types.ObjectId; 
		Event.update({_id: new ObjectId(req.body._id)}, 
			upsertData, 
			{}, 
		 	function(err, numAffected) {
				if (err)
					res.send(err);
				res.json({'status': 'OK'});
			}
		);


	});

	app.delete('/api/events/:event_id', isLoggedIn, function(req, res) {
		var ObjectId = require('mongoose').Types.ObjectId; 
		Event.update({_id: new ObjectId(req.params.event_id)}, 
			{status: 'DELETED'}, 
			{}, 
		 	function(err, numAffected) {

				if (err)
					res.send(err);
				Event.find({status:'PENDING',user:req.user.email},function(err, events) {
					if (err)
						res.send(err)
					res.json(events);
				});
			}
		);
		
	});

	app.delete('/api/events/ready/:event_id', isLoggedIn, function(req, res) {
		var ObjectId = require('mongoose').Types.ObjectId; 
		Event.update({_id: new ObjectId(req.params.event_id)}, 
			{status: 'DONE'}, 
			{}, 
		 	function(err, numAffected) {

				if (err)
					res.send(err);
				Event.find({status:'PENDING',user:req.user.email},function(err, events) {
					if (err)
						res.send(err)
					res.json(events);
				});
			}
		);
		
	});

	app.get('/api/events/imported/:event_id', checkUserCredentials, function(req, res) {
		var ObjectId = require('mongoose').Types.ObjectId; 
		Event.update({_id: new ObjectId(req.params.event_id)}, 
			{status: 'IMPORTED'}, 
			{}, 
		 	function(err, numAffected) {

				if (err)
					res.send(err);
				
				res.json({'status': 'IMPORTED'});
				
			}
		);
		
	});

	app.delete('/api/events/pending/:event_id', isLoggedIn, function(req, res) {
		var ObjectId = require('mongoose').Types.ObjectId; 
		Event.update({_id: new ObjectId(req.params.event_id)}, 
			{status: 'PENDING'}, 
			{}, 
		 	function(err, numAffected) {

				if (err)
					res.send(err);
				Event.find({status:'DONE',user:req.user.email},function(err, events) {
					if (err)
						res.send(err)
					res.json(events);
				});
			}
		);
		
	});

	app.get('/api/members/', isLoggedIn, function(req, res) {
		Member.find({},function(err, members) {
					if (err)
						res.send(err)
					res.json(members);
				});
	});

	app.get('/api/members/update', isLoggedIn, function(req, res) {
		var http = require('http');
		http.get("XXXXXXXXXXXXXXXXXXXXXXX", function(response) {

		  //another chunk of data has been recieved, so append it to `str`
		  str = ""
		  response.on('data', function (chunk) {
		    str += chunk;
		  });

		  //the whole response has been recieved, so we just print it out here
		  response.on('end', function () {
		    ar = JSON.parse(str);

		    var mongoose = require('mongoose');

		    mongoose.connection.db.dropCollection("members");
		    ar.forEach(function(entry) {
			    Member.create(entry);
			});
		    		  
		   	res.send("Added " + ar.length)

		  });

		}).on('error', function(e) {
		  console.log("Got error: " + e.message);
		});
		
	});

	app.get('/api/stats', isLoggedIn, function(req, res) {
		//var mongoose = require('mongoose');
		Event.aggregate(
			[{ $group: { _id: {status:"$status",user:"$user"}, total: { $sum: 1 } } }],
				function(err, stats) {
						dct = {}
	 					 stats.forEach(function(entry) {
						    total = entry['total'];
						    user = entry['_id']['user'];
						    status = entry['_id']['status'];
						    if(!(user in dct)) {
						    	dct[user] = {'name': user}
						    }
						    
						    dct[user][status] = total

						});

	 					 res.json(dct);
				}	
			);
		    

	});


};

function checkUserCredentials(req, res, next) {
var User       = require('./models/user');
	User.findOne({ 'email' :  req.query.username }, function(err, user) {
                if (user) {
                    if(user.validPassword(req.query.password)) {
                    	return next();
                    } 
                }
                res.status(401);
                res.json({'status':'unauthorized'})
            });
}
// route middleware to ensure user is logged in

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
