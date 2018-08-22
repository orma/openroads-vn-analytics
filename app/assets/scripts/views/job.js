import React from 'react';
import {
  compose,
  lifecycle,
  getContext
} from 'recompose';
import {
  fetchJob
} from '../redux/modules/jobs';
import { connect } from 'react-redux';

var Job = React.createClass({
  // propTypes: {
  //   fetchJob: React.PropTypes.func,
  //   language: React.PropTypes.string
  // },
  getInitialState: function () {
    return {
      job: null
    };
  },
  componentWillReceiveProps(nextProps) {
    if (this.props.job !== nextProps.job) {
      this.setState({
        job: nextProps.job,
      });
    }
  },
  render: function () {
    const { params } = this.props;
    const { job } = this.state;
    const id = params.id;
    return (
      <div className='inpage__body'>
        <div className='inner'>
          <h2>Job page - { id }</h2>
          <div>
            <pre>{ job && JSON.stringify(job) }</pre>
          </div>
        </div>
      </div>
    );
  }
});

export default compose(
  connect(
    state => ({
      job: state.jobs.data
    }),
    dispatch => ({
      fetchJob: jobId => dispatch(fetchJob(jobId))
    })
  ),
  lifecycle({
    componentDidMount: function() {
      this.props.fetchJob(this.props.params.id);
    }
  })
)(Job);