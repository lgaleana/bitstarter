var Sequelize = require('sequelize');
var sq = null;
var pgregex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
var match = process.env.DATABASE_URL.match(pgregex);
var user = match[1];
var password = match[2];
var host = match[3];
var port = match[4];
var dbname = match[5];
var config =  {
  dialect:  'postgres',
  protocol: 'postgres',
  port:     port,
  host:     host,
  logging:  true //false
};
sq = new Sequelize(dbname, user, password, config);
global.db = {
  Sequelize: Sequelize,
  sequelize: sq,
  Invite: sq.import(__dirname + '/models/invite')
};

global.db.Invite.findAll().success(function(invites) {
  var cont = 0;
  invites.forEach(function(invite) {
    console.log(invite.time);
    var date = new Date(invite.time);
    console.log((++cont) + " - " + invite.email + " " + date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + ":" + 
                date.getHours());
  });
  return;
});
