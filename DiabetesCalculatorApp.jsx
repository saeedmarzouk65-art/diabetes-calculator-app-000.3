<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حاسبة خطر الإصابة بالسكري</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Cairo:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            /* New artistic background gradient */
            background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
        }
        h1, h2 {
            font-family: 'Cairo', sans-serif;
        }
        /* Custom styles for the gauge */
        .gauge-container {
            width: 200px;
            height: 100px;
            position: relative;
            overflow: hidden;
        }
        .gauge-bg {
            width: 100%;
            height: 100%;
            border-radius: 100px 100px 0 0;
            background: linear-gradient(to right, #22c55e, #facc15, #ef4444);
            opacity: 0.8;
        }
        .gauge-cover {
            width: 160px;
            height: 80px;
            background: #ffffff; /* Match card background */
            border-radius: 80px 80px 0 0;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
        }
        .gauge-pointer {
            width: 3px;
            height: 90px;
            background: #333;
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform-origin: bottom center;
            transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth animation */
            transform: rotate(-90deg); /* Start at low risk */
            z-index: 10;
        }

        .tool-select-btn {
            /* Updated shadow and transition for a "lifting" effect */
            @apply shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl;
        }
        .option-button {
             /* New card-like aesthetic for options */
             @apply w-full text-start font-semibold p-4 bg-white border border-gray-200 text-gray-700 rounded-lg transition-all duration-200 ease-in-out hover:bg-cyan-50 hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-px;
        }
        .active-option {
            /* New active state with a gradient */
            @apply bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-700 ring-2 ring-cyan-500 text-white shadow-lg;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">

    <!-- App container with a new softer, colored shadow -->
    <div id="app-container" class="w-full max-w-md mx-auto bg-white shadow-xl shadow-cyan-100/50 rounded-3xl p-6 md:p-8 space-y-6 transition-all duration-500 border border-gray-100">
        
        <!-- Header -->
        <header class="flex justify-between items-center pb-4 border-b border-gray-100">
            <div class="w-1/4 text-left">
                <button id="back-btn" class="hidden relative px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200 transition-colors duration-200 group">
                    <span class="absolute inset-0 flex items-center justify-center text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">&larr;</span>
                    <span class="group-hover:opacity-0 transition-opacity duration-200" id="back-btn-text"></span>
                </button>
            </div>
            <div class="w-1/2 text-center">
                <!-- New header title color -->
                <h1 id="header-title" class="text-3xl font-extrabold text-cyan-700">حاسبة السكري</h1>
            </div>
            <div class="w-1/4 text-right">
                <button id="lang-switcher" class="px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">EN</button>
            </div>
        </header>

        <!-- Tool Selection Screen -->
        <div id="tool-selection-screen" class="text-center space-y-6 pt-4">
            <!-- New custom SVG icon -->
            <div class="text-cyan-500 w-20 h-20 mx-auto animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25H21L16.5 16.5l-3.75-3.75Z" />
                </svg>
            </div>
            <h2 id="tool-select-heading" class="text-2xl font-bold text-gray-800">اختر أداة التقييم</h2>
            <p id="tool-select-desc" class="text-gray-600 leading-relaxed">اختر أداة التقييم التي تفضل استخدامها لتقييم خطر الإصابة بالسكري.</p>
            <!-- New button gradients -->
            <div class="space-y-4">
                 <button data-tool="cdc" class="tool-select-btn w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    أداة CDC (عالمي)
                </button>
                <button data-tool="sadrisc" class="tool-select-btn w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    أداة SADRISC (النموذج السعودي)
                </button>
            </div>
            <p id="disclaimer" class="text-sm font-bold text-red-600 pt-4"></p>
        </div>


        <!-- Quiz Screen -->
        <div id="quiz-screen" class="hidden space-y-6 pt-4">
            
            <!-- Progress Bar with new gradient -->
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div id="progress-bar" class="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" style="width: 0%"></div>
            </div>
            
            <!-- Question -->
            <div id="question-container" class="space-y-5">
                <p id="question-text" class="text-xl font-bold text-gray-800 text-center leading-relaxed"></p>
                <div id="options-container" class="flex flex-col gap-3 pt-2">
                    <!-- Options will be dynamically inserted here -->
                </div>
                 <!-- BMI/Waist Input -->
                <div id="measurement-input-container" class="hidden flex flex-col items-center space-y-4 pt-4">
                    <!-- BMI Fields -->
                    <div id="bmi-fields" class="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <div class="flex flex-col items-center">
                            <label id="height-label" for="height-input" class="text-sm text-gray-600 mb-1">الطول (سم)</label>
                            <input type="number" id="height-input" class="w-32 text-center border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-2" placeholder="175">
                        </div>
                        <div class="flex flex-col items-center">
                            <label id="weight-label" for="weight-input" class="text-sm text-gray-600 mb-1">الوزن (كجم)</label>
                            <input type="number" id="weight-input" class="w-32 text-center border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-2" placeholder="80">
                        </div>
                    </div>
                    <!-- Waist Field -->
                    <div id="waist-field" class="hidden flex flex-col items-center w-full">
                        <label id="waist-label" for="waist-input" class="text-sm text-gray-600 mb-1">محيط الخصر (سم)</label>
                        <input type="number" id="waist-input" class="w-36 text-center border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-2" placeholder="95">
                    </div>
                    <p id="measurement-error-message" class="text-red-600 text-sm hidden"></p>
                    <button id="measurement-submit-btn" class="mt-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">تأكيد</button>
                </div>
            </div>
        </div>

        <!-- Result Screen -->
        <div id="result-screen" class="hidden text-center space-y-6 pt-4">
            
            <!-- Gauge -->
            <div class="flex justify-center mb-4">
                <div class="gauge-container">
                    <div class="gauge-bg"></div>
                    <div class="gauge-cover"></div>
                    <div id="gauge-pointer" class="gauge-pointer"></div>
                </div>
            </div>

            <h2 id="result-heading" class="text-3xl font-extrabold text-blue-900"></h2>
            <p id="result-desc" class="text-gray-700 leading-relaxed"></p>
            
            
            <!-- High Risk CTA -->
            <div id="high-risk-cta" class="hidden space-y-4 border-t border-gray-100 pt-6">
                <p id="cta-heading" class="font-bold text-xl text-blue-900">الخطوة التالية؟</p>
                <!-- New High Risk Card Style -->
                <div class="p-4 text-center bg-white border border-red-200 rounded-xl shadow-sm">
                    <p id="high-risk-message-recommendation" class="text-red-700 font-semibold leading-relaxed"></p>
                </div>
            </div>
             
            <!-- Low Risk Info -->
            <div id="low-risk-info" class="hidden space-y-4 border-t border-gray-100 pt-6 text-left">
                 <p id="info-heading" class="font-bold text-xl text-green-800 text-center">نصائح للحفاظ على صحتك</p>
                 <ul id="health-advice-list" class="space-y-4 text-base text-gray-700 list-none px-2">
                     <!-- Health advice will be dynamically inserted here -->
                 </ul>
            </div>

            <!-- New Restart Button Style -->
            <button id="restart-btn" class="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 mt-6">
                أعد الاختبار
            </button>
        </div>
        
        <footer class="text-center text-xs text-gray-500 pt-6 border-t border-gray-100 mt-6">
            <p id="ip-notice" class="mb-2 transition-opacity duration-300"></p>
            <p id="source-link" class="transition-opacity duration-300"></p>
        </footer>

    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            
            // --- DOM Elements ---
            const langSwitcher = document.getElementById('lang-switcher');
            const backBtn = document.getElementById('back-btn');
            const backBtnText = document.getElementById('back-btn-text');
            const toolSelectionScreen = document.getElementById('tool-selection-screen');
            const quizScreen = document.getElementById('quiz-screen');
            const resultScreen = document.getElementById('result-screen');
            const toolSelectBtns = document.querySelectorAll('.tool-select-btn');
            const restartBtn = document.getElementById('restart-btn');
            const progressBar = document.getElementById('progress-bar');
            const questionText = document.getElementById('question-text');
            const optionsContainer = document.getElementById('options-container');
            const measurementInputContainer = document.getElementById('measurement-input-container');
            const bmiFields = document.getElementById('bmi-fields');
            const waistField = document.getElementById('waist-field');
            const heightInput = document.getElementById('height-input');
            const weightInput = document.getElementById('weight-input');
            const waistInput = document.getElementById('waist-input');
            const measurementSubmitBtn = document.getElementById('measurement-submit-btn');
            const healthAdviceList = document.getElementById('health-advice-list');
            const measurementErrorMessage = document.getElementById('measurement-error-message');
            const ipNotice = document.getElementById('ip-notice');
            const sourceLink = document.getElementById('source-link');
            const highRiskMessageRecommendation = document.getElementById('high-risk-message-recommendation');

            // --- State Variables ---
            let currentLang = 'ar';
            let currentQuestionIndex = 0;
            let score = 0;
            let userGender = null;
            let currentTool = null;
            let history = []; // <-- Added for "Back" button functionality
            
            // --- Content ---
            const content = {
                ar: {
                    headerTitle: "حاسبة السكري",
                    langSwitch: "EN",
                    backBtnText: "رجوع",
                    toolSelectHeading: "اختر أداة التقييم",
                    toolSelectDesc: "اختر أداة التقييم التي تفضل استخدامها لتقييم خطر الإصابة بالسكري.",
                    cdcBtn: "أداة CDC (عالمي)",
                    sadriscBtn: "أداة SADRISC (النموذج السعودي)",
                    disclaimer: "إخلاء مسؤولية: هذه الأداة مخصصة للأغراض المعلوماتية فقط ولا تغني عن الاستشارة الطبية المتخصصة أو التشخيص أو العلاج.",
                    heightLabel: "الطول (سم)",
                    weightLabel: "الوزن (كجم)",
                    waistLabel: "محيط الخصر (سم)",
                    measurementSubmitBtn: "تأكيد",
                    bmiError: "الوزن أو الطول المدخل غير صالح",
                    waistError: "محيط الخصر المدخل غير صالح",
                    ctaHeading: "الخطوة التالية؟",
                    highRiskRecommendation: "نوصيك بزيارة أقرب مركز صحي أولي. سيقترح الطبيب فحص دم بسيط، مثل فحص السكر التراكمي (A1c) الذي يقيس متوسط السكر لآخر 3 أشهر، أو فحص سكر الدم الصيامي.",
                    infoHeading: "نصائح للحفاظ على صحتك",
                    healthAdvice: [
                        { icon: '🥗', title: 'الأكل الصحي:', text: 'ركّز على الخضروات والحبوب الكاملة. استبدل الرز الأبيض بالأسمر أو البرغل، واختر الخبز الأسمر.' },
                        { icon: '🚶‍♂️', title: 'النشاط البدني:', text: 'اجعل الحركة جزءاً من يومك، مثل المشي 30 دقيقة يومياً.' },
                        { icon: '⚖️', title: 'الحفاظ على وزن صحي:', text: 'الأكل المتوازن مع الحركة هو أفضل طريقة للحفاظ على وزن صحي.' },
                        { icon: '🩺', title: 'الفحص الدوري:', text: 'حتى مع الخطر المنخفض، من الجيد إجراء فحص دوري كل 1-3 سنوات للاطمئنان.' }
                    ],
                    restartBtn: "أعد الاختبار",
                    ipNotice: "فكرة وتطوير: حملة توعوية لفرز السكري من طلاب طب سنة خامس بجامعة أم القرى (سعيد الزهراني، سلطان اللقماني، حسين الشريف، خالد الصاعدي، سعود اللهيبي، وعبدالمجيد السلمي).",
                    cdc: {
                        resultLowHeading: "خطر منخفض",
                        resultLowDesc: "نتيجتك (أقل من 5 نقاط) تشير إلى مستوى خطر منخفض. استمر في الحفاظ على نمط حياتك الصحي.",
                        resultHighHeading: "فرصة للاطمئنان على صحتك",
                        resultHighDesc: "نتيجتك (5 نقاط أو أعلى) تشير لوجود بعض العوامل التي قد تزيد من احتمالية الإصابة. تحدث مع طبيبك.",
                        sourceLink: `هذه الحاسبة مبنية على <a href="https://www.cdc.gov/prediabetes/risktest/index.html" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">أداة تقييم مخاطر السكري من CDC</a>.`,
                        questions: [
                            { text: "ما هي فئتك العمرية؟", type: 'options', options: [{ text: "أقل من 40 سنة", points: 0 }, { text: "40-49 سنة", points: 1 }, { text: "50-59 سنة", points: 2 }, { text: "60 سنة أو أكبر", points: 3 }] },
                            { text: "ما هو جنسك؟", type: 'options', options: [{ text: "ذكر", points: 1, gender: 'male' }, { text: "أنثى", points: 0, gender: 'female' }] },
                            { text: "إذا كنتِ امرأة، هل تم تشخيصك بسكري الحمل من قبل؟", for: 'female', type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                            { text: "هل لديك تاريخ عائلي لمرض السكري (أم, أب, أخ, أخت)؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                            { text: "هل تم تشخيصك بارتفاع ضغط الدم من قبل؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                            { text: "هل أنت نشيط بدنياً؟", type: 'options', options: [{ text: "نعم", points: 0 }, { text: "لا", points: 1 }] },
                            { text: "ما هو طولك ووزنك؟", type: 'bmi' },
                        ]
                    },
                    sadrisc: {
                        resultLowHeading: "خطر منخفض",
                        resultLowDesc: "نتيجتك (أقل من 6 نقاط) تشير إلى مستوى خطر منخفض. استمر في الحفاظ على نمط حياتك الصحي.",
                        resultHighHeading: "خطر مرتفع للإصابة بالسكري",
                        resultHighDesc: "نتيجتك (6 نقاط أو أعلى) تشير إلى وجود خطر مرتفع للإصابة بالسكري خلال السنوات العشر القادمة. هذه فرصة جيدة للتحدث مع طبيبك.",
                        sourceLink: `مبني على <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7378422/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">النموذج السعودي لمخاطر السكري (SADRISC)</a>.`,
                        questions: [
                            { text: "ما هي فئتك العمرية؟", type: 'options', options: [{ text: "أقل من 45 سنة", points: 0 }, { text: "45-54 سنة", points: 2 }, { text: "55 سنة أو أكبر", points: 3 }] },
                             { text: "ما هو جنسك؟", type: 'options', options: [{ text: "ذكر", points: 1, gender: 'male' }, { text: "أنثى", points: 0, gender: 'female' }] },
                            { text: "هل لديك تاريخ عائلي لمرض السكري (أحد الوالدين أو الأشقاء)؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                            { text: "هل تم تشخيصك بارتفاع ضغط الدم أو تتناول أدوية له؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                            { text: "هل تدخن السجائر حالياً؟", type: 'options', options: [{ text: "نعم", points: 1 }, { text: "لا", points: 0 }] },
                            { text: "ما هو قياس محيط خصرك؟", type: 'waist' },
                        ]
                    }
                },
                en: {
                    headerTitle: "Diabetes Calculator",
                    langSwitch: "عربي",
                    backBtnText: "Back",
                    toolSelectHeading: "Choose Assessment Tool",
                    toolSelectDesc: "Select the assessment tool you'd like to use to assess your diabetes risk.",
                    cdcBtn: "CDC Tool (Global)",
                    sadriscBtn: "SADRISC Tool (Saudi Model)",
                    disclaimer: "Disclaimer: This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.",
                    heightLabel: "Height (cm)",
                    weightLabel: "Weight (kg)",
                    waistLabel: "Waist Circumference (cm)",
                    measurementSubmitBtn: "Confirm",
                    bmiError: "Invalid weight or height provided",
                    waistError: "Invalid waist circumference provided",
                    ctaHeading: "What's the Next Step?",
                    highRiskRecommendation: "We recommend visiting the nearest primary health facility. A doctor will suggest a simple blood test, like an A1c test or a fasting blood sugar test.",
                    infoHeading: "Tips to Stay Healthy",
                    healthAdvice: [
                         { icon: '🥗', title: 'Healthy Eating:', text: 'Focus on vegetables and whole grains. Choose whole-wheat bread.' },
                        { icon: '🚶‍♂️', title: 'Physical Activity:', text: 'Make movement a part of your day, like a 30-minute walk daily.' },
                        { icon: '⚖️', title: 'Maintain a Healthy Weight:', text: 'A balanced diet and activity are the best way to maintain a healthy weight.' },
                        { icon: '🩺', title: 'Regular Check-ups:', text: 'Even with low risk, getting a check-up every 1-3 years is a good practice.' }
                    ],
                    restartBtn: "Restart Test",
                    ipNotice: "Concept & Development by: A diabetic screening campaign from 5th-year medical students at Umm Al Qura University (Saeed Al-Zahrani, Sultan Al-Luqmani, Hussain Al-Sharif, Khalid Al-Saadi, Saud Al-Luhaibi, and Abdulmajeed Al-Salami).",
                    cdc: {
                        resultLowHeading: "Low Risk",
                        resultLowDesc: "Your score (less than 5) indicates a low risk. Keep up your healthy lifestyle.",
                        resultHighHeading: "An Opportunity to Check on Your Health",
                        resultHighDesc: "Your score (5 or higher) suggests some risk factors. This is a good opportunity to talk to your doctor.",
                        sourceLink: `This calculator is based on the <a href="https://www.cdc.gov/prediabetes/risktest/index.html" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">CDC risk assessment tool</a>.`,
                        questions: [
                            { text: "What is your age group?", type: 'options', options: [{ text: "Younger than 40", points: 0 }, { text: "40-49", points: 1 }, { text: "50-59", points: 2 }, { text: "60 or older", points: 3 }] },
                            { text: "What is your gender?", type: 'options', options: [{ text: "Male", points: 1, gender: 'male' }, { text: "Female", points: 0, gender: 'female' }] },
                            { text: "If you are a woman, have you ever been diagnosed with gestational diabetes?", for: 'female', type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                            { text: "Do you have a family history of diabetes (mother, father, sibling)?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", proofs: 0 }] },
                            { text: "Have you ever been diagnosed with high blood pressure?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                            { text: "Are you physically active?", type: 'options', options: [{ text: "Yes", points: 0 }, { text: "No", points: 1 }] },
                            { text: "What is your height and weight?", type: 'bmi' },
                        ]
                    },
                    sadrisc: {
                         resultLowHeading: "Low Risk",
                        resultLowDesc: "Your score (less than 6) indicates a low risk. Keep up your healthy lifestyle.",
                        resultHighHeading: "High Risk for Diabetes",
                        resultHighDesc: "Your score (6 or higher) indicates a high risk for developing diabetes in the next 10 years. This is a good opportunity to talk to your doctor.",
                        sourceLink: `Based on the <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7378422/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Saudi Diabetes Risk Score (SADRISC)</a>.`,
                        questions: [
                            { text: "What is your age group?", type: 'options', options: [{ text: "Younger than 45", points: 0 }, { text: "45-54", points: 2 }, { text: "55 or older", points: 3 }] },
                            { text: "What is your gender?", type: 'options', options: [{ text: "Male", points: 1, gender: 'male' }, { text: "Female", points: 0, gender: 'female' }] },
                            { text: "Do you have a family history of diabetes (parent or sibling)?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                            { text: "Have you been diagnosed with or take medication for high blood pressure?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                            { text: "Do you currently smoke cigarettes?", type: 'options', options: [{ text: "Yes", points: 1 }, { text: "No", points: 0 }] },
                            { text: "What is your waist circumference?", type: 'waist' },
                        ]
                    }
                }
            };
            
            // --- App Functions ---
            const updateUI = () => {
                const c = content[currentLang];
                document.documentElement.lang = currentLang;
                document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
                
                document.title = c.headerTitle;
                document.getElementById('header-title').innerText = c.headerTitle;
                langSwitcher.innerText = c.langSwitch;
                backBtnText.innerText = c.backBtnText;
                document.getElementById('tool-select-heading').innerText = c.toolSelectHeading;
                document.getElementById('tool-select-desc').innerText = c.toolSelectDesc;
                document.querySelector('[data-tool="cdc"]').innerText = c.cdcBtn;
                document.querySelector('[data-tool="sadrisc"]').innerText = c.sadriscBtn;
                document.getElementById('disclaimer').innerText = c.disclaimer;
                document.getElementById('height-label').innerText = c.heightLabel;
                document.getElementById('weight-label').innerText = c.weightLabel;
                 document.getElementById('waist-label').innerText = c.waistLabel;
                measurementSubmitBtn.innerText = c.measurementSubmitBtn;
                document.getElementById('cta-heading').innerText = c.ctaHeading;
                document.getElementById('info-heading').innerText = c.infoHeading;
                restartBtn.innerText = c.restartBtn;
                ipNotice.innerHTML = c.ipNotice;
            };

            const showQuestion = (isGoingBack = false) => {
                // --- Back Button Logic ---
                if (!isGoingBack) {
                    // Save current state FOR "Back" button
                    history.push({
                        questionIndex: currentQuestionIndex,
                        score: score,
                        userGender: userGender
                    });
                }
                // --- End Back Button Logic ---

                optionsContainer.innerHTML = '';
                measurementInputContainer.classList.add('hidden');
                optionsContainer.classList.remove('hidden');

                const questions = content[currentLang][currentTool].questions;
                let availableQuestions = questions;
                if (userGender === 'male') {
                    availableQuestions = questions.filter(q => q.for !== 'female');
                }

                if (currentQuestionIndex >= availableQuestions.length) {
                    showResult();
                    return;
                }

                const question = availableQuestions[currentQuestionIndex];
                
                const progress = (currentQuestionIndex / availableQuestions.length) * 100;
                progressBar.style.width = `${progress}%`;
                
                questionText.innerText = question.text;

                if (question.type === 'options') {
                    question.options.forEach(option => {
                        const button = document.createElement('button');
                        button.className = "option-button";
                        button.innerText = option.text;
                        button.onclick = () => handleOptionClick(button, option);
                        optionsContainer.appendChild(button);
                    });
                } else {
                    optionsContainer.classList.add('hidden');
                    measurementInputContainer.classList.remove('hidden');
                    measurementErrorMessage.classList.add('hidden');
                    
                    if (question.type === 'bmi') {
                        bmiFields.classList.remove('hidden');
                        waistField.classList.add('hidden');
                        heightInput.value = '';
                        weightInput.value = '';
                    } else if (question.type === 'waist') {
                        bmiFields.classList.add('hidden');
                        waistField.classList.remove('hidden');
                        waistInput.value = '';
                    }
                }
            };

            const handleOptionClick = (clickedButton, option) => {
                document.querySelectorAll('.option-button').forEach(btn => {
                    btn.disabled = true;
                    if (btn !== clickedButton) {
                        btn.classList.add('opacity-50');
                    }
                });
                clickedButton.classList.add('active-option');

                score += option.points;
                if (option.gender) {
                    userGender = option.gender;
                }
                currentQuestionIndex++;
                setTimeout(showQuestion, 400);
            };

            const handleMeasurementSubmit = () => {
                let availableQuestions = content[currentLang][currentTool].questions;
                if (userGender === 'male') {
                    availableQuestions = availableQuestions.filter(q => q.for !== 'female');
                }
                const questionType = availableQuestions[currentQuestionIndex].type;
                
                let pointsAdded = 0; // --- Back Button Logic ---

                if (questionType === 'bmi') {
                    const height = parseFloat(heightInput.value);
                    const weight = parseFloat(weightInput.value);
                    if (isNaN(height) || isNaN(weight) || height <= 50 || weight <= 20) {
                        measurementErrorMessage.innerText = content[currentLang].bmiError;
                        measurementErrorMessage.classList.remove('hidden');
                        return;
                    }
                    const bmi = weight / ((height / 100) ** 2);
                    if (bmi >= 30) pointsAdded = 3;
                    else if (bmi >= 25) pointsAdded = 1;
                } else if (questionType === 'waist') {
                    const waist = parseFloat(waistInput.value);
                     if (isNaN(waist) || waist < 50 || waist > 250) {
                        measurementErrorMessage.innerText = content[currentLang].waistError;
                        measurementErrorMessage.classList.remove('hidden');
                        return;
                    }
                    if (userGender === 'male' && waist >= 102) {
                        pointsAdded = 2;
                    } else if (userGender === 'female' && waist >= 88) {
                        pointsAdded = 2;
                    }
                }
                
                score += pointsAdded; // --- Back Button Logic (apply score) ---
                measurementErrorMessage.classList.add('hidden');
                currentQuestionIndex++;
                showQuestion();
            };

            const showResult = () => {
                quizScreen.classList.add('hidden');
                resultScreen.classList.remove('hidden');

                const c = content[currentLang];
                const toolContent = c[currentTool];
                
                const resultHeading = document.getElementById('result-heading');
                const resultDesc = document.getElementById('result-desc');
                const highRiskCta = document.getElementById('high-risk-cta');
                const lowRiskInfo = document.getElementById('low-risk-info');
                
                const gaugePointer = document.getElementById('gauge-pointer');

                backBtn.classList.add('hidden');
                highRiskCta.classList.add('hidden');
                lowRiskInfo.classList.add('hidden');
                
                const riskThreshold = currentTool === 'cdc' ? 5 : 6;
                const maxScore = currentTool === 'cdc' ? 11 : 10;
                const angle = ((Math.min(score, maxScore) / maxScore) * 180) - 90;
                gaugePointer.style.transform = `rotate(${angle}deg)`;

                let riskLevel = "Low"; // Default risk level

                if (score >= riskThreshold) {
                    riskLevel = "High"; // Set risk level
                    resultHeading.innerText = toolContent.resultHighHeading;
                    resultDesc.innerText = toolContent.resultHighDesc;
                    resultHeading.className = "text-3xl font-extrabold text-red-600";
                    highRiskMessageRecommendation.innerHTML = c.highRiskRecommendation;
                    highRiskCta.classList.remove('hidden');
                } else {
                    riskLevel = "Low"; // Set risk level
                    resultHeading.innerText = toolContent.resultLowHeading;
                    resultDesc.innerText = toolContent.resultLowDesc;
                    resultHeading.className = "text-3xl font-extrabold text-green-600";
                    
                    healthAdviceList.innerHTML = '';
                    c.healthAdvice.forEach(advice => {
                        const li = document.createElement('li');
                        // New advice card style
                        li.className = 'flex items-start gap-3 bg-white border border-green-200 p-3 rounded-lg shadow-sm';
                        li.innerHTML = `<span class="text-xl text-green-600">${advice.icon}</span><div><p class="font-semibold text-green-800">${advice.title}</p> <p class="text-gray-700">${advice.text}</p></div>`;
                        healthAdviceList.appendChild(li);
                    });
                    
                    lowRiskInfo.classList.remove('hidden');
                }
            };
            
            const startQuiz = (tool) => {
                currentTool = tool;
                history = []; // --- Back Button Logic: Clear history ---
                sourceLink.innerHTML = content[currentLang][currentTool].sourceLink;
                langSwitcher.classList.add('hidden');
                backBtn.classList.remove('hidden');
                toolSelectionScreen.classList.add('hidden');
                quizScreen.classList.remove('hidden');
                ipNotice.classList.add('hidden');
                sourceLink.classList.remove('hidden');
                showQuestion();
            };

            const resetApp = () => {
                currentQuestionIndex = 0;
                score = 0;
                userGender = null;
                currentTool = null;
                history = []; // --- Back Button Logic: Clear history ---
                
                langSwitcher.classList.remove('hidden');
                backBtn.classList.add('hidden');
                quizScreen.classList.add('hidden');
                resultScreen.classList.add('hidden');
                toolSelectionScreen.classList.remove('hidden');
                progressBar.style.width = '0%';
                document.getElementById('gauge-pointer').style.transform = 'rotate(-90deg)';
                sourceLink.innerHTML = '';
                ipNotice.classList.remove('hidden');
                sourceLink.classList.add('hidden');
            };

            // --- Event Listeners ---
            toolSelectBtns.forEach(btn => {
                btn.addEventListener('click', () => startQuiz(btn.dataset.tool));
            });
            
            // --- Back Button Logic: Updated Listener ---
            backBtn.addEventListener('click', () => {
                if (history.length <= 1) {
                    // On the first question, so reset the app
                    resetApp();
                    return;
                }

                // Pop the current state (the question we're leaving)
                history.pop();
                // Get the previous state (the question we're going back to)
                const prevState = history.pop();

                if (prevState) {
                    currentQuestionIndex = prevState.questionIndex;
                    score = prevState.score;
                    userGender = prevState.userGender;
                    
                    // Re-render the previous question, passing true to skip pushing to history
                    showQuestion(true); 
                }
            });
            
            restartBtn.addEventListener('click', resetApp);

            measurementSubmitBtn.addEventListener('click', handleMeasurementSubmit);

            langSwitcher.addEventListener('click', () => {
                currentLang = currentLang === 'ar' ? 'en' : 'ar';
                updateUI();
                resetApp();
            });

            // Initial UI setup
            updateUI();
        });
    </script>
</body>
</html>

