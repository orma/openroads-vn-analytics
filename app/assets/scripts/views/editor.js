import React from 'react';
import {
  compose,
  getContext
} from 'recompose';
import MapSearch from '../components/map-search';
import T from '../components/t';
import config from '../config';

import ORFrameNotifier from '../../../OR_frame_notifier';

var Editor = React.createClass({
  displayName: 'Editor',

  propTypes: {
    language: React.PropTypes.string.isRequired
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
    // TODO: This is not working with the new version od ORFrameNotifier
    if (e.data.type === 'urlchange') {
      switch (e.data.id) {
        case 'or-editor':
          this.hash = e.data.url.replace(new RegExp(`(http:|https:)?${config.editorUrl}/?#?`), '');
          // TODO: reconcile how params are surfaced upto the app. don't dispatch anything upto the app for now.
          // this.props.dispatch(replace(`/${this.props.language}/editor/${this.hash}`));
          break;
      }
    } else if (e.data.type === 'navigate') {
      switch (e.data.id) {
        case 'or-editor':
          // TODO: reconcile how params are surfaced upto the app. don't dispatch anything upto the app for now.
          // this.props.dispatch(push(e.data.url));
          break;
      }
    }
  },

  componentDidMount: function () {
    this.orFrame = new ORFrameNotifier('orma-vn', this.refs.editor.contentWindow);

    this.orFrame.on('loaded', () => {
      const mapPositionHash = /center=([0-9.]+\/[0-9.]+)&?/.exec(this.props.location.search);
      let mapCenter = [108.239, 15.930];
      let zoom = 6;
      if (mapPositionHash && mapPositionHash[1] && mapPositionHash[1].split('/').length === 2) {
        mapCenter = mapPositionHash[1].split('/');
        zoom = 14.5;
      }

      this.orFrame.send('settings', {
        center: mapCenter,
        zoom
      });
    });
  },

  componentWillUnmount: function () {
    this.orFrame.destroy();
  },

  render: function () {
    return (
      <section className='inpage inpage--alt'>
        <header className='inpage__header'>
          <div className='inner'>
            <div className='inpage__headline'>
              <h1 className='inpage__title'><T>Editor</T></h1>
            </div>
            <div className='inpage__actions'>
              <MapSearch />
            </div>
          </div>
        </header>
        <div className='inpage__body'>
          <div className='inner'>
            <figure className='map'>
              <iframe
                className='map__media'
                src={`${config.editorUrl}`}
                id='main-frame'
                name='main-frame'
                ref="editor"
              />
            </figure>
          </div>
        </div>
      </section>
    );
  }
});


module.exports = compose(
  getContext({ language: React.PropTypes.string })
)(Editor);
