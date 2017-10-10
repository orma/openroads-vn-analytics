'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { t } from '../utils/i18n';
import { fetchProvinces, fetchVProMMsIdsCount, fetchFieldVProMsIdsCount } from '../actions/action-creators';

import AATable from '../components/aa-table-index';

var AnalyticsIndex = React.createClass({
  displayName: 'AnalyticsIndex',

  propTypes: {
    _fetchProvinces: React.PropTypes.func,
    _fetchFieldVProMsIdsCount: React.PropTypes.func,
    _fetchVProMMsIdsCount: React.PropTypes.func,
    _setCrossWalk: React.PropTypes.func,
    provincesFetched: React.PropTypes.bool,
    provinces: React.PropTypes.array,
    crosswalk: React.PropTypes.object,
    params: React.PropTypes.object,
    VProMMsCount: React.PropTypes.array,
    VProMMsCountFetched: React.PropTypes.bool,
    fieldIdCount: React.PropTypes.array,
    fieldCountsFetched: React.PropTypes.bool
  },

  componentWillMount: function () {
    this.props._fetchProvinces();
    this.props._fetchVProMMsIdsCount('province');
    this.props._fetchFieldVProMsIdsCount('province');
  },

  renderAnalyticsIndex: function () {
    // pluck provinces w/vpromms data from provinces fetched from database.
    const vprommsProvinces = Object.keys(this.props.crosswalk.province);
    const provinces = this.props.provinces.filter(province => vprommsProvinces.includes(province.id.toString()));
    // generate totals by adding road counts in VProMMsCount
    let total = this.props.VProMMsCount.reduce((accum, countObj) => { return accum + Number(countObj.total_roads); }, 1);
    let field = this.props.VProMMsCount.reduce((accum, countObj) => { return accum + Number(countObj.total_roads); }, 1);
    // { # of roads with field data, total # of roads }
    let accumulator = { field: total, total: field };
    const provinceData = _.map(provinces, (province, key) => {
      const name = province.name_en;
      const id = this.props.crosswalk.province[province.id];
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
    const completion = (accumulator.field / accumulator.total) * 100;
    return (
      <div>
        <div className='a-header'>
          <div className='a-headline'>
            <h1>{t('VProMMS Edits By Province')}</h1>
          </div>
        </div>

        <div className='a-main__status'>
          <h2><strong>{completion.toFixed(2)}%</strong> {t('of VProMMS Ids have field data collected')} ({field.toLocaleString()} of {total.toLocaleString()})</h2>
          <div className='meter'>
            <div className='meter__internal' style={{width: `${completion}%`}}></div>
          </div>
        </div>
        <div>
          <AATable data={provinceData} crosswalk={this.props.crosswalk} />
        </div>
      </div>
    );
  },

  render: function () {
    return this.props.provincesFetched ? this.renderAnalyticsIndex() : (<div/>);
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
    VProMMsCountFetched: state.VProMMsidProperties.fetched
  };
}

function dispatcher (dispatch) {
  return {
    _fetchProvinces: () => dispatch(fetchProvinces()),
    _fetchVProMMsIdsCount: (level) => dispatch(fetchVProMMsIdsCount(level)),
    _fetchFieldVProMsIdsCount: (level) => dispatch(fetchFieldVProMsIdsCount(level))
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsIndex);
