'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { _ } from 'lodash';
import { t, getLanguage } from '../utils/i18n';
import { Link } from 'react-router';

import AATable from '../components/aa-table-vpromms';

import {
  fetchAdminInfo,
  fetchAdminRoads,
  fetchFieldRoads,
  fetchVProMMsidsProperties,
  removeVProMMsidsProperties,
  setCrossWalk
} from '../actions/action-creators';

import config from '../config';

var AnalyticsAA = React.createClass({
  displayName: 'AnalyticsAA',

  propTypes: {
    _fetchVProMMsids: React.PropTypes.func,
    _fetchFieldVProMMsids: React.PropTypes.func,
    _fetchVProMMsidsProperties: React.PropTypes.func,
    _fetchFieldRoads: React.PropTypes.func,
    _fetchAdminInfo: React.PropTypes.func,
    _fetchAdminRoads: React.PropTypes.func,
    _removeVProMMsidsProperties: React.PropTypes.func,
    _setCrossWalk: React.PropTypes.func,
    routeParams: React.PropTypes.object,
    crosswalk: React.PropTypes.object,
    crosswalkSet: React.PropTypes.bool,
    params: React.PropTypes.object,
    provinceCrossWalk: React.PropTypes.object,
    VProMMSids: React.PropTypes.object,
    VProMMsProps: React.PropTypes.object,
    fieldRoads: React.PropTypes.array,
    fieldFetched: React.PropTypes.bool,
    propsFetched: React.PropTypes.bool,
    adminInfo: React.PropTypes.object,
    adminInfoFetched: React.PropTypes.bool,
    adminRoads: React.PropTypes.array,
    adminRoadsFetched: React.PropTypes.bool,
    adminRoadsFetching: React.PropTypes.bool,
    location: React.PropTypes.object
  },

  renderAdminChildren: function (children) {
    return (
      <ul className='a-children'>
        {children.map((child, i) => {
          return (
            <li><Link onClick={(e) => {
              this.props._removeVProMMsidsProperties();
              this.props._fetchAdminInfo(child.id);
            } } to={`/${getLanguage()}/analytics/${child.id}`}>{child.name_en}</Link>
          </li>
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
    this.props._fetchAdminInfo(this.props.params.aaId);
    this.props._fetchVProMMsidsProperties();
  },

  componentWillReceiveProps: function (nextProps) {
    const allFetched = (nextProps.adminInfoFetched && nextProps.propsFetched && nextProps.crosswalkSet);
    const newAdmin = (this.props.location.pathname !== nextProps.location.pathname);
    // A catch all for the adminRoads.
    const roadsFetched = (nextProps.adminRoadsFetched || this.props.adminRoadsFetched || this.props.adminRoadsFetching || nextProps.adminRoadsFetching);
    // get next admin info when navigating to child admin
    if (newAdmin) {
      return this.props._fetchAdminInfo(nextProps.params.aaId);
    }
    if (roadsFetched) { return; }
    if (allFetched || newAdmin) {
      return this.getAdminData(nextProps);
    }
  },

  // shouldComponentUpdate: function () { return true; },

  getAdminData: function (props) {
    const level = props.adminInfo.level;
    let ids = (level === 'province') ? [props.crosswalk[level][props.params.aaId]] : (
      [props.crosswalk['province'][props.adminInfo.parent], props.crosswalk[level][props.params.aaId]]
    );
    this.props._fetchAdminRoads(ids, level);
    this.props._fetchFieldRoads(ids, level);
  },

  // back button push on district back to province page does not reload province name.
  // this fire of fetchAdminChildren with the district parent (a province) ensures that it does.
  handlePop: function () {
    this.props.adminInfo.level === 'district' ? this.props._fetchAdminInfo(this.props.adminInfo.parent) : '';
  },

  renderAnalyticsAdmin: function () {
    const propertiesData = _.pickBy(this.props.VProMMsProps, (prop, vpromm) => (this.props.adminRoads.includes(vpromm)));
    const level = this.props.adminInfo.level;
    const provinceId = this.props.crosswalk[level][this.props.params.aaId];
    const total = this.props.adminRoads.length;
    const field = this.props.fieldRoads.length;
    const completion = (total !== 0) ? ((field / total) * 100) : 0;
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
            <h1>{this.props.adminInfo.name_en}</h1>
          </div>
          <div className='a-head-actions'>
            { completion ? this.renderDataDumpLinks(provinceId) : '' }
          </div>
        </div>
        <div>
          { (level !== 'district') ? this.renderAdminChildren(this.props.adminInfo.children) : '' }
          <div className='a-main__status'>
            <h2><strong>{completionMainText}</strong>{completionTailText}</h2>
            <div className='meter'>
              <div className='meter__internal' style={{width: `${completion}%`}}></div>
            </div>
          </div>
          <div>
            {total ? <AATable data={this.props.adminRoads} propertiesData={propertiesData} /> : ''}
          </div>
        </div>
      </div>
    );
  },

  render: function () {
    const allFetched = (this.props.propsFetched && this.props.adminInfoFetched && this.props.adminRoadsFetched && this.props.fieldFetched);
    return allFetched ? this.renderAnalyticsAdmin() : (<div/>);
  }

});

function selector (state) {
  return {
    fieldRoads: state.fieldRoads.ids,
    crosswalk: state.crosswalk,
    propsFetched: state.VProMMsidProperties.fetched,
    fieldFetched: state.fieldVProMMsids.fetched,
    VProMMSids: state.VProMMSidsAnalytics,
    VProMMsProps: state.VProMMsidProperties.properties,
    adminInfo: state.adminInfo.data,
    adminInfoFetched: state.adminInfo.fetched,
    adminRoads: state.adminRoads.ids,
    adminRoadsFetched: state.adminRoads.fetched,
    adminRoadsFetching: state.adminRoads.fetching,
    crosswalkSet: state.crosswalk.set
  };
}

function dispatcher (dispatch) {
  return {
    _fetchVProMMsidsProperties: () => dispatch(fetchVProMMsidsProperties()),
    _fetchAdminRoads: (idTest, level) => dispatch(fetchAdminRoads(idTest, level)),
    _fetchFieldRoads: (idTest, level) => dispatch(fetchFieldRoads(idTest, level)),
    _fetchAdminInfo: (id, level) => dispatch(fetchAdminInfo(id, level)),
    _removeVProMMsidsProperties: () => dispatch(removeVProMMsidsProperties()),
    _setCrossWalk: () => dispatch(setCrossWalk())
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsAA);

