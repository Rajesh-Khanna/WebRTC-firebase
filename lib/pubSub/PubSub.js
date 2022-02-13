class PubSub {

    roomServer;

    messageQueue = []; // Array<MessageObj>

    queueReading = false;

    constructor(customRoomServer) {
        this.roomServer = customRoomServer;
        queuePoller();
    }

    // MessageObj

    /*
     * responsible for message distribution
     */
    dequeuer() {
        queueReading = true;
        while (messageQueue.length != 0) {
            let message = messageQueue.front;
            let messageObjs = this.roomServer.onMessage(message);
            for (let messageObj of messageObjs)
                distributeMessage(messageObj);
        }
        queueReading = false;
    }

    /*
     * message queue poller
     * dequeuer polled every 0.5 or 1 sec
     */
    queuePoller() {
        // todo: define timer here
        if (!queueReading) {
            dequeuer();
        }
    }

    /*
     * responsible for message distribution
     * paramerter: messageObj: MessageObj
     */
    distributeMessage(messageObj) {
        for (let userId of messageObj.destinationUserIds) {
            // get communicationChannel from userId
            // send message to that channel
        }
    }

}

export default PubSub;