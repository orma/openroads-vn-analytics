// TODO generalize sort tables to accept arbitrary columns and attributes
// (combine aa-table-index.js and aa-table-vromms.js into single component)

import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';
import { api } from '../config';
import { Link } from 'react-router';
import { t, getLanguage } from '../utils/i18n';
import { fetchVProMMsBbox } from '../actions/action-creators';

const displayHeader = [
  {key: 'id', value: 'VProMMS ID'},
  {key: 'FieldData', value: 'Field Data'}
];

const AATable = React.createClass({
  displayName: 'AATable',

  propTypes: {
    aaId: React.PropTypes.string,
    data: React.PropTypes.array,
    province: React.PropTypes.string,
    provinceName: React.PropTypes.string,
    routeParams: React.PropTypes.func,
    sources: React.PropTypes.array,
    _fetchVProMMSidsSources: React.PropTypes.func,
    _fetchVProMMsBbox: React.PropTypes.func,
    fetched: React.PropTypes.bool,
    properties: React.PropTypes.object,
    propertiesData: React.PropTypes.object,
    fieldIds: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      sortState: {
        field: 'inTheDatabase',
        order: 'desc',
        expandedId: null
      }
    };
  },

  renderTableHead: function () {
    return (
      <thead>
        <tr>
          {_.map(displayHeader, (d) => {
            let c = classnames('collecticons', {
              'collecticons-sort-none': this.state.sortState.field !== d.key,
              'collecticons-sort-asc': this.state.sortState.field === d.key && this.state.sortState.order === 'asc',
              'collecticons-sort-desc': this.state.sortState.field === d.key && this.state.sortState.order === 'desc'
            });
            return (
              <th key={d.key} onClick={this.sortLinkClickHandler.bind(null, d.key)}>
                <i className={c}></i>
                <span>{t(d.value)}</span>
              </th>
            );
          })}
          <th className='table-properties-head'>Properties</th>
        </tr>
      </thead>
    );
  },

  sortLinkClickHandler: function (field, e) {
    e.preventDefault();
    let {field: sortField, order: sortOrder} = this.state.sortState;
    let order = 'asc';
    // Same field, switch order; different field, reset order.
    if (sortField === field) {
      order = sortOrder === 'asc' ? 'desc' : 'asc';
    }

    this.setState({
      sortState: {
        field,
        order
      }
    });
  },

  handleSort: function () {
    let sorted = _(this.props.data).sortBy(this.state.sortState.field);
    if (this.state.sortState.order === 'desc') {
      sorted = sorted.reverse();
    }
    return sorted.value();
  },

  renderFieldMapButtons: function (vprommExists, id) {
    return (
      <div>
        <Link className='bttn bttn-s bttn-base-light' to={`/${getLanguage()}/analytics/road/${id}/`}>Map</Link>
        <a className='bttn bttn-s bttn-base-light' href={`${api}/field/geometries/${id}?grouped=false&download=true`}>Download</a>
      </div>
    );
  },

  // in renderTableBody, vprommExists represents if a given vpromms id has a field data source attached to it.
  // it is used to decide whether:
  // 1. make a link to the AAFieldMap component in the first column of the table.
  // 2. to a road data dump in the last column
  renderVProMMsLink: function (id) {
    return (
      <Link to={`/${getLanguage()}/explore`} onClick={(e) => { 
        this.props._removeVProMMsidsProperties();
        this.props._removeAdminInfo();
        this.props._fetchVProMMsBbox(id); 
        } }><strong>{id}</strong></Link>
    );
  },

  onPropertiesClick: function (vprommId) {
    let curId = this.state.expandedId;
    let newId = curId === vprommId ? null : vprommId;
    this.setState({expandedId: newId});
  },

  renderTableBody: function () {
    const sorted = this.handleSort(this.props.data);
    return (
      <tbody>
        {_.map(sorted, (vpromm, i) => {
          const vprommFieldInDB = (this.props.fieldIds.indexOf(vpromm) !== -1);
          let propBtnLabel = this.state.expandedId === vpromm ? 'Hide' : 'Show';
          let propBtnClass = classnames('bttn-table-expand', {
            'bttn-table-expand--show': this.state.expandedId !== vpromm,
            'bttn-table-expand--hide': this.state.expandedId === vpromm
          });
          let propContainerClass = classnames('table-properties', {
            'table-properties--hidden': this.state.expandedId !== vpromm
          });
          const roadProps = this.props.propertiesData[vpromm];
          return (
            <tr key={vpromm} className={classnames({'alt': i % 2})}>
              <th>{ this.renderVProMMsLink(vpromm) }</th>
              <td className={classnames({'added': vprommFieldInDB, 'not-added': !vprommFieldInDB})}>{ vprommFieldInDB ? this.renderFieldMapButtons(vprommFieldInDB, vpromm) : ''}</td>
              <td className='table-properties-cell'>
                <button type='button' className={propBtnClass} onClick={this.onPropertiesClick.bind(null, vpromm)}><span>{propBtnLabel}</span></button>
                <div className={propContainerClass}>
                  <dl className='table-properties-list'>
                    <dt>Admin Level</dt>
                    <dd>{roadProps.or_responsibility ? roadProps.or_responsibility : '' }</dd>
                    <dt>Road Length</dt>
                    <dd>{roadProps.length ? `${roadProps.length.toFixed(2)} km` : ''}</dd>
                    <dt>Mean IRI</dt>
                    <dd>{roadProps.iri_mean ? roadProps.iri_mean.toFixed(2) : ''}</dd>
                  </dl>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  },

  render: function () {
    return (
      <div className='table'>
        <table>
          {this.renderTableHead()}
          {this.renderTableBody()}
        </table>
      </div>
    );
  }
});

function selector (state) {
  return {
    properties: state.VProMMsidProperties.properties,
    fieldIds: state.fieldVProMMsids.ids
  };
}

function dispatcher (dispatch) {
  return {
    _fetchVProMMsBbox: (id, source) => dispatch(fetchVProMMsBbox(id, source))
  };
}

export default connect(selector, dispatcher)(AATable);

