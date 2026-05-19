// VisionCheck — نظر کا معائنہ
// All app strings in English and Urdu
// Usage: strings[language].key

export const strings = {

  en: {
    // App identity
    app_name: 'VisionCheck',
    app_tagline: 'Your personal vision screening tool',
    app_urdu_label: 'نظر کا معائنہ',

    // Language select screen
    lang_select_prompt: 'Choose your language',
    lang_english: 'English',
    lang_urdu: 'اردو',

    // Disclaimer screen
    disclaimer_title: 'Important Notice',
    disclaimer_body:
      'VisionCheck is a self-screening tool designed to help you notice potential vision changes before consulting an eye care professional.\n\n' +
      'It is NOT a medical device and does NOT provide a medical diagnosis.\n\n' +
      'Results are for personal awareness only and do not replace a professional eye examination by a qualified ophthalmologist or optometrist.\n\n' +
      'If you experience sudden vision loss, severe eye pain, or flashes of light — do not use this app. Seek emergency medical attention immediately.\n\n' +
      'By continuing you confirm that you have read and understood this notice.',
    disclaimer_scroll_prompt: 'Please scroll down to read the full notice',
    disclaimer_agree: 'I Understand — Continue',

    // Age band screen
    age_band_title: 'Before we begin',
    age_band_subtitle: 'Your age helps us give you more accurate results',
    age_band_prompt: 'Select your age group',
    age_band_child: 'Under 13',
    age_band_young: '13 – 40 years',
    age_band_middle: '40 – 60 years',
    age_band_senior: 'Over 60 years',
    age_band_child_note:
      'This app is designed for adults. For children\'s vision, please visit a paediatric eye specialist.',
    age_band_confirm: 'Continue',

    // Home dashboard
    home_greeting: 'Welcome',
    home_subtitle: 'What would you like to do today?',
    home_start_complaint: 'I have a specific complaint',
    home_start_complaint_sub: 'Tell us your symptom — we recommend the right tests',
    home_start_full: 'Full eye check',
    home_start_full_sub: 'Run all 6 tests in sequence',
    home_history: 'My past results',
    home_history_sub: 'View previous assessments',
    home_settings: 'Settings',
    home_guest_banner: 'Guest mode — results saved on this device only',

    // Symptom selector
    symptom_title: 'What is bothering you?',
    symptom_subtitle: 'Select all that apply',
    symptom_far: 'I cannot see things far away',
    symptom_near: 'I cannot read close up',
    symptom_blurry: 'Everything looks blurry',
    symptom_wavy: 'Lines look wavy or bent',
    symptom_colours: 'Colours look washed out',
    symptom_colour_diff: 'I cannot tell colours apart',
    symptom_tired: 'My eyes tire quickly when reading',
    symptom_one_eye: 'One eye feels different from the other',
    symptom_confirm: 'Show recommended tests',
    symptom_none: 'Please select at least one symptom',

    // Recommended tests screen
    recommended_title: 'Recommended tests for you',
    recommended_subtitle: 'Based on your symptoms',
    recommended_start: 'Begin tests',
    recommended_run_all: 'Run all 6 tests instead',

    // Pre-test setup
    setup_title: 'Before each test',
    setup_1: 'Remove glasses or contact lenses',
    setup_1_sub: 'Test your natural unaided vision',
    setup_2: 'Set screen brightness to maximum',
    setup_2_sub: 'Full brightness gives accurate results',
    setup_3: 'Find a well-lit room',
    setup_3_sub: 'No glare or reflections on screen',
    setup_4: 'Cover one eye with your palm',
    setup_4_sub: 'Do not press on the eye',
    setup_ready: 'I am ready — Start tests',

    // Test labels
    test_distance_name: 'Distance Vision',
    test_distance_checks: 'Checks for short-sightedness (myopia)',
    test_near_name: 'Near Vision',
    test_near_checks: 'Checks for long-sightedness and reading difficulty',
    test_astig_name: 'Astigmatism Check',
    test_astig_checks: 'Checks if your eye lens has uneven curvature',
    test_contrast_name: 'Contrast Sensitivity',
    test_contrast_checks: 'Checks ability to see in low contrast conditions',
    test_amsler_name: 'Amsler Grid',
    test_amsler_checks: 'Checks central vision and macular health',
    test_color_name: 'Colour Vision',
    test_color_checks: 'Checks for colour blindness',

    // Test instructions
    instr_arm_length: 'Hold your phone at arm\'s length — about 40 cm away',
    instr_reading_dist: 'Hold your phone at normal reading distance — about 30 cm',
    instr_cover_left: 'Cover your LEFT eye with your palm',
    instr_cover_right: 'Cover your RIGHT eye with your palm',
    instr_both_eyes: 'Keep BOTH eyes open',
    instr_stare_centre: 'Keep your gaze fixed on the centre dot — do not let your eye wander',
    instr_brightness: 'Make sure screen brightness is at maximum',

    // Distance / Near test responses
    resp_all_clear: 'All lines — very clear',
    resp_most_clear: 'Most lines clear',
    resp_some_clear: 'Only large lines clear',
    resp_blurry: 'Everything blurry',

    // Astigmatism responses
    astig_all_equal: 'All lines look equally dark and sharp',
    astig_some_darker: 'Some lines look darker than others',
    astig_some_blurry: 'Some lines look blurrier than others',
    astig_unsure: 'I am not sure',

    // Amsler responses
    amsler_all_straight: 'All lines are straight and complete',
    amsler_wavy: 'Some lines appear wavy or bent',
    amsler_missing: 'Some areas appear blank or missing',
    amsler_distorted: 'Lines appear uneven or distorted',

    // Colour responses
    color_q: 'What number do you see in the circle?',
    color_nothing: 'I see no number',
    color_unsure: 'I am not sure',

    // Alert levels
    alert_green_title: 'No concerns found',
    alert_green_body: 'Your vision appears normal in this test. A routine check every 2 years is still recommended.',
    alert_yellow_title: 'Mild concern noticed',
    alert_yellow_body: 'Some signs were noted. We recommend booking an appointment with an eye doctor within the next few weeks.',
    alert_red_title: 'Please see a doctor',
    alert_red_body: 'Your results suggest a vision problem that needs professional attention. Please visit an ophthalmologist or optometrist this week.',
    alert_urgent_title: 'See a doctor urgently',
    alert_urgent_body: 'Your Amsler grid result suggests a possible problem with your central vision. Please see an eye doctor within 24 to 48 hours. Do not delay.',

    // Results screen
    results_title: 'Your Results',
    results_subtitle: 'Assessment completed',
    results_each_test: 'Results by test',
    results_right_eye: 'Right eye',
    results_left_eye: 'Left eye',
    results_both_eyes: 'Both eyes',
    results_what_next: 'What to do next',
    results_download: 'Download Results (PDF)',
    results_share: 'Share via WhatsApp',
    results_retake: 'Take tests again',
    results_history: 'View history',

    // History screen
    history_title: 'Past Assessments',
    history_empty: 'No past assessments found',
    history_empty_sub: 'Complete your first assessment to see results here',
    history_date: 'Date',
    history_overall: 'Overall result',
    history_view: 'View details',

    // Settings screen
    settings_title: 'Settings',
    settings_language: 'Language',
    settings_age_band: 'Age group',
    settings_disclaimer: 'View disclaimer',
    settings_clear_history: 'Clear all history',
    settings_clear_confirm: 'Are you sure? This cannot be undone.',
    settings_version: 'Version',

    // Common buttons
    btn_next: 'Next',
    btn_back: 'Back',
    btn_skip: 'Skip this test',
    btn_continue: 'Continue',
    btn_done: 'Done',
    btn_cancel: 'Cancel',
    btn_yes: 'Yes',
    btn_no: 'No',

    // Misc
    right_eye: 'Right Eye',
    left_eye: 'Left Eye',
    both_eyes: 'Both Eyes',
    of: 'of',
    test: 'Test',
    loading: 'Loading...',
  },

  ur: {
    // App identity
    app_name: 'VisionCheck',
    app_tagline: 'آپ کا ذاتی نظر جانچنے کا آلہ',
    app_urdu_label: 'نظر کا معائنہ',

    // Language select screen
    lang_select_prompt: 'اپنی زبان منتخب کریں',
    lang_english: 'English',
    lang_urdu: 'اردو',

    // Disclaimer screen
    disclaimer_title: 'اہم اعلان',
    disclaimer_body:
      'VisionCheck ایک خود معائنہ کا آلہ ہے جو آپ کو کسی ماہرِ امراضِ چشم سے ملنے سے پہلے اپنی بینائی میں ممکنہ تبدیلیوں کو جاننے میں مدد دیتا ہے۔\n\n' +
      'یہ کوئی طبی آلہ نہیں ہے اور نہ ہی یہ کوئی طبی تشخیص فراہم کرتا ہے۔\n\n' +
      'اس ایپ کے نتائج صرف ذاتی آگاہی کے لیے ہیں اور یہ کسی مستند ماہرِ امراضِ چشم کے پیشہ ورانہ معائنے کا متبادل نہیں ہیں۔\n\n' +
      'اگر آپ کو اچانک بینائی میں کمی، آنکھ میں شدید درد، یا روشنی کی چمک محسوس ہو تو یہ ایپ استعمال نہ کریں — فوری طبی امداد حاصل کریں۔\n\n' +
      'آگے بڑھ کر آپ تصدیق کرتے ہیں کہ آپ نے یہ اعلان پڑھ اور سمجھ لیا ہے۔',
    disclaimer_scroll_prompt: 'مکمل اعلان پڑھنے کے لیے نیچے سکرول کریں',
    disclaimer_agree: 'میں سمجھ گیا — آگے بڑھیں',

    // Age band screen
    age_band_title: 'شروع کرنے سے پہلے',
    age_band_subtitle: 'آپ کی عمر درست نتائج دینے میں مدد کرتی ہے',
    age_band_prompt: 'اپنی عمر کا گروپ منتخب کریں',
    age_band_child: '۱۳ سال سے کم',
    age_band_young: '۱۳ سے ۴۰ سال',
    age_band_middle: '۴۰ سے ۶۰ سال',
    age_band_senior: '۶۰ سال سے زیادہ',
    age_band_child_note:
      'یہ ایپ بڑوں کے لیے بنائی گئی ہے۔ بچوں کی بینائی کے لیے براہ کرم بچوں کے آنکھوں کے ماہر سے ملیں۔',
    age_band_confirm: 'آگے بڑھیں',

    // Home dashboard
    home_greeting: 'خوش آمدید',
    home_subtitle: 'آج آپ کیا کرنا چاہتے ہیں؟',
    home_start_complaint: 'مجھے ایک خاص شکایت ہے',
    home_start_complaint_sub: 'اپنی تکلیف بتائیں — ہم صحیح ٹیسٹ تجویز کریں گے',
    home_start_full: 'مکمل آنکھوں کا معائنہ',
    home_start_full_sub: 'تمام ۶ ٹیسٹ ترتیب سے چلائیں',
    home_history: 'میرے پچھلے نتائج',
    home_history_sub: 'پچھلے معائنے دیکھیں',
    home_settings: 'ترتیبات',
    home_guest_banner: 'مہمان موڈ — نتائج صرف اس فون پر محفوظ ہیں',

    // Symptom selector
    symptom_title: 'آپ کو کیا تکلیف ہے؟',
    symptom_subtitle: 'جو بھی لاگو ہو منتخب کریں',
    symptom_far: 'دور کی چیزیں نہیں دکھتیں',
    symptom_near: 'قریب کا پڑھنا مشکل ہے',
    symptom_blurry: 'سب کچھ دھندلا لگتا ہے',
    symptom_wavy: 'لکیریں ٹیڑھی یا موڑدار لگتی ہیں',
    symptom_colours: 'رنگ پھیکے لگتے ہیں',
    symptom_colour_diff: 'رنگوں میں فرق نہیں پتہ چلتا',
    symptom_tired: 'پڑھتے وقت آنکھیں جلدی تھک جاتی ہیں',
    symptom_one_eye: 'ایک آنکھ دوسری سے مختلف محسوس ہوتی ہے',
    symptom_confirm: 'تجویز کردہ ٹیسٹ دکھائیں',
    symptom_none: 'براہ کرم کم از کم ایک علامت منتخب کریں',

    // Recommended tests screen
    recommended_title: 'آپ کے لیے تجویز کردہ ٹیسٹ',
    recommended_subtitle: 'آپ کی علامات کی بنیاد پر',
    recommended_start: 'ٹیسٹ شروع کریں',
    recommended_run_all: 'اس کے بجائے تمام ۶ ٹیسٹ چلائیں',

    // Pre-test setup
    setup_title: 'ہر ٹیسٹ سے پہلے',
    setup_1: 'عینک یا کانٹیکٹ لینز اتار دیں',
    setup_1_sub: 'اپنی قدرتی بینائی جانچیں',
    setup_2: 'اسکرین کی روشنی زیادہ سے زیادہ کریں',
    setup_2_sub: 'پوری روشنی سے درست نتائج ملتے ہیں',
    setup_3: 'روشن کمرے میں بیٹھیں',
    setup_3_sub: 'اسکرین پر چمک یا عکس نہ ہو',
    setup_4: 'ایک آنکھ ہتھیلی سے ڈھانپیں',
    setup_4_sub: 'آنکھ پر دباؤ نہ ڈالیں',
    setup_ready: 'میں تیار ہوں — ٹیسٹ شروع کریں',

    // Test labels
    test_distance_name: 'دور کے نظر کا ٹیسٹ',
    test_distance_checks: 'دور کی نظر کمزوری (myopia) جانچتا ہے',
    test_near_name: 'قریب کے نظر کا ٹیسٹ',
    test_near_checks: 'قریب کی نظر کمزوری اور پڑھنے میں دشواری جانچتا ہے',
    test_astig_name: 'لکیروں کا ٹیسٹ',
    test_astig_checks: 'آنکھ کے عدسے کی بے قاعدہ شکل جانچتا ہے',
    test_contrast_name: 'دھندلا پن کا ٹیسٹ',
    test_contrast_checks: 'کم روشنی میں دیکھنے کی صلاحیت جانچتا ہے',
    test_amsler_name: 'جالی کا ٹیسٹ',
    test_amsler_checks: 'آنکھ کے مرکز کی صحت جانچتا ہے',
    test_color_name: 'رنگوں کا ٹیسٹ',
    test_color_checks: 'رنگوں کی پہچان کی صلاحیت جانچتا ہے',

    // Test instructions
    instr_arm_length: 'فون کو بازو کی لمبائی پر رکھیں — تقریباً ۴۰ سینٹی میٹر',
    instr_reading_dist: 'فون کو عام پڑھنے کی دوری پر رکھیں — تقریباً ۳۰ سینٹی میٹر',
    instr_cover_left: 'بائیں آنکھ کو ہتھیلی سے ڈھانپیں',
    instr_cover_right: 'دائیں آنکھ کو ہتھیلی سے ڈھانپیں',
    instr_both_eyes: 'دونوں آنکھیں کھلی رکھیں',
    instr_stare_centre: 'اپنی نظر درمیان کے نقطے پر مرکوز رکھیں — ادھر ادھر نہ دیکھیں',
    instr_brightness: 'یقینی بنائیں کہ اسکرین کی روشنی زیادہ سے زیادہ ہو',

    // Responses
    resp_all_clear: 'تمام لکیریں — بالکل صاف',
    resp_most_clear: 'زیادہ تر لکیریں صاف',
    resp_some_clear: 'صرف بڑی لکیریں صاف',
    resp_blurry: 'سب کچھ دھندلا',

    astig_all_equal: 'تمام لکیریں یکساں گہری اور صاف ہیں',
    astig_some_darker: 'کچھ لکیریں زیادہ گہری لگتی ہیں',
    astig_some_blurry: 'کچھ لکیریں دھندلی لگتی ہیں',
    astig_unsure: 'مجھے یقین نہیں',

    amsler_all_straight: 'تمام لکیریں سیدھی اور مکمل ہیں',
    amsler_wavy: 'کچھ لکیریں ٹیڑھی یا لہردار لگتی ہیں',
    amsler_missing: 'کچھ جگہیں خالی یا غائب لگتی ہیں',
    amsler_distorted: 'لکیریں بے قاعدہ یا مسخ شدہ لگتی ہیں',

    color_q: 'آپ کو دائرے میں کون سا نمبر نظر آتا ہے؟',
    color_nothing: 'مجھے کوئی نمبر نظر نہیں آتا',
    color_unsure: 'مجھے یقین نہیں',

    // Alert levels
    alert_green_title: 'کوئی تشویش نہیں',
    alert_green_body: 'اس ٹیسٹ میں آپ کی نظر معمول کے مطابق لگتی ہے۔ پھر بھی ہر ۲ سال میں معائنہ کروانے کا مشورہ ہے۔',
    alert_yellow_title: 'معمولی تشویش نظر آئی',
    alert_yellow_body: 'کچھ علامات نوٹ کی گئی ہیں۔ ہم تجویز کرتے ہیں کہ اگلے چند ہفتوں میں آنکھوں کے ڈاکٹر سے ملاقات کریں۔',
    alert_red_title: 'ڈاکٹر سے ملیں',
    alert_red_body: 'آپ کے نتائج سے لگتا ہے کہ نظر میں کوئی مسئلہ ہے جس کے لیے پیشہ ورانہ توجہ درکار ہے۔ براہ کرم اس ہفتے ماہرِ امراضِ چشم سے ملیں۔',
    alert_urgent_title: 'فوری ڈاکٹر سے ملیں',
    alert_urgent_body: 'جالی کے ٹیسٹ کے نتائج سے لگتا ہے کہ آپ کی مرکزی بینائی میں مسئلہ ہو سکتا ہے۔ براہ کرم ۲۴ سے ۴۸ گھنٹوں میں آنکھوں کے ڈاکٹر سے ملیں۔ دیر نہ کریں۔',

    // Results screen
    results_title: 'آپ کے نتائج',
    results_subtitle: 'معائنہ مکمل ہوا',
    results_each_test: 'ہر ٹیسٹ کے نتائج',
    results_right_eye: 'دائیں آنکھ',
    results_left_eye: 'بائیں آنکھ',
    results_both_eyes: 'دونوں آنکھیں',
    results_what_next: 'آگے کیا کریں',
    results_download: 'نتائج ڈاؤن لوڈ کریں (PDF)',
    results_share: 'واٹس ایپ پر شیئر کریں',
    results_retake: 'دوبارہ ٹیسٹ دیں',
    results_history: 'پرانے نتائج دیکھیں',

    // History screen
    history_title: 'پچھلے معائنے',
    history_empty: 'کوئی پچھلا معائنہ نہیں ملا',
    history_empty_sub: 'پہلا معائنہ مکمل کریں تو نتائج یہاں دکھائی دیں گے',
    history_date: 'تاریخ',
    history_overall: 'مجموعی نتیجہ',
    history_view: 'تفصیل دیکھیں',

    // Settings
    settings_title: 'ترتیبات',
    settings_language: 'زبان',
    settings_age_band: 'عمر کا گروپ',
    settings_disclaimer: 'اعلان پڑھیں',
    settings_clear_history: 'تمام تاریخ مٹائیں',
    settings_clear_confirm: 'کیا آپ کو یقین ہے؟ یہ واپس نہیں ہو سکتا۔',
    settings_version: 'ورژن',

    // Common buttons
    btn_next: 'آگے',
    btn_back: 'پیچھے',
    btn_skip: 'یہ ٹیسٹ چھوڑیں',
    btn_continue: 'جاری رکھیں',
    btn_done: 'ہو گیا',
    btn_cancel: 'منسوخ',
    btn_yes: 'ہاں',
    btn_no: 'نہیں',

    // Misc
    right_eye: 'دائیں آنکھ',
    left_eye: 'بائیں آنکھ',
    both_eyes: 'دونوں آنکھیں',
    of: 'میں سے',
    test: 'ٹیسٹ',
    loading: 'لوڈ ہو رہا ہے...',
  },
};

// Audio prompt helper — returns string for expo-speech
export const getAudioPrompt = (language, key) => {
  return strings[language]?.[key] ?? strings['en'][key] ?? '';
};
