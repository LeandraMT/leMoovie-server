
const http = require('http');
//const url = require('url');

//incoming request for HTTP
http.createServer((request, response) => 
    {response.writeHead(200, {'Content-Type': 'Text/plain'}); 
    response.end('Hello Node!\n');
});


//incoming request data for url
url.createServer((request, response) => {
    let addr = request.url,
    q = url.parse(addr, true),
    filePath = '';

    //adding the request for the log.txt
    fs.appendFile('log.txt', 'URL:' + addr + '\nTimestamp: ' + new Date() +
    '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    //adding file-system module to log the request url
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
    
}).listen(8080);

console.log('My first Node test server is running on Port 8080');