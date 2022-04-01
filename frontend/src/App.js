import React, { useEffect, useState } from "react"
import { fetchCallRecords } from './api-helper.js'
import './styles.css'


const initialList = [{id: 1}]

const App = () => {
  const [value, setValue] = React.useState('');
  const [list, setList] = React.useState(initialList);

  useEffect(() => {
    fetchCallRecords().then(response => setList(response))
  }, [])


  return (
    <div class="App">
        <div class="title">
            <h2>Translated Call Records</h2>
            <button onClick={() => fetchCallRecords().then(response => setList(response))}>
                Refresh
             </button>
        </div>
        
        <div class="calls">
            <ul>
                {list.map(item => (
                <div class="card" key={item.id}>
                    <div class="container">
                        <p><b>From:</b> {item.from}</p>
                        <p><b>Text:</b> {item.translation_text}</p>
                        <audio src={item.call_audio} controls/>
                    </div>
                </div>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default App;

