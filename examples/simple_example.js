// const { Node, Constants } = require("../FinanceBinaryTree");
// const printTree = require('print-tree');
// const ExcelJS = require('exceljs');

// const nodesByLevel = {};

// const getContiguousValues = (index, attribute) => {
//   const obj = {}
//   for (const level in nodesByLevel) {
//     if (Object.hasOwnProperty.call(nodesByLevel, level)) {
//       if (nodesByLevel[level][index]) {
//         obj[level] = nodesByLevel[level][index][attribute];
//       }
        
//       }
//   }
//   return obj;

// }
// const exportToExcel = () => {
//   if (Object.keys(nodesByLevel).length === 0) {
//     throw new Error("Tree is empty");
//   }
//   else {
//     const workbook = new ExcelJS.Workbook();
//     const ws = workbook.addWorksheet('My Sheet');
//     const columns = [{ header: "T", key: "T" }];
//     for (const level in nodesByLevel) {
//       if (Object.hasOwnProperty.call(nodesByLevel, level)) {
//         columns.push({ header: `${level}`, key: `${level}`});
//       }
//     }

//     ws.columns = columns;

//     console.log(nodesByLevel);
//     console.log(Object.keys(nodesByLevel).length);
//     console.log(nodesByLevel[Object.keys(nodesByLevel).length - 1].length);
//     for (let index = 0; index < nodesByLevel[Object.keys(nodesByLevel).length - 1].length; index++) {
//       ws.addRow(getContiguousValues(index, "profit"));
      
//     }

//     workbook.xlsx.writeFile('export.xlsx');
//   }
// }
// const nodeArrayToStringArray = (array, attribute) => {
//   const responseArray = [];
//   array.forEach(node => {
//     responseArray.push(node[attribute]);
//   })
//   return responseArray;
// }

// const setTreeProfit = (K, option, p, r, dt) =>
// {
//   const lastLevel = Object.keys(nodesByLevel).length - 1;
//   for (let index = lastLevel; index >= 0; index--) {
//     const arrayOfNodes = nodesByLevel[index];
//     arrayOfNodes.forEach(node => {
//         node.setProfit(option, K, p, r, dt)
//       });  
//   }
// }



// // setTreeProfit(node, 52, Constants.Options.EUROPEAN.PUT, 0.6282, 0.05, 1);



// // printTree(node,
// // node => node.name + " " + node.profit,
// //   node => node.children)


// const createTreeNodes = (u, d, maxIterations, currentIndex = 0) => {
//   if (currentIndex === maxIterations || Object.keys(nodesByLevel).length > maxIterations) {
//     return true;
//   }
//   if (Array.isArray(nodesByLevel[currentIndex])) {
    
//     for (let index = 0; index < nodesByLevel[currentIndex].length; index++) {
//        if (nodesByLevel[currentIndex + 1] == null || !Array.isArray(nodesByLevel[currentIndex + 1])) { 
//         nodesByLevel[currentIndex + 1] = [];
//       }
//       const node = nodesByLevel[currentIndex][index];
//       const sibling = nodesByLevel[currentIndex][index - 1];
//       const children = node.addChildrenPair(u, d, currentIndex + 1, sibling);
     
//       if (children[Constants.Node.UP] == null || children[Constants.Node.DOWN] == null) {
//         console.log("DEBUG")
//       }
//       if(!nodesByLevel[currentIndex + 1].find(node => node.id === children[Constants.Node.UP].id))
//         nodesByLevel[currentIndex + 1].push(children[Constants.Node.UP]);
//       if(!nodesByLevel[currentIndex + 1].find(node => node.id === children[Constants.Node.DOWN].id))
//         nodesByLevel[currentIndex + 1].push(children[Constants.Node.DOWN]);
//     }
//   }
//   createTreeNodes(u, d, maxIterations, currentIndex + 1);
// }

// const root = new Node(85.37);
// nodesByLevel["0"] = [root];
// const createTree = (S, K, r, sigma, maxIterations) =>
// {
//    const dt = 1 / maxIterations;
//   const a = Math.exp(r * dt);
//   const u = Math.exp(sigma * Math.sqrt(dt));
//   const d = 1 / u;
//   const p = (a - d) / (u - d);
//   createTreeNodes(u, d, maxIterations)
//   setTreeProfit(K, Constants.Options.EUROPEAN.CALL, p, 0.28 / 100, dt);
//   return root;
// }

// const getChildrenOfNode = (node) => 
//    node.getChildren();
// const getNameOfNode = (node) => node.getName();
// const node = createTree(85.37, 87, 0.28 / 100, 58.546 / 100, 252);
// console.log(node);
// console.log(node);
// console.log(node);
// exportToExcel();
// console.log("TEST")

const { FinanceBinaryTree, Constants } = require("../FinanceBinaryTree");
const bt = new FinanceBinaryTree({ S: 85.37, K: 87, r: 0.28 / 100, sigma: 58.546 / 100, t: 252, option: Constants.Options.EUROPEAN.CALL })
bt.exportToExcel();