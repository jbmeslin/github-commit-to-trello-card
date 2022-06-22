import * as axios from 'axios';
import * as core from '@actions/core';
import * as github from '@actions/github';

const {context = {}} = github;
const {pull_request} = context.payload;

const trelloApiKey = core.getInput('trello-api-key', {required: true});
const trelloAuthToken = core.getInput('trello-auth-token', {required: true});
const trelloBoardId = core.getInput('trello-board-id', {required: true});
const trelloCardId = core.getInput('trello-card-id', {required: true});
const trelloMessage = core.getInput('trello-message', {required: true});
const trelloCardAction = core.getInput('trello-card-action', {required: true});


function getCardNumber(message) {
    return trelloCardId;
}

async function getCardOnBoard(board, message) {
    console.log(`getCardOnBoard(${board}, ${message})`);
    let card = getCardNumber(message);
    if (card && card.length > 0) {
        let url = `https://trello.com/1/boards/${board}/cards/${card}`
        return await axios.get(url, {
            params: {
                key: trelloApiKey,
                token: trelloAuthToken
            }
        }).then(response => {
            return response.data.id;
        }).catch(error => {
            console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
            return null;
        });
    }
    return null;
}

async function addCommentToCard(card, user, message, link) {
    console.log(`addCommentToCard(${card}, ${user}, ${message}, ${link})`);
    let url = `https://api.trello.com/1/cards/${card}/actions/comments`;
    return await axios.post(url, {
        key: trelloApiKey,
        token: trelloAuthToken,
        text: `${user}: ${message} ${link}`
    }).then(response => {
        return response.status == 200;
    }).catch(error => {
        console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
        return null;
    });
}

async function run() {
    const data = pull_request;
    let url = data.html_url || data.url;
    let message = data.title;
    let user = data.user.name;
    console.log(`user message (${user}, ${message})`);
    let card = await getCardOnBoard(trelloBoardId, message);
    if (card && card.length > 0) {
        if (trelloCardAction && trelloCardAction.toLowerCase() == 'comment') {
            await addCommentToCard(card, user, trelloMessage, url);
        }
    }
}

run()