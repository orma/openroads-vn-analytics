'use strict';
import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router';

var GlobalMenu = React.createClass({
  displayName: 'GlobalMenu',

  toggleHandler: function (e) {
    e.preventDefault();
    this.refs.nav.classList.toggle('show-menu');
  },

  resizeHandler: function () {
    if (document.body.getBoundingClientRect().width <= 544) {
      this.refs.nav.classList.toggle('show-menu');
    }
  },

  menuClickHandler: function () {
    this.refs.nav.classList.remove('show-menu');
  },

  componentDidMount: function () {
    this.refs.toggle.addEventListener('click', this.toggleHandler, false);

    this.resizeHandler = _.debounce(this.resizeHandler, 200);
    window.addEventListener('resize', this.resizeHandler);
  },

  componentWillUnmount: function () {
    this.refs.toggle.removeEventListener('click', this.toggleHandler);
    window.removeEventListener('resize', this.resizeHandler);
  },

  render: function () {
    return (
      <nav className='site__nav' role='navigation' ref='nav'>
        <h2 className='toggle-menu'><a href='#global-menu' title='Show menu' ref='toggle'><span>Menu</span></a></h2>
        <div className='menu-wrapper'>
          <ul className='global-menu' id='global-menu'>
            <li><Link to='/analytics' className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}><span>Analytics</span></Link></li>
            <li><Link to='/editor' className='global-menu-item' activeClassName='global-menu-item--active' onClick={this.menuClickHandler}><span>Editor</span></Link></li>
          </ul>
        </div>
      </nav>
    );
  }
});

module.exports = GlobalMenu;
