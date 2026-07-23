const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  {
    key: 'home.hero.title',
    ko: '기획부터 AI까지, 디지털 전환의<br>모든 것을 한 곳에서.',
    en: 'From Planning to AI,<br>All-in-One Digital Transformation.',
    ja: '企画からAIまで、デジタル変革の<br>すべてをワンストップで。',
  },
  {
    key: 'home.hero.desc',
    ko: '앱·웹 개발, 키오스크, AI 솔루션, SNS 마케팅까지<br>레피소드가 AX·DX 전환의 모든 단계를 함께 설계합니다.',
    en: 'App & Web Development, Kiosk, AI Solutions, SNS Marketing<br>LEPISODE designs every step of your AX·DX transformation.',
    ja: 'アプリ・Web開発、キオスク、AIソリューション、SNSマーケティングまで<br>レピソードがAX・DX推進のすべてのステップを共に設計します。',
  },
  {
    key: 'home.onestop.prefix',
    ko: '아이디어부터 운영까지,',
    en: 'From Idea to Operations,',
    ja: 'アイデアから運用まで、',
  },
  {
    key: 'home.onestop.highlight',
    ko: '원스톱 서비스',
    en: 'One-Stop Service',
    ja: 'ワンストップサービス',
  },
  {
    key: 'home.service.0',
    ko: 'AI 솔루션',
    en: 'AI Solutions',
    ja: 'AIソリューション',
  },
  {
    key: 'home.service.1',
    ko: '플랫폼',
    en: 'Platform',
    ja: 'プラットフォーム',
  },
  {
    key: 'home.service.2',
    ko: '비즈니스 솔루션',
    en: 'Business Solutions',
    ja: 'ビジネスソリューション',
  },
  {
    key: 'home.service.3',
    ko: '웹/앱 개발',
    en: 'Web / App Dev',
    ja: 'ウェブ/アプリ開発',
  },
  {
    key: 'home.service.4',
    ko: '키오스크',
    en: 'Kiosk',
    ja: 'キオスク',
  },
  {
    key: 'home.service.5',
    ko: '브랜딩/마케팅',
    en: 'Branding / Marketing',
    ja: 'ブランディング/マーケティング',
  },
];

async function main() {
  let count = 0;
  for (const t of translations) {
    await prisma.translation.upsert({
      where: { key: t.key },
      create: t,
      update: { ko: t.ko, en: t.en, ja: t.ja },
    });
    count++;
    console.log(`[${count}/${translations.length}] ${t.key}`);
  }
  console.log(`\nDone! ${count} translations inserted.`);
  await prisma.$disconnect();
}

main().catch(console.error);
