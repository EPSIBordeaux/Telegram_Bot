let chats = undefined;

module.exports.init = (_chats) => {
    chats = _chats;
}

module.exports.getCurrentState = (id) => {
    return chats[id].current_state;
}

module.exports.setCurrentState = (id, state) => {
    chats[id].current_state = state;
}

module.exports.getChat = (id) => {
    return chats[id];
}

module.exports.setChat = (id, key, value) => {
    chats[id][key] = value;
}

module.exports.incr = (id, key, step = 1) => {
    chats[id][key] += step;
}

module.exports.pushItem = (id, key, value) => {
    chats[id][key].push(value);
}

module.exports.getAttr = (id, key) => {
    return chats[id][key];
}