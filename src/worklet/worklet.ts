// tslint:disable-next-line:max-line-length
export const worklet = `!function(e){var t={};function r(s){if(t[s])return t[s].exports;var o=t[s]={i:s,l:!1,exports:{}};return e[s].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,s){r.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:s})},r.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=1)}([function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class s extends AudioWorkletProcessor{constructor(e){super(e),this._encoderPort=null,this._isSupportingTransferables=!1,this._state="inactive",this.port.onmessage=(({data:e})=>{"record"===e.method?"inactive"===this._state?(this._encoderPort=e.params.encoderPort,this._isSupportingTransferables=e.params.isSupportingTransferables,this._state="recording",this.port.postMessage({id:e.id,result:null})):this.port.postMessage({error:{code:-32603,message:"The internal state does not allow to process the given message."},id:e.id}):"stop"===e.method?"recording"===this._state&&null!==this._encoderPort?(this._stop(this._encoderPort),this.port.postMessage({id:e.id,result:null})):this.port.postMessage({error:{code:-32603,message:"The internal state does not allow to process the given message."},id:e.id}):"number"==typeof e.id&&this.port.postMessage({error:{code:-32601,message:"The requested method is not supported."},id:e.id})})}process([e]){if("inactive"===this._state)return!0;if("recording"===this._state&&null!==this._encoderPort){if(void 0===e)throw new Error("No channelData was received for the first input.");return 0===e.length&&this._stop(this._encoderPort),this._encoderPort.postMessage(e,this._isSupportingTransferables?e.map(({buffer:e})=>e):[]),!0}return!1}_stop(e){e.postMessage([]),e.close(),this._encoderPort=null,this._state="stopped"}}t.RecorderAudioWorkletProcessor=s,s.parameterDescriptors=[]},function(e,t,r){"use strict";var s=r(0);registerProcessor("recorder-audio-worklet-processor",s.RecorderAudioWorkletProcessor)}]);`;
