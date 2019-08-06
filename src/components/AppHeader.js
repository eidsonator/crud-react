import React from 'react';
import { Link } from 'react-router-dom';
import {
    AppBar,
    Button,
    Toolbar,
    Typography,
    withStyles
} from '@material-ui/core';

const styles = {
      flex: {
        flex: 1,
          },
};

const AppHeader = ({ classes }) => (
    <AppBar position="static">
        <Toolbar>
            <Typography variant="subtitle1" color="inherit">
                My React App
            </Typography>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/persons">Persons</Button>
        </Toolbar>
    </AppBar>
);

export default withStyles(styles)(AppHeader);