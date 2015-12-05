from flask import Flask, render_template, jsonify, request
app = Flask(__name__, static_url_path='')

import urllib2
import urllib
import json

FREESOUND_API_BASE_URL = 'http://www.freesound.org/apiv2/'
FREESOUND_API_SEARCH_PATH = 'search/text/'
FREESOUND_API_CLIENT_ID = '1de59c6fa4ed40620364'
FREESOUND_API_CLIENT_SECRET = 'e2506301bc68791697b47c4b4ecbaf7382b8016e'

@app.route("/")
def index():
  return render_template('index.html')

def build_url(q):
  return ''.join([
    FREESOUND_API_BASE_URL,
    FREESOUND_API_SEARCH_PATH,
    '?query=',
    q,
    '&token=',
    FREESOUND_API_CLIENT_SECRET
  ])

@app.route('/search')
def search():
  q = request.args.get('q', '')
  response = {}
  if len(q) > 0:
    url = build_url(q)
    cn = urllib2.urlopen(url)
    response = json.loads( cn.read() )

  return jsonify(**response)

def build_sound_url(soundId):
  return ''.join([
    FREESOUND_API_BASE_URL,
    'sounds/',
    soundId,
    '?token=',
    FREESOUND_API_CLIENT_SECRET
  ])

@app.route('/get_sound')
def sound():
  sound_id = request.args.get('id', 0)
  response = {}
  if sound_id > 0:
    url = build_sound_url(sound_id)
    cn = urllib2.urlopen(url)
    response = json.loads( cn.read() )
  return jsonify(**response)

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.DEBUG)
    app.run()