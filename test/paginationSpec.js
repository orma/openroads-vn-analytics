var chai = require('chai');
var expect = chai.expect;
var pagination = require('../app/assets/scripts/utils/pagination');

describe('makePaginationConfig', function () {
  var makePaginationConfig = pagination.makePaginationConfig;
  var numRoads = 934;
  var limit = 50;
  it('should return initial pagination config object', function () {
    var paginationConfig = makePaginationConfig(numRoads, limit);
    expect(paginationConfig.index).to.be.equal(0);
    expect(paginationConfig.pages).to.be.equal(19);
  });
  it('should set index and current page based on page parameter', function () {
    var page = 3;
    var paginationConfig = makePaginationConfig(numRoads, limit, page);
    expect(paginationConfig.index).to.be.equal(150);
    expect(paginationConfig.currentPage).to.be.equal(3);
    expect(paginationConfig.pages).to.be.equal(19);
  });
});

describe('newIndex', function () {
  var pageJump = 2;
  var limit = 20;
  var index = 100;
  var newIndex = pagination.newIndex;
  it('should return new index above current index', function () {
    var newUpIndex = newIndex('up', pageJump, limit, index);
    expect(newUpIndex).to.be.equal(140);
  });
  it('should return new index below current index', function () {
    var newUpIndex = newIndex('down', pageJump, limit, index);
    expect(newUpIndex).to.be.equal(60);
  });
});

