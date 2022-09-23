import React from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import MediaQuery from "react-responsive";
import "./App.css";
import * as parser from "../agenda-parser/parser";

const ONETICK = 2000; //60000; 

const TimelineItem = ({ data, marker, last, index, nowDone }) => (
  <div>
    <div
      className={`agenda-item ${nowDone===index? 'yay':''} ${data?.status} ${
        data?.level === 2 ? "level2" : "level1"
      }`}
      style={{ "--length": data?.timeInMinutes, "--overlay": data?.overlay }}
    >
      <div className="time">{(marker[0] += last)}</div>
      {data?.text && <p className="topic">{data?.text}</p>}
      {data?.speaker && <p className="speaker">{data?.speaker}</p>}
    </div>
  </div>
);

class Tab extends React.Component {
  constructor(props) {
    super(props);
    this.nowDone = -1;
    this.intervalId = undefined;
    this.state = {
      context: {},
      // meetingDetails: {},
      timelineData: parser
        .getAgendaItems()
        .map((v) => ({ ...v, level: 1, status: "not-done", overlay: 0 })),
    };
  }

   componentDidMount() {
    microsoftTeams.initialize();
    // Get the user context from Teams and set it in the state
    microsoftTeams.getContext((context, error) => {
      this.setState({
        context: context,
      });
    });
    // microsoftTeams.meeting.getAppContentStageSharingCapabilities(
    //   (err, appContentStageSharingCapabilities) => {
    //     if (appContentStageSharingCapabilities) {
    //       //alert(appContentStageSharingCapabilities.doesAppHaveSharePermission);
    //       this.setState({
    //         canShowStage:
    //           appContentStageSharingCapabilities.doesAppHaveSharePermission,
    //       });
    //     } else if (err) {
    //       alert(err.message);
    //       console.log("Error with API call.");
    //     }
    //   }
    // );

    // microsoftTeams.meeting.getMeetingDetails(
    //   (err, meetingDetails) => {
    //     if (meetingDetails) {
    //       alert(JSON.stringify(meetingDetails));
    //       this.setState({
    //         meetingDetails,
    //       });
    //     } else if (err) {
    //       alert(err.message);
    //       console.log("Error with API call.");
    //     }
    //   }
    // );
    // Next steps: Error handling using the error object

    const getStatus = (item, i) => {
      if (i === 0 && item.status === "not-done") return "in-progress";
      if (item.overlay >= item.timeInMinutes) return "done";
      return item.status;
    };
    const tick = () => {
      this.setState((old) => {
        const newState = {
          ...old,
          timelineData: old.timelineData.map((v, i) => ({
            ...v,
            overlay: v.status === "in-progress" ? v.overlay + 1 : v.overlay,
            status: getStatus(v, i),
            // nowDone: v.status === 'in-progress' && getStatus(v,i) === 'done'? i: -1,
          })),
        };
        newState.timelineData.forEach((v,i,arr)=>{
          if (i>0 && arr[i-1].status==='done' && v.status==='not-done') v.status = 'in-progress';
          if (old.timelineData[i].status === 'not-done' &&  v.status==='in-progress')
            newState.nowDone = i;
        })
        console.dir(newState);
        return newState;
        
      });
    };
    this.intervalId = setInterval(tick, ONETICK);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  componentDidUpdate(){
    if (this.state.timelineData[this.state.timelineData.length-1].status === 'done')
      clearInterval(this.intervalId)
  }

  render() {
    let meetingId = this.state.context["meetingId"] ?? "";
    let userPrincipleName = this.state.context["userPrincipalName"] ?? "";

    const accumulation = [0];

    return (
      <div className="agenda-hack-container">
        <span className="light-text">Organizer: {userPrincipleName}</span>
        {/* <h3>Meeting ID:</h3>
        <p>{meetingId}</p>
        <p>doesAppHaveSharePermission={this.state.canShowStage}</p> */}

        <MediaQuery minWidth={200}>
          <h3>Meeting agenda</h3>

          {this.state.timelineData.length > 0 && (
            <div>
              {this.state.timelineData.map((data, idx, arr) => (
                <TimelineItem
                  data={data}
                  marker={accumulation}
                  last={idx > 0 ? arr[idx - 1].timeInMinutes : 0}
                  index={idx}
                  nowDone={this.state.nowDone}
                  key={idx}
                  />
                  ))}
              <TimelineItem
                data={null}
                marker={accumulation}

                last={
                  this.state.timelineData[this.state.timelineData.length - 1]
                  .timeInMinutes
                }
                index={this.state.timelineData.length}
                nowDone={this.state.nowDone}
                key={this.state.timelineData.length}
                />
            </div>
          )}
        </MediaQuery>
      </div>
    );
  }
}

export default Tab;
