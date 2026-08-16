const fs = require('fs');

async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/ai/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Write a text heyyy... in canvas",
        canvas: { background: { type: "solid", color: "#1a1a2e" }, width: 800, height: 1100, elements: [] },
        history: []
      })
    });
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

run();
