import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import BallotArtifact from '../contracts/Ballot.json'; 

const useContract = () => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const _provider = new ethers.providers.Web3Provider(window.ethereum);
          const _signer = _provider.getSigner();
          setProvider(_provider);
          setSigner(_signer);

          const ballot = new ethers.Contract(contractAddress, BallotArtifact.abi, _signer);
          setContract(ballot);
          console.log("Ballot contract loaded:", ballot.address);
        } else {
          // fallback
          const fallbackProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
          setProvider(fallbackProvider);
          const ballot = new ethers.Contract(contractAddress, BallotArtifact.abi, fallbackProvider);
          setContract(ballot);
          console.warn("No MetaMask found; using fallback provider.");
        }
      } catch (err) {
        console.error("Error loading contract:", err);
      }
    };
    init();
  }, [contractAddress]);

  const getChairperson = useCallback(async () => {
    if (!contract) return null;
    try {
      return await contract.getChairperson();
    } catch (err) {
      console.error("getChairperson error:", err);
      throw err;
    }
  }, [contract]);

  const vote = useCallback(async (proposalId) => {
    if (!contract) return;
    const tx = await contract.vote(proposalId);
    await tx.wait();
  }, [contract]);

  const register = useCallback(async (addr) => {
    if (!contract) return;
    const tx = await contract.register(addr);
    await tx.wait();
  }, [contract]);

  const reqWinner = useCallback(async () => {
    if (!contract) return;
    return await contract.reqWinner();
  }, [contract]);

  return {
    contract, provider, signer,
    getChairperson, vote, register, reqWinner
  };
};

export default useContract;
