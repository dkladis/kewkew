var path = require('path')
  , fs = require('fs')
  , crypto = require('crypto');

var helpers = require('./helpers.js');

function Job(data, options, directory, id) {
  this.id = id || Job.UID();
  this.attempts = 0;
  this.processing = false;
  this.data = data;
  this.options = {};
  helpers.applyOptions(this.options, options);
  this.file = path.join(directory, this.id);
}

Job.prototype.persist = function(callback) {
  fs.writeFile(this.file, JSON.stringify(this), callback);
};

Job.prototype.destroy = function(callback) {
  fs.unlink(this.file, callback);
  this.file = null;
};

Job.prototype.toJSON = function() {
  return {
      id: this.id
    , attempts: this.attempts
    , options: this.options
    , data: this.data
  };
};

Job.UID = function generateJobUID() {
  return crypto.randomBytes(16).toString('hex');
};

Job.fromDisk = function fromDisk(file, callback) {
  var directory = path.dirname(file);
  fs.readFile(file, function(err, data) {
    if (err) return callback(err);
    var jobData = helpers.JSON(data);
    var job = new Job(jobData.data, jobData.options, directory, jobData.id);
    job.attempts = jobData.attempts;
    callback(null, job);
  });
};

module.exports = Job;