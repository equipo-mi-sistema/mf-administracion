const isLocalEnv = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  production: true,
  hostBaseUrl: isLocalEnv ? 'http://localhost:4200' : 'https://mi-sisema.web.app',
  firebase: {
    apiKey: 'AIzaSyBjvYnMBDXPq6roKvlYuf6HAP5Bjv9NF44',
    authDomain: 'mi-sisema.firebaseapp.com',
    projectId: 'mi-sisema',
    storageBucket: 'mi-sisema.firebasestorage.app',
    messagingSenderId: '762965648775',
    appId: '1:762965648775:web:f436245734e7d4bee39f22',
    measurementId: 'G-0CK0X5QHNE'
  }
};
