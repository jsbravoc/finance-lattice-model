/**
 * https://github.com/jsbravoc/finance-lattice-model
 * @description Calculates a Finance Lattice Model.
 * @author Juan Sebastián Bravo <js.bravo@uniandes.edu.co>
 */

const ExcelJS = require('exceljs');
const { Node } = require('./Node');
const Constants = require('./Constants');
const Decimal = require("decimal.js");

/** Class representing a Finance Lattice Model */
module.exports = class FinanceLatticeModel {
  /**
   * Create a Weighted (Un)directed Graph.
   * @param {Number} [S] - The current price of the stock (S0)
   * @param {Number} [K] - The strike price of the option (also called exercise price).
   * @param {Number} [r] - The risk free rate.
   * @param {Number} [sigma] - The volatility rate of the stock.
   * @param {Number} [periods] - The periods or iterations of the binary tree
   * @param {String} [option] - The option to evaluate. @see Constants.Options;
   * @param {String} [defined_dt] - Defined time delta to use (by default is 1/periods).
   * @param {String} [defined_u] - Defined up multiplier to use (by default is e^(sigma * sqrt(dt))).
   * @param {String} [defined_a] - Defined a multiplier to use (by default is e^(sigma * dt)).
   * @param {String} [defined_d] - Defined down multiplier to use (by default is 1/u === e^(-sigma * sqrt(dt))).
   * @param {String} [defined_p] - Defined up probability multiplier to use (by default is ( a - d ) / (u - d) ).
   * @returns {FinanceLatticeModel} - The instance of the class.
   */
  constructor({
    S = 50,
    K = 100,
    r = 0.02,
    sigma = 0.1,
    periods = 252,
    option = Constants.Options.EUROPEAN.PUT,
    defined_dt = null,
    defined_u = null,
    defined_a = null,
    defined_d = null,
    defined_p = null,
  } = {}) {
    this.nodesByLevel = {};

    const root = new Node(S);
    this.nodesByLevel["0"] = [root];

    const dt = defined_dt ? Decimal(defined_dt) : Decimal(1).dividedBy(periods);
    const a = defined_a
      ? Decimal(defined_a)
      : Decimal(1).naturalExponential().toPower(Decimal(r).times(dt));
    const u = defined_u
      ? Decimal(defined_u)
      : Decimal(1)
          .naturalExponential()
          .toPower(Decimal(sigma).times(dt.squareRoot()));
    const d = defined_d ? Decimal(defined_d) : Decimal(1).dividedBy(u);
    const p = defined_p ? Decimal(defined_p) : a.minus(d).dividedBy(u.minus(d));

    this.createTreeNodes(u, d, periods);
    this.setTreeProfit(option, K, p, r, dt);
  }

  /**
   * Returns the root of the tree.
   * @return {Node} - The root of the tree.
   */
  getRoot() {
    return this.nodesByLevel[0][0];
  }

  /**
   * Iterate algorithm to calculate the price of the option. Starting from the end (last period), calculates the node's price until T = 0
   * @param {String} option - The option to evaluate. @see Constants.Options;
   * @param {Number} K - The strike price of the option.
   * @param {Number} p - The probability for the price to go up.
   * @param {Number} r - The risk free rate.
   * @param {Number} dt - Time delta (1 / number of periods).
   */
  setTreeProfit(option, K, p, r, dt) {
    const lastLevel = Object.keys(this.nodesByLevel).length - 1;
    for (let index = lastLevel; index >= 0; index--) {
      const arrayOfNodes = this.nodesByLevel[index];
      arrayOfNodes.forEach((node) => {
        node.setProfit(option, K, p, r, dt);
      });
    }
  }

  /**
   * Recursive algorithm to create the binary tree and find the price of the option.
   * @param {Number} u - The factor or multiplier by which the price will increase (up)
   * @param {Number} d - The factor or multiplier by which the price will decrease (down)
   * @param {Number} maxIterations - The maximum number of iterations or periods to calculate.
   * @param {Number} [currentIndex] - The current number of iterations or periods to calculate. Used to stop the recursive algorithm.
   */

  createTreeNodes(u, d, maxIterations, currentIndex = 0) {
    if (
      currentIndex === maxIterations ||
      Object.keys(this.nodesByLevel).length > maxIterations
    ) {
      return true;
    }
    if (Array.isArray(this.nodesByLevel[currentIndex])) {
      for (
        let index = 0;
        index < this.nodesByLevel[currentIndex].length;
        index++
      ) {
        if (
          this.nodesByLevel[currentIndex + 1] == null ||
          !Array.isArray(this.nodesByLevel[currentIndex + 1])
        ) {
          this.nodesByLevel[currentIndex + 1] = [];
        }
        const node = this.nodesByLevel[currentIndex][index];
        const sibling = this.nodesByLevel[currentIndex][index - 1];
        const children = node.addChildrenPair(u, d, currentIndex + 1, sibling);

        if (
          !this.nodesByLevel[currentIndex + 1].find(
            (node) => node.id === children[Constants.Node.UP].id
          )
        ) {
          this.nodesByLevel[currentIndex + 1].push(children[Constants.Node.UP]);
        }
        if (
          !this.nodesByLevel[currentIndex + 1].find(
            (node) => node.id === children[Constants.Node.DOWN].id
          )
        ) {
          this.nodesByLevel[currentIndex + 1].push(
            children[Constants.Node.DOWN]
          );
        }
      }
    }
    this.createTreeNodes(u, d, maxIterations, currentIndex + 1);
  }

  // #region UTILITY METHODS
  /**
   * Returns a dictionary with the attribute value of the nodes of an level.
   * Used to export to Excel @see exportToExcel
   * @param {Number} index - The level of the log, compared to this.loggingLevels.
   * @param {String} attribute - The message of the log (String or Object).
   * @returns {Object} Dictionary with the value of the attribute of the node for all periods.
   */

  getContiguousValues(index, attribute) {
    const obj = {};
    for (const level in this.nodesByLevel) {
      if (Object.hasOwnProperty.call(this.nodesByLevel, level)) {
        if (this.nodesByLevel[level][index]) {
          if (this.nodesByLevel[level][index][attribute].toString) {
            obj[level] = this.nodesByLevel[level][index][attribute].toString();
          } else obj[level] = this.nodesByLevel[level][index][attribute] + "";
        }
      }
    }
    return obj;
  }

  /**
   * Exports tree to Excel (values only)
   * @pre A tree exists and its values (option and pricing) are calculated.
   * @post A new Excel file is created "by default with name export.xlsx"
   * @throws {Error} If the tree is empty.
   */
  exportToExcel() {
    if (Object.keys(this.nodesByLevel).length === 0) {
      throw new Error("Tree is empty");
    } else {
      const workbook = new ExcelJS.Workbook();
      const wsPrice = workbook.addWorksheet("Exported price tree");
      const columns = [{ header: "T", key: "T" }];
      for (const level in this.nodesByLevel) {
        if (Object.hasOwnProperty.call(this.nodesByLevel, level)) {
          columns.push({ header: `${level}`, key: `${level}` });
        }
      }
      wsPrice.columns = columns;
      for (
        let index = 0;
        index <
        this.nodesByLevel[Object.keys(this.nodesByLevel).length - 1].length;
        index++
      ) {
        wsPrice.addRow(this.getContiguousValues(index, "profit"));
      }

      const wsValue = workbook.addWorksheet("Exported value tree");
      wsValue.columns = columns;
      for (
        let index = 0;
        index <
        this.nodesByLevel[Object.keys(this.nodesByLevel).length - 1].length;
        index++
      ) {
        wsValue.addRow(this.getContiguousValues(index, "value"));
      }

      workbook.xlsx.writeFile("exportedTree.xlsx");
      require("open")("exportedTree.xlsx");
    }
  }

  // #endregion
};
