node-gzip-stack
===============
### A [StreamStack][] implementation for encoding and decoding [Gzip][] content.


This module exposes a gzipping and gunzipping `StreamStack` interface. Two
classes are exposed: `GzipEncoderStack` and `GzipDecoderStack`.

There are currently no configuration options, but configuration for
compression level (on the encoder, at least) could come in a later version.


Encoding Example
----------------

To encode data going into a writable stream, use the `GzipEncoderStack` class:

    var fs = require('fs');
    var GzipEncoderStack = require('gzip-stack').GzipEncoderStack;
    
    var file = new GzipEncoderStack(fs.createWriteStream('hello.gz'));
    file.write("hello world!\n");
    file.end();
    
    // Hint: now try running `cat hello.gz | gunzip` to verify that it works!


Decoding Example
----------------

To decode data coming from a readable stream, use the `GzipDecoderStack` class:

    var fs = require('fs');
    var GzipDecoderStack = require('gzip-stack').GzipDecoderStack;

    // Create a fs.ReadStream of the kernel config gzip file, and
    // then wrap it in a `GzipDecoderStack` instance.
    var config = new GzipDecoderStack(fs.createReadStream('/proc/config.gz'));

    // Use the standard `Stream#pipe()` to print the decoded contents to 'stdout'.
    config.pipe(process.stdout);


Installation
------------

    npm install gzip-stack


TODO
----

 * Detect `node-compress`, and write a version that uses that by default.

[StreamStack]: http://github.com/TooTallNate/node-stream-stack
[Gzip]: http://www.gzip.org/
