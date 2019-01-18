const express = require('express');
const app = express();
const port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip = process.env.OPENSHIFT_NODEJS_IP || '10.129.32.53';
var cron = require('node-cron');
app.listen(port,server_ip,function () {
    console.log('App listening on port: ' + port);
});
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

const facebookAPI = require('../Data/API/facebook_sdk');
const DataLocal = require('../Data/Db/DataModel');



//get token from db and execute like function
function getAllTokenFromDB (){
    DataLocal.getAllToken(function(err,rows){
        if(err){
            throw err;
        }else{
            var listToken = rows;
            listToken.forEach(element => {
                //console.log(element.Access_Token);
                getObjectIdFromAPIAndLike(element.Access_Token.trim());
            });
        }
    });
}

//get object id and like 
function getObjectIdFromAPIAndLike (access_token){
    facebookAPI.home(access_token).then(function (res_home) {
        var statusHome  = JSON.parse(res_home)
        if (statusHome.data && statusHome.data.length > 0){
            for( let i = 0 ;i < statusHome.data.length ; i ++){
                console.log(statusHome.data[i]);
                checkPostIsLiked(statusHome.data[i].id,access_token,function(res){
                    if(res == 0){
                        likeObjectidAndSaveObjectid(statusHome.data[i].id , access_token);
                    }
                });
                
            }
            console.log("---------------");
        }
    });
}

//like object id and save into db
function likeObjectidAndSaveObjectid(object_id , access_token){
    facebookAPI.like(object_id, access_token).then(function (res_like) {  
        res_like = JSON.parse(res_like);
        if (res_like.success === true){
            console.log('like status Id: ' + object_id + ' success !');
            saveObjectid(object_id,access_token);
        }
    });
}

//save object_id into db
function saveObjectid(object_id , access_token) { 
    DataLocal.saveObjectidLiked(object_id,access_token,function (err) {  
        if(err){
            throw err;
        }
    });
}

//check object_id exist in db
function checkPostIsLiked(object_id,access_token,callback){
    DataLocal.checkObjectidIsLiked(object_id,access_token,function (err,rows) {  
        if(err){
            //throw err;
        }
        else{
            if (rows.length > 0) {
                // k ton tai
                callback(1);
            } else {
                //k ton tai
                callback(0);
            }
        }
    });
}

//truncate table post
function deleteAllObjectId(){
    DataLocal.deleteObjectId(function (err) {  
        if(err){
            throw err;
        }
    });
}

cron.schedule('0 */5 * * * *', () => {
    getAllTokenFromDB();
});

cron.schedule('0 0 * * SUN', () => {
    deleteAllObjectId();
});

app.get("/index", function(request, response)  {
    DataLocal.getTotal(function(err,rows){
        if(err){
            throw err;
        }else{
            var obj = { result :rows}
            console.log(obj);
            response.render("index",obj);
        }
    });
    
    
});

app.get('/execute', function(request, response) {
    DataLocal.addToken(request.query.token.trim(),function (err) {  
        if(err){
            throw err;
        } 
    });
    cronTask();
    //back to home
    response.redirect("/index");
});

function cronTask() {
    cron.schedule('0 */5 * * * *', () => {
        getAllTokenFromDB();
    });
    cron.schedule('0 0 * * SUN', () => {
        deleteAllObjectId();
    });
}

