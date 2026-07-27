/**
 * 번역 데이터 일괄 주입 스크립트 (Prisma 직접 사용)
 * 실행: node apps/client/seed-translations.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const translations = [
  // ── Home ──
  { key: 'home.hero.title', ko: '기획부터 AI까지, 디지털 전환의<br>모든 것을 한 곳에서.', en: 'From Planning to AI,<br>Everything for Digital Transformation in One Place.', ja: '企画からAIまで、デジタル転換の<br>すべてをワンストップで。' },
  { key: 'home.hero.desc', ko: '앱·웹 개발, 키오스크, AI 솔루션, SNS 마케팅까지<br>레피소드가 AX·DX 전환의 모든 단계를 함께 설계합니다.', en: 'App/Web development, kiosk, AI solutions, SNS marketing<br>LEPISODE designs every step of AX·DX transformation together.', ja: 'アプリ・Web開発、キオスク、AIソリューション、SNSマーケティングまで<br>LEPISODEがAX・DX転換のすべての段階を共に設計します。' },
  { key: 'home.onestop.prefix', ko: '아이디어부터 운영까지,', en: 'From Idea to Operation,', ja: 'アイデアから運営まで、' },
  { key: 'home.onestop.highlight', ko: '원스톱 서비스', en: 'One-Stop Service', ja: 'ワンストップサービス' },
  { key: 'home.service.0', ko: 'AI 솔루션', en: 'AI Solutions', ja: 'AIソリューション' },
  { key: 'home.service.1', ko: '플랫폼', en: 'Platform', ja: 'プラットフォーム' },
  { key: 'home.service.2', ko: '비즈니스 솔루션', en: 'Business Solutions', ja: 'ビジネスソリューション' },
  { key: 'home.service.3', ko: '웹/앱 개발', en: 'Web/App Dev', ja: 'ウェブ/アプリ開発' },
  { key: 'home.service.4', ko: '키오스크', en: 'Kiosk', ja: 'キオスク' },
  { key: 'home.service.5', ko: '브랜딩/마케팅', en: 'Branding/Marketing', ja: 'ブランディング/マーケティング' },

  // ── Footer ──
  { key: 'footer.company', ko: '업체명 : 레피소드', en: 'Company : LEPISODE', ja: '会社名 : LEPISODE' },
  { key: 'footer.ceo', ko: '대표자명 : 양주성', en: 'CEO : Juseong Yang', ja: '代表者 : ヤン・ジュソン' },
  { key: 'footer.biz_no', ko: '사업자번호 : 277-87-01880', en: 'Business No : 277-87-01880', ja: '事業者番号 : 277-87-01880' },
  { key: 'footer.address', ko: '주소 : 광주광역시 남구 대남대로 388, 3층', en: 'Address : 388, Daenam-daero, Nam-gu, Gwangju, 3F', ja: '住所 : 光州広域市南区大南大路388, 3階' },
  { key: 'footer.support', ko: '고객지원 : 062-675-2314 Email : help@lepisode.team', en: 'Support : 062-675-2314 Email : help@lepisode.team', ja: 'サポート : 062-675-2314 Email : help@lepisode.team' },
  { key: 'footer.privacy', ko: '개인정보취급방침', en: 'Privacy Policy', ja: '個人情報保護方針' },
  { key: 'footer.terms', ko: '서비스 이용약관', en: 'Terms of Service', ja: '利用規約' },
  { key: 'footer.marketing', ko: '마케팅 수신동의 약관', en: 'Marketing Agreement', ja: 'マーケティング同意規約' },

  // ── Inquiry Modal ──
  { key: 'inquiry.title', ko: '문의하기', en: 'Contact Us', ja: 'お問い合わせ' },
  { key: 'inquiry.desc', ko: '이름, 연락처, 이메일을 남겨주시면 확인 후 연락드리겠습니다.', en: 'Leave your name, phone, and email. We will contact you after confirmation.', ja: 'お名前、連絡先、メールアドレスをご入力ください。確認後ご連絡いたします。' },
  { key: 'inquiry.success_title', ko: '문의가 접수되었습니다', en: 'Inquiry Submitted', ja: 'お問い合わせを受け付けました' },
  { key: 'inquiry.success_desc', ko: '빠른 시일 내에 연락드리겠습니다.', en: 'We will contact you shortly.', ja: '早急にご連絡いたします。' },
  { key: 'inquiry.name', ko: '이름', en: 'Name', ja: 'お名前' },
  { key: 'inquiry.email', ko: '이메일', en: 'Email', ja: 'メールアドレス' },
  { key: 'inquiry.phone', ko: '연락처', en: 'Phone', ja: '電話番号' },
  { key: 'inquiry.submit', ko: '문의 접수하기', en: 'Submit Inquiry', ja: 'お問い合わせを送信' },
  { key: 'inquiry.submitting', ko: '접수 중...', en: 'Submitting...', ja: '送信中...' },

  // ── About ──
  { key: 'about.label', ko: '회사 소개', en: 'About Us', ja: '会社紹介' },
  { key: 'about.hero.title', ko: '레피소드의 <span class="text-indigo-600">철학</span>', en: 'LEPISODE\'s <span class="text-indigo-600">Philosophy</span>', ja: 'LEPISODEの<span class="text-indigo-600">哲学</span>' },
  { key: 'about.hero.desc', ko: '고객의 성장이 곧 우리의 성장이라는 믿음으로<br class="hidden md:block">비즈니스의 새로운 에피소드를 만들어갑니다.', en: 'We believe our clients\' growth is our growth.<br class="hidden md:block">Creating new episodes for your business.', ja: 'お客様の成長こそが私たちの成長であるという信念で<br class="hidden md:block">ビジネスの新しいエピソードを創り出します。' },
  { key: 'about.stat.completion', ko: '프로젝트 완료율', en: 'Project Completion', ja: 'プロジェクト完了率' },
  { key: 'about.stat.partners', ko: '파트너사', en: 'Partners', ja: 'パートナー企業' },
  { key: 'about.stat.awards', ko: '주요 수상', en: 'Major Awards', ja: '主要受賞' },
  { key: 'about.slogan.title', ko: '최신 기술을 선도하는<br><span class="text-indigo-600">젊은 기업, 레피소드</span>', en: 'Leading the Latest Technology<br><span class="text-indigo-600">Young Company, LEPISODE</span>', ja: '最新技術をリードする<br><span class="text-indigo-600">若い企業、LEPISODE</span>' },
  { key: 'about.slogan.desc', ko: '웹과 앱, 그리고 모든 기능을 한 번에 통제할 수 있는 통합 관리 시스템을 구축합니다.<br class="hidden md:block">사용자 중심의 UI/UX 디자인과 안정적인 서버 인프라로 비즈니스의 성공을 돕습니다.', en: 'We build integrated management systems that control web, app, and all features in one place.<br class="hidden md:block">We help business success with user-centered UI/UX design and stable server infrastructure.', ja: 'ウェブとアプリ、そしてすべての機能を一括管理できる統合管理システムを構築します。<br class="hidden md:block">ユーザー中心のUI/UXデザインと安定したサーバーインフラでビジネスの成功を支援します。' },
  { key: 'about.values.title', ko: '우리가 추구하는 가치', en: 'Our Core Values', ja: '私たちが追求する価値' },
  { key: 'about.values.customer.title', ko: '고객 중심', en: 'Customer First', ja: '顧客中心' },
  { key: 'about.values.customer.desc', ko: '고객의 비전을 최우선으로 생각하며<br>맞춤형 솔루션을 제공합니다.', en: 'We prioritize our clients\' vision<br>and provide customized solutions.', ja: 'お客様のビジョンを最優先に考え<br>カスタマイズされたソリューションを提供します。' },
  { key: 'about.values.innovation.title', ko: '기술 혁신', en: 'Innovation', ja: '技術革新' },
  { key: 'about.values.innovation.desc', ko: '최신 기술 트렌드를 반영하여<br>미래 지향적인 서비스를 만듭니다.', en: 'We build future-oriented services<br>reflecting the latest technology trends.', ja: '最新の技術トレンドを反映し<br>未来志向のサービスを構築します。' },
  { key: 'about.values.trust.title', ko: '신뢰와 협력', en: 'Trust & Collaboration', ja: '信頼と協力' },
  { key: 'about.values.trust.desc', ko: '투명한 소통과 협업으로<br>장기적인 파트너십을 구축합니다.', en: 'We build long-term partnerships<br>through transparent communication.', ja: '透明なコミュニケーションと協業で<br>長期的なパートナーシップを構築します。' },
  { key: 'about.team.title', ko: '팀원소개', en: 'Our Team', ja: 'チーム紹介' },
  { key: 'about.team.desc', ko: '레피소드를 이끌어가는 사람들', en: 'The people who lead LEPISODE', ja: 'LEPISODEを率いる人々' },

  // ── Header Nav ──
  { key: 'nav.home', ko: '홈', en: 'Home', ja: 'ホーム' },
  { key: 'nav.about', ko: '회사소개', en: 'About', ja: '会社紹介' },
  { key: 'nav.services', ko: '서비스', en: 'Services', ja: 'サービス' },
  { key: 'nav.portfolio', ko: '포트폴리오', en: 'Portfolio', ja: 'ポートフォリオ' },
  { key: 'nav.blog', ko: '블로그', en: 'Blog', ja: 'ブログ' },
  { key: 'nav.notice', ko: '공지사항', en: 'Notice', ja: 'お知らせ' },
  { key: 'nav.support', ko: '지원사업', en: 'Support', ja: '支援事業' },
  { key: 'nav.careers', ko: '채용', en: 'Careers', ja: '採用' },
  { key: 'nav.faq', ko: 'FAQ', en: 'FAQ', ja: 'FAQ' },
  { key: 'nav.events', ko: '이벤트', en: 'Events', ja: 'イベント' },
  { key: 'nav.status', ko: '작업현황', en: 'Work Status', ja: '作業状況' },
  { key: 'nav.inquiry', ko: '문의하기', en: 'Contact', ja: 'お問い合わせ' },
  { key: 'nav.community', ko: '커뮤니티', en: 'Community', ja: 'コミュニティ' },
  { key: 'nav.company', ko: '회사', en: 'Company', ja: '会社' },

  // ── Home Sections ──
  { key: 'home.compare.title', ko: 'IT 서비스 개발 <span class="text-indigo-600">커스터마이징</span> 전문', en: 'IT Service Development <span class="text-indigo-600">Customization</span> Experts', ja: 'ITサービス開発 <span class="text-indigo-600">カスタマイズ</span> 専門' },
  { key: 'home.compare.badge', ko: '레피소드는 템플릿을 사용해 <span class="text-red-400 font-bold">\'찍어내는\'</span> 업체가 아닙니다.', en: 'LEPISODE is not a company that <span class="text-red-400 font-bold">\'mass-produces\'</span> with templates.', ja: 'LEPISODEはテンプレートで<span class="text-red-400 font-bold">「量産する」</span>会社ではありません。' },
  { key: 'home.compare.other', ko: '타 업체', en: 'Other Company', ja: '他社' },
  { key: 'home.compare.lepisode', ko: '레피소드', en: 'LEPISODE', ja: 'LEPISODE' },
  { key: 'home.compare.design_other', ko: '특색이 없고, 기존 틀에 갇힌 디자인', en: 'Generic design stuck in existing templates', ja: '特色のない、既存の枠に囚われたデザイン' },
  { key: 'home.compare.design_lepisode', ko: '원하는 대로 제작이 가능한 트렌디한 디자인!', en: 'Trendy design customizable to your needs!', ja: 'ご要望通りに制作可能なトレンディなデザイン！' },
  { key: 'home.compare.dev_other', ko: '제한된 기능, 확장 불가능한 구조', en: 'Limited features, non-expandable structure', ja: '制限された機能、拡張不可能な構造' },
  { key: 'home.compare.dev_lepisode', ko: '무한한 확장성, 맞춤형 개발 가능!', en: 'Infinite scalability, custom development!', ja: '無限の拡張性、カスタム開発可能！' },
  { key: 'home.view_detail', ko: '자세히 보기', en: 'View Details', ja: '詳細を見る' },
  { key: 'home.portfolio.label', ko: '포트폴리오', en: 'Portfolio', ja: 'ポートフォリオ' },
  { key: 'home.portfolio.title', ko: '레피소드 <span class="text-indigo-600">포트폴리오</span>', en: 'LEPISODE <span class="text-indigo-600">Portfolio</span>', ja: 'LEPISODE <span class="text-indigo-600">ポートフォリオ</span>' },
  { key: 'home.portfolio.more', ko: '더 많은 포트폴리오 보기', en: 'View More Portfolio', ja: 'もっとポートフォリオを見る' },
  { key: 'home.notice.label', ko: '공지사항', en: 'Notice', ja: 'お知らせ' },
  { key: 'home.notice.title', ko: '레피소드 <span class="text-indigo-600">공지사항</span>', en: 'LEPISODE <span class="text-indigo-600">Notice</span>', ja: 'LEPISODE <span class="text-indigo-600">お知らせ</span>' },
  { key: 'home.notice.more', ko: '전체 공지사항 보기', en: 'View All Notices', ja: 'すべてのお知らせを見る' },
  { key: 'home.blog.label', ko: '블로그', en: 'Blog', ja: 'ブログ' },
  { key: 'home.blog.title', ko: '레피소드 <span class="text-indigo-600">블로그</span>', en: 'LEPISODE <span class="text-indigo-600">Blog</span>', ja: 'LEPISODE <span class="text-indigo-600">ブログ</span>' },
  { key: 'home.blog.more', ko: '전체 블로그 보기', en: 'View All Blog Posts', ja: 'すべてのブログを見る' },
  { key: 'home.services.label', ko: '서비스 소개', en: 'Services', ja: 'サービス紹介' },
  { key: 'home.services.title', ko: '레피소드 <span class="text-indigo-600">서비스</span>', en: 'LEPISODE <span class="text-indigo-600">Services</span>', ja: 'LEPISODE <span class="text-indigo-600">サービス</span>' },
  { key: 'home.services.more', ko: '더 많은 서비스 보기', en: 'View More Services', ja: 'もっとサービスを見る' },
  { key: 'home.services.empty', ko: '등록된 서비스가 없습니다.', en: 'No services registered.', ja: '登録されたサービスはありません。' },
  { key: 'home.location.label', ko: '오시는길', en: 'Location', ja: 'アクセス' },
  { key: 'home.location.address', ko: '광주광역시 남구 대남대로 388 3층', en: '388, Daenam-daero, Nam-gu, Gwangju, 3F', ja: '光州広域市南区大南大路388 3階' },

  // ── Blog Page ──
  { key: 'blog.label', ko: '블로그', en: 'Blog', ja: 'ブログ' },
  { key: 'blog.title', ko: '레피소드 <span class="text-indigo-600">블로그</span>', en: 'LEPISODE <span class="text-indigo-600">Blog</span>', ja: 'LEPISODE <span class="text-indigo-600">ブログ</span>' },
  { key: 'blog.desc', ko: '레피소드의 개발, 디자인, 서비스 구축 과정에서 쌓인 인사이트와 작업 이야기를 전합니다.', en: 'Insights and stories from LEPISODE\'s development, design, and service building process.', ja: 'LEPISODEの開発、デザイン、サービス構築過程で蓄積したインサイトと作業ストーリーをお届けします。' },
  { key: 'blog.view_detail', ko: '자세히 보기', en: 'View Details', ja: '詳細を見る' },
  { key: 'blog.empty', ko: '아직 등록된 블로그가 없습니다.', en: 'No blog posts yet.', ja: 'まだ登録されたブログはありません。' },

  // ── Portfolio Page ──
  { key: 'portfolio.title', ko: '레피소드와 함께하는<br>프로젝트를 경험해 보세요.', en: 'Experience projects<br>with LEPISODE.', ja: 'LEPISODEと共に<br>プロジェクトを体験してください。' },
  { key: 'portfolio.desc', ko: '트렌디한 웹/앱 개발은 물론, 고도화된 AI 솔루션과 공간의 가치를 높이는 브랜딩까지.<br>비즈니스에 필요한 모든 IT 인프라를 한 곳에서 완성하세요.', en: 'From trendy web/app development to advanced AI solutions and branding.<br>Complete all IT infrastructure for your business in one place.', ja: 'トレンディなウェブ/アプリ開発はもちろん、高度なAIソリューションからブランディングまで。<br>ビジネスに必要なすべてのITインフラをワンストップで完成させてください。' },
  { key: 'portfolio.stat.completed', ko: '완료 프로젝트', en: 'Completed', ja: '完了プロジェクト' },
  { key: 'portfolio.stat.satisfaction', ko: '고객 만족도', en: 'Satisfaction', ja: '顧客満足度' },
  { key: 'portfolio.stat.ongoing', ko: '진행 중인 프로젝트', en: 'In Progress', ja: '進行中プロジェクト' },
  { key: 'portfolio.empty', ko: '해당 카테고리에 등록된 포트폴리오가 없습니다.', en: 'No portfolio in this category.', ja: 'このカテゴリにはポートフォリオがありません。' },

  // ── Notice Page ──
  { key: 'notice.label', ko: '공지사항', en: 'Notice', ja: 'お知らせ' },
  { key: 'notice.title', ko: '레피소드 공지사항', en: 'LEPISODE Notice', ja: 'LEPISODEお知らせ' },
  { key: 'notice.desc', ko: '레피소드의 공지사항을 살펴보세요.', en: 'Check out LEPISODE notices.', ja: 'LEPISODEのお知らせをご覧ください。' },
  { key: 'notice.view_detail', ko: '자세히보기', en: 'View Details', ja: '詳細を見る' },
  { key: 'notice.empty', ko: '등록된 공지사항이 없습니다.', en: 'No notices registered.', ja: '登録されたお知らせはありません。' },

  // ── FAQ Page ──
  { key: 'faq.label', ko: 'FAQ', en: 'FAQ', ja: 'FAQ' },
  { key: 'faq.title', ko: '자주 묻는 질문', en: 'Frequently Asked Questions', ja: 'よくある質問' },
  { key: 'faq.desc', ko: '궁금한 점이 있으시면 먼저 확인해주세요.', en: 'Please check here first if you have any questions.', ja: 'ご不明な点がございましたら、まずこちらをご確認ください。' },
  { key: 'faq.empty', ko: '등록된 FAQ가 없습니다.', en: 'No FAQs registered.', ja: '登録されたFAQはありません。' },

  // ── Events Page ──
  { key: 'events.label', ko: '이벤트', en: 'Events', ja: 'イベント' },
  { key: 'events.title', ko: '레피소드 이벤트', en: 'LEPISODE Events', ja: 'LEPISODEイベント' },
  { key: 'events.desc', ko: '다양한 이벤트와 혜택을 확인하세요.', en: 'Check out various events and benefits.', ja: '様々なイベントと特典をご確認ください。' },
  { key: 'events.ongoing', ko: '진행 중', en: 'Ongoing', ja: '進行中' },
  { key: 'events.ended', ko: '종료', en: 'Ended', ja: '終了' },
  { key: 'events.view_detail', ko: '자세히 보기', en: 'View Details', ja: '詳細を見る' },
  { key: 'events.empty', ko: '등록된 이벤트가 없습니다.', en: 'No events registered.', ja: '登録されたイベントはありません。' },
  { key: 'events.empty_sub', ko: '새로운 이벤트를 기대해주세요!', en: 'Stay tuned for new events!', ja: '新しいイベントをお楽しみに！' },

  // ── Services Page ──
  { key: 'services.label', ko: '서비스', en: 'Services', ja: 'サービス' },
  { key: 'services.title', ko: '레피소드 <span class="text-indigo-600">서비스</span>', en: 'LEPISODE <span class="text-indigo-600">Services</span>', ja: 'LEPISODE <span class="text-indigo-600">サービス</span>' },
  { key: 'services.page_title', ko: '레피소드 <span class="text-indigo-600">서비스 소개</span>', en: 'LEPISODE <span class="text-indigo-600">Service Introduction</span>', ja: 'LEPISODE <span class="text-indigo-600">サービス紹介</span>' },
  { key: 'services.desc', ko: '레피소드가 제공하는 다양한 서비스를 살펴보세요.', en: 'Explore the various services offered by LEPISODE.', ja: 'LEPISODEが提供する様々なサービスをご覧ください。' },
  { key: 'services.view_detail', ko: '자세히 보기', en: 'View Details', ja: '詳細を見る' },
  { key: 'services.empty', ko: '등록된 서비스가 없습니다.', en: 'No services registered.', ja: '登録されたサービスはありません。' },

  // ── Status Page ──
  { key: 'status.label', ko: '작업 현황', en: 'Work Status', ja: '作業状況' },
  { key: 'status.title', ko: '작업 현황', en: 'Work Status', ja: '作業状況' },
  { key: 'status.desc', ko: '현재 진행 중인 프로젝트 상태를 한눈에 확인해보세요.', en: 'Check the progress of ongoing projects at a glance.', ja: '現在進行中のプロジェクトの状況を一目でご確認ください。' },
  { key: 'status.estimating', ko: '견적 중', en: 'Estimating', ja: '見積中' },
  { key: 'status.in_progress', ko: '진행 중', en: 'In Progress', ja: '進行中' },
  { key: 'status.delivered', ko: '납품완료', en: 'Delivered', ja: '納品完了' },
  { key: 'status.project', ko: '프로젝트명', en: 'Project', ja: 'プロジェクト名' },
  { key: 'status.progress', ko: '진행률', en: 'Progress', ja: '進捗率' },
  { key: 'status.step', ko: '단계', en: 'Phase', ja: 'フェーズ' },
  { key: 'status.empty', ko: '진행 중인 작업이 없습니다.', en: 'No ongoing projects.', ja: '進行中の作業はありません。' },

  // ── Careers Page ──
  { key: 'careers.label', ko: '채용', en: 'Careers', ja: '採用' },
  { key: 'careers.badge', ko: '채용 중', en: 'HIRING', ja: '採用中' },
  { key: 'careers.hero_title', ko: '함께 만들어갈<br><span class="hero-accent">다음 이야기</span>의 주인공', en: 'The protagonist of<br><span class="hero-accent">the next story</span> we create together', ja: '一緒に作り上げる<br><span class="hero-accent">次の物語</span>の主人公' },
  { key: 'careers.hero_desc', ko: '레피소드와 함께 디지털 혁신의 미래를 설계하세요', en: 'Design the future of digital innovation with LEPISODE', ja: 'LEPISODEと共にデジタル革新の未来を設計しましょう' },
  { key: 'careers.title', ko: '함께 성장할 동료를 찾습니다', en: 'We are looking for colleagues to grow with', ja: '一緒に成長する仲間を探しています' },
  { key: 'careers.desc', ko: '레피소드와 함께 새로운 에피소드를 만들어갈 인재를 모십니다.', en: 'We are recruiting talents to create new episodes with LEPISODE.', ja: 'LEPISODEと共に新しいエピソードを創る人材を募集しています。' },
  { key: 'careers.recruiting', ko: '모집중', en: 'Recruiting', ja: '募集中' },
  { key: 'careers.closed', ko: '마감', en: 'Closed', ja: '締切' },
  { key: 'careers.view_posting', ko: '공고 보기', en: 'View Posting', ja: '求人を見る' },
  { key: 'careers.apply', ko: '지원하기', en: 'Apply Now', ja: '応募する' },
  { key: 'careers.empty', ko: '현재 진행 중인 채용 공고가 없습니다.', en: 'No current openings.', ja: '現在進行中の採用はありません。' },
  // Nav
  { key: 'careers.nav_engines', ko: '레피소드 엔진들', en: 'Our Engines', ja: 'エンジン紹介' },
  { key: 'careers.nav_promise', ko: '우리들의 약속', en: 'Our Promises', ja: '私たちの約束' },
  { key: 'careers.nav_culture', ko: '팀 문화 소개', en: 'Team Culture', ja: 'チーム文化' },
  { key: 'careers.nav_welfare', ko: '회사 복지', en: 'Benefits', ja: '福利厚生' },
  { key: 'careers.nav_jobs', ko: '채용공고', en: 'Job Openings', ja: '採用情報' },
  // Promo
  { key: 'careers.promo_title', ko: '기술로 세상을 바꾸는 사람들,<br><span class="text-[#41539b]">레피소드</span>에서 시작됩니다.', en: 'People changing the world with technology,<br>It starts at <span class="text-[#41539b]">LEPISODE</span>.', ja: '技術で世界を変える人々、<br><span class="text-[#41539b]">LEPISODE</span>から始まります。' },
  { key: 'careers.promo_desc', ko: '우리는 단순한 개발을 넘어, 비즈니스의 본질을 이해하고 디지털 전환을 이끄는 파트너입니다.<br>당신의 아이디어가 현실이 되는 곳, 지금 합류하세요.', en: 'We go beyond simple development to understand business essence and lead digital transformation.<br>Where your ideas become reality — join us now.', ja: '単なる開発を超え、ビジネスの本質を理解しデジタル変革をリードするパートナーです。<br>あなたのアイデアが現実になる場所、今すぐ参加してください。' },
  // Work intro
  { key: 'careers.work1_title', ko: '웹개발', en: 'Web Development', ja: 'Web開発' },
  { key: 'careers.work1_desc', ko: '반응형 웹사이트부터 대규모 플랫폼까지,<br>최신 기술 스택으로 빠르고 안정적인 웹 서비스를 구축합니다.', en: 'From responsive websites to large-scale platforms,<br>we build fast and reliable web services with the latest tech stack.', ja: 'レスポンシブサイトから大規模プラットフォームまで、<br>最新技術スタックで高速かつ安定したWebサービスを構築します。' },
  { key: 'careers.work2_title', ko: 'AI기반 비즈니스 자동화', en: 'AI-Based Business Automation', ja: 'AIベースのビジネス自動化' },
  { key: 'careers.work2_desc', ko: '데이터 분석, 자연어 처리, 이미지 인식 등<br>AI 기술을 활용하여 업무 프로세스를 자동화하고 효율을 극대화합니다.', en: 'Data analysis, NLP, image recognition, etc.<br>We automate business processes and maximize efficiency using AI.', ja: 'データ分析、自然言語処理、画像認識など<br>AI技術を活用して業務プロセスを自動化し効率を最大化します。' },
  { key: 'careers.work3_title', ko: '맞춤형 비즈니스 시스템 구축', en: 'Custom Business System Development', ja: 'カスタムビジネスシステム構築' },
  { key: 'careers.work3_desc', ko: 'ERP, CRM, POS 등 기업 맞춤형 시스템을<br>설계부터 운영까지 원스톱으로 제공합니다.', en: 'Custom enterprise systems like ERP, CRM, POS —<br>one-stop from design to operation.', ja: 'ERP、CRM、POSなど企業カスタムシステムを<br>設計から運営までワンストップで提供します。' },
  // Engines section
  { key: 'careers.engines_label', ko: '레피소드 엔진들', en: 'LEPISODE Engines', ja: 'LEPISODEエンジン' },
  { key: 'careers.engines_title', ko: '각자의 자리에서 <span class="text-[#41539b]">최고의 엔진</span>이 되다', en: 'Becoming the <span class="text-[#41539b]">best engine</span> in our own place', ja: 'それぞれの場所で<span class="text-[#41539b]">最高のエンジン</span>になる' },
  { key: 'careers.engines_desc', ko: '레피소드를 움직이는 세 개의 팀을 소개합니다', en: 'Introducing the three teams that drive LEPISODE', ja: 'LEPISODEを動かす3つのチームを紹介します' },
  { key: 'careers.team_dev', ko: '개발팀', en: 'Development', ja: '開発チーム' },
  { key: 'careers.team_dev_desc', ko: '프론트엔드, 백엔드, 모바일, AI까지<br>기술의 최전선에서 제품을 만들어갑니다.', en: 'Frontend, backend, mobile, AI —<br>building products at the forefront of technology.', ja: 'フロントエンド、バックエンド、モバイル、AIまで<br>技術の最前線で製品を作り上げます。' },
  { key: 'careers.team_design', ko: '기획/디자인팀', en: 'Planning/Design', ja: '企画/デザインチーム' },
  { key: 'careers.team_design_desc', ko: '사용자 경험을 설계하고,<br>브랜드의 가치를 시각적으로 표현합니다.', en: 'Designing user experiences and<br>visually expressing brand value.', ja: 'ユーザー体験を設計し、<br>ブランドの価値を視覚的に表現します。' },
  { key: 'careers.team_design_tag1', ko: 'UX/UI 설계', en: 'UX/UI Design', ja: 'UX/UI設計' },
  { key: 'careers.team_design_tag2', ko: '서비스 기획', en: 'Service Planning', ja: 'サービス企画' },
  { key: 'careers.team_biz', ko: '사업/영업팀', en: 'Business/Sales', ja: '事業/営業チーム' },
  { key: 'careers.team_biz_desc', ko: '고객의 비즈니스를 이해하고,<br>최적의 솔루션을 연결합니다.', en: 'Understanding client business and<br>connecting optimal solutions.', ja: '顧客のビジネスを理解し、<br>最適なソリューションを接続します。' },
  { key: 'careers.team_biz_tag1', ko: '고객 상담', en: 'Client Consulting', ja: '顧客相談' },
  { key: 'careers.team_biz_tag2', ko: '제안서', en: 'Proposals', ja: '提案書' },
  { key: 'careers.team_biz_tag3', ko: '파트너십', en: 'Partnership', ja: 'パートナーシップ' },
  { key: 'careers.team_biz_tag4', ko: '시장 분석', en: 'Market Analysis', ja: '市場分析' },
  // Promises
  { key: 'careers.promise_label', ko: '우리들의 약속', en: 'Our Promises', ja: '私たちの約束' },
  { key: 'careers.promise_title', ko: '"좋은 사람이 좋은 결과를 만든다"', en: '"Good people create good results"', ja: '「良い人が良い結果を作る」' },
  { key: 'careers.promise_desc', ko: '레피소드는 함께 일하는 사람들이 행복해야<br>더 좋은 서비스가 탄생한다고 믿습니다.', en: 'LEPISODE believes that when people are happy working together,<br>better services are born.', ja: 'LEPISODEは一緒に働く人々が幸せであってこそ<br>より良いサービスが生まれると信じています。' },
  { key: 'careers.p1_title', ko: '오전 10시 출근, 여유로운 아침', en: '10 AM Start, Relaxed Mornings', ja: '午前10時出勤、余裕ある朝' },
  { key: 'careers.p1_desc', ko: '충분한 아침 시간으로 하루를 여유롭게 시작하고, 집중력 있는 오후를 보냅니다.', en: 'Start your day leisurely with enough morning time and spend focused afternoons.', ja: '十分な朝の時間でゆとりある一日を始め、集中力のある午後を過ごします。' },
  { key: 'careers.p2_title', ko: '끊임없는 성장 지원', en: 'Continuous Growth Support', ja: '絶え間ない成長支援' },
  { key: 'careers.p2_desc', ko: '도서 구입, 온라인 강의, 컨퍼런스 참가 등 자기계발에 필요한 비용을 지원합니다.', en: 'We support costs for books, online courses, conferences, and more.', ja: '書籍購入、オンライン講座、カンファレンス参加など自己啓発費用を支援します。' },
  { key: 'careers.p3_title', ko: '수평적 소통 문화', en: 'Horizontal Communication', ja: '水平的なコミュニケーション文化' },
  { key: 'careers.p3_desc', ko: '직급에 관계없이 누구나 의견을 제시할 수 있는 열린 소통 환경을 지향합니다.', en: 'We aim for an open communication environment where everyone can share ideas.', ja: '職位に関係なく誰もが意見を提示できるオープンなコミュニケーション環境を目指します。' },
  { key: 'careers.p4_title', ko: '최고의 장비와 환경', en: 'Best Equipment & Environment', ja: '最高の装備と環境' },
  { key: 'careers.p4_desc', ko: '최신 맥북·모니터·의자 등 업무에 몰입할 수 있는 최고의 장비를 제공합니다.', en: 'Latest MacBooks, monitors, chairs — the best equipment for deep work.', ja: '最新のMacBook・モニター・椅子など業務に没頭できる最高の装備を提供します。' },
  { key: 'careers.p5_title', ko: '진짜 워라밸을 실천합니다', en: 'Real Work-Life Balance', ja: '本当のワークライフバランスを実践' },
  { key: 'careers.p5_desc', ko: '정시 퇴근을 기본으로, 개인의 삶과 업무의 균형을 존중하는 문화입니다.', en: 'On-time leave is the default — we respect the balance between life and work.', ja: '定時退勤を基本に、個人の生活と業務のバランスを尊重する文化です。' },
  // Blog section
  { key: 'careers.blog_label', ko: '기술 블로그', en: 'Tech Blog', ja: '技術ブログ' },
  { key: 'careers.blog_title', ko: '우리가<br>추구하는 방식', en: 'The way<br>we pursue', ja: '私たちが<br>追求する方式' },
  { key: 'careers.blog_desc', ko: '레피소드 팀이 문제를 풀어가는<br>기술적 고민과 인사이트를 공유합니다.', en: 'Sharing technical insights and<br>problem-solving approaches of the LEPISODE team.', ja: 'LEPISODEチームが問題を解決する<br>技術的な悩みとインサイトを共有します。' },
  { key: 'careers.blog_date', ko: '작성일', en: 'Published', ja: '作成日' },
  { key: 'careers.blog_empty', ko: '아직 등록된 글이 없습니다.', en: 'No posts yet.', ja: 'まだ投稿がありません。' },
  { key: 'careers.blog_more', ko: '더보기', en: 'More', ja: 'もっと見る' },
  // Culture section
  { key: 'careers.culture_label', ko: '팀 문화', en: 'Team Culture', ja: 'チーム文化' },
  { key: 'careers.culture_title', ko: '함께이기에 <span class="text-[#41539b]">더 빛나는</span> 순간들', en: 'Moments that <span class="text-[#41539b]">shine brighter</span> together', ja: '共にいるからこそ<span class="text-[#41539b]">より輝く</span>瞬間' },
  { key: 'careers.culture_desc', ko: '레피소드는 일만 하는 곳이 아닙니다.<br>함께 웃고, 함께 성장하는 문화를 만들어갑니다.', en: 'LEPISODE is not just a workplace.<br>We build a culture of laughing and growing together.', ja: 'LEPISODEは仕事だけの場所ではありません。<br>共に笑い、共に成長する文化を作り上げます。' },
  { key: 'careers.c1_title', ko: '1박2일 워크샵', en: '2-Day Workshop', ja: '1泊2日ワークショップ' },
  { key: 'careers.c1_desc', ko: '분기마다 떠나는 팀 워크샵.<br>바베큐와 함께 깊어지는 우리의 이야기.', en: 'Quarterly team workshops.<br>Our stories deepen over BBQ.', ja: '四半期ごとのチームワークショップ。<br>バーベキューと共に深まる私たちの物語。' },
  { key: 'careers.c2_title', ko: '해외 워크샵', en: 'Overseas Workshop', ja: '海外ワークショップ' },
  { key: 'careers.c2_desc', ko: '연 1회 해외 여행으로<br>리프레시 &amp; 팀 빌딩', en: 'Annual overseas trip for<br>refresh & team building', ja: '年1回の海外旅行で<br>リフレッシュ＆チームビルディング' },
  { key: 'careers.c3_title', ko: '스포츠 관람', en: 'Sports Events', ja: 'スポーツ観戦' },
  { key: 'careers.c3_desc', ko: '야구·축구·농구 등<br>함께 응원하는 짜릿한 순간', en: 'Baseball, soccer, basketball —<br>thrilling moments cheering together', ja: '野球・サッカー・バスケなど<br>共に応援するスリリングな瞬間' },
  // Welfare section
  { key: 'careers.welfare_title1', ko: '아낌없는 지원으로 완성하는', en: 'Achieving perfection with', ja: '惜しみない支援で完成する' },
  { key: 'careers.welfare_title2', ko: '<span class="text-[#41539b]">최상의 퍼포먼스</span>', en: '<span class="text-[#41539b]">top performance</span>', ja: '<span class="text-[#41539b]">最高のパフォーマンス</span>' },
  { key: 'careers.w1_title', ko: '무한 제공 스낵바', en: 'Unlimited Snack Bar', ja: '無限提供スナックバー' },
  { key: 'careers.w1_desc', ko: '업무 중 출출하면 언제나<br>간단하게 즐길 수 있습니다.', en: 'Whenever you are hungry at work,<br>enjoy snacks anytime.', ja: '業務中にお腹が空いたらいつでも<br>気軽に楽しめます。' },
  { key: 'careers.w2_title', ko: '점심 식사 지원', en: 'Lunch Support', ja: '昼食支援' },
  { key: 'careers.w2_desc', ko: '메뉴 고민 끝! 건강한 샐러드와<br>든든한 도시락을 무료로 제공합니다.', en: 'No more lunch dilemmas! Free healthy<br>salads and hearty lunch boxes.', ja: 'メニューの悩み解決！ヘルシーサラダと<br>ボリュームたっぷりのお弁当を無料提供。' },
  { key: 'careers.w3_title', ko: '자유로운 복장', en: 'Casual Dress Code', ja: '自由な服装' },
  { key: 'careers.w3_desc', ko: '후드티, 크록스, 헤드폰 장착 환영!<br>가장 몰입하기 좋은 모습으로 일하세요.', en: 'Hoodies, crocs, headphones welcome!<br>Work in your most comfortable style.', ja: 'パーカー、クロックス、ヘッドフォン歓迎！<br>最も没頭しやすいスタイルで仕事してください。' },
  { key: 'careers.w4_title', ko: '10 to 7', en: '10 to 7', ja: '10 to 7' },
  { key: 'careers.w4_desc', ko: '러시아워를 피해 여유로운<br>출근길을 보장합니다.', en: 'Avoid rush hour with a<br>relaxed commute.', ja: 'ラッシュアワーを避けて余裕ある<br>通勤を保証します。' },
  { key: 'careers.w5_title', ko: '술 강요 없는 문화', en: 'No Drinking Pressure', ja: '飲酒強要のない文化' },
  { key: 'careers.w5_desc', ko: '회식은 신입 환영회 때만 가볍게!<br>개인의 저녁 있는 삶을 존중합니다.', en: 'Company dinners only for welcome parties!<br>We respect your evenings.', ja: '飲み会は新入社員歓迎会だけ軽く！<br>個人の夜の生活を尊重します。' },
  { key: 'careers.w6_title', ko: '체계적인 온보딩', en: 'Structured Onboarding', ja: '体系的なオンボーディング' },
  { key: 'careers.w6_desc', ko: '신입 사원이 헤매지 않고<br>부드럽게 적응할 수 있도록 돕습니다.', en: 'Helping new hires adapt<br>smoothly without confusion.', ja: '新入社員が迷わず<br>スムーズに適応できるようサポートします。' },
  { key: 'careers.w7_title', ko: '다양한 프로젝트 경험', en: 'Diverse Project Experience', ja: '多様なプロジェクト経験' },
  { key: 'careers.w7_desc', ko: '정체되지 않고 폭넓은 프로젝트에<br>참여하며 실무 역량을 키울 수 있습니다.', en: 'Grow your skills by participating<br>in a wide range of projects.', ja: '停滞せず幅広いプロジェクトに<br>参加して実務能力を伸ばせます。' },
  { key: 'careers.w8_title', ko: '성장 세미나', en: 'Growth Seminars', ja: '成長セミナー' },
  { key: 'careers.w8_desc', ko: '동아리처럼 편안한 분위기에서<br>지식을 나누는 자체 세미나로 성장합니다.', en: 'Grow through in-house seminars<br>sharing knowledge in a relaxed atmosphere.', ja: 'サークルのような雰囲気で<br>知識を分かち合う自社セミナーで成長します。' },
  { key: 'careers.w9_title', ko: '눈치 ZERO 자율 연차', en: 'Guilt-Free PTO', ja: '気兼ねZERO 自律休暇' },
  { key: 'careers.w9_desc', ko: '눈치 볼 필요 없습니다. 휴식이<br>필요한 순간, 내 일정은 내가 결정합니다.', en: 'No need to feel guilty. When you need rest,<br>you decide your own schedule.', ja: '気を遣う必要はありません。休息が<br>必要な瞬間、自分のスケジュールは自分で決めます。' },
  // Jobs section
  { key: 'careers.jobs_title1', ko: '함께 성장할', en: 'Growing together,', ja: '共に成長する' },
  { key: 'careers.jobs_title2', ko: '<span class="text-[#2ec4b6]">동료를 찾고 있어요</span>', en: '<span class="text-[#2ec4b6]">looking for teammates</span>', ja: '<span class="text-[#2ec4b6]">仲間を探しています</span>' },
  { key: 'careers.jobs_all', ko: '전체', en: 'All', ja: 'すべて' },
  { key: 'careers.jobs_view_all', ko: '전체 공고 보기', en: 'View All Jobs', ja: 'すべての求人を見る' },

  // ── Terms Page ──
  { key: 'terms.privacy', ko: '개인정보취급방침', en: 'Privacy Policy', ja: '個人情報保護方針' },
  { key: 'terms.service', ko: '서비스 이용약관', en: 'Terms of Service', ja: '利用規約' },
  { key: 'terms.marketing', ko: '마케팅 수신동의 약관', en: 'Marketing Agreement', ja: 'マーケティング同意規約' },
  { key: 'terms.last_updated', ko: '최종 수정일', en: 'Last Updated', ja: '最終更新日' },
  { key: 'terms.loading', ko: '약관을 불러오는 중입니다...', en: 'Loading terms...', ja: '規約を読み込んでいます...' },

  // ── Marketing Page ──
  { key: 'marketing.hero_title', ko: '마케팅 · 호스팅,<br><span class="text-[#41539b]">레피소드와 함께하세요</span>', en: 'Marketing · Hosting,<br><span class="text-[#41539b]">with LEPISODE</span>', ja: 'マーケティング · ホスティング,<br><span class="text-[#41539b]">LEPISODEと共に</span>' },
  { key: 'marketing.hero_desc', ko: '검색 광고부터 SNS 마케팅, 안정적인 호스팅까지<br>비즈니스 성장에 필요한 모든 것을 제공합니다.', en: 'From search ads to SNS marketing and reliable hosting,<br>we provide everything you need for business growth.', ja: '検索広告からSNSマーケティング、安定したホスティングまで<br>ビジネスの成長に必要なすべてを提供します。' },
  { key: 'marketing.view_services', ko: '서비스 보기', en: 'View Services', ja: 'サービスを見る' },
  { key: 'marketing.free_consult', ko: '무료 상담', en: 'Free Consultation', ja: '無料相談' },
  { key: 'marketing.svc_title', ko: '마케팅 서비스', en: 'Marketing Services', ja: 'マーケティングサービス' },
  { key: 'marketing.svc_desc', ko: '비즈니스 성장을 위한 전문 디지털 마케팅 솔루션을 제공합니다.', en: 'We provide professional digital marketing solutions for business growth.', ja: 'ビジネスの成長のための専門デジタルマーケティングソリューションを提供します。' },
  { key: 'marketing.hosting_title', ko: '호스팅 서비스', en: 'Hosting Services', ja: 'ホスティングサービス' },
  { key: 'marketing.hosting_desc', ko: '안정적인 서버 운영과 보안 관리를<br>원스톱으로 제공합니다.', en: 'Reliable server operation and security management<br>provided as a one-stop service.', ja: '安定したサーバー運営とセキュリティ管理を<br>ワンストップで提供します。' },
  { key: 'marketing.process_title', ko: '서비스 진행 프로세스', en: 'Service Process', ja: 'サービス進行プロセス' },
  { key: 'marketing.contact_title', ko: '마케팅 · 호스팅,<br><span class="text-[#41539b]">레피소드와 함께하세요.</span>', en: 'Marketing · Hosting,<br><span class="text-[#41539b]">with LEPISODE.</span>', ja: 'マーケティング · ホスティング,<br><span class="text-[#41539b]">LEPISODEと共に。</span>' },
  { key: 'marketing.contact_desc', ko: '빠르고 쉽게 간편하게 서비스 매니저를 보내드리고 사전상담해드립니다.', en: 'We will quickly and easily send a service manager for a preliminary consultation.', ja: '迅速かつ簡単にサービスマネージャーを派遣し、事前相談いたします。' },
  { key: 'marketing.kakao_label', ko: '카카오톡 상담', en: 'KakaoTalk Chat', ja: 'カカオトーク相談' },
  { key: 'marketing.kakao_channel', ko: '레피소드 카카오 채널', en: 'LEPISODE Kakao Channel', ja: 'LEPISODEカカオチャンネル' },
  { key: 'marketing.inquiry_title', ko: '문의하기', en: 'Contact Us', ja: 'お問い合わせ' },
  { key: 'marketing.inquiry_desc', ko: '아래 연락처 기재해주시면 담당자가 빠르게 연락 드리겠습니다.', en: 'Please fill in your contact details and our team will reach out shortly.', ja: '以下の連絡先をご記入いただければ、担当者が迅速にご連絡いたします。' },
  { key: 'marketing.submitted_title', ko: '문의가 접수되었습니다!', en: 'Inquiry Submitted!', ja: 'お問い合わせを受け付けました！' },
  { key: 'marketing.submitted_desc', ko: '담당자가 빠른 시일 내에 연락 드리겠습니다.', en: 'Our team will contact you as soon as possible.', ja: '担当者が早急にご連絡いたします。' },
  { key: 'marketing.form_name', ko: '성함', en: 'Name', ja: 'お名前' },
  { key: 'marketing.form_phone', ko: '연락처', en: 'Phone', ja: '連絡先' },
  { key: 'marketing.form_email', ko: '이메일', en: 'Email', ja: 'メール' },
  { key: 'marketing.submitting', ko: '접수 중...', en: 'Submitting...', ja: '送信中...' },
  { key: 'marketing.submit_btn', ko: '빠른 상담하러가기', en: 'Get Quick Consultation', ja: 'クイック相談へ' },
  { key: 'marketing.email_label', ko: 'Email · 이메일', en: 'Email', ja: 'Email · メール' },
  { key: 'marketing.tel_label', ko: 'Tel · 전화번호', en: 'Tel · Phone', ja: 'Tel · 電話番号' },
  { key: 'marketing.agree_privacy', ko: '[필수] 개인정보 수집·이용에 대한 안내사항을 확인하였으며, 이에 동의합니다.', en: '[Required] I have read and agree to the collection and use of personal information.', ja: '[必須] 個人情報の収集・利用に関する案内を確認し、同意します。' },
  // Why section
  { key: 'marketing.why_label', ko: '레피소드가 특별한 이유', en: 'Why LEPISODE', ja: 'LEPISODEが特別な理由' },
  { key: 'marketing.why_title', ko: '비즈니스 성장의 <span class="text-[#41539b]">든든한 파트너</span>', en: 'Your <span class="text-[#41539b]">reliable partner</span> for business growth', ja: 'ビジネス成長の<span class="text-[#41539b]">頼れるパートナー</span>' },
  { key: 'marketing.why_desc', ko: '레피소드와 함께하면 다른 결과를 만들 수 있습니다', en: 'With LEPISODE, you can achieve different results', ja: 'LEPISODEと共にすれば、違う結果を生み出せます' },
  { key: 'marketing.why1_title', ko: '전문 인력 구성', en: 'Expert Team', ja: '専門人材構成' },
  { key: 'marketing.why1_desc', ko: '마케팅·개발·디자인 전문가로<br>구성된 원스톱 서비스를 제공합니다.', en: 'A one-stop service with<br>marketing, development & design experts.', ja: 'マーケティング・開発・デザインの専門家で<br>構成されたワンストップサービスを提供します。' },
  { key: 'marketing.why1_tag1', ko: '퍼포먼스 마케팅', en: 'Performance Marketing', ja: 'パフォーマンスマーケティング' },
  { key: 'marketing.why1_tag2', ko: '풀스택 개발', en: 'Full-stack Dev', ja: 'フルスタック開発' },
  { key: 'marketing.why1_tag3', ko: 'UX/UI 디자인', en: 'UX/UI Design', ja: 'UX/UIデザイン' },
  { key: 'marketing.why2_title', ko: '데이터 기반 전략', en: 'Data-Driven Strategy', ja: 'データ基盤戦略' },
  { key: 'marketing.why2_desc', ko: '실시간 데이터 분석으로<br>최적의 마케팅 전략을 수립합니다.', en: 'Real-time data analysis to<br>build optimal marketing strategies.', ja: 'リアルタイムデータ分析で<br>最適なマーケティング戦略を策定します。' },
  { key: 'marketing.why2_tag1', ko: 'GA4 분석', en: 'GA4 Analytics', ja: 'GA4分析' },
  { key: 'marketing.why2_tag2', ko: 'A/B 테스트', en: 'A/B Testing', ja: 'A/Bテスト' },
  { key: 'marketing.why2_tag3', ko: '실시간 리포트', en: 'Real-time Reports', ja: 'リアルタイムレポート' },
  { key: 'marketing.why3_title', ko: '보안·안정성 보장', en: 'Security & Reliability', ja: 'セキュリティ・安定性保証' },
  { key: 'marketing.why3_desc', ko: '24시간 모니터링과 백업으로<br>안전한 서비스를 보장합니다.', en: '24/7 monitoring and backup<br>ensuring secure services.', ja: '24時間モニタリングとバックアップで<br>安全なサービスを保証します。' },
  { key: 'marketing.why3_tag1', ko: 'SSL 인증서', en: 'SSL Certificate', ja: 'SSL証明書' },
  { key: 'marketing.why3_tag2', ko: '자동 백업', en: 'Auto Backup', ja: '自動バックアップ' },
  { key: 'marketing.why3_tag3', ko: 'DDoS 방어', en: 'DDoS Protection', ja: 'DDoS防御' },
  // Marketing Services (TS data)
  { key: 'marketing.ms1_title', ko: '키워드 광고', en: 'Keyword Ads', ja: 'キーワード広告' },
  { key: 'marketing.ms1_desc', ko: '네이버·구글 키워드 광고\n최적화된 광고 전략 수립', en: 'Naver & Google keyword ads\nOptimized ad strategy', ja: 'Naver・Googleキーワード広告\n最適化された広告戦略策定' },
  { key: 'marketing.ms2_title', ko: 'SNS 마케팅', en: 'SNS Marketing', ja: 'SNSマーケティング' },
  { key: 'marketing.ms2_desc', ko: '인스타그램·페이스북 등\n맞춤형 소셜 마케팅', en: 'Instagram, Facebook, etc.\nCustom social marketing', ja: 'Instagram・Facebook等\nカスタムソーシャルマーケティング' },
  { key: 'marketing.ms3_title', ko: '바이럴 마케팅', en: 'Viral Marketing', ja: 'バイラルマーケティング' },
  { key: 'marketing.ms3_desc', ko: '블로그·카페·커뮤니티\n바이럴 콘텐츠 확산', en: 'Blog, forums & community\nViral content distribution', ja: 'ブログ・カフェ・コミュニティ\nバイラルコンテンツ拡散' },
  { key: 'marketing.ms4_title', ko: '영상 마케팅', en: 'Video Marketing', ja: '動画マーケティング' },
  { key: 'marketing.ms4_desc', ko: '유튜브·숏폼 영상\n브랜드 스토리 제작', en: 'YouTube & short-form video\nBrand story creation', ja: 'YouTube・ショートフォーム動画\nブランドストーリー制作' },
  { key: 'marketing.ms5_title', ko: '브랜드 디자인', en: 'Brand Design', ja: 'ブランドデザイン' },
  { key: 'marketing.ms5_desc', ko: 'BI/CI 디자인·인쇄물\n브랜드 아이덴티티 구축', en: 'BI/CI design & print\nBrand identity building', ja: 'BI/CIデザイン・印刷物\nブランドアイデンティティ構築' },
  // Hosting Services (TS data)
  { key: 'marketing.hs1_title', ko: '웹 호스팅', en: 'Web Hosting', ja: 'Webホスティング' },
  { key: 'marketing.hs1_desc', ko: '빠르고 안정적인 SSD 기반 웹 호스팅으로\n웹사이트 로딩 속도를 극대화합니다.', en: 'Fast & reliable SSD-based web hosting\nmaximizing website loading speed.', ja: '高速で安定したSSDベースのWebホスティングで\nサイトの読み込み速度を最大化します。' },
  { key: 'marketing.hs2_title', ko: '클라우드 서버 구축', en: 'Cloud Server Setup', ja: 'クラウドサーバー構築' },
  { key: 'marketing.hs2_desc', ko: 'AWS, GCP 등 클라우드 인프라를\n안정적으로 구축·운영합니다.', en: 'AWS, GCP cloud infrastructure\nbuilt and operated reliably.', ja: 'AWS、GCP等のクラウドインフラを\n安定的に構築・運営します。' },
  { key: 'marketing.hs3_title', ko: '도메인 · DNS 관리', en: 'Domain · DNS Management', ja: 'ドメイン · DNS管理' },
  { key: 'marketing.hs3_desc', ko: '도메인 등록부터 DNS 설정,\n네임서버 관리까지 원스톱.', en: 'From domain registration to DNS setup,\nnameserver management one-stop.', ja: 'ドメイン登録からDNS設定、\nネームサーバー管理までワンストップ。' },
  { key: 'marketing.hs4_title', ko: 'SSL/TLS 보안 인증서', en: 'SSL/TLS Certificate', ja: 'SSL/TLSセキュリティ証明書' },
  { key: 'marketing.hs4_desc', ko: 'HTTPS 적용으로 안전한\n웹사이트 환경을 보장합니다.', en: 'Secure website environment\nguaranteed with HTTPS.', ja: 'HTTPS適用で安全な\nWebサイト環境を保証します。' },
  { key: 'marketing.hs5_title', ko: '24시간 모니터링', en: '24/7 Monitoring', ja: '24時間モニタリング' },
  { key: 'marketing.hs5_desc', ko: '실시간 서버 상태 감시와\n장애 자동 감지·대응 시스템.', en: 'Real-time server status monitoring\nwith auto fault detection & response.', ja: 'リアルタイムサーバー状態監視と\n障害自動検知・対応システム。' },
  // Process (TS data)
  { key: 'marketing.proc1_title', ko: '상담 및 분석', en: 'Consulting & Analysis', ja: '相談及び分析' },
  { key: 'marketing.proc1_desc', ko: '비즈니스 목표와\n현황을 파악합니다', en: 'Understanding your\nbusiness goals & status', ja: 'ビジネスの目標と\n現況を把握します' },
  { key: 'marketing.proc2_title', ko: '전략 수립', en: 'Strategy Planning', ja: '戦略策定' },
  { key: 'marketing.proc2_desc', ko: '맞춤형 마케팅·호스팅\n전략을 설계합니다', en: 'Designing custom marketing\n& hosting strategies', ja: 'カスタムマーケティング・ホスティング\n戦略を設計します' },
  { key: 'marketing.proc3_title', ko: '실행 및 운영', en: 'Execution & Operation', ja: '実行及び運営' },
  { key: 'marketing.proc3_desc', ko: '전문 팀이 직접\n운영합니다', en: 'Operated directly by\nour expert team', ja: '専門チームが直接\n運営します' },
  { key: 'marketing.proc4_title', ko: '리포트 제공', en: 'Report Delivery', ja: 'レポート提供' },
  { key: 'marketing.proc4_desc', ko: '성과 분석 리포트를\n정기 제공합니다', en: 'Regular performance\nanalysis reports', ja: '成果分析レポートを\n定期提供します' },

  // ── Support Projects Page ──
  { key: 'support.hero_title', ko: '우리 기업에 꼭 맞는<br>지원사업을 찾아보세요!', en: 'Find the perfect<br>support program for your business!', ja: '自社にぴったりの<br>支援事業を探しましょう！' },
  { key: 'support.hero_desc', ko: '기업 규모에 선택 하나 만으로 정부 지원사업을<br>레피소드가 쉽고 간편하게 1초 만에 찾을 수 있게 만들어드립니다!', en: 'With just one selection of your company size,<br>LEPISODE helps you find government support programs in seconds!', ja: '企業規模を選択するだけで、<br>LEPISODEが簡単に政府支援事業を1秒で見つけます！' },
  { key: 'support.cta_btn', ko: '지원사업 제안받기', en: 'Get Recommendations', ja: '支援事業の提案を受ける' },
  { key: 'support.filter_title', ko: '우리 기업 유형 선택', en: 'Select Your Company Type', ja: '企業タイプを選択' },
  { key: 'support.view_all', ko: '전체 지원사업 보기', en: 'View All Programs', ja: 'すべての支援事業を見る' },
  { key: 'support.empty', ko: '선택한 기업 유형에 등록된 지원사업이 없습니다.', en: 'No support programs available for this company type.', ja: '選択した企業タイプに登録された支援事業はありません。' },
  { key: 'support.contact_title', ko: '지원사업 찾기,<br><span class="text-[#41539b]">레피소드와 함께하세요.</span>', en: 'Finding support programs,<br><span class="text-[#41539b]">with LEPISODE.</span>', ja: '支援事業探し、<br><span class="text-[#41539b]">LEPISODEと共に。</span>' },
  { key: 'support.contact_desc', ko: '빠르고 쉽게 간편하게 서비스 매니저를 보내드리고 사전상담해드립니다.', en: 'We will quickly send a service manager for a preliminary consultation.', ja: '迅速にサービスマネージャーを派遣し、事前相談いたします。' },
  { key: 'support.cat1_label', ko: '예비창업자', en: 'Pre-Startup', ja: '予備創業者' },
  { key: 'support.cat1_desc', ko: '사업계획 수립부터\n초기 자금 확보까지', en: 'From business planning\nto initial funding', ja: '事業計画策定から\n初期資金確保まで' },
  { key: 'support.cat2_label', ko: '소상공인 · 스타트업', en: 'Small Biz · Startup', ja: '小規模事業者 · スタートアップ' },
  { key: 'support.cat2_desc', ko: '브랜딩·마케팅·기술 개발 지원', en: 'Branding, marketing\n& tech development support', ja: 'ブランディング・マーケティング・\n技術開発支援' },
  { key: 'support.cat3_label', ko: '중소 기업', en: 'SME', ja: '中小企業' },
  { key: 'support.cat3_desc', ko: '생산성 향상과\n디지털 역량 강화', en: 'Productivity improvement\n& digital capability', ja: '生産性向上と\nデジタル能力強化' },
  { key: 'support.cat4_label', ko: '중견 기업', en: 'Mid-sized Corp', ja: '中堅企業' },
  { key: 'support.cat4_desc', ko: '조직 고도화와\n신사업 발굴 지원', en: 'Organization advancement\n& new business discovery', ja: '組織高度化と\n新事業発掘支援' },
  { key: 'support.cat5_label', ko: '수출 · 글로벌', en: 'Export · Global', ja: '輸出 · グローバル' },
  { key: 'support.cat5_desc', ko: '수출 역량 강화와\n글로벌 네트워크 연결', en: 'Export capability\n& global networking', ja: '輸出能力強化と\nグローバルネットワーク接続' },
  { key: 'support.agree_marketing', ko: '[선택] 마케팅 목적의 안내를 받아보는 것에 동의합니다.', en: '[Optional] I agree to receive marketing communications.', ja: '[任意] マーケティング目的の案内の受信に同意します。' },

  // ── Common ──
  { key: 'common.view_detail', ko: '자세히 보기', en: 'View Details', ja: '詳細を見る' },
  { key: 'common.back', ko: '뒤로가기', en: 'Go Back', ja: '戻る' },
  { key: 'common.list', ko: '목록으로', en: 'Back to List', ja: '一覧へ' },

  // ── Status (작업현황) ──
  { key: 'status.title', ko: '작업현황', en: 'Project Status', ja: 'プロジェクト現況' },
  { key: 'status.desc', ko: '현재 진행중인 프로젝트의 상태를 확인하세요.', en: 'Check the status of current projects.', ja: '現在進行中のプロジェクトの状況をご確認ください。' },
  { key: 'status.tab_all', ko: '모두', en: 'All', ja: 'すべて' },
  { key: 'status.tab_web', ko: '웹', en: 'Web', ja: 'ウェブ' },
  { key: 'status.tab_app', ko: '앱', en: 'App', ja: 'アプリ' },
  { key: 'status.estimating', ko: '견적중', en: 'Estimating', ja: '見積中' },
  { key: 'status.in_progress', ko: '진행중', en: 'In Progress', ja: '進行中' },
  { key: 'status.answered', ko: '답변완료', en: 'Answered', ja: '回答完了' },
  { key: 'status.delivered', ko: '납품완료', en: 'Delivered', ja: '納品完了' },
  { key: 'status.empty', ko: '등록된 프로젝트가 없습니다.', en: 'No projects found.', ja: '登録されたプロジェクトはありません。' },

  // ── Home JA (일본어 전용 홈) ──
  // Hero
  { key: 'home_ja.hero.badge', ko: '🇯🇵 LEPISODE JAPAN', en: '🇯🇵 LEPISODE JAPAN', ja: '🇯🇵 LEPISODE JAPAN' },
  { key: 'home_ja.hero.title', ko: '기획부터 AI까지,<br>디지털 변혁의 모든 것을.', en: 'From Planning to AI,<br>Everything for Digital Transformation.', ja: '企画からAIまで、<br>デジタル変革のすべてを。' },
  { key: 'home_ja.hero.desc', ko: '웹·앱 개발, AI 솔루션, 마케팅까지<br>레피소드가 DX 추진의 모든 단계를 함께 설계합니다.', en: 'Web/App development, AI solutions, marketing<br>LEPISODE designs every step of DX transformation together.', ja: 'ウェブ・アプリ開発、AI ソリューション、マーケティングまで<br>レピソードがDX推進のすべてのステップを共に設計します。' },
  { key: 'home_ja.hero.cta_contact', ko: '문의하기 →', en: 'Contact Us →', ja: 'お問い合わせ →' },
  { key: 'home_ja.hero.cta_portfolio', ko: '실적 보기', en: 'View Portfolio', ja: '実績を見る' },

  // Strengths
  { key: 'home_ja.strength.0', ko: '프로젝트 실적', en: 'Projects Delivered', ja: 'プロジェクト実績' },
  { key: 'home_ja.strength.1', ko: '수상 실적 (2024~2025)', en: 'Awards (2024~2025)', ja: '受賞実績 (2024〜2025)' },
  { key: 'home_ja.strength.2', ko: '전문 인재', en: 'Expert Staff', ja: '専門人材' },
  { key: 'home_ja.strength.3', ko: '모니터링', en: 'Monitoring', ja: 'モニタリング' },

  // Services section
  { key: 'home_ja.svc.heading', ko: '원스톱 서비스', en: 'One-Stop Service', ja: 'ワンストップサービス' },
  { key: 'home_ja.svc.sub', ko: '기획부터 운영까지, 모든 것을 맡겨주세요.', en: 'From planning to operation, leave everything to us.', ja: '企画から運用まで、すべてをお任せください。' },
  { key: 'home_ja.svc.0.title', ko: 'AI 솔루션', en: 'AI Solutions', ja: 'AIソリューション' },
  { key: 'home_ja.svc.0.desc', ko: '자연어 처리·OCR·자동화로\n비즈니스를 혁신합니다', en: 'NLP, OCR & automation\nto innovate your business', ja: '自然言語処理・OCR・自動化で\nビジネスを革新します' },
  { key: 'home_ja.svc.1.title', ko: '플랫폼', en: 'Platform', ja: 'プラットフォーム' },
  { key: 'home_ja.svc.1.desc', ko: 'SaaS·B2B·ERP 등\n기업용 플랫폼 구축', en: 'SaaS, B2B, ERP\nenterprise platform development', ja: 'SaaS・B2B・ERPなど\n企業向けプラットフォーム構築' },
  { key: 'home_ja.svc.2.title', ko: '웹/앱 개발', en: 'Web / App Dev', ja: 'ウェブ / アプリ開発' },
  { key: 'home_ja.svc.2.desc', ko: '프론트엔드·모바일 앱\n기획부터 개발까지', en: 'Frontend & mobile app\nfrom planning to development', ja: 'フロントエンド・モバイルアプリ\nの企画から開発まで' },
  { key: 'home_ja.svc.3.title', ko: '비즈니스 솔루션', en: 'Business Solutions', ja: 'ビジネスソリューション' },
  { key: 'home_ja.svc.3.desc', ko: 'CRM·ERP·POS 등\n업무 효율화 솔루션', en: 'CRM, ERP, POS\nbusiness optimization solutions', ja: 'CRM・ERP・POSなど\n業務効率化ソリューション' },
  { key: 'home_ja.svc.4.title', ko: '마케팅', en: 'Marketing', ja: 'マーケティング' },
  { key: 'home_ja.svc.4.desc', ko: 'SNS 마케팅·BI\n브랜드 디자인', en: 'SNS Marketing, BI\nBrand Design', ja: 'SNSマーケティング・BI\nブランドデザイン' },
  { key: 'home_ja.svc.5.title', ko: '호스팅', en: 'Hosting', ja: 'ホスティング' },
  { key: 'home_ja.svc.5.desc', ko: 'AWS·GCP 기반의\n안정적인 인프라 운용', en: 'AWS & GCP based\nstable infrastructure operation', ja: 'AWS・GCP基盤の\n安定したインフラ運用' },

  // Process section
  { key: 'home_ja.process.heading', ko: '프로젝트 진행 플로우', en: 'Project Workflow', ja: 'プロジェクト進行フロー' },
  { key: 'home_ja.process.0.title', ko: '상담', en: 'Consultation', ja: 'ヒアリング' },
  { key: 'home_ja.process.0.desc', ko: '비즈니스 과제와\n목표를 파악합니다', en: 'Understanding business\nchallenges and goals', ja: 'ビジネス課題と\n目標を把握します' },
  { key: 'home_ja.process.1.title', ko: '기획·설계', en: 'Planning & Design', ja: '企画・設計' },
  { key: 'home_ja.process.1.desc', ko: '최적의 솔루션을\n제안합니다', en: 'Proposing the optimal\nsolution', ja: '最適なソリューションを\nご提案します' },
  { key: 'home_ja.process.2.title', ko: '개발·구현', en: 'Development', ja: '開発・実装' },
  { key: 'home_ja.process.2.desc', ko: '전문 팀이\n개발을 진행합니다', en: 'Expert team proceeds\nwith development', ja: '専門チームが\n開発を進めます' },
  { key: 'home_ja.process.3.title', ko: '납품·운용', en: 'Delivery & Operation', ja: '納品・運用' },
  { key: 'home_ja.process.3.desc', ko: '운영 지원과\n유지보수를 제공합니다', en: 'Providing operation support\nand maintenance', ja: '運用サポートと\n保守を提供します' },

  // CTA
  { key: 'home_ja.cta.title', ko: '프로젝트를 생각하고 계신가요?', en: 'Considering a project?', ja: 'プロジェクトをお考えですか？' },
  { key: 'home_ja.cta.desc', ko: '편하게 상담해주세요. 전문 팀이 최적의 솔루션을 제안합니다.', en: 'Feel free to consult us. Our expert team will propose the optimal solution.', ja: 'お気軽にご相談ください。専門チームが最適なソリューションをご提案します。' },
  { key: 'home_ja.cta.contact', ko: '무료 상담 신청', en: 'Request Free Consultation', ja: '無料相談を申し込む' },
  { key: 'home_ja.cta.kakao', ko: 'KakaoTalk 상담', en: 'KakaoTalk Consultation', ja: 'KakaoTalk 相談' },
];

async function main() {
  console.log('🚀 Starting translation seed...');
  let ok = 0, fail = 0;

  for (const t of translations) {
    try {
      await prisma.translation.upsert({
        where: { key: t.key },
        create: { key: t.key, ko: t.ko, en: t.en || null, ja: t.ja || null },
        update: { ko: t.ko, en: t.en || null, ja: t.ja || null },
      });
      ok++;
      process.stdout.write(`\r✅ ${ok}/${translations.length} inserted...`);
    } catch (e) {
      fail++;
      console.log(`\n❌ ${t.key}: ${e.message}`);
    }
  }

  console.log(`\n\n🎉 Done! Success: ${ok}, Failed: ${fail}`);
  await prisma.$disconnect();
}

main().catch(console.error);
