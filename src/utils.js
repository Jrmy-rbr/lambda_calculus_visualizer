// module.exports = {
//     trimExtParenthesisAndSpaces, getMatchingParenthesisIndices
// }

export function trimExtParenthesisAndSpaces(expr) {
    while (true) {
        const matchingParenthesisIndices = getMatchingParenthesisIndices(expr);
        if (
            matchingParenthesisIndices.length > 0 &&
            matchingParenthesisIndices[matchingParenthesisIndices.length - 1][0] === 0 &&
            matchingParenthesisIndices[matchingParenthesisIndices.length - 1][1] === expr.length - 1
        ) {
            expr = expr.slice(1, -1);
        } else if (/^\s/.test(expr)) {
            expr = expr.slice(1);
        } else if (/\s$/.test(expr)) {
            expr = expr.slice(0, -1);
        } else {
            break;
        }
    }

    return expr;
}

export function getMatchingParenthesisIndices(expr) {
    const matchingParIndices = [];
    const stack = [];

    for (let i = 0; i < expr.length; i++) {
        const c = expr[i];
        if (c === "(") {
            stack.push(i);
        } else if (c === ")") {
            if (stack.length === 0) {
                throw new SyntaxError(`Closing parenthesis at index ${i} not matching any open parenthesis`);
            }

            matchingParIndices.push([stack.pop(), i]);
        }
    }

    if (stack.length > 0) {
        throw new SyntaxError(`Opening parenthesis at index ${stack[stack.length - 1]} is never closed`);
    }

    return matchingParIndices;
}

