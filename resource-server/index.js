import express from "express";
import bodyParser from "body-parser";
import { Configuration, OAuth2Api } from "@ory/client";

const ory = new OAuth2Api( new Configuration({
    basePath: "http://127.0.0.1:4445"
})
);

let db = [];

async function introspectToken(accessToken) {
    const { data } = await ory.introspectOAuth2Token({
        token: accessToken
    })

    return data;
}

const app = express()
const port = 5999

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/test/introspection", async (req, res) => {

    const token = req.headers.authorization.split(" ")[1]

    const data = await introspectToken(token)
    console.log(data)
    return res.send({status: "thanks"});
})

function checkScopeExists(scopes, check) {
    
    for( let i =0; i < scopes.length; ++i ) {    
        const tk = scopes[i].split(":");
        console.log(tk)
        if(tk.length < 2) {
            continue; // invalid scope
        }
        if(tk[0] == check || tk[1] == check) 
            return true

    }

    return false;    
}

app.post("/temperature/chania", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]

    const data = await introspectToken(token)
    if(data.active == false) {
        return res.status(404).send({status: "Expired or Invalid Access Token"})
    }
    
    const scopes = data.scope.split(" ");
    console.log(scopes)
    if(checkScopeExists(scopes, "write") && checkScopeExists(scopes, "temp")) {
        console.log(req.body)
        db.push(req.body)
        return res.status(200).send({status: "success"});
    }

    res.status(404).send({status: "Missing required scope(s) [ write:temp ]"});
})

app.get("/temperature/chania", async (req, res) => {

    const token = req.headers.authorization.split(" ")[1]

    const data = await introspectToken(token)
    if(data.active == false) {
        return res.status(404).send({status: "Expired or Invalid Access Token"})
    }
    
    const scopes = data.scope.split(" ");
    if(checkScopeExists(scopes, "read") && checkScopeExists(scopes, "temp")) {
        return res.status(200).send({data: db});
    }

    return res.status(404).send({status: "Missing required scope(s) [ read:temp ]"});
})

app.listen(port, () => {
    console.log(`Resource Server listening on port ${port}`)
})
