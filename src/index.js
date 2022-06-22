import * as axios from 'axios';
import * as core from '@actions/core';
import * as github from '@actions/github';

const {context = {}} = github;
const { pull_request, head_commit } = context.payload;


const trelloApiKey = core.getInput('trello-api-key', {required: true});
const trelloAuthToken = core.getInput('trello-auth-token', {required: true});
const trelloBoardId = core.getInput('trello-board-id', {required: true});
const trelloCardId = core.getInput('trello-card-id', {required: true});
const trelloMessage = core.getInput('trello-message', {required: true});
const trelloCardAction = core.getInput('trello-card-action', {required: true});


function getCardNumber() {
    return trelloCardId;
}

async function getCardOnBoard(board, message) {
    console.log(`getCardOnBoard(${board}, ${message})`);
    let card = getCardNumber();
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

async function addCommentToCard(card, message) {
    console.log(`addCommentToCard(${card}, ${message})`);
    let url = `https://api.trello.com/1/cards/${card}/actions/comments`;
    return await axios.post(url, {
        key: trelloApiKey,
        token: trelloAuthToken,
        text: `${message}`
    }).then(response => {
        return response.status == 200;
    }).catch(error => {
        console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
        return null;
    });
}

async function run() {

    let card = await getCardOnBoard(trelloBoardId, trelloMessage);
    if (card && card.length > 0) {
        if (trelloCardAction && trelloCardAction.toLowerCase() == 'comment') {
            await addCommentToCard(card, trelloMessage);
        }
    }
}

run()