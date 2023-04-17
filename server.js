
const http = require('http');
const url = require('url');
const fs = require('fs');

// Incoming request for HTTP
http.createServer((request, response) => {
    let addr = request.url, // allows to get the url from the parameters
    q = url.parse(addr, true) // stored the parsed URL from user
    filePath = ''; // here will be the filpath stored with an if-else statement

    // This function takes 3 arguments, 1. file name where info will be added 2. the new information
    // to be added and 3. an error-handling function
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' +
    new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } 
        else {
            console.log('Added to log.');
        }
    });

    // If-else statement to store the information on the filePath var declared earlier
    if (q.pathname.includes('documentation')) //exact pathname of the URL 
    {
    filePath = (__dirname + '/documentation.html');
    }
    else {
    filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, { 'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });

}).listen(8080);
console.log('My test server is running on Port 2020.');