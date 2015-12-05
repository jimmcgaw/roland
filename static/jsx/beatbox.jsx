var React = require('react');
var ReactDOM = require('react-dom');

(function(){
  
  var DEFAULT_BPM = 65;

  class ResultItem extends React.Component {
    render(){
      return (
        <li>
          <span>{this.props.result.name}</span>
          <button className="btn btn-default btn-xs" data-id={this.props.result.id} onClick={this.props.loadSound}>Play</button>
        </li>
      )
    }
  }

  class ResultsList extends React.Component {
    render(){
      return (
        <div>
          <ul>
            {this.props.results.map((result) => {
              return <ResultItem loadSound={this.props.loadSound} result={result} key={result.id} />
            })}
          </ul>
        </div>
      );
    }
  }

  class SearchBox extends React.Component {
    render(){
      return (
        <div>
          <div>
            <form role="form" onSubmit={this.props.onSearch}>
              <div className="row">
                <div className="form-group">
                <input className="form-control" type="text" id="search" />
                <button role="button" className="btn btn-xs btn-primary">Search</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    }
  }
  // SearchBox.propTypes

  class BeatBox extends React.Component {
    constructor(props){
      super(props);

      this.state = {
        results: [],
        tracks: [{
          'name': 'TRACK ONE'
        }]
      }
    }

    getSearchText(){
      // DOM hack alert. This is crap, change it.
      return $('#search').val();
    }

    onSearch(e){
      e.preventDefault();
      var data = {
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
      var soundId = $(e.target).data('id');
      var data = {
        'id': soundId
      };

      $.ajax('/get_sound', {
        type: 'get',
        data: data,
        success: this.onLoadSoundSuccess.bind(this)
      });
    }

    onLoadSoundSuccess(response){
      console.log(response);
      var audio = new Audio(response.download);
      audio.play();
    }

    render(){
      return (
        <div id="track-list">
          <TrackList tracks={this.state.tracks} />
          <SearchBox onSearch={this.onSearch.bind(this)} />
          <div>
            <ResultsList loadSound={this.loadSound.bind(this)} results={this.state.results} />
          </div>
        </div>
      );
    }
  }

  class TrackList extends React.Component {
    render(){
      return (
        <div class="track">
          {this.props.tracks.map((track) => {
            return <Track track={track} key={Math.random()} />
          })}
        </div>
      );
    }
  }

  class Track extends React.Component {
    render(){
      return (
        <div>{this.props.track.name}</div>
      )
    }
  }

  ReactDOM.render(<BeatBox />, document.getElementById('beatbox'));

  var bassDrum = new Audio('audio/dml_bass_drum.wav');

  class TimeKeeper {
    constructor(options){
      this._bpm = options.bpm;
      this._beatsPerMeasure = 8;
      this._ticksPerBeat = this._beatsPerMeasure / 2;
      this._currentMeasureBeat = 1;
      this._currentTimeout = undefined;

      this._init();
    }

    _tick(){
      console.log('tick');
      this._beat();
      this._currentTimeout = setTimeout(this._tick.bind(this), this._interval);
    }

    _init(){
      console.log('_init');
      this.setBpm(this._bpm);
      this._tick();
    }

    _flash(){
      $("#beat").fadeIn(10);
      setTimeout(function(){
        $('#beat').fadeOut(20);
      }, 3);
    }

    _beat(){
      console.log(this._currentMeasureBeat);
      var output = '&';
      if (this._currentMeasureBeat % 2 !== 0){
        // this._flash();
        bassDrum.play();  // play one sound on the downbeats for now
        if (this._currentMeasureBeat === 1){
          output = '1';
        } else if (this._currentMeasureBeat === 3){
          output = '2';
          
        } else if (this._currentMeasureBeat === 5){
          output = '3';
          
        } else if (this._currentMeasureBeat === 7){
          output = '4';
          
        }
      }
      $('#beat').text(output);
      if (this._currentMeasureBeat === this._beatsPerMeasure){
        this._currentMeasureBeat = 1;
      } else {
        this._currentMeasureBeat++;
      }
    }

    setBpm(bpm){
      this._bpm = bpm;
      this._interval = 60000 / this._bpm / this._ticksPerBeat;

      if (typeof this._currentTimeout !== 'undefined'){
        clearTimeout(this._currentTimeout);
        this._tick();
      }
    }
  }

  var timeKeeper = new TimeKeeper({
    bpm: DEFAULT_BPM
  });

  $('#bpm').slider({
    min: 20,
    max: 200,
    step: 1,
    value: DEFAULT_BPM
  }).on('slideStop', function(data){
    console.log(data);
    timeKeeper.setBpm(data.value);
  });
}());