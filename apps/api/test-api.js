async function testAPI() {
  const BASE_URL = "http://localhost:3000";

  console.log("🧪 Starting Comprehensive API Tests...\n");
  console.log("=".repeat(60));

  // Test 1: Health Check
  console.log("\n📋 Test 1: Health Check");
  console.log("-".repeat(60));
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    console.log("✅ Status:", data.status);
    console.log("⏱️  Uptime:", Math.round(data.uptime), "seconds");
  } catch (err) {
    console.log("❌ Failed:", err.message);
  }

  // Test 2: List Agents
  console.log("\n📋 Test 2: List Available Agents");
  console.log("-".repeat(60));
  try {
    const res = await fetch(`${BASE_URL}/api/agents/agents`);
    const data = await res.json();
    console.log("✅ Found", data.agents.length, "agents:");
    data.agents.forEach((a) => {
      console.log(`   🤖 ${a.name} (${a.type})`);
      console.log(`      └─ ${a.description}`);
      console.log(`      └─ Tools: ${a.tools.join(", ")}`);
    });
  } catch (err) {
    console.log("❌ Failed:", err.message);
  }

  // Test 3: Order Query with Full Response
  console.log(
    '\n📋 Test 3: Order Query - "What is the status of order ORD-001?"'
  );
  console.log("-".repeat(60));
  try {
    const res = await fetch(`${BASE_URL}/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        message: "What is the status of order ORD-001?",
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let agent = "";
    let reasoning = [];
    let fullText = "";
    let conversationId = "";

    console.log("📡 Streaming response:");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          if (data.type === "conversation_id") {
            conversationId = data.data;
            console.log("   💬 Conversation ID:", conversationId);
          } else if (data.type === "agent") {
            agent = data.data;
            console.log("   🤖 Agent Selected:", agent);
          } else if (data.type === "reasoning") {
            reasoning.push(data.data);
            console.log("   🧠 Reasoning:", data.data);
          } else if (data.type === "text") {
            fullText += data.data;
            process.stdout.write(data.data);
          } else if (data.type === "done") {
            console.log("\n   ✅ Response Complete");
          }
        } catch (e) {}
      }
    }

    console.log("\n📊 Summary:");
    console.log("   Agent:", agent || "❌ Not detected");
    console.log("   Reasoning steps:", reasoning.length);
    console.log("   Response length:", fullText.length, "characters");
    console.log(
      "   Order mentioned:",
      fullText.includes("ORD-001") ? "✅ Yes" : "❌ No"
    );
  } catch (err) {
    console.log("❌ Failed:", err.message);
  }

  // Test 4: Billing Query
  console.log('\n📋 Test 4: Billing Query - "Check invoice INV-001"');
  console.log("-".repeat(60));
  try {
    const res = await fetch(`${BASE_URL}/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        message: "Check invoice INV-001",
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let agent = "";
    let fullText = "";

    console.log("📡 Streaming response:");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          if (data.type === "agent") {
            agent = data.data;
            console.log("   🤖 Agent Selected:", agent);
          } else if (data.type === "reasoning") {
            console.log("   🧠 Reasoning:", data.data);
          } else if (data.type === "text") {
            fullText += data.data;
            process.stdout.write(data.data);
          } else if (data.type === "done") {
            console.log("\n   ✅ Response Complete");
          }
        } catch (e) {}
      }
    }

    console.log("\n📊 Summary:");
    console.log("   Agent:", agent || "❌ Not detected");
    console.log(
      "   Invoice mentioned:",
      fullText.includes("INV-001") ? "✅ Yes" : "❌ No"
    );
  } catch (err) {
    console.log("❌ Failed:", err.message);
  }

  // Test 5: Support Query
  console.log('\n📋 Test 5: Support Query - "How do I reset my password?"');
  console.log("-".repeat(60));
  try {
    const res = await fetch(`${BASE_URL}/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        message: "How do I reset my password?",
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let agent = "";
    let fullText = "";

    console.log("📡 Streaming response:");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          if (data.type === "agent") {
            agent = data.data;
            console.log("   🤖 Agent Selected:", agent);
          } else if (data.type === "reasoning") {
            console.log("   🧠 Reasoning:", data.data);
          } else if (data.type === "text") {
            fullText += data.data;
            process.stdout.write(data.data);
          } else if (data.type === "done") {
            console.log("\n   ✅ Response Complete");
          }
        } catch (e) {}
      }
    }

    console.log("\n📊 Summary:");
    console.log("   Agent:", agent || "❌ Not detected");
    console.log(
      "   Response helpful:",
      fullText.length > 50 ? "✅ Yes" : "❌ Too short"
    );
  } catch (err) {
    console.log("❌ Failed:", err.message);
  }

  // Test 6: Refund Query (Tool Usage)
  console.log('\n📋 Test 6: Refund Query - "Check my refund REF-001"');
  console.log("-".repeat(60));
  try {
    const res = await fetch(`${BASE_URL}/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        message: "Check my refund REF-001",
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let agent = "";
    let toolsUsed = [];
    let fullText = "";

    console.log("📡 Streaming response:");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          if (data.type === "agent") {
            agent = data.data;
            console.log("   🤖 Agent Selected:", agent);
          } else if (data.type === "reasoning") {
            console.log("   🧠 Reasoning:", data.data);
            if (
              data.data.includes("tool") ||
              data.data.includes("Checking") ||
              data.data.includes("Fetching")
            ) {
              toolsUsed.push(data.data);
            }
          } else if (data.type === "text") {
            fullText += data.data;
            process.stdout.write(data.data);
          } else if (data.type === "done") {
            console.log("\n   ✅ Response Complete");
          }
        } catch (e) {}
      }
    }

    console.log("\n📊 Summary:");
    console.log("   Agent:", agent);
    console.log("   Tools used:", toolsUsed.length > 0 ? "✅ Yes" : "❌ No");
    console.log(
      "   Refund status mentioned:",
      fullText.includes("completed") || fullText.includes("processed")
        ? "✅ Yes"
        : "❌ No"
    );
  } catch (err) {
    console.log("❌ Failed:", err.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ All Tests Completed!\n");
}

testAPI();
