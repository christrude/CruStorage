import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable()
export class SchoolsService {

  constructor(private http: HttpClient) { }

  retrieve(id, query): Observable<any> {
    return this.http.post<any>(`/api/schools/${id}`, query, {
      observe: 'response',
    })
  }
}
