// Contract template constants for project creation
// These templates provide default contract terms and payment schedules
// for both English and Arabic languages

export const DEFAULT_CONTRACT_TERMS = {
  en: `Terms and Conditions:

1. SCOPE OF WORK
The freelancer agrees to provide the services outlined in the project scope and milestones detailed in this agreement.

2. PAYMENT TERMS
Payment will be made according to the milestone schedule outlined below. All payments are due within 7 days of milestone completion and approval.

3. INTELLECTUAL PROPERTY
Upon full payment, all intellectual property rights for the completed work will transfer to the client.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all proprietary information shared during this project.

5. REVISIONS
Revisions are included as outlined in the revision policy. Additional revisions beyond the scope may incur extra charges.

6. TERMINATION
Either party may terminate this agreement with 7 days written notice. Client will pay for all completed work up to the termination date.`,
  
  ar: `الشروط والأحكام:

1. نطاق العمل
يوافق المستقل على تقديم الخدمات المحددة في نطاق المشروع والمراحل المفصلة في هذه الاتفاقية.

2. شروط الدفع
سيتم الدفع وفقاً لجدول المراحل المحدد أدناه. جميع المدفوعات مستحقة خلال 7 أيام من اكتمال المرحلة والموافقة عليها.

3. الملكية الفكرية
عند الدفع الكامل، ستنتقل جميع حقوق الملكية الفكرية للعمل المكتمل إلى العميل.

4. السرية
يوافق الطرفان على الحفاظ على سرية جميع المعلومات الخاصة المشتركة أثناء هذا المشروع.

5. المراجعات
المراجعات مشمولة كما هو محدد في سياسة المراجعات. المراجعات الإضافية خارج النطاق قد تستدعي رسوماً إضافية.

6. الإنهاء
يمكن لأي من الطرفين إنهاء هذه الاتفاقية بإشعار كتابي مدته 7 أيام. سيدفع العميل مقابل جميع الأعمال المكتملة حتى تاريخ الإنهاء.`
};

export const DEFAULT_PAYMENT_TERMS = {
  en: `Payment Schedule:
- Payments due within 7 days of milestone completion
- Late payments may incur a 1.5% monthly fee
- All payments in the agreed project currency
- Payment methods: Bank transfer, PayPal, or as agreed
- Partial refunds available for incomplete milestones only`,
  
  ar: `جدول الدفع:
- المدفوعات مستحقة خلال 7 أيام من اكتمال المرحلة
- المدفوعات المتأخرة قد تستدعي رسوماً شهرية بنسبة 1.5%
- جميع المدفوعات بعملة المشروع المتفق عليها
- طرق الدفع: التحويل البنكي، باي بال، أو كما متفق عليه
- المبالغ المستردة الجزئية متاحة للمراحل غير المكتملة فقط`
};

export const DEFAULT_PROJECT_SCOPE = {
  en: `Project Scope:
- Detailed project deliverables as outlined in milestones
- Timeline and deadline requirements
- Communication and collaboration expectations
- File formats and delivery requirements
- Quality standards and acceptance criteria`,
  
  ar: `نطاق المشروع:
- مخرجات المشروع المفصلة كما هو محدد في المراحل
- متطلبات الجدول الزمني والمواعيد النهائية
- توقعات التواصل والتعاون
- تنسيقات الملفات ومتطلبات التسليم
- معايير الجودة ومعايير القبول`
};

export const DEFAULT_REVISION_POLICY = {
  en: `Revision Policy:
- Up to 3 rounds of revisions included per milestone
- Additional revisions beyond scope may incur extra charges
- Major scope changes require separate agreement
- Revision requests must be submitted in writing
- Turnaround time: 2-3 business days for revisions`,
  
  ar: `سياسة المراجعات:
- يشمل حتى 3 جولات مراجعة لكل مرحلة
- المراجعات الإضافية خارج النطاق قد تستدعي رسوماً إضافية
- تغييرات النطاق الرئيسية تتطلب اتفاقية منفصلة
- طلبات المراجعة يجب تقديمها كتابياً
- وقت التسليم: 2-3 أيام عمل للمراجعات`
};

// Helper function to get template by language
export const getContractTemplate = (
  templateType: keyof typeof DEFAULT_CONTRACT_TERMS,
  language: 'en' | 'ar' = 'en'
): string => {
  switch (templateType) {
    case 'en':
    case 'ar':
      return DEFAULT_CONTRACT_TERMS[language];
    default:
      return DEFAULT_CONTRACT_TERMS[language];
  }
};

export const getPaymentTermsTemplate = (language: 'en' | 'ar' = 'en'): string => {
  return DEFAULT_PAYMENT_TERMS[language];
};

export const getProjectScopeTemplate = (language: 'en' | 'ar' = 'en'): string => {
  return DEFAULT_PROJECT_SCOPE[language];
};

export const getRevisionPolicyTemplate = (language: 'en' | 'ar' = 'en'): string => {
  return DEFAULT_REVISION_POLICY[language];
};