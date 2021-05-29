export const USER_TYPE = {
    HOST: 'HOST',
    GUEST: 'GUEST',
};

export const MESSAGE_TYPE = {
    CLIENT: 'CLIENT',
    OFFER: 'OFFER',
    ANSWER: 'ANSWER',
    GUEST: 'GUEST'
};

export const LOBBY_COLLECTION = 'LOBBY_COLLECTION';

export const CONFIGURATION = {
    'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' },
        { 'url': 'stun:stun1.l.google.com:19302' },
        { 'url': 'stun:stun2.l.google.com:19302' },
        { 'url': 'stun:stun3.l.google.com:19302' },
        { 'url': 'stun:stun4.l.google.com:19302' },
    ]
};