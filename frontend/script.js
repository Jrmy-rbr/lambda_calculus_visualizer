import { reduceToList, reduceOnce, areAlphaEquivalent } from "../src/lambda_calc.js";
import { churchNat, NOT, AND, OR, XOR, TRUE, FALSE, SUCC, PRED, ADD, SUB, MULT, EXP, LEQ, EQ, IF_ELSE, REC } from "../src/church_encoding.js";

const max_it = 10_000


function unfoldTerm(term) {
    // Replace all the predefined names by their corresponding lambda abstraction
    const items = document.querySelectorAll('#church-conditions li, #church-naturals li, #fixed-point li')

    let modifiedTerm = term
    for (const item of items) {
        const itemTextNode = Array.from(item.childNodes).filter(
            node => Array.from(node.classList).includes("item-text")
        )
        const textContent = itemTextNode[0].textContent
        const lambdaAbs = textContentToLambdaAbs(textContent)
        if (textContent.includes("nat")) {
            modifiedTerm = modifiedTerm.replace(/nat_(\d+)/g, (match, g1) => {
                const val = churchNat(Number(g1))
                return val
            })
        } else {
            modifiedTerm = modifiedTerm.replaceAll(textContent, lambdaAbs)
        }
    }

    return modifiedTerm
}

document.getElementById('play-button').addEventListener('click', function () {
    // Trigger full beta reduction
    const term = document.getElementById('lambda-term').value;
    const unfoldedTerm = unfoldTerm(term)
    const isOutputEmpty_ = isOutputEmpty()

    // Call your lambda calculus reduction function here
    const lastTerm = isOutputEmpty_ ? unfoldedTerm : getLastOutput()
    if (isOutputEmpty_) {
        displayReductionStep(lastTerm)
    }

    console.log('Full reduction for:', lastTerm);
    const reducedTerms = reduceToList(lastTerm, max_it)
    const lastReducedTerm = reducedTerms[reducedTerms.length - 1]
    console.log('Reduced fully term:', lastReducedTerm)

    if (isOutputEmpty_ || !areAlphaEquivalent(lastTerm, lastReducedTerm)) {
        for (const reducedTerm of reducedTerms) {
            displayReductionStep(reducedTerm);
        }
    }
});

document.getElementById('step-forwards-button').addEventListener('click', function () {
    // Trigger one step of beta reduction
    const term = document.getElementById('lambda-term').value;
    const unfoldedTerm = unfoldTerm(term)
    const isOutputEmpty_ = isOutputEmpty()

    const lastTerm = isOutputEmpty_ ? unfoldedTerm : getLastOutput()
    if (isOutputEmpty_) {
        displayReductionStep(lastTerm)
        return
    }

    console.log('One step reduction for:', lastTerm);
    const reducedOnceTerm = reduceOnce(lastTerm)

    console.log('Reduced once step term:', reducedOnceTerm)
    if (isOutputEmpty_ || !areAlphaEquivalent(reducedOnceTerm, lastTerm)) {
        displayReductionStep(reducedOnceTerm);
    }

});

function displayReductionStep(value) {
    const reductionSteps = document.querySelector('#reduction-steps ul');
    const stepDisplay = document.createElement('li');
    stepDisplay.textContent = value;
    reductionSteps.appendChild(stepDisplay);
}

function isOutputEmpty() {
    const reductionSteps = document.querySelector('#reduction-steps ul')
    return reductionSteps.childNodes.length === 0
}

function getLastOutput() {
    const reductionSteps = document.querySelector('#reduction-steps ul')
    return reductionSteps.childNodes[reductionSteps.childNodes.length - 1].textContent
}

const clearOutput = document.getElementById("clear-output")
clearOutput.addEventListener('click', () => {
    document.querySelector('#reduction-steps ul').innerHTML = ''
})

const clearInput = document.getElementById("clear-input")
clearInput.addEventListener('click', () => {
    document.getElementById('lambda-term').value = ''
})


// Prevent the click event on the nat input from propagating to its parent button
const natInput = document.getElementById("in-church-nat")
natInput.addEventListener("click", (event) => {
    event.stopPropagation();
})

function textContentToLambdaAbs(textContent) {
    let lambdaAbs
    switch (textContent) {
        case '⊤':
            lambdaAbs = TRUE
            break
        case '⊥':
            lambdaAbs = FALSE
            break
        case 'IFELSE':
            lambdaAbs = IF_ELSE
            break
        case '∧':
            lambdaAbs = AND
            break
        case '∨':
            lambdaAbs = OR
            break
        case '¬':
            lambdaAbs = NOT
            break
        case 'XOR':
            lambdaAbs = XOR
            break
        case 'S':
            lambdaAbs = SUCC
            break
        case 'PRED':
            lambdaAbs = PRED
            break
        case '+':
            lambdaAbs = ADD
            break
        case '-':
            lambdaAbs = SUB
            break
        case '×':
            lambdaAbs = MULT
            break
        case 'EXP':
            lambdaAbs = EXP
            break
        case '≤':
            lambdaAbs = LEQ
            break
        case '=':
            lambdaAbs = EQ
            break
        case "REC":
            lambdaAbs = REC
            break
    }
    if (textContent.includes('nat')) {
        lambdaAbs = churchNat(Number(document.getElementById('in-church-nat').value))
    }
    return lambdaAbs
}

// add click event to all the element of the predefined lambda terms
document.querySelectorAll('#church-conditions li, #church-naturals li, #fixed-point li').forEach(item => {
    const lambdaAbs = textContentToLambdaAbs(item.textContent)
    item.addEventListener('click', () => {
        let text_
        if (item.textContent.includes('nat')) {
            const value = document.querySelector('#church-naturals li span input').value
            text_ = `nat_${value}`
        } else {
            const itemTextNode = Array.from(item.childNodes).filter(
                node => Array.from(node.classList).includes("item-text")
            )
            text_ = itemTextNode[0].textContent
        }
        const input = document.getElementById('lambda-term')
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const textToInsert = (text_ + " ")

        // Insert the text at the cursor position
        input.value = input.value.substring(0, start) + textToInsert + input.value.substring(end);

        // Adjust the cursor position
        input.selectionStart = input.selectionEnd = start + textToInsert.length;

        // Focus the input to show the cursor at the new position
        input.focus();
    }
    )
    item.lastChild.textContent = lambdaAbs
});

document.getElementById('in-church-nat').addEventListener('change', () => {
    const input = document.getElementById('in-church-nat')
    const lambdaAbs = churchNat(Number(input.value))
    input.parentNode.nextElementSibling.textContent = lambdaAbs
}
)


const sorts = ["nat", "boolean", "rec"]
function sameSort(element1, element2) {
    const array1 = Array.from(element1.classList)
    const array2 = Array.from(element2.classList)
    for (const sort of sorts) {
        if (array1.includes(sort) && array2.includes(sort)) {
            return true
        }

    }
    return false
}

// Collapsible menu functionality
document.querySelectorAll('.collapsible').forEach(collapsible => {
    collapsible.addEventListener('click', function () {
        document.querySelectorAll('.content').forEach(content => {
            if (sameSort(collapsible, content)) {
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                    collapsible.classList.remove('active')
                } else {
                    content.style.display = 'block';
                    collapsible.classList.add('active')
                }
            }
            else {
                content.style.display = 'none';
            }
        });

        // deactivate all other collapsible
        const other_collapsibles = Array.from(document.querySelectorAll('.collapsible')).filter(
            coll => { return !sameSort(coll, collapsible) }
        )
        for (const coll of other_collapsibles) {
            coll.classList.remove('active')
        }

        // make the output-section smaller (vertically)
        const isActive = Array.from(document.querySelectorAll('.collapsible')).map(
            el => { return el.classList.contains("active") }
        ).some(val => val)

        document.querySelector(".output-section").classList.toggle("smaller", isActive)



    });
});