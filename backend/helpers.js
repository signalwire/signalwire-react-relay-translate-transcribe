const speech = require('@google-cloud/speech')
const {Translate} = require('@google-cloud/translate').v2;
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const request = require('request');
const fs = require('fs');

var db = new JsonDB(new Config("callDatabase", true, false, '/'))

function addToDatabase(callData) {
    db.push(`/calls/${callData.id}`, callData)
  }

function fetchCalls() {
    let calls = db.getData("/calls")
    return calls
}

async function translateSpeech(url, filename) {
    const client = new speech.SpeechClient();

    await downloadFile(url, filename)

    const audio = {
        content: fs.readFileSync(filename).toString('base64'),
      };

    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 8000,
        languageCode: 'en-US',
        alternativeLanguageCodes: ['es-ES', 'en-US', 'ja-JP']
    };
    const request = {
        audio: audio,
        config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    console.log(`Transcription: ${transcription}`);
    return translateText(transcription)
}

async function translateText(text) {
    let target = 'en'
    const translate = new Translate();
    let [translations] = await translate.translate(text, target);
    translations = Array.isArray(translations) ? translations : [translations];
    console.log('Translations:');
    translations.forEach((translation, i) => {
      console.log(`${text[i]} => (${target}) ${translation}`);
    });
    return translations[0]
  }

  

const downloadFile = (uri, filename) => new Promise((resolve, reject) => {
    request.head(uri, (err, res, body) => {
        console.log('\n', 'Downloading File');
        request(uri)
            .on('error', error => {
                res.status(502).send(error.message)
                reject(error)
            })
            .pipe(fs.createWriteStream(filename))
            .on('finish', resolve);
    });
})

function deleteRecording(filename) {
    fs.unlinkSync(filename);
}

module.exports = {
    addToDatabase,
    fetchCalls,
    translateSpeech,
    translateText,
    downloadFile,
    deleteRecording
}