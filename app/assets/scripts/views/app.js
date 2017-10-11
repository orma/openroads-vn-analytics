'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { fetchSearchResults, cleanSearchResults } from '../actions/action-creators';
import SiteHeader from '../components/site-header';

var App = React.createClass({
  displayName: 'App',

  propTypes: {
    _fetchSearchResults: React.PropTypes.func,
    _cleanSearchResults: React.PropTypes.func,
    search: React.PropTypes.object,
    routes: React.PropTypes.array,
    children: React.PropTypes.object,
    location: React.PropTypes.object
  },

  render: function () {
    const pageClass = _.get(_.last(this.props.routes), 'pageClass', '');
    return (
      <div className={'site-canvas-inner ' + pageClass}>
        <SiteHeader
          pathname={this.props.location.pathname}
          fetchSearchResults={this.props._fetchSearchResults}
          cleanSearchResults={this.props._cleanSearchResults}
          routes={this.props.routes}
          search={this.props.search} />
        <main className='site-body'>
          {this.props.children}
        </main>
      </div>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    subregions: state.adminSubregions,
    search: state.search
  };
}

function dispatcher (dispatch) {
  return {
    _fetchSearchResults: (query) => dispatch(fetchSearchResults(query)),
    _cleanSearchResults: () => dispatch(cleanSearchResults())
  };
}

module.exports = connect(selector, dispatcher)(App);
