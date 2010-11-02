var spawn = require('child_process').spawn;
var inherits = require('util').inherits;
var StreamStack = require('stream-stack').StreamStack;

/**
 * Accepts a writable stream, i.e. fs.WriteStream, and returns a StreamStack
 * whose 'write()' calls are transparently sent to a 'gzip' process before
 * being written to the target stream.
 */
function GzipEncoderStack(stream) {
  if (!(this instanceof GzipEncoderStack)) {
    return new GzipEncoderStack(stream);
  }
  StreamStack.call(this, stream);

  this.encoder = spawn('gzip');
  this.encoder.stdout.pipe(this.stream);
}
inherits(GzipEncoderStack, StreamStack);
exports.GzipEncoderStack = GzipEncoderStack;

GzipEncoderStack.prototype.write = function(buf, enc) {
  return this.encoder.stdin.write(buf, enc);
}

GzipEncoderStack.prototype.end = function(buf, enc) {
  return this.encoder.stdin.end(buf, enc);
}

Object.defineProperty(GzipEncoderStack.prototype, "readable", {
  get: function() {
    return this.encoder.stdin.readable;
  },
  enumerable: true
});

Object.defineProperty(GzipEncoderStack.prototype, "writable", {
  get: function() {
    return this.encoder.stdin.writable;
  },
  enumerable: true
});


/**
 * Accepts a readable stream, i.e. fs.ReadStream, and returns a StreamStack
 * whose 'data' events have been decoded through 'gunzip' before being
 * emitted back to the user.
 */
function GzipDecoderStack(stream) {
  if (!(this instanceof GzipDecoderStack)) {
    return new GzipDecoderStack(stream);
  }
  StreamStack.call(this, stream);

  this.decoder = spawn('gunzip');
  this.decoder.stdout.on('data', this._onGunzipData.bind(this));
  this.decoder.stdout.on('end', this._onGunzipEnd.bind(this));
  this.stream.pipe(this.decoder.stdin);
}
inherits(GzipDecoderStack, StreamStack);
exports.GzipDecoderStack = GzipDecoderStack;

GzipDecoderStack.prototype.setEncoding = function(encoding) {
  this.decoder.stdout.setEncoding(encoding);
}

GzipDecoderStack.prototype._onGunzipData = function(chunk) {
  this.emit('data', chunk);
}

GzipDecoderStack.prototype._onGunzipEnd = function() {
  this.emit('end');
}

Object.defineProperty(GzipDecoderStack.prototype, "readable", {
  get: function() {
    return this.encoder.stdout.readable;
  },
  enumerable: true
});

Object.defineProperty(GzipDecoderStack.prototype, "writable", {
  get: function() {
    return this.encoder.stdout.writable;
  },
  enumerable: true
});
