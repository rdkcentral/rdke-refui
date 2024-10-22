# rdke-refui

Reference lightning based UI to showcase features and services of RDK reference platforms
This section details about how to customize the current UI source code and develop further.

**Follow the commands to run the application on you laptop.**

**Firstly install Lightning CLI:**
Type lng to confirm the installation. You will see the below output.

$ npm install -g @lightningjs/cli
$ lng
Usage: index lightning-cli <command> [options]

**Options:**
-V, --version output the version number
-h, --help display help for command

**Commands:**
create - Create a new Lightning App
build - Build a local development version of the Lightning App
serve - Start a local webserver and run a built Lightning App in a web browser
watch - Watch for file changes and automatically rebuild the App
dev - Build a local Lightning App, start a local webserver, run a built Lightning App in a web browser and watch for changes
docs - Open the Lightning-SDK documentation
dist [options] - Create a standalone distributable version of the Lightning App
upload - Upload the Lightning App to the Metrological Back Office to be published in an App Store
update - Update the Lightning-CLI to the latest version
help [command] - display help for command

**Clone repo :**
$ git clone "https://github.com/rdkcentral/rdke-refui"
$ cd rdke-refui
$ git checkout main
$ cd accelerator-home-ui
Note: if you are not able to launch offline UI, add .env file inside accelerator-home-ui/ and add 'LNG_BUNDLER=esbuild' to force the bundler. Make sure you have esbuild dependency (npm install esbuild)
$ npm install
Build
$ lng build

**Install as offline-app :**
$ cd accelerator-home-ui/dist/<es6>/Replace the dummy icons with original and then tar the entire contents to deploy on the offline UI location on device.
Note: On a RDKV reference device; the lighttpd webserver is configured to load the offline UI from DOCROOT which includes the alias of the above dist file mapped for loading. Usually the dist directory contents are placed in the STB's /home/root/lxresui/

**Host the app locally to test :**
$ lng serve
It will print the local url as : http://127.0.0.1:8080 which can be loaded as url to the residentApp.sh which is responsible for offline UI url loading on STB.
