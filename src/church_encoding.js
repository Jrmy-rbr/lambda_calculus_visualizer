// """As I have not implemented a `let` expression,
// I'll use string operations to define constants in the programs
// """

export const TRUE = "( fun:x.fun:y.x )";
export const FALSE = "( fun:x.fun:y.y )";
export const IF_ELSE = "( fun:b.fun:x.fun:y.b x y )";
export const AND = "( fun:b.fun:p. b p b )";
export const OR = "( fun:b.fun:p. b b p )";
export const NOT = "( fun:b.fun:x.fun:y. b y x )";
export const XOR = `( fun:b.fun:p.b (${NOT} p) p )`;

export const SUCC = `( fun:n.fun:f.fun:x.f (n f x) )`;
export const PRED = "( fun:n.fun:f.fun:x.n (fun:g.fun:h.h (g f)) ( fun:u.x ) ( fun:u.u ) )";
export const ADD = "( fun:n.fun:m.fun:f.fun:x.n f (m f x) )";
export const SUB = `( fun:n.fun:m. m ${PRED} n )`;
export const MULT = "( fun:n.fun:m.fun:f.fun:x. m (n f) x )";
export const EXP = "( fun:n.fun:m.m n )";

export const IS_ZERO = `( fun:n. n (fun:x.${FALSE}) ${TRUE} )`;
export const LEQ = `( fun:n.fun:m. ${IS_ZERO} (${SUB} n m) )`;
export const EQ = `( fun:n.fun:m.${AND} (${LEQ} n m) (${LEQ} m n) )`;

// Y combinator
export const REC = "( fun:f. (fun:x.f (x x)) (fun:x.f (x x)) )";

// module.exports = {
//     churchNat,
//     TRUE, FALSE, IF_ELSE, AND, OR, NOT, XOR, SUCC, PRED, ADD, SUB, MULT, EXP, IS_ZERO, LEQ, EQ, REC,
// }



export function churchNat(n) {
    if (n < 0) {
        throw new Error(`The input n should be non-negative. Got ${n}`);
    }

    const body = getChurchBody(n, "x");

    return `( fun:f.fun:x. ${body} )`;
}

function getChurchBody(n, body) {
    if (n === 0) {
        return body;
    } else {
        return getChurchBody(n - 1, `f (${body})`);
    }
}
