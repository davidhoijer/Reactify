import Box from "@mui/material/Box";
import React from "react";
import Typography from "@mui/material/Typography";
import {Button} from "@mui/material";
import { atom } from 'jotai'

const priceAtom = atom(10)
const messageAtom = atom('hello')
const productAtom = atom(
    { id: 12, name: 'good stuff' })

type AuthType = {
    clientId: string
    clientSecret: string
    accessToken: string
    refreshToken: string
    authCode: string
    status: boolean
}

type EndpointsType = {
    auth: string
    token: string
}

const atomAuth = atom<AuthType>({
    clientId: "",
    clientSecret: "",
    accessToken: "",
    refreshToken: "",
    authCode: "",
    status: false
})

const atomEndpoints = atom<EndpointsType>({
    auth: "",
    token: ""
})

// ADD ATOM/JOTAI FOR GLOBAL STATES

const searchParams = new URLSearchParams()
const currentParams = new URLSearchParams(window.location.search)
console.log(searchParams)
console.log(atomAuth)
console.log("sadfasfd", atom((get) => get(atomAuth)))

function Authorize(){
    
    return <Box>
        <Typography>
            Nowify is a simple Spotify 'Now Playing' screen designed for the Raspberry
            Pi. Login with Spotify below and start playing some music! 
            Spotify hex: #1DB954
            Background hex: #2c3e50
        </Typography>

        <Button color={"primary"} sx={{mt:2, borderRadius: 50}} variant={"contained"}>
            Login with Spotify
        </Button>
    </Box>
}


function InitAuthorize() {
    let auth = atom((get) => get(atomAuth));
    let endpoints = atom((get) => get(atomEndpoints));


    
    // let authUrl = SetAuthUrl(auth, endpoints);
    // window.location.href = `${endpoints.auth}?${searchParams.toString()}`
}

// function GetUrlAuthCode(auth: Auth) {
//     const urlAuthCode = currentParams.get('code')
//
//     if (!urlAuthCode) {
//         return
//     }
//
//     auth.authCode = urlAuthCode
// }

// async function RequestAccessTokens (grantType: string = 'authorization_code', 
//                                     auth: Auth, endpoints: Endpoints) {
//     let fetchData = {
//         grant_type: grantType,
//         code: "",
//         redirect_uri: "",
//         refresh_token: ""
//     }
//
//     if (grantType === 'authorization_code') {
//         fetchData.code = auth.authCode
//         fetchData.redirect_uri = window.location.origin
//     }
//
//     if (grantType === 'refresh_token') {
//         fetchData.refresh_token = auth.refreshToken
//     }
//
//     const queryBody = new URLSearchParams(fetchData).toString()
//    
//     const clientDetails = {
//         data: `${auth.clientId}:${auth.clientSecret}`
//     }
//
//     const res = await fetch(`${endpoints.token}`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             Authorization: `Basic ${clientDetails}`
//         },
//         body: queryBody
//     })
//    
//     const accessTokenResponse = await res.json()
//     console.log(accessTokenResponse)
//    
//     handleAccessTokenResponse(accessTokenResponse)
// }

// function HandleAccessTokenResponse(accessTokenResponse: any) {
//     /**
//      * Auth token expired.
//      */
//     if (accessTokenResponse.error?.error === 'invalid_grant') {
//         return
//     }
//
//     /**
//      * Access Token has expired.
//      */
//     if (accessTokenResponse.error?.status === 401) {
//         this.auth.authCode = ''
//         this.auth.status = false
//
//         return
//     }
// }

// function SetAuthUrl(auth: Auth, endpoints: Endpoints) {
//     searchParams.toString()
//     searchParams.append('client_id', auth.clientId)
//     searchParams.append('response_type', 'code')
//     searchParams.append('redirect_uri', window.location.origin)
//     searchParams.append(
//         'state',
//         [
//             Math.random()
//                 .toString(33)
//                 .substring(2),
//             Math.random()
//                 .toString(34)
//                 .substring(3),
//             Math.random()
//                 .toString(35)
//                 .substring(4),
//             Math.random()
//                 .toString(36)
//                 .substring(5)
//         ].join('-')
//     )
//     searchParams.append('scope', 'user-read-currently-playing')
//
//     return `${endpoints.auth}?${searchParams.toString()}`
// }

export default Authorize;