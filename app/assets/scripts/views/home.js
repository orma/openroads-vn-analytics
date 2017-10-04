'use strict';
import React from 'react';
import { getLanguage, t } from '../utils/i18n';
import { Link } from 'react-router';
var Home = React.createClass({
  displayName: 'Home',

  render: function () {
    return (
      <section>
        <header className='page__header--landing'>
          <div className='page__headline--landing'>
            <h1 className='page__title--landing'><img src='assets/graphics/layout/openroads-vn-logo-hor-neg.svg' width='736' height='96' alt='OpenRoads Vietnam logo' /><span>OpenRoads</span> <strong>Vietnam</strong></h1>
            <p className='page__description--landing'>{t('Mapping, tracking and visualizing road assets in Vietnam for inclusive growth.')}</p>
          </div>
        </header>

        <div className='page__body--landing'>
          <div className='inner'>
            <h2>{t('Access and improve Road Networks')}</h2>
            <p className='description'></p>
            <p className='description'>{t('Work with the OpenRoads project to close this critical information gap and create a comprehensive road network map of Vietnam.')}</p>
            <Link to={`/${getLanguage()}/analytics/main`} className='bttn-explore'>{t('View analytics')}</Link>
            <Link to={`/${getLanguage()}/explore`} className='bttn-explore'>{t('Explore on map')}</Link>
          </div>
        </div>
      </section>
    );
  }
});

module.exports = Home;
