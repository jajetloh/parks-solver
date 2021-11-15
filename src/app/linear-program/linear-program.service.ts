import { Injectable, OnInit } from '@angular/core'
// @ts-ignore
import * as highs_loader from 'highs'
import { LPExpression, LPFactory } from "./linear-program-factory"

@Injectable({
    providedIn: 'root'
})
export class LinearProgramService implements OnInit {

    private highs: any
    public ready: Promise<any>
    lpFactory = new LPFactory()

    constructor() {
        this.ready = new Promise<any>((resolve, reject) => {
            this.loadHighs().then(result => {
                resolve(result)
            }).catch(e => reject(e))
        })
    }

    private async loadHighs() {
        this.highs = await highs_loader({})

        console.log('1!!!')
    }

    ngOnInit() {
    }

    solveBoard(board: number[][]) {
        this.lpFactory.reset()
        const boardSize = board.length
        for (const x of range(boardSize)) {
            for (const y of range(boardSize)) {
                this.lpFactory.addVariable(`v_${x}_${y}`, 'bin')
            }
        }

        const treesPerRowMap: {[k: number]: number} = {
            5: 1, 6: 1, 7: 1, 8: 1, 9: 2, 10: 2, 11: 2,
        }
        const treesPerRow: number = treesPerRowMap[boardSize]

        const colourCells: {[k: string]: [number, number][]} = {}
        board.forEach((row, x) => {
            row.forEach((colour, y) => {
                if (!(colour in colourCells)) colourCells[colour] = []
                colourCells[colour].push([x, y])
            })
        })

        for (const x of range(boardSize)) {
            this.lpFactory.addConstraint(range(boardSize).map(y => `v_${x}_${y}`), '=', treesPerRow)
        }

        for (const y of range(boardSize)) {
            this.lpFactory.addConstraint(range(boardSize).map(x => `v_${x}_${y}`), '=', treesPerRow)
        }

        Object.entries(colourCells).forEach(([colour, coords]) => {
            this.lpFactory.addConstraint(coords.map(([x, y]) => `v_${x}_${y}`), '=', treesPerRow)
        })

        for (const x of range(boardSize - 1)) {
            for (const y of range(boardSize - 1)) {
                this.lpFactory.addConstraint([`v_${x}_${y}`, `v_${x+1}_${y}`, `v_${x}_${y+1}`, `v_${x+1}_${y+1}`], '<=', 1)
            }
        }

        // Non-trivial, but dummy object function to reduce bug in HiGHS where binary variables can be 0.5 if multiple solutions available
        const dummyObjectiveExpr = range(boardSize).reduce((acc, x) => [...acc, ...range(boardSize).map(y => [boardSize * x + y, `v_${x}_${y}`] as [number, string])], [] as LPExpression[])

        this.lpFactory.setObjective("Minimize", dummyObjectiveExpr)

        const lpString = this.lpFactory.compile()

        const highsResult = this.highs.solve(lpString)

        const result = Object.entries(highsResult.Columns)
            .filter(([k,v]) => (v as any).Primal === 1)
            .map(([k,v]) => [Number(k.split('_')[1]), Number(k.split('_')[2])])
        console.log(result)
        return result
    }
}

function range(n: number): number[] {
    return Object.keys([...new Array(n)]).map(x => Number(x))
}
