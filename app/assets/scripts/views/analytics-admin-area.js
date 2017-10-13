'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { t, getLanguage, setLanguage } from '../utils/i18n';
import { makePaginationConfig } from '../utils/pagination';
import { makeIdTest, getAdminId, getAdminName } from '../utils/admin-level';
import { Link } from 'react-router';
import c from 'classnames';

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
  setPreviousLocation,
  setSubAdminName,
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
    _setPreviousLocation: React.PropTypes.func,
    _setSubAdminName: React.PropTypes.func,
    _updatePagination: React.PropTypes.func,
    crosswalk: React.PropTypes.object,
    crosswalkSet: React.PropTypes.bool,
    params: React.PropTypes.object,
    fieldRoads: React.PropTypes.array,
    fieldFetched: React.PropTypes.bool,
    language: React.PropTypes.string,
    adminInfo: React.PropTypes.object,
    adminInfoFetched: React.PropTypes.bool,
    adminRoads: React.PropTypes.array,
    adminRoadsFetched: React.PropTypes.bool,
    adminRoadProperties: React.PropTypes.array,
    adminRoadPropertiesFetched: React.PropTypes.bool,
    location: React.PropTypes.object,
    VProMMsCount: React.PropTypes.array,
    VProMMsCountFetched: React.PropTypes.bool,
    pagination: React.PropTypes.object,
    history: React.PropTypes.object,
    previousLocation: React.PropTypes.string,
    subadminName: React.PropTypes.string
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
    this.props._removeCrosswalk();
    this.props._setPreviousLocation(this.props.location.pathname);
  },

  // use the aaId to get the initial field data
  componentWillReceiveProps: function (nextProps) {
    if (!this.props.crosswalkSet && nextProps.crosswalkSet) { this.getAdminData(nextProps); }
    if (!this.props.VProMMsCountFetched && nextProps.VProMMsCountFetched) {
      if (/explore/.test(nextProps.previousLocation) || /road/.test(nextProps.previousLocation)) { return; }
      // when returning
      const totalRoads = nextProps.VProMMsCount[0] ? nextProps.VProMMsCount[0].total_roads : 0;
      const paginationConfig = makePaginationConfig(totalRoads, 20);
      this.props._setPagination(paginationConfig);
    }
    if (this.props.location.pathname !== nextProps.location.pathname) {
      const sameLanguage = (this.props.params.lang === nextProps.params.lang);
      const level = !this.props.params.aaIdSub ? 'province' : 'district';
      const sameAdmin = level === 'province' ? (this.props.params.aaId === nextProps.params.aaId) : (this.props.params.aaIdSub === nextProps.params.aaIdSub);
      // if back button is pressed right after the langauge was updated,
      // go back to the parent admin, not the same admin w/different language per the default.
      if (nextProps.location.action === 'POP') {
        if (sameAdmin && !sameLanguage) {
          const path = (level === 'district') ? `/${getLanguage()}/analytics/${this.props.params.aaId}` : `/${getLanguage()}/analytics/`;
          this.props.history.push(path);
        }
      }
      if (this.props.language !== nextProps.language) { return; }
      if (nextProps.location.action === 'POP') { this.clearAdminData(); }
      this.getAdminData(nextProps);
    }
  },

  clearAdminData: function () {
    this.props._removeAdminVProMMsProps();
    this.props._removeFieldRoads();
    this.props._removeAdminRoads();
    this.props._removeFieldVProMMsIdsCount();
    this.props._removeVProMMsIdsCount();
  },

  getAdminData: function (props) {
    const level = !props.params.aaIdSub ? 'province' : 'district';
    const ids = {aaId: props.params.aaId};
    if (level === 'district') { ids['aaIdSub'] = props.params.aaIdSub; }
    const idTest = makeIdTest(props.crosswalk, ids, level);
    const index = (/explore/.test(props.previousLocation) || /road/.test(props.previousLocation)) ? ((props.pagination.clickedPage - 1) * props.pagination.limit) : 0;
    this.props._fetchVProMMsIdsCount(level, idTest);
    this.props._fetchFieldRoads(idTest, level);
    this.props._fetchAdminRoads(idTest, level, 20, index);
    this.props._fetchAdminVProMMsProps(idTest, level, 20, index);
    this.props._fetchAdminInfo(props.params.aaId);
    this.props._removeAdminInfo();
  },

  makeAdminName: function () {
    const level = !this.props.params.aaIdSub ? 'province' : 'district';
    const idFinder = (level === 'province') ? { aaId: this.props.params.aaId } : { aaIdSub: this.props.params.aaIdSub };
    return getAdminName(this.props.crosswalk, idFinder, level, this.props.adminInfo);
  },

  makeAdminAnalyticsContent: function () {
    const level = !this.props.params.aaIdSub ? 'province' : 'district';
    const idFinder = (level === 'province') ? { aaId: this.props.params.aaId } : { aaIdSub: this.props.params.aaIdSub };
    const id = getAdminId(this.props.crosswalk, idFinder, level);
    // TOFIX: HAVE DISTRICT NAMES IN CROSSWALK
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

  renderAdminChildren: function (children, adminContent, level) {
    if (adminContent.level === 'district') {
      return (
        <div/>
      );
    }
    if (this.props.adminInfoFetched) {
      const aaId = this.props.params.aaId;
      // ignore any children not in the crosswalk.
      children = children.filter(child => this.props.crosswalk['district'][child.id] !== undefined);
      // disable child buttons if crosswalk value !== vpromms district id.
      const childClasses = children.map(child => c({'disabled': this.props.crosswalk['district'][child.id] === ''}));
      return (
        <nav className='a-subnav'>
        <h2>{t('Districts')}</h2>
        <ul className='a-children'>
          {children.map((child, i) => {
            var childKey = `${child}-${i}`;
            return (
              <li key={childKey} ><Link className={childClasses[i]} onClick={(e) => { this.clearAdminData(); this.props._setCrossWalk(); this.props._setSubAdminName(child.name_en); }}to={`/${getLanguage()}/analytics/${aaId}/${child.id}`}>{child.name_en}</Link>
            </li>
            );
          })}
        </ul>
        </nav>
      );
    } else {
      return (<div className='a-subnav'><h2 className='a-loading'>Loading Child Admins</h2></div>);
    }
  },

  renderDataDumpLinks: function (adminName) {
    return (
      <div>
        <h3 classNam='a-header'>{t('Admin Chilren')}</h3>
        <a className='bttn bttn-secondary' href={`${config.provinceDumpBaseUrl}${adminName}.csv`}>{t('Download Roads')}</a>
      </div>
    );
  },

  renderTable: function (adminContent) {
    if (adminContent.total && this.props.adminRoadProperties) {
      return (<AATable data={this.props.adminRoads} fieldRoads={this.props.fieldRoads} propertiesData={this.props.adminRoadProperties} />);
    } else if (this.props.VProMMsCount[0]) {
      return (<div className='a-subnav'><h2>Loading Table</h2></div>);
    } else {
      return (<div/>);
    }
  },

  renderAnalyticsAdmin: function () {
    setLanguage(this.props.language);
    const adminContent = this.makeAdminAnalyticsContent();
    return (
      <section>
        <header className='a-header'>
          <div className='a-headline'>
            <h1>{this.props.adminInfoFetched ? this.makeAdminName() : ''}</h1>
          </div>
          {/* completion suggests data exists, in whcih case there is data available for download */}
          <div className='a-head-actions'>
            {/* TODO, remove aaIdSub when sub admin dumps are made. */}
            { adminContent.completion && !this.props.params.aaIdSub ? this.renderDataDumpLinks(this.makeAdminName()) : '' }
          </div>
        </header>
        <div>
          {/* commune (district child) lists are not rendered */}
          { this.renderAdminChildren(this.props.adminInfo.children, adminContent) }
          <div className='a-main__status'>
            <h2><strong>{adminContent.completionMainText}</strong>{adminContent.completionTailText}</h2>
            <div className='meter'>
              <div className='meter__internal' style={{width: `${adminContent.completion}%`}}></div>
            </div>
          </div>
          <div>
            { this.renderTable(adminContent) }
            {((this.props.pagination.pages > 1) && this.props.adminRoadsFetched) ? <Paginator pagination={this.props.pagination} crosswalk={this.props.crosswalk} adminInfo={this.props.adminInfo} params={this.props.params} /> : <div/>}
          </div>
        </div>
      </section>
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
    language: state.language.current,
    VProMMsCount: state.roadIdCount.counts,
    VProMMsCountFetched: state.roadIdCount.fetched,
    pagination: state.pagination,
    previousLocation: state.previousLocation.path,
    subadminName: state.subadminName.name
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
    _setPreviousLocation: (location) => dispatch(setPreviousLocation(location)),
    _setPagination: (paginationConfig) => dispatch(setPagination(paginationConfig)),
    _setSubAdminName: (name) => dispatch(setSubAdminName(name)),
    _updatePagination: (paginationUpdates) => dispatch(updatePagination(paginationUpdates))
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsAA);

