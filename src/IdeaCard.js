import React from "react";
import { app } from "./Firebase";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Icon } from "antd";
import { withRouter, Redirect } from "react-router";
import { Container, Navbar, Nav, Row, Col, Image } from "react-bootstrap";
import "./index.css"
import Ionicon from "react-ionicons";
import Utils from "./Utils.js"
import IdeaEditPopup from "./IdeaEditPopup.js"
import { relative } from "path";


class IdeaCard extends React.Component {
    constructor(props) {
        super(props)
        //@@TODO make all the states take from project. 
    }

    state = {
        created: false,
        level: 0,
        childIdeas: [], 
        icon: "",
        editing:false
    };

    //For removing a child
    handleDelete = (uuid) => {
        this.props.handleIdeaDeletion(uuid);
        //console.log(this.state.childIdeas.filter(idea => idea !== uuid));
        this.setState({
            childIdeas: this.state.childIdeas.filter(idea => idea !== uuid)
          });        
          //Update the props on the children.
    }

    //Add empty child
    addChild(uuid) {
        //Limit the number of child ideas.
        var max; 
        //level of the node to add children to 
        switch (this.state.level) {
            case 0:
                max = 4;
                break;
            case 1: 
                max = 2;
                break;
            case 2: 
                max = 1;
                break;
        }

        if (this.state.childIdeas.length < max){
            //Need to update project
            this.props.handleIdeaUpdate(uuid, {
                title: "",
                parentID: this.props.uuid,
                notes: "",
                mode: this.props.availableModes[0]
            })
            this.setState({
                childIdeas:[...this.state.childIdeas, uuid]
              });
        }
    }

    //Loading multiple children, used when loading to prevent setState race conditions.
    loadChildren(uuidArray) {                
        this.setState({
            childIdeas:this.state.childIdeas.concat(uuidArray)
        })
    }

    //Handle the edit, then close the popup.
    handleEdit = (title, notes, mode) =>{       
        this.props.handleIdeaUpdate(this.props.uuid,{
            title: title,
            parentID: this.props.parentID,
            notes: notes,
            mode : mode
        });

        this.setIcon(mode);
        
        this.setState({created: true}, () => {
            this.closePopup()
        });

        //If this node is the root node, changing the text will change main topic too. 
        //@@TODO Better intergrate this next sprint
        if (this.props.uuid === "root") {
            this.props.handleMainTopicChange(title);   
        }
    }
    closePopup = () =>{
        this.setState({editing:false});

        if (!this.state.created) {
            this.props.handleDelete(this.props.uuid); 
        }       
    }

    //Called to change the icon
    setIcon(mode) {
        switch (mode){
            case "video":
                this.setState({icon:"md-videocam"})
                break;
            case "sound":
                this.setState({icon:"ios-microphone-outline"})
                break;
            case "writing":
                this.setState({icon:"ios-paper"})
                break;
            case "image":
                    this.setState({icon:"ios-image"})
                break;
            default:
                this.setState({icon:""})                
        }
    }

    componentDidMount() {       
        
        if (this.props.level) {
            this.setState({level: this.props.level});
        }           

        if (this.props.level > 0) {
            this.setState({editing:true}); //Automatically open editing card if not root element. 
        }

        var ideaArray = [];

        for (let idea in this.props.ideas) {
            if (this.props.ideas[idea].parentID === this.props.uuid) {
                ideaArray.push(idea);
            }
        }
        this.loadChildren(ideaArray);

        //If the data was from the load, close the popup onload. 
        if(this.props.ideas[this.props.uuid].fromLoad) {
            this.setState({created: true}, () => {
                this.closePopup()
            });
        }

        this.setIcon(this.props.ideas[this.props.uuid].mode);

        
    }

    render() {
         return(
            <React.Fragment>
                {this.state.editing ? (
                //Popup will live here.
                <IdeaEditPopup 
                    title ={this.props.ideas[this.props.uuid].title} 
                    mode={this.props.ideas[this.props.uuid].mode} 
                    notes ={this.props.ideas[this.props.uuid].notes} 
                    handleEdit = {this.handleEdit}
                    uuid = {this.props.uuid}
                    handleDelete = {this.handleDelete}
                    availableModes= {this.props.availableModes}
                    closePopup = {this.closePopup}
                    />
                ) : null}
                <div>
                    <div style = {{
                        font:"Montserrat,sans-serif",
                        backgroundColor: "#ff0",
                        fontSize: "18px", 
                        textAlign:"center", 
                        width:"150px",
                        height:"100px",
                        borderRadius:"5px",
                        marginRight: "auto",
                        marginLeft: "auto",
                        marginTop:"1rem",
                        flexShrink:2,
                        position: "relative"
                        }}
                        >   
                        <div
                            className = {this.props.ideas[this.props.uuid] ? this.props.ideas[this.props.uuid].mode : null }
                            style = {{
                                cursor: 'pointer',
                            }}
                            onClick={()=> {
                                if (this.state.icon != ""){
                                    this.setState({editing:"true"});
                                }
                            }}>
                            
                            <Ionicon
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 10
                            }}
                            fontSize="30"
                            color="#fff"
                            icon= {this.state.icon}
                            />
                            
                            {this.props.ideas[this.props.uuid] ? this.props.ideas[this.props.uuid].mode : null }

                            {this.state.level !== 0 ? <Ionicon
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 2.5,
                                cursor: 'pointer',
                            }}
                            icon="md-close"
                            onClick={(event)=> {
                                this.props.handleDelete(this.props.uuid);                                                        
                            }}
                            />: null}                
                        </div>

                        <div style = {{
                            fontSize:"20px"
                        }}>
                            {this.props.ideas[this.props.uuid] ? this.props.ideas[this.props.uuid].title : null }
                        </div>     
      
                        {this.state.level < 3 ? 
                           <Ionicon
                            style={{
                                position: "absolute",
                                right :0,
                                bottom:0,
                                cursor: 'pointer',
                            }}
                            icon="md-add"
                            onClick={() => {
                                //Generate UUID for the node here and also pass to child component
                                var uuid = Utils.uuid();
                                this.addChild(uuid);
                            }}
                            />:
                            null}   
                    </div>
                                    
                    <div className="childIdeas" style ={{display:"flex",width:"100%",justifyContent:"space-evenly"}}>
                        {this.state.childIdeas.map((uuid) =>
                             <IdeaCard  key={uuid} 
                                        uuid = {uuid}
                                        handleIdeaUpdate = {this.props.handleIdeaUpdate}
                                        handleIdeaDeletion = {this.props.handleIdeaDeletion}
                                        ideas = {this.props.ideas}
                                        parentID = {this.props.uuid} 
                                        availableModes={this.props.availableModes}
                                        level={this.state.level+1}
                                        handleDelete = {this.handleDelete}>
                                    </IdeaCard>)}
                    </div>
                </div>
            </React.Fragment>
            )
        
    }

}


export default withRouter(IdeaCard);