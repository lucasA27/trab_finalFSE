import mqtt from 'mqtt';

const MATRICULA = 150018673;

class Server {

  items = {};
  connected = {};

  constructor() {
    this.client = mqtt.connect('mqtt://test.mosquitto.org:8080');
  
    this.client.on('connect', this._onConnect);
    this.client.on('message', this._onMessage);

    const itemsString = localStorage.getItem('items');
    if (itemsString) {
      this.items = JSON.parse(itemsString);
    }

    const connectedString = localStorage.getItem('connected');
    if (connectedString) {
      this.connected = JSON.parse(connectedString);
    }
  }

  _handleChange = () => {
    localStorage.setItem('items', JSON.stringify(this.items));
    localStorage.setItem('connected', JSON.stringify(this.connected));

    this.handleConnection?.(Object.values(this.items));
    this.handleConnected?.(Object.values(this.connected));
  }

  _onConnect = () => {
    this.client.subscribe(`fse2020/${ MATRICULA }/dispositivos/+`, (err) => {
      if (err) {
        console.error('Can\'t subscribe');
      }
    })
    Object.values(this.connected).forEach(item => this.subscribe(item));
  }

  _onMessage = (topic, message) => {
    const data = JSON.parse(new TextDecoder('utf-8').decode(message));
    if (topic.includes('dispositivos')) {
      if (data.type === 'ENERGY' || data.type === 'BATTERY') {
        this.items[data.mac] = data;
      }
    }
    if (this.connected[data.mac]) {
      if (topic.includes('status')) {
        if (this.connected[data.mac].input !== data.input) {
          this._handleLog(`esp-${ data.mac }`, 'UPDATE-INPUT');
        }
        if (this.connected[data.mac].output !== data.output) {
          this._handleLog(`esp-${ data.mac }`, 'UPDATE-OUTPUT');
        }

        this.connected[data.mac].input = data.input;
        this.connected[data.mac].output = data.output;
      }
      if (topic.includes('temperature')) {
        this.connected[data.mac].temperature = data.temperature;
      }
      if (topic.includes('humidity')) {
        this.connected[data.mac].humidity = data.humidity;
      }
    }

    this._handleChange();
  }

  delete = (item) => {
    this.unsubscribe(item);

    this.client.publish(
      `fse2020/${ MATRICULA }/dispositivos/${ item.mac }`,
      JSON.stringify({
        type: 'apagarRegistro'
      })
    );

    delete this.connected[item.mac];

    this._handleChange();
    this._handleLog(`esp-${ item.mac }`, 'apagarRegistro');
  }

  register = (item) => {
    this.connected[item.mac] = item;

    this.client.publish(
      `fse2020/${ MATRICULA }/dispositivos/${ item.mac }`,
      JSON.stringify({
        type: 'registrar',
        comodo: item.comodo
      })
    );

    this.subscribe(item);

    delete this.items[item.mac];

    this._handleChange();
    this._handleLog(`esp-${ item.mac }`, 'registrar');
  }

  subscribe = (item) => {
    console.log("IVEM:" + item.comodo)
    this.client.subscribe(
      `fse2020/${ MATRICULA }/${ item.comodo }/status`,
      (err) => {
        if (err) {
          console.error('Can\'t subscribe');
        }
      }
    );

    if (this.connected[item.mac].type === 'ENERGY') {
      console.log( item.comodo )
      this.client.subscribe(
        `fse2020/${ MATRICULA }/${ item.comodo }/temperature`,
        (err) => {
          if (err) {
            console.error('Can\'t subscribe');
          }
        }
      );
  
      this.client.subscribe(
        `fse2020/${ MATRICULA }/${ item.comodo }/humidity`,
        (err) => {
          if (err) {
            console.error('Can\'t subscribe');
          }
        }
      );
    }
  }

  unsubscribe = (item) => {
    this.client.unsubscribe(
      `fse2020/${ MATRICULA }/${ item.comodo }/estado`,
      (err) => {
        if (err) {
          console.error('Can\'t unsubscribe');
        }
      }
    );

    if (this.connected[item.mac].type === 'ENERGY') {
      this.client.unsubscribe(
        `fse2020/${ MATRICULA }/${ item.comodo }/temperatura`,
        (err) => {
          if (err) {
            console.error('Can\'t unsubscribe');
          }
        }
      );
  
      this.client.unsubscribe(
        `fse2020/${ MATRICULA }/${ item.comodo }/umidade`,
        (err) => {
          if (err) {
            console.error('Can\'t unsubscribe');
          }
        }
      );
    }
  }

  setOutput = (item) => {
    this.connected[item.mac] = item;

    this.client.publish(
      `fse2020/${ MATRICULA }/dispositivos/${ item.mac }`,
      JSON.stringify({ type: 'SET_OUTPUT' })
    );

    this._handleChange();
    this._handleLog(`esp-${ item.mac }`, 'SET_OUTPUT');
  }
  
  _handleLog = (item, action) => {
    const old = JSON.parse(localStorage.getItem('log') ?? '["item", "action"]');
    old.push(item);
    old.push(action);
    localStorage.setItem('log', JSON.stringify(old));
    this.handleLog?.(JSON.stringify(old.join(',')));
  }
  
}

const server = new Server();
export default server;