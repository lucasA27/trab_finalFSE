import React, { useState } from 'react';

import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import useStyles from './styles';

const Register = ({ open, submit, item, onClose }) => {
  const classes = useStyles();

  const [data, setData] = useState({
    inputName: '',
    outputName: '',
    comodo: '',
    alarm: false
  });

  const onSubmit = (event) => {
    event.preventDefault();
    submit({
      ...item,
      ...data
    });
  }

  const onInput = (key, value) => {
    setData({ ...data, [key]: value });
  }

  return (
   
          <form noValidate autoComplete='off' onSubmit={onSubmit}>
            <TextField
              id='input'
              label='Entrada'
              value={data.inputName}
              onInput={e => onInput('inputName', e.target.value)}
            />
            <br /><br />
            {item.type === 'ENERGY' && (
              <>
                <TextField
                  id='output'
                  label='Saída'
                  value={data.outputName}
                  onInput={e => onInput('outputName', e.target.value)}
                />
                <br /><br />
              </>
            )}
            <TextField
              id='name'
              label='Cômodo'
              value={data.comodo}
              onInput={e => onInput('comodo', e.target.value)}
            />
            <br /><br />
            <Button
              key={1}
              color='secondary'
              variant='contained'
              type='submit'
            >
              Cadastrar
           </Button>
          </form>
  );
}

export default Register;