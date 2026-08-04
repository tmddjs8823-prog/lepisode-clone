import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1/health';

export interface HealthMemoryUsage {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

export interface HealthServerInfo {
  status: 'up' | 'down';
  uptime: number;
  nodeVersion: string;
  platform: string;
  pid: number;
  memoryUsage: HealthMemoryUsage;
}

export interface HealthCheckResult {
  status: 'ok' | 'error';
  info: {
    database?: { status: 'up' | 'down' };
    memory_rss?: { status: 'up' | 'down' };
    memory_heap?: { status: 'up' | 'down' };
    disk?: { status: 'up' | 'down' };
    server?: HealthServerInfo;
    [key: string]: unknown;
  };
  error: Record<string, unknown>;
  details: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class HealthApiService {
  private http = inject(HttpClient);

  check(): Observable<HealthCheckResult> {
    return this.http.get<HealthCheckResult>(API);
  }
}
