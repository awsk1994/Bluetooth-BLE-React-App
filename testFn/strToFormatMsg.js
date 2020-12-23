
function strToFormatMsg(msgStr){
  console.log("strToFormatMsg");
  console.log(msgStr);

  if(msgStr == null){
    return "";
  };

  if(msgStr.length % 2 != 0){
    console.error("ERR: msgStr is not even length!");
    return null;
  };

  if(msgStr.length < 10){
    console.error("ERR: msgStr length < 10.");
    return null;
  }

  msg = {
    "header": msgStr[0] + msgStr[1],
    "pAttri": msgStr[2] + msgStr[3],
    "sAttri1": msgStr[4] + msgStr[5],
    "sAttri2": msgStr[6] + msgStr[7],
    "content": null,
    "CRC": msgStr.slice(-2)
  };

  let contentStr = "";
  for(let i=8; i<msgStr.length-2; i++){
    contentStr += msgStr[i];
  };
  msg.content = contentStr;

  return msg;
};

function test(inpt){
  console.log("input = " + inpt);
  let out = strToFormatMsg(inpt);
  console.log(out);
  console.log("====");
};

test("A00112000068656c6c6f");
test("B00150030105");


