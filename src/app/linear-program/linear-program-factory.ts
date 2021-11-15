type LPSolveType = 'Maximize' | 'Minimize'

export interface LPObjective {
    solveFor: LPSolveType
    objective: LPExpression[]
}

export type LPExpression = (string | [number, string])

export interface LPConstraint {
    name: string,
    expression: LPExpression[],
    operation: LPConstraintOperation,
    constant: number,
}

type LPConstraintOperation = '<=' | '=' | '>='
type LPVariableType = 'cont' | 'int' | 'bin'

interface LPVariable {
    name: string,
    type: LPVariableType,
    min?: number,
    max?: number,
}

export class LPFactory {

    objective: LPObjective = { solveFor: 'Minimize', objective: [] }
    constraints: {[k: string]: LPConstraint} = {}
    variables: {[k: string]: LPVariable} = {}

    constructor() {}

    setObjective(type: LPSolveType, expression: LPExpression[]) {
        this.objective = { solveFor: type, objective: expression }
    }

    addVariable(varName: string, type: LPVariableType = 'cont', min?: number, max?: number) {
        this.variables[varName] = { name: varName, type, min, max }
    }

    addConstraint(expression: LPExpression[], operation: LPConstraintOperation, constant: number = 0, name?: string) {
        if (name === undefined) name = 'C_' + `00000${Object.keys(this.constraints).length}`.substr(-6)

        if (name in this.constraints) {
            throw new Error(`Constraint with name ${name} already exists.`)
        }

        this.constraints[name] = { name, expression, operation, constant }
    }

    private formatExpression(expression: LPExpression[]): string {
        return expression
            .map(term => (typeof term === 'string' ? [1, term] : term) as [number, string])
            .map(([coeff, varName]) => `${coeff}${varName}`)
            .join(' + ')
    }

    reset() {
        this.objective = { solveFor: 'Minimize', objective: [] }
        this.constraints = {}
        this.variables = {}
    }

    compile(): string {
        let lpString = `${this.objective.solveFor}
OBJ: ${this.objective.objective.length === 0 ? 1 : this.formatExpression(this.objective.objective)}
Subject To
${Object.entries(this.constraints).map(([name, expr]) => name + ': ' + this.formatExpression(expr.expression) + ' ' + expr.operation + ' ' + expr.constant + '\n').join('')}
Binaries
${Object.entries(this.variables).filter(([k, v]) => v.type === "bin").map(([k, v]) => `${k} \n`).join('')}
End
`
        return splitLinesToSize(lpString, 255, '\n')
    }
}

function splitLinesToSize(input: string, maxLength: number, delimiter: string = '\n'): string {
    return input.split(delimiter).map(x => {
        const result = [x]
        for (let i of range(1000)) {
            if (result.slice(-1)[0].length > 100) {
                const last = result.splice(-1)[0]
                const splitIndex = last.slice(0, 100).lastIndexOf(' ')
                result.push(last.slice(0, splitIndex))
                result.push(last.slice(splitIndex + 1))
            } else {
                return result
            }
        }
        return result
    }).reduce((acc, x) => acc.concat(x), []).join(delimiter)
}

function range(n: number): number[] {
    return Object.keys([...new Array(n)]).map(x => Number(x))
}
