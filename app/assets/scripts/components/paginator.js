'use strict';
import React from 'react';
import c from 'classnames';
import { connect } from 'react-redux';
import { updatePagination, fetchAdminVProMMsProps } from '../actions/action-creators';

var Paginator = React.createClass({

  displayName: 'Paginator',

  propTypes: {
    _fetchAdminVProMMsProps: React.PropTypes.func,
    _updatePagination: React.PropTypes.func,
    aaId: React.PropTypes.string,
    adminInfo: React.PropTypes.object,
    crosswalk: React.PropTypes.object,
    pagination: React.PropTypes.object
  },

  makePaginator: function () {
    let pages = [];
    let nav = [];
    let numPages = this.props.pagination.pages;
    const currentPage = this.props.pagination.currentPage;
    const limit = this.props.pagination.limit;
    // if distance between last and current page is more than 10, set lastPage to currentPage + 10;
    const lastPage = (numPages - currentPage > 10) ? currentPage + 9 : numPages;
    // if not the 2nd page, include a first button
    // the previous button both updates the pagination list and grabs the prev page's roads;
    // if not the first page, add a back button to the list
    const previousPage = currentPage - 10;
    const previousIndex = limit * previousPage;
    const prevClassName = c('bttn', 'bttn-base-light', {'disabled': (currentPage === 1)});
    nav.push(
      <li key={`pagination-previous-button`}>
        <button className={prevClassName} onClick={(e) => { (currentPage > 1) ? this.props._updatePagination(previousIndex, previousPage) : ''; } }>Previous</button>
      </li>
    );
    for (var i = currentPage - 1; i < lastPage; i++) {
      const thisPage = i + 1;
      const thisIndex = limit * thisPage;
      // pages inside previous/next buttons; only update the table roads
      pages.push(
        <li key={`page-${thisPage}-index-${thisIndex}`}>
          <button className='bttn bttn-base-light' onClick={(e) => { this.getNextRoads(limit, thisIndex); } }>{thisPage}</button>
        </li>
      );
    }
    const nextPage = currentPage + 10;
    const nextIndex = limit * nextPage;
    const nextClassName = c('bttn', 'bttn-base-light', {'disabled': (lastPage === numPages)});
    nav.push(
      <li key={`pagination-next-button`}>
        <button className={nextClassName} onClick={(e) => { (currentPage !== numPages) ? this.props._updatePagination(nextIndex, nextPage) : ''; } }>Next</button>
      </li>
    );
    return { pages: pages, nav: nav };
  },

  getNextRoads: function (limit, thisIndex) {
    if (thisIndex !== this.props.pagination.currentIndex) {
      const level = this.props.adminInfo.level;
      const offset = thisIndex;
      let ids = (level === 'province') ? [this.props.crosswalk[level][this.props.aaId].id] : (
        [this.props.crosswalk['province'][this.props.adminInfo.parent.id].id, this.props.crosswalk[level][this.props.aaId]]
      );
      this.props._fetchAdminVProMMsProps(ids, level, limit, offset);
    }
  },

  render: function () {
    const paginator = this.makePaginator();
    return (
      <div className='a-paginator'>
        <ul className='a-children'>{paginator.pages}</ul>
        <ul className='a-children a-paginator-nav'>{paginator.nav}</ul>
      </div>
    );
  }
});

function selector (state) { return {}; }

function dispatcher (dispatch) {
  return {
    _fetchAdminVProMMsProps: (ids, level, limit, offset) => dispatch(fetchAdminVProMMsProps(ids, level, limit, offset)),
    _updatePagination: (index, page) => dispatch(updatePagination(index, page))
  };
}

export default connect(selector, dispatcher)(Paginator);
