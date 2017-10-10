
/**
 * given range and road per page limit, makes config needed for analytics table pagination
 * @func makePaginationConfig
 * @param numRoads {number} number of roads needing pagination
 * @param limit {number} limit to number of roads per page
 */
exports.makePaginationConfig = function (numRoads, limit, page) {
  const index = page ? page * limit : 0;
  page = page || 0;
  return {
    currentPage: page,
    index: index,
    pages: Math.ceil(numRoads / limit)
  };
};
