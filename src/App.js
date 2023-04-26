import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
export default App;

const API_BASE_URL = '<YOUR_API_BASE_URL>';

function App() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [votedOption, setVotedOption] = useState(null);

  useEffect(() => {
    getPolls();
  }, []);

  async function getPolls() {
    const response = await axios.get(`${API_BASE_URL}/polls`);
    setPolls(response.data);
  }

  async function createPoll(e) {
    e.preventDefault();
    await axios.post(`${API_BASE_URL}/polls`, { question, options: options.split(',') });
    setQuestion('');
    setOptions('');
    getPolls();
  }

  async function vote(e) {
    e.preventDefault();
    await axios.put(`${API_BASE_URL}/polls/${selectedPoll.id}/vote`, { selectedOption: votedOption });
    getPolls();
    setSelectedPoll(null);
    setVotedOption(null);
  }

  return (
    <div className="App">
      <h1>Poll App</h1>

      <h2>Create a new poll</h2>
      <form onSubmit={createPoll}>
        <label>
          Question:
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <br />
        <label>
          Options (separated by commas):
          <input type="text" value={options} onChange={(e) => setOptions(e.target.value)} />
        </label>
        <br />
        <button type="submit">Create Poll</button>
      </form>

      <h2>All Polls</h2>
      <ul className="polls">
        {polls.map((poll) => (
          <li key={poll.id} onClick={() => setSelectedPoll(poll)}>
            {poll.question}
          </li>
        ))}
      </ul>

      {selectedPoll && (
        <div>
          <h2>{selectedPoll.question}</h2>
          <form onSubmit={vote}>
            {selectedPoll.options.map((option, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="vote"
                  value={index}
                  checked={votedOption === index}
                  onChange={(e) => setVotedOption(Number(e.target.value))}
                />
                {option}
              </label>
            ))}
            <br />
            <button type="submit">Vote</button>
          </form>
        </div>
      )}
    </div>
  );
}

        

