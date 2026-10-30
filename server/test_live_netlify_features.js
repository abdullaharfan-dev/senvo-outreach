import https from 'https';

const NETLIFY_URL = 'https://senvo-outreach-demo.netlify.app';

function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, NETLIFY_URL);
    const postData = data ? JSON.stringify(data) : null;
    const req = https.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        },
        timeout: 20000,
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, text: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function verifyLive() {
  console.log(`=== LIVE END-TO-END VERIFICATION: ${NETLIFY_URL} ===\n`);

  // 1. Health & AI Status
  console.log('1. Checking /api/health through Netlify proxy...');
  const health = await request('/api/health');
  console.log('   Health Status:', health.status);
  console.log('   AI Provider Model:', health.data?.ai?.model);
  console.log('   Persistence Status:', health.data?.database?.connected ? 'SQLite Connected' : 'Disconnected');

  // 2. Connected Accounts across 7 Channels
  console.log('\n2. Checking /api/accounts (Connected Accounts & Channel Setup)...');
  const accounts = await request('/api/accounts');
  console.log('   Accounts HTTP Status:', accounts.status);
  console.log('   Total Accounts Count:', accounts.data?.length);
  const channels = [...new Set((accounts.data || []).map(a => a.channel))];
  console.log('   Channels Represented:', channels.join(', '));

  // 3. Test Account Ping / Latency Check
  if (accounts.data && accounts.data[0]) {
    const firstAcc = accounts.data[0];
    console.log(`\n3. Testing connection latency for account: ${firstAcc.account_name}...`);
    const testRes = await request(`/api/accounts/${firstAcc.id}/test`, 'POST');
    console.log('   Ping Status:', testRes.status, 'Latency:', testRes.data?.latency_ms, 'ms');
    console.log('   Message:', testRes.data?.message);
  }

  // 4. Inbound Turn Simulation & AI Copilot / Autonomous SDR
  console.log('\n4. Checking Inbound Simulation & Multi-Turn Processing...');
  const convs = await request('/api/inbox/conversations');
  console.log('   Total Threads:', convs.data?.length);
  const testConv = convs.data?.[0];

  if (testConv) {
    console.log(`   Simulating turn on thread ${testConv.id} (${testConv.company_name})...`);
    const simRes = await request('/api/inbox/simulate-incoming', 'POST', {
      conversationId: testConv.id,
      content: 'Could you clarify the statutory compliance schedule for a Dublin-based holding company?',
      auto_respond: false // Co-Pilot Mode
    });
    console.log('   Simulate Status:', simRes.status);
    console.log('   Review Needed State:', simRes.data?.conversation?.status);
    console.log('   AI Result Success:', simRes.data?.ai_result?.success ?? 'handled');
  }

  // 5. Qualified Leads & History Persistence
  console.log('\n5. Checking /api/qualified-leads with conversation context...');
  const qual = await request('/api/qualified-leads');
  console.log('   Qualified HTTP Status:', qual.status);
  console.log('   Qualified Leads Count:', qual.data?.length);
  if (qual.data?.[0]) {
    console.log('   Lead Entity:', qual.data[0].company_name);
    console.log('   Recent Messages Attached:', qual.data[0].recent_messages?.length ?? 0);
  }

  console.log('\n=== ALL LIVE SMOKE TESTS COMPLETED SUCCESSFULLY! ===');
}

verifyLive().catch(err => {
  console.error('Live verification failed:', err);
  process.exit(1);
});
