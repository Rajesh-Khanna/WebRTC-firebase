import firebase from 'firebase';
import { MESSAGE_TYPE, USER_TYPE, LOBBY_COLLECTION } from './constants';

function callbackClosure(i, callback) {
    return function(x) {
        return callback(i, x);
    }
}

export default class Signal {


    constructor(name, firebaseConfig, lobbyKey, onLobbyKey) {
        this.userType;


        this.name = name;

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app();
        }
        firebase.analytics();
        this.database = firebase.database();


        if (lobbyKey && lobbyKey.length) {
            this.userType = USER_TYPE.GUEST;
            this.addGuest(lobbyKey);
        } else {
            this.userType = USER_TYPE.HOST
            this.addHost(onLobbyKey);
        }
    }

    dashboard() {
        this.workSpaceRef = this.database.ref(`${LOBBY_COLLECTION}`);
        this.workSpaceRef.on('value', (val) => {
            console.log({ val: val.val() });
        });
    }

    onCandidate(callBack, guestKey) {
        if (this.userType === USER_TYPE.GUEST) {
            // host candidate
            this.workSpaceRef.child('host_candidate').on('value', (snapShot) => {
                console.log('host candidate received', snapShot);
                console.log({ candidate: snapShot.val() });
                // store candidate
                callBack(snapShot.val());
            });
        }
        if (this.userType === USER_TYPE.HOST) {
            if (guestKey === null) {
                console.log("guest key shouldn't be null");
            }
            // guest candidate
            this.workSpaceRef.child(`guests/${guestKey}/guest_candidate`).on('value', (snapShot) => {
                console.log('guest candidate received', snapShot);
                console.log({ candidate: snapShot.val() });
                // store candidate
                callBack(snapShot.val());
            });
        }
    }

    onMessage(callBack) {
        console.log('onMessage callback set');
        if (this.userType === USER_TYPE.GUEST) {
            this.workSpaceRef.child('offer').on('value', (snapShot) => {
                console.log('offer recived', snapShot);
                console.log({ offer: snapShot.val() });
                if (snapShot.val())
                    callBack({ type: MESSAGE_TYPE.OFFER, host: { offer: snapShot.val() } })
            });
        }
        if (this.userType === USER_TYPE.HOST) {
            // ADD_GUEST
            this.workSpaceRef.child('guests').on('child_added', (guestObj) => {
                console.log(guestObj);
                const guestKey = guestObj.key;
                console.log({ guestKey });
                callBack({ type: MESSAGE_TYPE.GUEST, guestId: guestKey });

                // ON_ANSWER
                this.workSpaceRef.child(`guests/${guestKey}/answer`).on('value', callbackClosure(guestKey,
                    (k, answer) => {
                        console.log({ answer, guestKey: k, val: answer.val() })
                        if (answer.val())
                            callBack({ type: MESSAGE_TYPE.ANSWER, guest: { id: k, answer: answer.val() } });
                    }));
            });
        }
    }

    send(key, value, path) {
        console.log('send', key, value, path);
        if (path) {
            this.workSpaceRef.child(`guests/${path}`).update({
                [key]: value
            })
        } else {
            console.log({ workSpaceRef: this.workSpaceRef })
            this.workSpaceRef.update({
                [key]: value
            });
        }
    }

    addHost(onLobbyKey) {
        /**
         * Push a new host obj to db
         */

        console.log('starting host');

        const currentDate = new Date();

        const hostObj = {
            name: `${this.name}-host`,
            lastActivityAt: currentDate.getTime(),
        }

        const ref = this.database.ref(LOBBY_COLLECTION);
        const lobbyKey = ref.push(hostObj).getKey();
        console.log({ lobbyKey });
        onLobbyKey(lobbyKey);
        this.workSpaceRef = this.database.ref(`${LOBBY_COLLECTION}/${lobbyKey}`);
        ref.off();
        // this.onMessage((v) => { console.log({ v }) });
    }

    addGuest(lobbyKey) {
        /**
         * Add a guest object in Host
         */
        console.log('starting guest');

        const guestObj = {
            name: this.name,
        }

        console.log({ lobbyKey });

        const ref = this.database.ref(`${LOBBY_COLLECTION}/${lobbyKey}/guests`);
        this.workSpaceRef = ref.push();
        this.workSpaceRef.set(guestObj);
        ref.off();
        console.log({ workSpaceRef: this.workSpaceRef });
        // this.onMessage((v) => { console.log({ v }) });
    }

    end() {
        firebase.app().delete().then(() => {
            console.log('signal app closed');
        });
    }
}