const firebaseRoomUtils = {
    fetchRoom: function (firebaseDB, roomID){
        var response = null;
        var query =  firebaseDB.ref('rooms/').orderByKey().equalTo(roomID);
        return query.once('value', snapshot => {
            if(snapshot.exists()){
                var roomData =  snapshot.val();
                response = {
                    'title': 'Room fetched',
                    'result': roomData[roomID]
                }
            }
        }).then(() => {
            return response;
        })
    },
    addRoomListener: function (firebaseDB, roomID, listener){
        var ref =  firebaseDB.ref('rooms/' + roomID + '/guests');
        return ref.on('child_added', snapshot => {
            listener(snapshot);
        })
    }
}
export default firebaseRoomUtils;