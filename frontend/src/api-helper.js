import axios from "axios"

function fetchBackendURL() {
    return process.env.API_URL || "http://localhost:3080"
}

async function fetchCallRecords(){
    let response = await axios.get(fetchBackendURL() + "/api/calls")
    let call_array = []
    for (const [key, value] of Object.entries(response.data.calls)) {
        call_array.push(value)
      }
    console.log(call_array)
 
    return call_array
}

export {
    fetchCallRecords
}