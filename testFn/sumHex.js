function sumHex(hexStr){
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
};

function test(inpt){
  console.log("input = " + inpt);
  let out = sumHex(inpt);
  console.log("out = " + out);
  console.log("===");
}

test("B0");
test("01");
test("00");
test("B0B0B0");
test("A00112000068656c6c6f");
test("1"); // trigger error.