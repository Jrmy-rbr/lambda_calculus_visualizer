const {
    substituteFreeOccurrenceOfVariable,
    alphaRenameLambdaAbst,
    captureFreeSubstitute,
    getFreeVariables,
} = require('js/src/lambda_calc'); // Import the functions you're testing (you need to implement them)



// Test for getFreeVariables
describe('getFreeVariables', () => {
    test.each([
        ["fun:x.x", new Set()],
        ["fun:x. y x", new Set(["y"])],
        ["fun:x. (fun:y.y z x) x", new Set(["z"])],
    ])('given %s, returns %p', (expr, expectedOutput) => {
        expect(getFreeVariables(expr)).toEqual(expectedOutput);
    });
});

describe




// Test for substituteFreeOccurrenceOfVariable
describe('substituteFreeOccurrenceOfVariable', () => {
    test.each([
        ["x", "y", "fun:x.x", "fun:x.x"],
        ["x", "y", "fun:x.y", "fun:x.y"],
        ["y", "fun:x.x", "fun:x. y x", "fun:x.(fun:x.x) x"],
        ["y", "fun:x.x", "fun:y. y x", "fun:y. y x"],
        ["y", "fun:x.z x", "fun:z. y x", "fun:z.(fun:x.z x) x"],  // capture of z
        ["y", "fun:x.z x", "fun:z. y x z", "fun:z.((fun:x.z x) x) z"],
    ])('given %s, %s, %s, returns %s', (variable, replTerm, expr, expectedOutput) => {
        expect(substituteFreeOccurrenceOfVariable(variable, replTerm, expr)).toEqual(expectedOutput);
    });
});

// Test for _alphaRenameLambdaAbst
describe('_alphaRenameLambdaAbst', () => {
    test.each([
        ["fun:x. x", new Set(), "fun:x0.x0"],
        ["fun:x. x", new Set(["x0"]), "fun:x1.x1"],  // case add exclusion set
        ["fun:x. fun:x0.x0", new Set(), "fun:x0.fun:x0.x0"],  // case where no free variable in body
        ["fun:x. fun:y. x x0", new Set(), "fun:x1.fun:y.x1 x0"],  // case where x0 is free in the body
    ])('given %s, %p, returns %s', (lambdaTerm, varsToExclude, expectedOutput) => {
        expect(alphaRenameLambdaAbst(lambdaTerm, varsToExclude)).toEqual(expectedOutput);
    });
});

// Test for captureFreeSubstitute
describe('captureFreeSubstitute', () => {
    test.each([
        ["x", "y", "fun:x.x", "fun:x.x"],
        ["x", "y", "fun:x.y", "fun:x.y"],
        ["y", "fun:x.x", "fun:x. y x", "fun:x0.(fun:x.x) x0"],
        ["y", "fun:x.x", "fun:y. y x", "fun:y. y x"],
        ["y", "fun:x.z x", "fun:z. y x", "fun:x0.(fun:x.z x) x"],  // avoid capture of z
        ["y", "fun:x.z x", "fun:z. y x z", "fun:x0.((fun:x.z x) x) x0"],
        ["x", "fun:x. x x", "x x", "(fun:x. x x) fun:x. x x"],  // simulate a 1 step beta reduction
        ["z", "fun:x. x x", "(fun:x.x) (fun:y.y) z", "((fun:x.x) (fun:y.y)) fun:x. x x"],
    ])('given %s, %s, %s, returns %s', (variable, replTerm, expr, expectedOutput) => {
        expect(captureFreeSubstitute(variable, replTerm, expr)).toEqual(expectedOutput);
    });
});


