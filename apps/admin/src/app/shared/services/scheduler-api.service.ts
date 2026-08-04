import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1/scheduler';

export interface SchedulerTask {
  id: number;
  taskKey: string;
  name: string;
  description: string | null;
  cronExpr: string;
  enabled: boolean;
  lastRunAt: string | null;
  lastResult: string | null;
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SchedulerApiService {
  private http = inject(HttpClient);

  getAll(): Observable<SchedulerTask[]> {
    return this.http.get<SchedulerTask[]>(API);
  }

  toggle(taskKey: string): Observable<{ enabled: boolean }> {
    return this.http.post<{ enabled: boolean }>(`${API}/${taskKey}/toggle`, {});
  }

  updateCron(taskKey: string, cronExpr: string): Observable<void> {
    return this.http.put<void>(`${API}/${taskKey}/cron`, { cronExpr });
  }

  runNow(taskKey: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/${taskKey}/run`, {});
  }
}
