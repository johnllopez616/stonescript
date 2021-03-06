// const util = require('util');

const {
  Assignment, BinaryExp, Conditional, Call, Declaration, TypeDec,
  ForLoop, ForIncrement, Program, Func, Literal,
  Break,
} = require('../ast');

Program.prototype.optimize = function () {
  return this;
};

function isZero(e) {
  return e instanceof Literal && e.value === 0;
}

function isOne(e) {
  return e instanceof Literal && e.value === 1;
}


Assignment.prototype.optimize = function () {
  this.target = this.target.optimize();
  this.source = this.source.optimize();
  if (this.target === this.source) {
    return null;
  }
  return this;
};

BinaryExp.prototype.optimize = function () {
  this.left = this.left.optimize();
  this.right = this.right.optimize();
  if (this.op === 'SQUISH' && isZero(this.right)) return this.left;
  if (this.op === 'SQUISH' && isZero(this.left)) return this.right;
  if (this.op === 'RIP' && isZero(this.right)) return this.left;
  if (this.op === 'RIP' && isZero(this.left)) return this.right;
  if (this.op === 'MANY' && isZero(this.right)) return new Literal(0);
  if (this.op === 'MANY' && isZero(this.left)) return new Literal(0);
  if (this.op === 'MANY' && isOne(this.right)) return this.left;
  if (this.op === 'MANY' && isOne(this.left)) return this.right;
  return this;
};

Conditional.prototype.optimize = function () {
  this.testExp = this.testExp.optimize();
  this.consequent = this.consequent.optimize();
  this.alternate = this.alternate.optimize();
  if (isZero(this.testExp)) {
    return this.alternate;
  }
  return this;
};

Call.prototype.optimize = function () {
  this.args = this.args.map(a => a.optimize());
  this.id = this.id.optimize();
  return this;
};

Declaration.prototype.optimize = function () {
  this.decs = this.decs.filter(d => d.constructor !== TypeDec).map(d => d.optimize());
  this.body = this.body.map(e => e.optimize());
  return this;
};

ForLoop.prototype.optimize = function () {
  this.setup = this.setup.optimize();
  this.testExp = this.testExp.optimize();
  this.increment = this.increment.optimize();
  this.body = this.body.optimize();
  return this;
};

ForIncrement.prototype.optimize = function () {
  this.id1 = this.id1.optimize();
  this.id2 = this.id2.optimize();
  this.intlit = this.intlit.optimize();
  return this;
};

Func.prototype.optimize = function () {
  if (this.statements) {
    this.statements = this.statements.optimize();
  }
  return this;
};

Literal.prototype.optimize = function () {
  return this;
};

Break.prototype.optimize = function () {
  return this;
};
