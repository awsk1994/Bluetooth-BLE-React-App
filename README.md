# Intro
This app will be based on https://github.com/Polidea/react-native-ble-plx.

# Features
 - Scan BLE devices
 - Read Service, Characteritics
 - Write characteristics

# How to install? 
 - (Android) react-native run-android
 - (iOS) react-native run-ios (not tested this yet though)

# Log
 - 12/18/2020
   - Problem: "BleError: Cannot start scanning operation"
       - Solution: Restart(turn off -> turn on) bluetooth and Try again.

<img src="./img/scanBLE.png" height= "400px" />

 - 12/18/2020 (2)
    - Problem: normal phone/laptop are all Ble-central, but ble-central can only connect to ble-peripheral. And I need a way to test it (and I don't have ble-peripheral devices).
      - Solution: use ble-peripheral simulator (https://github.com/himelbrand/react-native-ble-peripheral) 
      - To speed up progress, I found an example project that uses the ble-peripheral-simulator library. .We will be using https://github.com/hezhii/react-native-ble-demo/blob/master/ble_peripheral to run ble-peripheral on 1 android phone, and run this project on another android phone.
     - Problem: Unable to read characteristics -> characteristic is not readable -> should display it.
       - Solution: Some characteritiscs are not readable. I added characteristic details to show what is readable, writableWithResponse and writableWithoutResponse.

<img src="./img/20201218/1_20201218_init.jpg" height= "400px" />
<img src="./img/20201218/2_20201218_scannedDevices.jpg" height= "400px" />
<img src="./img/20201218/3_20201218_connectToDevice.jpg" height= "400px" />
<img src="./img/20201218/4_20201218_chooseService.jpg" height= "400px" />
<img src="./img/20201218/5_20201218_chooseCharacteristics.jpg" height= "400px" />
<img src="./img/20201218/6_20201218_showOperations.jpg" height= "400px" />
<img src="./img/20201218/7_20201218_readCharacteristics.jpg" height= "400px" />
<img src="./img/20201218/8_20201218_writeCharacteristics.jpg" height= "400px" />
<img src="./img/20201218/9_20201218_readWrittenCharacteristics.jpg" height= "400px" />

 - 12/19/2020 (3)
   - Problem: Although writing to characteristics seem to work, sometimes the read after write is not the correct(expected) value. Might be due to hex/bytes problem.