# Tizen Media Session Probe

Read-only experiment for checking whether a Samsung TV application publishes
playback state through Tizen's MediaController API.

The probe is intended to run as a TizenBrew autolaunched service. While it is
running, `http://<tv-address>:8091/status` returns the activated media-controller
servers and their playback metadata, or the exact Tizen API/privilege error.

TizenBrew loads service modules through jsDelivr, so deployment requires this
directory to be available in a public GitHub repository and added to TizenBrew
using a module string such as `gh/<owner>/<repository>@<revision>`.
