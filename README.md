# Web Drum Kit

## Installation

This project uses Reactjs for UI components, and Python's Flask framework for any server-side processing required,
e.g. an endpoint for the main page, and other endpoints for calling any needed APIs to load data.

The project uses npm and pip to install JavaScript and Python dependencies, respectively. Download and install 
[node](https://nodejs.org/en/) to get npm, and install [pip](https://pypi.python.org/pypi/pip).

Also, this project uses virtualenv so that dependency installation does not affect the system python,
but a local project-only Python executable. Install [virtualenv](https://virtualenv.readthedocs.org/en/latest/installation.html) using pip. Then, create a virtualenv in your project locally by running

`$ virtualenv roload`
`$ cd roload`

Then, in order to enter the virtualenv, so that you are modifying your project Python instead of system one, run this inside of the project:

`$ source bin/activate`

Now, you can install Python dependencies by running:

`$ pip install -r requirements.txt`

Install npm packages by running (depending on how your npm path permissions are configured, you might need to run this as `sudo`, or consider using (nvm)[https://github.com/creationix/nvm] to manage your node versions):

`$ npm install`

## Running

Run the application with (at project root):

`$ python app.py`

You can view the project running at [localhost:5000](http://locahost:5000/)