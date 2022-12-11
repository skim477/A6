
const bcrypt = require("bcryptjs");
var mongoose = require("mongoose");
//const { mapFinderOptions } = require("sequelize/types/utils");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": {type: String, unique: true},
    "password": String,
    "email": String,
    "loginHistory": [{"dateTime": Date, "userAgent": String}]
});

var uri = "mongodb+srv://0202ksj0202:hisimon023@cluster0.azqb5hp.mongodb.net/?retryWrites=true&w=majority";

let User; //to be defined on new connection

function initialize(){
    return new Promise(function(resolve, reject){
        let db = mongoose.createConnection(uri, {useNewUrlParser: true, useUnifiedTopology: true}, function(error){
            if (error){
                reject(error);
            }
            else{
                User = db.model("users", userSchema);
                console.log("Successful");
                resolve();
            }
        });
    });
};

function registerUser(userData){
    return new Promise(function(resolve, reject){
        if(userData.password.trim().length === 0 || userData.password2.trim().length === 0){
          reject("Error: user name cannot be empty or only white spaces!");
        }
        else if (userData.password != userData.password2){
            reject("Error: Passwords do not match");
        }
        else{
            bcrypt.hash(userData.password, 10).then(hash=>{
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save(err => {
                    if(err){
                        if(err.code == 11000){
                            reject("User Name already taken");
                        }
                        else{
                            reject("There was an error creating the user:" + err);
                        }
                    }
                    resolve();
                })
            }).catch(err =>{
                reject("There was an error encrypting the password");
            });

        }
    });
};
/*
function checkUser(userData){
    return new Promise(function(resolve, reject){
        User.findOne({userName: userData.userName})
        .exec()
        .then((user) =>{
            if(user.length == 0){
                reject("Unable to find user:" + userData.userName);
            }
            else if(user.password != userData.pssword){
                reject("Incorrect Password for user:" + userData.userName);
            }
            else{
                user.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                user.update(
                    {userName: user.userName},
                    {$set: {loginHistory: user.loginHistory}}
                ).exec().then(()=>{
                    resolve(user);
                }).catch((err)=>{
                    reject("There was an error verifying the user:" + err);
                })
            }
        }).catch((err)=>{
            reject("Unable to find user:" + userData.userName);
        })
    });
};
*/

function checkUser(userData){
    return new Promise(function(resolve, reject){
        User.findOne({userName: userData.userName})
        .exec()
        .then((founduser) =>{
            if(founduser.length == 0){
                reject("Unable to find user:" + userData.userName);
            }
            else{
                bcrypt.compare(userData.password, founduser.password).then((res)=>{
                    if(res === true){
                        founduser.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        User.updateOne(
                            {userName: founduser.userName},
                            {$set: {loginHistory: founduser.loginHistory}}
                        ).exec().then(()=>{
                            resolve(founduser);
                        }).catch((err)=>{
                            reject("There was an error verifying the user:" + err);
                        })
                    }
                    if(res === false){
                        reject("Incorrect Password for user:" + userData.userName);
                    }
                });
            }
        }).catch((err)=>{
            reject("Unable to find user:" + userData.userName);
        });
    });
};

module.exports = {
    initialize,
    registerUser,
    checkUser
};