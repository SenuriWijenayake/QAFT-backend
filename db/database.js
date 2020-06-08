//Import the mongoose module
var mongoose = require('mongoose');
// var mongoDB = 'mongodb://admin:admin1234@ds145356.mlab.com:45356/socialpresence';
var mongoDB = 'mongodb://localhost:27017/study5';

mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

//Importing schemas
var Result = require('./schemas/result');
var User = require('./schemas/user');
var Answer = require('./schemas/answer');
var BigFiveRaw = require('./schemas/bigFiveRaw');
var Chat = require('./schemas/chat');
var bigFiveQuestions = require('./bigFiveQuestions');

//Function to save the saw big five results to the database
exports.saveBigFiveRaw = function(userId, results) {
  var result = new BigFiveRaw({
    userId: userId,
    allAnswers: results
  });

  result.save(function(err) {
    if (err) throw err;
    console.log('Big five raw answers saved successfully!');
  });
};

//Function to save the big five results to the database
exports.saveBigFiveResults = function(userId, results) {
  var result = new Result({
    userId: userId,
    Extraversion: results.Extraversion,
    Agreeableness: results.Agreeableness,
    Conscientiousness: results.Conscientiousness,
    Neuroticism: results.Neuroticism,
    Openness: results.Openness
  });

  result.save(function(err) {
    if (err) throw err;
    console.log('Results saved successfully!');
  });
};

//Function to get user by email
exports.getUserByEmail = function (email){
  var query = {
    email: email
  };
  return new Promise(function(resolve, reject) {
    User.findOne(query, function(err, user) {
      resolve(user);
    });
  });
};

//Function to save user details
exports.saveUser = function(user) {
  return new Promise(function(resolve, reject) {
    var newUser = new User({
      name: user.name,
      email: user.email,
      password: user.password,
      gender: user.gender,
      genderSpecified: user.genderSpecified,
      age: user.age,
      education: user.education,
      field: user.field,
      structure: user.structure,
      socialPresence: user.socialPresence,
      profilePicture: user.profilePicture
    });

    newUser.save(function(err, newUser) {
      if (err) reject(err);
      resolve(newUser);
    });
  });
};

//Function to login user
exports.loginUser = function(user) {
  var password = user.password;
  var query = {
    email: user.email
  };
  return new Promise(function(resolve, reject) {
    User.findOne(query, function(err, result) {
      if (result == null){
        resolve (-1);
      } else if (result.password == password){
        resolve(result);
      }
      else{
        resolve (-2);
      }
    });
  });
};

//Function to save an answer
exports.saveAnswer = function(answer) {
  return new Promise(function(resolve, reject) {
    var newAnswer = new Answer({
      userId: answer.userId,
      questionId: answer.questionId,
      oldAnswerId: answer.oldAnswerId,
      oldConfidence: answer.oldConfidence,
      newAnswerId: answer.newAnswerId ? answer.newAnswerId : answer.oldAnswerId,
      newConfidence: answer.newConfidence ? answer.newConfidence : answer.oldConfidence
    });

    newAnswer.save(function(err, newAnswer) {
      if (err) reject(err);
      resolve(newAnswer._id.toString());
    });
  });
};

//Function to update an answer
exports.updateAnswer = function(answer) {

  var query = {
    userId: answer.userId,
    questionId: answer.questionId
  };
  var newData = {
    newAnswerId: answer.newAnswerId,
    newConfidence: answer.newConfidence,
    newExplanation: answer.newExplanation,
    editTime: Date.now()
  };

  return new Promise(function(resolve, reject) {
    Answer.findOneAndUpdate(query, newData, {
      upsert: true
    }, function(err, newAnswer) {
      if (err) reject(err);
      resolve(newAnswer._id.toString());
    });
  });
};


//Function to get the big five questions
exports.getBigFiveQuestions = function() {
  return (bigFiveQuestions);
};

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
