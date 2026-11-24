// VisionCheck — Eye health risk check
// app/engine/riskLogic.js
//
// Turns a short questionnaire into a suggested time between eye exams and the
// reasons. Intervals follow commonly used adult guidance (age-based schedule,
// shorter for diabetes, a family history of glaucoma, very high myopia,
// long-term steroid use and past eye injury). It is general guidance, not a
// diagnosis, and a doctor's own advice always comes first.

// answers: {
//   age:      'under40' | '40to54' | '55to64' | '65plus'
//   diabetes: 'no' | 'type1' | 'type2' | 'unsure'
//   bp:       'yes' | 'no'
//   glaucomaFamily: 'yes' | 'no' | 'unsure'
//   highMyopia:     'yes' | 'no'
//   steroids:       'yes' | 'no'
//   injury:         'yes' | 'no'
//   smoker:         'yes' | 'no'
//   lastExam: 'never' | 'under1' | '1to2' | 'over2'
// }

const AGE_MONTHS = { under40: 36, '40to54': 36, '55to64': 24, '65plus': 12 };

const AGE_REASON = {
  under40:  { en: 'Adults under 40 with no risk factors can have an exam every 3 to 5 years.',  ur: '۴۰ سال سے کم عمر بالغ، جن میں کوئی خطرہ نہ ہو، ۳ سے ۵ سال میں ایک بار معائنہ کروائیں۔' },
  '40to54': { en: 'From 40, eye diseases such as glaucoma become more common: exam every 2 to 4 years.', ur: '۴۰ سال کے بعد گلوکوما جیسی بیماریاں بڑھ جاتی ہیں: ہر ۲ سے ۴ سال میں معائنہ کروائیں۔' },
  '55to64': { en: 'At 55 to 64, an exam every 1 to 3 years is advised.',                        ur: '۵۵ سے ۶۴ سال میں ہر ۱ سے ۳ سال میں معائنہ مناسب ہے۔' },
  '65plus': { en: 'From 65, an exam every 1 to 2 years is advised.',                            ur: '۶۵ سال کے بعد ہر ۱ سے ۲ سال میں معائنہ مناسب ہے۔' },
};

const RULES = [
  {
    when: (a) => a.diabetes === 'type1' || a.diabetes === 'type2',
    months: 12,
    en: 'Diabetes can silently damage the retina: have a dilated eye exam every year.',
    ur: 'ذیابیطس آنکھ کے پردے کو خاموشی سے نقصان پہنچا سکتی ہے: ہر سال پتلی پھیلا کر معائنہ کروائیں۔',
  },
  {
    when: (a) => a.diabetes === 'unsure',
    months: 12,
    en: 'You are not sure about diabetes: ask your doctor for a blood sugar test, and see an eye doctor yearly until you know.',
    ur: 'آپ کو ذیابیطس کا یقین نہیں: ڈاکٹر سے شوگر ٹیسٹ کروائیں، اور پتا چلنے تک ہر سال آنکھوں کا معائنہ کروائیں۔',
  },
  {
    when: (a) => a.glaucomaFamily === 'yes' && a.age !== 'under40',
    months: 18,
    en: 'A parent or sibling with glaucoma raises your risk: exam every 1 to 2 years.',
    ur: 'والدین یا بہن بھائی کو گلوکوما ہو تو آپ کا خطرہ بڑھتا ہے: ہر ۱ سے ۲ سال میں معائنہ۔',
  },
  {
    when: (a) => a.glaucomaFamily === 'yes' && a.age === 'under40',
    months: 24,
    en: 'A family history of glaucoma: have a baseline exam now and then every 2 years.',
    ur: 'خاندان میں گلوکوما ہو تو ابھی معائنہ کروائیں اور پھر ہر ۲ سال بعد۔',
  },
  {
    when: (a) => a.highMyopia === 'yes',
    months: 12,
    en: 'Very strong short-sight raises the risk of retinal problems: exam every year.',
    ur: 'بہت زیادہ دور کی نظر کی کمزوری سے پردے کے مسائل کا خطرہ بڑھتا ہے: ہر سال معائنہ۔',
  },
  {
    when: (a) => a.steroids === 'yes',
    months: 12,
    en: 'Long-term steroids can cause glaucoma and cataract: exam every year.',
    ur: 'طویل مدتی سٹیرائیڈ سے گلوکوما اور موتیا ہو سکتا ہے: ہر سال معائنہ۔',
  },
  {
    when: (a) => a.injury === 'yes',
    months: 12,
    en: 'A past eye injury or eye surgery: keep a yearly check unless your surgeon advised otherwise.',
    ur: 'آنکھ کی پرانی چوٹ یا سرجری: سرجن کے مشورے کے علاوہ ہر سال معائنہ۔',
  },
  {
    when: (a) => a.bp === 'yes',
    months: 24,
    en: 'High blood pressure can affect the retina: exam at least every 1 to 2 years.',
    ur: 'ہائی بلڈ پریشر آنکھ کے پردے کو متاثر کر سکتا ہے: کم از کم ہر ۱ سے ۲ سال میں معائنہ۔',
  },
];

const NOTES = [
  {
    when: (a) => a.smoker === 'yes',
    en: 'Smoking raises the risk of cataract and macular degeneration. Quitting helps your eyes too.',
    ur: 'سگریٹ نوشی سے موتیا اور میکولر ڈی جنریشن کا خطرہ بڑھتا ہے۔ چھوڑنے سے آنکھوں کو بھی فائدہ ہوتا ہے۔',
  },
];

const INTERVAL_LABEL = {
  12: { en: 'every year',          ur: 'ہر سال' },
  18: { en: 'every 1 to 2 years',  ur: 'ہر ۱ سے ۲ سال' },
  24: { en: 'every 2 years',       ur: 'ہر ۲ سال' },
  36: { en: 'every 3 years',       ur: 'ہر ۳ سال' },
};

export const computeRisk = (answers) => {
  const reasons = [];
  let months = AGE_MONTHS[answers.age] || 36;
  reasons.push(AGE_REASON[answers.age] || AGE_REASON.under40);

  RULES.forEach((rule) => {
    if (rule.when(answers)) {
      months = Math.min(months, rule.months);
      reasons.push({ en: rule.en, ur: rule.ur });
    }
  });
  NOTES.forEach((note) => {
    if (note.when(answers)) reasons.push({ en: note.en, ur: note.ur });
  });

  const lastExamMonths = { never: Infinity, under1: 6, '1to2': 18, over2: 36 }[answers.lastExam];
  const overdue = lastExamMonths !== undefined && lastExamMonths > months;

  // Monthly Amsler grid at home: macular disease risk (age 50+, diabetes, smoking)
  const amslerMonthly =
    answers.age === '55to64' || answers.age === '65plus' ||
    answers.diabetes === 'type1' || answers.diabetes === 'type2' ||
    answers.smoker === 'yes';

  return { months, intervalLabel: INTERVAL_LABEL[months] || INTERVAL_LABEL[36], reasons, overdue, amslerMonthly };
};
