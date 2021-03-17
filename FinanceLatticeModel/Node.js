const Constant = require("./Constants");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const Decimal = require('decimal.js');

/** Class representing a Node in the Binary Tree*/
module.exports = {
  Node: class Node {
    /**
     * Create a Node.
     * @param {String} name - The unique name of the node.
     * @param {Object} value - An object that contains values to represent the tree.
     * @param {Object} children - Dictionary {UP: Node, DOWN: Node} of the children nodes.
     */
    constructor(name, value, children, level = 0) {
      this.id = uuidv4();
      this.name = name;
      if (value == null) {
        const nameAsValue = Number(name);
        if (Number.isNaN(nameAsValue)) {
          throw new Error(`Node ${name} has no value`);
        }
        value = Decimal(nameAsValue);
      }
      this.value = value;

      this.children = children || { UP: null, DOWN: null };
      if (
        this.hasChildren() &&
        Decimal(this.children.UP.value).greaterThan(Decimal(this.children.DOWN.value))
      ) {
        this.children = { UP: this.children.DOWN, DOWN: this.children.UP };
      }
      this.level = level;
    }

    /**
     * Returns true or false depending if the Node has defined Children.
     * @param {boolean} - True if the Node has defined both children.
     */
    hasChildren() {
      return (
        !_.isEmpty(this.children) &&
        this.children.UP != null &&
        this.children.DOWN != null
      );
    }

    /**
     * Adds children pair to the node.
     * @param {Number} u - The factor or multiplier by which the price will increase (up)
     * @param {Number} d - The factor or multiplier by which the price will decrease (down)
     * @param {Number} level - The level or period of the node.
     * @param {Node} [sibling] - The adjacent node of the current node. Used to simplify the tree, since Node_i[UP] * DOWN = Node_i[DOWN] * UP
     */
    addChildrenPair(u, d, level, sibling = null) {
      let childUp, childDown;
      const childUpValue = Decimal(this.value).times(u);
      const childDownValue = Decimal(this.value).times(d);
      if (sibling) {
        
        const potentialUpChild = sibling
          .getChildren()
          .find((node) =>
            Decimal(node.value).minus(childUpValue).lessThan(Decimal(1e-10))
          );
        const potentialDownChild = sibling
          .getChildren()
          .find((node) => Decimal(node.value).minus(childDownValue).lessThan(Decimal(1e-10)));
        if (potentialUpChild) {
          childUp = this.addChildren(Constant.Node.UP, potentialUpChild);
        }
        if (potentialDownChild) {
          childDown = this.addChildren(Constant.Node.DOWN, potentialDownChild);
        }
      }
      if (!childUp) {
        childUp = this.addChildren(
          Constant.Node.UP,
          new Node(childUpValue, undefined, undefined, level)
        );
      }
      if (!childDown) {
        childDown = this.addChildren(
          Constant.Node.DOWN,
          new Node(childDownValue, undefined, undefined, level)
        );
      }

      return this.children;
    }

    /**
     * Returns the value of the node, with its profit.
     * @returns {String} - Formatted string of the value and the profit of the node.
     */
    getName() {
      return `Value: $${this.value}, Profit: $${this.profit}`;
    }

    /**
     * Returns an iterable array of the children nodes.
     * @returns {Array} - Array where pos0 has ChildUp Node and pos1 has ChildDown Node.
     */
    getChildren() {
      const array = [];
      if (this.children[Constant.Node.UP])
        array.push(this.children[Constant.Node.UP]);
      if (this.children[Constant.Node.DOWN])
        array.push(this.children[Constant.Node.DOWN]);
      return array;
    }

    /**
     * Executes a method forAll nodes, starting will the children and ending with the current node.
     * @param {Function} callback - The function to execute.
     * @param {Array} args - The arguments or parameters of the function.
     */
    forAll(callback, args) {
      if (!this.hasChildren()) {
        return callback.apply(this, args);
      } else {
        for (const child in this.children) {
          if (Object.hasOwnProperty.call(this.children, child)) {
            this.children[child].forAll(callback, args);
          }
        }

        return callback.apply(this, args);
      }
    }
    /**
     * Returns true if both children have a defined profit.
     * @returns {boolean} - True if both children have a defined profit.
     */
    childrenHaveDefinedProfit() {
      for (const child in this.children) {
        if (Object.hasOwnProperty.call(this.children, child)) {
          if (
            this.children[child].profit == null ||
            Number(this.children[child].profit) < -1
          ) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Calculates the profit of a node.
     * @param {String} option - The option to evaluate. @see Constants.Options;
     * @param {Number} K - The strike price of the option.
     * @param {Number} p - The probability for the price to go up.
     * @param {Number} r - The risk free rate.
     * @param {Number} dt - Time delta (1 / number of periods).
     */
    setProfit(option, K, p, r, dt) {
      if (!this.hasChildren()) {
        switch (option) {
          case Constant.Options.EUROPEAN.PUT:
          case Constant.Options.AMERICAN.PUT:
            this.profit = Decimal(K).greaterThan(Decimal(this.value))
              ? Decimal(K).minus(Decimal(this.value))
              : Decimal(0);
            break;
          case Constant.Options.EUROPEAN.CALL:
          case Constant.Options.AMERICAN.CALL:
            this.profit = Decimal(this.value).greaterThan(Decimal(K))
              ? Decimal(this.value).minus(Decimal(K))
              : Decimal(0);
            break;
        }
      } else {
        const expectedIfUp = Decimal(p).times(this.children[Constant.Node.UP].profit);
        const expectedIfDown = (Decimal(1).minus(p)).times(
          this.children[Constant.Node.DOWN].profit
        );

        let profitIfWaits = expectedIfUp.plus(expectedIfDown);
        profitIfWaits = profitIfWaits.times(
          Decimal(1)
            .naturalExponential()
            .toPower(Decimal(-r).times(Decimal(dt)))
        );

        switch (option) {
          case Constant.Options.EUROPEAN.PUT:
          case Constant.Options.EUROPEAN.CALL:
            this.profit = profitIfWaits;
            break;
          case Constant.Options.AMERICAN.CALL:
            this.profit = (Decimal(this.value).minus(Decimal(K))).greaterThan(profitIfWaits)
              ? Decimal(this.value).minus(Decimal(K))
              : profitIfWaits;
            break;
          case Constant.Options.AMERICAN.PUT:
            this.profit = (Decimal(K).minus(Decimal(this.value))).greaterThan(profitIfWaits)
              ? Decimal(K).minus(Decimal(this.value))
              : profitIfWaits;
            break;
            
        }
        
      }
    }

    /**
     *  Adds a children in a defined position (UP or DOWN)
     * @returns {Node} - The node added to the children.
     */
    addChildren(position, newNode) {
      this.children[position] = newNode;
      return newNode;
    }
    /**
     *  Deletes a children in a defined position (UP or DOWN)
     * @returns {Node} - The node deleted of the children.
     */
    removeChildren(position) {
      if (!this.hasChildren()) {
        return null;
      } else {
        const node = _.cloneDeep(this.children[position]);
        delete this.children[position];
        return node;
      }
    }

    /**
     * Imports a JSON representation of a tree.
     * @param {String} JSONNode - The JSON representation of the tree.
     */

    static import(JSONNode) {
      if (!JSONNode.children || _.isEmpty(JSONNode.children)) {
        const response = new Node(JSONNode.name, JSONNode.value, null);
        return response;
      } else {
        const response = new Node(JSONNode.name, JSONNode.value, null);
        for (const child in JSONNode.children) {
          if (Object.hasOwnProperty.call(JSONNode.children, child)) {
            const element = JSONNode.children[child];
            response.addChildren(child, Node.import(element));
          }
        }
        return response;
      }
    }
    /**
     * Prints the current node in console using console.table()
     */
    print() {
      console.table(this);
    }
  },
};
