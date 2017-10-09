'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { t } from '../utils/i18n';
import { fetchProvinces, fetchVProMMsidsProperties, fetchFieldVProMMsids } from '../actions/action-creators';

import AATable from '../components/aa-table-index';

var AnalyticsIndex = React.createClass({
  displayName: 'AnalyticsIndex',

  propTypes: {
    _fetchProvinces: React.PropTypes.func,
    _fetchVProMMsids: React.PropTypes.func,
    _fetchVProMMsidsProperties: React.PropTypes.func,
    _fetchFieldVProMMsids: React.PropTypes.func,
    _setCrossWalk: React.PropTypes.func,
    provincesFetched: React.PropTypes.bool,
    VProMMsFetched: React.PropTypes.bool,
    provinces: React.PropTypes.array,
    crosswalk: React.PropTypes.object,
    params: React.PropTypes.object,
    VProMMSids: React.PropTypes.object,
    VProMMs: React.PropTypes.object,
    fieldIds: React.PropTypes.array,
    fieldIdsFetched: React.PropTypes.bool
  },

  componentWillMount: function () {
    this.props._fetchProvinces();
    this.props._fetchFieldVProMMsids();
    this.props._fetchVProMMsidsProperties();
  },

  renderAnalyticsIndex: function () {
    // pluck provinces w/vpromms data from provinces fetched from database.
    const vprommsProvinces = Object.keys(this.props.crosswalk.province);
    const provinces = this.props.provinces.filter(province => vprommsProvinces.includes(province.id.toString()));
    // { # of roads with field data, total # of roads }
    let accumulator = { field: this.props.fieldIds.length, total: Object.keys(this.props.VProMMs).length };
    const provinceData = _.map(provinces, (province, key) => {
      const name = province.name_en;
      const id = this.props.crosswalk.province[province.id];
      const route = province.id;
      const idTest = new RegExp(id);
      const field = this.props.fieldIds.filter(vpromm => idTest.test(vpromm.substring(0, 2))).length;
      const total = Object.keys(this.props.VProMMs).filter(vpromm => idTest.test(vpromm.substring(0, 2))).length;
      const percentageComplete = (field / total).toFixed(2);
      return {
        name,
        id,
        route,
        field,
        total,
        percentageComplete
      };
    });
    const { field, total } = accumulator;
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
          <AATable data={provinceData} crosswalk={this.props.crosswalk} vpromms={this.props.VProMMSids} />
        </div>
      </div>
    );
  },

  render: function () {
    const allFetched = (this.props.provincesFetched && this.props.VProMMsFetched && this.props.fieldIdsFetched);
    return allFetched ? this.renderAnalyticsIndex() : (<div/>);
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    provinces: state.provinces.data.province,
    provincesFetched: state.provinces.fetched,
    VProMMs: state.VProMMsidProperties.properties,
    VProMMsFetched: state.VProMMsidProperties.fetched,
    fieldIds: state.fieldVProMMsids.ids,
    fieldIdsFetched: state.fieldVProMMsids.fetched
  };
}

function dispatcher (dispatch) {
  return {
    _fetchProvinces: () => dispatch(fetchProvinces()),
    _fetchVProMMsidsProperties: () => dispatch(fetchVProMMsidsProperties()),
    _fetchFieldVProMMsids: () => dispatch(fetchFieldVProMMsids())
  };
}

module.exports = connect(selector, dispatcher)(AnalyticsIndex);
