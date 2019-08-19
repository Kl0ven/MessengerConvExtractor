var wtf8 = require('wtf-8');
const utils = require('./utils.js');

function getPseudoList (file, output) {
	var msgs = file.messages;

	var names = [];
	for (var i in msgs) {
		let m = msgs[i];
		if (m.hasOwnProperty('content') && m.content.includes('nickname')) {
			names.push(wtf8.decode(m.content));
		}
	}

	names.forEach(function (v) { output.write(v + '\n'); });
}

function getConvNames (file, output) {
	var msgs = file.messages;

	var names = [];
	for (var i in msgs) {
		let m = msgs[i];
		if (m.hasOwnProperty('content') && m.content.includes('named the group')) {
			names.push(wtf8.decode(m.content));
		}
	}

	names.forEach(function (v) { output.write(v + '\n'); });
}

function getNumbersOfMsgPerUser (file, output) {
	var participants = file.participants;
	var msgs = file.messages;
	var resultats = [];
	let pieData = [];
	let numberOfMsg = Object.keys(msgs).length;

	for (let i in participants) {
		let p = participants[i];
		resultats[p.name] = 0;
	}

	for (let i in msgs) {
		let m = msgs[i];
		resultats[m.sender_name] += 1;
	}

	for (var p in resultats) {
		output.write(wtf8.decode(p) + ', ' + resultats[p] + ',' + ((resultats[p] / numberOfMsg) * 100).toFixed(2) + '%\n');
		pieData.push({name: wtf8.decode(p), y: resultats[p], percent: ((resultats[p] / numberOfMsg) * 100).toFixed(2)});
	}

	return utils.createChartDetails(`Messages per user / Total : ${numberOfMsg}`, pieData);
}

function getMostReactedMessage (file, output) {
	var msgs = file.messages;
	var maxReactions = 0;
	var messages = [];
	for (var i in msgs) {
		let m = msgs[i];
		if (m.hasOwnProperty('reactions')) {
			if (m.reactions.length > maxReactions) {
				messages = [];
				messages.push(m);
				maxReactions = m.reactions.length;
			} else if (m.reactions.length === maxReactions) {
				messages.push(m);
			}
		}
	}
	output.write(`Max reaction is ${maxReactions}\n`);
	output.write('From thoses messages:\n');
	output.write(wtf8.decode(JSON.stringify(messages, null, 4)));
}

function getNumbersOfReactionPerUser (file, output) {
	var participants = file.participants;
	var msgs = file.messages;
	var resultats = [];
	let pieData = [];
	var numberOfReactions = 0;

	for (let i in participants) {
		let p = participants[i];
		resultats[p.name] = 0;
	}

	for (let i in msgs) {
		let m = msgs[i];
		if (m.hasOwnProperty('reactions')) {
			for (let r in m.reactions) {
				numberOfReactions += 1;
				let reaction = m.reactions[r];
				resultats[reaction.actor] += 1;
			}
		}
	}

	for (var p in resultats) {
		output.write(wtf8.decode(p) + ', ' + resultats[p] + ',' + ((resultats[p] / numberOfReactions) * 100).toFixed(2) + '%\n');
		pieData.push({name: wtf8.decode(p), y: resultats[p], percent: ((resultats[p] / numberOfReactions) * 100).toFixed(2)});
	}

	return utils.createChartDetails(`Reactions per user / Total : ${numberOfReactions}`, pieData);
}

function getNumberOfEmotPerUser (file, output) {
	var participants = file.participants;
	var msgs = file.messages;
	var resultats = [];
	let pieData = [];
	var numberOfEmots = 0;

	for (let i in participants) {
		let p = participants[i];
		resultats[p.name] = 0;
	}

	for (let i in msgs) {
		let m = msgs[i];
		let emots;
		if (m.hasOwnProperty('content')) {
			emots = utils.detectEmoji(m.content);
			numberOfEmots += emots.length;
			resultats[m.sender_name] += emots.length;
		}
	}
	for (var p in resultats) {
		output.write(wtf8.decode(p) + ', ' + resultats[p] + ',' + ((resultats[p] / numberOfEmots) * 100).toFixed(2) + '%\n');
		pieData.push({name: wtf8.decode(p), y: resultats[p], percent: ((resultats[p] / numberOfEmots) * 100).toFixed(2)});
	}
	return utils.createChartDetails(`Emots per user / Total : ${numberOfEmots}`, pieData);
}

function getNumberOfEmotPerEmot (file, output) {
	var msgs = file.messages;
	var resultats = [];
	let pieData = [];
	var numberOfEmots = 0;

	for (let i in msgs) {
		let m = msgs[i];
		let emots;
		if (m.hasOwnProperty('content')) {
			emots = utils.detectEmoji(m.content);
			numberOfEmots += emots.length;
			for (var e in emots) {
				if (resultats.hasOwnProperty(emots[e]) === false) {
					resultats[emots[e]] = 0;
				}
				resultats[emots[e]] += 1;
			}
		}
	}
	for (var p in resultats) {
		output.write(wtf8.decode(p) + ', ' + resultats[p] + ',' + ((resultats[p] / numberOfEmots) * 100).toFixed(2) + '%\n');
		pieData.push({name: wtf8.decode(p), y: resultats[p], percent: ((resultats[p] / numberOfEmots) * 100).toFixed(2)});
	}
	return utils.createChartDetails(`Emots usage / Total : ${numberOfEmots}`, pieData);
}

module.exports = {
	getPseudoList: getPseudoList,
	getNumbersOfMsgPerUser: getNumbersOfMsgPerUser,
	getMostReactedMessage: getMostReactedMessage,
	getConvNames: getConvNames,
	getNumbersOfReactionPerUser: getNumbersOfReactionPerUser,
	getNumberOfEmotPerUser: getNumberOfEmotPerUser,
	getNumberOfEmotPerEmot: getNumberOfEmotPerEmot
};
