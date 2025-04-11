const { reduce, reduceOnce, areAlphaEquivalent } = require('js/src/lambda_calc');
const { isTerm, isLambdaAbst } = require("js/src/parsing_utils")

describe('reduceOnce function', () => {
  test.each([
    { expr: "(fun:x.x) f", result: "f" },
    { expr: "(fun:x.x)", result: "fun:x.x" },
    { expr: "fun:x.x x", result: "fun:x.x x" },
    { expr: "(fun:x.x x) (fun:x.x x)", result: "(fun:x.x x) fun:x.x x" },
    { expr: "(fun:x.x x) f", result: "f f" },
    { expr: "f f", result: "f f" },
    { expr: "(f) (f)", result: "f f" },
    { expr: "f g", result: "f g" },
    { expr: "fun:a.fun:b.((fun:x.fun:y.x) b) a", result: "fun:a.fun:b.(fun:x0.b) a" },
  ])('should reduce expression "$expr" correctly', ({ expr, result }) => {
    expect(reduceOnce(expr)).toBe(result);
  });
});

describe('isTerm function', () => {
  test.each([
    { expr: "fun:x. x", result: true, shouldError: false },
    { expr: "fun:x. fun:y. x y", result: true, shouldError: false },
    { expr: "fun:x. (fun:y. x y)", result: true, shouldError: false },
    { expr: "( f", result: false, shouldError: true },  // Syntax error due to parenthesis
    { expr: "f f", result: true, shouldError: false },
    { expr: "lol.la", result: false, shouldError: true },
  ])('should validate expression "$expr"', ({ expr, result, shouldError }) => {
    if (shouldError) {
      expect(() => isTerm(expr)).toThrow(SyntaxError);
    } else {
      expect(isTerm(expr)).toBe(result);
    }
  });
});

describe('areAlphaEquivalent function', () => {
  test.each([
    { expr1: "x", expr2: "y", result: false },
    { expr1: "x", expr2: "x", result: true },
    { expr1: "f f", expr2: "f f", result: true },
    { expr1: "f f", expr2: "f g", result: false },
    { expr1: "fun:x. x", expr2: "fun:x.x", result: true },
    { expr1: "fun:x.x", expr2: "fun:y.y", result: true },
    { expr1: "fun:x. x", expr2: "fun:y.y", result: true },
    { expr1: "fun:x. fun:y. x y", expr2: "fun:a. fun:b. a b", result: true },
    { expr1: "fun:x. fun:y. x y", expr2: "fun:x. fun:b. x b", result: true },
    { expr1: "fun:x. fun:y. x y", expr2: "fun:x. fun:b. a b", result: false },
    { expr1: "(fun:x.x) (fun:x.x)", expr2: "(fun:x.x) (fun:y.y)", result: true },
    { expr1: "fun:x.fun:x. x x", expr2: "fun:y.fun:x. x y", result: false },
    { expr1: "fun:x.fun:x. x x", expr2: "fun:y.fun:x. x x", result: true },
    { expr1: "fun:x.fun:x. x x", expr2: "fun:y.fun:y. y y", result: true },
    { expr1: "fun:x. x y", expr2: "fun:z. z y", result: true },
    { expr1: "fun:x. y", expr2: "fun:y. y", result: false },
    { expr1: "fun:x. fun:z. z", expr2: "fun:y. fun:x. x", result: true },
    { expr1: "fun:x. fun:z. z", expr2: "fun:x. fun:x. x", result: true },
  ])('should check if "$expr1" and "$expr2" are alpha equivalent', ({ expr1, expr2, result }) => {
    expect(areAlphaEquivalent(expr1, expr2)).toBe(result);
  });
});

describe('reduce function', () => {
  test.each([
    { expr: "(fun:x.x) f", result: "f" },
    { expr: "fun:x.x x", result: "fun:x.x x" },
    { expr: "(fun:x.x x) f", result: "f f" },
    { expr: "f f", result: "f f" },
    { expr: "(f) (f)", result: "f f" },
    { expr: "f g", result: "f g" },
  ])('should reduce lambda term "$expr" correctly', ({ expr, result }) => {
    const reducedExpr = reduce(expr);
    expect(reducedExpr).toBe(result);
  });
});

test('should check if expression is a lambda term', () => {
  const testCases = [
    { expr: "(fun:y.y) x", result: false },
    { expr: "fun:y.y", result: true },
  ];

  testCases.forEach(({ expr, result }) => {
    expect(isLambdaAbst(expr)).toBe(result);
  });
});
