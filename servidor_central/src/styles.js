
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default useStyles;

export const rand = () => {
    return Math.round(Math.random() * 20) - 10;
  }
  
  export const getModalStyle = () => ({
    top: '25%',
    left: '25%'
  });