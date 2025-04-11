const { splitExprIntoSubexprs } = require('js/src/parsing_utils.js');

test('should split expressions into subexpressions correctly', () => {
  const testCases = [
    { expr: "x y", expectedOutput: ["x", "y"] },
    { expr: "z fun:x. x", expectedOutput: ["z", "fun:x. x"] },
    { expr: "x3 x1 fun:x0. (x1 x2) x0", expectedOutput: ["x3 x1", "fun:x0. (x1 x2) x0"] },
    { expr: "x1 fun:x0. (x1 x2 bla) x0", expectedOutput: ["x1", "fun:x0. (x1 x2 bla) x0"] },
    { expr: "x3 x2 fun:f.fun:x. f x", expectedOutput: ["x3 x2", "fun:f.fun:x. f x"] },
    { expr: "(x3 (fun:x0.x0 x0) x2) x4", expectedOutput: ["(x3 (fun:x0.x0 x0) x2)", "x4"] },
    { expr: "(fun:x0.x0 x0) x2", expectedOutput: ["(fun:x0.x0 x0)", "x2"] },
    { expr: "(fun:f.f) fun:n.n ( fun:u.x ) ( fun:u.u )", expectedOutput: ["(fun:f.f)", "fun:n.n ( fun:u.x ) ( fun:u.u )"] },
  ];

  testCases.forEach(({ expr, expectedOutput }) => {
    expect(splitExprIntoSubexprs(expr)).toEqual(expectedOutput);
  });
});


