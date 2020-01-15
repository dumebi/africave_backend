// function calcTime(city, offset) {

//   // create Date object for current location
//   d = new Date();
//   // convert to msec
//   // add local time zone offset
//   // get UTC time in msec
//   utc = d.getTime() + (d.getTimezoneOffset() * 60000);
//   console.log('utc is: ', new Date(utc).toUTCString())
 
//   // create new Date object for different city
//   // using supplied offset
//   nd = new Date(utc + (3600000*offset));
 
//   // return time as a string
//   return "The local time in " + city + " is " + nd.toLocaleString();

// }

function getUTCTime(date, offset){
  var d = new Date(date);
  d.setMinutes(0,0,0)
  localTime = d.getTime();
  localOffset = d.getTimezoneOffset() * 60000;

  // obtain UTC time in msec
  utc = localTime + localOffset;
  // create new Date object for different city
  // using supplied offset
  var nd = new Date(utc + (3600000*offset));
  //nd = 3600000 + nd;
  utc = new Date(utc);
  var now = new Date()
  // return time as a string
  console.log(nd.toLocaleString())
  console.log(utc.toISOString())
  console.log(now.toLocaleString())
}

console.log(getUTCTime('01/14/2020','+1'))