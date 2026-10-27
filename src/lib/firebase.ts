import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAnCCLSq4YdT3bbOeqxU4i84-_tBpz5Vv8",
  authDomain: "potentiallifier9000.firebaseapp.com",
  projectId: "potentiallifier9000",
  storageBucket: "potentiallifier9000.firebasestorage.app",
  messagingSenderId: "159807978583",
  appId: "1:159807978583:web:df24efdac23ffa974e7712",
  measurementId: "G-LMNYYEL73Z"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { analytics };