/**
 * Entry Point to the Sentiment Analysis Backend API
 */
var express 	         = require('express');
var bodyParser 	         = require('body-parser');
var natural              = require('natural');
var fs                   = require('fs');
var SentimentClassifier  = require('./SentimentClassifier');
var app                  = express();

// create and train classifier when the node server first runs
var classifier = new SentimentClassifier();


//classifier.trainClassifier();
//classifier.testClassifier();

classifier.trainClassifierXLSX();
classifier.testClassifierXLSX();


//classifier.trainClassifierSVM();
//classifier.testClassifierSVM();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://digafbkagadeggeabihmbmklhfhccckm');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function (req, res) {
    res.send("Welcome to Sentiment Analysis API!");
});


/**
 * Function that is triggered when the chrome app sends a tweet to analyze its sentiment
 */
app.post('/getTweetSentiment', function(req, res) {
    // retrieve the POST data
    var username = req.body.username;
    var tweet = req.body.tweet;
    
    if (username && tweet) {
        console.log("Classifying Tweet: " + tweet);
        // classify the tweet using or Sentiment Analysis Class
        var text_tokens = classifier.cleanAndTokenize(tweet);
        var sentiment = classifier.classifier.classify(text_tokens);

        var retData = {
            username: username,
            tweet: tweet,
            sentiment: sentiment
        }
        console.log("Sentiment: " + sentiment);
        res.status(201).json(retData);
    }
    
});

app.listen(8000, function() {
    console.log('Twitter Sentiment Analyzer API listening on port 8000!');
});