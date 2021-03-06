const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { exec } = require("child_process");
const open = require('open');
const { executionAsyncResource } = require('async_hooks');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), listEmail);
});


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
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
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            //console.log('Labels:');
            labels.forEach((label) => {
                //console.log(`- ${label.name}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}

function execTerminal(commandToDo) {
    return new Promise((resolve, reject) => {
        exec(commandToDo, (error, stdout, stderr) => {
            if (error) {

                return reject(error.message);
            }
            if (stderr) {

                return reject(stderr);
            }

            resolve(stdout)
        });
    })
}


/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEmail(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list({
        userId: 'me',
        maxResults: 1
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);

        gmail.users.messages.get({
            userId: 'me',
            id: res.data.messages[0].id
        }).then(async (res) => {

            const headersArray = res.data.payload.headers
            let subject = headersArray.filter(header =>
                header.name == 'Subject'
            )[0].value
            console.log(subject)
            //check if it's actual participant mail
            if (subject.indexOf('|')) {
                subject = subject.split('|')
                const name = subject[0]
                const extraNumbers = subject[1]
                const year = subject[2]
                const price = subject[3]
                const phone = '6145284391'//subject[4]
                const lastName = subject[5]
                const number = subject[6]
                //console.log(`name: ${name}, extraNumbers: ${extraNumbers},
                //year: ${year}, price: ${price}, phone: ${phone}, lastName: ${lastName}, number: ${number}`)
                const urlMessage = `https://api.whatsapp.com/send/?phone=52${phone}&text=HOLA+${name}%21+Escogiste+un+boleto+para+la+Mazda+CX-30+2021%EE%84%90%0A%0A%2ABoleto+${number}%2A%0AIncluye+sin+costo%3A+${extraNumbers}%0A%0A%2APor+favor+realiza+el+pago+antes+de+48+hrs.+y+env%C3%ADa+el+comprobante+de+pago+por+aqu%C3%AD%2A%0A%0APara+ver+cuentas+de+pago%0A%EE%80%A1%2AHAZ+CLICK+AQU%C3%8D%3A%2A+lottosorteos.com%2Fpagos%0A%0A%EE%84%A5COSTO%3A+%24699%0APromoci%C3%B3n%3A+2+por+%241250%0A%0AGracias%21&app_absent=0`
                const urlReplaced = urlMessage.replace(/\s/g, '+');
                const urlReplaced1 = urlReplaced.replace((/[????]/g), "A");
                const urlReplaced2 = urlReplaced1.replace((/[????]/g), "E");
                const urlReplaced3 = urlReplaced2.replace((/[????]/g), "I");
                const urlReplaced4 = urlReplaced3.replace((/[????]/g), "O");
                const urlReplaced5 = urlReplaced4.replace((/[????]/g), "U");
                //console.log(urlReplaced5)

                try {
                    await execTerminal('osascript openWhatsApp.scpt')

                    open(urlReplaced5, { app: 'chrome' });


                    //await execTerminal('osascript clickSend.scpt')

                } catch (error) {
                    throw ('Failed to open WhatsApp');

                }

                let times = 0
                let readySend = false
                const nSecondsToWait = 15
                const checkSend = setInterval(async () => {
                    const color = await execTerminal("python3 /Users/armandorios/whatsAppClickSend/getColor.py")
                    times += 1

                    if (color.trim() === '(146, 149, 152, 255)') {
                        readySend = true
                        readyToSendContinue(readySend)
                        clearInterval(checkSend)

                    }

                    if (times === nSecondsToWait) {
                        readyToSendContinue(readySend)
                        clearInterval(checkSend)
                    }
                }, 1000)




            }
            /* let body_content = JSON.stringify(res.data.payload.parts[0].body.data);
            let data, buff, text;
            data = body_content;
            buff = new Buffer.from(data, "base64");
            mailBody = buff.toString(); */
            // display the result
            //console.log(mailBody);



        })

    });

    async function readyToSendContinue(ready) {
        if (ready) await execTerminal("python /Users/armandorios/whatsAppClickSend/click.py")
        else {
            //TODO: Check why not ready and send notification
        }
    }
}
