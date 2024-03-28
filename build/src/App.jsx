/*
Developed by NotNotTy
Teaching purposes

Accessing Backend data with React and Fetch
*/


import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'




function App() {
  /*
  Constant variables that we want to save after each refresh
  */
const [currentTeam, updateCurrentTeam] = useState('Use the searchbar to find a teams overall stats');
const[currentInput, updateCurrentInput] = useState(0);
const [displayStats, updateDisplay] = useState(false);
const[avgPoints, updateAvgPoints] = useState(0);
const[avgAuto, updateAvgAuto] = useState(0);
const[avgMatch,updateAvgMatch] = useState(0);
const[avgStage, updateAvgStage] = useState(0);
const[eventPlayed, updateEventsPlayed] = useState(0);
const[teamWebsite, updateTeamWebsite] = useState('');
const[teamImage, updateTeamImage] = useState('');


/* you MUST put in your own API key here! TBA's api keys can be generated once you have
an account. follow the instructions here:

https://www.thebluealliance.com/apidocs



/*/
const tba_key = 'YOUR-OWN-API-KEY';






/*
This function makes two API calls to the Blue Alliance, and fetches certain parts of
a teams data, such as image, name, etc. Then it stores it in a constant variable to be displayed
*/
function updateTeam(e){ 
  /* grabs the input data */
  const form = e.target;
  const formData = new FormData(form);
  const formJson = Object.fromEntries(formData.entries());
  const formKeys = Object.keys(formJson);
  var image = new Image();

  const urlTeam = "https://www.thebluealliance.com/api/v3/team/frc" + formJson[formKeys[0]];
  const urlImgTeam = "https://www.thebluealliance.com/api/v3/team/frc" + formJson[formKeys[0]] + '/media/2024'




fetch(urlTeam, {
    headers: {
        'X-TBA-Auth-Key': tba_key
    }
})
  .then(res => {
    if (!res.ok){ //if there was NO response, the team doesn't exist
      updateCurrentTeam("Team does not exist!");
      updateDisplay(false);
    }
    else {
      updateDisplay(true);
    }
    return res.json()
  }
  ) //gets the json
  .then(data => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    if (keys[0] != 'Error'){
    updateCurrentTeam(data[keys[11]]); //pass in the key to retrieve the data
    }

    //if the team has a website link
    if (data[keys[17]] != null){
      updateTeamWebsite(data[keys[17]]);
    }


  }
  
  ) 


  

  //grabs the team image
  fetch(urlImgTeam, {
    headers: {
        'X-TBA-Auth-Key': tba_key
    }
}).then(res => res.json()).then(data => {
  if (data[0] == null){ //the team doesnt have a team image.
    updateTeamImage('');
    return;
  }

  //the link to the image that the Blue Alliance gives us is a bse64 string. We can just add it onto the end of the following to convert it.
  image.src = 'data:image/png;base64,' + data[0]['details']['base64Image']
  updateTeamImage(image.src);


}
  );


}
/*
Makes a call to another API Endpoint to grab the stats of a team.
It then takes those stats and stores them in constant variables to be displayed.
*/
function updateStats(e){
  const form = e.target;
  const formData = new FormData(form);
  const formJson = Object.fromEntries(formData.entries());
  const formKeys = Object.keys(formJson);
  const urlStats = "https://www.thebluealliance.com/api/v3/team/frc" + formJson[formKeys[0]] + "/events/2024/statuses";
  //local variables to reset after every call
  var amountofevents = 0;
  var localAuto = 0;
  var localMatch = 0;
  var localStage = 0;
  if (displayStats){
  fetch(urlStats, {
    headers: {
      'X-TBA-Auth-Key': tba_key
    }
  }).then(res => res.json()).then(data => {
  
    var keyArray = Object.keys(data);
    keyArray.forEach((i) => {
      amountofevents++;
      /*
      pulls up the stats array. the following indexes are:
      0 - ranking score
      1 - avg coop
      2 - avg match
      3 - avg auto
      4 - avg stage
      

      */
      if (data[i] == null || data[i]['qual'] == null){ //event hasnt happened yet
        return; //stop processing
      }
      
      const statArray = data[i]['qual']['ranking']['sort_orders'];
      localAuto += statArray[3]
      localMatch += statArray[2]
      localStage += statArray[4]

      

      
    
     
      
      

    })

    //update const
    updateAvgAuto(localAuto);
    updateAvgMatch(localMatch);
    updateAvgStage(localStage);
    updateEventsPlayed(amountofevents);

    
  
   
    
  });

}
    
  
 
    
    


}
//assigning a constant variable to a function, e is the prop of the form.
function handleSubmit(e) { 
  e.preventDefault();
    updateStats(e);
    updateTeam(e); 
   
    
    
  }


function DisplayStats(){
  var num = avgAuto + avgMatch + avgStage / eventPlayed;
 
  updateAvgPoints( Math.round(num * 100) / 100);

  
  if (displayStats){
    return (
    <>
    <h2> During {currentTeam} season... </h2>
    <h3> They averaged {avgPoints} points this season over {eventPlayed} events </h3>
    <p>Average Auto: {Math.round((avgAuto/eventPlayed) * 100)/100}</p>
    <p>Average Match: {Math.round((avgMatch/eventPlayed) * 100)/100}</p>
    <p>Average Endgame: {Math.round((avgStage/eventPlayed) * 100)/100}</p>

    </>
    )
  }
  return;
}


  //the name attribute is the key
  return (
    <>
      <div>
      <img src = {teamImage} className='teamLogo' />
      </div>
      <a href = {teamWebsite} target='_blank' >{currentTeam}</a>
      <form method='post' onSubmit={handleSubmit}> 
        <label>
        <input type='number' name='team number'/> 
        <button type="submit">Submit</button>
        </label>
      </form>
      <DisplayStats />
      <div className='credit'>
      <p> Powered by the  <a href='https://www.thebluealliance.com/' target='_blank'>Blue Alliance</a> </p>
      </div>
    </>
  )
}

export default App
