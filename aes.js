var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var key = '0123456789';

var encrypt = function(plainText){
    var cipher = crypto.createCipher(algorithm, key);
    var res = cipher.update(plainText,'utf8','hex');
    res += cipher.final('hex');
    return res;
};

var decrypt = function (cipherText){
    var decipher = crypto.createDecipher(algorithm, key);
    var res = decipher.update(cipherText,'hex','utf8');
    res += decipher.final('utf8');
    return res;
};

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
