import config from '../../config';

export const FETCH_JOB_DATA = 'FETCH_JOB_DATA';

export const fetchJobData = jobData => ({ type: FETCH_JOB_DATA, data: jobData });

export const fetchJob = jobId => (dispatch, getState) => {
  let url = `${config.api}/job/${jobId}`;
  return fetch(url)
    .then(response => {
      if (response.status === 404) {
        throw new Error('No tasks remaining');
      } else if (response.status >= 400) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(jobData => {
      dispatch(fetchJobData(jobData));
    });
};

/**
 * reducer
 */
export default (
  state = {
    data: null
  },
  action
) => {
  switch (action.type) {
    case FETCH_JOB_DATA:
      return Object.assign({}, state, {
        data: action.data
      });
  }
  return state;
};