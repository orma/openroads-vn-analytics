'use strict';
import React from 'react';
import _ from 'lodash';
import Search from './search';
import { Link } from 'react-router';

var SiteHeader = React.createClass({
  displayName: 'SiteHeader',

  propTypes: {
    fetchSearchResults: React.PropTypes.func,
    cleanSearchResults: React.PropTypes.func,
    routes: React.PropTypes.array,
    search: React.PropTypes.object
  },

  toggleMenuHandler: function (e) {
    e.preventDefault();
    this.refs.nav.classList.remove('show-search');
    this.refs.nav.classList.toggle('show-menu');
  },

  toggleSearchHandler: function (e) {
    e.preventDefault();
    this.refs.nav.classList.remove('show-menu');
    this.refs.nav.classList.toggle('show-search');
  },

  closeSearch: function () {
    this.refs.nav.classList.remove('show-menu');
    this.refs.nav.classList.remove('show-search');
  },

  resizeHandler: function () {
    if (document.body.getBoundingClientRect().width > 991) {
      this.refs.nav.classList.remove('show-menu');
      this.refs.nav.classList.remove('show-search');
    }
  },

  menuClickHandler: function () {
    this.refs.nav.classList.remove('show-menu');
  },

  componentDidMount: function () {
    this.refs.toggleMenu.addEventListener('click', this.toggleMenuHandler, false);
    this.refs.toggleSearch.addEventListener('click', this.toggleSearchHandler, false);

    this.resizeHandler = _.debounce(this.resizeHandler, 200);
    window.addEventListener('resize', this.resizeHandler);
  },

  componentWillUnmount: function () {
    this.refs.toggleMenu.removeEventListener('click', this.toggleMenuHandler);
    this.refs.toggleSearch.removeEventListener('click', this.toggleSearchHandler);
    window.removeEventListener('resize', this.resizeHandler);
  },

  render: function () {
    let last = _.last(this.props.routes).path;
    return (
      <header className='site-header'>
        <div className='inner'>
          <div className='site__headline'>
            <h1 className='site__title'><Link to='/'><img src='assets/graphics/layout/openroads-vn-logo-hor-neg.svg' width='736' height='96' alt='OpenRoads Vietnam logo' /><span>OpenRoads</span> <strong>Vietnam</strong></Link></h1>
          </div>

          <nav className='site__nav' role='navigation' ref='nav'>
            <h2 className='toggle-search'><a href='#global-search' title='Show search' ref='toggleSearch'><span>Search</span></a></h2>
            <div className='search-wrapper'>
              <div className='site__search'>
                <Search
                  fetchSearchResults={this.props.fetchSearchResults}
                  cleanSearchResults={this.props.cleanSearchResults}
                  onResultClick={this.closeSearch}
                  results={this.props.search.results}
                  query={this.props.search.query}
                  isEditor={last === 'editor/*' || last === 'editor'}
                  fetching={this.props.search.fetching}
                  searching={this.props.search.searching} />
              </div>
            </div>

            <h2 className='toggle-menu'><a href='#global-menu' title='Show menu' ref='toggleMenu'><span>Menu</span></a></h2>
            <div className='menu-wrapper'>
              <ul className='global-menu' id='global-menu'>
                <li><Link to='/analytics/main' className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}><span>Analytics</span></Link></li>
                <li><Link to='/explore' className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}><span>Explore</span></Link></li>
                <li><Link to='/editor' className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}><span>Editor</span></Link></li>
              </ul>
            </div>
          </nav>

        </div>
      </header>
    );
  }
});

module.exports = SiteHeader;
