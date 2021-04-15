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
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
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
                console.log(`error: ${error.message}`);
                return reject(error.message);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return reject(stderr);
            }
            console.log(`stdout: ${stdout}`);
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
            //check if it's actual participant mail
            if (subject.indexOf('|')) {
                subject = subject.split('|')
                const name = subject[0]
                const extraNumbers = subject[1]
                const year = subject[2]
                const price = subject[3]
                const phone = subject[4]
                const lastName = subject[5]
                const number = subject[6]
                console.log(`name: ${name}, extraNumbers: ${extraNumbers},
                year: ${year}, price: ${price}, phone: ${phone}, lastName: ${lastName}, number: ${number}`)

                try {
                    await execTerminal('osascript openWhatsApp.scpt')   

                    open(`https://api.whatsapp.com/send/?phone=52${phone}&text=Hola%2C+Aparte+un+boleto+de+la+rifa
                    %21%21%0AMAZDA+CX-30+2021%21%21%0A%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%
                    94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%0A%5Cue110%2ABoleto%3A+%22+++
                    ${number}+++%22%2A+%28%22+++${extraNumbers}%28%27%2C+%27%29+++%22%29%0A%0A%2ANombre%3A
                    %2A+%22+++${name}%28%29+++%22+%22+++${lastName}%28%29+++%22%0A%0A%5Cue125COSTO+BOLETO+
                    %22+++${price}+++%22%0A%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94
                    %E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%0A%2ACLICK+AQU%C3%8D%3A%2A+lottosorteos.
                    com%2Fpagos+Para+ver+cuentas+de+pago%21%0A%0AEl+siguiente+paso+es+enviar+foto+del+c
                    omprobante+de+pago+por+aqu%C3%AD&app_absent=0`, {app: 'chrome'});
                    setTimeout(function () {
                        //execTerminal ("cliclick c:1401,790")
                    }, 10000 ) 
                } catch (error) {
                    throw ('Failed to open WhatsApp');
    
                }
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
}
