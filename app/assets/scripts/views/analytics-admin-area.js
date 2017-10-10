'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { t, getLanguage } from '../utils/i18n';
import { Link } from 'react-router';

import AATable from '../components/aa-table-vpromms';

import {
  fetchAdminInfo,
  fetchAdminRoads,
  fetchFieldRoads,
  fetchAdminVProMMsProps,
  removeAdminVProMMsProps,
  removeAdminInfo,
  setCrossWalk
} from '../actions/action-creators';

import config from '../config';

var AnalyticsAA = React.createClass({
  displayName: 'AnalyticsAA',

  propTypes: {
    _fetchVProMMsids: React.PropTypes.func,
    _fetchFieldVProMMsids: React.PropTypes.func,
    _fetchAdminVProMMsProps: React.PropTypes.func,
    _fetchFieldRoads: React.PropTypes.func,
    _fetchAdminInfo: React.PropTypes.func,
    _removeAdminInfo: React.PropTypes.func,
    _removeAdminVProMMsProps: React.PropTypes.func,
    _setCrossWalk: React.PropTypes.func,
    crosswalk: React.PropTypes.object,
    crosswalkSet: React.PropTypes.bool,
    params: React.PropTypes.object,
    fieldRoads: React.PropTypes.array,
    fieldFetched: React.PropTypes.bool,
    adminInfo: React.PropTypes.object,
    adminInfoFetched: React.PropTypes.bool,
    adminInfoFetching: React.PropTypes.bool,
    adminRoadProperties: React.PropTypes.array,
    adminRoadsPropertiesFetched: React.PropTypes.bool,
    location: React.PropTypes.object
  },

  renderAdminChildren: function (children) {
    return (
      <ul className='a-children'>
        {children.map((child, i) => {
          return (
            <li><Link onClick={(e) => {
              this.props._removeAdminVProMMsProps();
              this.props._fetchAdminInfo(child.id);
            } } to={`/${getLanguage()}/analytics/${child.id}`}>{child.name_en}</Link>
          </li>
          );
        })}
      </ul>
    );
  },

  // before mount, get the admin info needed to make the list of child elements
  // as well as build the correct api queries in getAdminData
  componentWillMount: function () {
    this.props._fetchAdminInfo(this.props.params.aaId);
    this.props._setCrossWalk();
  },

  // on each unmount, drain properties and admin info objects so to
  // make the component to be the same each time
  componentWillUnmount: function () {
    this.props._removeAdminVProMMsProps();
    this.props._removeAdminInfo();
  },

  componentWillReceiveProps: function (nextProps) {
    // if the adminInfo is about to be fetched and ready for render
    // grab the admin properties and field data needed to fill out the tables
    if (this.props.adminInfoFetching && nextProps.adminInfoFetched) {
      return this.getAdminData(nextProps);
    }
    // if switching between a district to its parent province,
    // fetch that parent admin info.
    if (this.props.location.pathname !== nextProps.location.pathname) {
      if (nextProps.params.aaId && nextProps.params.aaId.length === 3) {
        this.props._removeAdminVProMMsProps();
        this.props._removeAdminInfo();
        return this.props._fetchAdminInfo(nextProps.params.aaId);
      }
    }
  },

  shouldComponentUpdate: function (nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      if (nextProps.params.aaId && nextProps.params.aaId.length === 3) {
        return false;
      }
    }
    return true;
  },

  getAdminData: function (props) {
    const level = props.adminInfo.level;
    let ids = (level === 'province') ? [props.crosswalk[level][props.params.aaId].id] : (
      [props.crosswalk['province'][props.adminInfo.parent.id].id, props.crosswalk[level][props.params.aaId].id]
    );
    this.props._fetchAdminVProMMsProps(ids, level);
    this.props._fetchFieldRoads(ids, level);
  },

  makeAdminAnalyticsContent: function () {
    const level = this.props.adminInfo.level;
    const id = this.props.crosswalk[level][this.props.params.aaId].id;
    const name = (level === 'district') ? this.props.adminInfo.name_en : this.props.crosswalk[level][this.props.params.aaId].name;
    const total = Object.keys(this.props.adminRoadProperties).length;
    const field = this.props.fieldRoads.length;
    const completion = (total !== 0) ? ((field / total) * 100) : 0;
    let completionMainText;
    let completionTailText = t('Information on VPRoMMS roads is not available');
    if (total !== 0) {
      completionMainText = completion.toFixed(2);
      completionTailText = `% ${t('of VProMMS Ids have field data')} ${field.toLocaleString()} of ${total.toLocaleString()}`;
    }
    return {
      level: level,
      total: total,
      completion: completion,
      completionMainText: completionMainText,
      completionTailText: completionTailText,
      id: id,
      name: name
    };
  },

  renderDataDumpLinks: function (provinceId) {
    return (
      <div>
        <h3 classNam='a-header'>Admin Chilren</h3>
        <a className='bttn bttn-secondary' href={`${config.provinceDumpBaseUrl}${provinceId}.csv`}>Download Roads</a>
      </div>
    );
  },

  renderAnalyticsAdmin: function () {
    const adminRoadIds = this.props.adminRoadProperties.map(road => road.id);
    const adminContent = this.makeAdminAnalyticsContent();
    return (
      <div>
        <div className='a-header'>
          <div className='a-headline'>
            <h1>{adminContent.name}</h1>
          </div>
          {/* completion suggests data exists, in whcih case there is data available for download */}
          <div className='a-head-actions'>
            { adminContent.completion ? this.renderDataDumpLinks(adminContent.id) : '' }
          </div>
        </div>
        <div>
          {/* commune (district child) lists are not rendered */}
          { (adminContent.level !== 'district') ? this.renderAdminChildren(this.props.adminInfo.children) : '' }
          <div className='a-main__status'>
            <h2><strong>{adminContent.completionMainText}</strong>{adminContent.completionTailText}</h2>
            <div className='meter'>
              <div className='meter__internal' style={{width: `${adminContent.completion}%`}}></div>
            </div>
          </div>
          <div>
            {adminContent.total ? <AATable data={adminRoadIds} fieldRoads={this.props.fieldRoads} propertiesData={this.props.adminRoadProperties} /> : ''}
          </div>
        </div>
      </div>
    );
  },

  render: function () {
    const roadsFetched = (this.props.fieldFetched && this.props.adminRoadProperties);
    return (
      <div ref='a-admin-area' className='a-admin-area-show'>
        {roadsFetched ? this.renderAnalyticsAdmin() : (<div/>)}
      </div>
    );
  }

});

function selector (state) {
  return {
    adminInfo: state.adminInfo.data,
    adminInfoFetched: state.adminInfo.fetched,
    adminInfoFetching: state.adminInfo.fetching,
    adminRoadProperties: state.VProMMsAdminProperties.data,
    adminRoadPropertiesFetched: state.VProMMsAdminProperties.fetched,
    crosswalk: state.crosswalk,
    crosswalkSet: state.crosswalk.set,
    fieldRoads: state.fieldRoads.ids,
    fieldFetched: state.fieldRoads.fetched
  };
}

function dispatcher (dispatch) {
  return {
    _fetchAdminVProMMsProps: (idTest, level) => dispatch(fetchAdminVProMMsProps(idTest, level)),
    _fetchAdminRoads: (idTest, level) => dispatch(fetchAdminRoads(idTest, level)),
    _fetchFieldRoads: (idTest, level) => dispatch(fetchFieldRoads(idTest, level)),
    _fetchAdminInfo: (id, level) => dispatch(fetchAdminInfo(id, level)),
    _removeAdminInfo: () => dispatch(removeAdminInfo()),
    _removeAdminVProMMsProps: () => dispatch(removeAdminVProMMsProps()),
    _setCrossWalk: () => dispatch(setCrossWalk())
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsAA);

