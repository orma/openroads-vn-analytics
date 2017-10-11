'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { t, getLanguage } from '../utils/i18n';
import { makePaginationConfig } from '../utils/pagination';
import { Link } from 'react-router';

import Paginator from '../components/paginator';
import AATable from '../components/aa-table-vpromms';

import {
  fetchAdminInfo,
  fetchAdminRoads,
  fetchFieldRoads,
  fetchVProMMsIdsCount,
  fetchAdminVProMMsProps,
  removeAdminVProMMsProps,
  removeFieldVProMMsIdsCount,
  removeVProMMsIdsCount,
  removeFieldRoads,
  removeAdminRoads,
  removeAdminInfo,
  removeCrosswalk,
  setCrossWalk,
  setPagination,
  updatePagination
} from '../actions/action-creators';

import config from '../config';

var AnalyticsAA = React.createClass({
  displayName: 'AnalyticsAA',

  propTypes: {
    _fetchVProMMsids: React.PropTypes.func,
    _fetchVProMMsIdsCount: React.PropTypes.func,
    _fetchFieldVProMMsids: React.PropTypes.func,
    _fetchAdminVProMMsProps: React.PropTypes.func,
    _fetchFieldRoads: React.PropTypes.func,
    _fetchAdminInfo: React.PropTypes.func,
    _fetchAdminRoads: React.PropTypes.func,
    _removeAdminRoads: React.PropTypes.func,
    _removeAdminInfo: React.PropTypes.func,
    _removeAdminVProMMsProps: React.PropTypes.func,
    _removeVProMMsIdsCount: React.PropTypes.func,
    _removeFieldVProMMsIdsCount: React.PropTypes.func,
    _removeFieldRoads: React.PropTypes.func,
    _removeCrosswalk: React.PropTypes.func,
    _setCrossWalk: React.PropTypes.func,
    _setOffset: React.PropTypes.func,
    _setPagination: React.PropTypes.func,
    _updatePagination: React.PropTypes.func,
    crosswalk: React.PropTypes.object,
    crosswalkSet: React.PropTypes.bool,
    params: React.PropTypes.object,
    fieldRoads: React.PropTypes.array,
    fieldFetched: React.PropTypes.bool,
    adminInfo: React.PropTypes.object,
    adminInfoFetched: React.PropTypes.bool,
    adminRoads: React.PropTypes.array,
    adminRoadsFetched: React.PropTypes.bool,
    adminRoadProperties: React.PropTypes.array,
    adminRoadPropertiesFetched: React.PropTypes.bool,
    location: React.PropTypes.object,
    VProMMsCount: React.PropTypes.array,
    VProMMsCountFetched: React.PropTypes.bool,
    pagination: React.PropTypes.object
  },

  renderAdminChildren: function (children) {
    return (
      <ul className='a-children'>
        {children.map((child, i) => {
          var childKey = `${child}-${i}`;
          return (
            <li key={childKey} ><Link onClick={(e) => { setCrossWalk(); }}to={`/${getLanguage()}/analytics/${child.id}`}>{child.name_en}</Link>
          </li>
          );
        })}
      </ul>
    );
  },

  // before mount, get the admin info needed to make the list of child elements
  // as well as build the correct api queries in getAdminData
  componentWillMount: function () {
    this.props._setCrossWalk();
  },

  // on each unmount, drain properties and admin info objects so to
  // make the component to be the same each time
  componentWillUnmount: function () {
    this.clearAdminData();
  },

  // use the aaId to get the initial field data
  componentWillReceiveProps: function (nextProps) {
    if (!this.props.crosswalkSet && nextProps.crosswalkSet) { this.getAdminData(nextProps); }
    // if the adminInfo is about to be fetched and ready for render
    // grab the admin properties and field data needed to fill out the tables
    // if (!this.props.adminInfoFetched && nextProps.adminInfoFetched) {
    //   return this.getAdminData(nextProps);
    // }
    if (!this.props.VProMMsCountFetched && nextProps.VProMMsCountFetched) {
      const paginationConfig = makePaginationConfig(nextProps.VProMMsCount[0].total_roads, 20);
      this.props._setPagination(paginationConfig);
    }
    if (this.props.location.pathname !== nextProps.location.pathname) {
    }
    //   return this.props._fetchAdminInfo(nextProps.params.aaId);
    // }
    // if (this.props.adminRoadProperties !== nextProps.adminRoadProperties) {
    //   // adminInfo is needed for getting the relevant data;
    //   if (nextProps.adminInfoFetched) { this.getAdminData(nextProps); }
    // }
  },

  shouldComponentUpdate: function (nextProps) {
    if (nextProps.location.action === 'PUSH') {
      if (nextProps.params.aaId.length === 5) { return true; }
      return false;
    }
    // do not re-render component when location changes. wait until admin data fetched.
    if (this.props.location.pathname !== nextProps.location.pathname) { return false; }
    return true;
  },

  clearAdminData: function () {
    this.props._removeAdminVProMMsProps();
    this.props._removeAdminInfo();
    this.props._removeFieldRoads();
    this.props._removeAdminRoads();
    this.props._removeFieldVProMMsIdsCount();
    this.props._removeVProMMsIdsCount();
    this.props._removeCrosswalk();
  },

  getAdminData: function (props) {
    const level = 'province';
    let ids = [props.crosswalk[level][props.params.aaId].id];
    this.props._fetchVProMMsIdsCount(level, ids);
    this.props._fetchFieldRoads(ids, level);
    this.props._fetchAdminRoads(ids, level, 20, 0);
    this.props._fetchAdminVProMMsProps(ids, level, 20, 0);
    this.props._fetchAdminInfo(props.params.aaId);
  },

  getNextRoads: function (props) {
    const level = props.adminInfo.level;
    const limit = props.pagination.limit;
    const offset = props.pagination.currentIndex;
    let ids = (level === 'province') ? [props.crosswalk[level][props.params.aaId].id] : (
      [props.crosswalk['province'][props.adminInfo.parent.id].id, props.crosswalk[level][props.params.aaId]]
    );

    this.props._fetchAdminVProMMsProps(ids, level, limit, offset);
  },

  makeAdminAnalyticsContent: function () {
    const level = 'province';
    const id = this.props.crosswalk[level][this.props.params.aaId].id;
    const name = this.props.crosswalk[level][this.props.params.aaId].name;
    // const name = (level === 'district') ? this.props.adminInfo.name_en : this.props.crosswalk[level][this.props.params.aaId].name;
    const total = this.props.VProMMsCount.length > 0 ? this.props.VProMMsCount[0].total_roads : 0;
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
    const adminContent = this.makeAdminAnalyticsContent();
    return (
      <div>
        <div className='a-header'>
          <div className='a-headline'>
            <h1>{adminContent.name}</h1>
          </div>
          {/* completion suggests data exists, in whcih case there is data available for download */}
          <div className='a-head-actions'>
            {/* { adminContent.completion ? this.renderDataDumpLinks(adminContent.id) : '' } */}
          </div>
        </div>
        <div>
          {/* commune (district child) lists are not rendered */}
          { (this.props.adminInfoFetched && (adminContent.level !== 'district')) ? this.renderAdminChildren(this.props.adminInfo.children) : (<div>Loading Child Admins</div>) }
          <div className='a-main__status'>
            <h2><strong>{adminContent.completionMainText}</strong>{adminContent.completionTailText}</h2>
            <div className='meter'>
              <div className='meter__internal' style={{width: `${adminContent.completion}%`}}></div>
            </div>
          </div>
          <div>
            {(adminContent.total && this.props.adminRoadsFetched) ? <AATable data={this.props.adminRoads} fieldRoads={this.props.fieldRoads} propertiesData={this.props.adminRoadProperties} propertiesFetched={this.props.adminRoadPropertiesFetched} /> : (<div>Loading Table</div>)}
            {((this.props.pagination.pages > 1) && this.props.adminRoadsFetched) ? <Paginator pagination={this.props.pagination} crosswalk={this.props.crosswalk} adminInfo={this.props.adminInfo} aaId={this.props.params.aaId} /> : <div/>}
          </div>
        </div>
      </div>
    );
  },

  render: function () {
    const roadsFetched = (this.props.fieldFetched && this.props.VProMMsCountFetched);
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
    adminRoads: state.adminRoads.ids,
    adminRoadsFetched: state.adminRoads.fetched,
    adminRoadProperties: state.VProMMsAdminProperties.data,
    adminRoadPropertiesFetched: state.VProMMsAdminProperties.fetched,
    crosswalk: state.crosswalk,
    crosswalkSet: state.crosswalk.set,
    fieldRoads: state.fieldRoads.ids,
    fieldFetched: state.fieldRoads.fetched,
    VProMMsCount: state.roadIdCount.counts,
    VProMMsCountFetched: state.roadIdCount.fetched,
    pagination: state.pagination
  };
}

function dispatcher (dispatch) {
  return {
    _fetchAdminVProMMsProps: (ids, level, limit, offset) => dispatch(fetchAdminVProMMsProps(ids, level, limit, offset)),
    _fetchAdminRoads: (ids, level, limit, offset) => dispatch(fetchAdminRoads(ids, level, limit, offset)),
    _fetchFieldRoads: (idTest, level) => dispatch(fetchFieldRoads(idTest, level)),
    _fetchVProMMsIdsCount: (idTest, level) => dispatch(fetchVProMMsIdsCount(idTest, level)),
    _fetchAdminInfo: (id, level) => dispatch(fetchAdminInfo(id, level)),
    _removeAdminInfo: () => dispatch(removeAdminInfo()),
    _removeFieldRoads: () => dispatch(removeFieldRoads()),
    _removeAdminRoads: () => dispatch(removeAdminRoads()),
    _removeCrosswalk: () => dispatch(removeCrosswalk()),
    _removeFieldVProMMsIdsCount: () => dispatch(removeFieldVProMMsIdsCount()),
    _removeAdminVProMMsProps: () => dispatch(removeAdminVProMMsProps()),
    _removeVProMMsIdsCount: () => dispatch(removeVProMMsIdsCount()),
    _setCrossWalk: () => dispatch(setCrossWalk()),
    _setPagination: (paginationConfig) => dispatch(setPagination(paginationConfig)),
    _updatePagination: (paginationUpdates) => dispatch(updatePagination(paginationUpdates))
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsAA);

