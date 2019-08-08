import React from 'react';
import { Link } from 'react-router-dom';
import {
    AppBar,
    Button,
    Grid,
    Toolbar,
    Typography,
    withStyles
} from '@material-ui/core';
import {GithubCircle} from 'mdi-material-ui';



const styles = {
      flex: {
        flex: 1,
          },
      link: {
          color: '#ffffff',
          ':visited' : {
              color: '#ffffff'
          }
      },

};

const AppHeader = ({ classes }) => (
    <AppBar position="static">
        <Toolbar>
            <div className={classes.flex}>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/persons">Persons</Button>
            </div>

            <a href="https://github.com/eidsonator/crud-react" target="_blank" className={classes.link}>
                <GithubCircle/>
            </a>
        </Toolbar>
    </AppBar>
);

export default withStyles(styles)(AppHeader);