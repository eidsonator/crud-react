import React, { Component, Fragment } from 'react';
// import { withAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
    withStyles,
    Typography,
    Button,
    ButtonGroup,
    IconButton,
    InputLabel,
    FormControl,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    MenuItem,
    Select
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import PersonEditor from '../components/PersonEditor';
import DeleteModal from "./DeleteModal";

const styles = theme => ({
    persons: {
        marginTop: theme.spacing(2),
    },
    pagination: {
        textAlign: 'center',
    },
    formControl: {
        margin:theme.spacing(2),
        minWidth: 120,
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
        lastPage: null,
        sortBy: "lastName",
        sortDir: "ASC",
        perPage: 5
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

    async getPersons(endpoint = '') {
        endpoint = endpoint || `/persons?page=${this.state.page}&perPage=${this.state.perPage}&sortBy=${this.state.sortBy}&sortDir=${this.state.sortDir}`;
        let response = await this.fetch('get', endpoint);
        this.setState({
            loading: false,
            persons:  await response.json(),
            pageLinks: this.parseLinkHeader(await response.headers) ,
            page: parseInt(await response.headers.get("x-page")),
            lastPage: parseInt(await response.headers.get("x-last-page"))
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
            const section = parts[i].split(';');
            if (section.length !== 2) {
                throw new Error("section could not be split on ';'");
            }
            const url = section[0].replace(/<(.*)>/, '$1').trim();
            const name = section[1].replace(/rel="(.*)"/, '$1').trim();
            const text =  name.substr(4);
            links.push({name, url, text});
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
        await this.fetch('delete', `/persons/${person.id}`);
        this.getPersons();
    };

    renderDeleteModal = ({ match: { params: { id } } }) => {
        const person = find(this.state.persons, { id: Number(id) });
        return <DeleteModal person={person}  onDelete={() => window.alert('something')}/>
    };

    renderPersonEditor = ({ match: { params: { id } } }) => {
        if (this.state.loading) return null;
        const person = find(this.state.persons, { id: Number(id) });

        if (!person && id !== 'new') return <Redirect to="/persons" />;

        return <PersonEditor person={person} onSave={this.savePerson} />;
    };

    sortByChanged = (event) => {
        this.setState({sortBy: event.target.value});
        // this.getPersons was firing before the state was updated
        setTimeout(() => this.getPersons(), 1);
    };


    sortDirChanged = (event) => {
        this.setState({sortDir: event.target.value});
        // this.getPersons was firing before the state was updated
        setTimeout(() => this.getPersons(), 1);
    };

    perPageChanged = (event) => {
        this.setState({perPage: event.target.value});
        // this.getPersons was firing before the state was updated
        setTimeout(() => this.getPersons(), 1);
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="body1">Persons Manager</Typography>


                <div className={classes.pagination}>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Sort By:</InputLabel>
                        <Select
                            value={this.state.sortBy}
                            onChange={this.sortByChanged}
                        >
                            <MenuItem value={"firstName"}>First Name</MenuItem>
                            <MenuItem value={"lastName"}>Last Name</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel>Sort Dir:</InputLabel>
                        <Select
                            value={this.state.sortDir}
                            onChange={this.sortDirChanged}
                        >
                            <MenuItem value={"ASC"}>Ascending</MenuItem>
                            <MenuItem value={"DESC"}>Descending</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel>Per Page:</InputLabel>
                        <Select
                            value={this.state.perPage}
                            onChange={this.perPageChanged}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </FormControl>
                    <br/>
                    <ButtonGroup>
                {this.state.pageLinks.length > 0 && this.state.pageLinks.map(link => (
                    <Button
                        disabled={
                             this.state.page === parseInt(link.text)
                                || (this.state.page === this.state.lastPage && (link.text === 'last' || link.text === 'next'))
                                || (this.state.page === 1 && (link.text === 'first' || link.text === 'prev'))
                        }
                        key={link.name}
                        variant="outlined"
                        onClick={() => this.getPersons(link.url)}>
                        {link.text}
                    </Button>
                ))}
                    </ButtonGroup>
                </div>
                
                {this.state.persons.length > 0 ? (
                    <Paper elevation={1} className={classes.persons}>
                        <List>
                            {this.state.persons.map(person => (
                                <ListItem key={person.id} button component={Link} to={`/persons/${person.id}`}>
                                    <ListItemText
                                        primary={person.firstName}
                                        secondary={person.lastName}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton href={`/persons/delete/${person.id}`} color="inherit">
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
                <Route path="/persons/delete/:id" render={this.renderDeleteModal}/>
            </Fragment>
        );
    }
}

export default compose(
    withRouter,
    withStyles(styles),
)(PersonsManager);