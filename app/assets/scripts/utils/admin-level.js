
/**
 * given crosswalk, adminInfo, aaId, returns idTest used in api query
 * @func makeIdTest
 * @param {object} crosswalk object to translate between admin boundaries and vpromms ids
 * @param {object} adminInfo object with current admin info
 * @param {number} aaId current admin id
 * @return {array} idTest
 */
export function makeIdTest (crosswalk, ids, level) {
  let idTest = [];
  if (level === 'province') {
    const adminId = crosswalk[level][ids.aaId].id;
    idTest.push(adminId);
  }
  if (level === 'district') {
    const parentId = crosswalk['province'][ids.aaId].id;
    const adminId = crosswalk[level][ids.aaIdSub];
    idTest.push(parentId);
    idTest.push(adminId);
  }
  return idTest;
}

/**
 * given crosswalk, aaId, and admin level, returns its id
 * @param {object} crosswalk object to translate between admin boundaries and vpromms ids
 * @param {number} aaId current admin id
 * @return admin id
 */
export function getAdminId (crosswalk, idFinder, level) {
  if (level === 'province') {
    return crosswalk[level][idFinder.aaId].id;
  } else {
    return crosswalk[level][idFinder.aaIdSub];
  }
}

/**
 * given crosswalk, aaid, level, and adminInfo object, returns admin name
 * @param {object} crosswalk object to translate between admin boundaries and vpromms ids
 * @param {number} aaId current admin id
 * @param {string} level admin level, district or province
 * @return admin name
 */
export function getAdminName (crosswalk, idFinder, level, adminInfo) {
  if (level === 'province') {
    return crosswalk[level][idFinder.aaId].name;
  } else {
    return adminInfo.children.find(child => child.id === Number(idFinder.aaIdSub)).name_en;
  }
}
