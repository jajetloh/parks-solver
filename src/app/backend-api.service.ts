import { Inject, Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from "@angular/common/http"

@Injectable({
    providedIn: 'root'
})
export class BackendApiService {

    constructor(
        private http: HttpClient,
        @Inject('API_BASE_URL') private baseUrl: string
    ) {
    }

    solveBoard(board: number[][]): Promise<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }
        return this.http.post<any>(this.baseUrl + '/solve', board, httpOptions).toPromise()
    }
}
