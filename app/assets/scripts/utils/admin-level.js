
/**
 * given crosswalk, adminInfo, aaId, returns idTest used in api query
 * @func makeIdTest
 * @param {object} crosswalk object to translate between admin boundaries and vpromms ids
 * @param {object} adminInfo object with current admin info
 * @param {number} aaId current admin id
 * @return {array} idTest
 */
export function makeIdTest (crosswalk, adminInfo, aaId, level) {
  let idTest = [];
  if (level === 'province') {
    const adminId = crosswalk[level][aaId].id;
    idTest.push(adminId);
  }
  if (level === 'district') {
    const parentId = aaId.length === 5 ? crosswalk['province'][adminInfo.id].id : crosswalk['province'][adminInfo.parent.id].id;
    const adminId = crosswalk[level][aaId];
    idTest.push(parentId);
    idTest.push(adminId);
  }
  return idTest;
}

/**
 * given crosswalk, aaId, and admin level, returns its id
 * @param {object} crosswalk object to translate between admin boundaries and vpromms ids
 * @param {number} aaId current admin id
 * @param {string} level admin level, district or province
 * @return admin id
 */
export function getAdminId (crosswalk, aaId, level) {
  if (level === 'province') {
    return crosswalk[level][aaId].id;
  } else {
    return crosswalk[level][aaId];
  }
}

/**
 * given crosswalk, aaid, level, and adminInfo object, returns admin name
 * @param {object} crosswalk object to translate between admin boundaries and vpromms ids
 * @param {number} aaId current admin id
 * @param {string} level admin level, district or province
 * @param {object} adminInfo object with current admin info
 * @return admin name
 */
export function getAdminName (crosswalk, aaId, level, adminInfo) {
  if (level === 'province') {
    return crosswalk[level][aaId].name;
  } else {
    return adminInfo.name_en;
  }
}
