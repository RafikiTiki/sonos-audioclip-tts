/*
 The MIT License (MIT)

 Original Copyright 2018 Phil Nash
 Modifications and addtions Copyright (c) 2015 Sonos, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      speechText: '',
      hhOptions: [],
      playerOptions: [],
      playerId: '',
      playerIds: [],
    };
    this.playerIds = []
    this.textChange = this.textChange.bind(this);
    this.hhChange = this.hhChange.bind(this);
    this.onHouseholdChange = this.onHouseholdChange.bind(this);
    this.playerChange = this.playerChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

// right off the bat, let's call our private API and get a list of the available hhs for this user
  componentDidMount() {
    fetch('/api/households')
      .then(response => response.json())
      .then(json => {
        if (json.success) { // alright, we got something
          let firstHousehold = json.households[0].id
          if (json.households.length > 1) { // if there's more than one, we'll want to populate the picklist, because we'll be showing that
            const opts=[];
            for (let hh of json.households) {
              opts.push(<option value={hh.id}>{hh.id}</option>);
            }
            this.setState({
              hh: firstHousehold,
              hhOptions: opts
            })
          }
          else { // if there's only one, let's just grab it. we won't even be showing the picklist
            this.setState({
              hh: firstHousehold
            });
          }
          this.hhChange(firstHousehold);
        }
        else if (json.authRequired) { // if we weren't successful, let's check and see if we've been told to auth, and if so, send user to auth endpoint
          window.location='http://localhost:3001/auth';
        }
        else { // if all else fails, just put an error on the screen and let the user figure it out
          this.setState({
            error:json.error
          });
        }
      });
  }


  textChange(event) {
    this.setState({ speechText: event.target.value });
  }

  playerChange(event) {
    if (event.target.value !== 'all') {
      this.setState({ playerId: event.target.value, playerIds: [event.target.value] });
    } else {
      this.setState({ playerId: 'all', playerIds: this.playerIds })
    }
  }

  onHouseholdChange(event) {
    const { value: hh } = event.target
    this.hhChange(hh)
  }

// whenever the household changes, let's get a list of available speakers
  hhChange(householdId) {
    fetch(`/api/clipCapableSpeakers?household=${householdId}`)
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          const opts=[];
          this.playerIds = []
          for (let player of json.players) {
            opts.push(<option value={player.id}>{player.name}</option>);
            this.playerIds.push(player.id)
          }
          opts.push(<option value={'all'}>All speakers</option>)
          this.setState({
            playerIds: [json.players[0].id],
            playerOptions: opts,
            hh: householdId,
          })
        }
        else {
          this.setState({
            error:json.error
          });
        }
      });

  }

  say = text => {
    this.setState({ // here we're clearing out any error that might have been on the screen before
      error:''
    });
    console.log(this.playerIds)
    // fetch(`/api/speakText?text=${encodeURIComponent(text)}&playerId=${this.state.playerId}`)
    console.log('this.state.playerIds', this.state.playerIds)
    const playerIdsQueryString = this.state.playerIds.reduce((result, playerId) => {
      return `${result}&playerIds[]=${playerId}`
    }, '')
    fetch(`/api/speakText?text=${encodeURIComponent(text)}${playerIdsQueryString}`)
      .then(response => response.json())
      .then(state => this.setState(state))
      .catch(err => this.setState({error:err.stack}));
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.say(this.state.speechText)
    // this.setState({ // here we're clearing out any error that might have been on the screen before
    //   error:''
    // });
    // fetch(`/api/speakText?text=${encodeURIComponent(this.state.speechText)}&playerId=${this.state.playerId}`)
    //   .then(response => response.json())
    //   .then(state => this.setState(state))
    //   .catch(err => this.setState({error:err.stack}));
  }

  sayShlug = (event) => {
    event.preventDefault();
    this.say('Idziemy na szluga')
  }

  drinkVodka = (event) => {
    event.preventDefault();
    this.say('Lej kielona')
  }

  sayGoodnight = (event) => {
    event.preventDefault();
    this.say('Dobra, czas do spanka')
  }

  buyMeABeer = (event) => {
    event.preventDefault()
    this.say('Ej ziomek, kup mi browarka plx')
  }

  roll = (event) => {
    event.preventDefault()
    this.say('Kręcimy pacana')
  }

  playFifa = (event) => {
    event.preventDefault()
    this.say('Dawaj gramy meczyk')
  }

  sayGit = (event) => {
    event.preventDefault()
    this.say('GIT!')
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>
            Sonos Text to Speech.
          </h2>
          <form onSubmit={this.handleSubmit}>
            <div id="hhSelector" style={{display: this.state.hhOptions.length > 1?'block':'none'}}>
                <label htmlFor="targetHH">Select your target household: </label>
                <select
                  id="targetHH"
                  onChange={this.onHouseholdChange}
                  value={this.state.hh}
                >
                  {this.state.hhOptions}
                </select><br/>
            </div>
          <label htmlFor="targetPlayer">Select your target player: </label>
            <select
              id="targetPlayer"
              value={this.state.playerId}
              onChange={this.playerChange}
            >
              {this.state.playerOptions}
            </select><br/>
            <label htmlFor="speechText">Enter your text to speak: </label>
            <input
              id="speechText"
              type="text"
              value={this.state.speechText}
              onChange={this.textChange}
            /><br/>
          <button type="submit" disabled={!this.state.speechText}>Submit</button>
          <button onClick={this.sayShlug}>Idziemy na szluga</button>
          <button onClick={this.drinkVodka}>Lej wódę</button>
          <button onClick={this.sayGoodnight}>Spanko</button>
          <button onClick={this.buyMeABeer}>Kup piwko</button>
          <button onClick={this.roll}>Zwijamy jaranko</button>
          <button onClick={this.playFifa}>Gramy meczyk</button>
          <button onClick={this.sayGit}>Git</button>
          </form>
          {this.state.error}
        </header>
      </div>
    );
  }
}

export default App;
