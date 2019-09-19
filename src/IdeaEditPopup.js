import React from "react";
import "./index.css";
import ModeSelectionMenu from "./ModeSelectionMenu.js"

class IdeaEditPopup extends React.Component {
    constructor(props) {
        super(props);

    }

    state = {
        title:'',
        mode:'',
        notes:'',
        icon:'ios-bulb',
    }

    componentDidMount(){
        if (this.props.title) {
            this.setState({title:this.props.title});
        }

        if (this.props.mode) {
            this.setState({mode:this.props.mode});
        }

        if  (this.props.notes) {
            this.setState({notes:this.props.notes});
        }
        console.log(this.props.mode)

        if  (this.props.mode == "Podcast") {
            this.setState({availMode:["Audio"]});
        }
        
    }

    handleTitleChange = (event)=> {
        if (event.target.value.length < 25){
            this.setState({title: event.target.value});
        }       
    }

    handleNotesChange = (event)=> {
        this.setState({notes: event.target.value});
    }
    
    handleModeChange = (mode) => {
        this.setState({mode:mode}); 
    }

    render(){
        return(
            <React.Fragment>
            <div className="popup">
                <div className="inner">
                    <div className = {this.state.availMode}>
                        <ModeSelectionMenu 
                            availableModes = {this.props.availableModes}
                            handleModeChange = {this.handleModeChange} 
                            currentMode = {this.state.mode}
                            />
                    </div>
                    <input 
                        type="text"
                        className = "textInput heading"
                        value={this.state.title} 
                        onChange={this.handleTitleChange} 
                        />
                        
                    <textarea 
                        value={this.state.notes} 
                        onChange={this.handleNotesChange}
                        />
                    <div
                    style={{marginLeft:"25%", marginRight:"25%",display:"flex", flexDirection:"column"}}>
                        <button
                            className= "selectButton"
                            onClick ={()=>{
                               this.props.handleEdit(this.state.title,this.state.notes, this.state.mode);                                
                            }}>
                            Done
                        </button>
                        <button
                            className= "selectButton"
                            onClick ={()=>{
                                this.props.closePopup();
                            }}                 
                        >Cancel
                        </button>
                    </div>

                    </div>
                </div>
            </React.Fragment>
        )
    }

}
export default IdeaEditPopup