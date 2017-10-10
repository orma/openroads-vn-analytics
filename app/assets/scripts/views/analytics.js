'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { setCrossWalk } from '../actions/action-creators';

var Analytics = React.createClass({
  displayName: 'Analytics',

  propTypes: {
    _setCrossWalk: React.PropTypes.func,
    fieldVProMMsids: React.PropTypes.array,
    children: React.PropTypes.object,
    crosswalk: React.PropTypes.object,
    params: React.PropTypes.object,
    VProMMSids: React.PropTypes.object
  },

  componentWillMount: function () {
    this.props._setCrossWalk();
  },

  render: function () {
    return (
      <section classNmae='page'>
        <div className='page__body aa'>
          <div className='aa-main'>
            {React.cloneElement(this.props.children, {crosswalk: this.props.crosswalk, VProMMSids: this.props.VProMMSids})}
          </div>
        </div>
      </section>
    );
  }
});

function selector (state) {
  return {
    crosswalk: state.crosswalk
  };
}

function dispatcher (dispatch) {
  return {
    _setCrossWalk: () => dispatch(setCrossWalk())
  };
}

module.exports = connect(selector, dispatcher)(Analytics);
