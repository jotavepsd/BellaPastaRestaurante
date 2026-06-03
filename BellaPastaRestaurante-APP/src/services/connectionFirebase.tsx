import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAiir5Op4LHFEyvFdJtR5gRYnemJMzXQfw",
  authDomain: "bellapastarestaurante.firebaseapp.com",
  databaseURL: "https://bellapastarestaurante-default-rtdb.firebaseio.com",
  projectId: "bellapastarestaurante",
  storageBucket: "bellapastarestaurante.firebasestorage.app",
  messagingSenderId: "94209561790",
  appId: "1:94209561790:web:24bc06c0e43e944f8abaef"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;