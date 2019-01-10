const request = require('request-promise');
const endpoint = 'https://graph.facebook.com/v3.2/';


var facebookAPI = {
    home : function(access_token){
        const options = {
            method: 'GET',
            uri: endpoint + 'me/home',
            qs: Object.assign({}, {
                access_token: access_token,
                limit : 5
            }),
        };
    
        return request(options);
    },

    like : function (id, access_token) {  
        const options = {
            method: 'POST',
            uri: endpoint + '/' + id + '/likes',
            qs: {
                access_token: access_token
            }
        };
    
        return request(options);
    }

}

module.exports = facebookAPI;




