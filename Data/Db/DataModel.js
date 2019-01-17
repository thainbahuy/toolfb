var db = require('./../Db/Dbconnection.js');
var DataDB = {
    
    getTotal : function (callback) {  
        return db.query("select count(*) as total  from TOKEN",callback);
    },

    addToken : function(token,callback){
        return db.query("insert into TOKEN (Access_Token) values(?)",[token],callback)
    },
    getAllToken : function(callback){
        return db.query("select *from TOKEN",callback);
    },

    saveObjectidLiked : function(object_id,access_token,callback){
        return db.query("insert into POST (Object_id,Access_Token) values(?,?)",[object_id,access_token],callback);
    },

    checkObjectidIsLiked :function(object_id,access_token,callback){
        return db.query("select 1 from POST where Object_id = ? and Access_Token = ?",[object_id,access_token],callback);
    },

    deleteObjectId : function (callback){
        return db.query("truncate table POST",callback);
    }
};
module.exports=DataDB;