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
    
    console.log('Response status:', response.status);
    console.log('Response data type:', typeof response.data);
    console.log('Response data is array:', Array.isArray(response.data));
    console.log('Response data keys:', Object.keys(response.data || {}));
    console.log('\nFull response data (first 2000 chars):');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 2000));
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data).substring(0, 500));
    }
  }
}

testAPI();
