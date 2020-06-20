import {database, fb} from '../index.js';

const VirtualLineUtils ={
    addToVirtualLine: function(room_id, name, phone, party_size){
        var rootRef = database.ref();
        var queueRef = rootRef.child('queue');
        var newQueueRef = queueRef.child(room_id);
        
        return newQueueRef.set({
          'dateCreated': fb.database.ServerValue.TIMESTAMP,
          'dateClosed': '',
          'name': name,
          'phone': phone,
          'party_size': party_size,
          'active': true
        }).then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    },
    deactivateFromVirtualLine: function(room_id){
        var roomRef = 'queue/' + room_id;

        return database.ref(roomRef).once('value').then(function(snapshot){
            if (snapshot.val() !== null) {
                var updates = {}
                updates[roomRef + '/active'] = false;
                updates[roomRef + '/dateClosed'] = fb.database.ServerValue.TIMESTAMP;
              
                return database.ref().update(updates).then(() => {
                    return true;
                });
            } else {
                return false;
            }
        })
    },
    removeFromVirtualLine: function(room_id) {
        var roomRef = 'queue/' + room_id;

        return database.ref(roomRef).once('value')
        .then(function(snapshot){
            if (snapshot.val() !== null) {
                var updates = {}
                updates[roomRef] = null;
              
                return database.ref().update(updates).then(() => {
                    return true;
                });
            } else {
                return false;
            }
        })
    },
    isOnVirtualLine: function(room_id, callback) {
        return database.ref('queue/' + room_id).on('value', function(snapshot) {
            callback(snapshot.val());
        });
    },
    isOnVirtualLineOff: function(room_id) {
        return database.ref('queue/' + room_id).off();
    },
    getVirtualLineEntries: function(callback) {
        return database.ref('queue/').on('value', function(snapshot) {
            callback(snapshot.val());
        })
    },
    getVirtualLineEntriesOff: function() {
        return database.ref('queue/').off();
    }
}

export default VirtualLineUtils;