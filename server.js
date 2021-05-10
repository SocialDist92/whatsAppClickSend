/* GMAIL */
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const { exec } = require("child_process")
const { v4: uuidv4 } = require('uuid')
const open = require('open')


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

// Load client secrets from a local file.
fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err)
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), startServer)
})


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client)
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err)
            oAuth2Client.setCredentials(token)
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
                console.log('Token stored to', TOKEN_PATH)
            })
            callback(oAuth2Client)
        })
    })
}

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


/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

//TODO: THIS CAN CAUSE A PROBLEM
function getLastSubject(auth) {
    return new Promise((resolve, reject) => {

        const gmail = google.gmail({ version: 'v1', auth })
        gmail.users.messages.list({
            userId: 'me',
            maxResults: 1
        }, (err, res) => {
            if (err) reject('The API returned an error: ' + err)

            gmail.users.messages.get({
                userId: 'me',
                id: res.data.messages[0].id
            }).then((res) => {

                const headersArray = res.data.payload.headers
                let subject = headersArray.filter(header =>
                    header.name == 'Subject'
                )[0].value
                resolve(subject)


                /* let body_content = JSON.stringify(res.data.payload.parts[0].body.data)
                let data, buff, text
                data = body_content
                buff = new Buffer.from(data, "base64")
                mailBody = buff.toString() */
                // display the result
                //console.log(mailBody)



            })

        })
    })

}

function createNotification(subject) {

    subject = subject.split('|')

    const notification = {
        name: subject[0],
        extraNumbers: subject[1],
        year: subject[2],
        price: subject[3],
        phone: '6145284391',//subject[4],
        lastName: subject[5],
        number: subject[6],
        id: uuidv4()//subject[7],
    }


    return notification

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
        //console.log(`name: ${name}, extraNumbers: ${extraNumbers},
        //year: ${year}, price: ${price}, phone: ${phone}, lastName: ${lastName}, number: ${number}`)
        const urlMessage = `https://api.whatsapp.com/send/?phone=52${phone}&text=HOLA+${name}%21+Escogiste+un+boleto+para+la+Mazda+CX-30+2021%EE%84%90%0A%0A%2ABoleto+${number}%2A%0AIncluye+sin+costo%3A+${extraNumbers}%0A%0A%2APor+favor+realiza+el+pago+antes+de+48+hrs.+y+env%C3%ADa+el+comprobante+de+pago+por+aqu%C3%AD%2A%0A%0APara+ver+cuentas+de+pago%0A%EE%80%A1%2AHAZ+CLICK+AQU%C3%8D%3A%2A+lottosorteos.com%2Fpagos%0A%0A%EE%84%A5COSTO%3A+%24699%0APromoci%C3%B3n%3A+2+por+%241250%0A%0AGracias%21&app_absent=0`
        const urlReplaced = urlMessage.replace(/\s/g, '+')
        const urlReplaced1 = urlReplaced.replace((/[ÁÄ]/g), "A")
        const urlReplaced2 = urlReplaced1.replace((/[ÉË]/g), "E")
        const urlReplaced3 = urlReplaced2.replace((/[ÍÏ]/g), "I")
        const urlReplaced4 = urlReplaced3.replace((/[ÓÖ]/g), "O")
        const urlReplaced5 = urlReplaced4.replace((/[ÚÜ]/g), "U")
        //console.log(urlReplaced5)

        try {
            await execTerminal('osascript openWhatsApp.scpt')
            open(urlReplaced5, { app: 'chrome' })

        } catch (error) {
            return reject('Failed to open WhatsApp')

        }


        const readySend = await new Promise((resolve) => {
            let times = 0
            const nSecondsToWait = 15

            const checkSend = setInterval(async () => {
                const color = await execTerminal("python3 /Users/armandorios/whatsAppClickSend/getColor.py")
                times += 1
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
                    await execTerminal("python /Users/armandorios/whatsAppClickSend/click.py")

                    resolve('success')
                }
                , 1000)

        } else {
            return reject('whats app problem')
        }




    })



}

/* SERVER */
function startServer(auth) {
    const express = require('express')
    const app = express()



    let queue = []
    let failedNotifications = []

    app.get('/', function (req, res) {
        res.send('Hello World')
    })

    app.post('/new-notification', function (req, res) {
        getLastSubject(auth).then(
            subject => {
                if (subject.indexOf('|')) {
                    const notification = createNotification(subject)

                    if (queue.length) {
                        queue.push(notification)
                        return res.send({
                            message: 'added to queue',
                            toProcess: queue.length
                        })

                    } else {
                        queue.push(notification)

                        
                        startWhatsAppProcess(notification).then(
                            mssg => {
                                queue = queue.filter(queueNotification => notification.id !== queueNotification.id)                                
                                checkForQueueToContinue()
                                addToFailed(notification.id)
                                return res.send(mssg)
                            }
                        ).catch(err => {

                            addToFailed(notification.id)
                            checkForQueueToContinue()
                            return res.status(500).send(err)
                        })



                    }
                } else {
                    return res.status(500).send('Not register email')
                }




            }
        ).catch(err => console.log(err))



    })

    function addToFailed(id) {
        queue = queue.filter(queueNotification => {
            if (id === queueNotification.id) {
                failedNotifications.push(queueNotification)
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
                mssg => {
                    queue = queue.filter(queueNotification => notification.id !== queueNotification.id)

                    checkForQueueToContinue()
                }
            ).catch(err => {

                checkForQueueToContinue()

            })
        }else{
            console.log('Finished all')
        }
    }

    app.listen(3000, () => console.log('Server running'))


}
