const EventEmitter = require('events');

const bus = new EventEmitter();
bus.setMaxListeners(20);

module.exports = {
  on: (event, handler) => bus.on(event, handler),
  off: (event, handler) => bus.off(event, handler),
  emit: (event, payload) => bus.emit(event, payload),
};
