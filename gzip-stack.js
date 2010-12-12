var spawn = require('child_process').spawn;
var inherits = require('util').inherits;
var StreamStack = require('stream-stack').StreamStack;

/**
 * Accepts a writable stream, i.e. fs.WriteStream, and returns a StreamStack
 * whose 'write()' calls are transparently sent to a 'gzip' process before
 * being written to the target stream.
 */
function GzipEncoderStack(stream, compression) {
  if (!(this instanceof GzipEncoderStack)) {
    return new GzipEncoderStack(stream, compression);
  }
  StreamStack.call(this, stream);

  if (compression) {
    process.assert(compression >= 1 && compression <= 9);
    this.compression = compression;
  }

  this.encoder = spawn('gzip', ['-'+this.compression]);
  this.encoder.stdout.pipe(this.stream);
}
inherits(GzipEncoderStack, StreamStack);
exports.GzipEncoderStack = GzipEncoderStack;

GzipEncoderStack.prototype.compression = 6;

GzipEncoderStack.prototype.write = function(buf, enc) {
  return this.encoder.stdin.write(buf, enc);
}

GzipEncoderStack.prototype.end = function(buf, enc) {
  return this.encoder.stdin.end(buf, enc);
}


/**
 * Accepts a readable stream, i.e. fs.ReadStream, and returns a StreamStack
 * whose 'data' events have been decoded through 'gunzip' before being
 * emitted back to the user.
 */
function GzipDecoderStack(stream) {
  if (!(this instanceof GzipDecoderStack)) {
    return new GzipDecoderStack(stream);
  }
  StreamStack.call(this, stream, {
    data: this._onStreamData,
    end: this._onStreamEnd
  });

  this.decoder = spawn('gunzip');
  this.decoder.stdout.on('data', this._onGunzipData.bind(this));
  this.decoder.stdout.on('end', this._onGunzipEnd.bind(this));
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

GzipDecoderStack.prototype._onStreamData = function(chunk) {
  this.decoder.stdin.write(chunk);
}

GzipDecoderStack.prototype._onStreamEnd = function() {
  this.decoder.stdin.end();
}
