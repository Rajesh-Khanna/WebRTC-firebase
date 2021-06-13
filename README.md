# WebRTC-firebase
wrapper over WebRTC with signaling based on firebase realtime database

To use this you need firebase api key, which you can get by creating a firebase project. [here](https://firebase.google.com/docs/database/web/start)

This package currently supports data-channel for
- p2p 
- client hosted room 

which will look something like this
```
const firebaseConfig = {
    apiKey: "***************************************",
    authDomain: "<project-id>.firebaseapp.com",
    projectId: "<project-id>",
    storageBucket: "<project-id>.appspot.com",
    messagingSenderId: "************",
    appId: "<api-id>",
    measurementId: "*-**********"
};
```
##API
- RoomHost
- Host
- Guest


##User Guide

Globally install `documentation` using the [npm](https://www.npmjs.com/) package manager:

```sh
$ npm install -g webrtc-firebase
```

#### Sample code
```js
import wf from 'webrtc-firebase';

const firebaseConfig = {
    apiKey: "***************************************",
    authDomain: "<project-id>.firebaseapp.com",
    projectId: "<project-id>",
    storageBucket: "<project-id>.appspot.com",
    messagingSenderId: "************",
    appId: "<api-id>",
    measurementId: "*-**********"
};

const channelName = ['channel1', 'channel2'];
let rtc;
const key = getURLParam('key');

if(key){
    rtc = new wf.Guest(key, firebaseConfig, channelName ,onConnectionSuccess, onSessionStateChange );
}else{
    const channelsConfig = [{name: 'channel1', type: 'data'}, {name: 'channel1', type: 'data'}];

    // use RoomHost instead of Host here for a group communication
    rtc = new wf.Host(firebaseConfig, channelsConfig , onKeyGenerated);
}

// on connection success to get data-channels use
const channel1 = rtc.getChannel('channel1');


--- utils.js
export const getURLParam = (param) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(param)
}

export function insertParam(key, value) {
    if (window.history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${key}=${value}`;
        window.history.pushState({ path: newurl }, '', newurl);
    }
}

export const onKeyGenerated = (key) => {
        insertParam('key', key);
    });

export const onConnectionSuccess = () => {
    console.log('connection successed');
}
```

this code generates a room url which u can share with whome you want to connect.

##### RoomHost
room host takes an other parameter, which we call ActivityManager, its like a server to this room and you can read or modify message before broadcasting them.