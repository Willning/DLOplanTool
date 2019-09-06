import React from "react";
import { app } from "./Firebase";
import "./index.css";
import { Button, Icon } from "antd";
import DragAndDrop from "./DragAndDrop.js";
import { withRouter, Redirect } from "react-router";
import firebase from "firebase"
import Firestore from "./Firestore.js"

class NewProjectPopup extends React.Component {
  constructor(props) {
    super(props);

    this.localCache = window.localStorage;

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTopicChange = this.handleTopicChange.bind(this);

    this.isProjectCreated = false;
  }

  state = {
    projectTitle: "",
    projectTopic: "",
    imageName: "", //The name of the image, whether from DB or upload
    image: "", //represents the source information about the image.
    file:"" //the uploaded file for the image.
  };

  componentDidMount() {

    //Local storage variant
    var title = this.localCache.getItem("title");
    if (title) {
      this.setState({projectTitle:title});
    }

    var topic = this.localCache.getItem("topic");
    if (topic) {
      this.setState({projectTopic:topic});
    }

    var image = this.localCache.getItem("image");
    if (image) {
      this.setState({image:image});
    }

    var imageName = this.localCache.getItem("imageName");
    if (imageName) {
      this.setState({imageName:imageName});
    }

    

    //Get from the database, not sure if needed.
    /*
    var uid = firebase.auth().currentUser.uid;
    Firestore.getUserData(uid).get().then(function(doc){
      if (doc) {
        var fields = doc.data();
        this.setState({projectTitle:fields.title});
        this.setState({projectTopic:fields.subtitle});

        var imageName =fields.image;
        if (imageName) {
          try {
            var storage = firebase.storage();
            storage.ref("projectImage/" + imageName).getDownloadURL()
              .then(function(url) {
                this.setState({image:url});
                this.setState({imageName:imageName});
              }.bind(this));      
          } catch(e) {
            //Bad image load
            this.state.image = "";
          }
        }
        
      }
    }.bind(this));
    */
  }

  componentWillUnmount() {

    //If a project is made, the local cache empties
    if (this.isProjectCreated) {
      this.localCache.removeItem("title");
      this.localCache.removeItem("topic");
      this.localCache.removeItem("image");
      this.localCache.removeItem("imageName");
    }


    //Save To database variant, not sure if needed
    //purge interim database if the project is created.
    /*
    var data = {
      title:  "",
      subtitle: "",
      file: ""
    }

    //Debatable whether to push to firebase here
    if (!this.isProjectCreated){
      data.title=this.state.projectTitle;
      data.subtitle = this.state.projectTopic;

      if (this.state.imageName) {
        data.file = this.state.imageName;
      }
    } 

    //If the project is created the fields will default to empty.
    var uid = firebase.auth().currentUser.uid;
    Firestore.saveWithDocID("users",uid,{
      "title": data.title,
      "subtitle" : data.subtitle,
      "image" : data.file
    });
    */
  
  }
  
  /**
   * Function to handle when a file is dropped into the drag and drop area. 
   */
  handleDrop = fileList => {
    //If what was dragged in was not a image.
    if (!fileList[0] || fileList[0]["type"].split("/")[0] !== "image") {
      return;
    }   

    var file = fileList[0];
    if (file) {
      this.setState({file:file});
      this.setState({imageName:file.name});

      this.localCache.setItem("imageName", file.name);

      var reader = new FileReader();
      reader.onload = function(e) {      
        try {
          this.localCache.setItem("image", e.target.result);
        } catch (e){
          //Image exceeds local storage.
        }
        this.setState({ image: e.target.result});
      }.bind(this);
      reader.readAsDataURL(file);
    } 
  }

/**
 * Uploads an image to firestore
 * @param {File} file: File to be uploaded to firebase. 
 */
 uploadImage(file) {
    if (!file) {
      return;
    }

    //Uploading image    
    var storageRef = firebase.storage().ref("projectImage/" + file.name);          
    var uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
          function error(err){

          },
          function complete(){
            console.log("successful upload");
          }
      );
  }


  handleTitleChange(event) {
    this.setState({ projectTitle: event.target.value },function()
    {
      //Local cache variant
      this.localCache.setItem("title",this.state.projectTitle);
    });
    
  }

  handleTopicChange(event) {
    this.setState({ projectTopic: event.target.value }, function()
    {
      this.localCache.setItem("topic",this.state.projectTopic);
    });
  }

  makeProject() {
    //Make upload image here too.
    this.isProjectCreated = true;

    var data = {
      title:  this.state.projectTitle,
      subtitle: this.state.projectTopic,
      image: "",
      creationTime: + new Date()
    }

    if (this.state.imageName) {
      data.image = this.state.imageName;
    }

    var uid = firebase.auth().currentUser.uid;
    Firestore.saveNewProject(uid,data);
    if (this.state.file){
      this.uploadImage(this.state.file);
    } 

    const { history } = this.props;
    history.push({
      pathname: "./project",
      state: {
        title: this.state.projectTitle,
        topic: this.state.projectTopic,
        image: this.state.image,
        creationTime: + new Date()
      }
    });    
  }

  render() {
    var togglePopup = this.props.togglePopup;
    const { history } = this.props;
    return (
      <React.Fragment>
        <div className="popup">
          <div className="inner">
            <Icon
              style={{
                position: "absolute",
                right: "15px",
                top: "15px"
              }}
              type="close"
              onClick={() => togglePopup()}
            />
            <h1>New Project</h1>
            <div
              style={{
                marginLeft: "35%",
                marginRight: "35%"
              }}
            >
              <form>
                <div>Project Title</div>
                <input
                  type="text"
                  className="textInput"
                  value={this.state.projectTitle}
                  onChange={this.handleTitleChange}
                />
                <div>Project Topic</div>
                <input
                  type="text"
                  className="textInput"
                  value={this.state.projectTopic}
                  onChange={this.handleTopicChange}
                />
              </form>
            </div>
            <div
              style={{
                marginTop: "10%",
                marginLeft: "25%",
                marginRight: "25%",
                textAlign: "center"
              }}
            >
              <div
              style={{
                position: "absolute",
                height: "30%",
                width: "50%",
              }}
              >              
                <DragAndDrop handleDrop={this.handleDrop}>
                  <Icon
                    style={{
                      position: "absolute",
                      right: "5px",
                      top: "5px"
                    }}
                    type="close"
                    onClick={() => {
                      //Could remove image from db too?
                      this.localCache.removeItem("image");
                      this.localCache.removeItem("imageName");
                      this.setState({ image: "" });
                      this.setState({file:""});
                      this.setState({imageName:""});
                    }}
                  />
                  <div className = "draggedImage">
                    {this.state.image === "" && <b>Drag Image Here</b>}
                    <img src = {this.state.image}/>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      height: "3em",
                      width: "101%",
                      textAlign: "left",
                      backgroundColor: "#2C3539",
                      color: "#fff",
                      bottom: -10,
                      left: "-0.5%",
                      paddingLeft: "0.5em"
                    }}
                  >
                    <b>{this.state.projectTitle}</b>
                    <br />
                    {this.state.projectTopic}
                  </div>
                </DragAndDrop>
                <br />
                <Button
                  style={{
                    backgroundColor: "#FA8231",
                    color: "#fff",
                    marginTop: "5%"
                  }}
                  onClick={() => 
                    this.makeProject()
                  }
                  disabled={
                    this.state.projectTitle.length == 0 ||
                    this.state.projectTopic.length == 0
                  }
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(NewProjectPopup);