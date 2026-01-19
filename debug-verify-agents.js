
import fetch from 'node-fetch';

async function checkAgents() {
  try {
    const response = await fetch('http://localhost:3001/api/agents');
    const agents = await response.json();
    
    console.log("Checking Agent: mohamad husen");
    const agent = agents.find(a => a.name.toLowerCase().includes('mohamad'));
    
    if (agent) {
      console.log("Name:", agent.name);
      console.log("Languages:", agent.languages);
      console.log("Experience:", agent.experience);
      console.log("Specialties:", agent.specialties);
    } else {
      console.log("Agent 'mohamad husen' not found.");
    }
  } catch (error) {
    console.error("Error fetching agents:", error);
  }
}

checkAgents();
