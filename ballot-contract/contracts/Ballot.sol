// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ballot {

    struct Voter {                     
        uint weight;
        bool voted;
        uint vote;
    }
    struct Proposal {                  
        uint voteCount;
    }

    address chairperson;
    mapping(address => Voter) voters;  
    Proposal[] proposals;
   
    modifier onlyChair() 
     {require(msg.sender == chairperson);
      _;
     }
     
     modifier validVoter()
    {
        require(voters[msg.sender].weight > 0, "Not a Registered Voter");
        _;
    }

    constructor (uint numProposals)  {
        chairperson = msg.sender;
        voters[chairperson].weight = 2;
        for (uint8 prop = 0; prop < numProposals; prop ++)
            proposals.push(Proposal(0));
        
    }
    
    function getChairperson() public view returns (address) {
        return chairperson;
    }

     
    function register(address voter) public {
        
        voters[voter].weight = 1;
        voters[voter].voted = false;
    }

   
    function vote(uint toProposal) public  validVoter{
      
        Voter memory sender = voters[msg.sender];
        
        require (!sender.voted); 
        require (toProposal < proposals.length); 
        
        sender.voted = true;
        sender.vote = toProposal;   
        proposals[toProposal].voteCount += sender.weight;
    }

    function reqWinner() public view returns (uint winningProposal) {
       
        uint winningVoteCount = 0;
        for (uint prop = 0; prop < proposals.length; prop++) 
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                winningProposal = prop;
            }
       assert(winningVoteCount>=3);
    }
}