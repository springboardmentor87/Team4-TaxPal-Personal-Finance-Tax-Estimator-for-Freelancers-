import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin } from 'rxjs';

import { Sidebar } from '../../components/sidebar/sidebar';
import { ReportService } from '../../services/reports';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Sidebar
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  reportForm: FormGroup;

  summaryReport: any = null;
  monthlyReport: any = null;
  taxReport: any = null;

  selectedReportType = '';

  isLoading = false;

  isDownloadingPDF = false;
  isDownloadingCSV = false;

  errorMessage = '';
  successMessage = '';

  readonly reportTypes = [
    'Summary Report',
    'Monthly Report',
    'Quarterly Report',
    'Tax Report'
  ];

  readonly months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  readonly currentYear = new Date().getFullYear();

  readonly years = Array.from(
    { length: 7 },
    (_, index) => this.currentYear - 5 + index
  );

  constructor(
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private changeDetectorRef: ChangeDetectorRef
  ) {

    this.reportForm = this.formBuilder.group({
      type: [
        'Summary Report',
        Validators.required
      ],

      month: [
        new Date().getMonth() + 1,
        Validators.required
      ],

      year: [
        this.currentYear,
        Validators.required
      ],

      quarter: [
        1,
        Validators.required
      ]
    });
  }

  ngOnInit(): void {

    /*
     * Do NOT automatically generate a report.
     */

    this.selectedReportType = '';

    this.isLoading = false;

    this.clearReports();

    this.changeDetectorRef.detectChanges();
  }

  // ==========================================
  // Generate Report
  // ==========================================

  generateReport(): void {

    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (this.reportForm.invalid) {

      this.reportForm.markAllAsTouched();

      this.errorMessage =
        'Please select valid report options.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    const type =
      this.reportForm.get('type')?.value;

    if (!type) {

      this.errorMessage =
        'Please select a report type.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    /*
     * Remove any previously displayed report.
     */

    this.clearReports();

    this.selectedReportType = type;

    /*
     * Start loading immediately.
     */

    this.isLoading = true;

    this.changeDetectorRef.detectChanges();

    if (type === 'Summary Report') {

      this.loadSummaryReport();

      return;
    }

    if (type === 'Monthly Report') {

      this.loadMonthlyReport();

      return;
    }

    if (type === 'Quarterly Report') {

      this.loadQuarterlyReport();

      return;
    }

    if (type === 'Tax Report') {

      this.loadTaxReport();

      return;
    }

    this.isLoading = false;

    this.errorMessage =
      'Invalid report type.';

    this.changeDetectorRef.detectChanges();
  }

  // ==========================================
  // Summary Report
  // ==========================================

  private loadSummaryReport(): void {

    this.reportService
      .getSummaryReport()
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

        })
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Summary report response:',
            response
          );

          if (
            response?.success === true &&
            response?.report
          ) {

            this.summaryReport =
              response.report;

            this.selectedReportType =
              'Summary Report';

            this.successMessage =
              'Summary report loaded successfully.';

          } else {

            this.summaryReport = null;

            this.errorMessage =
              'Invalid summary report response.';
          }

          this.changeDetectorRef.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Summary report error:',
            error
          );

          this.summaryReport = null;

          this.handleError(
            error,
            'Unable to load summary report.'
          );

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==========================================
  // Monthly Report
  // ==========================================

  private loadMonthlyReport(): void {

    const month =
      Number(
        this.reportForm.get('month')?.value
      );

    const year =
      Number(
        this.reportForm.get('year')?.value
      );

    if (
      !month ||
      month < 1 ||
      month > 12 ||
      !year
    ) {

      this.isLoading = false;

      this.errorMessage =
        'Please select a valid month and year.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.reportService
      .getMonthlyReport(month, year)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

        })
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Monthly report response:',
            response
          );

          if (
            response?.success === true &&
            response?.report
          ) {

            this.monthlyReport =
              response.report;

            this.selectedReportType =
              'Monthly Report';

            this.successMessage =
              'Monthly report loaded successfully.';

          } else {

            this.monthlyReport = null;

            this.errorMessage =
              'Invalid monthly report response.';
          }

          this.changeDetectorRef.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Monthly report error:',
            error
          );

          this.monthlyReport = null;

          this.handleError(
            error,
            'Unable to load monthly report.'
          );

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==========================================
  // Quarterly Report
  // ==========================================

  private loadQuarterlyReport(): void {

    const quarter =
      Number(
        this.reportForm.get('quarter')?.value
      );

    const year =
      Number(
        this.reportForm.get('year')?.value
      );

    if (
      !quarter ||
      quarter < 1 ||
      quarter > 4 ||
      !year
    ) {

      this.isLoading = false;

      this.errorMessage =
        'Please select a valid quarter and year.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    const startMonth =
      (quarter - 1) * 3 + 1;

    const requests = [

      this.reportService.getMonthlyReport(
        startMonth,
        year
      ),

      this.reportService.getMonthlyReport(
        startMonth + 1,
        year
      ),

      this.reportService.getMonthlyReport(
        startMonth + 2,
        year
      )

    ];

    forkJoin(requests)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

        })
      )
      .subscribe({

        next: (responses: any[]) => {

          console.log(
            'Quarterly report responses:',
            responses
          );

          const monthlyReports =
            responses.map(
              response =>
                response?.report ?? null
            );

          this.buildQuarterlyReport(
            monthlyReports,
            quarter,
            year
          );

          this.selectedReportType =
            'Quarterly Report';

          this.successMessage =
            'Quarterly report loaded successfully.';

          this.changeDetectorRef.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Quarterly report error:',
            error
          );

          this.monthlyReport = null;

          this.handleError(
            error,
            'Unable to load quarterly report.'
          );

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==========================================
  // Build Quarterly Report
  // ==========================================

  private buildQuarterlyReport(
    monthlyReports: any[],
    quarter: number,
    year: number
  ): void {

    let totalIncome = 0;

    let totalExpense = 0;

    let transactionCount = 0;

    const incomeByCategory:
      Record<string, number> = {};

    const expenseByCategory:
      Record<string, number> = {};

    monthlyReports.forEach(report => {

      if (!report) {
        return;
      }

      totalIncome +=
        Number(report.totalIncome || 0);

      totalExpense +=
        Number(report.totalExpense || 0);

      transactionCount +=
        Number(report.transactionCount || 0);

      this.mergeCategoryData(
        incomeByCategory,
        report.incomeByCategory
      );

      this.mergeCategoryData(
        expenseByCategory,
        report.expenseByCategory
      );
    });

    this.monthlyReport = {

      quarter,

      year,

      totalIncome,

      totalExpense,

      balance:
        totalIncome - totalExpense,

      transactionCount,

      incomeByCategory,

      expenseByCategory,

      monthlyReports
    };
  }

  // ==========================================
  // Merge Category Data
  // ==========================================

  private mergeCategoryData(
    target: Record<string, number>,
    source: any
  ): void {

    if (
      !source ||
      typeof source !== 'object'
    ) {
      return;
    }

    Object.keys(source).forEach(category => {

      target[category] =
        (target[category] || 0) +
        Number(source[category] || 0);

    });
  }

  // ==========================================
  // Tax Report
  // ==========================================

  private loadTaxReport(): void {

    const year =
      Number(
        this.reportForm.get('year')?.value
      );

    if (!year) {

      this.isLoading = false;

      this.errorMessage =
        'Please select a valid year.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.reportService
      .getTaxReport(year)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

        })
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Tax report response:',
            response
          );

          if (
            response?.success === true &&
            response?.report
          ) {

            this.taxReport =
              response.report;

            this.selectedReportType =
              'Tax Report';

            this.successMessage =
              'Tax report loaded successfully.';

          } else {

            this.taxReport = null;

            this.errorMessage =
              'Invalid tax report response.';
          }

          this.changeDetectorRef.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Tax report error:',
            error
          );

          this.taxReport = null;

          this.handleError(
            error,
            'Unable to load tax report.'
          );

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==========================================
  // Reset
  // ==========================================

  resetForm(): void {

    this.reportForm.reset({

      type: 'Summary Report',

      month:
        new Date().getMonth() + 1,

      year:
        this.currentYear,

      quarter: 1

    });

    this.selectedReportType = '';

    this.errorMessage = '';

    this.successMessage = '';

    this.isLoading = false;

    this.clearReports();

    this.changeDetectorRef.detectChanges();
  }

  // ==========================================
  // Clear Reports
  // ==========================================

  private clearReports(): void {

    this.summaryReport = null;

    this.monthlyReport = null;

    this.taxReport = null;
  }

  // ==========================================
  // PDF Download
  // ==========================================

  downloadPDF(): void {

    if (this.isDownloadingPDF) {
      return;
    }

    this.isDownloadingPDF = true;

    this.errorMessage = '';

    this.changeDetectorRef.detectChanges();

    this.reportService
      .downloadPDF()
      .pipe(
        finalize(() => {

          this.isDownloadingPDF = false;

          this.changeDetectorRef.detectChanges();

        })
      )
      .subscribe({

        next: blob => {

          this.downloadBlob(
            blob,
            'TaxPal_Report.pdf'
          );

          this.successMessage =
            'PDF report downloaded successfully.';

          this.changeDetectorRef.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          this.handleError(
            error,
            'Unable to download PDF report.'
          );

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==========================================
  // CSV Download
  // ==========================================

  downloadCSV(): void {

    if (this.isDownloadingCSV) {
      return;
    }

    this.isDownloadingCSV = true;

    this.errorMessage = '';

    this.changeDetectorRef.detectChanges();

    this.reportService
      .downloadCSV()
      .pipe(
        finalize(() => {

          this.isDownloadingCSV = false;

          this.changeDetectorRef.detectChanges();

        })
      )
      .subscribe({

        next: blob => {

          this.downloadBlob(
            blob,
            'TaxPal_Report.csv'
          );

          this.successMessage =
            'CSV report downloaded successfully.';

          this.changeDetectorRef.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          this.handleError(
            error,
            'Unable to download CSV report.'
          );

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  // ==========================================
  // Download Blob
  // ==========================================

  private downloadBlob(
    blob: Blob,
    fileName: string
  ): void {

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  // ==========================================
  // Print
  // ==========================================

  printReport(): void {

    window.print();
  }

  // ==========================================
  // Object Keys
  // ==========================================

  objectKeys(obj: any): string[] {

    return obj
      ? Object.keys(obj)
      : [];
  }

  // ==========================================
  // Error Handling
  // ==========================================

  private handleError(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): void {

    this.isLoading = false;

    this.errorMessage =
      error?.error?.message ||
      'Something went wrong.';

    this.changeDetectorRef.detectChanges();
  }
}