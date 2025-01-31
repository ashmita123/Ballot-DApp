import React, { useEffect, useState } from 'react';
import useContract from '../hooks/useContract';
import proposalsData from '../proposals.json';

function BallotComponent() {
  const { contract, getChairperson, vote, register, reqWinner } = useContract();

  const [chairperson, setChairperson] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [addressToRegister, setAddressToRegister] = useState("");
  const [proposals] = useState(proposalsData);

  useEffect(() => {
    const loadData = async () => {
      if (!contract) return;
      try {
        const cp = await getChairperson();
        setChairperson(cp);
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Error in loadData:", error);
      }
    };
    loadData();
  }, [contract, getChairperson]);

  const handleVote = async (id) => {
    try {
      await vote(id);
      alert(`Voted for proposal ${id}!`);
    } catch (err) {
      console.error(err);
      alert("Vote failed");
    }
  };

  const handleRegister = async () => {
    if (!addressToRegister) return;
    try {
      await register(addressToRegister);
      alert("Registration successful for " + addressToRegister);
    } catch (err) {
      console.error(err);
      alert("Register failed");
    }
  };

  const handleWinner = async () => {
    try {
      const wIndexBN = await reqWinner();
      const wIndex = wIndexBN.toNumber();
      if (wIndex < proposals.length) {
        alert(`${proposals[wIndex].name} is the winner!`);
      } else {
        alert(`Winner index out of range: ${wIndex}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching winner");
    }
  };

  return (
    <div className="ballot-container">
      <h2>Ballot DApp</h2>
      <p>Chairperson: {chairperson}</p>
      <p>Current Account: {currentAccount}</p>

      <div className="proposals-row">
        {proposals.map((item) => (
          <div key={item.id} className="proposal-card">
            <h3>{item.name}</h3>
            <img src={item.picture} alt={item.name} style={{ width: '200px' }} />
            <button onClick={() => handleVote(item.id)}>Vote</button>
          </div>
        ))}
      </div>

      <br />
      <button onClick={handleWinner}>Declare Winner</button>

      <hr />
      <div>
        <h4>Register Voter</h4>
        <input
          type="text"
          placeholder="0x..."
          value={addressToRegister}
          onChange={e => setAddressToRegister(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}

export default BallotComponent;
