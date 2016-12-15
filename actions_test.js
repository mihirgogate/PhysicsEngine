var test = require('tape');
var KeyboardActionListener = require('./actions').KeyboardActionListener;
var ACTIONS = require('./actions').ACTIONS;

test('test isActive returns false initially', function(assert){
  var keyDownHandler = function(keyDownCb) {};
  var keyUpHandler = function(keyUpCb) {};
  listener = new KeyboardActionListener(keyDownHandler, keyUpHandler);
  assert.equals(listener.isActive(ACTIONS.UP), false);
  assert.end();
});

test('test isActive raises exception if invaid action', function(assert){
  var keyDownHandler = function(keyDownCb) {};
  var keyUpHandler = function(keyUpCb) {};
  listener = new KeyboardActionListener(keyDownHandler, keyUpHandler);
  assert.throws(function() {listener.isActive('invalid action')});
  assert.end();
});

test('test isActive returns true if key down and false again once key up', function(assert){
  var keyDownCallback = null;
  var keyUpCallback = null;
  var keyDownHandler = function(keyDownCb) {
    keyDownCallback = keyDownCb;
  };
  var keyUpHandler = function(keyUpCb) {
    keyUpCallback = keyUpCb;
  };
  listener = new KeyboardActionListener(keyDownHandler, keyUpHandler);
  assert.equals(listener.isActive(ACTIONS.UP), false);

  // create the arrow up event
  var e = { key: 'ArrowUp'};

  keyDownCallback(e);
  assert.equals(listener.isActive(ACTIONS.UP), true);

  keyUpCallback(e);
  assert.equals(listener.isActive(ACTIONS.UP), false);

  assert.end();
});
