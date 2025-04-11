import { trimExtParenthesisAndSpaces, getMatchingParenthesisIndices } from "./utils.js";

export const FUN = "fun:";
export const VAR_PATTERN = "[a-z]+[0-9]*";
export const LAMBDA_PATTERN = `${FUN}${VAR_PATTERN}\\..+`;

// module.exports = {
//     isTerm,
//     isApplication,
//     isLambdaAbst,
//     isVariable,
//     splitExprIntoSubexprs,
//     splitLambdaAbst,
//     FUN, VAR_PATTERN, LAMBDA_PATTERN
// }

export function isVariable(expr) {
    expr = trimExtParenthesisAndSpaces(expr);
    return new RegExp(`^${VAR_PATTERN}$`).test(expr);
}

export function isLambdaAbst(expr) {
    expr = trimExtParenthesisAndSpaces(expr);
    return new RegExp(`^${LAMBDA_PATTERN}$`).test(expr);
}

export function isApplication(expr) {
    return !isVariable(expr) && !isLambdaAbst(expr);
}

export function isTerm(expr) {
    checkSyntax(expr);
    expr = trimExtParenthesisAndSpaces(expr);

    if (isVariable(expr)) return true;

    if (isLambdaAbst(expr)) {
        return isTerm(splitLambdaAbst(expr)[1]);
    }

    try {
        const [subexprL, subexprR] = splitExprIntoSubexprs(expr);
        return isTerm(subexprL) && isTerm(subexprR);
    } catch (e) {
        if (e.message === `The input \"${expr}\" is not a valid term`) {
            return false;
        }
        throw e;
    }
}

export function splitLambdaAbst(lambdaTerm) {
    if (!isLambdaAbst(lambdaTerm)) {
        throw new Error(`The input should be a lambda term. Got ${lambdaTerm} instead`);
    }

    const [funVar, funBody] = lambdaTerm.split(/\.(.+)/);
    const varName = funVar.slice(FUN.length);

    return [varName, funBody];
}

export function splitExprIntoSubexprs(expr) {
    if (isVariable(expr) || isLambdaAbst(expr)) {
        throw new Error(`The input expression cannot be a variable or a lambda abstraction. Got ${expr}`);
    }

    const splitIndex = getSplittingSpaceIndex(expr);
    const subexprL = expr.slice(0, splitIndex);
    const subexprR = expr.slice(splitIndex + 1);

    return [subexprL, subexprR];
}

function getSplittingSpaceIndex(expr) {
    expr = trimExtParenthesisAndSpaces(expr);
    let spaceIndices = getSpaceIndicesNotWithinParentheses(expr);
    spaceIndices = spaceIndices.filter(
        idx => !new RegExp(`${FUN}${VAR_PATTERN}\\.\\s*$`).test(expr.slice(0, idx))
    );

    if (spaceIndices.length === 0) {
        throw new Error(`The input \"${expr}\" is not a valid term`);
    }

    let splittingSpaceIdx = spaceIndices[spaceIndices.length - 1];
    for (let i = spaceIndices.length - 1; i >= 0; i--) {
        const idx = spaceIndices[i];
        if (!isContainedInLambdaAbs([idx + 1, expr.length], expr)) {
            splittingSpaceIdx = idx;
            break;
        }
    }

    return splittingSpaceIdx;
}

function getSpaceIndicesNotWithinParentheses(expr) {
    const parenthesesStack = [];
    const spaces = [];

    for (let i = 0; i < expr.length; i++) {
        const c = expr[i];

        if (c === " " && parenthesesStack.length === 0) {
            spaces.push(i);
        }

        if (c === "(") {
            parenthesesStack.push(i);
        }

        if (c === ")") {
            if (parenthesesStack.length === 0) {
                throw new Error(
                    `No opening parenthesis corresponding to the closing parenthesis at index ${i}`
                );
            }
            parenthesesStack.pop();
        }
    }

    if (parenthesesStack.length > 0) {
        throw new Error(
            `Not closing parenthesis matching opening parenthesis at index ${parenthesesStack.pop()}`
        );
    }

    return spaces;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function isContainedInLambdaAbs(subexprSpan, wholeExpr) {
    const subexpr = wholeExpr.slice(subexprSpan[0], subexprSpan[1]);
    let nextLambdaAbs = wholeExpr.match(new RegExp(`${FUN}${VAR_PATTERN}\\.`));
    let startBodyIdx = 0;

    while (nextLambdaAbs !== null) {
        startBodyIdx += nextLambdaAbs.index + nextLambdaAbs[0].length;
        const endBodyIdx =
            startBodyIdx + getFirstUnmatchingClosingParenthesisIndex(wholeExpr.slice(startBodyIdx));
        const funBody = wholeExpr.slice(startBodyIdx, endBodyIdx);

        const isInFunBody = [...funBody.matchAll(new RegExp(escapeRegExp(subexpr), "g"))].some(
            m => m.index + startBodyIdx === subexprSpan[0]
        );

        if (isInFunBody) return true;

        nextLambdaAbs = wholeExpr.slice(startBodyIdx).match(new RegExp(`${FUN}${VAR_PATTERN}\\.`));
    }

    return false;
}

function getFirstUnmatchingClosingParenthesisIndex(expr) {
    let firstNonMatchingIndex = expr.length;
    const parenthesisStack = [];

    for (let i = 0; i < expr.length; i++) {
        const c = expr[i];

        if (c === "(") {
            parenthesisStack.push(i);
        }

        if (c === ")") {
            if (parenthesisStack.length === 0) {
                firstNonMatchingIndex = i;
                break;
            }
            parenthesisStack.pop();
        }
    }

    return firstNonMatchingIndex;
}

function checkSyntax(expr) {
    // This will error if no matching parentheses
    getMatchingParenthesisIndices(expr);

    // Check that before a point there is always f".*${FUN}${VAR_PATTERN}$"
    const beforePoints = expr.split(".").slice(0, -1);
    if (beforePoints.some(beforePt => !new RegExp(`.*${FUN}${VAR_PATTERN}$`).test(beforePt))) {
        const badPatterns = beforePoints
            .map(beforePt => beforePt.match(new RegExp(`${FUN}${VAR_PATTERN}$`)))
            .filter(Boolean)
            .map(m => m[0]);
        throw new SyntaxError(`Found the following invalid patterns: ${badPatterns}`);
    }

    // Check that ':' is always preceded by 'fun'
    if (new RegExp("(?<!fun):").test(expr)) {
        const badPatterns = [...expr.matchAll(/(?<!fun):/g)].map(m => m[0]);
        throw new SyntaxError(`Found the following invalid patterns: ${badPatterns}`);
    }
}
