'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { _ } from 'lodash';
import { t, getLanguage } from '../utils/i18n';
import { Link } from 'react-router';

import AATable from '../components/aa-table-vpromms';

import { fetchVProMMsids, fetchAdminChildren, fetchFieldVProMMsids, fetchVProMMsidsProperties, setCrossWalk } from '../actions/action-creators';

import config from '../config';

var AnalyticsAA = React.createClass({
  displayName: 'AnalyticsAA',

  propTypes: {
    _fetchVProMMsids: React.PropTypes.func,
    _fetchFieldVProMMsids: React.PropTypes.func,
    _fetchVProMMsidsProperties: React.PropTypes.func,
    _fetchAdminChildren: React.PropTypes.func,
    _setCrossWalk: React.PropTypes.func,
    children: React.PropTypes.object,
    routeParams: React.PropTypes.object,
    crosswalk: React.PropTypes.object,
    params: React.PropTypes.object,
    provinceCrossWalk: React.PropTypes.object,
    VProMMSids: React.PropTypes.object,
    VProMMsProps: React.PropTypes.object,
    fieldIds: React.PropTypes.array,
    fieldFetched: React.PropTypes.bool,
    propsFetched: React.PropTypes.bool,
    adminChildren: React.PropTypes.object,
    adminChildrenFetched: React.PropTypes.bool,
    location: React.PropTypes.object
  },

  renderAdminChildren: function (children) {
    return (
      <ul className='a-children'>
        {children.map((child, i) => {
          return (
            <li key={child.id}><Link onClick={(e) => { this.props._fetchAdminChildren(child.id); } } to={`/${getLanguage()}/analytics/${child.id}`}>{child.name_en}</Link></li>
          );
        })}
      </ul>
    );
  },

  renderDataDumpLinks: function (provinceId) {
    return (
      <div>
        <h3 classNam='a-header'>Admin Chilren</h3>
        <a className='bttn bttn-secondary' href={`${config.provinceDumpBaseUrl}${provinceId}.csv`}>Download Roads</a>
      </div>
    );
  },

  componentWillMount: function () {
    this.props._fetchVProMMsidsProperties();
    this.props._fetchFieldVProMMsids();
    this.props._fetchAdminChildren(this.props.params.aaId);
  },

  handlePop: function () {
    this.props.adminChildren.level === 'district' ? this.props._fetchAdminChildren(this.props.adminChildren.parent) : '';
  },

  renderAnalyticsAdmin: function () {
    this.props.location.action === 'POP' ? this.handlePop() : '';
    const level = this.props.adminChildren.level;
    const provinceId = (level === 'province') ? _.invert(this.props.crosswalk[level])[this.props.params.aaId] : this.props.crosswalk[level][this.props.params.aaId];
    const provinceName = this.props.adminChildren.name;
    const idTest = (level === 'province') ? new RegExp(provinceId) : [new RegExp(provinceId), new RegExp(_.invert(this.props.crosswalk['province'])[this.props.adminChildren.parent])];
    const adminData = (level === 'province') ? Object.keys(this.props.VProMMsProps).filter(id => idTest.test(id.substring(0, 2))) : (Object.keys(this.props.VProMMsProps).filter(
      (id) => {
        id = id.substring(0, 5);
        return idTest[0].test(id) && idTest[1].test(id);
      })
    );
    const propertiesData = _.pickBy(this.props.VProMMsProps, (prop, vpromm) => (adminData.indexOf(vpromm) !== -1));
    const field = (level === 'province') ? this.props.fieldIds.filter(vpromm => idTest.test(vpromm.substring(0, 2))).length : (Object.keys(this.props.VProMMsProps).filter(
      (id) => {
        id = id.substring(0, 5);
        return idTest[0].test(id) && idTest[1].test(id);
      }).length
    );
    const total = adminData.length;
    const completion = total !== 0 ? ((field / total) * 100) : 0;
    let completionMainText;
    let completionTailText = t('Information on VPRoMMS roads is not available');
    if (total !== 0) {
      completionMainText = completion.toFixed(2);
      completionTailText = `% ${t('of VProMMS Ids have field data')} ${field.toLocaleString()} of ${total.toLocaleString()}`;
    }
    // completion text is comprised of a main text component and a tail component, both need to be distinct per the existence of ids for the province.
    return (
      <div>
        <div className='a-header'>
          <div className='a-headline'>
            <h1>{provinceName}</h1>
          </div>
          <div className='a-head-actions'>
            { completion ? this.renderDataDumpLinks(provinceId) : '' }
          </div>
        </div>
        <div>
          { (level !== 'district') ? this.renderAdminChildren(this.props.adminChildren.children) : '' }
          <div className='a-main__status'>
            <h2><strong>{completionMainText}</strong>{completionTailText}</h2>
            <div className='meter'>
              <div className='meter__internal' style={{width: `${completion}%`}}></div>
            </div>
          </div>
          <div>
            {total ? <AATable data={adminData} propertiesData={propertiesData} /> : ''}
          </div>
        </div>
      </div>
    );
  },

  render: function () {
    const allFetched = (this.props.propsFetched && this.props.fieldFetched && this.props.adminChildrenFetched);
    return allFetched ? this.renderAnalyticsAdmin() : (<div/>);
  }
});

function selector (state) {
  return {
    fieldIds: state.fieldVProMMsids.ids,
    crosswalk: state.crosswalk,
    propsFetched: state.VProMMsidProperties.fetched,
    fieldFetched: state.fieldVProMMsids.fetched,
    VProMMSids: state.VProMMSidsAnalytics,
    VProMMsProps: state.VProMMsidProperties.properties,
    adminChildren: state.adminChildren.data,
    adminChildrenFetched: state.adminChildren.fetched
  };
}

function dispatcher (dispatch) {
  return {
    _fetchVProMMsids: () => dispatch(fetchVProMMsids()),
    _fetchFieldVProMMsids: () => dispatch(fetchFieldVProMMsids()),
    _fetchVProMMsidsProperties: () => dispatch(fetchVProMMsidsProperties()),
    _fetchAdminChildren: (id) => dispatch(fetchAdminChildren(id)),
    _setCrossWalk: () => dispatch(setCrossWalk())
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsAA);

