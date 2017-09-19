const DashButton = require('dash-button');
const DASH_BUTTON_MAC_ADDRESS = '40:b4:cd:ba:25:f3';

let button = new DashButton(DASH_BUTTON_MAC_ADDRESS);

let subscription = button.addListener(async () => {
  console.log('Turn TV on')
});
