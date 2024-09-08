import {useQuery} from "@tanstack/react-query";
import {SpotifyUser} from "../types/SpotifyUser";
import {CurrentSong} from "../types/CurrentSong";

export const GetSpotifyUserProfile = async () => {
    const clientId = ""; // Replace with your client id
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    
    if (!code) {
        await redirectToAuthCodeFlow(clientId);
    } else {
        const accessToken = await getAccessToken(clientId, code);
        const profile: SpotifyUser = await fetchProfile(accessToken);
        console.log("profile", profile);
        const currentSong = await fetchCurrentSong(accessToken);
        console.log("currentSong", currentSong);
        return profile;
        // populateUI(profile);
    }

    async function redirectToAuthCodeFlow(clientId: string) {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem("verifier", verifier);

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", "http://localhost:8080/");
        params.append("scope", "user-read-private user-read-email");
        params.append("code_challenge_method", "S256");
        params.append("code_challenge", challenge);

        document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    async function getAccessToken(clientId: string, code: string): Promise<string> {
        const verifier = localStorage.getItem("verifier");

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", "http://localhost:8080/");
        params.append("code_verifier", verifier!);

        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        const {access_token} = await result.json();
        return access_token;
    }

    async function fetchProfile(token: string): Promise<SpotifyUser> {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET", headers: { Authorization: `Bearer ${token}` }
        });

        return await result.json();
    }
    
    async function fetchCurrentSong(token: string): Promise<CurrentSong> {
        const result = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            method: "GET", headers: { Authorization: `Bearer ${token}`}
            });
        
        return await result.json();
    }
    
    function populateUI(profile: SpotifyUser) {
        document.getElementById("displayName")!.innerText = profile.display_name;
        if (profile.images[0]) {
            const profileImage = new Image(200, 200);
            profileImage.src = profile.images[0].url;
            document.getElementById("avatar")!.appendChild(profileImage);
        }
        document.getElementById("id")!.innerText = profile.id;
        document.getElementById("email")!.innerText = profile.email;
        document.getElementById("uri")!.innerText = profile.uri;
        document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
        document.getElementById("url")!.innerText = profile.href;
        document.getElementById("url")!.setAttribute("href", profile.href);
        document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
    }
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export const useSpotifyUserProfile = () => {
    return useQuery(({queryKey:['testSpotify'], queryFn: GetSpotifyUserProfile}))
}


