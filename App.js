import React, { Component } from 'react';
import { View, Text, Button, FlatList } from 'react-native';

import { BleManager } from 'react-native-ble-plx';

class App extends Component {
  constructor() {
    super();
    this.state = {
      manager: new BleManager(),
      devices: new Set(),
      displayDevices: [],
      status: "None"
    }
  };

  componentDidMount() {
    const subscription = this.state.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
        }
    }, true);
  };

  scanAndConnect = async () => {
    console.log("scanAndConnecting");
    this.state.manager.stopDeviceScan()
    this.state.manager.startDeviceScan(null, {allowDuplicates: false}, (error, device) => {
      this.setState({status: "Scanning"});

      if (error) {
        console.log("ERROR:");
        console.log(error);
        return
      }
      
      if(device.name != null){  
        // console.log(this.state.devices);
        // let devices2 = this.state.devices.add(device.name);
        let devices2 = new Set(this.state.devices).add(device.name);

        let uniqueDevices2 = Array.from(devices2);
        this.setState({
          devices: devices2,
          displayDevices: uniqueDevices2
        });
      }
    });
    console.log("scannedAndConnected");
  };
  
  stopScan = () => {
    this.setState({status: "Stopping"});
    this.state.manager.stopDeviceScan();
    this.setState({status: "Stopped"});
  };

  listDevices = () => {
    console.log(this.state.devices);
  }

  resetDevices = () => {
    this.setState({status: "Resetting"});
    this.setState({devices: new Set(), displayDevices: []})
    this.setState({status: "Resetted"});
  }

  render() {
    return (
      <View>
        <Text>BLE</Text>
        <Text>{this.state.status}</Text>
        <Button title="Scan and Connect" onPress={this.scanAndConnect}/>
        <Button title="Stop Scan" onPress={this.stopScan}/>
        <Button title="List Devices" onPress={this.listDevices}/>
        <Button title="Reset Devices" onPress={this.resetDevices}/>
        <FlatList 
          keyExtractor={(item, index) => item}
          data={this.state.displayDevices}
          renderItem={itemData => <Text>{itemData.item}</Text>}
        />
      </View>
    );
  }
}

export default App;