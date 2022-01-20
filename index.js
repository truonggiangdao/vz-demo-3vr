const compression = require('compression');
var express = require('express');
var server = express();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const MODES = {
  VIEW: 'view.skynav.app',
  TESTING_VIEW: 'testing.view.skynav.app',
  PREVIEW: 'preview.skynav.app',
  TESTING_PREVIEW: 'testing.preview.skynav.app',
};

server.use(compression());
var indexFile = 'index.html',
  rootPath = process.env.PORT === '5000' ? __dirname : '/home/site/wwwroot';
var redirects = {
  'daytonabeach.skynav.app': 'https://view.skynav.app/daytona-beach-cvb',
  'daytonabeachpartner.skynav.app':
    'http://view.skynav.app/daytona-beach-partners',
  'hiltondaytonabeach.skynav.app':
    'http://view.skynav.app/hilton-daytona-beach',
  'perrysresort.skynav.app': 'https://view.skynav.app/perrys-ocean-edge-resort',
  'ponceinletlighthouse.skynav.app':
    'https://view.skynav.app/ponce-inlet-lighthouse',
};
var testingRedirects = {
  'previewskynav-testing.azurewebsites.net':
    'https://testing.preview.skynav.app',
  'viewskynav-testing.azurewebsites.net': 'https://testing.view.skynav.app',
};

// Handle site redirect
server.use(function (req, res, next) {
  if (redirects[req.get('host')]) {
    return res.redirect(301, redirects[req.get('host')]);
  }
  if (testingRedirects[req.get('host')]) {
    const newUrl = testingRedirects[req.get('host')] + req.originalUrl;
    return res.redirect(301, newUrl);
  }
  next();
});

// Handle static contents
server.use(
  '/',
  express.static(rootPath, {
    index: indexFile,
    setHeaders: function (res) {
      res.set('Feature-Policy', 'autoplay *');
    },
  })
);

var isProd = function (host) {
  return host === MODES.VIEW || host === MODES.PREVIEW;
};

const isPublishedTour = (host) => {
  switch (host) {
    case MODES.VIEW:
    case MODES.TESTING_VIEW:
      return true;

    default:
      return false;
  }
};

var defaultMetaData = {
  name: 'SKYNAV | Virtual Tours For Travel &amp; Real Estate, Virtual Tour Software',
  tagline:
    'SKYNAV offers 360 &amp; 3D virtual tours using virtual tour technology with panoramic photography, VR and 360 video. Our company offers virtual tours for travel, leisure, master-planned communities and universities.',
};

var getPreloadJsonScript = (jsonData) => {
  var jsonStr = JSON.stringify(jsonData);
  jsonStr = jsonStr
    .replace(/</g, '__OPEN_TAG__')
    .replace(/>/g, '__CLOSE_TAG__');
  return `<script type="text/preload" charset="utf-8" id="json-data">${jsonStr}</script>`;
};

var updateSiteMetadata = function (
  indexRaw,
  { name, tagline, logoUrl, introImageUrl, previewImgUrl, json, jsonSrc },
  host
) {
  const defaultLogoUrl = `https://${host}/apple-touch-icon.png`;
  const nameNew = [name || '', defaultMetaData.name]
    .filter((x) => !!x)
    .join(' | ');
  const taglineNew = [tagline || '', defaultMetaData.tagline]
    .filter((x) => !!x)
    .join(' | ');
  return indexRaw
    .replace('__SITE_TITLE__', nameNew)
    .replace('__PRIMARY_TITLE__', nameNew)
    .replace('__PRIMARY_DESC__', taglineNew)
    .replace('__OG_TITLE__', nameNew)
    .replace('__OG_DESC__', taglineNew)
    .replace(
      '__OG_IMAGE__',
      previewImgUrl || introImageUrl || logoUrl || defaultLogoUrl
    )
    .replace('__TW_TITLE__', nameNew)
    .replace('__TW_DESC__', taglineNew)
    .replace(
      '__TW_IMAGE__',
      previewImgUrl || introImageUrl || logoUrl || defaultLogoUrl
    )
    .replace(
      '<noscript>CUSTOM-SCRIPT</noscript>',
      jsonSrc ? getPreloadJsonScript(json) : '<!--NO-JSON-->'
    );
};

const getDefaultScene = (sceneId, scenes) => {
  let scene;
  if (sceneId) {
    scene = scenes.find(
      (scene) => scene.friendlyName === sceneId || scene.id === sceneId
    );
    if (scene) return scene;
  }
  const defaultScene = scenes.find((scene) => scene.isDefault);
  return defaultScene || scenes[0] || {};
};

const loadTourDetail = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.data) return null;
    else return data.data;
  } catch (error) {}
};

const loadTourJsons = async (baseUrl, tourId, isPublished) => {
  try {
    const reqBody = {
      tours: [tourId],
    };
    if (isPublished) reqBody.isPublished = isPublished;
    const res = await fetch(`${baseUrl}Tours/json`, {
      method: 'PATCH',
      body: JSON.stringify(reqBody),
    });
    const { data } = await res.json();
    if (data && data.length) {
      if (isPublished) return data.find((d) => d.isPublished) || null;
      else return data.pop();
    }
  } catch (error) {}
};

const loadFromUrl = async (jsonUrl) => {
  try {
    const res = await fetch(jsonUrl + '?v=' + new Date().getTime());
    return await res.json();
  } catch (error) {}
};

const loadTourJson = async (baseUrl, tourId, isPublished) => {
  const data = { json: null, tour: null, jsonSrc: null };
  try {
    const tour = await loadTourDetail(`${baseUrl}Tours/${tourId}/detail`);
    if (tour && tour.id) {
      const jsonRecord = await loadTourJsons(baseUrl, tour.id, isPublished);
      if (jsonRecord && jsonRecord.jsonUrl) {
        const json = await loadFromUrl(jsonRecord.jsonUrl);
        if (json) {
          data.json = json;
          data.tour = json.tour;
          data.jsonSrc = jsonRecord.jsonUrl;
        }
      }
    }
  } catch (error) {}
  return data;
};

// Handle SEO
var handleSEO = async (req, res) => {
  const tourId = req.params.tourId;
  const sceneId = req.params.sceneId;
  const host = req.get('host');
  const raw = fs.readFileSync(path.join(rootPath, indexFile), 'utf8');

  if (tourId) {
    const prod = isProd(host);
    const isPublished = isPublishedTour(host);
    const baseUrl = `https://${prod ? '' : 'testing.'}api.skynav.app/api/`;
    const { tour, json, jsonSrc } = await loadTourJson(
      baseUrl,
      tourId,
      isPublished
    );
    if (!tour && !json) {
      const defaultHtml = updateSiteMetadata(raw, {}, host);
      res.send(defaultHtml);
      return;
    }
    const { scenes } = json;
    var scene = getDefaultScene(sceneId, scenes);

    const { name, tagline, logoUrl, introImageUrl } = tour;
    const { previewImgUrl } = scene;
    const dataForSEO = {
      name,
      tagline,
      logoUrl,
      introImageUrl,
      previewImgUrl,
      json,
      jsonSrc,
    };
    const updateHtml = updateSiteMetadata(raw, dataForSEO, host);
    res.send(updateHtml);
  } else {
    const defaultHtml = updateSiteMetadata(raw, {}, host);
    res.send(defaultHtml);
  }
};

server.get('/', handleSEO);
server.get('/:tourId/:groupId/:sceneId/*', handleSEO);
server.get('/:tourId/:groupId/:sceneId', handleSEO);
server.get('/:tourId/:groupId', handleSEO);
server.get('/:tourId', handleSEO);
server.get('*', handleSEO);

// Serve the website using Express
server.listen(process.env.PORT);
