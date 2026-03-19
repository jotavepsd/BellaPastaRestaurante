import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
 

const firebaseConfig = {
  apiKey: "AIzaSyAiir5Op4LHFEyvFdJtR5gRYnemJMzXQfw",
  authDomain: "bellapastarestaurante.firebaseapp.com",
  projectId: "bellapastarestaurante",
  storageBucket: "bellapastarestaurante.firebasestorage.app",
  messagingSenderId: "94209561790",
  appId: "1:94209561790:web:24bc06c0e43e944f8abaef",
  baseUrl: "https://bellapastarestaurante-default-rtdb.firebaseio.com/"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;