// Add new milestone status translations
export const milestoneStatusTranslations = {
  en: {
    // Existing statuses
    pending: "Pending",
    payment_submitted: "Payment Submitted", 
    approved: "Approved",
    rejected: "Rejected",
    
    // New statuses
    in_progress: "In Progress",
    under_review: "Under Review",
    revision_requested: "Revision Requested", 
    completed: "Completed",
    on_hold: "On Hold",
    cancelled: "Cancelled",
    
    // Status descriptions
    pendingDesc: "Milestone is waiting to be started",
    in_progressDesc: "Work is currently being done on this milestone",
    under_reviewDesc: "Work is completed and waiting for client review",
    revision_requestedDesc: "Client has requested changes to the deliverable",
    payment_submittedDesc: "Client has submitted payment proof",
    approvedDesc: "Payment has been approved and milestone is complete",
    rejectedDesc: "Payment proof was rejected",
    completedDesc: "Milestone is fully completed",
    on_holdDesc: "Work on this milestone is temporarily paused",
    cancelledDesc: "This milestone has been cancelled",
    
    // Status actions
    markInProgress: "Mark as In Progress",
    markUnderReview: "Mark as Under Review", 
    requestRevision: "Request Revision",
    markCompleted: "Mark as Completed",
    putOnHold: "Put On Hold",
    cancelMilestone: "Cancel Milestone",
    resumeWork: "Resume Work",
    
    // Status change confirmations
    confirmStatusChange: "Are you sure you want to change the status?",
    statusChangedSuccessfully: "Status changed successfully",
    statusChangeError: "Failed to change status"
  },
  ar: {
    // Existing statuses
    pending: "في الانتظار",
    payment_submitted: "تم تقديم الدفع",
    approved: "مُوافق عليه", 
    rejected: "مرفوض",
    
    // New statuses
    in_progress: "قيد التنفيذ",
    under_review: "قيد المراجعة",
    revision_requested: "مطلوب تعديل",
    completed: "مكتمل",
    on_hold: "متوقف مؤقتاً",
    cancelled: "ملغي",
    
    // Status descriptions
    pendingDesc: "المعلم في انتظار البدء",
    in_progressDesc: "يتم العمل حالياً على هذا المعلم",
    under_reviewDesc: "تم إنجاز العمل وفي انتظار مراجعة العميل",
    revision_requestedDesc: "طلب العميل تعديلات على التسليم",
    payment_submittedDesc: "قدم العميل إثبات الدفع",
    approvedDesc: "تم الموافقة على الدفع وإكمال المعلم",
    rejectedDesc: "تم رفض إثبات الدفع",
    completedDesc: "تم إكمال المعلم بالكامل",
    on_holdDesc: "العمل على هذا المعلم متوقف مؤقتاً",
    cancelledDesc: "تم إلغاء هذا المعلم",
    
    // Status actions
    markInProgress: "وضع علامة قيد التنفيذ",
    markUnderReview: "وضع علامة قيد المراجعة",
    requestRevision: "طلب تعديل",
    markCompleted: "وضع علامة مكتمل",
    putOnHold: "إيقاف مؤقت",
    cancelMilestone: "إلغاء المعلم",
    resumeWork: "استئناف العمل",
    
    // Status change confirmations
    confirmStatusChange: "هل أنت متأكد من تغيير الحالة؟",
    statusChangedSuccessfully: "تم تغيير الحالة بنجاح",
    statusChangeError: "فشل في تغيير الحالة"
  }
};

export const projectTranslations = {
  en: {
    // Project management
    projects: "Projects",
    createProject: "Create Project",
    editProject: "Edit Project",
    deleteProject: "Delete Project",
    projectName: "Project Name",
    projectBrief: "Project Brief",
    clientEmail: "Client Email",
    startDate: "Start Date",
    endDate: "End Date",
    
    // Project details and forms
    projectDetails: "Project Details",
    projectNamePlaceholder: "Enter project name",
    projectBriefPlaceholder: "Describe your project requirements and goals",
    projectNamePlaceholder_edit: "Enter project name",
    projectBriefPlaceholder_edit: "Describe your project requirements and goals",
    client: "Client",
    
    // Milestones
    milestones: "Milestones",
    milestone: "Milestone",
    addMilestone: "Add Milestone",
    editMilestone: "Edit Milestone",
    deleteMilestone: "Delete Milestone",
    milestoneTitle: "Milestone Title",
    milestoneDescription: "Milestone Description",
    milestonePrice: "Milestone Price",
    projectMilestones: "Project Milestones",
    milestoneLabel: "Milestone {{index}}",
    milestoneTitleLabel: "Milestone Title",
    milestoneTitlePlaceholder: "Enter milestone title",
    milestoneTitlePlaceholder_edit: "Enter milestone title",
    milestoneDescriptionPlaceholder: "Describe what will be delivered in this milestone",
    milestoneDescriptionPlaceholder_edit: "Describe what will be delivered in this milestone",
    milestonePricePlaceholder_edit: "0.00",
    priceLabel: "Price ({{currency}})",
    descriptionLabel: "Description",
    
    // Payment and delivery settings
    paymentDeliverySettings: "Payment & Delivery Settings",
    requirePaymentProof: "Require Payment Proof",
    paymentProofDescription: "When enabled, clients must upload payment proof before they can download deliverables. This helps ensure you receive payment before delivery.",
    
    // Template settings
    saveAsTemplateLabel: "Save as Template",
    
    // Form actions
    creating: "Creating...",
    
    // Status and actions
    status: "Status",
    milestoneStatus: "Milestone Status",
    approve: "Approve",
    reject: "Reject",
    upload: "Upload",
    download: "Download",
    
    // Payment
    paymentProof: "Payment Proof",
    paymentRequired: "Payment Required",
    paymentApproved: "Payment Approved",
    paymentRejected: "Payment Rejected",
    
    // Deliverables
    deliverable: "Deliverable",
    deliverables: "Deliverables",
    uploadDeliverable: "Upload Deliverable",
    downloadDeliverable: "Download Deliverable",
    
    // Common actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    title: "Title",
    description: "Description",
    
    // Messages
    projectCreated: "Project created successfully",
    projectUpdated: "Project updated successfully",
    projectDeleted: "Project deleted successfully",
    milestoneCreated: "Milestone created successfully",
    milestoneUpdated: "Milestone updated successfully",
    milestoneDeleted: "Milestone deleted successfully",
    
    // Client selection
    selectClientOrEnterEmail: "Select client or enter email",
    
    // Milestone status messages
    milestoneAwaitingStart: "This milestone is awaiting to be started",
    milestoneInProgress: "Work is currently in progress on this milestone",
    milestoneUnderReview: "This milestone is under client review",
    milestoneRevisionRequested: "Client has requested revisions",
    paymentApprovedClientDownload: "Payment approved - client can download deliverables",
    milestoneCompleted: "This milestone has been completed",
    milestoneOnHold: "This milestone is temporarily on hold",
    milestoneCancelled: "This milestone has been cancelled",
    paymentProofSubmittedByClient: "Payment proof has been submitted by the client",
    open: "Open",
    approvePayment: "Approve Payment",
    
    ...milestoneStatusTranslations.en,
  },
  ar: {
    // Project management
    projects: "المشاريع",
    createProject: "إنشاء مشروع",
    editProject: "تعديل المشروع",
    deleteProject: "حذف المشروع",
    projectName: "اسم المشروع",
    projectBrief: "وصف المشروع",
    clientEmail: "بريد العميل الإلكتروني",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    
    // Project details and forms
    projectDetails: "تفاصيل المشروع",
    projectNamePlaceholder: "أدخل اسم المشروع",
    projectBriefPlaceholder: "اوصف متطلبات وأهداف مشروعك",
    projectNamePlaceholder_edit: "أدخل اسم المشروع",
    projectBriefPlaceholder_edit: "اوصف متطلبات وأهداف مشروعك",
    client: "العميل",
    
    // Milestones
    milestones: "المعالم",
    milestone: "معلم",
    addMilestone: "إضافة معلم",
    editMilestone: "تعديل المعلم",
    deleteMilestone: "حذف المعلم",
    milestoneTitle: "عنوان المعلم",
    milestoneDescription: "وصف المعلم",
    milestonePrice: "سعر المعلم",
    projectMilestones: "معالم المشروع",
    milestoneLabel: "المعلم {{index}}",
    milestoneTitleLabel: "عنوان المعلم",
    milestoneTitlePlaceholder: "أدخل عنوان المعلم",
    milestoneTitlePlaceholder_edit: "أدخل عنوان المعلم",
    milestoneDescriptionPlaceholder: "اوصف ما سيتم تسليمه في هذا المعلم",
    milestoneDescriptionPlaceholder_edit: "اوصف ما سيتم تسليمه في هذا المعلم",
    milestonePricePlaceholder_edit: "0.00",
    priceLabel: "السعر ({{currency}})",
    descriptionLabel: "الوصف",
    
    // Payment and delivery settings
    paymentDeliverySettings: "إعدادات الدفع والتسليم",
    requirePaymentProof: "مطالبة بإثبات الدفع",
    paymentProofDescription: "عند التفعيل، يجب على العملاء رفع إثبات الدفع قبل أن يتمكنوا من تحميل التسليمات. هذا يساعد في ضمان الحصول على الدفع قبل التسليم.",
    
    // Template settings
    saveAsTemplateLabel: "حفظ كقالب",
    
    // Form actions
    creating: "جاري الإنشاء...",
    
    // Status and actions
    status: "الحالة",
    milestoneStatus: "حالة المعلم",
    approve: "موافقة",
    reject: "رفض",
    upload: "رفع",
    download: "تحميل",
    
    // Payment
    paymentProof: "إثبات الدفع",
    paymentRequired: "الدفع مطلوب",
    paymentApproved: "تم الموافقة على الدفع",
    paymentRejected: "تم رفض الدفع",
    
    // Deliverables
    deliverable: "التسليم",
    deliverables: "التسليمات",
    uploadDeliverable: "رفع التسليم",
    downloadDeliverable: "تحميل التسليم",
    
    // Common actions
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    back: "رجوع",
    title: "العنوان",
    description: "الوصف",
    
    // Messages
    projectCreated: "تم إنشاء المشروع بنجاح",
    projectUpdated: "تم تحديث المشروع بنجاح",
    projectDeleted: "تم حذف المشروع بنجاح",
    milestoneCreated: "تم إنشاء المعلم بنجاح",
    milestoneUpdated: "تم تحديث المعلم بنجاح",
    milestoneDeleted: "تم حذف المعلم بنجاح",
    
    // Client selection
    selectClientOrEnterEmail: "اختر عميل أو أدخل البريد الإلكتروني",
    
    // Milestone status messages
    milestoneAwaitingStart: "هذا المعلم في انتظار البدء",
    milestoneInProgress: "العمل جاري حالياً على هذا المعلم",
    milestoneUnderReview: "هذا المعلم قيد مراجعة العميل",
    milestoneRevisionRequested: "طلب العميل تعديلات",
    paymentApprovedClientDownload: "تم الموافقة على الدفع - يمكن للعميل تحميل التسليمات",
    milestoneCompleted: "تم إكمال هذا المعلم",
    milestoneOnHold: "هذا المعلم متوقف مؤقتاً",
    milestoneCancelled: "تم إلغاء هذا المعلم",
    paymentProofSubmittedByClient: "تم تقديم إثبات الدفع من قبل العميل",
    open: "فتح",
    approvePayment: "الموافقة على الدفع",
    
    ...milestoneStatusTranslations.ar,
  }
};
