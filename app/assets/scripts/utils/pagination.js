
/**
 * given range and road per page limit, makes config needed for analytics table pagination
 * @func makePaginationConfig
 * @param numRoads {number} number of roads needing pagination
 * @param limit {number} limit to number of roads per page
 * @return {object} new paginationConfig
 */
exports.makePaginationConfig = function (numRoads, limit, page) {
  const index = page ? page * limit : 0;
  page = page || 1;
  return {
    currentPage: page,
    clickedPage: page,
    currentIndex: index,
    limit: limit,
    pages: Math.ceil(numRoads / limit)
  };
};
