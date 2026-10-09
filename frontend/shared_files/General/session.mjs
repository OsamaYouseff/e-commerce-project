/**
 * True only when a saved profile AND its token cookie are both present.
 *
 * A saved profile is remembered data, not a session; the token cookie is what
 * actually expires. Callers must pass the profile out of whichever store held it
 * and the token cookie, and the two are ANDed. The previous inline checks wrote
 * `localInfo || (sessionInfo && token)`, so a "remember me" profile left in
 * localStorage reported a logged-in user for up to seven days after the token
 * cookie was gone.
 */
export function isLoggedIn({ localInfo, sessionInfo, token } = {}) {
  return Boolean((localInfo || sessionInfo) && token);
}
