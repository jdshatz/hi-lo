(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var score = {
	testing: function testing(a) {
		return 'testing ' + a;
	}
};
module.exports = score;

},{}],2:[function(require,module,exports){
'use strict';

var dummyTest = require('./score.js');

suite('testing', function () {
    test('should prove tests work. TODO: real ones.', function () {
        assert.equal(dummyTest.testing('foo'), 'testing foo');
    });
});

},{"./score.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvY2xhc3Nlcy9zY29yZS5qcyIsImFzc2V0cy9qcy9jbGFzc2VzL3Njb3JlLnRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksS0FBSyxHQUFHO0FBQ1gsUUFBTyxFQUFFLGlCQUFTLENBQUMsRUFBRTtBQUNwQixTQUFPLFVBQVUsR0FBRyxDQUFDLENBQUM7RUFDdEI7Q0FDRCxDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Ozs7O0FDTHZCLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFdEMsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFXO0FBQ3hCLFFBQUksQ0FBQywyQ0FBMkMsRUFBRSxZQUFXO0FBQ3pELGNBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztLQUN6RCxDQUFDLENBQUM7Q0FDTixDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHNjb3JlID0ge1xuXHR0ZXN0aW5nOiBmdW5jdGlvbihhKSB7XG5cdFx0cmV0dXJuICd0ZXN0aW5nICcgKyBhO1xuXHR9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBzY29yZTsiLCJ2YXIgZHVtbXlUZXN0ID0gcmVxdWlyZSgnLi9zY29yZS5qcycpO1xuXG5zdWl0ZSgndGVzdGluZycsIGZ1bmN0aW9uKCkge1xuICAgIHRlc3QoJ3Nob3VsZCBwcm92ZSB0ZXN0cyB3b3JrLiBUT0RPOiByZWFsIG9uZXMuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFzc2VydC5lcXVhbChkdW1teVRlc3QudGVzdGluZygnZm9vJyksICd0ZXN0aW5nIGZvbycpO1xuICAgIH0pO1xufSk7Il19
