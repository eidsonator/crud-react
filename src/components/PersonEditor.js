import React from 'react';
import {
    withStyles,
    Card,
    CardContent,
    CardActions,
    Modal,
    Button,
    TextField,
} from '@material-ui/core';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { Form, Field } from 'react-final-form';

const styles = theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCard: {
        width: '90%',
        maxWidth: 500,
    },
    modalCardContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    marginTop: {
        marginTop: theme.spacing(2),
    },
});

const PersonEditor = ({ person, onSave, history, classes }) => (
    <Form initialValues={person} onSubmit={onSave}>
        {({ handleSubmit }) => (
            <Modal
                className={classes.modal}
                onClose={() => history.goBack()}
                open
            >
                <Card className={classes.modalCard}>
                    <form onSubmit={handleSubmit}>
                        <CardContent className={classes.modalCardContent}>
                            <Field name="firstName">
                                {({ input }) => <TextField label="First Name" autoFocus {...input} />}
                            </Field>
                            <Field name="lastName">
                                {({ input }) => (
                                    <TextField
                                        className={classes.marginTop}
                                        label="Last Name"
                                        {...input}
                                    />
                                )}
                            </Field>
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="primary" type="submit">Save</Button>
                            <Button size="small" onClick={() => history.goBack()}>Cancel</Button>
                        </CardActions>
                    </form>
                </Card>
            </Modal>
        )}
    </Form>
);

export default compose(
    withRouter,
    withStyles(styles),
)(PersonEditor);