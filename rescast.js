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

// http://diveintohtml5.info/storage.html
function browserSupportsStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

function setStorageStatus(status) {
	if (!browserSupportsStorage()) {
		setStorageError("Browser doesn't support HTML5 local storage.  Your casting will not be saved.");
	} else {
		$('.storage-status').removeClass('error').html(status);
	}
}

function setStorageError(error) {
	$('.storage-status').addClass('error').html(error);
}

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

function Character(name, code, pairings) {
	this.name = name;
	this.constraints = new CastingConstraints(code);
	this.id = this.constraints.code();
	if (pairings != null) {
		this.pairings = pairings;
	} else {
		this.pairings = [];
	}
	CHARACTERS[this.id] = this;
}

Character.prototype.matchingPlayers = function(excludes) {
	var character = this;
	if (excludes == null) {
		excludes = [];
	}
	
	return $.grep(players, function(player) {
		if ($.inArray(player, excludes) != -1) {
			return false;
		}
		
		if (player.characterId != null) {
			return (player.characterId == character.id);
		} else {
			return character.constraints.matches(player.selections());
		}
	});
}

Character.PairingStatus = {
	POSSIBLE: 1,
	NA: 0,
	IMPOSSIBLE: -1
};

Character.prototype.pairingStatusForPlayer = function(player) {
	if (this.pairings.length == 0) {
		return Character.PairingStatus.NA;
	}
	
	for (i in this.pairings) {
		var pairing = this.pairings[i];
		var character = CHARACTERS[pairing];
		if (character.matchingPlayers([player]).length > 0 ) {
			return Character.PairingStatus.POSSIBLE;
		}
	}
	
	return Character.PairingStatus.IMPOSSIBLE;
}

new Character('General Rosen', 'GAB');
new Character('Commander Garrity', 'GDF', ['GDE']);
new Character('Dr. Solan', 'IAB', ['IBC']);
new Character('President Carroll', 'HAC', ['HAE', 'GCF']);
new Character('Secretary Highmore', 'HBF');
new Character('Dr. White', 'IBE', ['HAD']);
new Character('Undersecretary Bourne', 'HCE');
new Character('Dr. Yu', 'IAD', ['IDE']);
new Character('Agent Bale', 'GCF', ['HAC']);
new Character('Secretary Stevenson', 'HEF');
new Character('Vice President Richardson', 'HAD', ['IBE']);
new Character('Rev. LaMont', 'HBD');
new Character('Dr. Raines', 'IBC', ['IAB', 'ICD']);
new Character('Dr. Calo', 'ICD', ['IBC']);
new Character('Major Hughes', 'GCE');
new Character('Attache Byrne', 'GAC', ['GAE']);
new Character('General Markoff', 'GAE', ['GAC']);
new Character('Corporal Breckinridge', 'GDE', ['GDF']);
new Character('Representative Harlan', 'HDE');
new Character('Senator Shields', 'HAF');
new Character('Deputy Thatcher', 'HBC');
new Character('Colonel Rothenberg', 'GCD');
new Character('Advisor Cahill', 'GAF');
new Character('Dr. Langdon', 'IDE', ['IAD']);
new Character('Dr. Roma', 'ICE', ['IDF']);
new Character('Dr. Hefetz', 'IDF', ['ICE']);
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
new Character('Speaker Lancing', 'HAE', ['HAC']);
new Character('Secretary Moorland', 'HBE');
new Character('Ambassador Stepman', 'HCD');
new Character('Dr. Kalish', 'IEF');
new Character('Dr. Cruz', 'IAF');
new Character('Lieutenant Danbridge', 'GBE');
new Character('Director Sullivan', 'GEF');
new Character('Assistant Zuckerman', 'IAE');

var players = [];

function Selections(job, traits) {
	this.job = job;
	this.traits = traits;
}

Selections.prototype.complete = function() {
	if (!this.job)
		return false;

	if (this.traits.length != 3)
		return false;
		
	if ($.unique(this.traits).length < 2)
		return false;
		
	return true;
}

Selections.prototype.matchingCharacters = function() {
	var codes = [
	this.job + this.traits[0] + this.traits[1],
	this.job + this.traits[1] + this.traits[2],
	this.job + this.traits[0] + this.traits[2]
	];
	
	codes = $.map(codes, normalizeCode);
	codes = $.unique(codes);
	
	var matches = $.map(codes, function(code) { return CHARACTERS[code] });
	return matches;
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

function Player(row, playerNumber) {
	this.row = row;
	this.playerNumber = playerNumber;
	this.choices = [];
	
	this.playerName = $('<input type="text"></input>');
	this.playerNameCell = $('<td></td>');
	this.playerName.appendTo(this.playerNameCell);
	this.playerNameCell.appendTo(this.row);
	this.playerName.on("change", null, this.playerNumber, function (event) { players[event.data].saveStateToStorage(); });
	
	var choiceSelected = function(event) {
		players[event.data].refreshCastingOptionsCell();
		players[event.data].saveStateToStorage();
	};
		
	for (var choiceNumber=0; choiceNumber<3; choiceNumber++) {
		var choice = $('<select><option selected></option></select>');
		for (var traitLetter in TRAITS) {
			var option = $('<option value="'+traitLetter+'">'+TRAITS[traitLetter]+' ('+traitLetter+')</option>');
			option.appendTo(choice);
		}
		choice.on('change', null, this.playerNumber, choiceSelected);
			
		var cell = $('<td></td>');
		choice.appendTo(cell);
		this.choices.push(choice);
			
		cell.appendTo(this.row);
	}
		
	this.jobSelect = $('<select><option selected></option></select>');
	for (var jobLetter in JOBS) {
		var option = $('<option value="'+jobLetter+'">'+JOBS[jobLetter]+' ('+jobLetter+')</option>');
		option.appendTo(this.jobSelect);
	}
	this.jobSelect.on('change', null, this.playerNumber, choiceSelected);
			
	var jobCell = $('<td></td>');
	this.jobSelect.appendTo(jobCell);		
	jobCell.appendTo(this.row);		
		
	this.castingOptionsCell = $('<td></td>');
	this.castingOptionsCell.appendTo(this.row);
		
	this.castingCell = $('<td></td>');
	this.castingCell.appendTo(this.row);
	
	this.characterId = null;
	
	this.loadStateFromStorage();
}

Player.prototype.selections = function() {
	var traits = [];
	for (choiceIndex in this.choices) {
		var choice = this.choices[choiceIndex];
		if (choice.val() != '') {
			traits.push(choice.val());
		}
	}
	
	var job = null;
	if (this.jobSelect.val() != '') {
		job = this.jobSelect.val();
	}
	
	return new Selections(job, traits);
}

Player.prototype.refreshCastingCell = function() {
	if (!this.characterId) {
		this.castingCell.html("");
		return;
	}
	
	var character = CHARACTERS[this.characterId];	
	this.castingCell.html(character.name + " ");
	
	var playerNumber = this.playerNumber;
	
	var undoLink = $('<a href="#">(undo)</a>');
	undoLink.bind('click', function() {
		if (confirm("Are you sure?")) {
			players[playerNumber].uncast();
		}
	});
	undoLink.appendTo(this.castingCell);
}

Player.prototype.refreshCastingOptionsCell = function() {
	var optionsCell = this.castingOptionsCell;
	optionsCell.html('');
	
	if (this.characterId)
		return;
	
	var selections = this.selections();	
	if (selections.complete()) {
		var matches = selections.matchingCharacters();
		
		for (matchIndex in matches) {
			var match = matches[matchIndex];
			var button = $('<button>'+match.name+'</button>');
			if (match.playerNumber != null) {
				button.attr('disabled', 'disabled');
			}
			
			var pairingStatus = match.pairingStatusForPlayer(this);
			if (pairingStatus == Character.PairingStatus.POSSIBLE) {
				button.addClass('recommended');
			} else if (pairingStatus == Character.PairingStatus.IMPOSSIBLE) {
				button.addClass('discouraged');
			}
			
			button.on('click', null, { playerNumber: this.playerNumber, characterId: match.id }, 
				function(event) {
					players[event.data.playerNumber].cast(event.data.characterId);
				});
			button.appendTo(optionsCell);
		}
	}
}

Player.prototype.cast = function(characterId) {
	var character = CHARACTERS[characterId];
	
	this.characterId = character.id;
	this.refreshCastingCell();
	this.row.find('select').attr('disabled', 'disabled');
	
	this.castingOptionsCell.html('');
	
	character.playerNumber = this.playerNumber;
	
	for (otherPlayer in players) {
		if (otherPlayer == this.playerNumber)
			continue;
		
		players[otherPlayer].refreshCastingOptionsCell();
	}
	
	this.saveStateToStorage();
}

Player.prototype.uncast = function() {
	var character = CHARACTERS[this.characterId];
	
	this.characterId = null;
	if (character) {
		character.playerNumber = null;
	}

	this.row.find('select').removeAttr('disabled');
	this.castingCell.html("");
	
	for (playerNumber in players) {
		players[playerNumber].refreshCastingOptionsCell();
	}
	
	this.saveStateToStorage();
}

Player.prototype.getState = function() {
	var state = {};
	
	state.playerName = this.playerName.val();
	
	state.choices = [];
	for (var choiceNumber=0; choiceNumber<3; choiceNumber++) {
		var choice = this.choices[choiceNumber];
		var choiceValue = choice.find('option:selected').val();
		state.choices.push(choiceValue);
	}
	
	state.job = this.jobSelect.val();
	state.characterId = this.characterId;
	
	return state;
}

Player.prototype.setState = function(state) {
	this.playerName.val(state.playerName);
		
	for (var choiceNumber=0; choiceNumber<3; choiceNumber++) {
		var choiceValue = state.choices[choiceNumber];
		var choice = this.choices[choiceNumber];
			
		choice.find('option[value='+choiceValue+']').attr('selected', 'selected');
	}
		
	this.jobSelect.find('option[value='+state.job+']').attr('selected', 'selected');
		
	this.characterId = state.characterId;
	if (this.characterId) {
		this.cast(this.characterId);
	}
}

Player.prototype.loadStateFromStorage = function() {
	setStorageStatus("Loading player "+this.playerNumber+"...");
	
	if (browserSupportsStorage()) {
		var storageKey = "rescast.players["+this.playerNumber+"]";
		if (localStorage[storageKey]) {
			this.setState(JSON.parse(localStorage[storageKey]));
		}
	}
}

Player.prototype.saveStateToStorage = function() {
	setStorageStatus("Saving player "+this.playerNumber+"...");
	
	if (browserSupportsStorage()) {
		var storageKey = "rescast.players["+this.playerNumber+"]";
		localStorage[storageKey] = JSON.stringify(this.getState());
	}
	
	setStorageStatus("Ready.");
}

function getAllPlayerStates() {
	playerStates = {};
	for (playerNumber in players) {
		playerStates[playerNumber] = players[playerNumber].getState();
	}
	return playerStates;
}

$(function() {
	setStorageStatus("Initializing ResCast...");
	
	var tbody = $('table tbody');
	for (var playerNumber=0; playerNumber<15; playerNumber++) {
		
		var rowClass = ((playerNumber + 1) % 2 == 0) ? 'even' : 'odd';
		var row = $('<tr class="'+rowClass+'"></tr>');
		
		players[playerNumber] = new Player(row, playerNumber);		
		row.appendTo(tbody);
	}
	
	for (var playerNumber=0; playerNumber<15; playerNumber++) {
		players[playerNumber].refreshCastingOptionsCell();
	}
	
	setStorageStatus("Ready.");
	
	tbody.find('input, select, option').keydown(handleArrowKeys);
});