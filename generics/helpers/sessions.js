/**
 * name : sessions.js
 * author : Aman Karki
 * Date : 13-July-2020
 * Description : Session set,get and remove functionality.
 */

 /**
  * Get session data.
  * @method
  * @name get - Get specific session data
  * @param {String} sessionPath - Path of the session.
  * @returns {Object} - return specific session data.
*/

function get(sessionPath){
    return global.SESSIONS[sessionPath]
}

 /**
  * Set new session data
  * @method
  * @name set
  * @param {String} sessionPath - Path of the session.
  * @param {String} data - session data to set.  
  * @returns {Object} - session updated data.
*/

function set(sessionPath,data) {
    return global.SESSIONS[sessionPath] = data;
}

/**
  * delete session data
  * @method
  * @name remove
  * @param {String} sessionPath - Path of the session. 
  * @returns 
*/

function remove(sessionPath) {
    delete global.SESSIONS[sessionPath];
    return;
}

module.exports = {
    get : get,
    set : set,
    remove : remove
}