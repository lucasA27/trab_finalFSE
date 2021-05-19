import React, { useEffect } from 'react';

import Grid from '@material-ui/core/Grid';

import { CSVLink } from 'react-csv';

import Server from './mqtt';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ConnectedBoard from './ConnectedBoard';

import useStyles from './styles';
import Register from './Register';

const App = () => {
  const classes = useStyles();

  const [cadastrar, setCadastrar] = React.useState('');
  const [connectedBoard, setConnectedBoard] = React.useState([]);
  const [unconnectedBoard, setUnconnectedBoard] = React.useState([]);
  const [log, setLog] = React.useState('');

  useEffect(() => {
    Server.handleConnection = setUnconnectedBoard;
    Server.handleConnected = setConnectedBoard;
    Server.handleLog = setLog;
    Server._handleChange();
  }, []);


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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding:20 }}>
            <Paper className={classes.paper}>
              <p>MAC_Address: {item.mac}</p>
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
        <CSVLink data={log} className="btn btn-primary">  <Button variant='contained' color='secondary' >
          Baixar CSV
        </Button></CSVLink>
      </div>

    </div >
  );
}

export default App;