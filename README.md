# Web Drum Kit

## Installation

This project uses Reactjs for UI components, and Python's Flask framework for any server-side processing required,
e.g. an endpoint for the main page, and other endpoints for calling any needed APIs to load data.

The project uses npm and pip to install JavaScript and Python dependencies, respectively. Download and install 
[node](https://nodejs.org/en/) to get npm, and install [pip](https://pypi.python.org/pypi/pip).

Also, this project uses virtualenv so that dependency installation does not affect the system python,
but a local project-only Python executable. Install [virtualenv](https://virtualenv.readthedocs.org/en/latest/installation.html) using pip. Then, create a virtualenv in your project locally by running

```$ virtualenv roload```

```$ cd roload```

Then, in order to enter the virtualenv, so that you are modifying your project Python instead of system one, run this inside of the project:

`$ source bin/activate`

Now, you can install Python dependencies by running:

`$ pip install -r requirements.txt`

Inside of the `/static/` dir, install npm packages by running (depending on how your npm path permissions are configured, you might need to run this as `sudo`, or consider using (nvm)[https://github.com/creationix/nvm] to manage your node versions):

`$ npm install`

Lastly, there are few utilities you'll need to run the build process. This is for compiling .JSX and EcmaScript 6 code down to ES5 JavaScript. Use npm to install the following packages globally on your machine:

```$ npm install -g webpack```

## Running

Run the application with (at project root):

`$ python app.py`

You can view the project running at [localhost:5000](http://locahost:5000/)

## Contributing

The client-side code for the React components lives in static/jsx. These are the files you should edit.

After editing a .JSX file, run the following command at project root:

```$ webpack ```

This will build the JavaScript file that's loaded into the browser. (see static/js directory for build output)

Alternately, you can run `$ webpack --watch`. This will leave a webpack process running in the background, polling for changes in the .JSX files. If you edit and save the file, webpack will detect this and retrigger the build process after each save.

The small bit of Python code responsible for handling server-side requests and proxying to external APIs resides in app.py.

## TODO

The audio files, when there are multiple that need to be played on a single beat, are loaded and played sequentially 
on each beat. This works reasonably well, but there are drawbacks. When the number of sounds we're playing gets numerous,
there will probably be a noticeable delay in playing the sounds in a chain. We should load all Audio files into a buffer
and play them from the buffer.

Also, the timing of the app is handled using a setTimeout chain with a potentially dynamic interval. We need a better
means of timekeeping (see the comment in the 'tick' method in the Beatbox component.)
