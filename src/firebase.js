// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage'; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyoqR36nupEf8NhgO8qGIwIHNrUyF_uvw",
  authDomain: "panther-advisor-db.firebaseapp.com",
  databaseURL: "https://panther-advisor-db-default-rtdb.firebaseio.com",
  projectId: "panther-advisor-db",
  storageBucket: "panther-advisor-db.appspot.com",
  messagingSenderId: "274298097211",
  appId: "1:274298097211:web:ff86dc83acd997e245961e",
  measurementId: "G-F0BWF9T1B7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const database = getDatabase(app);

const storage = getStorage(app);

export { auth, database, storage };