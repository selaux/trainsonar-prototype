var http = require('http');
const csv = require('csv-streamify')
var lastRangeStart = 0;

function downloadNew() {
  var options = {
    host: 'download.odcdn.de',
    path: '/zugsonar/zugsonar.20160416.tsv',
    headers: {
      range: `bytes=${lastRangeStart}-`
    }
  }

  console.log('Request started', options);
  var req = http.request(options, function (res) {
    var TSV = csv({ objectMode: true, delimiter: '\t' })

    TSV.on('data', function (line) {
      console.log(line);
    });

    if (Math.floor(res.statusCode / 100) != 2) {
      console.log('No new data');
      setTimeout(downloadNew, 30000);
      return;
    }

    res.pipe(TSV);
    res.on('data', (data) => {
      lastRangeStart += data.length;
    });
    res.on('end', () => {
      console.log(`Response ended.`);
      setTimeout(downloadNew, 30000);
    });
  });

  req.on('error', console.log)
  req.end();
}

downloadNew();
