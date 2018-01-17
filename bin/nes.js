#!/usr/bin/env node
const program = require('commander');

program
  .version('1.0.0')
  .option('-h, --host [value]', 'Host')
  .option('-i, --index [value]', 'Index')
  .option('-b --body [value]', 'Body')
  .parse(process.argv);

if (!program.host) {
  console.error('Invalid host');
  process.exit(1);
}
if (!program.index) {
  console.error('Invalid index');
  process.exit(1);
}
const HOST = program.host;
const INDEX = program.index;

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: HOST,
});

let totalHits = 0;

// first we do a search, and specify a scroll timeout
let o = {
  index: INDEX,
  scroll: '30s', // keep the search results "scrollable" for 30 seconds
};
if (program.body) o.body = program.body;
client.search(o, function getMoreUntilDone(error, response) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  // collect the title from each response
  response.hits.hits.forEach(function (hit) {
    console.log(JSON.stringify(hit._source));
    totalHits++;
  });

  if (response.hits.total > totalHits) {
    // ask elasticsearch for the next set of hits from this search
    client.scroll({
      scrollId: response._scroll_id,
      scroll: '30s'
    }, getMoreUntilDone);
  } else {
    r.end();
  }
});
