import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../shared/services/i18n.service';

@Component({
  selector: 'app-home-ja',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-ja.component.html',
  styleUrl: './home-ja.component.css',
})
export class HomeJaComponent {
  i18n = inject(I18nService);

  readonly services = [
    { icon: '🤖', title: 'AIソリューション', desc: '自然言語処理・OCR・自動化で\nビジネスを革新します', tags: ['NLP', 'OCR', '自動化'] },
    { icon: '🔷', title: 'プラットフォーム', desc: 'SaaS・B2B・ERPなど\n企業向けプラットフォーム構築', tags: ['SaaS', 'B2B', 'ERP'] },
    { icon: '📱', title: 'ウェブ / アプリ開発', desc: 'フロントエンド・モバイルアプリ\nの企画から開発まで', tags: ['React', 'Flutter', 'API'] },
    { icon: '🏛️', title: 'ビジネスソリューション', desc: 'CRM・ERP・POSなど\n業務効率化ソリューション', tags: ['CRM', 'ERP', 'POS'] },
    { icon: '📣', title: 'マーケティング', desc: 'SNSマーケティング・BI\nブランドデザイン', tags: ['SNS', 'BI', 'SEO'] },
    { icon: '☁️', title: 'ホスティング', desc: 'AWS・GCP基盤の\n安定したインフラ運用', tags: ['AWS', 'GCP', 'DevOps'] },
  ];

  readonly strengths = [
    { num: '200+', label: 'プロジェクト実績', icon: '📂' },
    { num: '7', label: '受賞実績 (2024〜2025)', icon: '🏆' },
    { num: '50+', label: '専門人材', icon: '👥' },
    { num: '24/7', label: 'モニタリング', icon: '🛡️' },
  ];

  readonly processes = [
    { step: '01', title: 'ヒアリング', desc: 'ビジネス課題と\n目標を把握します' },
    { step: '02', title: '企画・設計', desc: '最適なソリューションを\nご提案します' },
    { step: '03', title: '開発・実装', desc: '専門チームが\n開発を進めます' },
    { step: '04', title: '納品・運用', desc: '運用サポートと\n保守を提供します' },
  ];
}
