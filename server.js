/* GMAIL */
const fs = require('fs')
const readline = require('readline')
const moment = require('moment')

const { exec } = require("child_process")
const { v4: uuidv4 } = require('uuid')
const open = require('open')
require('dotenv').config()


function execTerminal(commandToDo) {
    return new Promise((resolve, reject) => {
        exec(commandToDo, (error, stdout, stderr) => {
            if (error) {

                return reject(error.message)
            }
            if (stderr) {

                return reject(stderr)
            }

            resolve(stdout)
        })
    })
}


function startWhatsAppProcess(notification) {
    return new Promise(async (resolve, reject) => {

        const name = notification.name
        const extraNumbers = notification.extraNumbers
        const year = notification.year
        const price = notification.price
        const phone = notification.phone
        const lastName = notification.lastName
        const number = notification.number
        const id = notification.id
        const notificationType = notification.notificationType
        let urlMessage
        switch (notificationType) {
            case 'notification':
                urlMessage = `https://api.whatsapp.com/send/?phone=52${phone}&text=
                HOLA+${name}%21+Escogiste+un+boleto+para+la+Mazda+CX-30+2021%EE%84%90%0A%0A%2ABoleto+
                ${number}%2A%0AIncluye+sin+costo%3A+${extraNumbers}%0A%0A%2APor+favor+realiza+el+pago+antes+de+
                48+hrs.+y+env%C3%ADa+el+comprobante+de+pago+por+aqu%C3%AD%2A%0A%0APara+ver+cuentas+de+pago%0A%EE%80%A1%2A
                HAZ+CLICK+AQU%C3%8D%3A%2A+lottosorteos.com%2Fpagos%0A%0A%EE%84%A5COSTO%3A+
                %24699%0APromoci%C3%B3n%3A+2+por+%241250%0A%0AGracias%21&app_absent=0`
                break
            case 'reminder':
                urlMessage = `https://api.whatsapp.com/send/?phone=52${phone}&text=HOLA+${name}+reminder`
                break
            case 'reminderTwo':
                urlMessage = `https://api.whatsapp.com/send/?phone=52${phone}&text=HOLA+${name}+reminderTwo`
                break

        }

        //console.log(`name: ${name}, extraNumbers: ${extraNumbers},
        //year: ${year}, price: ${price}, phone: ${phone}, lastName: ${lastName}, number: ${number}`)

        const urlReplaced = urlMessage.replace(/\s/g, '+')
        const urlReplaced1 = urlReplaced.replace((/[ÁÄ]/g), "A")
        const urlReplaced2 = urlReplaced1.replace((/[ÉË]/g), "E")
        const urlReplaced3 = urlReplaced2.replace((/[ÍÏ]/g), "I")
        const urlReplaced4 = urlReplaced3.replace((/[ÓÖ]/g), "O")
        const urlReplaced5 = urlReplaced4.replace((/[ÚÜ]/g), "U")
        //console.log(urlReplaced5)

        try {
            if (process.env.OS === 'osx') {
                await execTerminal('osascript openWhatsApp.scpt')
            }

            open(urlReplaced5, { app: 'chrome' })

        } catch (error) {
            return reject('Failed to open WhatsApp')

        }


        const readySend = await new Promise((resolve) => {
            let times = 0
            const nSecondsToWait = 15

            const checkSend = setInterval(async () => {
                const color = await execTerminal(process.env.GET_COLOR_SCRIPT_PATH)
                times += 1
                console.log(color)
                if (color.trim() === '(146, 149, 152, 255)') {
                    resolve(true)
                    clearInterval(checkSend)
                }

                if (times === nSecondsToWait) {
                    resolve(false)
                    clearInterval(checkSend)

                }
            }, 1000)
        })

        if (readySend) {
            setTimeout(
                async () => {
                    await execTerminal(process.env.CLICK_SCRIPT_PATH)

                    resolve('success')
                }
                , 1000)

        } else {
            return reject('whats app problem')
        }




    })



}

/* SERVER */

async function startServer() {
    const express = require('express')
    const bodyParser = require('body-parser')
    const cors = require('cors')
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;


    const app = express()
    app.use(bodyParser.json())
    app.use(cors())

    let queue = []
    let failedNotifications = []

    /* DB */
    await mongoose.connect('mongodb://localhost/notifications', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });

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


    app.get('/', function (req, res) {
        return res.send({ mssg: 'Hello World' })
    })

    app.post('/new-notification', function (req, res) {
        console.log(req.body)


        /* 
        body example
        {
            "name": "armando",
            "extraNumbers": ["123", "124"],
            "year": "2021",
            "price": "$300",
            "phone": "6145284391",
            "lastName": "rios",
            "number": "1",
            "notificationType": "notification" // "reminder", "reminderTwo"
        }
     */

        const notification = req.body
        notification.id = uuidv4()
        if (queue.length) {
            queue.push(notification)
            return res.send({
                message: 'added to queue',
                toProcess: queue.length
            })

        } else {
            queue.push(notification)


            startWhatsAppProcess(notification).then(
                async mssg => {
                    queue = queue.filter(queueNotification => notification.id !== queueNotification.id)

                    checkForQueueToContinue()
                    addToFailed(notification.id)

                    try {
                        const date = new Date()

                        notification.lastExecute = roundDate(date)
                        await dbUpdate(notification)
                        return res.send(mssg)
                    }
                    catch (error) {
                        return res.status(500).send(error)
                    }





                }
            ).catch(err => {

                addToFailed(notification.id)
                checkForQueueToContinue()
                return res.status(500).send(err)
            })



        }










    })

    function roundDate(date) {
        const m = moment(date)
        const roundDown = m.startOf('minute')
        return (roundDown.toString()) // outputs Tue Feb 17 2017 12:01:00 GMT+0000

    }

    function dbUpdate(notification) {
        return new Promise((resolve, reject) => {
            if (notification.notificationType === 'notification') {
                const newNotification = new NotificationModel();
                for (const prop in notification) {
                    newNotification[prop] = notification[prop]
                }
                newNotification.save(function (err) {
                    if (err) return reject(err)

                    return resolve()
                });
            } else {
                NotificationModel.findByIdAndUpdate(notification._id, { notificationType: notification.notificationType, lastExecute: notification.lastExecute }, (err, docs) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        console.log("Updated User : ", docs)
                        resolve()
                    }
                })
            }

        })
    }

    function addToFailed(id) {
        queue = queue.filter(queueNotification => {
            if (id === queueNotification.id) {
                //failedNotifications.push(queueNotification)
                const content = JSON.stringify(queueNotification) + '\n'

                fs.appendFile('failed.txt', content, err => {
                    if (err) {
                        console.error(err)
                    }
                })
                return false
            } else {
                return true
            }
        })
    }

    function checkForQueueToContinue() {        
        if (queue.length) {
            const notification = queue.shift()            
            startWhatsAppProcess(notification).then(
                async mssg => {
                    queue = queue.filter(queueNotification => notification.id !== queueNotification.id)
                    try {
                        const date = new Date()

                        notification.lastExecute = roundDate(date)
                        await dbUpdate(notification)
                        checkForQueueToContinue()
                    }
                    catch (error) {
                        return console.log(error)
                    }

                }
            ).catch(err => {

                checkForQueueToContinue()

            })
        } else {
            console.log('Finished all')
        }
    }

    app.listen(3000, () => console.log('Server running'))
}


startServer()


