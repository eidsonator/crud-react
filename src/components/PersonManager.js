import React, { Component, Fragment } from 'react';
// import { withAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
    withStyles,
    Typography,
    Button,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import PersonEditor from '../components/PersonEditor';

const styles = theme => ({
    persons: {
        marginTop: theme.spacing(2),
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        [theme.breakpoints.down('xs')]: {
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    },
});

const API = process.env.REACT_APP_API || 'http://localhost:8080';

class PersonsManager extends Component {
    state = {
        loading: true,
        persons: [],
    };

    componentDidMount() {
        this.getPersons();
    }

    async fetch(method, endpoint, body) {
        try {
            const response = await fetch(`${API}${endpoint}`, {
                method,
                body: body && JSON.stringify(body),
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json',
                },
            });
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    };

    async getPersons() {
        this.setState({ loading: false, persons: await this.fetch('get', '/persons') });
    };

    savePerson = async (person) => {
        if (person.id) {
            await this.fetch('put', `/persons/${person.id}`, person);
        } else {
            await this.fetch('post', '/persons', person);
        }

        this.props.history.goBack();
        this.getPersons();
    };

    async deletePerson(person) {
        if (window.confirm(`Are you sure you want to delete "${person.firstName}"`)) {
            await this.fetch('delete', `/persons/${person.id}`);
            this.getPersons();
        }
    };

    renderPersonEditor = ({ match: { params: { id } } }) => {
        if (this.state.loading) return null;
        const person = find(this.state.persons, { id: Number(id) });

        if (!person && id !== 'new') return <Redirect to="/persons" />;

        return <PersonEditor person={person} onSave={this.savePerson} />;
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="body1">Persons Manager</Typography>
                {this.state.persons.length > 0 ? (
                    <Paper elevation={1} className={classes.persons}>
                        <List>
                            {orderBy(this.state.persons, ['lastName', 'firstName'], ['desc', 'asc']).map(person => (
                                <ListItem key={person.id} button component={Link} to={`/persons/${person.id}`}>
                                    <ListItemText
                                        primary={person.firstName}
                                        secondary={person.lastName}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => this.deletePerson(person)} color="inherit">
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    !this.state.loading && <Typography variant="subheading">No persons to display</Typography>
                )}
                <Button
                    variant="outlined"
                    color="secondary"
                    aria-label="add"
                    className={classes.fab}
                    component={Link}
                    to="/persons/new"
                >
                    <AddIcon />
                </Button>
                <Route path="/persons/:id" render={this.renderPersonEditor} />

            </Fragment>
        );
    }
}

export default compose(
    withRouter,
    withStyles(styles),
)(PersonsManager);