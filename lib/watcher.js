// Generated by CoffeeScript 1.3.3
(function() {
  var EventEmitter, Watcher, async, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  fs = require('fs');

  path = require('path');

  async = require('async');

  module.exports = Watcher = (function(_super) {

    __extends(Watcher, _super);

    function Watcher(dir) {
      this.dir = dir != null ? dir : process.cwd();
      this.dirs = {};
    }

    Watcher.prototype._checkMtime = function(filename, newstats) {
      var oldstats, _ref, _ref1;
      oldstats = this.dirs[filename];
      if ((oldstats != null ? (_ref = oldstats.mtime) != null ? _ref.getTime() : void 0 : void 0) === (newstats != null ? (_ref1 = newstats.mtime) != null ? _ref1.getTime() : void 0 : void 0)) {
        return true;
      } else {
        return false;
      }
    };

    Watcher.prototype._getType = function(stats) {
      if (stats != null ? stats.isDirectory() : void 0) {
        return 'dir';
      } else if (stats != null ? stats.isFile() : void 0) {
        return 'file';
      } else {
        return false;
      }
    };

    Watcher.prototype._getAction = function(event, filename, stats) {
      switch (event) {
        case 'rename':
          if ((this.dirs[filename] != null) && !(stats != null)) {
            return 'removed';
          } else {
            return 'created';
          }
        case 'change':
          if (this._checkMtime(filename, stats)) {
            return 'unchanged';
          } else {
            return 'changed';
          }
      }
    };

    Watcher.prototype._readdir = function(cb) {
      var _this = this;
      return fs.readdir(this.dir, function(err, directories) {
        _this.dirs = {};
        return async.forEach(directories, function(v, callback) {
          return fs.stat(path.join(_this.dir, v), function(err, stats) {
            if (!err) {
              _this.dirs[v] = stats;
            }
            return callback();
          });
        }, function() {
          return typeof cb === "function" ? cb(_this.dirs) : void 0;
        });
      });
    };

    Watcher.prototype.watch = function(cb) {
      var _this = this;
      return this._readdir(function() {
        _this.watcher = fs.watch(_this.dir, function(event, filename) {
          return fs.stat(path.join(_this.dir, filename), function(err, stats) {
            var action, type;
            action = _this._getAction(event, filename, stats);
            type = _this._getType(stats != null ? stats : _this.dirs[filename]);
            if (action === 'removed' && (_this.dirs[filename] != null)) {
              delete _this.dirs[filename];
            } else if (stats != null) {
              _this.dirs[filename] = stats;
            }
            if (!(type === false || action === 'unchanged')) {
              return _this.emit("" + type + " " + action, path.join(_this.dir, filename), stats);
            }
          });
        });
        if (typeof cb === "function") {
          cb(_this.dirs);
        }
        return _this.emit("watchstart", _this.dir);
      });
    };

    Watcher.prototype.close = function() {
      var _ref;
      if ((_ref = this.watcher) != null) {
        _ref.close();
      }
      return this.dirs = [];
    };

    return Watcher;

  })(EventEmitter);

}).call(this);