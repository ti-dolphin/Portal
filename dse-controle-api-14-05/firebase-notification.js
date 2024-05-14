const axios = require('axios')

const FIREBASE_API_KEY = `AAAA8Tp6lK0:APA91bFHh0HQTDWi71bwvjEaNW9mMfjP0ATmwNVoIwKlH2iv2Ckq3-IuJukOhklRuMBC5tzaTxhdl1Qqh6zs-El4lJfAwoX_E_lHqXXoq_SX5ZM8HlQ42OLhuW_FsGM6__F2ki_SFh8r`;
const postURL = `https://fcm.googleapis.com/fcm/send`

const headers = { 
  "Content-Type": "application/json",
  "Authorization": `key=${FIREBASE_API_KEY}`
};

class FirebaseNotification{

    static push(title, body, to){
        return new Promise(function (resolve, reject) {
            axios.post(postURL, {
                "notification": {
                    "title": title,
                    "body": body
                },
                "to" : to
            }, { headers }).then(res => {
                resolve(res)
            }).catch((err) => {
                console.log(err);
                reject(err)
            });

        });
    }

    static subscribeToTopic(topicName, currentToken){
        return new Promise(function (resolve, reject) {

            const topicURL = `https://iid.googleapis.com/iid/v1/${currentToken}/rel/topics/`+topicName;

            axios.post(topicURL, {}, { headers }).then(res => {
                resolve(res)
            }).catch((err) => {
                console.error(err);
                reject(err)
            });
        });
    }

}

module.exports = FirebaseNotification