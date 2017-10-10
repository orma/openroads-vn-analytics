
/**
 * given range and road per page limit, makes config needed for analytics table pagination
 * @func makePaginationConfig
 * @param numRoads {number} number of roads needing pagination
 * @param limit {number} limit to number of roads per page
 * @return {object} new paginationConfig
 */
exports.makePaginationConfig = function (numRoads, limit, page) {
  const index = page ? page * limit : 0;
  page = page || 0;
  return {
    currentPage: page,
    currentIndex: index,
    pages: Math.ceil(numRoads / limit)
  };
};

/**
 * given the direction, number of pages changing, and current index, returns a new index
 * @func newIndex
 * @param pageDirection {string} direction (plus or minus) from current index to new index
 * @param pageJump {number} number of pages between current page and next page
 * @param limit {number} number of roads per page
 * @param index {number} current index
 * @return {number} new calculated index
 */
exports.newIndex = function (pageDirection, pageJump, limit, currentIndex) {
  const absoluteJump = (pageJump * limit);
  if (pageDirection === 'up') {
    return currentIndex + absoluteJump;
  } else if (pageDirection === 'down') {
    return currentIndex - absoluteJump;
  } else {
    throw new Error('pageDirection must be set to either up or down.');
  }
};

exports.newPage = function (pageDirection, indexJump, limit, currentPage) {
  const absoluteJump = (indexJump / limit);
  if (pageDirection === 'up') {
    return currentPage + absoluteJump;
  } else if (pageDirection === 'down') {
    return currentPage - absoluteJump;
  } else {
    throw new Error('pageDirection must be set to either up or down.'); 
  }
}
