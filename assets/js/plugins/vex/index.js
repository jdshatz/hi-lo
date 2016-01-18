/**
 * Alert/confirm/dialog library wrapper
 * 
 * @link https://github.com/HubSpot/vex
 */
import * as vex from 'vex-js';
vex.dialog = require('vex-js/js/vex.dialog.js');
//required for styling: needs to match included theme.
vex.defaultOptions.className = 'vex-theme-os';

module.exports = vex;