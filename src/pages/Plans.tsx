import Layout from '@/components/Layout';
import { SubscriptionPlans } from '@/components/Subscription/SubscriptionPlans';
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEO/SEOHead';
import { createFAQSchema } from '@/lib/seo/globalSchemas';

const Plans = () => {
  const t = useT();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { handleSignOut } = useDashboardActions(() => Promise.resolve(true));

  // FAQ data for GEO (Generative Engine Optimization)
  // These Q&A pairs help AI search engines understand and cite Ruzma's pricing
  const pricingFAQs = language === 'ar' ? [
    {
      question: 'كم تبلغ تكلفة رزمة؟',
      answer: 'توفر رزمة ثلاث خطط: مجانية (مشروع واحد، 5 عملاء، 5 فواتير)، Plus بسعر 19 دولارًا شهريًا (مشاريع غير محدودة، مساعد الذكاء الاصطناعي، جميع الميزات المتقدمة)، و Pro بسعر 349 دولارًا للدفع مرة واحدة مدى الحياة (وصول دائم لجميع ميزات Plus باستثناء الذكاء الاصطناعي).'
    },
    {
      question: 'ما المتضمن في الخطة المجانية؟',
      answer: 'تتضمن الخطة المجانية مشروع واحد، 5 عملاء، 5 فواتير، و 100 ميغابايت من التخزين. مثالية للمستقلين الذين بدأوا للتو ويريدون تجربة رزمة.'
    },
    {
      question: 'هل يمكنني الترقية أو التخفيض لخطتي؟',
      answer: 'نعم، يمكنك الترقية من المجانية إلى Plus أو Pro في أي وقت. يمكن لمستخدمي Plus التخفيض إلى المجانية، لكن مستخدمي Pro لديهم وصول دائم ولا يمكنهم التخفيض.'
    },
    {
      question: 'ما الفرق بين Plus و Pro؟',
      answer: 'كلتا الخطتين توفران مشاريع غير محدودة وميزات متقدمة. Plus هي 19 دولارًا/شهر وتتضمن مساعد الذكاء الاصطناعي. Pro هي دفعة واحدة بـ 349 دولارًا للوصول مدى الحياة بدون مساعد الذكاء الاصطناعي. اختر Plus للدفع الشهري مع الذكاء الاصطناعي، أو Pro للملكية مدى الحياة.'
    },
    {
      question: 'هل هناك سياسة استرداد؟',
      answer: 'نعم، نقدم فترة تجريبية لمدة 7 أيام لخطة Plus. يمكنك الإلغاء خلال فترة التجربة دون أي رسوم. لمشتريات Pro (دفعة واحدة)، نقدم ضمان استرداد لمدة 30 يومًا.'
    },
    {
      question: 'هل رزمة آمنة لبياناتي؟',
      answer: 'نعم، رزمة تستخدم تشفير SSL، تخزين آمن عبر Supabase، ومصادقة على مستوى المؤسسات. بياناتك محمية ومعزولة عن المستخدمين الآخرين.'
    }
  ] : [
    {
      question: 'How much does Ruzma cost?',
      answer: 'Ruzma offers three plans: Free (1 project, 5 clients, 5 invoices), Plus at $19/month (unlimited projects, AI assistant, all premium features), and Pro at $349 one-time payment (lifetime access to all Plus features except AI).'
    },
    {
      question: 'What\'s included in the free plan?',
      answer: 'The free plan includes 1 project, 5 clients, 5 invoices, and 100MB storage. It\'s perfect for freelancers just starting out who want to try Ruzma.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can upgrade from Free to Plus or Pro at any time. Plus users can downgrade to Free, but Pro users have lifetime access and cannot downgrade.'
    },
    {
      question: 'What\'s the difference between Plus and Pro?',
      answer: 'Both plans offer unlimited projects and premium features. Plus is $19/month and includes AI assistant. Pro is a one-time $349 payment for lifetime access without AI assistant. Choose Plus for monthly payments with AI, or Pro for lifetime ownership.'
    },
    {
      question: 'Is there a refund policy?',
      answer: 'Yes, we offer a 7-day trial period for the Plus plan. You can cancel during the trial with no charges. For Pro purchases (one-time payment), we offer a 30-day money-back guarantee.'
    },
    {
      question: 'Is Ruzma secure for my data?',
      answer: 'Yes, Ruzma uses SSL encryption, secure storage via Supabase, and enterprise-grade authentication. Your data is protected and isolated from other users.'
    }
  ];

  // Create FAQ schema for SEO/GEO
  const faqSchema = createFAQSchema(pricingFAQs);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>;
  }

  const pageTitle = language === 'ar'
    ? 'الأسعار والخطط | رزمة'
    : 'Pricing Plans | Ruzma';

  const pageDescription = language === 'ar'
    ? 'اختر الخطة المناسبة لاحتياجاتك. ابدأ مجانًا، أو احصل على ميزات متقدمة مع Plus ($19/شهر)، أو امتلك مدى الحياة مع Pro ($349 دفعة واحدة).'
    : 'Choose the plan that fits your needs. Start free, get premium features with Plus ($19/month), or own it for life with Pro ($349 one-time).';

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords={language === 'ar'
          ? 'أسعار رزمة، خطط رزمة، إدارة المشاريع للمستقلين، أسعار إدارة العملاء'
          : 'Ruzma pricing, Ruzma plans, freelancer management pricing, project management cost'
        }
        canonical={`https://app.ruzma.co/${language}/plans`}
        structuredData={faqSchema}
      />

      <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
            {t('choosePlan')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('upgradeAccount')}
          </p>
        </div>

        <SubscriptionPlans />

        {/* FAQ Section for GEO - Helps AI search engines understand pricing */}
        <div className="max-w-4xl mx-auto mt-16 mb-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-6">
            {pricingFAQs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Plans;
