/** API CONFIGURATIONS **/

// spotify web api
export const SPOTIFY = {
    authUrl: "https://accounts.spotify.com/authorize",
    clientId: "c32e2b8a2a74444f9448149ddd2d22d8",
    clientSecret: "bc1a9f6e6cb543278f55e30d25ea1b4a",
    redirectUri: 'http://localhost:9000/auth/callback',
    scopes: [
        "user-top-read",
        "user-read-currently-playing",
        "user-read-playback-state"
    ]
}

// openweathermaps api
export const OWM = {
    clientId: "61005c04e2164479f6b4fa8e51cb8535"
}