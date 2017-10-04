'use strict';
import React from 'react';
import _ from 'lodash';
import Search from './search';
import Headerdrop from './headerdrop';
import c from 'classnames';
import { connect } from 'react-redux';
import {
  setSearchType,
  showSearch
} from '../actions/action-creators';
import { t, getAvailableLanguages, getLanguage } from '../utils/i18n';
import { Link } from 'react-router';
var SiteHeader = React.createClass({
  displayName: 'SiteHeader',

  propTypes: {
    fetchSearchResults: React.PropTypes.func,
    cleanSearchResults: React.PropTypes.func,
    routes: React.PropTypes.array,
    search: React.PropTypes.object,
    pathname: React.PropTypes.string,
    _setSearchType: React.PropTypes.func,
    searchType: React.PropTypes.string,
    _showSearch: React.PropTypes.func,
    displaySearch: React.PropTypes.bool
  },

  toggleMenuHandler: function (e) {
    e.preventDefault();
    this.refs.nav.classList.remove('show-search');
    this.refs.nav.classList.toggle('show-menu');
  },

  toggleSearchHandler: function (e) {
    e.preventDefault();
    this.refs.nav.classList.remove('show-menu');
  },

  closeSearch: function () {
    this.refs.nav.classList.remove('show-menu');
  },

  resizeHandler: function () {
    if (document.body.getBoundingClientRect().width > 991) {
      this.refs.nav.classList.remove('show-menu');
      // this.refs.search.classList.remove('show-search');
    }
  },

  menuClickHandler: function () {
    this.refs.nav.classList.remove('show-menu');
  },

  componentDidMount: function () {
    this.resizeHandler = _.debounce(this.resizeHandler, 200);
    window.addEventListener('resize', this.resizeHandler);
  },

  componentWillUnmount: function () {
    this.refs.toggleMenu.removeEventListener('click', this.toggleMenuHandler);
    window.removeEventListener('resize', this.resizeHandler);
  },

  // for the analytics and home page, hide search if open.
  setSearchDisplay: function () {
    let isExplore = new RegExp(/explore/).test(this.props.pathname);
    let isEditor = new RegExp(/editor/).test(this.props.pathname);
    if (!isEditor && !isExplore) {
      this.props._showSearch(false);
    }
  },

  displaySearchBar: function () {
    if (this.props.displaySearch) {
      return (
          <div className='site__search'>
            <Search
              searchType={this.props.searchType}
              fetchSearchResults={this.props.fetchSearchResults}
              cleanSearchResults={this.props.cleanSearchResults}
              onResultClick={this.closeSearch}
              results={this.props.search.results}
              query={this.props.search.query}
              fetching={this.props.search.fetching}
              searching={this.props.search.searching} />
          </div>
      );
    } else {
      return (<div/>);
    }
  },

  render: function () {
    this.setSearchDisplay();
    return (
      <header className='site-header' ref={(header) => this.header = header }>
        <div className='inner'>
          <div className='site__headline'>
            <h1 className='site__title'>
              <Link to={`/${getLanguage()}`}>
                <img src='assets/graphics/layout/openroads-vn-logo-hor-neg.svg' width='736' height='96' alt='OpenRoads Vietnam logo' /><span>OpenRoads</span> <strong>Vietnam</strong>
              </Link>
            </h1>
          </div>
          <nav className='site__nav' role='navigation' ref='nav'>
            <h2 className='toggle-menu'><a href='#global-menu' title='Show menu' ref='toggleMenu'><span>Menu</span></a></h2>
            <div className='menu-wrapper'>
              <ul className='global-menu' id='global-menu'>
                <li>
                  <Link to={`/${getLanguage()}/analytics/main`} className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}>
                    <span>{t('Analytics')}</span>
                  </Link>
                </li>
                <li>
                  <Link to={`/${getLanguage()}/explore`} className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}>
                    <span>{t('Explore')}</span>
                  </Link>
                </li>
                <li>
                  <Link to={`/${getLanguage()}/editor`} className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}>
                    <span>{t('Editor')}</span>
                  </Link>
                </li>
                <li className='search'>
                  {this.displaySearchBar()}
                </li>
              </ul>
            </div>
            <div className='menu-wrapper'>
              <Headerdrop
                id='lang-switcher'
                triggerClassName='drop-toggle caret change-lang-button site__lang'
                triggerText={t('Language')}
                triggerElement='a'
                direction='down'
                alignment='right'>
                <ul className='drop-menu drop-menu--select' role='menu'>
                {
                  getAvailableLanguages().map(l => {
                    let cl = c('drop-menu-item', {
                      'drop-menu-item--active': l.key === getLanguage()
                    });
                    let url = this.props.pathname.replace(`/${getLanguage()}`, `/${l.key}`);
                    return (
                      <li key={l.key}>
                        <Link to={url}
                          title={t('Select language')}
                          className={cl} data-hook='dropdown:close'>
                          {l.name}
                        </Link>
                      </li>
                    );
                  })
                  }
                </ul>
              </Headerdrop>
              <Headerdrop
              id='search-selector'
              triggerClassName='drop-toggle caret change-search-button site__lang'
              triggerText={t('Search')}
              triggerElement='a'
              direction='down'
              alignment='right'>
              <ul className='drop-menu drop-menu--select' role='menu'>
              {
                ['Admin', 'VProMMs'].map((l, i) => {
                  let cl = 'drop-menu-item';
                  return (
                    <li key={i}>
                      <a onClick={(e) => {
                        this.props._setSearchType(l);
                        this.props._showSearch(true);
                      }}
                        className={cl} data-hook='dropdown:close'>{l}</a>
                    </li>
                  );
                })
                }
              </ul>
              </Headerdrop>
            </div>
          </nav>
        </div>
      </header>
    );
  }
});

function selector (state) {
  return {
    displaySearch: state.searchDisplay.show,
    searchType: state.setSearchType.searchType
  };
}

function dispatcher (dispatch) {
  return {
    _showSearch: (bool) => dispatch(showSearch(bool)),
    _setSearchType: (searchType) => dispatch(setSearchType(searchType))
  };
}

module.exports = connect(selector, dispatcher)(SiteHeader);
