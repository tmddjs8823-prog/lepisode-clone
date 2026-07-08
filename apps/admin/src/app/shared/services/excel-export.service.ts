import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExcelColumn {
  /** 데이터 객체의 key */
  key: string;
  /** 엑셀 헤더에 표시될 이름 */
  header: string;
  /** 값 변환 함수 (optional) */
  transform?: (value: unknown, row: Record<string, unknown>) => unknown;
}

@Injectable({ providedIn: 'root' })
export class ExcelExportService {

  /**
   * 데이터 배열을 .xlsx 파일로 다운로드합니다.
   * @param data     - 내보낼 데이터 배열
   * @param columns  - 컬럼 정의 (key → header 매핑)
   * @param filename - 파일명 (.xlsx 확장자 자동 추가)
   * @param sheetName - 시트 이름 (기본: 'Sheet1')
   */
  export<T extends Record<string, unknown>>(
    data: T[],
    columns: ExcelColumn[],
    filename: string,
    sheetName = 'Sheet1',
  ): void {
    // 1) 헤더 행
    const headers = columns.map(c => c.header);

    // 2) 데이터 행 변환
    const rows = data.map(row =>
      columns.map(col => {
        const raw = row[col.key];
        if (col.transform) return col.transform(raw, row);
        return this.formatValue(raw);
      }),
    );

    // 3) 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // 4) 컬럼 너비 자동 조정
    ws['!cols'] = columns.map((col, i) => {
      const maxLen = Math.max(
        col.header.length,
        ...rows.map(r => String(r[i] ?? '').length),
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
    });

    // 5) 워크북 생성 & 다운로드
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** 값 타입에 따라 자동 포맷 */
  private formatValue(value: unknown): unknown {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Y' : 'N';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return value.slice(0, 10); // ISO → yyyy-MM-dd
    }
    return value;
  }
}
