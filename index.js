/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');
var async = require('async');

const APP_ID = 'amzn1.ask.skill.708e00d5-cd41-41d3-ab73-869473008720';  // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'ja-JP': {
        translation: {
            SKILL_NAME: 'CoderDojo Hirakata',
            ERROR_MESSAGE: "イベント取得に失敗しました。",
            NOT_FOUND_MESSAGE: "イベントが見つかりませんでした",
            ABOUT_MESSAGE: "コーダー道場ひらかたは5歳〜17歳の子どもを対象にしたプログラミング道場です。\n" +
            "2011年にアイルランドで始まり、世界では65カ国・1100以上の道場、日本では全国に100以上の道場があります。\n" +
            "\n" +
            "コーダー道場ひらかたは、子どもたちが創りたい・実現したいことを\n" +
            "大人のエンジニアが一緒になって考える場所です。\n" +
            "そのため、教材やカリキュラムはありません。\n" +
            "\n" +
            "大人のエンジニアはプログラマーであり、コーダーであり、教育者ではありません。\n" +
            "だからこそ同じ目線で一緒になって考えてくれます。"
        }
    },
    'en-US': {
        translation: {
            SKILL_NAME: 'CoderDojo Hirakata',
            ERROR_MESSAGE: "イベント取得に失敗しました。",
            NOT_FOUND_MESSAGE: "イベントが見つかりませんでした",
            ABOUT_MESSAGE: "コーダー道場ひらかたは5歳〜17歳の子どもを対象にしたプログラミング道場です。\n" +
            "2011年にアイルランドで始まり、世界では65カ国・1100以上の道場、日本では全国に100以上の道場があります。\n" +
            "\n" +
            "コーダー道場ひらかたは、子どもたちが創りたい・実現したいことを\n" +
            "大人のエンジニアが一緒になって考える場所です。\n" +
            "そのため、教材やカリキュラムはありません。\n" +
            "\n" +
            "大人のエンジニアはプログラマーであり、コーダーであり、教育者ではありません。\n" +
            "だからこそ同じ目線で一緒になって考えてくれます。"
        }
    }
};

const handlers = {
    'GetRecentEvent': getRecentEvent,
    'GetAbout': function() {
        this.emit(':tell', this.t('ABOUT_MESSAGE'));
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function getRecentEvent()
{
    var handler = this;
    var response = '';
    async.waterfall([
        function getEvent(callback) {
            // イベント取得
            var options = {
                uri: "https://zen.coderdojo.com/api/2.0/events/search",
                headers: {
                    "Content-type": "application/json"
                },
                json: {
                    "query": {
                        "dojoId": "54fb4603-de0d-4de1-9fd9-518c5127caaa",
                        "limit$": 10,
                        "skip$": 0,
                        "sort$": {
                            "createdAt": -1
                        }
                    }
                }
            };
            request.post(options, function(error, response, body) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null, body);
            });
        },
        function createResponse(json, callback) {
            var lastDate = "";
            for (var i in json) {
                var row = json[i];
                var date = new Date(row.dates[0].startTime);
                var now = new Date();
                if (date.getTime() > now.getTime()) {
                    if (lastDate == "" || lastDate > date.getTime()) {
                        response = row.name + "が" + date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日に" + row.address + "で開催されます。";
                        lastDate = date.getTime();
                    }
                }
            }
            if (response === "") {
                response = handler.t("NOT_FOUND_MESSAGE");
            } else if (response === "error") {
                response = handler.t("ERROR_MESSAGE");
            }
            handler.emit(':tell', response);
        },
        function error(err) {
            console.log(err);
            response = "error";
        }
    ]);

}