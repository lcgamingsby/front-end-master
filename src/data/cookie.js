export function setJWTCookie(token) {
    // just like JWT from backend, the lifespan is 1 day
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));

    let expires = "expires=" + d.toUTCString();

    let jwt = `jwtToken=${token}; ${expires}; path=/; samesite=strict; secure; httpOnly;`;

    document.cookie = jwt;
}

export function getJWTCookie() {
    let ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf("jwtToken=") === 0) {
            return c.substring("jwtToken=".length, c.length);
        }
    }

    return "";
}