# Intro
Using https://github.com/Polidea/react-native-ble-plx

# Log
## 12/18/2020
### Ways to fix BleError: Cannot start scanning operation:
1. Restart bluetooth and Try again.
2. Go home and fix it.

### Progress
<img src="./img/scanBLE.png"/>

## 12/18/2020 (2)

 - Problem: normal phone/laptop are all Ble-central, but ble-central can only connect to ble-peripheral
 - Solution: use ble-peripheral simulator (https://github.com/himelbrand/react-native-ble-peripheral) 
 - We will be using https://github.com/hezhii/react-native-ble-demo/blob/master/ble_peripheral to run ble-peripheral on 1 android phone, and run this project on another android phone.


  - Problem: Unable to read characteristics -> characteristic is not readable -> should display it.