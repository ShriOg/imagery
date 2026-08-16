import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBakeOff() {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  const match = envFile.match(/NIM_API_KEY=(.+)/);
  if (!match || match[1] === 'your-nvidia-nim-key-here') {
    console.error("❌ Please set NIM_API_KEY in .env.local first.");
    process.exit(1);
  }
  
  const apiKey = match[1].trim();
  const baseUrl = 'https://integrate.api.nvidia.com/v1';

  console.log("🔍 Discovering available models...");
  
  const res = await fetch(`${baseUrl}/models`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  
  if (!res.ok) {
    console.error("Failed to fetch models", await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const models = data.data.map(m => m.id);
  
  console.log(`Found ${models.length} models. Relevant candidates:`);
  
  const candidates = models.filter(m => m.includes('llama-3') || m.includes('nemotron') || m.includes('mixtral'));
  console.log(candidates);

  console.log("\n🧪 Running structured output tests (latency & compliance)...");
  
  const testSchema = {
    name: "test_schema",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  };

  const results = [];

  for (const model of candidates.slice(0, 3)) { // test top 3
    console.log(`Testing ${model}...`);
    const start = Date.now();
    try {
      const completion = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: "Say hello and return true" }],
          response_format: { type: "json_schema", json_schema: testSchema },
          max_tokens: 50
        })
      });
      
      const latency = Date.now() - start;
      if (completion.ok) {
        const out = await completion.json();
        results.push({ model, latency, success: true });
        console.log(`  ✅ Success (${latency}ms)`);
      } else {
        console.log(`  ❌ Failed (${latency}ms)`);
      }
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }

  if (results.length > 0) {
    results.sort((a, b) => a.latency - b.latency);
    const winner = results[0].model;
    console.log(`\n🏆 Winner: ${winner}`);
    console.log(`Update NIM_MODEL=${winner} in .env.local`);
  }
}

runBakeOff();
