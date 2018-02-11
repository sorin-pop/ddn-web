import React, { Component } from 'react';
import DateFormat from 'dateformat';
import { sprintf } from 'sprintf-js';
import { NotificationManager } from 'react-notifications';

import { DATE_FORMAT, API_EXTEND_DB_URL, MONTHS, API_DELETE_DB_URL, API_ACCESS_INFO_URL } from '../consts';
import ActionsGroup, { ExtendButton, DropButton, InfoButton } from './ActionsGroup';
import ajax from '../net';


export default class DashRow extends Component {
    constructor(props) {
        super(props)

        this.state = {
            entry: this.props.entry
        }

        this.handleExtendEvent = this.handleExtendEvent.bind(this);
        this.handleInfoEvent = this.handleInfoEvent.bind(this);
        this.handleDropEvent = this.handleDropEvent.bind(this);
    }

    render() {
        const entry = this.state.entry

        if (!entry) {
            return null;
        }

        return (
            <tr role="row">
                <td>{entry.dbname}</td>
                <td>{entry.agent}</td>
                <td>{DateFormat(Date.parse(entry.createdate), DATE_FORMAT)}</td>
                <td>{DateFormat(Date.parse(entry.expirydate), DATE_FORMAT)}</td>
                <td>{entry.status_label}</td>
                <td>
                    <ActionsGroup>
                        <ExtendButton onClick={this.handleExtendEvent} />
                        <InfoButton onClick={this.handleInfoEvent} />
                        <DropButton onClick={this.handleDropEvent} />
                    </ActionsGroup>
                </td>
            </tr>
        )
    }

    handleExtendEvent() {
        const endpoint = sprintf(API_EXTEND_DB_URL, this.state.entry.id, 1, MONTHS)

        ajax(endpoint, {type: "PUT"}).then(result => {
            if (result.success) {
                let curEntry = this.state.entry;
                curEntry.expirydate = result.data;
                
                this.setState({curEntry});

                NotificationManager.success("Extended the expiry of '" + curEntry.dbname + "' by 1 month", "Success");
            } else {
                NotificationManager.error("Failed to extend expiry with message: " + result.data, "Failure");
            }
            // TODO Add unsuccessful update handling
        }).fail(reason => {
            NotificationManager.error("Check console log for more information.", "Unable to extend expiry")
            console.log(reason);
        })
    }

    handleInfoEvent() {
        const endpoint = sprintf(API_ACCESS_INFO_URL, this.state.entry.id);

        ajax(endpoint).then(result => {
            if (result.success) {
                this.props.modalHandler(result.data);
            } else {
                NotificationManager.error("Reason: " + result.data, "Unable to fetch access information");
                console.log(result.data);    
            }
            
        }).fail(reason => {
            NotificationManager.error("Check console log for more information.", "Unable to fetch access information");
            console.log(reason);
        });
    }

    handleDropEvent() {
        const endpoint = sprintf(API_DELETE_DB_URL, this.state.entry.id)

        ajax(endpoint, {type: "DELETE"}).then(result => {
            if (result.success) {
                let curEntry = this.state.entry;
                curEntry.status_label = "Drop in progress";
                
                this.setState({curEntry});

                NotificationManager.info("Started dropping the database", "Info");
            } else {
                let curEntry = this.state.entry;
                curEntry.status_label = "Drop failed";
                
                this.setState({curEntry});

                NotificationManager.error("Check console log for more information.", "Unable to drop database");
            }
        }).fail(reason => {
            NotificationManager.error("Check console log for more information.", "Unable to drop database")
            console.log(reason);
        })
    }
}