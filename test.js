var fs   = require('fs');
var assert = require('assert');
var Step = require('step');
var gzip = require('./gzip-stack');

// the contents of this file will be stored into this var.
var contents = "";
// the decompressed contents of the gzipped file will be stored into this var.
var unzipContents = "";

Step(
  function gzipThisFile () {

    // create a regular fs.ReadStream of this test file.
    var rs = fs.createReadStream(__filename);

    // Append into the "official" contents of this file.
    rs.on('data', function(chunk) { contents += chunk.toString() });
    
    // create a regular fs.WriteStream, calling it 'test.js.gz'.
    var ws = fs.createWriteStream(__filename + '.gz');

    // We wan't to gzip the contents of the fs.WriteStream as they get written.
    var gz = new gzip.GzipEncoderStack(ws);

    // And finally, the holy grail of Streams: `.pipe(writable)`.
    rs.pipe(gz);

    // When the gzipped file is closed, move on to the next step.
    gz.on('close', this);

  },
  function unzipGzippedFile (err) {
    if (err) throw err;

    // Create a fs.ReadStream to the gzipped file and start decoding it.
    var rs = fs.createReadStream(__filename + '.gz');
    var guz = new gzip.GzipDecoderStack(rs);

    // Append the unzipped contents into a variable: unzipContents
    guz.on('data', function(chunk) { unzipContents += chunk.toString() });

    // When the unzipping is done, move on to the next step.
    guz.on('end', this);
    
  },
  function verifyContents (err) {
    if (err) throw err;
    
    //console.error("OFFICIAL CONTENTS:\n"+contents+"\n\n");
    //console.error("GZIPPED/UNZIPPED CONTENTS:\n"+unzipContents+"\n\n");
    assert.equal(contents, unzipContents);
    return true;
    
  },
  function cleanUp (err) {
    if (err) throw err;
    
    fs.unlink(__filename + '.gz', this);
    
  },
  function complete (err) {
    if (err) throw err;
    
    // If there were no errors up to here, then we completed sucessfully!
    console.log('All tests completed! No errors occured!');
  }
);
