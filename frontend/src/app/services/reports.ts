import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly REPORTS_URL = 'http://localhost:5000/api/reports';
  private readonly EXPORT_URL = 'http://localhost:5000/api/export';

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.apiService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getSummaryReport(): Observable<any> {
    return this.http.get(
      `${this.REPORTS_URL}/summary`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getMonthlyReport(
    month?: number,
    year?: number
  ): Observable<any> {
    let url = `${this.REPORTS_URL}/monthly`;

    const params: string[] = [];

    if (month) {
      params.push(`month=${month}`);
    }

    if (year) {
      params.push(`year=${year}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get(
      url,
      {
        headers: this.getHeaders()
      }
    );
  }

  getTaxReport(year?: number): Observable<any> {
    let url = `${this.REPORTS_URL}/tax`;

    if (year) {
      url += `?year=${year}`;
    }

    return this.http.get(
      url,
      {
        headers: this.getHeaders()
      }
    );
  }

  downloadPDF(): Observable<Blob> {
    return this.http.get(
      `${this.EXPORT_URL}/pdf`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  downloadCSV(): Observable<Blob> {
    return this.http.get(
      `${this.EXPORT_URL}/csv`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }
}