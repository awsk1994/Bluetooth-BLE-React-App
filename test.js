function sumHex(hexStr){
  console.log("hexStr = " + hexStr);

  if(hexStr == null){
    return "";
  };

  if(hexStr.length % 2 != 0){
    console.error("hexStr is not even length!");
    return null;
  }

  let sum = 0;
  for(let i = 0; i<hexStr.length; i += 2){
    let singleHex = hexStr[i] + hexStr[i+1];
    sum += parseInt(singleHex, 16);
  };

  let sumHexStr = sum.toString(16);
  if(sumHexStr.length == 0){
    return "00";
  } else if(sumHexStr.length == 1){
    return "0" + sumHexStr;
  } else {
    return sumHexStr.slice(-2);
  };
}

console.log(sumHex("B0"));
console.log("===");

console.log(sumHex("01"));
console.log("===");

console.log(sumHex("00"));
console.log("===");

console.log(sumHex("B0B0B0B0"));
console.log("===");

console.log(sumHex("1"));
console.log("===");
