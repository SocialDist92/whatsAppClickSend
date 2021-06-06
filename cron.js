const CronJob = require('cron').CronJob;
const axios = require('axios');
const moment = require('moment')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notificationSchema = new Schema({
    name: String,
    extraNumbers: Array,
    year: String,
    price: String,
    phone: String,
    lastName: String,
    number: String,
    notificationType: String,
    lastExecute: Date
});

const NotificationModel = mongoose.model('Notification', notificationSchema);

async function start() {

    /* DB */
    try {
        await mongoose.connect('mongodb://localhost/notifications', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('connected to db')
    } catch (error) {
        console.log('failed to connect to db')
    }



    const job = new CronJob('* * * * *', function () {
        console.log('Running cron')        
        const roundedDateMinus48 = roundDate(moment(new Date()).subtract(1, "minutes").toDate())
        const roundedDateMinus72 = roundDate(moment(new Date()).subtract(2, "minutes").toDate())
        NotificationModel.find({ $or: [{ lastExecute: roundedDateMinus48 }, { lastExecute: roundedDateMinus72 }] }, (err, docs) => {
            if (err) {
                console.log(err)
            }
            else {
                if (docs.length) postNotifications(docs)



            }
        })



    }, null, true, 'America/Los_Angeles');
    job.start();
}

function postNotifications(docs) {
    docs.forEach(notification => {
        let notificationType
        switch (notification.notificationType) {
            case 'notification':
                notificationType = 'reminder'
                break
            case 'reminder':
                notificationType = 'reminderTwo'
                break
            case 'reminderTwo':
                notificationType = null
        }

        if (notificationType) {
            const body = notification
            notification.notificationType = notificationType
            axios.post('https://lottosorteos.ngrok.io/new-notification', body

            )
                .then(function (response) {
                    console.log('post to notification');
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

    })
}
function roundDate(date) {
    const m = moment(date)
    const roundDown = m.startOf('minute')
    return (roundDown.toString()) // outputs Tue Feb 17 2017 12:01:00 GMT+0000

}
start()