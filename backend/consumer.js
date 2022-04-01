
const { RelayConsumer } = require('@signalwire/node')
const { deflate } = require('zlib')
const helper = require('./helpers.js')
require('dotenv').config()


const projectId = process.env.SIGNALWIRE_PROJECT_KEY
const token = process.env.SIGNALWIRE_TOKEN
const ServerPort = process.env.PORT || 3080;

// Basic express boilerplate
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/api/calls", async (req, res) => {
  try {
    let calls = helper.fetchCalls()
    return res.json({ calls: calls });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

async function start(port) {
  app.listen(port, () => {
    console.log("Server listening at port", port);
  });
}

// Start the server
start(ServerPort);

// End basic express boilerplate


// Consumer code
const consumer = new RelayConsumer({
  project: projectId,
  token: token,
  contexts: ['translator'],
  ready: async ({ client }) => {
    console.log('Consumer Ready!')
    if (process.env.ENABLE_DEBUG) { 
      client.__logger.setLevel(client.__logger.levels.DEBUG)
    }
  },
  onIncomingCall: async (call) => {
    const { successful } = await call.answer()
    if (!successful) { return }
    await call.playTTS({ text: 'Leave a message and press the pound key to finish recording.' })

    let { url } = await recordCall(call).catch(console.error)
    console.log(url)
    let filename = `./${call.id}.wav`
    let translation = await helper.translateSpeech(url, filename)
    helper.deleteRecording(filename)
    await call.playTTS({ text: translation})
    let callData = {
      id: call.id,
      from: call.from,
      call_audio: url,
      translation_text: translation
    }

    helper.addToDatabase(callData)
    await call.hangup()
  }
})


const recordCall = async function(call) {
    const params = {
        stereo: false,
        format: 'wav',
        direction: 'both',
        initial_timeout: 0,
        end_silence_timeout: 0
      }
    const recordResult = await call.record(params)

    if (recordResult.successful) {
     return recordResult
    }
}

consumer.run()

process.on('SIGINT', function() {
  process.exit();
});

// End Consumer code