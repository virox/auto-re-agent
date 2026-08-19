'use strict';

var http = require('http');
var PORT = 8091;

function value(fn, fallback) {
    try {
        var result = fn();
        return typeof result === 'undefined' ? fallback : result;
    } catch (_) {
        return fallback;
    }
}

function metadataOf(info) {
    var metadata = value(function () { return info.playbackInfo.metadata; }, null);
    if (!metadata) return null;
    return {
        title: value(function () { return metadata.title; }, ''),
        artist: value(function () { return metadata.artist; }, ''),
        album: value(function () { return metadata.album; }, ''),
        author: value(function () { return metadata.author; }, ''),
        genre: value(function () { return metadata.genre; }, ''),
        duration: value(function () { return metadata.duration; }, ''),
        date: value(function () { return metadata.date; }, ''),
        description: value(function () { return metadata.description; }, ''),
        picture: value(function () { return metadata.picture; }, ''),
        seasonNumber: value(function () { return metadata.seasonNumber; }, 0),
        seasonTitle: value(function () { return metadata.seasonTitle; }, null),
        episodeNumber: value(function () { return metadata.episodeNumber; }, 0),
        episodeTitle: value(function () { return metadata.episodeTitle; }, null),
        resolutionWidth: value(function () { return metadata.resolutionWidth; }, 0),
        resolutionHeight: value(function () { return metadata.resolutionHeight; }, 0)
    };
}

function serverOf(info) {
    return {
        name: value(function () { return info.name; }, ''),
        state: value(function () { return info.state; }, ''),
        playback: {
            state: value(function () { return info.playbackInfo.state; }, ''),
            position: value(function () { return info.playbackInfo.position; }, 0),
            contentType: value(function () { return info.playbackInfo.contentType; }, ''),
            metadata: metadataOf(info)
        }
    };
}

function inspect(callback) {
    try {
        if (typeof tizen === 'undefined' || !tizen.mediacontroller) {
            callback({ ok: false, error: 'MediaController API is unavailable' });
            return;
        }
        var client = tizen.mediacontroller.getClient();
        client.findServers(function (servers) {
            var output = [];
            for (var i = 0; i < servers.length; i += 1) output.push(serverOf(servers[i]));
            var latest = value(function () { return client.getLatestServerInfo(); }, null);
            callback({
                ok: true,
                timestamp: new Date().toISOString(),
                latest: latest ? serverOf(latest) : null,
                servers: output
            });
        }, function (error) {
            callback({ ok: false, error: error.name + ': ' + error.message });
        });
    } catch (error) {
        callback({ ok: false, error: error.name + ': ' + error.message });
    }
}

http.createServer(function (request, response) {
    if (request.url !== '/status') {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Not found' }));
        return;
    }
    inspect(function (result) {
        response.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
        });
        response.end(JSON.stringify(result));
    });
}).listen(PORT, '0.0.0.0');
