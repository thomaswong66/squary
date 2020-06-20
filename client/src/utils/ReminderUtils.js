import {database, fb} from '../index.js';

const ReminderUtils ={
    getReminder: function(room_id, callback){
        var reminderRef = database.ref('reminders/' + room_id);
        
        return reminderRef.on('value', function(snapshot) {
            callback(snapshot.val());
        });
    },
    getReminderOff: function(room_id) {
        var reminderRef = database.ref('reminders/' + room_id);
        return reminderRef.off();
    },
    setReminder: function(room_id){
        var reminderRef = 'reminders/' + room_id;
        var updates = {}
        updates[reminderRef] = true;
              
        return database.ref().update(updates).then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    },
    removeReminder: function(room_id){
        var reminderRef = 'reminders/' + room_id;
        var updates = {}
        updates[reminderRef] = null;
              
        return database.ref().update(updates).then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }
}

export default ReminderUtils;