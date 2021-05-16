import React, { useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';

import { CSVLink } from 'react-csv';

import Server from './mqtt';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Connected from './Connected';

import useStyles from './styles';
import Register from './Register';

const audio = new Audio('https://www.soundjay.com/button/sounds/beep-01a.mp3');

const App = () => {
  const classes = useStyles();

  const [open, setOpen] = React.useState('');
  const [play, setPlay] = React.useState(false);
  const [alarm, setAlarm] = React.useState(false);
  const [connected, setConnected] = React.useState([]);
  const [unconnected, setUnconnected] = React.useState([]);
  const [log, setLog] = React.useState('');

  useEffect(() => {
    Server.handleConnection = setUnconnected;
    Server.handleConnected = setConnected;
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
    const shouldPlay = connected
      .filter(item => item.input && item.alarm)
      .length > 0;
    setPlay(shouldPlay);
  }, [connected]);

  const onSubmit = (item) => {
    Server.register(item);
    setOpen('');
  };

  return (
    <div className={classes.root}>
      <div style={{ marginLeft: 40, marginTop: 20 }}>
        <p>Alarme:</p>
        <Switch
          checked={alarm}
          onChange={e => setAlarm(e.target.checked)}
          color='primary'
          name='checked'
          inputProps={{ 'aria-label': 'primary checkbox' }}
        />
      </div>
      {unconnected.length === 0 && (
        <Grid item xs={12} sm={6} />
      )}
      {unconnected.map(item => (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Paper className={classes.paper}>
              <p>MAC Address: {item.mac}</p>
              <p>Tipo: {item.type}</p>
              {open === '' ?
                <Button variant='contained' color='primary' onClick={() => setOpen(item.mac)}>
                  Cadastrar
        </Button> : null}
              {open ?
                <Register
                  item={item}
                  open={open}
                  onClose={() => setOpen('')}
                  submit={onSubmit}
                /> : null}
            </Paper>
          </div>
        </>

      ))}
      {connected.map(item => (
        <Connected item={item} />
      ))}

      <CSVLink data={log} className="btn btn-primary">Download CSV</CSVLink>
    </div>
  );
}

export default App;