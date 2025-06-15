
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  en: {
    dashboard: "Dashboard",
    profile: "Profile",
    signOut: "Sign Out",
    login: "Login",
    signUp: "Sign Up",
    welcomeBack: "Welcome back, {name}!",
    manageProjects: "Manage your freelance projects and track payments",
    newProject: "New Project",
    totalProjects: "Total Projects",
    totalEarnings: "Total Earnings",
    fromCompletedMilestones: "From completed milestones",
    pendingPayments: "Pending Payments",
    awaitingApproval: "Awaiting approval",
    completed: "Completed",
    milestonesCompleted: "Milestones completed",
    yourProjects: "Your Projects",
    createFirstProject: "Create Your First Project",
    noProjectsYet: "No Projects Yet",
    createFirstProjectDesc: "Create your first project to start managing client deliverables",
    createProject: "Create Project",
    loadingDashboard: "Loading your dashboard...",
    activeProjects: "Active projects",
    signInSuccess: "Signed in successfully!",
    areYouSureDeleteProject: "Are you sure you want to delete this project?",
    // Add other keys as needed
  },
  ar: {
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    signOut: "تسجيل الخروج",
    login: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    welcomeBack: "مرحباً بعودتك، {name}!",
    manageProjects: "قم بإدارة مشاريعك الحرة وتابع المدفوعات",
    newProject: "مشروع جديد",
    totalProjects: "إجمالي المشاريع",
    totalEarnings: "إجمالي الأرباح",
    fromCompletedMilestones: "من المراحل المنجزة",
    pendingPayments: "دفعات معلقة",
    awaitingApproval: "بانتظار الموافقة",
    completed: "مكتمل",
    milestonesCompleted: "مراحل منجزة",
    yourProjects: "مشاريعك",
    createFirstProject: "أنشئ أول مشروع لك",
    noProjectsYet: "لا توجد مشاريع بعد",
    createFirstProjectDesc: "قم بإنشاء مشروعك الأول لبدء إدارة تسليمات العملاء",
    createProject: "إنشاء مشروع",
    loadingDashboard: "جاري تحميل لوحة التحكم...",
    activeProjects: "مشاريع نشطة",
    signInSuccess: "تم تسجيل الدخول بنجاح!",
    areYouSureDeleteProject: "هل أنت متأكد أنك تريد حذف هذا المشروع؟",
    // Add other keys as needed
  },
};

export type TranslationKey = keyof typeof translations["en"];

export function translate(key: TranslationKey, lang: "en" | "ar", vars?: Record<string, string>) {
  let text = translations[lang][key] || key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

export function useT() {
  const { language } = useLanguage();
  return (key: TranslationKey, vars?: Record<string, string>) =>
    translate(key, language, vars);
}
