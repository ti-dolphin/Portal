import { useState } from "react";
import Router from './routes';
import ThemeProvider from './theme';
import GlobalStyles from './theme/globalStyles';
import RtlLayout from './components/RtlLayout';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import ThemeColorPresets from './components/ThemeColorPresets';
import MotionLazyContainer from './components/animate/MotionLazyContainer';
import { showNotification } from "./components/notifications/BrowserNotification";
import NotistackProvider from './components/NotistackProvider';
// import { onMessageListener } from "./api/firebase_service";
// import { messaging } from "./config";

export default function App() {
  // const [show, setShow] = useState(false);
  // const [notification, setNotification] = useState({ title: "", body: "" });
  //@ts-ignore
  const messaging = firebase.messaging();

  messaging.getToken('BPowXFlLqn8604QALxBQ8S0Qsmv4MCusfonBEGsH4K2UdKUrQ0U48_Pysa4qSUYelpKX9YA1xFZsUBG9JM-QbZU')
    .then(function(currentToken: any) {
      if (currentToken) {
        console.log(currentToken)
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
      }
    })
    .catch(function(err: any) {
      console.log('An error occurred while retrieving token. ', err);
    });

  messaging.onMessage(function(payload: any) {
    if(payload?.notification) {
      showNotification(payload.notification.title, { body: payload.notification.body, icon: `${process.env.PUBLIC_URL}/img/logo.png` })
    }
  });


  return (
    <ThemeProvider>
      <ThemeColorPresets>
        <RtlLayout>
          <NotistackProvider >
            <MotionLazyContainer>
              {/*{show && showNotificationBrowser() }*/}
              <GlobalStyles />
              <ProgressBarStyle />
              <ScrollToTop />
              <Router />
            </MotionLazyContainer>
          </NotistackProvider>
        </RtlLayout>
      </ThemeColorPresets>
    </ThemeProvider>
  );
}
