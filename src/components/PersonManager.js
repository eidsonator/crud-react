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
    pagination: {
        textAlign: 'center',
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
        pageLinks: [],
        page: 1,
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
            return await response;
        } catch (error) {
            console.error(error);
        }
    };

    async getPersons(endpoint = '/persons') {
        let response = await this.fetch('get', endpoint);
        this.setState({
            loading: false,
            persons:  await response.json(),
            pageLinks: this.parseLinkHeader(await response.headers) ,
            page: parseInt(await response.headers.get("x-page"))
        }
        );
    };

    parseLinkHeader(header) {
        let linksHeader = header.get("links");
        if (linksHeader.length === 0) {
            throw new Error("input must not be of zero length");
        }

        // Split parts by comma
        var parts = linksHeader.split(',');
        var links = [];
        // Parse each part into a named link
        for(var i=0; i<parts.length; i++) {
            var section = parts[i].split(';');
            if (section.length !== 2) {
                throw new Error("section could not be split on ';'");
            }
            var url = section[0].replace(/<(.*)>/, '$1').trim();
            var name = section[1].replace(/rel="(.*)"/, '$1').trim();
            links.push({name, url});
        }
        return links;
    }

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
                <div className={classes.pagination}>
                {this.state.pageLinks.length > 0 && this.state.pageLinks.map(link => (
                    <Button
                        disabled={this.state.page === parseInt(link.name.substr(4)) }
                        key={link.name}
                        variant="outlined"
                        onClick={() => this.getPersons(link.url)}>
                        {link.name.substr(4)}
                    </Button>
                ))}
                </div>
                {this.state.persons.length > 0 ? (
                    <Paper elevation={1} className={classes.persons}>
                        <List>
                            {orderBy(this.state.persons, ['lastName', 'firstName'], ['asc', 'asc']).map(person => (
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