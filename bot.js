'use strict';

var Bot = require('slackbots');
var request = require('request');
var util = require('util');


function Bot(settings) {
  Bot.call(this, settings);
  this.settings = this.settings;
  this.user = null;
  this.channel = null;
}

util.inherits(Bot, Bot);

Bot.prototype.run = function () {
  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

Bot.prototype._onStart = function () {
  this.user = this._getUser();
};

Bot.prototype._onMessage = function (message) {
  if (this._isChatMessage(message) && !this._isFromBot(message)) {
    var user, type;
    if (this._isChannelConversation(message)) {
      user = this._getChannelByID(message.channel);
      type = 'channel';
    } else {
      user = this._getUserByID(message.user);
      type = 'user';
    }
    if (user) {
      this._getApiResponse(user, type);
    }
  }
};

Bot.prototype._getChannelByID = function (id) {
  var l = this.channels.length;
  while (l--) {
    if (this.channels[l].id === id) {
      return this.channels[l];
    }
  }
};

Bot.prototype._getUser = function () {
  var l = this.users.length;
  while (l--) {
    if (this.users[l].name === this.name) {
      return this.users[l];
    }
  }
};

Bot.prototype._getUserByID = function (id) {
  var l = this.users.length;
  while (l--) {
    if (this.users[l].id === id) {
      return this.users[l];
    }
  }
};

Bot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && !!message.text;
};

Bot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
};

Bot.prototype._isFromBot = function (message) {
  return message.user === this.user.id;
};

Bot.prototype._isMention = function (message) {
  var t = message.text.toLowerCase();
  return t.match(/nickr/igm) || t.indexOf(this.name) > -1;
};

Bot.prototype._getApiResponse = function (user, type) {
  var self = this;

  return request.get('http://yesno.wtf/api')
    .on('response', function (res) {
      var buf = new Buffer('');
      res.on('data', function (chunk) {
        buf = Buffer.concat([buf, chunk]);
      });
      res.on('end', function () {
        var data = JSON.parse(buf);

        switch (type) {
        case 'channel':
          self.postMessageToUser(user.name, data.answer.toUpperCase(), {
            attachments:[{
              fallback: data.answer,
              image_url: data.image
            }],
            as_user: true
          });
          break;

        case 'user':
          self.postMessageToUser(user.name, data.answer.toUpperCase(), {
            attachments:[{
              fallback: data.answer,
              image_url: data.image
            }],
            as_user: true
          });
          break;

        }

      });
    });
};

module.exports = Bot;
