import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

if (Capacitor.isNativePlatform()) {
  window.nativeSpeak = async (word) => {
    try {
      await TextToSpeech.speak({
        text: word,
        lang: 'en-GB',
        rate: 0.85,
        queueStrategy: 0
      });
    } catch (error) {
      console.warn('Native pronunciation unavailable', error);
    }
  };

  App.addListener('backButton', () => {
    if (!document.querySelector('#manageView').hidden) {
      document.querySelector('#manageBack').click();
    } else if (!document.querySelector('#studyView').hidden) {
      document.querySelector('#backBtn').click();
    } else {
      App.exitApp();
    }
  });
}
