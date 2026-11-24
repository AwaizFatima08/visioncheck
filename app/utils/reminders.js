// VisionCheck — local reminders
// app/utils/reminders.js
//
// Two optional reminders, scheduled on the phone with no server involved:
//   amsler-monthly   a monthly Amsler grid check
//   exam-checkup     the next full eye exam (yearly, or once after N months)
// Notification permission is requested only when the user switches one on.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSetting, setSetting } from '../database/db';

const CHANNEL = 'reminders';
const HOUR    = 10;

export const REMINDER_IDS = { amsler: 'amsler-monthly', exam: 'exam-checkup' };

const COPY = {
  en: {
    amsler: { title: 'VisionCheck: monthly Amsler check', body: 'Takes a minute. Look at the grid with each eye and note any wavy or missing lines.' },
    exam:   { title: 'Time for an eye exam',              body: 'Based on your risk check, it is time to book a full eye exam.' },
  },
  ur: {
    amsler: { title: 'VisionCheck: ماہانہ جالی ٹیسٹ',     body: 'ایک منٹ لگے گا۔ ہر آنکھ سے جالی دیکھیں اور ٹیڑھی یا غائب لکیروں کو نوٹ کریں۔' },
    exam:   { title: 'آنکھوں کے معائنے کا وقت',             body: 'آپ کے رسک چیک کے مطابق اب مکمل معائنہ کروانے کا وقت ہے۔' },
  },
};

const ensureChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

// Returns true when the app may show notifications
export const ensurePermission = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return !!asked.granted;
};

export const getExamMonths = () => {
  const months = parseInt(getSetting('risk_exam_months'), 10);
  return months > 0 ? months : 12;
};

export const isEnabled = (kind) => getSetting(`rem_${kind}`) === '1';

const scheduleAmsler = async (language) => {
  const copy = COPY[language] || COPY.en;
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDS.amsler,
    content: { title: copy.amsler.title, body: copy.amsler.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day: Math.min(new Date().getDate(), 28),   // 28 so every month has the day
      hour: HOUR,
      minute: 0,
      channelId: CHANNEL,
    },
  });
};

const scheduleExam = async (language) => {
  const copy   = COPY[language] || COPY.en;
  const months = getExamMonths();
  const now    = new Date();
  const content = { title: copy.exam.title, body: copy.exam.body };

  if (months === 12) {
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDS.exam,
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        day: Math.min(now.getDate(), 28),
        month: now.getMonth(),
        hour: HOUR,
        minute: 0,
        channelId: CHANNEL,
      },
    });
  } else {
    const when = new Date(now.getFullYear(), now.getMonth() + months, Math.min(now.getDate(), 28), HOUR, 0, 0);
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDS.exam,
      content,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
    });
  }
};

// kind: 'amsler' | 'exam'. Returns the new on/off state (false if permission was refused).
export const setReminder = async (kind, on, language) => {
  if (!on) {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDS[kind]).catch(() => {});
    setSetting(`rem_${kind}`, '0');
    return false;
  }
  if (!(await ensurePermission())) return false;
  await ensureChannel();
  if (kind === 'amsler') await scheduleAmsler(language);
  else                   await scheduleExam(language);
  setSetting(`rem_${kind}`, '1');
  return true;
};
