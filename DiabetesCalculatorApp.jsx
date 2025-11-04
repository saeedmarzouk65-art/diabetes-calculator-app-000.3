import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc,
  setLogLevel
} from "firebase/firestore";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from "firebase/auth";

// --- START: Lucide Icons (as inline SVGs) ---
// We define the icons you used as React components
// so we don't need any external libraries.

const Activity = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const ArrowRight = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const RotateCcw = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 2v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L3 12" />
  </svg>
);

const Globe = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const Check = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertTriangle = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircle = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TrendingUp = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// --- END: Lucide Icons ---

// --- START: Stubbed shadcn/ui components ---
// Basic versions of the components you used

/**
 * A utility function to combine class names.
 * This is a simplified version of the 'cn' utility.
 */
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Basic Button component
 */
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  // Base styles
  let baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  // Variant styles
  const variantStyles = {
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    // Add other variants if needed
  };

  // Size styles
  const sizeStyles = {
    sm: "h-9 px-3",
    // Add other sizes if needed
  };

  return (
    <button
      className={cn(
        baseStyles,
        variant ? variantStyles[variant] : "",
        size ? sizeStyles[size] : "",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

/**
 * Basic Card component
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));

// --- END: Stubbed shadcn/ui components ---


// --- START: LanguageToggle Component ---
// Your components/calculator/LanguageToggle.js file
function LanguageToggle({ language, setLanguage }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="h-10 px-4 border-2 border-gray-200 hover:border-emerald-400 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <Globe className="w-4 h-4 mr-2" />
      <span className="font-semibold">
        {language === "ar" ? "English" : "العربية"}
      </span>
    </Button>
  );
}
// --- END: LanguageToggle Component ---


// --- START: QuestionCard Component ---
// Your components/calculator/QuestionCard.js file
function QuestionCard({ question, selectedOption, onSelect, isRTL, quizType }) {
  const cardColor = quizType === "CDC" ? "from-blue-500 to-blue-600" : "from-emerald-500 to-teal-600";
  const accentColor = quizType === "CDC" ? "border-blue-500 bg-blue-50" : "border-emerald-500 bg-emerald-50";

  return (
    <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border-2 border-gray-100">
      <div className={`w-16 h-1 bg-gradient-to-r ${cardColor} rounded-full mb-6`} />
      
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        {question.q}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          
          return (
            <motion.button
              key={index}
              onClick={() => onSelect(option)}
              className={cn(
                "w-full p-5 rounded-xl border-2 text-right transition-all duration-200 relative overflow-hidden group",
                isSelected
                  ? `${accentColor} shadow-lg scale-[1.02]`
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]"
              )}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? `${quizType === "CDC" ? "bg-blue-500 border-blue-500" : "bg-emerald-500 border-emerald-500"}`
                    : "border-gray-300 group-hover:border-gray-400"
                )}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                
                <span className={cn(
                  "text-lg font-medium flex-1 text-center transition-colors duration-200",
                  isSelected ? "text-gray-800" : "text-gray-700"
                )}>
                  {option.t}
                </span>

                <div className="w-7" />
              </div>

              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-200 bg-gradient-to-r",
                cardColor
              )} />
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}
// --- END: QuestionCard Component ---


// --- START: ResultDisplay Component ---
// Your components/calculator/ResultDisplay.js file
function ResultDisplay({ score, quizType, language, isRTL }) {
  const [gaugeRotation, setGaugeRotation] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const riskThreshold = quizType === "CDC" ? 5 : 7;
  const maxScore = quizType === "CDC" ? 10 : 20;
  const isHighRisk = score >= riskThreshold;

  const content = {
    ar: {
      yourScore: "نتيجتك",
      riskLevel: "مستوى الخطر",
      highRisk: "خطر مرتفع",
      lowRisk: "خطر منخفض",
      highRiskMsg: "نتيجتك تشير إلى وجود خطر مرتفع للإصابة بمرض السكري من النوع الثاني. يُنصح بشدة باستشارة طبيب مختص واتخاذ خطوات وقائية فورية.",
      lowRiskMsg: "نتيجتك جيدة! مع ذلك، من المهم الحفاظ على نمط حياة صحي والمتابعة الدورية مع الطبيب.",
      recommendations: "التوصيات",
      highRiskRecs: [
        "استشر طبيباً مختصاً في أقرب وقت",
        "قم بفحص السكر في الدم بشكل دوري",
        "مارس الرياضة بانتظام (30 دقيقة يومياً)",
        "حافظ على وزن صحي ونظام غذائي متوازن",
        "تجنب التدخين والمشروبات الغازية"
      ],
      lowRiskRecs: [
        "حافظ على نمط حياتك الصحي",
        "مارس الرياضة بانتظام",
        "اتبع نظاماً غذائياً متوازناً",
        "قم بفحص دوري كل سنة",
        "راقب وزنك وضغط الدم"
      ],
      savedMsg: "تم حفظ نتيجتك في قاعدة البيانات بنجاح!"
    },
    en: {
      yourScore: "Your Score",
      riskLevel: "Risk Level",
      highRisk: "High Risk",
      lowRisk: "Low Risk",
      highRiskMsg: "Your score indicates a high risk for Type 2 Diabetes. It is strongly recommended to consult a specialist and take immediate preventive measures.",
      lowRiskMsg: "Your score is good! However, it's important to maintain a healthy lifestyle and regular medical check-ups.",
      recommendations: "Recommendations",
      highRiskRecs: [
        "Consult a specialist as soon as possible",
        "Get regular blood sugar tests",
        "Exercise regularly (30 minutes daily)",
        "Maintain a healthy weight and balanced diet",
        "Avoid smoking and sugary drinks"
      ],
      lowRiskRecs: [
        "Maintain your healthy lifestyle",
        "Exercise regularly",
        "Follow a balanced diet",
        "Get annual check-ups",
        "Monitor your weight and blood pressure"
      ],
      savedMsg: "Your result has been saved to the database successfully!"
    }
  };

  const t = content[language];

  useEffect(() => {
    const targetRotation = Math.min(180, (score / maxScore) * 180);
    setTimeout(() => {
      setGaugeRotation(targetRotation);
      setTimeout(() => setShowContent(true), 800);
    }, 300);
  }, [score, maxScore]);

  const recommendations = isHighRisk ? t.highRiskRecs : t.lowRiskRecs;

  return (
    <div className="space-y-6">
      <Card className={cn(
        "p-8 shadow-2xl border-4 relative overflow-hidden",
        isHighRisk ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50" : "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
      )}>
        <div className={cn(
          "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20",
          isHighRisk ? "bg-red-400" : "bg-green-400"
        )} style={{ transform: 'translate(30%, -30%)' }} />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-lg",
              isHighRisk ? "bg-gradient-to-br from-red-500 to-orange-600" : "bg-gradient-to-br from-green-500 to-emerald-600"
            )}>
              {isHighRisk ? (
                <AlertTriangle className="w-10 h-10 text-white" />
              ) : (
                <CheckCircle className="w-10 h-10 text-white" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <p className="text-gray-600 text-lg mb-2">{t.yourScore}</p>
            <div className="flex items-center justify-center gap-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
                className={cn(
                  "text-6xl font-bold",
                  isHighRisk ? "text-red-600" : "text-green-600"
                )}
              >
                {score}
              </motion.span>
              <span className="text-3xl text-gray-400">/ {maxScore}</span>
            </div>
          </motion.div>

          <div className="relative w-48 h-24 mx-auto mb-6">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <motion.path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke={isHighRisk ? "#ef4444" : "#10b981"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (gaugeRotation / 180) * 251.2 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <motion.line
                x1="100"
                y1="90"
                x2="100"
                y2="20"
                stroke={isHighRisk ? "#dc2626" : "#059669"}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ transform: "rotate(-90deg)" }}
                animate={{ transform: `rotate(${gaugeRotation - 90}deg)` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ transformOrigin: "100px 90px" }}
              />
              <circle cx="100" cy="90" r="6" fill={isHighRisk ? "#dc2626" : "#059669"} />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            className="text-center mb-6"
          >
            <p className="text-gray-600 text-sm mb-2">{t.riskLevel}</p>
            <div className={cn(
              "inline-block px-6 py-3 rounded-full text-xl font-bold shadow-lg",
              isHighRisk ? "bg-red-500 text-white" : "bg-green-500 text-white"
            )}>
              {isHighRisk ? t.highRisk : t.lowRisk}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-700 leading-relaxed"
          >
            {isHighRisk ? t.highRiskMsg : t.lowRiskMsg}
          </motion.p>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-8 bg-white shadow-xl border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{t.recommendations}</h3>
          </div>

          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3 text-gray-700"
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  isHighRisk ? "bg-red-100" : "bg-green-100"
                )}>
                  <Activity className={cn(
                    "w-4 h-4",
                    isHighRisk ? "text-red-600" : "text-green-600"
                  )} />
                </div>
                <span className="leading-relaxed">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <p className="text-green-600 font-semibold">{t.savedMsg}</p>
      </motion.div>
    </div>
  );
}
// --- END: ResultDisplay Component ---


// --- START: Main App Component (DiabetesCalculator) ---
// Your pages/DiabetesCalculator.js file, modified for Firebase

// --- Data Constants ---
const cdcQuestionsAr = [
  { 
    q: "ما هو جنسك؟", 
    options: [{ t: "ذكر", v: 1, key: "male" }, { t: "أنثى", v: 0, key: "female" }],
    field: "gender"
  },
  { 
    q: "كم عمرك؟", 
    options: [
      { t: "أقل من 40", v: 0, key: "<40" }, 
      { t: "40-49", v: 1, key: "40-49" }, 
      { t: "50-59", v: 2, key: "50-59" }, 
      { t: "60 فأكثر", v: 3, key: "60+" }
    ],
    field: "age"
  },
  { 
    q: "هل تمارس النشاط البدني بانتظام؟", 
    options: [{ t: "نعم", v: 0 }, { t: "لا", v: 1 }] 
  },
  { 
    q: "هل لديك قريب من الدرجة الأولى مصاب بالسكري؟", 
    options: [{ t: "نعم", v: 1 }, { t: "لا", v: 0 }] 
  },
  { 
    q: "هل تعاني من ارتفاع ضغط الدم؟", 
    options: [{ t: "نعم", v: 1 }, { t: "لا", v: 0 }] 
  }
];

const cdcQuestionsEn = [
  { 
    q: "What is your gender?", 
    options: [{ t: "Male", v: 1, key: "male" }, { t: "Female", v: 0, key: "female" }],
    field: "gender"
  },
  { 
    q: "How old are you?", 
    options: [
      { t: "Under 40", v: 0, key: "<40" }, 
      { t: "40-49", v: 1, key: "40-49" }, 
      { t: "50-59", v: 2, key: "50-59" }, 
      { t: "60 or older", v: 3, key: "60+" }
    ],
    field: "age"
  },
  { 
    q: "Do you exercise regularly?", 
    options: [{ t: "Yes", v: 0 }, { t: "No", v: 1 }] 
  },
  { 
    q: "Do you have a first-degree relative with diabetes?", 
    options: [{ t: "Yes", v: 1 }, { t: "No", v: 0 }] 
  },
  { 
    q: "Do you have high blood pressure?", 
    options: [{ t: "Yes", v: 1 }, { t: "No", v: 0 }] 
  }
];

const saudiQuestionsAr = [
  { 
    q: "ما هو عمرك؟", 
    options: [
      { t: "أقل من 35", v: 0, key: "<35" }, 
      { t: "35-44", v: 2, key: "35-44" }, 
      { t: "45-54", v: 4, key: "45-54" }, 
      { t: "55 فأكثر", v: 6, key: "55+" }
    ],
    field: "age"
  },
  { 
    q: "ما هو محيط خصرك؟", 
    options: [
      { t: "أقل من 80 سم (للنساء) أو 94 سم (للرجال)", v: 0 }, 
      { t: "80-88 سم (للنساء) أو 94-102 سم (للرجال)", v: 3 }, 
      { t: "أكثر من 88 سم (للنساء) أو 102 سم (للرجال)", v: 5 }
    ] 
  },
  { 
    q: "هل تمارس الرياضة بانتظام (30 دقيقة يومياً)؟", 
    options: [{ t: "نعم", v: 0 }, { t: "لا", v: 2 }] 
  },
  { 
    q: "هل لديك أحد أفراد العائلة مصاب بالسكري؟", 
    options: [{ t: "نعم", v: 5 }, { t: "لا", v: 0 }] 
  },
  { 
    q: "هل تعاني من ارتفاع ضغط الدم أو تتناول أدوية لعلاجه؟", 
    options: [{ t: "نعم", v: 2 }, { t: "لا", v: 0 }] 
  }
];

const saudiQuestionsEn = [
  { 
    q: "What is your age?", 
    options: [
      { t: "Under 35", v: 0, key: "<35" }, 
      { t: "35-44", v: 2, key: "35-44" }, 
      { t: "45-54", v: 4, key: "45-54" }, 
      { t: "55 or older", v: 6, key: "55+" }
    ],
    field: "age"
  },
  { 
    q: "What is your waist circumference?", 
    options: [
      { t: "Less than 80cm (women) or 94cm (men)", v: 0 }, 
      { t: "80-88cm (women) or 94-102cm (men)", v: 3 }, 
      { t: "More than 88cm (women) or 102cm (men)", v: 5 }
    ] 
  },
  { 
    q: "Do you exercise regularly (30 min daily)?", 
    options: [{ t: "Yes", v: 0 }, { t: "No", v: 2 }] 
  },
  { 
    q: "Do you have a family member with diabetes?", 
    options: [{ t: "Yes", v: 5 }, { t: "No", v: 0 }] 
  },
  { 
    q: "Do you have high blood pressure or take medication for it?", 
    options: [{ t: "Yes", v: 2 }, { t: "No", v: 0 }] 
  }
];

// Content for localization
const content = {
  ar: {
    title: "حاسبة خطر الإصابة بالسكري",
    subtitle: "اكتشف مستوى خطورة إصابتك بمرض السكري من النوع الثاني",
    cdcBtn: "ابدأ اختبار CDC الأمريكي",
    cdcDesc: "اختبار مبسط معتمد من مراكز السيطرة على الأمراض",
    saudiBtn: "ابدأ الاختبار السعودي",
    saudiDesc: "اختبار مخصص للمجتمع السعودي والخليجي",
    next: "التالي",
    restart: "إعادة الاختبار",
    saving: "جاري الحفظ...",
    question: "سؤال"
  },
  en: {
    title: "Diabetes Risk Calculator",
    subtitle: "Discover your risk level for Type 2 Diabetes",
    cdcBtn: "Start CDC Test",
    cdcDesc: "Simplified test approved by Centers for Disease Control",
    saudiBtn: "Start Saudi Test",
    saudiDesc: "Test tailored for Saudi and Gulf communities",
    next: "Next",
    restart: "Restart Test",
    saving: "Saving...",
    question: "Question"
  }
};
// --- End Data Constants ---

export default function App() {
  const [language, setLanguage] = useState("ar");
  const [screen, setScreen] = useState("menu");
  const [quizType, setQuizType] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- NEW: Firebase State ---
  // We'll store the db, auth, and userId in state
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [appId, setAppId] = useState('default-app-id');

  const isRTL = language === "ar";
  const t = content[language];

  // --- NEW: Firebase Initialization Effect ---
  useEffect(() => {
    let firebaseConfig;

    // --- METHOD 1: For publishing on Vercel/Netlify ---
    // Reads from Environment Variables you set on your host.
    // Keys must be prefixed with NEXT_PUBLIC_ (for Next.js/Vercel)
    // You can also use VITE_ (for Vite) or REACT_APP_ (for Create React App)
    
    // --- FIX: Check if 'process' and 'process.env' exist before accessing ---
    if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.log("Loading config from Vercel/production env variables...");
      firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };
    } 
    // --- METHOD 2: For this development environment ---
    // Reads from the injected global variables.
    else if (typeof __firebase_config !== 'undefined' && __firebase_config !== '{}') {
      console.log("Loading config from built-in environment...");
      const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
      firebaseConfig = JSON.parse(firebaseConfigStr);
    } 
    // --- Fallback ---
    else {
      console.error("Firebase config is missing!");
      console.log("Please set up your environment variables on Vercel or run in the correct dev environment.");
      return; // Stop if no config is found
    }

    // These global variables are provided by the environment
    const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    setAppId(currentAppId);

    try {
      // const firebaseConfig = JSON.parse(firebaseConfigStr); // Old line removed
      if (!firebaseConfig || !firebaseConfig.apiKey) { // Modified check
        console.error("Firebase config is missing or invalid.");
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      
      // Enable Firestore debug logging
      setLogLevel('Debug');

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // --- Authentication ---
      onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          // User is signed in
          setUserId(user.uid);
          console.log("User authenticated with UID:", user.uid);
        } else {
          // User is signed out, sign them in
          console.log("No user found, attempting sign in...");
          try {
            if (token) {
              await signInWithCustomToken(firebaseAuth, token);
              console.log("Signed in with custom token.");
            } else {
              await signInAnonymously(firebaseAuth);
              console.log("Signed in anonymously.");
            }
          } catch (authError) {
            console.error("Error during sign-in:", authError);
          }
        }
      });

    } catch (e) {
      console.error("Error parsing Firebase config:", e);
    }
  }, []); // Empty dependency array ensures this runs only once

  const getCurrentQuestions = () => {
    if (quizType === "CDC") {
      return language === "ar" ? cdcQuestionsAr : cdcQuestionsEn;
    }
    return language === "ar" ? saudiQuestionsAr : saudiQuestionsEn;
  };

  const startQuiz = (type) => {
    setQuizType(type);
    setScreen("quiz");
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers({});
    setSelectedOption(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const questions = getCurrentQuestions();
    const currentQuestion = questions[currentQuestionIndex];
    
    const newAnswers = { ...answers };
    if (currentQuestion.field) {
      newAnswers[currentQuestion.field] = selectedOption.key || selectedOption.t;
    }
    setAnswers(newAnswers);

    const newScore = score + selectedOption.v;
    setScore(newScore);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Pass the final score and answers to the save function
      saveResult(newScore, newAnswers);
    }
  };

  // --- MODIFIED: saveResult Function ---
  const saveResult = async (finalScore, finalAnswers) => {
    setSaving(true);
    
    // Check if Firebase is ready
    if (!db || !userId) {
      console.error("Firestore DB or User ID not initialized. Cannot save.");
      setSaving(false);
      // We can still proceed to the result screen, just without saving
      setScreen("result"); 
      return;
    }

    const riskThreshold = quizType === "CDC" ? 5 : 7;
    const riskLevel = finalScore >= riskThreshold 
      ? (language === "ar" ? "خطر مرتفع" : "High Risk")
      : (language === "ar" ? "خطر منخفض" : "Low Risk");

    // This is the data object we'll save to Firestore
    const testResultData = {
      quiz_type: quizType,
      score: finalScore,
      risk_level: riskLevel,
      gender: finalAnswers.gender || "",
      age_range: finalAnswers.age || "",
      language: language,
      timestamp: new Date() // Good practice to add a timestamp
    };

    try {
      // We save the data in a user-specific collection
      const collectionPath = `/artifacts/${appId}/users/${userId}/TestResults`;
      const docRef = await addDoc(collection(db, collectionPath), testResultData);
      
      console.log("Result saved to Firestore with ID: ", docRef.id);
      
    } catch (error) {
      console.error("Error saving result to Firestore:", error);
    }
    
    setSaving(false);
    setScreen("result");
  };
  // --- END: MODIFIED saveResult ---

  const handleRestart = () => {
    setScreen("menu");
    setQuizType("");
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers({});
    setSelectedOption(null);
  };

  const questions = getCurrentQuestions();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8 font-['Inter',_sans-serif]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="w-10" />
            <div className="flex items-center gap-3 justify-center flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
          {screen === "menu" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg"
            >
              {t.subtitle}
            </motion.p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {screen === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl cursor-pointer group"
                onClick={() => startQuiz("CDC")}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.cdcBtn}</h3>
                    <p className="text-gray-600">{t.cdcDesc}</p>
                  </div>
                  <ArrowRight className={`w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform duration-300 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </Card>

              <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl cursor-pointer group"
                onClick={() => startQuiz("Saudi")}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.saudiBtn}</h3>
                    <p className="text-gray-600">{t.saudiDesc}</p>
                  </div>
                  <ArrowRight className={`w-6 h-6 text-emerald-500 group-hover:translate-x-1 transition-transform duration-300 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </Card>
            </motion.div>
          )}

          {screen === "quiz" && currentQuestion && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {t.question} {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <QuestionCard
                question={currentQuestion}
                selectedOption={selectedOption}
                onSelect={handleOptionSelect}
                isRTL={isRTL}
                quizType={quizType}
              />

              <Button
                onClick={handleNext}
                disabled={selectedOption === null || saving}
                className="w-full mt-6 h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? t.saving : t.next}
                {!saving && <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />}
              </Button>
            </motion.div>
          )}

          {screen === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ResultDisplay
                score={score}
                quizType={quizType}
                language={language}
                isRTL={isRTL}
              />

              <Button
                onClick={handleRestart}
                className="w-full mt-6 h-14 text-lg font-semibold bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg"
              >
                <RotateCcw className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t.restart}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
// --- END: Main App Component ---

