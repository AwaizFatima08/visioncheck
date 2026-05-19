// VisionCheck — Audio Prompts
// Uses expo-speech for text-to-speech in English and Urdu

import * as Speech from 'expo-speech';

// Language codes for expo-speech
const VOICE_LANG = {
  en: 'en-US',
  ur: 'ur-PK',  // Urdu Pakistan — falls back to ur if ur-PK unavailable
};

// Speech rate — slightly slower than default for clarity
const SPEECH_RATE = 0.85;

// ─── Speak a string ───────────────────────────────────────────────────────────
export const speak = (text, language = 'en', onDone = null) => {
  // Stop any current speech first
  Speech.stop();

  Speech.speak(text, {
    language: VOICE_LANG[language] || 'en-US',
    rate: SPEECH_RATE,
    pitch: 1.0,
    onDone: onDone || (() => {}),
    onError: (error) => {
      // Silently fail — text instructions are always visible
      console.log('Speech error (non-critical):', error);
    },
  });
};

// ─── Stop any current speech ──────────────────────────────────────────────────
export const stopSpeech = () => {
  Speech.stop();
};

// ─── Check if speech is available ────────────────────────────────────────────
export const isSpeechAvailable = async () => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.length > 0;
  } catch {
    return false;
  }
};

// ─── Pre-defined audio prompt keys ───────────────────────────────────────────
// These map to keys in the i18n strings file
// Call speakPrompt(key, language, strings) to speak any string

export const speakPrompt = (text, language) => {
  if (!text || text.trim() === '') return;
  speak(text, language);
};

// Speak instruction then pause then detail
export const speakWithPause = (mainText, detailText, language, pauseMs = 800) => {
  speak(mainText, language, () => {
    setTimeout(() => {
      speak(detailText, language);
    }, pauseMs);
  });
};
