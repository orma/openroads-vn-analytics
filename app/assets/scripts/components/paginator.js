'use strict';
import React from 'react';
// import classNames from 'classnames';
import { connect } from 'react-redux';
import { updatePagination } from '../actions/action-creators';

var Paginator = React.createClass({

  displayName: 'Paginator',

  propTypes: {
    pagination: React.PropTypes.object,
    _updatePagination: React.PropTypes.func
  },

  makePages: function () {
    const pages = [];
    const numPages = this.props.pagination.pages;
    for (var i = 0; i < numPages; i++) {
      const thisPage = i + 1;
      const thisIndex = this.props.pagination.limit * thisPage;
      pages.push(
        <li key={`page-${thisPage}-index-${thisIndex}`}>
          <button href='#' onClick={(e) => { this.props._updatePagination(thisIndex, thisPage); } }>{thisPage}</button>
        </li>
      );
    }
    return pages;
  },

  render: function () {
    const pages = this.makePages();
    return (
      <ul>{pages}</ul>
    );
  }
});

function selector (state) { return {}; }

function dispatcher (dispatch) {
  return {
    _updatePagination: (index, page) => dispatch(updatePagination(index, page))
  };
}

export default connect(selector, dispatcher)(Paginator);
