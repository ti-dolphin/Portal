import axios from 'axios';
import { SettingsValueProps } from './components/settings/type';
import { getMessaging } from "firebase/messaging/sw";
import { getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";

export const DRAWER_WIDTH = 260;
export const MENU_HEADER_MOBILE = 64;
export const MENU_HEADER_DESKTOP = 92;
export const MENU_NAVBAR_WIDTH = 280;
export const MENU_NAVBAR_COLLAPSE_WIDTH = 88;
export const MENU_NAVBAR_ROOT_ITEM_HEIGHT = 48;
export const MENU_NAVBAR_SUB_ITEM_HEIGHT = 40;
export const MENU_NAVBAR_ICON_ITEM_SIZE = 22;
export const MAIN_HEADER_DESKTOP = 88;
export const MAIN_HEADER_MOBILE = 64;

export const defaultSettings: SettingsValueProps = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeColorPresets: 'purple',
  themeStretch: false,
};

export const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL
});

export const urlPainel = process.env.REACT_APP_URL_PAINEL

const firebaseConfig: any = {
  apiKey: "AIzaSyD_9bx28Cv9fzDGwA9O1v2fQKXcTlli6H0",
  authDomain: "fir-dolphin-d3ced.firebaseapp.com",
  projectId: "fir-dolphin-d3ced",
  storageBucket: "fir-dolphin-d3ced.appspot.com",
  messagingSenderId: "1036068230317",
  appId: "1:1036068230317:web:266fee36cbdf0697b9e224",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
getToken(messaging, { vapidKey: 'BPowXFlLqn8604QALxBQ8S0Qsmv4MCusfonBEGsH4K2UdKUrQ0U48_Pysa4qSUYelpKX9YA1xFZsUBG9JM-QbZU' }).then((currentToken) => {
  if (currentToken) {
    console.log("show token", currentToken);
    return currentToken;
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});

export const getTokenFunction = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: 'BPowXFlLqn8604QALxBQ8S0Qsmv4MCusfonBEGsH4K2UdKUrQ0U48_Pysa4qSUYelpKX9YA1xFZsUBG9JM-QbZU' });
    if (currentToken) {
      console.log("show token", currentToken);
      return currentToken;
    } else {
      // Show permission request UI
      console.log('No registration token available. Request permission to generate one.');
      // ...
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

// onMessage(messaging, (payload) => {
//   console.log('Message received. ', payload);
//   // ...
// });