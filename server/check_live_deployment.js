async function checkLive() {
  const res = await fetch('https://senvo-outreach-demo.netlify.app/');
  const html = await res.text();
  const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  console.log('Main JS bundle path:', scriptMatch ? scriptMatch[1] : 'Not found');

  if (scriptMatch) {
    const jsUrl = `https://senvo-outreach-demo.netlify.app${scriptMatch[1]}`;
    console.log('Fetching JS bundle:', jsUrl);
    const jsRes = await fetch(jsUrl);
    console.log('JS HTTP Status:', jsRes.status);
    const jsText = await jsRes.text();
    console.log('JS bundle size:', jsText.length, 'bytes');

    // Check if new features exist in bundle
    const hasCvcModel = jsText.includes('Commercial Opportunity & Value Model') || jsText.includes('Commercial Opportunity Engine');
    const hasConservative = jsText.includes('Conservative Scenario') || jsText.includes('Cautious Baseline');
    console.log('Has Commercial Opportunity Model in production:', hasCvcModel);
    console.log('Has Conservative Scenario in production:', hasConservative);
  }

  // Check live API overview
  console.log('\n--- Checking Live API /api/overview ---');
  const t0 = performance.now();
  const apiRes = await fetch('https://senvo-outreach-demo.netlify.app/api/overview');
  const elapsed = (performance.now() - t0).toFixed(2);
  console.log('Live API Status:', apiRes.status, `in ${elapsed}ms`);
  const data = await apiRes.json();
  console.log('Live summary:', data.summary);
}

checkLive().catch(console.error);
