const { reduce, areAlphaEquivalent } = require('js/src/lambda_calc');
const { trimExtParenthesisAndSpaces } = require('js/src/utils');
const {
    TRUE,
    FALSE,
    IF_ELSE,
    AND,
    OR,
    XOR,
    NOT,
    ADD,
    MULT,
    EXP,
    IS_ZERO,
    SUCC,
    PRED,
    SUB,
    LEQ,
    EQ,
    REC,
    churchNat
} = require('js/src/church_encoding');

// Test Church True
test('church_true', () => {
    expect(reduce(`${TRUE} a b`)).toBe('a');
});

// Test Church False
test('church_false', () => {
    expect(reduce(`${FALSE} a b`)).toBe('b');
});

// Test Church If-Else
test.each([
    [`${IF_ELSE} ${TRUE} a b`, 'a'],
    [`${IF_ELSE} ${FALSE} a b`, 'b']
])('church_if_else: %s', (expr, result) => {
    expect(reduce(expr)).toBe(result);
});

// Test Church AND
test.each([
    [`${AND} ${TRUE} ${TRUE}`, `${TRUE}`],
    [`${AND} ${TRUE} ${FALSE}`, `${FALSE}`],
    [`${AND} ${FALSE} ${TRUE}`, `${FALSE}`],
    [`${AND} ${FALSE} ${FALSE}`, `${FALSE}`]
])('church_and: %s', (expr, result) => {
    expect(reduce(expr)).toBe(trimExtParenthesisAndSpaces(result));
});

// Test Church OR
test.each([
    [`${OR} ${TRUE} ${TRUE}`, `${TRUE}`],
    [`${OR} ${TRUE} ${FALSE}`, `${TRUE}`],
    [`${OR} ${FALSE} ${TRUE}`, `${TRUE}`],
    [`${OR} ${FALSE} ${FALSE}`, `${FALSE}`]
])('church_or: %s', (expr, result) => {
    expect(reduce(expr)).toBe(trimExtParenthesisAndSpaces(result));
});

// Test Church NOT
test.each([
    [`${NOT} ${TRUE}`, `${FALSE}`],
    [`${NOT} ${FALSE}`, `${TRUE}`]
])('church_not: %s', (expr, result) => {
    expect(areAlphaEquivalent(reduce(expr), trimExtParenthesisAndSpaces(result))).toBe(true);
});

// Test Church XOR
test.each([
    [`${XOR} ${TRUE} ${TRUE}`, `${FALSE}`],
    [`${XOR} ${TRUE} ${FALSE}`, `${TRUE}`],
    [`${XOR} ${FALSE} ${TRUE}`, `${TRUE}`],
    [`${XOR} ${FALSE} ${FALSE}`, `${FALSE}`]
])('church_xor: %s', (expr, result) => {
    expect(areAlphaEquivalent(reduce(expr), trimExtParenthesisAndSpaces(result))).toBe(true);
});

// Test Church Nat
test.each([
    [0, "( fun:f.fun:x. x )"],
    [1, "( fun:f.fun:x. f (x) )"],
    [2, "( fun:f.fun:x. f (f (x)) )"],
    [3, "( fun:f.fun:x. f (f (f (x))) )"]
])('church_nat: %i', (n, expectedResult) => {
    expect(churchNat(n)).toBe(expectedResult);
});

// Test Church Nat Error
test('church_nat_error', () => {
    expect(() => churchNat(-1)).toThrow(Error);
});

// Test Addition
test.each([
    [1, 1, 2],
    [1, 2, 3],
    [2, 1, 3],
    [2, 2, 4]
])('add: %i + %i = %i', (n1, n2, result) => {
    expect(areAlphaEquivalent(reduce(`${ADD} ${churchNat(n1)} ${churchNat(n2)}`), `${churchNat(result)}`)).toBe(true);
});

// Test Successor
test.each([0, 1, 2, 3])('succ: %i', (n) => {
    const lhs = reduce(`${SUCC} ${churchNat(n)}`);
    const rhs = reduce(`${ADD} ${churchNat(n)} ${churchNat(1)}`);
    expect(areAlphaEquivalent(lhs, rhs)).toBe(true);
});

// Test Predecessor
test.each([
    [0, 0],
    [1, 0],
    [2, 1],
    [3, 2]
])('pred: %i', (n, output) => {
    const lhs = reduce(`${PRED} ${churchNat(n)}`);
    const rhs = `${churchNat(output)}`;
    expect(areAlphaEquivalent(lhs, rhs)).toBe(true);
});

// Test Multiplication
test.each([
    [1, 1, 1],
    [1, 2, 2],
    [2, 1, 2],
    [2, 2, 4]
])('mult: %i * %i = %i', (n1, n2, result) => {
    expect(areAlphaEquivalent(reduce(`${MULT} ${churchNat(n1)} ${churchNat(n2)}`), `${churchNat(result)}`)).toBe(true);
});

// Test Exponentiation
test.each([
    [1, 1, 1],
    [1, 2, 1],
    [2, 1, 2],
    [2, 2, 4],
    [2, 3, 8]
])('exp: %i ^ %i = %i', (n1, n2, result) => {
    expect(areAlphaEquivalent(reduce(`${EXP} ${churchNat(n1)} ${churchNat(n2)}`), `${churchNat(result)}`)).toBe(true);
});

// Test Is Zero
test.each([
    [0, TRUE],
    [1, FALSE],
    [2, FALSE]
])('is_zero: %i', (n, output) => {
    expect(reduce(`${IS_ZERO} ${churchNat(n)}`)).toBe(trimExtParenthesisAndSpaces(output));
});

// Test Subtraction
test.each([
    [1, 2, 0],
    [2, 1, 1]
])('sub: %i - %i = %i', (n1, n2, output) => {
    const lhs = reduce(`${SUB} ${churchNat(n1)} ${churchNat(n2)}`);
    const rhs = `${churchNat(output)}`;
    expect(areAlphaEquivalent(lhs, rhs)).toBe(true);
});

// Test Less Than or Equal
test.each([
    [1, 2, TRUE],
    [2, 1, FALSE],
    [1, 1, TRUE],
    [3, 3, TRUE]
])('leq: %i <= %i = %i', (n1, n2, output) => {
    expect(reduce(`${LEQ} ${churchNat(n1)} ${churchNat(n2)}`)).toBe(trimExtParenthesisAndSpaces(output));
});

// Test Equality
test.each([
    [1, 2, FALSE],
    [2, 1, FALSE],
    [1, 1, TRUE],
    [3, 3, TRUE]
])('eq: %i == %i = %i', (n1, n2, output) => {
    const lhs = reduce(`${EQ} ${churchNat(n1)} ${churchNat(n2)}`);
    expect(lhs).toBe(trimExtParenthesisAndSpaces(output));
});

// Test Factorial (Slow)
test.each([
    [0, 1],
    [1, 1],
    [2, 2],
    [3, 6]
])('fact: %i', (n, nOutput) => {
    const FACT = `${REC} (fun:fact.fun:n.(${IF_ELSE} (${IS_ZERO} n) ${churchNat(1)} (${MULT} n (fact (${PRED} n)))))`;
    const lhs = reduce(`${FACT} ${churchNat(n)}`);
    expect(areAlphaEquivalent(lhs, churchNat(nOutput))).toBe(true);
});
