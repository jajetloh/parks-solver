import { Component, OnInit, ViewChild } from '@angular/core'
import { LinearProgramService, SolveResult } from "../linear-program/linear-program.service"
import { cloneDeep } from 'lodash-es'

enum CellColour {
    Green = 'green',
    Red = 'red',
    LightBlue = 'aqua',
    Orange = 'darkorange',
    Grey = 'grey',
    Purple = 'darkviolet',
    Yellow = 'gold',
    DarkBlue = 'royalblue',
    Brown = 'brown',
    Lime = 'lime',
    Pink = 'pink',
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    @ViewChild('boardRef') boardRef: any

    presetBoards: {[k: string]: number[][]} = {
        '6x6 L2-1': [
            [2,2,1,1,1,1],
            [2,2,1,1,1,1],
            [0,2,2,2,2,4],
            [0,2,2,3,4,4],
            [0,0,0,3,4,5],
            [0,0,4,4,4,5],
        ],
        '7x7 Pathologic': [
            [0,0,0,0,4,0,0],
            [0,0,2,0,4,0,0],
            [1,0,2,0,4,5,5],
            [1,0,0,0,4,5,6],
            [1,3,3,3,5,5,6],
            [1,1,0,0,0,6,6],
            [1,1,0,0,0,0,0],
        ],
        '8x8 Test': [
            [0,1,1,1,1,2,2,3],
            [0,1,4,4,4,5,2,3],
            [0,1,1,4,5,5,3,3],
            [0,0,1,4,4,5,5,5],
            [6,0,1,4,4,4,5,7],
            [6,4,4,4,4,4,5,7],
            [6,4,4,4,4,4,5,7],
            [6,6,4,4,7,7,7,7],
        ],
        '9x9 L5-1': [
            [8,8,8,8,8,1,5,5,2],
            [8,7,7,7,1,1,5,5,2],
            [8,8,8,8,8,1,5,2,2],
            [0,8,8,8,8,1,5,5,2],
            [0,0,0,0,0,1,3,3,2],
            [0,0,0,4,4,1,3,3,3],
            [0,0,6,4,3,1,3,3,3],
            [0,6,6,4,3,1,3,3,3],
            [0,6,6,4,3,3,3,3,3],
        ],
        '11x11 L7-19': [
            [5,5,0,0,1,1,1,7,7,7,7],
            [5,0,0,0,0,1,1,1,7,7,7],
            [5,0,0,0,6,6,6,6,7,7,7],
            [5,5,0,0,6,6,6,7,7,7,8],
            [5,4,6,6,6,10,6,10,7,8,8],
            [4,4,4,2,2,10,10,10,10,8,9],
            [4,4,4,2,2,2,10,10,10,8,9],
            [3,4,2,2,2,2,2,10,8,8,9],
            [3,3,2,2,2,2,9,9,9,9,9],
            [3,3,3,3,2,2,9,9,9,9,9],
            [3,3,3,3,2,9,9,9,9,9,9],
        ]
    }

    presetBoardNames = Object.keys(this.presetBoards)
    selectedPreset: string = '8x8 Test'

    result: any
    error: any

    boardSize: number = 8
    boardSizeIter: number[] = this.range(this.boardSize)
    cellSize: number = 50
    paddingSize: number = 10
    borderPad: number = 10

    board: number[][] = this.range(this.boardSize).map(i => this.range(this.boardSize).map(j => 0))

    colours = Object.values(CellColour)
    selectedColourIndex = 0

    statusMessage: { show: boolean, message: string, class: string } = { show: false, message: '', class: '' }

    constructor(
        private lpService: LinearProgramService,
    ) {
    }

    ngOnInit(): void {
    }

    submitBoard() {
        this.resetHighlights()
        const solveResult: SolveResult<number[][]> = this.lpService.solveBoard(this.board)

        if (solveResult.status === 'Success') {
            this.result = solveResult.result
            const resultSequence: number[] = []
            for (const i of this.result) {
                resultSequence.push(i[0] * this.boardSize + i[1])
            }
            (new Array(...this.boardRef.nativeElement.firstElementChild.children))
                .filter((e: any, i: number) => resultSequence.includes(i))
                .forEach((e: any) => {
                    e.style['stroke'] = 'black'
                    e.style['stroke-width'] = 5
                })
            this.statusMessage = { show: true, message: 'Board successfully solved.', class: 'text-success' }
        } else {
            this.statusMessage = { show: true, message: 'No solution found.', class: 'text-danger' }
        }
    }

    range(n: number): number[] {
        return Object.keys([...new Array(n)]).map(i => Number(i))
    }

    onBoardSizeChange() {
        this.boardSizeIter = this.range(this.boardSize)
        this.board = [...this.board.map(row => [...row, ...this.range(this.boardSize).map(x => 0)].slice(0, this.boardSize)), ...this.range(this.boardSize).map(x => this.range(this.boardSize).map(i => 0))].slice(0, this.boardSize)
    }


    onCellMouseEnter(i: number, j: number, event: any) {
        if (event.buttons === 1) {
            this.changeCellColour(i, j, event.currentTarget)
        }
    }

    onCellMouseDown(i: number, j: number, event: any) {
        this.changeCellColour(i, j, event.currentTarget)
    }

    changeCellColour(i: number, j: number, target: any) {
        target.style.fill = this.colours[this.selectedColourIndex]
        this.board[i][j] = this.selectedColourIndex
    }

    onColourClick(index: number) {
        this.selectedColourIndex = index
    }

    resetHighlights() {
        const cellRefs = [...this.boardRef.nativeElement.firstElementChild.children]
        cellRefs.forEach(e => {
            e.style['stroke'] = null
            e.style['stroke-width'] = 1
        })
    }

    async usePreset(presetName: string) {

        this.resetHighlights()
        this.board = cloneDeep(this.presetBoards[presetName])
        this.boardSize = this.board.length
        this.boardSizeIter = this.range(this.boardSize)

        // Timeout to avoid race condition where DOM has not updated yet before colour styling is applied
        setTimeout(() => {
            const cellRefs = this.boardRef.nativeElement.children[0].children

            this.board.forEach((row, x) => {
                row.forEach((colourNumber, y) => {
                    cellRefs[x * this.boardSize + y].style.fill = this.colours[colourNumber]
                })
            })
        }, 1)
    }

}
