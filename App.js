import React, { Component } from 'react';
import { TextInput, Alert, StyleSheet, View, List, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';

import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer/'

function strToBinary(str) {
  console.log("strToBinary");
  console.log(str);
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
  console.log("strToHex");
  console.log(str);
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
      writeValue: null
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
    // console.log("onScannedDevice");
    if (error) {
      console.log("ERROR:");
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
      console.log("ERROR");
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
    // TODO
    // const str = "...";
    // this.onPressWriteHexOp(str);
  };

  onPressSampleWriteB = () => {
    // TODO
  };
  
  render() {
    return (
      <View>
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
          </View>
          }
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
          </View>
          }
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
          </View>
          }
          <Text style={styles.h1}>OPERATIONS:</Text>
          {this.state.characteristic && <View>
            <Text style={styles.h2}>Read Value:</Text>
            <Text>{`二进制: ${strToBinary(this.state.readValue)}`}</Text>
            <Text>{`十六进制: ${strToHex(this.state.readValue)}`}</Text>
            <Text>{`UTF8: ${strToUTF8(this.state.readValue)}`}</Text>
            <View style={styles.b1}>
              <Button type="primary" style={{ marginTop: 8 }} onPress={this.onPressReadOp} title="读取特征值"/>
            </View>
            <Text style={styles.h2}>Write Value:</Text>
            <TextInput
                style={styles.input}
                placeholder="请输入特征值"
                value={this.state.writeValue}
                onChangeText={v => this.setState({ writeValue: v })}
              />
            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={() => this.onPressWriteHexOp(this.state.writeValue)} title="写入特征值 (hex format)"/>
            </View>
            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={() => this.onPressWriteStrOp(this.state.writeValue)} title="写入特征值 (string format)"/>
            </View>
            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={this.onPressSampleWriteA} title="Sample write A"/>
            </View>
            <View style={styles.b1}>
              <Button style={styles.b1} type="primary" onPress={this.onPressSampleWriteB} title="Sample write B"/>
            </View>
          </View>
          }
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
  }
});

export default App;
