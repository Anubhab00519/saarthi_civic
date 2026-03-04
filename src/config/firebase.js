import { initializeApp } from 'firebase/app'
import { getAuth }       from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBhO0r9BIu8Kwt5PNkkbHQsTxrEQYZXVIY",
  authDomain: "saarthi-civic.firebaseapp.com",
  projectId: "saarthi-civic",
  storageBucket: "saarthi-civic.firebasestorage.app",
  messagingSenderId: "981648759458",
  appId: "1:981648759458:web:0f694975554615e4c595fb",
  measurementId: "G-V07LYRFCEF"
}

const app         = initializeApp(firebaseConfig)
export const auth = getAuth(app)