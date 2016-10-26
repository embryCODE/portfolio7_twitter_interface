'use strict';

/**
 * @file Portfolio Project 7 for Techdegree. Build a Twitter Interface.
 * {@link https://teamtreehouse.com/projects/build-a-twitter-interface}
 * @author Mason Embry <mason@embrycode.com>
 */

/**
 * Twitter interface module for Treehouse Techdegree.
 * @module app
 */



/**
 * MODULES
 */

var Twit = require('twit'),
  config = require('./config'),
  express = require('express'),
  path = require('path'),
  createError = require('http-errors');



/**
 * TWITTER AUTHORIZATION
 */

/**
 * Create twitter object.
 * @param {object} keys OAuth keys from separate file.
 */
var twitter = new Twit(config);

var app = express();



/**
 * SERVER SETUP
 */

app.listen(3000, function() {
  console.log('Server running on port 3000.');
});
app.use(express.static(path.join(__dirname, 'public')));



/**
 * VIEWS SETUP
 */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



/**
 * ROUTING
 */

app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Twitter Client',
    user: user,
    user_timeline: user_timeline,
    friends: friends,
    direct_messages_array: direct_messages_array,
    config: config
  });
});



/**
 * TWITTER APP
 */

var user,
  user_timeline,
  friends,
  direct_messages_sent,
  direct_messages_received,
  direct_messages_array;

twitter.get('users/show', {
    screen_name: config.screen_name
  },
  function(err, data, response) {
    user = data;
  });

twitter.get('statuses/user_timeline', {
    screen_name: config.screen_name,
    count: 5
  },
  function(err, data, response) {
    user_timeline = data;
  }
);

twitter.get('friends/list', {
  screen_name: config.screen_name,
  count: 5
}, function(err, data, response) {
  friends = data;
});

var getDMSent = new Promise(function(resolve, reject) {
  twitter.get('direct_messages/sent', {
    count: 5
  }, function(err, data, response) {
    if (data) {
      resolve(direct_messages_sent = data);
    } else {
      reject(console.log('there was an error')); // INSERT REAL ERROR HANDLING HERE
    }
  });
});

var getDMReceived = new Promise(function(resolve, reject) {
  twitter.get('direct_messages', {
    count: 5
  }, function(err, data, response) {

    if (data) {
      resolve(direct_messages_received = data);
    } else {
      reject(console.log('there was an error')); // INSERT REAL ERROR HANDLING HERE
    }
  });
});

Promise.all([getDMSent, getDMReceived]).then(function() {

  // Concats the two arrays together.
  direct_messages_array = direct_messages_sent.concat(direct_messages_received);

  // Sorts messages by id, which should make them oldest to newest in the array.
  direct_messages_array.sort(function(a, b) {
    return parseFloat(a.id) - parseFloat(b.id);
  });

  // Reverse order so newest messages are first in the array.
  direct_messages_array.reverse();

  // Reduce length to only five messages.
  direct_messages_array.splice(-5, 5);
}).catch(function(error) {
  console.log('there was an error'); // INSERT REAL ERROR HANDLING HERE
});
