import React from 'react';

import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import Server from './mqtt';

import useStyles from './styles';

const ConnectedBoard = ({ item }) => {
  const classes = useStyles();

  const onChange = () => {
    Server.setOutput(item);
  };

  const onDelete = () => {
    Server.delete(item);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
      <Paper id={item.mac} className={classes.paper}>
        <p>Cômodo: {item.comodo}</p>
        <p>Alimentação: {item.type}</p>
        {item.type === 'ENERGY' && (
          <>
            <p>Temperatura: {item.temperature ?? 0} graus</p>
            <p>Umidade: {item.humidity ?? 0} %</p>
          </>
        )}
        {item.type === 'ENERGY' && (
          <div>
            {item.outputName}
            <Switch
              color='primary'
              name='checked'
              checked={item.output }
              inputProps={{ 'aria-label': 'primary checkbox' }}
              onChange={onChange}
            />
          </div>
        )}

        <Button variant='contained' color='secondary' onClick={onDelete}>
          Deletar
        </Button>
      </Paper>
    </div>
  );
}

export default ConnectedBoard;