// This is the minified and stringified code of the recorder-audio-worklet-processor package.
export const worklet = `!function(e){var t={};function r(o){if(t[o])return t[o].exports;var s=t[o]={i:o,l:!1,exports:{}};return e[o].call(s.exports,s,s.exports,r),s.l=!0,s.exports}r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)r.d(o,s,function(t){return e[t]}.bind(null,s));return o},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";r.r(t);class o extends AudioWorkletProcessor{constructor(){super(),this._encoderPort=null,this._state="inactive",this.port.onmessage=({data:e})=>{"record"===e.method?"inactive"===this._state?(this._encoderPort=e.params.encoderPort,this._state="recording",this.port.postMessage({id:e.id,result:null})):this.port.postMessage({error:{code:-32603,message:"The internal state does not allow to process the given message."},id:e.id}):"stop"===e.method?"recording"===this._state&&null!==this._encoderPort?(this._stop(this._encoderPort),this.port.postMessage({id:e.id,result:null})):this.port.postMessage({error:{code:-32603,message:"The internal state does not allow to process the given message."},id:e.id}):"number"==typeof e.id&&this.port.postMessage({error:{code:-32601,message:"The requested method is not supported."},id:e.id})}}process([e]){if("inactive"===this._state)return!0;if("recording"===this._state&&null!==this._encoderPort){if(void 0===e)throw new Error("No channelData was received for the first input.");return 0===e.length&&this._stop(this._encoderPort),this._encoderPort.postMessage(e,e.map(({buffer:e})=>e)),!0}return!1}_stop(e){e.postMessage([]),e.close(),this._encoderPort=null,this._state="stopped"}}o.parameterDescriptors=[],registerProcessor("recorder-audio-worklet-processor",o)}]);`; // tslint:disable-line:max-line-length
