
const { FinanceLatticeModel, Constants } = require("../FinanceLatticeModel");
const binaryTreeAmericanCall = new FinanceLatticeModel({
  S: 5773.0772501,
  K: 6000,
  r: 1.75 / 100,
  sigma: 0.29372016,
  t: 252,
  option: Constants.Options.AMERICAN.CALL,
});
let root = binaryTreeAmericanCall.getRoot();
console.log(root.profit.toString());
binaryTreeAmericanCall.exportToExcel("Punto4_AmericanCall");

const binaryTreeAmericanPut = new FinanceLatticeModel({
  S: 5773.0772501,
  K: 6000,
  r: 1.75 / 100,
  sigma: 0.29372016,
  t: 252,
  option: Constants.Options.AMERICAN.PUT,
});
root = binaryTreeAmericanPut.getRoot();
console.log(root.profit.toString());
binaryTreeAmericanPut.exportToExcel("Punto4_AmericanPut");
