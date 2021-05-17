import React, { useEffect } from 'react';

import Grid from '@material-ui/core/Grid';

import { CSVLink } from 'react-csv';

import Server from './mqtt';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ConnectedBoard from './ConnectedBoard';

import useStyles from './styles';
import Register from './Register';

const audio = new Audio('https://www.soundjay.com/button/sounds/beep-01a.mp3');

const App = () => {
  const classes = useStyles();

  const [cadastrar, setCadastrar] = React.useState('');
  const [play, setPlay] = React.useState(false);
  const [alarm, setAlarm] = React.useState(false);
  const [connectedBoard, setConnectedBoard] = React.useState([]);
  const [unconnectedBoard, setUnconnectedBoard] = React.useState([]);
  const [log, setLog] = React.useState('');

  useEffect(() => {
    Server.handleConnection = setUnconnectedBoard;
    Server.handleConnected = setConnectedBoard;
    Server.handleLog = setLog;
    Server._handleChange();
  }, []);

  useEffect(() => {
    Server._handleLog('alarm', alarm ? 'ON' : 'OFF');
  }, [alarm]);

  useEffect(() => {
    if (play && alarm) {
      audio.play();
    } else {
      audio.pause();
      audio.load();
    }
  }, [play, alarm]);

  useEffect(() => {
    const shouldPlay = connectedBoard
      .filter(item => item.input && item.alarm)
      .length > 0;
    setPlay(shouldPlay);
  }, [connectedBoard]);

  const onSubmit = (item) => {
    Server.register(item);
    setCadastrar('');
  };

  return (
    <div className={classes.root}>

      {unconnectedBoard.length === 0 && (
        <Grid item xs={12} sm={6} />
      )}
      {unconnectedBoard.map(item => (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Paper className={classes.paper}>
              <p>MAC Address: {item.mac}</p>
              <p>Alimentação: {item.type}</p>
              {cadastrar === '' ?
                <Button variant='contained' color='secondary' onClick={() => setCadastrar(item.mac)}>
                  Cadastrar
        </Button> : null}
              {cadastrar ?
                <Register
                  item={item}
                  cadastrar={cadastrar}
                  onClose={() => setCadastrar('')}
                  submit={onSubmit}
                /> : null}
            </Paper>
          </div>
        </>

      ))}
      {connectedBoard.map(item => (
        <ConnectedBoard item={item} />
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>

        <Button variant='contained' color='secondary' onClick={() => alarm === false ? setAlarm(true) : setAlarm(false)}>
          {alarm === false ? "Ligar alarme" : "Desligar alarme"}
        </Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
        <CSVLink data={log} className="btn btn-primary">  <Button variant='contained' color='secondary' >
          Download CSV
        </Button></CSVLink>
      </div>

    </div >
  );
}

export default App;