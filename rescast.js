var TRAITS = {
	'A': 'Ambitious',
	'B': 'Callous',
	'C': 'Cautious',
	'D': 'Compassionate',
	'E': 'Impulsive',
	'F': 'Vigilant'
};

var JOBS = {
	'G': 'Security',
	'H': 'Politician',
	'I': 'Scientist'
};

function CastingConstraints(code) {
	this.traits = [];
	this.job = null;
	
	for (var i=0; i<code.length; i++) {
		var char = code[i];
		if (JOBS[char]) {
			this.job = char;
		} else if (TRAITS[char]) {
			this.traits.push(char);
		}
	}
}

CastingConstraints.prototype.code = function() {
	var code = this.job;
	if (this.traits[0] < this.traits[1]) {
		code += this.traits[0] + this.traits[1];
	} else {
		code += this.traits[1] + this.traits[0];
	}
	return code;
}

CastingConstraints.prototype.matches = function(selections) {
	if (this.job != selections.job) {
		return false;
	}
	
	for (characterTraitIndex in this.traits) {
		var characterTrait = this.traits[characterTraitIndex];
		
		var traitSelected = false;
		for (selectedTraitIndex in selections.traits) {
			var selectedTrait = selections.traits[selectedTraitIndex];
			if (characterTrait == selectedTrait) {
				traitSelected = true;
				break;
			}
		}
		
		if (!traitSelected) {
			return false;
		}
	}
	
	return true;
}

function normalizeCode(code) {
	return new CastingConstraints(code).code();
}

var CHARACTERS = {};

function Character(name, code) {
	this.name = name;
	this.constraints = new CastingConstraints(code);
	this.id = this.constraints.code();
	CHARACTERS[this.id] = this;
}

new Character('General Rosen', 'GAB');
new Character('Commander Garrity', 'GDF');
new Character('Dr. Solan', 'IAB');
new Character('President Carroll', 'HAC');
new Character('Secretary Highmore', 'HBF');
new Character('Dr. White', 'IBE');
new Character('Undersecretary Bourne', 'HCE');
new Character('Dr. Yu', 'IAD');
new Character('Agent Bale', 'GCF');
new Character('Secretary Stevenson', 'HEF');
new Character('Vice President Richardson', 'HAD');
new Character('Rev. LaMont', 'HBD');
new Character('Dr. Raines', 'IBC');
new Character('Dr. Calo', 'ICD');
new Character('Major Hughes', 'GCE');
new Character('Attache Byrne', 'GAC');
new Character('General Markoff', 'GAE');
new Character('Corporal Breckinridge', 'GDE');
new Character('Representative Harlan', 'HDE');
new Character('Senator Shields', 'HAF');
new Character('Deputy Thatcher', 'HBC');
new Character('Colonel Rothenberg', 'GCD');
new Character('Advisor Cahill', 'GAF');
new Character('Dr. Langdon', 'IDE');
new Character('Dr. Roma', 'ICE');
new Character('Dr. Hefetz', 'IDF');
new Character('Assistant Carlisle', 'IAC');
new Character('Dr. Elder', 'IBD');
new Character('Major Roderick', 'GAD');
new Character('Chief Obanhein', 'GBD');
new Character('Secretary Stern', 'HAB');
new Character('Secretary Gutierrez', 'HDF');
new Character('Manager Edwards', 'IBF');
new Character('Director Mercer', 'HCF');
new Character('Special Agent Pelletier', 'GBF');
new Character('Special Agent Epping', 'GBC');
new Character('Dr. Pollan', 'ICF');
new Character('Speaker Lancing', 'HAE');
new Character('Secretary Moorland', 'HBE');
new Character('Ambassador Stepman', 'HCD');
new Character('Dr. Kalish', 'IEF');
new Character('Dr. Cruz', 'IAF');
new Character('Lieutenant Danbridge', 'GBE');
new Character('Director Sullivan', 'GEF');
new Character('Assistant Zuckerman', 'IAE');

var players = [];

function playerSelections(player) {
	var traits = [];
	for (choiceIndex in player.choices) {
		var choice = player.choices[choiceIndex];
		if (choice.val() != '') {
			traits.push(choice.val());
		}
	}
	
	var job = null;
	if (player.jobSelect.val() != '') {
		job = player.jobSelect.val();
	}
	
	return {
		job: job,
		traits: traits
	};
}

function selectionsComplete(selections) {
	if (!selections.job)
		return false;

	if (selections.traits.length != 3)
		return false;
		
	if ($.unique(selections.traits).length < 2)
		return false;
		
	return true;
}

function matchingCharacters(selections) {
	var codes = [
	selections.job + selections.traits[0] + selections.traits[1],
	selections.job + selections.traits[1] + selections.traits[2],
	selections.job + selections.traits[0] + selections.traits[2]
	];
	
	codes = $.map(codes, normalizeCode);
	codes = $.unique(codes);
	
	var matches = $.map(codes, function(code) { return CHARACTERS[code] });
	return matches;
}

function refreshCastingOptionsCell(playerNumber) {
	var player = players[playerNumber];
	var optionsCell = player.castingOptionsCell;
	optionsCell.html('');
	
	if (player.characterId)
		return;
	
	var selections = playerSelections(player);	
	if (selectionsComplete(selections)) {
		var matches = matchingCharacters(selections);
		
		for (matchIndex in matches) {
			var match = matches[matchIndex];
			var button = $('<button>'+match.name+'</button>');
			if (match.playerNumber != null) {
				button.attr('disabled', 'disabled');
			}
			button.on('click', null, { playerNumber: playerNumber, characterId: match.id }, castButtonPressed);
			button.appendTo(optionsCell);
		}
	}
}

function castButtonPressed(event) {
	var player = players[event.data.playerNumber];
	var character = CHARACTERS[event.data.characterId];
	
	player.characterId = character.id;
	player.castingCell.html(character.name);
	
	player.row.find('select').attr('disabled', 'disabled');
	
	player.castingOptionsCell.html('');
	
	character.playerNumber = event.data.playerNumber;
	
	for (otherPlayer in players) {
		if (otherPlayer == event.data.playerNumber)
			continue;
		
		refreshCastingOptionsCell(otherPlayer);
	}
}

function choiceSelected(event) {
	refreshCastingOptionsCell(event.data);
}

function handleArrowKeys(event) {
	if (event.keyCode != 38 && event.keyCode != 40 && event.keyCode != 13)
		return true;
		
	var td = $(event.target).parent('td');
	var tr = td.parent('tr');
	var tdIndex = tr.children('td').index(td);

	var newTr;
	if (event.keyCode == 38) {
		newTr = tr.prev('tr');
	} else if (event.keyCode == 40 || event.keyCode == 13) {
		newTr = tr.next('tr');
	}
	
	var newTd = newTr.children('td:eq('+tdIndex+')');
	newTd.children('input, select').focus();
}

$(function() {
	var tbody = $('table tbody');
	for (var playerNumber=0; playerNumber<15; playerNumber++) {
		var choices = [];
		var rowClass = ((playerNumber + 1) % 2 == 0) ? 'even' : 'odd';
		var row = $('<tr class="'+rowClass+'"></tr>');
		var playerName = $('<input type="text"></input>');
		var playerNameCell = $('<td></td>');
		playerName.appendTo(playerNameCell);
		playerNameCell.appendTo(row);
		
		for (var choiceNumber=0; choiceNumber<3; choiceNumber++) {
			var choice = $('<select><option selected></option></select>');
			for (var traitLetter in TRAITS) {
				var option = $('<option value="'+traitLetter+'">'+TRAITS[traitLetter]+' ('+traitLetter+')</option>');
				option.appendTo(choice);
			}
			choice.on('change', null, playerNumber, choiceSelected);
			
			var cell = $('<td></td>');
			choice.appendTo(cell);
			choices.push(choice);
			
			cell.appendTo(row);
		}
		
		var jobSelect = $('<select><option selected></option></select>');
		for (var jobLetter in JOBS) {
			var option = $('<option value="'+jobLetter+'">'+JOBS[jobLetter]+' ('+jobLetter+')</option>');
			option.appendTo(jobSelect);
		}
		jobSelect.on('change', null, playerNumber, choiceSelected);
			
		var jobCell = $('<td></td>');
		jobSelect.appendTo(jobCell);		
		jobCell.appendTo(row);		
		
		var castingOptionsCell = $('<td></td>');
		castingOptionsCell.appendTo(row);
		
		var castingCell = $('<td></td>');
		castingCell.appendTo(row);
		
		var player = {
			playerName: playerName,
			choices: choices,
			jobSelect: jobSelect,
			castingOptionsCell: castingOptionsCell,
			castingCell: castingCell,
			row: row,
			characterId: null
		};
		
		players[playerNumber] = player;
		row.appendTo(tbody);
	}
	
	tbody.find('input, select, option').keydown(handleArrowKeys);
});