import { SessionToken } from '@mapbox/search-js-core';

export function sessionToken() {
  let sessionToken = new SessionToken();
  return sessionToken.id
}