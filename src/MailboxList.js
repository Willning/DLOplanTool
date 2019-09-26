import React from "react";
import PropTypes from "prop-types";
import { withRouter, Redirect } from "react-router";

class MailboxList extends React.Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
    };

    render() {
        let messageNodes = this.props.data.map(function (proj) {
            return <li key={proj.id}>{proj.createUser + " shared project "}
                <a style = {{color:"blue"}} onClick = {()=>{
                    this.props.loadProject(proj);
                }}>{proj.title}</a>
                {" with you at "
                    + new Intl.DateTimeFormat('en-US', { year: "numeric", month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(proj.shareTime)}
            </li>;
        }.bind(this));

        return (
            <div id="project-shares" className="messageList">
                <ul>{messageNodes}</ul>
            </div>
        );
    }
}

export default MailboxList;