// Define routes for simple SSJS web app. 
var async   = require('async')
  , express = require('express')
  , fs      = require('fs')
  , http    = require('http')
  , https   = require('https')
  , db      = require('./models');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);
app.use(express.bodyParser());
app.use(app.router);

app.use("/images", express.static(__dirname + '/images'));
app.use("/styles", express.static(__dirname + '/styles'));

// Render homepage (note trailing slash): example.com/
app.get('/', function(request, response) {
  var data = fs.readFileSync('index.html').toString();
  response.send(data);
});

// Render invites
/*app.get('/invites', function(request, response) {
  global.db.Invite.findAll().success(function(invites) {
    var invites_json = [];
    invites.forEach(function(invite) {
      invites_json.push({email: order.email, time: invite.time});
    });
    // Uses views/invites.ejs
    response.render("invites", {invites: invites_json});
  }).error(function(err) {
    console.log(err);
    response.send("error retrieving orders");
  });
});*/

// sync the database and start the server
db.sequelize.sync().complete(function(err) {
  if (err) {
    throw err;
  } else {
    http.createServer(app).listen(app.get('port'), function() {
      console.log("Listening on " + app.get('port'));
    });
  }
});

// add order to the database if it doesn't already exist
app.post('/invites', function(request, response) {
  var email = request.body.email;
  var regexEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (regexEmail.test(email)) {
    var time = new Date().getTime();
    var Invite = global.db.Invite;
    // find if invite has already been added
    Invite.find({where: {email: request.body.email}}).success(function(invite_instance) {
      if (!invite_instance) {
        // build instance if doesn't exist and save
        var new_invite_instance = Invite.build({
          email: email,
          time: time
        });
        new_invite_instance.save().success(function() {
          console.log('New invite requested. Email: ' + email);
          response.send(200);
        }).error(function(err) {
          console.log(err);
          response.send(500);
        });
      }
      else
        response.send(200);
    });
  }
  else
    response.send(500);
});
