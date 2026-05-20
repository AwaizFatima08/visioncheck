// VisionCheck — Audio / Speech Helper
// app/audio/speech.js
//
// expo-speech wrapper for bilingual audio prompts.
// Urdu voice: ur-PK (falls back to ur if unavailable)
// English voice: en-US
//
// IMPORTANT: All speech calls are non-blocking.
// If audio fails, text instructions are always visible — audio is enhancement only.

import * as Speech from 'expo-speech';

const VOICE_LANG = {
  en: 'en-US',
  ur: 'ur-PK',
};

const SPEECH_RATE = 0.82; // slightly slower than default for clarity

// ─── Core speak function ──────────────────────────────────────────────────────
export const speak = (text, language = 'en', onDone = null) => {
  if (!text || text.trim() === '') return;
  Speech.stop();
  Speech.speak(text, {
    language: VOICE_LANG[language] || 'en-US',
    rate:     SPEECH_RATE,
    pitch:    1.0,
    onDone:   onDone || (() => {}),
    onError:  () => {}, // silent fail — text always visible
  });
};

export const stopSpeech = () => Speech.stop();

// ─── Tumbling E — direction prompts ──────────────────────────────────────────
// Called each time a new E is shown on screen

export const DIRECTION_PROMPTS = {
  en: 'Which direction is the E pointing? Tap the matching arrow.',
  ur: 'E کس طرف اشارہ کر رہا ہے؟ اسی تیر کو دبائیں۔',
};

export const speakEPrompt = (language) => {
  speak(DIRECTION_PROMPTS[language] || DIRECTION_PROMPTS.en, language);
};

// ─── Correct / wrong feedback ─────────────────────────────────────────────────
export const FEEDBACK = {
  correct: { en: 'Correct.',   ur: 'درست۔' },
  wrong:   { en: 'Moving on.', ur: 'اگلا۔'  },
};

export const speakFeedback = (isCorrect, language) => {
  const key  = isCorrect ? 'correct' : 'wrong';
  const text = FEEDBACK[key][language] || FEEDBACK[key].en;
  speak(text, language);
};

// ─── Eye instruction prompts ──────────────────────────────────────────────────
export const EYE_PROMPTS = {
  coverLeft:  { en: 'Cover your left eye with your palm.',  ur: 'بائیں آنکھ کو ہتھیلی سے ڈھانپیں۔'  },
  coverRight: { en: 'Cover your right eye with your palm.', ur: 'دائیں آنکھ کو ہتھیلی سے ڈھانپیں۔' },
  bothOpen:   { en: 'Keep both eyes open.',                 ur: 'دونوں آنکھیں کھلی رکھیں۔'           },
};

export const speakEyePrompt = (key, language) => {
  const prompt = EYE_PROMPTS[key];
  if (!prompt) return;
  speak(prompt[language] || prompt.en, language);
};

// ─── Distance prompts ─────────────────────────────────────────────────────────
export const DISTANCE_PROMPTS = {
  arm:     { en: 'Hold your phone at arm\'s length, about 40 centimetres away.', ur: 'فون کو بازو کی لمبائی پر رکھیں، تقریباً ۴۰ سینٹی میٹر دور۔' },
  reading: { en: 'Hold your phone at normal reading distance, about 30 centimetres.', ur: 'فون کو عام پڑھنے کی دوری پر رکھیں، تقریباً ۳۰ سینٹی میٹر۔' },
};

export const speakDistance = (key, language) => {
  const prompt = DISTANCE_PROMPTS[key];
  if (!prompt) return;
  speak(prompt[language] || prompt.en, language);
};

// ─── General prompt helper ────────────────────────────────────────────────────
export const speakPrompt = (text, language) => speak(text, language);
