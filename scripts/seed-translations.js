const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'nav.about', ko: '회사 소개', en: 'About Us', ja: '会社紹介' },
  { key: 'nav.about.intro', ko: '회사소개', en: 'Company', ja: '会社概要' },
  { key: 'nav.about.careers', ko: '채용', en: 'Careers', ja: '採用情報' },
  { key: 'nav.about.blog', ko: '블로그', en: 'Blog', ja: 'ブログ' },
  { key: 'nav.about.techblog', ko: '개발 블로그', en: 'Tech Blog', ja: '開発ブログ' },
  { key: 'nav.portfolio', ko: '포트폴리오', en: 'Portfolio', ja: 'ポートフォリオ' },
  { key: 'nav.portfolio.list', ko: '포트폴리오', en: 'Portfolio', ja: 'ポートフォリオ' },
  { key: 'nav.portfolio.services', ko: '서비스 소개', en: 'Services', ja: 'サービス紹介' },
  { key: 'nav.status', ko: '작업현황', en: 'Status', ja: '作業状況' },
  { key: 'nav.support', ko: '지원사업', en: 'Programs', ja: '支援事業' },
  { key: 'nav.support.find', ko: '지원사업 찾기', en: 'Find Programs', ja: '支援事業を探す' },
  { key: 'nav.marketing', ko: '마케팅·호스팅', en: 'Marketing·Hosting', ja: 'マーケティング·ホスティング' },
  { key: 'nav.cs', ko: '고객센터', en: 'Support', ja: 'サポート' },
  { key: 'nav.cs.faq', ko: 'FAQ', en: 'FAQ', ja: 'FAQ' },
  { key: 'nav.cs.notice', ko: '공지사항', en: 'Notice', ja: 'お知らせ' },
  { key: 'nav.cs.event', ko: '이벤트', en: 'Events', ja: 'イベント' },
  { key: 'footer.company', ko: '업체명 : 레피소드', en: 'Company : LEPISODE', ja: '会社名：レピソード' },
  { key: 'footer.ceo', ko: '대표자명 : 양주성', en: 'CEO : Juseong Yang', ja: '代表者名：ヤン・ジュソン' },
  { key: 'footer.biz_no', ko: '사업자번호 : 277-87-01880', en: 'Business No. : 277-87-01880', ja: '事業者番号：277-87-01880' },
  { key: 'footer.address', ko: '주소 : 광주광역시 남구 대남대로 388, 3층', en: 'Address : 388 Daenam-daero, Nam-gu, Gwangju, 3F', ja: '住所：光州広域市南区大南大路388、3階' },
  { key: 'footer.support', ko: '고객지원 : 062-675-2314 Email : help@lepisode.team', en: 'Support : 062-675-2314 Email : help@lepisode.team', ja: 'サポート：062-675-2314 Email：help@lepisode.team' },
  { key: 'footer.privacy', ko: '개인정보취급방침', en: 'Privacy Policy', ja: 'プライバシーポリシー' },
  { key: 'footer.terms', ko: '서비스 이용약관', en: 'Terms of Service', ja: '利用規約' },
  { key: 'footer.marketing', ko: '마케팅 수신동의 약관', en: 'Marketing Agreement', ja: 'マーケティング受信同意' },
  { key: 'inquiry.title', ko: '문의하기', en: 'Contact Us', ja: 'お問い合わせ' },
  { key: 'inquiry.desc', ko: '이름, 연락처, 이메일을 남겨주시면 확인 후 연락드리겠습니다.', en: 'Leave your name, phone, and email. We will contact you soon.', ja: 'お名前、連絡先、メールをご入力ください。確認後ご連絡いたします。' },
  { key: 'inquiry.name', ko: '이름', en: 'Name', ja: 'お名前' },
  { key: 'inquiry.email', ko: '이메일', en: 'Email', ja: 'メール' },
  { key: 'inquiry.phone', ko: '연락처', en: 'Phone', ja: '電話番号' },
  { key: 'inquiry.submit', ko: '문의 접수하기', en: 'Submit Inquiry', ja: 'お問い合わせ送信' },
  { key: 'inquiry.submitting', ko: '접수 중...', en: 'Submitting...', ja: '送信中...' },
  { key: 'inquiry.success_title', ko: '문의가 접수되었습니다', en: 'Inquiry Submitted', ja: 'お問い合わせを受け付けました' },
  { key: 'inquiry.success_desc', ko: '빠른 시일 내에 연락드리겠습니다.', en: 'We will contact you shortly.', ja: '近日中にご連絡いたします。' },
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
