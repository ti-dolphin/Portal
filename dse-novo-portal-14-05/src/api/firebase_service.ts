import firebase from 'firebase/compat/app';
import "firebase/compat/messaging";
import "firebase/compat/firestore";
import axios from 'axios';
import { getTokenFunction } from 'src/config';
import { requestPermissionNotification } from 'src/components/notifications/BrowserNotification';

// const publicKey: string = `BPowXFlLqn8604QALxBQ8S0Qsmv4MCusfonBEGsH4K2UdKUrQ0U48_Pysa4qSUYelpKX9YA1xFZsUBG9JM-QbZU`;
const firebaseApikey: string = `AAAA8Tp6lK0:APA91bFHh0HQTDWi71bwvjEaNW9mMfjP0ATmwNVoIwKlH2iv2Ckq3-IuJukOhklRuMBC5tzaTxhdl1Qqh6zs-El4lJfAwoX_E_lHqXXoq_SX5ZM8HlQ42OLhuW_FsGM6__F2ki_SFh8r`;
const headers: any = {
  "Content-Type": "application/json",
  "Authorization": `key=${firebaseApikey}`
};
const firebaseConfig: any = {
  apiKey: "AIzaSyD_9bx28Cv9fzDGwA9O1v2fQKXcTlli6H0",
  authDomain: "fir-dolphin-d3ced.firebaseapp.com",
  projectId: "fir-dolphin-d3ced",
  storageBucket: "fir-dolphin-d3ced.appspot.com",
  messagingSenderId: "1036068230317",
  appId: "1:1036068230317:web:266fee36cbdf0697b9e224"
};
// const firebaseConfigSandbox: any = {
//   apiKey: "AIzaSyDg_DXNPHJ323DRcvlb0woaSYFC2E4T2fE",
//   authDomain: "teste-dolphin.firebaseapp.com",
//   projectId: "teste-dolphin",
//   storageBucket: "teste-dolphin.appspot.com",
//   messagingSenderId: "61651307103",
//   appId: "1:61651307103:web:3c438ea30eeeb4ffcf29ea"
// };

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);
const db = firebase.firestore(app);

export async function onMessageListener() {
  return new Promise((resolve) => {
    if (messaging) {
      messaging.onMessage((payload) => {
        resolve(payload);
      });
    } else {
      resolve(null)
    }
  });
}

// async function getToken() {
//   try {
//     if (messaging) {
//       const currentToken = await messaging.getToken({ vapidKey: 'BPowXFlLqn8604QALxBQ8S0Qsmv4MCusfonBEGsH4K2UdKUrQ0U48_Pysa4qSUYelpKX9YA1xFZsUBG9JM-QbZU' });
//       if (currentToken) {
//         return currentToken;
//       } else {
//         return null;
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };

async function subscribeToTopic(topicName: string) {
  try {
    if (messaging) {
      await requestPermissionNotification();
      const currentToken = await getTokenFunction();
      if (currentToken) {
        const url = `https://iid.googleapis.com/iid/v1/${currentToken}/rel/topics/${topicName}`;
        const response = await axios.post(url, {}, { headers: headers });
        return response.data;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function unsubscribeFromTopic(topicName: string) {
  try {
    await requestPermissionNotification();
    const currentToken = await getTokenFunction();
    const data = {
      to: `/topics/${topicName}`,
      registration_tokens: [currentToken],
    };
    const url = `https://iid.googleapis.com/iid/v1:batchRemove`
    const response = await axios.post(url, data, { headers: headers });
    console.log(response.data);
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function pushNotification(title: string, body: string, to: any) {
  try {
    const url = `https://fcm.googleapis.com/fcm/send`;
    const notificationBody: any = {
      notification: {
        title: title,
        body: body
      },
      to: `/topics/${to}`
    };
    const response = await axios.post(url, notificationBody, { headers: headers });
    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export { app, db, pushNotification, subscribeToTopic, unsubscribeFromTopic };