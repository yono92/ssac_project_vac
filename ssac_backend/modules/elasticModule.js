const elasticsearch = require("elasticsearch");

const client = new elasticsearch.Client({
  host: "http://localhost:9200",
});

client.ping({ requestTimeout: 1000 }, function (error) {
  if (error) return console.log(error);

  console.log("elasticsearch connect success!!");
});

module.exports = client;
