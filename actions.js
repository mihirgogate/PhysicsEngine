var ACTIONS = {
  UP: 'ACTION_UP',
  DOWN: 'ACTION_DOWN',
  LEFT: 'ACTION_LEFT',
  RIGHT: 'ACTION_RIGHT',
  SHOOT: 'ACTION_SHOOT',
  JUMP: 'ACTION_JUMP'
};

function KeyboardActionListener(keyDownHandler, keyUpHandler) {
  this._state = {};
  this._state[ACTIONS.UP] = false;
  this._state[ACTIONS.DOWN] = false;
  this._state[ACTIONS.LEFT] = false;
  this._state[ACTIONS.RIGHT] = false;
  this._state[ACTIONS.SHOOT] = false;
  this._state[ACTIONS.JUMP] = false;
  var keyToState = {
    'ArrowUp': ACTIONS.UP,
    'ArrowDown': ACTIONS.DOWN,
    'ArrowLeft': ACTIONS.LEFT,
    'ArrowRight': ACTIONS.RIGHT,
    'a': ACTIONS.SHOOT,
    's': ACTIONS.JUMP
  };
  var state = this._state;
  keyDownHandler(function(e){
    if (e.key in keyToState) {
      state[keyToState[e.key]] = true;
    }
  });
  keyUpHandler(function(e){
    if (e.key in keyToState) {
      state[keyToState[e.key]] = false;
    }
  });
}

KeyboardActionListener.prototype.isActive = function(action) {
  if (action in this._state) {
    return this._state[action];
  }
  throw Error('Must pass a valid action to KeyboardActionListener.isActive');

}

module.exports = {
  ACTIONS: ACTIONS,
  KeyboardActionListener: KeyboardActionListener
}
