/**
 * name : key-clock-authentication
 * author : Rakesh Kumar
 */
var keyCloakAuthUtils = require("keycloak-auth-utils");

const jwt = require('jsonwebtoken');
const fs = require('fs');
const accessTokenValidationMode = (process.env.VALIDATE_ACCESS_TOKEN_OFFLINE && process.env.VALIDATE_ACCESS_TOKEN_OFFLINE === "OFF")? "OFF" : "ON";
const keyCloakPublicKeyPath = (process.env.KEYCLOAK_PUBLIC_KEY_PATH ) ? "../"+process.env.KEYCLOAK_PUBLIC_KEY_PATH  + "/"  : "../keycloak-public-keys/" ;
const path = require('path');

function ApiInterceptor(keyclock_config, cache_config) {
  this.config = keyclock_config;
  this.keyCloakConfig = new keyCloakAuthUtils.Config(this.config);
  this.grantManager = new keyCloakAuthUtils.GrantManager(this.keyCloakConfig);

}

/**
 * [validateToken is used for validate user]
 * @param  {[string]}   token    [x-auth-token]
 * @param  {Function} callback []
 * @return {[Function]} callback [its retrun err or object with fields(token, userId)]
 */
ApiInterceptor.prototype.validateToken = function(token, callback) {
      var self = this;

      if (accessTokenValidationMode === "ON") {
        var decoded = jwt.decode(token, { complete: true });
        if(decoded === null || decoded.header === undefined){
          return callback("ERR_TOKEN_INVALID", null);
        }
        const kid = decoded.header.kid
        let cert = "";
        
        let folderPath = keyCloakPublicKeyPath + kid + '.pem';
        folderPath = path.resolve(__dirname, folderPath);
        if (fs.existsSync(folderPath)) {
          cert = fs.readFileSync(folderPath);
          jwt.verify(token, cert, { algorithm: 'RS256' }, function (err, decode) {
            if (err) {
              return callback("ERR_TOKEN_INVALID", null);
            }
            if (decode !== undefined) {
              const expiry = decode.exp;
              const now = new Date();
              if (now.getTime() > expiry * 1000) {
                return callback('Expired', null);
              }

              return callback(null, { token: token, userId: decode.sub.split(":").pop() });

            } else {
              return callback("ERR_TOKEN_INVALID", null);
            }
          });
        } else {
          return callback("ERR_TOKEN_INVALID", null);
        }
      }else{

        self.grantManager.userInfo(token, function(err, userData) {
          if (err) {
            return callback(err, null);
          } else {
            return callback(null, { token: token, userId: userData.sub.split(":").pop() });
          }
        });

      }
      
    
};
module.exports = ApiInterceptor;
