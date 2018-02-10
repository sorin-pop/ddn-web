import React, {Component} from 'react';
import DateFormat from 'dateformat';

import {API_LIST_DBS_URL, DATE_FORMAT} from '../consts';
import ActionsGroup from './ActionsGroup';
import ajax from '../net';

export default class Dash extends Component {
    constructor(props) {
        super(props)

        this.state = {
            success: true,
        }
    }

    componentDidMount() {
        this.fetchDatabases();
    }

    fetchDatabases() {
        ajax(API_LIST_DBS_URL).then(results => {
            this.setState({success:true, entries: results.data});
        }).fail(response => {
            this.setState({success:false});
        });
    }

    render() {
        if (!this.state.success) {
            return (<div>Something went horribly wrong</div>)
        }

        if (!this.state.entries) {
            return (<div>Fething entries..</div>)
        }

        return (
            <div>
                <h3>Database list</h3>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Agent</th>
                            <th>Created</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th style={{"width": "110px"}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.entries.map(entry => {
                            return this.renderRow(entry);
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    renderRow(entry) {
        return (
            <tr role="row" key={entry.id}>
                <td>{entry.dbname}</td>
                <td>{entry.agent}</td>
                <td>{DateFormat(Date.parse(entry.createdate), DATE_FORMAT)}</td>
                <td>{DateFormat(Date.parse(entry.expirydate), DATE_FORMAT)}</td>
                <td>{entry.status_label}</td>
                <td><ActionsGroup entry={entry}/></td>
            </tr>
        );
    }

    
}