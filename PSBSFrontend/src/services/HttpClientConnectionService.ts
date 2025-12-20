import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, first, throwError } from 'rxjs';
import { createUrl } from '../utility/config';

@Injectable({
  providedIn: 'root',
})
export class HttpClientConnectionService {
  constructor(private http: HttpClient) {}

  // GetData(_url: string) {
  //   _url = createUrl(_url);
  //   return this.http.get(_url, { withCredentials: true }).pipe(first());
  // }

  GetData<T>(_url: string) {
  _url = createUrl(_url);
  return this.http.get<T>(_url, { withCredentials: true }).pipe(first());
}

  GetDataById(_url: string, _id: string) {
    _url = createUrl(_url) + '/' + _id;
    return this.http
      .get(_url, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
  GetDataByParams(_url: string, _params: any) {
    _url = createUrl(_url);
    return this.http
      .get(_url, { params: _params, withCredentials: true })
      .pipe(catchError(this.handleError));
  }
  PostData(_url: string, _postdata: any) {
    _url = createUrl(_url);
    return this.http
      .post(_url, _postdata, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  PostDataWithFile(_url: string, _postdata: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      }),
    };
    _url = createUrl(_url);
    return this.http
      .post(_url, _postdata, httpOptions)
      .pipe(catchError(this.handleError));
  }

  PutData(_url: string, _params: any, _putdata: any) {
    _url = createUrl(_url) + '/' + _params;
    return this.http
      .put(_url, _putdata, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  PutDataWithFile(_url: string, _putdata: any, _params: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      }),
    };
    _url = createUrl(_url) + '/' + _params;
    return this.http
      .put(_url, _putdata, httpOptions)
      .pipe(catchError(this.handleError));
  }

  DeleteData(_url: string) {
    _url = createUrl(_url);
    return this.http
      .delete(_url, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
  private handleError(error: Response) {
    return throwError(error);
  }
}