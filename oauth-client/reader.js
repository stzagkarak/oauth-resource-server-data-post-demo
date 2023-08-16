import ClientOAuth2 from "client-oauth2";

const client_id = "88cb3151-fdf8-4c3f-a21d-b497385a2760";
const client_secret = "31lnZ54Qfv_h8ziFdV2hmu416s";

let oauth_client = new ClientOAuth2({
    clientId: client_id,
    clientSecret: client_secret,
    scopes: ["read:temp"],
    authorizationUri: "http://127.0.0.1:4444/oauth2/auth",
    accessTokenUri: "http://127.0.0.1:4444/oauth2/token"
})

oauth_client.credentials.getToken({
    query: {
        "audience": "http://localhost:5999"
    }
})
.then(async (user) => {
    console.log(user.data.access_token);

    fetch("http://localhost:5999/temperature/chania", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + user.data.access_token
        }
    })
    .then(async res => {
        const body = await res.json();
        console.log(body);
    })
})


