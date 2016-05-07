var natural = require('natural');
var fs      = require('fs');
var xlsx    = require('node-xlsx');
var svm     = require("svm");

/**
 * Naive Bayesian Classifier Class used by the Node API
 */
SentimentClassifier = function() {
    return {
        /**
         * The Naive Bayesian Classifier
         */
        classifier: new natural.BayesClassifier(),
        
        /**
         * The Support Vector Machine Classifier
         */
        //classifier: new svm.SVM(),

        /**
         * List of Stop Words
         */
        stopWords: ["a", "about", "above", "according", "across", "after", "afterwards", "again", "against", "albeit", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anywhere", "apart", "are", "around", "as", "at", "av", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "both", "but", "by", "can", "cannot", "canst", "certain", "cf", "choose", "contrariwise", "cos", "could", "cu", "day", "do", "does", "doesn't", "doing", "dost", "doth", "double", "down", "dual", "during", "each", "either", "else", "elsewhere", "enough", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "except", "excepted", "excepting", "exception", "exclude", "excluding", "exclusive", "far", "farther", "farthest", "few", "ff", "first", "for", "formerly", "forth", "forward", "from", "front", "further", "furthermore", "furthest", "get", "go", "had", "halves", "hardly", "has", "hast", "hath", "have", "he", "hence", "henceforth", "her", "here", "hereabouts", "hereafter", "hereby", "herein", "hereto", "hereupon", "hers", "herself", "him", "himself", "hindmost", "his", "hither", "hitherto", "how", "however", "howsoever", "i", "ie", "if", "in", "inasmuch", "inc", "include", "included", "including", "indeed", "indoors", "inside", "insomuch", "instead", "into", "inward", "inwards", "is", "it", "its", "itself", "just", "kind", "kg", "km", "last", "latter", "latterly", "less", "lest", "let", "like", "little", "ltd", "many", "may", "maybe", "me", "meantime", "meanwhile", "might", "moreover", "most", "mostly", "more", "mr", "mrs", "ms", "much", "must", "my", "myself", "namely", "need", "neither", "never", "nevertheless", "next", "no", "nobody", "none", "nonetheless", "noone", "nope", "nor", "not", "nothing", "notwithstanding", "now", "nowadays", "nowhere", "of", "off", "often", "ok", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "own", "per", "perhaps", "plenty", "provide", "quite", "rather", "really", "round", "said", "sake", "same", "sang", "save", "saw", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "seldom", "selves", "sent", "several", "shalt", "she", "should", "shown", "sideways", "since", "slept", "slew", "slung", "slunk", "smote", "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "spake", "spat", "spoke", "spoken", "sprang", "sprung", "stave", "staves", "still", "such", "supposing", "than", "that", "the", "thee", "their", "them", "themselves", "then", "thence", "thenceforth", "there", "thereabout", "thereabouts", "thereafter", "thereby", "therefore", "therein", "thereof", "thereon", "thereto", "thereupon", "these", "they", "this", "those", "thou", "though", "thrice", "through", "throughout", "thru", "thus", "thy", "thyself", "till", "to", "together", "too", "toward", "towards", "ugh", "unable", "under", "underneath", "unless", "unlike", "until", "up", "upon", "upward", "upwards", "us", "use", "used", "using", "very", "via", "vs", "want", "was", "we", "week", "well", "were", "what", "whatever", "whatsoever", "when", "whence", "whenever", "whensoever", "where", "whereabouts", "whereafter", "whereas", "whereat", "whereby", "wherefore", "wherefrom", "wherein", "whereinto", "whereof", "whereon", "wheresoever", "whereto", "whereunto", "whereupon", "wherever", "wherewith", "whether", "whew", "which", "whichever", "whichsoever", "while", "whilst", "whither", "who", "whoa", "whoever", "whole", "whom", "whomever", "whomsoever", "whose", "whosoever", "why", "will", "wilt", "with", "within", "without", "worse", "worst", "would", "wow", "ye", "yet", "year", "yippee", "you", "your", "yours", "yourself", "yourselves"],
        
        /**
         * List of Neagation Words
         */
        negations: ["no", "not", "none", "no one", "nobody", "nothing", "neither", "nowhere", "never", "doesnt", "isnt", "wasnt", "shouldnt", "wouldnt", "couldnt", "wont", "cant", "dont"],
        
        /**
         * Function used to clean up, remove stop words, and tokenize text
         */
        cleanAndTokenize: function(text) {

            // lowercase all chars
            var lcText = text.toLowerCase();
            
            // remove the username from the tweet
            lcText = lcText.substr(lcText.indexOf(" ") + 1);

            // remove the punctuation, and tokenize
            //var tokenizer = new natural.WordTokenizer();
            //var tokens = tokenizer.tokenize(lcText);
            
            // tokenize and stem
            natural.PorterStemmer.attach();
            var tokens = lcText.tokenizeAndStem();

            /* remove stopwords
            for (var i = 0; i < tokens.length; i++) {
                if (this.stopWords.indexOf(tokens[i]) > -1) {
                    tokens.splice(i, 1);

                    // adjust the iterator i for every element deletion
                    i -= 1;
                }
            }*/
            
            // prepend a '!' for words before (N-1) and after (N+1) after negation (N)
            for (var j = 0; j < tokens.length; j++) {
                if (this.negations.indexOf(tokens[j]) > -1) {
                    // if the words is a negation word
                    if (j >= 2 && j < tokens.length-2) {
                        tokens[j-1] = '!' + tokens[j-1];
                        tokens[j+1] = '!' + tokens[j+1];
                    }
                    else {
                        if (j == 0) {
                            tokens[j+1] = '!' + tokens[j+1];
                            tokens[j+2] = '!' + tokens[j+2];
                        }
                        if (j == tokens.length-1) {
                            tokens[j-2] = '!' + tokens[j-2];
                            tokens[j-1] = '!' + tokens[j-1];
                        }
                    }
                }
            }//
            
            // bigram
            //var NGrams = natural.NGrams;
            //tokens = NGrams.bigrams(tokens);

            return tokens;
        },

        /**
         * If the classifier has not been serialized into a file (classifier.json), train it first
         */
        initializeClassifier: function() {
            fs.stat('classifier.json', function(err, stat) {
                // the serialized file doesn't exist
                if(err.code == 'ENOENT') {
                    // train classifier
                    this.trainClassifier();
                }
            });
        },

/**
 **********************************************************************************************************************
 ***********************************************TRAINING THE CLASSIFIERS**********************************************
 **********************************************************************************************************************
 */

        /**
         * Function used to train the Naive Bayesian Classifier
         */
        trainClassifier: function() {
            console.log("Training Naive Bayesian Classifier!");
            var trainingDataDir = 'data/train/';
            var posTrainDir = trainingDataDir + 'pos/';
            var negTrainDir = trainingDataDir + 'neg/';

            // iterate through every pos and neg training file and train the classifier
            var posTrainFiles = fs.readdirSync(posTrainDir);
            var negTrainFiles = fs.readdirSync(negTrainDir);
            
            var trainFilesCt = posTrainFiles.length + negTrainFiles.length;
            
            console.log("Training on " + trainFilesCt + " files.");

            // train the classifier (0 => Negative, 1 => Positive)
            for(var i = 0; i < posTrainFiles.length/5; i++) {
                var content = fs.readFileSync(posTrainDir + posTrainFiles[i], 'utf8');
                if (content !== undefined) {
                    var text_tokens = this.cleanAndTokenize(content);
                    this.classifier.addDocument(text_tokens, 1);
                    console.log("Reading File: " + posTrainDir + posTrainFiles[i]);
                }
            }

            for(var i = 0; i < negTrainFiles.length/5; i++) {
                var content = fs.readFileSync(negTrainDir + negTrainFiles[i], 'utf8');
                if (content !== undefined) { 
                    var text_tokens = this.cleanAndTokenize(content);
                    this.classifier.addDocument(text_tokens, 0);
                    console.log("Reading File: " + negTrainDir + negTrainFiles[i]); 
                }
            }

            this.classifier.train();
            console.log("Naive Bayesian Classifier has been Trained!");
        },
        
        /**
         * Function used to train the Naive Bayesian Classifier on the XLSX 
         */
        trainClassifierXLSX: function() {
            var trainingDataDir = __dirname + '/data/';

            // parse the excel file
            var obj = xlsx.parse(trainingDataDir + 'train.xlsx');
            var data = obj[1]['data'];
            
            // iterate through the excel data and send to train the classifier
            for (var i = 1; i < data.length/100; i++) {
                var sentiment = parseInt(data[i][1]);
                var tweet = data[i][3];
                
                var text_tokens = this.cleanAndTokenize(tweet);
                
                if(text_tokens.length > 0) {
                    console.log(tweet + " | Tweet: " + text_tokens + " | Sentiment: " + sentiment);
                    this.classifier.addDocument(text_tokens, sentiment);
                }
                //this.classifier.learn(text_tokens, sentiment);
            }
            
            console.log("Training Naive Bayesian Classifier on train.xlsx!");
            this.classifier.train();
            console.log("Naive Bayesian Classifier has been Trained!");
        },
        
        /**
         * Function used to train the Support Vector Machine Classifier on the XLSX 
         */
        trainClassifierSVM: function() {
            var trainingDataDir = __dirname + '/data/';

            // parse the excel file
            var obj = xlsx.parse(trainingDataDir + 'train.xlsx');
            var xlData = obj[1]['data'];
            
            // iterate through the excel data and send to train the classifier
            // separate list for training data and label
            var data = [];
            var labels = [];
            for (var i = 1; i < xlData.length/100; i++) {
                var sentiment = parseInt(xlData[i][1]);
                var tweet = xlData[i][3];
                
                var text_tokens = this.cleanAndTokenize(tweet);
                console.log("Tweet: " + tweet + " | Sentiment: " + sentiment);
                data.push(text_tokens);
                labels.push(sentiment);
            }
            
            this.classifier.train(data, labels);
            console.log("SVM has been Trained!");
        },
        
/**
 **********************************************************************************************************************
 ************************************************TESTING THE CLASSIFIERS***********************************************
 **********************************************************************************************************************
 */
         
        /**
         * Function used to test classifier for accuracy
         */
        testClassifier: function() {
            console.log("Testing Classifier Accuracy!");
            var testingDataDir = 'data/test/';
            var posTestDir = testingDataDir + 'pos/';
            var negTestDir = testingDataDir + 'neg/';

            // iterate through every pos and neg training file and check the accuracy
            var posTestFiles = fs.readdirSync(posTestDir);
            var negTestFiles = fs.readdirSync(negTestDir);

            // run classifier on all the test files
            var correctCount = 0;
            for(var i = 0; i < posTestFiles.length; i++) {
                var content = fs.readFileSync(posTestDir + posTestFiles[i], 'utf8');
                if (content !== undefined) {
                    var text_tokens = this.cleanAndTokenize(content);
                    var calcSent = this.classifier.classify(text_tokens);
                    
                    if (calcSent == 1) {
                        correctCount += 1;
                    }
                    
                    console.log("Test File: " + posTestDir + posTestFiles[i] + " Calculated Sentiment: " + calcSent + "| Actual Sentiment: 1");
                }
            }

            for(var i = 0; i < negTestFiles.length; i++) {
                var content = fs.readFileSync(negTestDir + negTestFiles[i], 'utf8');
                if (content !== undefined) { 
                    var text_tokens = this.cleanAndTokenize(content);
                    var calcSent = this.classifier.classify(text_tokens);
                    
                    if (calcSent == -1) {
                        correctCount += 1;
                    }
                    
                    console.log("Test File: " + negTestDir + negTestFiles[i] + " Calculated Sentiment: " + calcSent + "| Actual Sentiment: -1"); 
                }
            }
            
            var totalTestSetCt = posTestFiles.length + negTestFiles.length;
            console.log("Total Testing Set: " + totalTestSetCt + " | Total Correct: " + correctCount + " | Accuracy: " + (correctCount/totalTestSetCt));
        },
        
        /**
         * Function used to test the Naive Bayesian Classifier on the XLSX 
         */
        testClassifierXLSX: function() {
            var testingDataDir = __dirname + '/data/';

            // parse the excel file
            var obj = xlsx.parse(testingDataDir + 'test.xlsx');
            var data = obj[0]['data'];
            
            // iterate through the excel data and send to test the classifier
            console.log("Testing Naive Bayesian Classifier on test.xlsx!");
            var correctCount = 0;
            for (var i = 1; i < data.length; i++) {
                var sentiment = parseInt(data[i][1]);
                var tweet = data[i][3];
                var text_tokens = this.cleanAndTokenize(tweet);
                
                // use our trained classifier to classify our test data
                var calcSent = this.classifier.classify(text_tokens);
                //var calcSent = this.classifier.categorize(text_tokens);
                    
                if (calcSent == sentiment) {
                    correctCount += 1;
                }

                console.log("Tweet: " + tweet + " | Calculated Sentiment: " + calcSent + " | Actual Sentiment: " + sentiment);
            }
            
            console.log("Test Results: Total Number of Test Tweets: " + data.length + " | Total Correctly Labelled: " + correctCount + " | Accuracy: " + ((correctCount/data.length)*100) + "%");
        },
        
        /**
         * Function used to test the Support Vector Machine Classifier on the XLSX 
         */
        testClassifierSVM: function() {
            var testingDataDir = __dirname + '/data/';

            // parse the excel file
            var obj = xlsx.parse(testingDataDir + 'test.xlsx');
            var data = obj[0]['data'];
            
            // iterate through the excel data and send to test the classifier
            console.log("Testing Support Vector Machine Classifier on test.xlsx!");
            var testData = [];
            var testLabels = []
            
            for (var i = 1; i < data.length; i++) {
                var sentiment = parseInt(data[i][1]);
                var tweet = data[i][3];
                var text_tokens = this.cleanAndTokenize(tweet);
                
                testData.push(text_tokens);
                testLabels.push(sentiment);
            }
            
            // predict the labels using our test data
            var calcTestLabels = this.classifier.predict(testData);
            
            // determine test accuracy
            var correctCount = 0;
            for (var j = 0; j < testData.length; j++) {
                if (testLabels[j] == 0) {
                    testLabels[j] = -1;
                }
                
                if (calcTestLabels[j] == testLabels[j]) {
                    correctCount += 1;
                }
                
                console.log("Tweet: " + testData[j] + " | Calculated Sentiment: " + calcTestLabels[j] + " | Actual Sentiment: " + testLabels[j]);
            }
            
            console.log("Test Results: Total Number of Test Tweets: " + data.length + " | Total Correctly Labelled: " + correctCount + " | Accuracy: " + ((correctCount/data.length)*100) + "%");
        },
     }
};

module.exports = SentimentClassifier;