var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var querystring = require('querystring');
var mysql = require('mysql');


var apiKey = 'OGQwYjdjNzAtNDZkMC00ZTE5LTk2YWYtMzRlN2I2ZjEwN2Fk';
var apiKeySearch = 'OGQwYjdjNzAtNDZkMC00ZTE5LTk2YWYtMzRlN2I2ZjEwN2Fk=';
var apiSecret = 'MThmMDBkMmMtMTM0Ni00M2IyLTkyNTYtN2JmOWRjNzE5ZDYy';

var port = 2000;
var baseUrl = 'http://localhost:' + port;
var redirectUri = baseUrl + '/authorize';

var app = express();

app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/../'));
app.use(bodyParser.json());







/******************************************************************************************
************************************** FUNCTIONS ******************************************
/*****************************************************************************************/

/**
*MySQL Database connection
**/
const db = mysql.createConnection({
  host: "trackhub.cf4gndt9uoc8.us-east-2.rds.amazonaws.com",
  user: "trackadmin",
  password: "track2admin",
  database: "trackhub"
});

db.connect((err) => {
  if (err){
    console.log("Error in connect: " + err)
    throw err;
  } else{
    console.log("Mysql connected...");
  }
});


app.get('/getUsers', function(request, response){
  db.query('select * from users', function(err, results){
    if (err){
      console.log("Error in getUsers: " + err);
      response.send(400);
    }
    console.log("Users: " + results);
    response.send(results);
  });
});

app.get('/createNewUser', function(request, response){
  var username = request.param('user', '');
  var password = request.param('pass', '');
  var email = request.param('email', '');
  var first_name = request.param('first_name', '');
  var last_name = request.param('last_name', '');

  db.query('insert into users (username, password, email, first_name, last_name) values ("' + username + '", "' + password + '", "' + email + '", "' + first_name + '", "' + last_name + '");', function(err, results){
    if (err){
      err = err.toString();
      console.log("Error in createNewUser: " + err);
      if (err.indexOf("ER_DUP_ENTRY")){
        console.log("Here")
        response.send("ER_DUP_ENTRY");
      }else{
        response.send(400);
      }
    }
    else{
      console.log("Success made new user!");
      response.send(results);
    }
  });
});

app.get('/signIn', function(request, response){
  var username = request.param('username', '');
  var password = request.param('password', '');

  db.query('select count(1) as count, username from users where username="' + username + '" and password = "' + password + '";', function(err, results){
    if (err){
      console.log("Error in signIn: " + err);
      response.send(400);
    }
    else{
      console.log("Got log in results!" + results);
      response.send(results);
    }
  });
});


/********************************** Napster Functions ******************************/

/**
*Napster functions
**/
app.get('/', function(request, response) {
  /*var path = 'https://api.napster.com/oauth/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: apiKey,
    redirect_uri: redirectUri
  });*/
  var path = "http://localhost:2000/landing_page.html"
  response.redirect(path);
});

app.get('/makeAccount', function(clientRequest, clientResponse){
  request.post({
    url: 'https://order.napster.com/checkout/',
    form: {
      client_id: apiKey,
      client_secret: apiSecret,
      response_type: 'code',
      code: clientRequest.query.code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }
  }, function(err, response, body){
    body = JSON.parse(body);
    clientResponse.redirect(baseUrl + '/home.html?' + querystring.stringify({
      accessToken: body.access_token,
      refreshToken: body.refresh_token
    }));
  });
});

app.get('/authorize', function(clientRequest, clientResponse) {
  request.post({
    url: 'https://api.napster.com/oauth/access_token',
    form: {
      client_id: apiKey,
      client_secret: apiSecret,
      response_type: 'code',
      code: clientRequest.query.code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }
  }, function(error, response, body) {
    body = JSON.parse(body);
    clientResponse.redirect(baseUrl + '/home.html?' + querystring.stringify({
      bod: body,
      res: response,
      accessToken: body.access_token,
      refreshToken: body.refresh_token
    }));
  });
});

app.get('/reauthorize', function(clientRequest, clientResponse) {
  var refreshToken = request.query.refreshToken;

  if (!refreshToken) {
    clientResponse.json(400, { error: 'A refresh token is required.'});
    return;
  }

  request.post({
    url: 'https://api.napster.com/oauth/access_token',
    form: {
      client_id: apiKey,
      client_secret: apiSecret,
      response_type: 'code',
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }
  }, function(error, response, body) {
    console.log('Platform response:', {
      error: error,
      statusCode: response.statusCode,
      body: body
    });

    if (response.statusCode !== 200) {
      clientResponse.json(response.statusCode, { error: error || body });
      return;
    }

    clientResponse.json(200, JSON.parse(body));
  });
});




/**
*Messsage to listen on port
**/

app.listen(port, function() {
  console.log('Listening on', port);
});
