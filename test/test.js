const should = require("chai").should();
const Decimal = require("decimal.js")
const { expect } = require("chai");
const { FinanceLatticeModel, Constants } = require("../FinanceLatticeModel");
describe("FinanceLatticeModel manipulation", function () {
  describe("Node manipulation", function () {});

  describe("Finance Lattice Model Algorithms", function () {
    describe("American Call Price", function () {
      it("The price should be equal to theoretical price (Feb 16)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 50,
          K: 52,
          r: 5 / 100,
          sigma: 40 / 100,
          periods: 2,
          defined_dt: 1,
          option: Constants.Options.AMERICAN.CALL,
        });
        const expectedResult = Decimal("11.533879366212446732");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      });
      it("The price should be equal to theoretical price (https://www.blackwellpublishing.com/content/kolb5thedition/chapter_15_solution.pdf)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 120,
          K: 110,
          r: 10 / 100,
          sigma: 40 / 100,
          periods: 4,
          defined_dt: 1 / 12,
          defined_u: 1.1215,
          defined_d: 0.8917,
          defined_p: 0.5073,
          option: Constants.Options.AMERICAN.CALL,
        });
        const expectedResult = Decimal("18.93126778848751164");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      });
    });
    describe("American Put Price", function () {
      it("The price should be equal to theoretical price (https://www.blackwellpublishing.com/content/kolb5thedition/chapter_15_solution.pdf)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 120,
          K: 110,
          r: 10 / 100,
          sigma: 40 / 100,
          periods: 4,
          defined_dt: 1 / 12,
          defined_u: 1.1215,
          defined_d: 0.8917,
          defined_p: 0.5073,
          option: Constants.Options.AMERICAN.PUT,
        });
        const expectedResult = Decimal("5.4737603193133238377");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      });
    });
    describe("European Put Price", function () {
      it("The price should be equal to theoretical price (Feb 23)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 134.18,
          K: 140,
          r: 0.3005 / 100,
          sigma: 37.06 / 100,
          periods: 12,
          option: Constants.Options.EUROPEAN.PUT,
        });
        const expectedResult = Decimal("23.034627658098041708");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      });
      it("The price should be equal to theoretical price (Feb 23)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 134.18,
          K: 140,
          r: 0.3005 / 100,
          sigma: 37.06 / 100,
          periods: 252,
          option: Constants.Options.EUROPEAN.PUT,
        });
        const expectedResult = Decimal("22.927829447158824023");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      }).timeout(10000);
    });
    describe("European Call Price", function () {
      it("The price should be equal to theoretical price (Feb 16)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 50,
          K: 52,
          r: 5 / 100,
          sigma: 40 / 100,
          periods: 2,
          defined_dt: 1,
          option: Constants.Options.EUROPEAN.CALL,
        });
        const expectedResult = Decimal("11.533879366212446732");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      });
      it("The price should be equal to theoretical price (Feb 23)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 134.18,
          K: 140,
          r: 0.3005 / 100,
          sigma: 37.06 / 100,
          periods: 12,
          option: Constants.Options.EUROPEAN.CALL,
        });
        const expectedResult = Decimal("17.634696189027902431");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      });
      it("The price should be equal to theoretical price (Feb 23)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 134.18,
          K: 140,
          r: 0.3005 / 100,
          sigma: 37.06 / 100,
          periods: 252,
          option: Constants.Options.EUROPEAN.CALL,
        });
        const expectedResult = Decimal("17.527897978088676155");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      }).timeout(10000);
      it("The price should be equal to theoretical price (HW)", function () {
        const binaryTree = new FinanceLatticeModel({
          S: 85.370003,
          K: 87,
          r: 0.28 / 100,
          sigma: 58.546 / 100,
          periods: 252,
          option: Constants.Options.EUROPEAN.CALL,
        });
        const expectedResult = Decimal("19.14132688430056051");
        const root = binaryTree.getRoot();
        root.profit.equals(expectedResult).should.equal(true);
      }).timeout(10000);
    });
  });
});

