let chats = undefined;

let { state } = require("./variables");

module.exports.init = (_chats) => {
    chats = _chats;
}

/**
 * Get the current state for the given user ID
 * @param {int} id 
 */
module.exports.getCurrentState = (id) => {
    return chats[id].current_state;
}

/**
 * Set the current state for the gven user ID
 * @param {int} id 
 * @param {int} state 
 */
module.exports.setCurrentState = (id, state) => {
    chats[id].current_state = state;
}

/**
 * Return the chat data of the given user ID
 * @param {id} id 
 */
module.exports.getChat = (id) => {
    return chats[id];
}

/**
 * Set a key => value element for a given user ID
 * @param {int} id 
 * @param {string} key 
 * @param {any} value 
 */
module.exports.setChat = (id, key, value) => {
    chats[id][key] = value;
}

/**
 * Increment an key element of a given user ID by X, default 1
 * @param {int} id 
 * @param {string} key 
 * @param {int} step 
 */
module.exports.incr = (id, key, step = 1) => {
    chats[id][key] += step;
}

/**
 * Add element to array for the given user ID
 * @param {int} id 
 * @param {string} key 
 * @param {string} value 
 */
module.exports.pushItem = (id, key, value) => {
    chats[id][key].push(value);
}

/**
 * get parameter for a given user ID
 * @param {int} id 
 * @param {string} key 
 */
module.exports.getAttr = (id, key) => {
    return chats[id][key];
}

module.exports.reset = (id) => {
    chats[id] = {
        current_state: state.none
    }
}