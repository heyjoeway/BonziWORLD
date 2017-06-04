function Espeak(worker_path, ready_cb) {
  this.worker = new Worker(worker_path);
  this.ready = false;
  this.worker.onmessage = function(e) {
    if (e.data !== 'ready') return;
    this.worker.onmessage = null;
    this.worker.addEventListener('message', this);
    this.ready = true;
    if (ready_cb) {
      ready_cb();
    }
  }.bind(this);
}

Espeak.prototype.handleEvent = function (evt) {
  var callback = evt.data.callback;
  if (callback && this[callback]) {
    this[callback].apply(this, evt.data.result);
    if (evt.data.done)
      delete this[callback];
    return;
  }
};

function _createAsyncMethod(method) {
  return function() {
    var lastArg = arguments[arguments.length - 1];
    var message = { method: method, args: Array.prototype.slice.call(arguments, 0) };
    if (typeof lastArg == 'function') {
      var callback = '_' + method + '_' + Math.random().toString().substring(2) +'_cb';
      this[callback] = lastArg;
      message.args.pop();
      message.callback = callback;
    }
    this.worker.postMessage(message);
  };
}

for (var i = 0; i < 8; i++) {
  var method = [
    'listVoices',
    'get_rate',
    'get_pitch',
    'set_rate',
    'set_pitch',
    'setVoice',
    'synth'
  ][i];
  Espeak.prototype[method] = _createAsyncMethod(method);
}

/* An audio node that can have audio chunks pushed to it */

function PushAudioNode(context, start_callback, end_callback, stop_callback) {
  this.start_callback = start_callback;
  this.end_callback = end_callback;
  this.stop_callback = stop_callback;
  this.run_stop_callback = true;
  this.samples_queue = [];
  this.context = context;
  this.scriptNode = context.createScriptProcessor(
    isDesktop || false ? 0 : 8192, 1, 1
  );
  this.connected = false;
  this.sinks = [];
  this.startTime = 0;
  this.closed = false;
  this.initialized = false;
}

PushAudioNode.prototype.push = function(chunk) {
  if (this.closed)
    throw "can't push more chunks after node was closed";
  this.samples_queue.push(chunk);
  if (!this.connected) {
    if (!this.sinks.length)
      throw "No destination set for PushAudioNode";
    this._do_connect();
  }
};

PushAudioNode.prototype.close = function() {
  this.closed = true;
};

PushAudioNode.prototype.connect = function(dest) {
  this.sinks.push(dest);
  if (this.samples_queue.length) {
    this._do_connect();
  }
};

PushAudioNode.prototype._do_connect = function() {
  if (this.connected) return;
  this.connected = true;
  for (var dest in this.sinks) { // ???????
    this.scriptNode.connect(this.sinks[dest]);
  }
  this.scriptNode.onaudioprocess = this.handleEvent.bind(this);
};

PushAudioNode.prototype.disconnect = function() {
  this.scriptNode.onaudioprocess = null;
  this.scriptNode.disconnect();
  if (this.run_stop_callback)
    this.stop_callback();
  this.connected = false;
};

PushAudioNode.prototype.handleEvent = function(evt) {
  var bufferSize = evt.target.bufferSize;

  if (!this.startTime) {
    this.startTime = evt.playbackTime;
    if (this.start_callback) {
      this.start_callback();
    }
    this.close_finished = false;
    this.initialized = true;
  }

  var offset = 0;

  while (this.samples_queue.length && offset < bufferSize) {
    var chunk = this.samples_queue[0];
    var to_copy = chunk.subarray(0, bufferSize - offset);
    if (evt.outputBuffer.copyToChannel) {
      evt.outputBuffer.copyToChannel(to_copy, 0, offset);
    } else {
      evt.outputBuffer.getChannelData(0).set(to_copy, offset);
    }
    offset += to_copy.length;
    chunk = chunk.subarray(to_copy.length);
    if (chunk.length)
      this.samples_queue[0] = chunk;
    else
      this.samples_queue.shift();
  }


  if (!this.samples_queue.length && this.closed) {
    var end_delay = Math.max(0, (((bufferSize - 2048) / 2048) * 0.120) * 1000);
    setTimeout((function() {
      if (!this.close_finished) {
        if (this.end_callback) {
          this.end_callback(evt.playbackTime - this.startTime);
        }
        this.run_stop_callback = false;
      }
      this.disconnect();
      this.close_finished = true;
     }).bind(this), 
     end_delay
    );
  }
};
