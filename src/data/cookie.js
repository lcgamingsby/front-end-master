export function setJWTCookie(token) {
    // just like JWT from backend, the lifespan is 1 day
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));

    let expires = "expires=" + d.toUTCString();

    let jwt = `jwtToken=${token}; ${expires}; path=/; samesite=strict; secure; httpOnly;`;

    document.cookie = jwt;
}

export function getJWTCookie() {
    
}