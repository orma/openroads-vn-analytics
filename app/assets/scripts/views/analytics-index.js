'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { t } from '../utils/i18n';
import {
  fetchProvinces,
  fetchVProMMsIdsCount,
  fetchFieldVProMsIdsCount,
  removeVProMMsIdsCount,
  removeProvinces,
  removeCrosswalk,
  setCrossWalk
} from '../actions/action-creators';

import AATable from '../components/aa-table-index';

var AnalyticsIndex = React.createClass({
  displayName: 'AnalyticsIndex',

  propTypes: {
    _fetchProvinces: React.PropTypes.func,
    _fetchFieldVProMsIdsCount: React.PropTypes.func,
    _fetchVProMMsIdsCount: React.PropTypes.func,
    _removeVProMMsIdsCount: React.PropTypes.func,
    _removeCrosswalk: React.PropTypes.func,
    _removeProvinces: React.PropTypes.func,
    _setCrossWalk: React.PropTypes.func,
    provincesFetched: React.PropTypes.bool,
    provinces: React.PropTypes.array,
    crosswalk: React.PropTypes.object,
    crosswalkSet: React.PropTypes.bool,
    params: React.PropTypes.object,
    VProMMsCount: React.PropTypes.array,
    VProMMsCountFetched: React.PropTypes.bool,
    fieldIdCount: React.PropTypes.array,
    fieldCountsFetched: React.PropTypes.bool
  },

  componentWillMount: function () {
    this.props._fetchProvinces();
    this.props._setCrossWalk();
    this.props._fetchVProMMsIdsCount('province');
    this.props._fetchFieldVProMsIdsCount('province');
  },

  componentWillUnmount: function () {
    this.props._removeVProMMsIdsCount();
    this.props._removeCrosswalk();
    this.props._removeProvinces();
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this.props.crosswalkSet === nextProps.crosswalkSet) { return; }
  },

  makeProvinceData: function () {
    // pluck provinces w/vpromms data from provinces fetched from database.
    const vprommsProvinces = Object.keys(this.props.crosswalk.province);
    const provinces = this.props.provinces.filter(province => vprommsProvinces.includes(province.id.toString()));
    // { # of roads with field data, total # of roads }
    return _.map(provinces, (province, key) => {
      const name = this.props.crosswalk.province[province.id].name;
      const id = this.props.crosswalk.province[province.id].id;
      const route = province.id;
      const idTest = new RegExp(id);
      // returns # of total/field roads for a given province.
      let field = this.props.fieldIdCount.filter(
        province => idTest.test(province.admin)
      ).map(province => province.total_roads)[0] || 0;
      let total = this.props.VProMMsCount.filter(
        province => idTest.test(province.admin)
      ).map(province => province.total_roads)[0] || 0;
      const percentageComplete = total ? (field / total).toFixed(2) : 0;
      return {
        name,
        id,
        route,
        field,
        total,
        percentageComplete
      };
    });
  },

  makeCompletionContent: function () {
    // generate totals by adding road counts in VProMMsCount
    let total = this.props.VProMMsCount.reduce((accum, countObj) => { return accum + Number(countObj.total_roads); }, 0);
    let field = this.props.fieldIdCount.reduce((accum, countObj) => { return accum + Number(countObj.total_roads); }, 0);
    let accumulator = { field: field, total: total };
    return { accumulator: accumulator, completion: (accumulator.field / accumulator.total) };
  },

  renderAnalyticsIndex: function () {
    const completionContent = this.makeCompletionContent();
    return (
      <div>
        <div className='a-header'>
          <div className='a-headline'>
            <h1>{t('VProMMS Edits By Province')}</h1>
          </div>
        </div>

        <div className='a-main__status'>
          <h2><strong>{completionContent.completion.toFixed(2)}%</strong> {t('of VProMMS Ids have field data collected')} ({completionContent.accumulator.field} of {completionContent.accumulator.total})</h2>
          <div className='meter'>
            <div className='meter__internal' style={{width: `${completionContent.completion}%`}}></div>
          </div>
        </div>
        <div>
          {this.props.provincesFetched ? <AATable data={this.makeProvinceData()} crosswalk={this.props.crosswalk} /> : (<div>Loading Tables</div>)}
        </div>
      </div>
    );
  },

  render: function () {
    return (this.props.VProMMsCountFetched && this.props.fieldCountsFetched) ? this.renderAnalyticsIndex() : (<div/>);
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    provinces: state.provinces.data.province,
    provincesFetched: state.provinces.fetched,
    fieldIdCount: state.fieldIdCount.counts,
    fieldCountsFetched: state.fieldIdCount.fetched,
    VProMMsCount: state.roadIdCount.counts,
    VProMMsCountFetched: state.roadIdCount.fetched,
    crosswalk: state.crosswalk,
    crosswalkSet: state.crosswalk.set
  };
}

function dispatcher (dispatch) {
  return {
    _fetchProvinces: () => dispatch(fetchProvinces()),
    _fetchVProMMsIdsCount: (level) => dispatch(fetchVProMMsIdsCount(level)),
    _fetchFieldVProMsIdsCount: (level) => dispatch(fetchFieldVProMsIdsCount(level)),
    _removeVProMMsIdsCount: () => dispatch(removeVProMMsIdsCount()),
    _removeCrosswalk: () => dispatch(removeCrosswalk()),
    _removeProvinces: () => dispatch(removeProvinces()),
    _setCrossWalk: () => dispatch(setCrossWalk())
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsIndex);
