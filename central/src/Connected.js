import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import Server from './mqtt';

import useStyles from './styles';

const Connected = ({ item }) => {
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
            <p>Temperatura: {item.temperature ?? 0}º</p>
            <p>Umidade: {item.humidity ?? 0}º</p>
          </>
        )}
        <p>{item.inputName}</p>
        {item.type === 'ENERGY' && (
          <>
            <p>{item.outputName}</p>
            <Switch
              color='primary'
              name='checked'
              checked={item.output ?? false}
              inputProps={{ 'aria-label': 'primary checkbox' }}
              onChange={onChange}
            />
          </>
        )}
        <IconButton onClick={onDelete}>
          <Delete />
        </IconButton>
      </Paper>
    </div>
  );
}

export default Connected;