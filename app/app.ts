import { Tail } from 'tail';

const tail = new Tail('C:\\Dropbox\\auctionbot\\test.txt');

tail.on("line", function(data) {
  console.log(data);
});

tail.on("error", function(error) {
  console.log('ERROR: ', error);
});