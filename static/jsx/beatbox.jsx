var React = require('react');
var ReactDOM = require('react-dom');
import { Button, ButtonToolbar, Modal } from 'react-bootstrap';


(function(){
  
  const DEFAULT_BPM = 65;

  var getBpm = function(){
    let defaultBpm = DEFAULT_BPM;
    try{
        let cachedBpm = localStorage.getItem('beatbox-default-bpm');
        if (typeof cachedBpm !== 'undefined'){
          cachedBpm = parseInt(cachedBpm, 10);
          defaultBpm = cachedBpm;
        }

      } catch (e){}
    return defaultBpm;
  };

  class ResultItem extends React.Component {
    render(){
      return (
        <li>
          <input type="radio" name="audio" data-id={this.props.result.id} onClick={this.props.loadSound} /> {this.props.result.name}
          
        </li>
      )
    }
  }

  class ResultsList extends React.Component {
    render(){
      return (
        <div>
          <h3>Results</h3>
          <ul className="result-list">
            {this.props.results.map((result) => {
              return <ResultItem loadSound={this.props.loadSound} result={result} key={result.id} />
            })}
          </ul>
        </div>
      );
    }
  }

  class SelectedResult extends React.Component {
    constructor(props){
      super(props);
    }

    render(){
      let audio = this.props.selectedAudio;
      if (!_.isEmpty(audio)){
        return (
          <div>
            <h3>Selected Audio</h3>
            <div className="form-group">
              <label className="control-label">Name</label>: <div className="form-control-static">{this.props.selectedAudio.name}</div>
            </div>
            <div className="form-group">
              <label className="control-label">Duration</label>: <div className="form-control-static">{this.props.selectedAudio.duration}</div>
            </div>
            <div className="form-group">
              <label className="control-label">Description</label>: <div className="form-control-static">{this.props.selectedAudio.description}</div>
            </div>
            <div className="row">
              <Button onClick={this.props.onPlayPreview}><span className="ion-headphone"></span> Preview</Button>
              <Button onClick={this.props.onAddTrack} bsStyle="primary"><span className="ion-headphone"></span> Add Track</Button>
            </div>
          </div>
        );
      } else {
        return (
          <div>No audio selected.</div>
        );
      }
    }
  }

  class SearchBox extends React.Component {
    constructor(props){
      super(props);

      this.state = {
        results: []
      };
    }

    getSearchText(){
      // DOM hack alert. This is crap, change it.
      return $('#search').val();
    }

    onSearch(e){
      e.preventDefault();
      let data = {
        'q': this.getSearchText()
      };

      $.ajax('/search', {
        type: 'get',
        data: data,
        success: this.onSearchSuccess.bind(this)
      });
    }

    onSearchSuccess(response){
      console.log(response);
      this.setState({
        'results': response.results
      });
    }

    loadSound(e){
      let soundId = $(e.target).data('id');
      let data = {
        'id': soundId
      };

      $.ajax('/get_sound', {
        type: 'get',
        data: data,
        success: this.onLoadSoundSuccess.bind(this)
      });
    }

    onLoadSoundSuccess(audioData){
      console.log(audioData);
      this.props.onUpdateSelectedAudio(audioData);
      // let audio = new Audio(audioData.download);
      // audio.play();
    }

    render(){
      return (
        <div id="track-list">
          <div>
            <div>
              <form role="form" onSubmit={this.onSearch.bind(this)}>
                <div className="form-group">
                  <input className="form-control" type="search" id="search" placeholder="search for audio (e.g. snare, cowbell)" />
                </div>
              </form>
            </div>
          </div>
          <div className="row">
          <div className="col-md-6">
            <ResultsList loadSound={this.loadSound.bind(this)} results={this.state.results} />
          </div>
          <div className="col-md-6">
            <SelectedResult 
              selectedAudio={this.props.selectedAudio} 
              onPlayPreview={this.props.onPlayPreview} 
              onAddTrack={this.props.onAddTrack} />
          </div>
          </div>
        </div>
      );
    }
  }
  // SearchBox.propTypes
  // 

  class CreateTrackModal extends React.Component {
    constructor(props){
      super(props);

      this.state = {
        isLoadingPreview: false,
        selectedAudio: {},
        show: false
      };
    }

    showModal(){
      this.setState({show: true, selectedAudio: {} });
    }

    hideModal(){
      this.setState({show: false });
    }

    onAddTrack(){
      let selectedAudio = this.state.selectedAudio;
      let newTrack = {
        'id': Math.random(),
        'name': selectedAudio.name,
        'src': selectedAudio.download,
        'tickData': [1,0,0,0,0,0,0,0],
        'isEnabled': true
      };

      if (typeof newTrack.src !== 'undefined'){
        this.props.onAddTrack(newTrack);
      }
    }

    onUpdateSelectedAudio(audioData){
      this.setState({
        selectedAudio: audioData
      });
    }

    onPlayPreview(){
      var audioUrl = this.state.selectedAudio.download;
      new Audio(audioUrl).play();
    }

    render() {
      return (
        <ButtonToolbar>
          <Button bsStyle="primary" onClick={this.showModal.bind(this)}>
            Add Track <span className="ion-ios-plus"></span>
          </Button>

          <Modal
            {...this.props}
            show={this.state.show}
            bsSize="large"
            onHide={this.hideModal}
            dialogClassName="custom-modal">
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-lg">Create Track</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <SearchBox 
                selectedAudio={this.state.selectedAudio} 
                onUpdateSelectedAudio={this.onUpdateSelectedAudio.bind(this)} 
                onPlayPreview={this.onPlayPreview.bind(this)}
                onAddTrack={this.onAddTrack.bind(this)} />
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="default" onClick={this.hideModal.bind(this)}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.hideModal.bind(this)}>Finish</Button>
            </Modal.Footer>
          </Modal>
        </ButtonToolbar>
      );
    }
  }


  class TimeKeeper extends React.Component {
    constructor(props){
      super(props);

      this._beatsPerMeasure = 4;
      this._ticksPerBeat = 2;

      // cyclic index variable of current tick in current measure
      // range over time is [0 - this._beatsPerMeasure*this._ticksPerBeat)
      this._currentTickIndex = 0;
      this._nextTimeout = undefined;

      let defaultBpm = getBpm();

      this.setBpmAndInterval(defaultBpm);

    }

    onStart(){
      this.props.onStart();
      this.tick();
    }

    onStop(){
      this.props.onStop();
      this.stop();
    }

    render(){
      return (
        <div className="row">
          <div className="col-md-2">
            <StartStop onStart={this.onStart.bind(this)} onStop={this.onStop.bind(this)} isPlaying={this.props.isPlaying} />
          </div>
          <div className="col-md-4">
            <BeatsPerMinute onUpdate={this.setBpmAndInterval.bind(this)} />
          </div>
          <div className="col-md-4">

          </div>
        </div>
      );
    }

    setBpmAndInterval(bpm){
      this.bpm = parseInt(bpm, 10);
      
      localStorage.setItem('beatbox-default-bpm', this.bpm);
      const minSeconds = 60000;
      let beatLength = minSeconds / this.bpm;
      let tickLength = beatLength / this._ticksPerBeat;
      this._interval = tickLength;
    }

    stop(){
      clearTimeout(this._nextTimeout);
    }

    // this is method that fires at each interval, triggers the audio to play,
    // and sets up the next tick at this._interval milliseconds in the future.
    // setTimeout doesn't actually promise that an event will fire at
    // t0 + interval; it queues up the action to be handled by the single JavaScript thread
    // at some time t1 >= t0 + interval. So if the JS thread gets busy, there may be delays
    // in firing the next tick.
    // In short: this works for now, but we need a more deterministic means of timekeeping
    // on the client.
    tick(){
      console.log('tick');
      this.props.onTick(this._currentTickIndex);

      if (this._currentTickIndex >= (this._ticksPerBeat*this._beatsPerMeasure-1)){
        this._currentTickIndex = 0;
      } else {
        this._currentTickIndex++;
      }

      this._nextTimeout = setTimeout(this.tick.bind(this), this._interval);
        
    }

  }

  // depends on bootstrap-slider plug-in
  class BeatsPerMinute extends React.Component {
    componentDidMount(){
      $('#bpm')
        .slider({
          min: 20,
          max: 200,
          step: 1,
          value: getBpm()
        }).on('slideStop', (data) => {
          this.props.onUpdate(data.value);
        });
    }

    render(){
      return (
        <form role="form">
          <div className="form-group">
            <div className="ion ion-speedometer"></div>
            <div className="bpm-slider">
              <input id="bpm" type="text"/>
            </div>
          </div>
        </form>
      )
    }
  }

  class StartStop extends React.Component {
    constructor(props){
      super(props);
    }

    render(){
      if (this.props.isPlaying){
        return (
          <div>
            <button className="btn btn-danger" onClick={this.props.onStop}>
              <span className="ion ion-pause"></span>
            </button>
          </div>
        );
      } else {
        return (
          <div>
            <button className="btn btn-success" onClick={this.props.onStart}>
              <span className="ion ion-play"></span>
            </button>  
          </div>
        );
      }
    }
  }


  class BeatBox extends React.Component {
    constructor(props){
      super(props);

      this.state = {
        isPlaying: false,
        results: [],
        tracks: [
          {
            'id': 1,
            'name': 'Bass Drum',
            'src': 'audio/dml_bass_drum.wav',
            'tickData': [1,0,1,0,1,0,1,0],
            'isEnabled': true
          },
          {
            'id': 2,
            'name': 'Snare Drum',
            'src': 'audio/snare_drum.wav',
            'tickData': [0,0,1,0,0,0,1,0],
            'isEnabled': true
          }
        ]
      }

      this.updateAudioCache();
      
    }

    updateAudioCache(){
      this.audioCache = this.audioCache || new AudioCache();
      let self = this;
      _.each(this.state.tracks, (track) => {
        self.audioCache.setKey(track.download, new Audio(track.download));
      });
    }

    onStart(){
      console.log('onStart');
      this.setState({
        isPlaying: true
      });
    }

    onStop(){
      this.setState({
        isPlaying: false
      });
    }

    onTick(tickIndex){
      console.log('onTick');
      console.log(tickIndex);
      this.playTickAudio(tickIndex);

    }

    // play tracks where the data for the track at the beat index is non-zero
    playTickAudio(tickIndex){
      let tracks = this.state.tracks.filter((track) => {
        return track.isEnabled && track.tickData[tickIndex] !== 0;
      });

      let audios = _.map(tracks, (track) => {
        if (typeof this.audioCache.getKey(track.src) !== 'undefined'){
          return this.audioCache.getKey(track.src)
        } else {
          let audio = new Audio(track.src);
          this.audioCache.setKey(track.src, audio);
          return audio;
        }
      });

      // TODO: instead of sequentially processing all the sounds
      // on each tick, we should load all the sounds into a single
      // audio buffer and play them from there.
      _.each(audios, (audio) => audio.play() );

    }

    updateTrackState(trackId, newState){
      let tracks = this.state.tracks;
      _.each(tracks, (track) => {
        if (track.id === trackId){
          for (var key in newState){
            track[key] = newState[key];
          }
        }
      });

      this.setState({
        'tracks': tracks
      });
    }

    onAddTrack(track){
      console.log('onAddTrack');
      let tracks = this.state.tracks;
      tracks.push(track);
      this.setState({ tracks: tracks });
      console.log(this.state.tracks);
      this.updateAudioCache();
    }

    onChangeTick(trackId, tickIndex, newTickState){
      let tracks = this.state.tracks;
      _.each(tracks, (track) => {
        if (track.id === trackId){
          track.tickData[tickIndex] = newTickState ? 1 : 0;
        }
      });

      this.setState({
        'tracks': tracks
      });
    }

    render(){
      return (
        <div>
          <div id="controls">
            <TimeKeeper 
              onStop={this.onStop.bind(this)}
              onStart={this.onStart.bind(this)}
              isPlaying={this.state.isPlaying} 
              onTick={this.onTick.bind(this)} />
          </div>
          <div id="panel">
            <TrackList 
              tracks={this.state.tracks} 
              onAddTrack={this.onAddTrack.bind(this)}
              updateTrackState={this.updateTrackState.bind(this)}
              onChangeTick={this.onChangeTick.bind(this)} />
          </div>
        </div>
      );
    }
  } 

  class AudioCache {
    constructor(props){
      this._cache = {};
    }

    getKey(key){
      return this._cache[key];
    }

    setKey(key, value){
      if (typeof value.play === 'undefined'){
        console.log('must be an instance of Audio');
        return;
      } else {
        this._cache[key] = value;
      }
    }
  }  

  class TrackList extends React.Component {
    constructor(props){
      super(props);
    }

    render(){
      return (
        <div className="tracks">
          <div className="row">
            <div className="col-md-10">
              <h3>Tracks</h3>
            </div>
            <div className="col-md-2">
              <CreateTrackModal onAddTrack={this.props.onAddTrack} />
            </div>
          </div>
          {this.props.tracks.map((track) => {
            return <Track track={track} key={track.id} updateTrackState={this.props.updateTrackState} onChangeTick={this.props.onChangeTick} />
          })}
        </div>
      );
    }
  }

  class TickBox extends React.Component {
    render(){
      return (
        <input type="checkbox" checked={this.props.isEnabled} data-tick_index={this.props.tickIndex} onChange={this.props.onChangeTick} />
      );
    }
  }

  class Track extends React.Component {
    constructor(props){
      super(props);

      let track = props.track;
      this.audio = new Audio(track.src);
      this.tickData = track.tickData;
    }

    onChange(e){
      console.log(e);
      var newEnabledState = $(e.target).is(':checked');
      this.props.updateTrackState(this.props.track.id, {'isEnabled': newEnabledState });
    }

    onChangeTick(e){
      console.log(e);
      var newTickState = $(e.target).is(':checked');
      var tickIndex = $(e.target).data('tick_index');

      this.props.onChangeTick(this.props.track.id, tickIndex, newTickState);
    }

    render(){
      let track = this.props.track;
      let trackStyles = {
        'fontWeight': 'bold'
      };
      var tickIndices = [0,1,2,3,4,5,6,7];
      var tickCheckboxes = _.map(tickIndices, (tickIndex) => {
        return <TickBox 
          isEnabled={!!track.tickData[tickIndex]}
          key={Math.random()}
          tickIndex={tickIndex}
          onChangeTick={this.onChangeTick.bind(this)} />
      });

      return (
        <div className="track row">
          <div className="col-md-4">
            <div styles={trackStyles}>{track.name}</div>
            <span className="ion-headphone"></span> <input type="checkbox" checked={track.isEnabled} onChange={this.onChange.bind(this)} />
          </div>
          <div className="col-md-4">
            {tickCheckboxes}
          </div>
        </div>
      )
    }
  }

  // is this the best way of conditionalizing the rendering of React components?
  if ($('#beatbox').length > 0){
    ReactDOM.render(<BeatBox />, document.getElementById('beatbox'));
  }

  
}());