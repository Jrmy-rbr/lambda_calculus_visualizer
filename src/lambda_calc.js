import { isTerm, isApplication, isLambdaAbst, isVariable, splitExprIntoSubexprs, splitLambdaAbst, FUN }
    from './parsing_utils.js';

import { trimExtParenthesisAndSpaces } from './utils.js';


// module.exports = {
//     reduce,
//     areAlphaEquivalent,
//     getFreeVariables,
//     substituteFreeOccurrenceOfVariable,
//     alphaRenameLambdaAbst,
//     captureFreeSubstitute,
//     reduceOnce,
// };

export function reduce(expr) {
    all_reduced_expressions = reduceToList(expr)


    return all_reduced_expressions[all_reduced_expressions.length - 1];
}

export function reduceToList(expr, max_it = 10_000) {
    if (!isTerm(expr)) {
        throw new Error(`"${expr}" is not a valid term`);
    }

    var all_reduced_expressions = []
    for (let i = 0; i <= max_it; i++) {
        const exprNew = reduceOnce(expr);
        if (areAlphaEquivalent(exprNew, expr)) {
            break;
        }

        expr = exprNew;
        all_reduced_expressions.push(expr)
    }

    all_reduced_expressions.push(reduceOnce(expr))
    return all_reduced_expressions;
}

export function reduceOnce(expr) {
    expr = trimExtParenthesisAndSpaces(expr);

    if (isVariable(expr)) {
        return expr;
    }

    if (isLambdaAbst(expr)) {
        const [funVar, funBody] = splitLambdaAbst(expr);
        return `${FUN}${funVar}.` + reduceOnce(funBody);
    }

    let [subexprL, subexprR] = splitExprIntoSubexprs(expr);
    subexprL = trimExtParenthesisAndSpaces(subexprL);
    subexprR = trimExtParenthesisAndSpaces(subexprR);

    if (isLambdaAbst(subexprL)) {
        const [varName, funBody] = splitLambdaAbst(subexprL);
        return captureFreeSubstitute(varName, subexprR, funBody);
    }

    const newSubexprL = reduceOnce(subexprL);
    if (!areAlphaEquivalent(newSubexprL, subexprL)) {
        const po = !isVariable(newSubexprL) ? '(' : '';
        const pc = !isVariable(newSubexprL) ? ')' : '';
        const po2 = isApplication(subexprR) ? '(' : '';
        const pc2 = isApplication(subexprR) ? ')' : '';
        return `${po}${newSubexprL}${pc} ${po2}${subexprR}${pc2}`;
    }

    const newSubexprR = reduceOnce(subexprR);
    const po = !isVariable(subexprL) ? '(' : '';
    const pc = !isVariable(subexprL) ? ')' : '';
    const po2 = isApplication(newSubexprR) ? '(' : '';
    const pc2 = isApplication(newSubexprR) ? ')' : '';
    return `${po}${subexprL}${pc} ${po2}${newSubexprR}${pc2}`;
}

export function areAlphaEquivalent(expr1, expr2) {
    expr1 = trimExtParenthesisAndSpaces(expr1);
    expr2 = trimExtParenthesisAndSpaces(expr2);

    if (isVariable(expr1) || isVariable(expr2)) {
        if (!(isVariable(expr1) && isVariable(expr2))) {
            return false;
        }

        return expr1 === expr2;
    }

    if (isLambdaAbst(expr1) || isLambdaAbst(expr2)) {
        if (!(isLambdaAbst(expr1) && isLambdaAbst(expr2))) {
            return false;
        }

        const [funVar1, funBody1] = splitLambdaAbst(expr1);
        const [funVar2, funBody2] = splitLambdaAbst(expr2);

        if (canAlphaRename(funVar1, funVar2, funBody1, funBody2)) {
            return areAlphaEquivalent(
                captureFreeSubstitute(funVar1, funVar2, funBody1),
                funBody2
            );
        }

        return false;
    }

    const [subexpr1L, subexpr1R] = splitExprIntoSubexprs(expr1);
    const [subexpr2L, subexpr2R] = splitExprIntoSubexprs(expr2);

    return (
        areAlphaEquivalent(subexpr1L, subexpr2L) &&
        areAlphaEquivalent(subexpr1R, subexpr2R)
    );
}

export function captureFreeSubstitute(variable, replTerm, expr) {
    if (!isVariable(variable)) {
        throw new Error(`The input 'variable' should be a variable. Got ${variable} instead`);
    }

    expr = trimExtParenthesisAndSpaces(expr);

    const freeVarsExpr = getFreeVariables(expr);
    if (!freeVarsExpr.has(variable)) {
        return expr;
    }

    if (isVariable(expr)) {
        return replTerm;
    }

    if (isLambdaAbst(expr)) {
        const alphaRenamedExpr = alphaRenameLambdaAbst(expr, getFreeVariables(replTerm));
        const [varName, funBody] = splitLambdaAbst(alphaRenamedExpr);
        return `${FUN}${varName}.` + captureFreeSubstitute(variable, replTerm, funBody);
    }

    const [subexprL, subexprR] = splitExprIntoSubexprs(expr);
    const newSubexprL = captureFreeSubstitute(variable, replTerm, subexprL);
    const newSubexprR = captureFreeSubstitute(variable, replTerm, subexprR);
    const po = !isVariable(newSubexprL) ? '(' : '';
    const pc = !isVariable(newSubexprL) ? ')' : '';
    const po2 = isApplication(newSubexprR) ? '(' : '';
    const pc2 = isApplication(newSubexprR) ? ')' : '';
    return `${po}${newSubexprL}${pc} ${po2}${newSubexprR}${pc2}`;
}

export function substituteFreeOccurrenceOfVariable(variable, replTerm, expr) {
    expr = trimExtParenthesisAndSpaces(expr);
    if (!getFreeVariables(expr).has(variable)) {
        return expr;
    }

    if (isVariable(expr)) {
        return replTerm;
    }

    if (isLambdaAbst(expr)) {
        const [varName, funBody] = splitLambdaAbst(expr);
        return `${FUN}${varName}.` + substituteFreeOccurrenceOfVariable(variable, replTerm, funBody);
    }

    const [subexprL, subexprR] = splitExprIntoSubexprs(expr);
    const newSubexprL = substituteFreeOccurrenceOfVariable(variable, replTerm, subexprL);
    const newSubexprR = substituteFreeOccurrenceOfVariable(variable, replTerm, subexprR);
    const po1 = !isVariable(newSubexprL) ? '(' : '';
    const pc1 = !isVariable(newSubexprL) ? ')' : '';
    const po2 = !isVariable(newSubexprR) ? '(' : '';
    const pc2 = !isVariable(newSubexprR) ? ')' : '';
    return `${po1}${newSubexprL}${pc1} ${po2}${newSubexprR}${pc2}`;
}

export function getFreeVariables(expr) {
    expr = trimExtParenthesisAndSpaces(expr);

    if (isVariable(expr)) {
        return new Set([expr]);
    }

    if (isLambdaAbst(expr)) {
        const [varName, funBody] = splitLambdaAbst(expr);
        const freeVarsInBody = getFreeVariables(funBody);
        freeVarsInBody.delete(varName);
        return freeVarsInBody;
    }

    const [subexprL, subexprR] = splitExprIntoSubexprs(expr);
    return new Set([
        ...getFreeVariables(subexprL),
        ...getFreeVariables(subexprR),
    ]);
}

export function alphaRenameLambdaAbst(lambdaTerm, varNamesToExclude = new Set()) {
    if (!isLambdaAbst(lambdaTerm)) {
        throw new Error(`The input should be a lambda term. Got ${lambdaTerm} instead`);
    }

    const newVarName = pickVarNotInSet(
        new Set([...getFreeVariables(lambdaTerm), ...varNamesToExclude])
    );

    const [varName, funBody] = splitLambdaAbst(lambdaTerm);
    return `${FUN}${newVarName}.${substituteFreeOccurrenceOfVariable(varName, newVarName, funBody)}`;
}

function pickVarNotInSet(varsSet) {
    if (![...varsSet].every(isVariable)) {
        throw new Error(`The input should be a set of variables. Got ${varsSet} instead`);
    }

    let i = 0;
    while (varsSet.has(`x${i}`)) {
        i++;
    }

    return `x${i}`;
}

function canAlphaRename(outerBoundVariable1, outerBoundVariable2, body1, body2) {
    return !getFreeVariables(body1).has(outerBoundVariable2) || outerBoundVariable2 === outerBoundVariable1;
}

