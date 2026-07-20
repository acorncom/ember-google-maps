// Runtime replacement for the v1 build-time index.js `buildGoogleMapsUrl`.
export function buildGoogleMapsUrl(config = {}) {
  let {
    baseUrl = '//maps.googleapis.com/maps/api/js',
    channel,
    client,
    key,
    language,
    libraries,
    protocol,
    region,
    version,
    mapIds,
  } = config;

  if (!key && !client) {
    return '';
  }

  let src = baseUrl;
  let params = [];

  if (version) params.push('v=' + encodeURIComponent(version));
  if (client) params.push('client=' + encodeURIComponent(client));
  if (channel) params.push('channel=' + encodeURIComponent(channel));
  if (libraries && libraries.length) {
    params.push('libraries=' + encodeURIComponent(libraries.join(',')));
  }
  if (region) params.push('region=' + encodeURIComponent(region));
  if (language) params.push('language=' + encodeURIComponent(language));
  if (key) params.push('key=' + encodeURIComponent(key));
  if (mapIds) params.push('map_ids=' + encodeURIComponent(mapIds));
  if (protocol) src = protocol + ':' + src;

  return src + '?' + params.join('&');
}
