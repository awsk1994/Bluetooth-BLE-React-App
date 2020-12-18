import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, FlatList, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native';

import { BleManager } from 'react-native-ble-plx';

class App extends Component {
  constructor() {
    super();
    this.state = {
      devices: [],
      status: null,
      scanning: false,
      // bleState: 'Off'
    };
    const manager = this.bleManager = new BleManager();
    // this.setState({bleState: 'On'});
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

  debugDevices = () => {
    console.log(this.state.devices);
  }

  resetDevices = () => {
    this.setState({devices: []});
  }

  connectDevice = async (device) => {
    this.stopScan() // Stop Scanning
    ToastAndroid.show("Connecting to Device...", ToastAndroid.SHORT);

    await device.connect()
    console.log('Connected to Device：', device.id)
    await device.discoverAllServicesAndCharacteristics()
    console.log('Getting services and characteristics...')

    Alert.alert('Connected to Device', null, [
      { text: 'Cancel' },
      { text: "Enter", onPress: () => navigation.push('Device') }
    ]);
  };

  writeToDevice = () => {
    this.bleManager.writeCharacteristicWithResponseForDevice()
  }

  render() {
    return (
      <ScrollView>
        <Text>BLE</Text>
        <Text>Scanning: {this.state.scanning.toString()}</Text>
        <Button title="Scan Devices" onPress={this.scanDevices}/>
        <Button title="Stop Scan" onPress={this.stopScan}/>
        <Button title="Debug Devices" onPress={this.debugDevices}/>
        <Button title="Reset Devices" onPress={this.resetDevices}/>
        <FlatList 
          keyExtractor={(item, index) => index.toString()}
          data={this.state.devices}
          renderItem={itemData => (
          <TouchableOpacity onPress = {() => {this.connectDevice(itemData.item)}}>
            <View style={styles.card}>
              <Text>{itemData.item.id}</Text>
              <Text>({itemData.item.name})</Text>
            </View>
          </TouchableOpacity>
          )}
        />
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  card: {
    marginTop: 5,
    marginBottom: 5,
    borderColor: 'black',
    borderWidth: 1,
    height: 40
  }
});

export default App;
