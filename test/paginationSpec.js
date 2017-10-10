var chai = require('chai');
var expect = chai.expect;
var pagination = require('../app/assets/scripts/utils/pagination');

describe('makePaginationConfig', function () {
  var makePaginationConfig = pagination.makePaginationConfig;
  var numRoads = 934;
  var limit = 50;
  it('should return initial pagination config object', function () {
    var paginationConfig = makePaginationConfig(numRoads, limit);
    expect(paginationConfig.currentIndex).to.be.equal(0);
    expect(paginationConfig.pages).to.be.equal(19);
  });
  it('should set index and current page based on page parameter', function () {
    var page = 3;
    var paginationConfig = makePaginationConfig(numRoads, limit, page);
    expect(paginationConfig.currentIndex).to.be.equal(150);
    expect(paginationConfig.currentPage).to.be.equal(3);
    expect(paginationConfig.pages).to.be.equal(19);
    expect(paginationConfig.limit).to.be.equal(50);
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
    var newDownPage = newIndex('down', pageJump, limit, index);
    expect(newDownPage).to.be.equal(60);
  });
});

describe('newPage', function () {
  var indexJump = 30;
  var limit = 5;
  var page = 20;
  var newPage = pagination.newPage;
  it('should return new page above current index', function () {
    var newUpPage = newPage('up', indexJump, limit, page);
    expect(newUpPage).to.be.equal(26);
  });
  it('should return new index below current index', function () {
    var newDownPage = newPage('down', indexJump, limit, page);
    expect(newDownPage).to.be.equal(14);
  });
});

