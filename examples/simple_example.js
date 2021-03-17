
const { FinanceBinaryTree, Constants } = require("../FinanceBinaryTree");
const binaryTree = new FinanceBinaryTree({
  S: 85.370003,
  K: 87,
  r: 0.28 / 100,
  sigma: 58.546 / 100,
  t: 252,
  option: Constants.Options.EUROPEAN.CALL,
});
const root = binaryTree.getRoot();
console.log(root.profit.toString());
binaryTree.exportToExcel();