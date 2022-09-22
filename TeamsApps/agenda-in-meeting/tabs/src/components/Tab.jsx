import React from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import MediaQuery from 'react-responsive';
import './App.css';
import * as parser from '../agenda-parser/parser';


const TimelineItem = ({ data, marker, last }) => (
  <div>
      {/* @ts-expect-error */}
    <div className={`agenda-item ${data?.status} ${data?.level===2? 'level2': 'level1'}`} style={{'--length': data?.timeInMinutes}}>
      
      <div className='time'>{marker[0]+=last}</div>
      <span className="topic">{data?.text || 'End'}</span>
      <p className="speaker">{data?.speaker}</p>
    </div>
  </div>
);

class Tab extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      context: {}
    }
  }

  //React lifecycle method that gets called once a component has finished mounting
  //Learn more: https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidMount(){
    microsoftTeams.initialize();
    // Get the user context from Teams and set it in the state
    microsoftTeams.getContext((context, error) => {
      this.setState({
        context: context
      });
    });
    microsoftTeams.meeting.getAppContentStageSharingCapabilities((err, appContentStageSharingCapabilities) => {
      if (appContentStageSharingCapabilities) {
        //alert(appContentStageSharingCapabilities.doesAppHaveSharePermission);
        this.setState({canShowStage: appContentStageSharingCapabilities.doesAppHaveSharePermission})
      }
      else if (err) {
        alert(err.message);
        console.log("Error with API call.");
      }
    });
    // Next steps: Error handling using the error object
  }

   

  render() {
    let meetingId = this.state.context['meetingId'] ?? "";
    let userPrincipleName = this.state.context['userPrincipalName'] ?? "";
    const timelineData = parser.getAgendaItems();
    const accumulation = [0];
    timelineData.forEach(v=>{v.level = 2; v.status='not-done'; })
console.log(timelineData)

    return (
    <div className="agenda-hack-container">
      <h1>In-meeting app sample</h1>
      <h3>Principle Name:</h3>
      <p>{userPrincipleName}</p>
      <h3>Meeting ID:</h3>
      <p>{meetingId}</p>
      <p>doesAppHaveSharePermission={this.state.canShowStage}</p>
 
      <MediaQuery maxWidth={2000}>
        <h3>This is the side panel</h3>

        {timelineData.length > 0 && (
          <div className="timeline-container">
              {timelineData.map((data, idx, arr) => (
                  <TimelineItem data={data} marker={accumulation} last={idx>0? arr[idx-1].timeInMinutes: 0} key={idx} />
              ))}
              <TimelineItem data={null} marker={accumulation} last={timelineData[timelineData.length-1].timeInMinutes} key={timelineData.length} />
          </div>
        )}
      </MediaQuery>
    </div>
    );
  }
}

export default Tab;
