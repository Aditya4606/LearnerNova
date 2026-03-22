import http from 'http';

const reqData = JSON.stringify({ email: 'admin@learnova.com', password: 'Password@123' });

const optionsLogin = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': reqData.length
  }
};

const req = http.request(optionsLogin, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    let cookies = res.headers['set-cookie'];
    if(!cookies) return console.log('Login fail', data);
    
    const token = cookies[0].split(';')[0];
    const optionsRep = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/reporting',
      method: 'GET',
      headers: { 'Cookie': token }
    };
    
    const req2 = http.request(optionsRep, res2 => {
      let data2 = '';
      res2.on('data', d => data2 += d);
      res2.on('end', () => {
        console.log('Reporting Status:', res2.statusCode);
        console.log('Reporting Data:', data2.substring(0, 300));
      });
    });
    req2.end();
  });
});

req.write(reqData);
req.end();
