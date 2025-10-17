import axios from 'axios';

async function testAPI() {
  try {
    console.log('Making request to CSE API...');
    const response = await axios.post('https://www.cse.lk/api/tradeSummary', {}, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });
    
    const data = response.data.reqTradeSummery || [];
    console.log('Total stocks:', data.length);
    
    // Find our tracked symbols
    const trackedSymbols = ['JKH', 'COMB', 'HNB', 'DIAL', 'SAMP', 'LFIN', 'NTB', 'CINS', 'BIL', 'VONE', 'LOLC'];
    const found = data.filter((item: any) => {
      const symbol = item.symbol;
      return trackedSymbols.some(s => symbol && symbol.startsWith(s));
    });
    
    console.log('\nFound tracked stocks:', found.length);
    console.log('\nSample tracked stock data:');
    if (found.length > 0) {
      console.log(JSON.stringify(found[0], null, 2));
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testAPI();
