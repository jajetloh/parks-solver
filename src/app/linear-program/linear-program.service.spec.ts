import { TestBed } from '@angular/core/testing'

import { LinearProgramService } from './linear-program.service'

describe('LinearProgramService', () => {
    let service: LinearProgramService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(LinearProgramService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
