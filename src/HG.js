import PubSub from './pubSub';
import Signal from './signal';
import RTC from './webRTCHandler';

// constants
import { USER_TYPE, MESSAGE_TYPE } from './constants';

class ChannelEndSim {

    constructor(label, mod) {
        this.mod = false;

        this.readyState = 'open';

        this.onmessage = null;
        this.pipe = null;
        this.label = label;
        this.mod = mod;
    }

    send(message) {
        message = {
            data: message,
            currentTarget: {
                label: this.label
            }
        }
        if (this.pipe) this.pipe(message);
    }
}

class ChannelSim {

    constructor(label) {
        this.dc1 = new ChannelEndSim(label, true);
        this.intakeChannel = new ChannelEndSim(label);

        this.intakeChannel.pipe = (message) => {
            if (this.dc1.onmessage)
                this.dc1.onmessage(message);
        }
        this.dc1.pipe = (message) => {
            if (this.intakeChannel.onmessage)
                this.intakeChannel.onmessage(message);
        }
    }
}

export class RoomHost {

    constructor(onLobbyKey, firebaseConfig, req_channels, activityManager) {
        this.pubSub;

        this.signal;

        this.guests = {};

        this.channels = {};

        this.req_channels = [];

        this.req_channels = req_channels;
        this.pubSub = new PubSub(activityManager, firebaseConfig, req_channels, null, onLobbyKey);
        this.simulatedChannels();
    }

    simulatedChannels() {
        this.req_channels.forEach(channel => {
            const currChannel = new ChannelSim(channel.name);
            this.channels[channel.name] = currChannel.intakeChannel;
            this.pubSub.push(channel.name, currChannel.dc1);
        });
    }

    getChannel(channel_name) {
        return this.channels[channel_name];
    }

}

export class Host {

    constructor(firebaseConfig, req_channels, onLobbyKey) {

        this.signal;
        this.rtc;
        this.channels = {};
        this.req_channels = [];
        this.guest;

        this.signal = new Signal('host', firebaseConfig, null, onLobbyKey);
        this.signal.onMessage((message) => { this.incomingMessage(message) });
        this.req_channels = req_channels;
        // this.channels = (req_channels || []).reduce((acc, curr) => { return {...acc, [curr.name]: [] } }, {});
    }

    incomingMessage(message) {
        switch (message.type) {
            case MESSAGE_TYPE.GUEST:
                if (!this.guest)
                    this.addGuest(message.guestId)
                break;
            case MESSAGE_TYPE.ANSWER:
                this.handleAnswer(message.guest)
                break;
            default:
                console.log('invalid message Type', message);
        }
    }

    addGuest(id) {
        console.log('addClient', id);
        const rtc = new RTC(
            USER_TYPE.HOST,
            (offer, guestId) => { this.signal.send('offer', offer, guestId) },
            (e) => {
                console.log('on channel open set');
                this.createChannels(id)
            },
            (candidate, guestId) => { this.signal.send('host_candidate', candidate, guestId) },
            id
        );
        this.signal.onCandidate((candidate) => { rtc.storeCandidate(candidate) }, id);
        rtc.sendOffer();
        this.guest = rtc;
    }

    createChannels(id) {
        console.log('creating channel');
        this.req_channels.forEach(channel => {
            this.channels[channel.name] = this.guest.createChannel(channel.name);
        });
    }

    handleAnswer(guest) {
        const rtc = this.guest;
        if (!rtc) alert('guest Id doesnt exist');
        rtc.setAnswer(guest.answer);
    }

    getChannel(channel_name) {
        return this.channels[channel_name];
    }

    signalEnd() {
        this.signal.end();
    }

}

export class Guest {


    constructor(lobbyKey, firebaseConfig, req_channels, onConnection, onSessionStateChange) {
        this.signal;
        this.rtc;
        this.channels = {};
        this.req_channels = [];

        this.signal = new Signal(USER_TYPE.GUEST, firebaseConfig, lobbyKey);
        this.req_channels = req_channels;
        this.onConnection = onConnection;
        this.rtc = new RTC(USER_TYPE.GUEST, (answer, id) => {
                this.signal.send('answer', answer);
            }, (channel) => { this.onChannel(channel); },
            (candidate, guestId) => { this.signal.send('guest_candidate', candidate, guestId) },
            null, onSessionStateChange
        );
        this.signal.onCandidate((candidate) => { this.rtc.storeCandidate(candidate) });
        this.signal.onMessage((message) => { this.incomingMessage(message) });
        setTimeout(() => {
            if (Object.keys(this.channels).length < Object.values(this.req_channels).length + 1) {
                onSessionStateChange('unknown')
            }
        }, 30000);
    }

    onChannel(channel) {
        console.log({ channel });
        this.channels[channel.label] = channel;
        console.log(this.channels, Object.keys(this.channels).length);
        if (Object.keys(this.channels).length >= Object.values(this.req_channels).length + 1) {
            this.onConnection()
        }
    }

    incomingMessage(message) {
        switch (message.type) {
            case MESSAGE_TYPE.OFFER:
                this.handleOffer(message.host)
                break;
            default:
                console.log('invalid message Type', message);
        }
    }

    handleOffer(host) {
        this.rtc.setAndSendOffer(host.offer);
    }

    getChannel(channel_name) {
        return this.channels[channel_name];
    }

    signalEnd() {
        this.signal.end();
    }
}