import { Component, OnInit, ViewChild } from '@angular/core'
import { BackendApiService } from "../backend-api.service"

enum CellColour {
    Green = 'green',
    Red = 'red',
    LightBlue = 'deepskyblue',
    Orange = 'darkorange',
    Grey = 'grey',
    Purple = 'purple',
    Yellow = 'gold',
    DarkBlue = 'blue',
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

    // board: number[][] = [
    //     [0,1,1,1,1,2,2,3],
    //     [0,1,4,4,4,5,2,3],
    //     [0,1,1,4,5,5,3,3],
    //     [0,0,1,4,4,5,5,5],
    //     [6,0,1,4,4,4,5,7],
    //     [6,4,4,4,4,4,5,7],
    //     [6,4,4,4,4,4,5,7],
    //     [6,6,4,4,7,7,7,7],
    // ]
    result: any
    error: any

    boardSize: number = 8
    boardSizeIter: number[] = this.range(this.boardSize)
    cellSize: number = 50
    paddingSize: number = 10

    board: number[][] = this.range(this.boardSize).map(i => this.range(this.boardSize).map(j => 0))

    colours = Object.values(CellColour)
    selectedColourIndex = 0

    constructor(
        private apiService: BackendApiService
    ) {
    }

    ngOnInit(): void {
    }

    submitBoard() {
        // console.table(this.board)
        this.resetHighlights()
        this.apiService.solveBoard(this.board).then((result: number[][]) => {
            console.log(result)
            this.result = result

            const resultSequence: number[] = []

            for (const i of result) {
                resultSequence.push(i[0] * this.boardSize + i[1])
                console.log(i)
            }
            // @ts-ignore
            // const resultSequence = [...result].map(([i,j]) => i * this.boardSize + j)
            // const resultSequence = this.result.map(([i, j]) => i * this.boardSize + j)

            (new Array(...this.boardRef.nativeElement.firstElementChild.children))
                .filter((e: any, i: number) => resultSequence.includes(i))
                .forEach((e: any) => {
                e.style['stroke'] = 'black'
                e.style['stroke-width'] = 5
            })
        }).catch(error => {
            console.error('Oh no!', error)
        })
    }

    range(n: number): number[] {
        return Object.keys([...new Array(n)]).map(i => Number(i))
    }

    onBoardSizeChange() {
        this.boardSizeIter = this.range(this.boardSize)
        this.board = [...this.board.map(row => [...row, 0].slice(0, this.boardSize)), this.range(this.boardSize).map(i => 0)].slice(0, this.boardSize)
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
            // e.style['border-width'] = 1
            // e.style['border'] = 'white'
            e.style['stroke'] = null
            e.style['stroke-width'] = 1
        })
    }

}
