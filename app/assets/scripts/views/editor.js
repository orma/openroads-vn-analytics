'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { push, replace } from 'react-router-redux';
import config from '../config';

var Editor = React.createClass({
  displayName: 'Editor',

  propTypes: {
    params: React.PropTypes.object,
    dispatch: React.PropTypes.func
  },

  // /////////////////////////////////////////////////////////////////////////////
  // / Message listener (postMessage)
  // /
  // / When receiving a message form the iframe, process the url and set it.
  // / The url now becomes shareable. The action to take on the url will depend on
  // / the app.
  // /
  // / The switch is done based on the app id, defined when the OR_frame_notifier
  // / is included.
  // /
  // /
  // / What this actually does:
  // / When a the iframe's url changes it is sent via postMessage to the parent. It
  // / removes the base portion on the url (defined in the config) and stores
  // / the rest:
  // / - Url on the "editor" changes to:
  // /     http://devseed.com/editor/#background=something
  // / - Prefix is removed resulting in:
  // /     #background=something
  // / - Appended to the current url:
  // /     http://devseed.com/openroads/#/editor/background=something
  // / - When entering the page, everything after (/#/editor/)
  // /   is sent to the iframe alongside the proper prefix.
  // /
  messageListener: function (e) {
    if (e.data.type === 'urlchange') {
      switch (e.data.id) {
        case 'or-editor':
          var hash = this.cleanUrl(e.data.url, config.editorUrl);
          break;
      }
    } else if (e.data.type === 'navigate') {
      switch (e.data.id) {
        case 'or-editor':
          break;
      }
    }
  },

  cleanUrl: function (url, base) {
    return url.replace(new RegExp(`(http:|https:)?${base}/?#?`), '');
  },

  componentDidMount: function () {
    window.addEventListener('message', this.messageListener, false);
  },

  componentWillUnmount: function () {
    window.removeEventListener('message', this.messageListener, false);
  },

  render: function () {
    var path = config.editorUrl + (this.props.params.splat ? `#${this.props.params.splat}` : '');
    return (
       <iframe src={path} id='main-frame' name='main-frame'></iframe>
    );
  }
});

module.exports = connect()(Editor);
