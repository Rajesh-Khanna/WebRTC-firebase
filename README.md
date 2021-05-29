# WebRTC-firebase
wrapper over WebRTC with signaling based on firebase realtime database

To use this you need firebase api key, which you can get by creating a firebase project. [here](https://firebase.google.com/docs/database/web/start)

which will look something like this
```
export const firebaseConfig = {
    apiKey: "***************************************",
    authDomain: "<project-id>.firebaseapp.com",
    projectId: "<project-id>",
    storageBucket: "<project-id>.appspot.com",
    messagingSenderId: "************",
    appId: "<api-id>",
    measurementId: "*-**********"
};
```
