import React, { Component } from 'react';
import { TextInput, Alert, StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer/'

function strToBinary(str) {
  if(str == null){
    return "";
  }
  str = str.toString();
  const result = [];
  const list = str.split("");
  for (let i = 0; i < list.length; i++) {
    const str = list[i].charCodeAt().toString(2);
    result.push(str);
  }
  return result.join("");
}

function strToHex(str){
  if(str == null){
    return "";
  }
  return Buffer.from(str, 'base64').toString('hex');
}

function strToUTF8(str){
  if(str == null){
    return "";
  }
  str = (new Buffer(str, 'base64')).toString('utf8');
  return str;
}

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

function hexToFormatMsgJSX(msgStr){
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

function strToFormatMsgJSX(inpt){
  let strInpt = strToHex(inpt);
  let msg = hexToFormatMsgJSX(strInpt);

  if(msg == null){
    return <Text>ERR</Text>;
  }
  
  return (
    <View>
      <Text>Header: {msg.header}</Text>
      <Text>pAttri: {msg.pAttri}</Text>
      <Text>sAttri1: {msg.sAttri1}</Text>
      <Text>sAttri2: {msg.sAttri2}</Text>
      <Text>content: {msg.content}</Text>
      <Text>CRC: {msg.CRC}</Text>
    </View>
  );
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      status: null,
      scanning: false,
      devices: [],
      services: [],
      characteristics: [],
      characteristic: null,
      readValue: null,
      writeValue: null,
      rawOp: false,
      CRC: "",
      vMsgHeader: "00",
      vMsgPAttri: "00",
      vMsgSAttri1: "00",
      vMsgSAttri2: "00",
      vMsgContent: "00",
      vMsgCRC: "00"
    };
    const manager = this.bleManager = new BleManager();
  };

  componentWillUnmount() {
    console.log("ComponentUnMount");  // TODO: Getting error. Unable to detect when bleManager is undefined...
    if(this.bleManager != null || typeof this.bleManager != "undefined"){
      this.bleManager.destroy();
    }
  }

  scanDevices = async () => {
    console.log("Scanning Devices");
    this.setState({scanning: true});
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.onScannedDevice);
  };

  onScannedDevice = (error, device) => {
    if (error) {
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      ToastAndroid.show("ERROR: " + error, ToastAndroid.SHORT);
      return
    }
    
    if (this.state.devices.findIndex(item => item.id === device.id) < 0) {
      this.setState({
        devices: [...this.state.devices, device]
      })
    };
  };

  stopScan = () => {
    this.bleManager.stopDeviceScan()
    this.setState({ scanning: false })
  };

  debugState = () => {
    console.log(this.state);
  }

  reset = () => {
    this.setState({
      devices: [],
      services: [],
      characteristics: [],
      characteristic: null,
      readValue: null,
      writeValue: null
    });
  }

  connectDevice = async (device) => {
    try{
      this.stopScan() // Stop Scanning
      ToastAndroid.show("Connecting to Device...", ToastAndroid.SHORT);
      console.group("Connecting to Device.");
      await device.connect();
      console.log('Connected to Device：', device.id)
      let serviceAndChar = await device.discoverAllServicesAndCharacteristics();
      console.log('Getting services and characteristics...');
      console.log(serviceAndChar);
  
      Alert.alert('Connected to Device', null, [
        { text: 'Cancel' },
        { text: "Enter", onPress: () => this.onPressDevice(device)}
      ]);
    } catch(err){
      console.log("connectDevice | ERROR");
      console.log(err);
      ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    }
  };

  onPressDevice = async (device) => {
    let services = await device.services();
    this.setState({services});
  };

  onPressService = async(service) => {
    let characteristics = await service.characteristics()
    this.setState({characteristics});
  };

  onPressCharacteristic = async(characteristic) => {
    console.log("onPressCharacteristic")
    this.setState({characteristic});
  }

  onPressReadOp = async() => {
    console.log("onPressReadOp");
    try{
      let char = await this.state.characteristic.read();
      console.log("Characteristics Read Value: " + char.value);
      ToastAndroid.show("Characteristics Read Value: " + char.value, ToastAndroid.SHORT);
      this.setState({readValue: char.value});
    } catch(err){
      console.log("ERROR:");
      console.log(err);
      ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    }
  };

  onPressWriteHexOp = (writeVal) => {
    if (!writeVal) {
      Alert.alert('请输入要写入的特征值')
    }
    const str = Buffer.from(writeVal, 'hex').toString('base64')
    this.onPressWriteOp(str);
  }
  
  onPressWriteStrOp = (writeVal) => {
    if (!writeVal) {
      Alert.alert('请输入要写入的特征值')
    }
    const str = Buffer.from(writeVal, 'utf8').toString('base64');
    this.onPressWriteOp(str);
  };

  onPressWriteOp = (msg) => {
    ToastAndroid.show('开始写入特征值：' + msg, ToastAndroid.SHORT);

    this.state.characteristic.writeWithResponse(msg)
      .then(() => {
        Alert.alert('成功写入特征值', '现在点击读取特征值看看吧...')
      })
      .catch(err => {
        console.log('写入特征值出错：', err)
        ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
      })
  };

  onPressSampleWriteA = () => {
    this.onPressWriteHexOp("A00112000068656c6c6fc7");
  };

  onPressWriteVMsg = () => {
    const hexStr = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + this.state.vMsgContent;

    const CRCHex = sumHex(hexStr);
    console.log("write VMsg | " + (hexStr + CRCHex));
    this.onPressWriteHexOp(hexStr + CRCHex);
  }
  
  onPressCalcCRC = (writeVal) => {
    let CRC = sumHex(writeVal);
    if(CRC == null){
      return "00";
    } 
    console.log("onPressCalcCRC | CRC = " + CRC);
    this.setState({"CRC": CRC});
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Text>BLE</Text>
          <Text>Scanning: {this.state.scanning.toString()}</Text>
          <View style={styles.b1}>
            <Button title="Scan Devices" onPress={this.scanDevices}/>
          </View>
          <View style={styles.b1}>
            <Button title="Stop Scan" onPress={this.stopScan}/>
          </View>
          <View style={styles.b1}>
            <Button title="Debug State" onPress={this.debugState}/>
          </View>
          <View style={styles.b1}>
            <Button title="Reset" onPress={this.reset}/>
          </View>

          <Text style={styles.h1}>DEVICES:</Text>
          {this.state.scanning && <View>
            <FlatList 
              keyExtractor={(item, index) => index.toString()}
              data={this.state.devices}
              renderItem={itemData => (
              <TouchableOpacity onPress = {() => {this.connectDevice(itemData.item)}}>
                <View style={styles.card}>
                  <Text>{itemData.item.id}</Text>
                  <Text>({itemData.item.name || itemData.item.localName})</Text>
                  <Text>(serviceUUIDs = {itemData.item.serviceUUIDs})</Text>
                  {/* <Text>(isConnectable = {itemData.item.isConnectable ? })</Text> */}
                </View>
              </TouchableOpacity>
              )}
            />
          </View>}

          <Text style={styles.h1}>SERVICES:</Text>
          {this.state.services && <View>
            <FlatList 
              keyExtractor={(item, index) => index.toString()}
              data={this.state.services}
              renderItem={itemData => (
              <TouchableOpacity onPress = {() => {this.onPressService(itemData.item)}}>
                <View style={styles.card}>
                  <Text>{`UUID: ${itemData.item.uuid}`}</Text>
                </View>
              </TouchableOpacity>
              )}
            />
          </View>}

          <Text style={styles.h1}>CHARACTERISTICS:</Text>
          {this.state.characteristics && <View>
            <FlatList 
              keyExtractor={(item, index) => index.toString()}
              data={this.state.characteristics}
              renderItem={itemData => (
              <TouchableOpacity onPress = {() => {this.onPressCharacteristic(itemData.item)}}>
                <View style={styles.card}>
                  <Text>{`UUID: ${itemData.item.uuid}`}</Text>
                  <Text>{`isReadable: ${itemData.item.isReadable}`}</Text>
                  <Text>{`isWritableWithResponse: ${itemData.item.isWritableWithResponse}`}</Text>
                  <Text>{`isWritableWithoutResponse: ${itemData.item.isWritableWithoutResponse}`}</Text>
                </View>
              </TouchableOpacity>
              )}
            />
          </View>}

          <Text style={styles.h1}>OPERATIONS. Raw={this.state.rawOp.toString()}</Text>
          {this.state.characteristic && this.state.rawOp && <View>
            <Text style={styles.h2}>Write Value:</Text>
            <TextInput
                style={styles.input}
                placeholder="请输入特征值"
                value={this.state.writeValue}
                onChangeText={v => this.setState({ writeValue: v })}
              />
            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={() => this.onPressWriteHexOp(this.state.writeValue)} title="写入特征值 (hex format, RAW)"/>
            </View>

            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={() => this.onPressWriteStrOp(this.state.writeValue)} title="写入特征值 (string format, RAW)"/>
            </View>

            <Text style={styles.h2}>CRC Value:</Text>
            <Text>{this.state.CRC}</Text>
            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={() => this.onPressCalcCRC(this.state.writeValue)} title="Calculate CRC"/>
            </View>

            <Text style={styles.h2}>Read Value:</Text>
            <View style={styles.b1}>
              <Button type="primary" style={{ marginTop: 8 }} onPress={this.onPressReadOp} title="读取特征值"/>
            </View>
            <Text>{`二进制: ${strToBinary(this.state.readValue)}`}</Text>
            <Text>{`十六进制: ${strToHex(this.state.readValue)}`}</Text>
            <Text>{`UTF8: ${strToUTF8(this.state.readValue)}`}</Text>
          </View>}
          {this.state.characteristic && !this.state.rawOp && <View>
            <Text style={styles.h2}>Write Value:</Text>
            
            <Text style={styles.h2}>Build your own:</Text>
            <Text>帆头</Text>
            <TextInput
                style={styles.input}
                placeholder="帆头｜A0=发送，B0=答应"
                value={this.state.vMsgHeader}
                onChangeText={v => this.setState({ vMsgHeader: v })}
              />
            
            <Text>主属性</Text>
            <TextInput
                style={styles.input}
                placeholder="主属性: 01-05"
                value={this.state.vMsgPAttri}
                onChangeText={v => this.setState({ vMsgPAttri: v })}
              />

            <Text>次属性1</Text>
            <TextInput
                style={styles.input}
                placeholder="次属性1"
                value={this.state.vMsgSAttri1}
                onChangeText={v => this.setState({ vMsgSAttri1: v })}
              />

            <Text>次属性2</Text>
            <TextInput
                style={styles.input}
                placeholder="次属性1"
                value={this.state.vMsgSAttri2}
                onChangeText={v => this.setState({ vMsgSAttri2: v })}
              />
            
            <Text>内容</Text>
            <TextInput
                style={styles.input}
                placeholder="内容"
                value={this.state.vMsgContent}
                onChangeText={v => this.setState({ vMsgContent: v })}
              />

            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={this.onPressWriteVMsg} title="Send Vultant Msg"/>
            </View>
            <View style={styles.b1}>
              <Button type="primary" onPress={this.onPressSampleWriteA} title="Write sample msg A"/>
            </View>

            <Text style={styles.h2}>Read Message:</Text>
            <View style={styles.b1}>
              <Button type="primary" style={{ marginTop: 8 }} onPress={this.onPressReadOp} title="读取特征值"/>
            </View>
            {strToFormatMsgJSX(this.state.readValue)}
            <Text>{`十六进制: ${strToHex(this.state.readValue)}`}</Text>
          </View>}
          
          <Button color="#000000" title="Toggle Raw" onPress={() => this.setState({"rawOp": !this.state.rawOp})}/>
        </ScrollView>

      </View>
    );
  }
};

const styles = StyleSheet.create({
  card: {
    marginTop: 5,
    marginBottom: 5,
    borderColor: 'black',
    borderWidth: 1
  },
  input: {
    height: 40
  },
  h1: {
    fontSize: 20,
    fontWeight: "bold"
  },
  h2: {
    fontSize: 15,
    fontWeight: "bold"
  },
  b1: {
    margin: 10
  },
  container: {
    margin: 20
  }
});

export default App;
