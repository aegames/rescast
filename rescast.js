var traits = {
	'A': 'Ambitious',
	'B': 'Callous',
	'C': 'Cautious',
	'D': 'Compassionate',
	'E': 'Impulsive',
	'F': 'Vigilant'
};

var jobs = {
	'G': 'Security',
	'H': 'Politician',
	'I': 'Scientist'
};

function characterConstraints(code) {
	var constraints = {
		traits: [],
		job: null
	};
	
	for (var i=0; i<code.length; i++) {
		var char = code[i];
		if (jobs[char]) {
			constraints.job = char;
		} else if (traits[char]) {
			constraints.traits.push(char);
		}
	}
	
	return constraints;
}

var characters = [
  {
    name: 'General Rosen',
    constraints: characterConstraints('GAB')
  },
  {
    name: 'Commander Garrity',
    constraints: characterConstraints('GDF')
  },
  {
    name: 'Dr. Solan',
    constraints: characterConstraints('IAB')
  },
  {
    name: 'President Carroll',
    constraints: characterConstraints('HAC')
  },
  {
    name: 'Secretary Highmore',
    constraints: characterConstraints('HBF')
  },
  {
    name: 'Dr. White',
    constraints: characterConstraints('IBE')
  },
  {
    name: 'Undersecretary Bourne',
    constraints: characterConstraints('HCE')
  },
  {
    name: 'Dr. Yu',
    constraints: characterConstraints('IAD')
  },
  {
    name: 'Agent Bale',
    constraints: characterConstraints('GCF')
  },
  {
    name: 'Secretary Stevenson',
    constraints: characterConstraints('HEF')
  },
  {
    name: 'Vice President Richardson',
    constraints: characterConstraints('HAD')
  },
  {
    name: 'Rev. LaMont',
    constraints: characterConstraints('HBD')
  },
  {
    name: 'Dr. Raines',
    constraints: characterConstraints('IBC')
  },
  {
    name: 'Dr. Calo',
    constraints: characterConstraints('ICD')
  },
  {
    name: 'Major Hughes',
    constraints: characterConstraints('GCE')
  },
  {
    name: 'Attache Byrne',
    constraints: characterConstraints('GAC')
  },
  {
    name: 'General Markoff',
    constraints: characterConstraints('GAE')
  },
  {
    name: 'Corporal Breckinridge',
    constraints: characterConstraints('GDE')
  },
  {
    name: 'Representative Harlan',
    constraints: characterConstraints('HDE')
  },
  {
    name: 'Senator Shields',
    constraints: characterConstraints('HAF')
  },
  {
    name: 'Deputy Thatcher',
    constraints: characterConstraints('HBC')
  },
  {
    name: 'Colonel Rothenberg',
    constraints: characterConstraints('GCD')
  },
  {
    name: 'Advisor Cahill',
    constraints: characterConstraints('GAF')
  },
  {
    name: 'Dr. Langdon',
    constraints: characterConstraints('IDE')
  },
  {
    name: 'Dr. Roma',
    constraints: characterConstraints('ICE')
  },
  {
    name: 'Dr. Hefetz',
    constraints: characterConstraints('IDF')
  },
  {
    name: 'Assistant Carlisle',
    constraints: characterConstraints('IAC')
  },
  {
    name: 'Dr. Elder',
    constraints: characterConstraints('IBD')
  },
  {
    name: 'Major Roderick',
    constraints: characterConstraints('GAD')
  },
  {
    name: 'Chief Obanhein',
    constraints: characterConstraints('GBD')
  },
  {
    name: 'Secretary Stern',
    constraints: characterConstraints('HAB')
  },
  {
    name: 'Secretary Gutierrez',
    constraints: characterConstraints('HDF')
  },
  {
    name: 'Manager Edwards',
    constraints: characterConstraints('IBF')
  },
  {
    name: 'Director Mercer',
    constraints: characterConstraints('HCF')
  },
  {
    name: 'Special Agent Pelletier',
    constraints: characterConstraints('GBF')
  },
  {
    name: 'Special Agent Epping',
    constraints: characterConstraints('GBC')
  },
  {
    name: 'Dr. Pollan',
    constraints: characterConstraints('ICF')
  },
  {
    name: 'Speaker Lancing',
    constraints: characterConstraints('HAE')
  },
  {
    name: 'Secretary Moorland',
    constraints: characterConstraints('HBE')
  },
  {
    name: 'Ambassador Stepman',
    constraints: characterConstraints('HCD')
  },
  {
    name: 'Dr. Kalish',
    constraints: characterConstraints('IEF')
  },
  {
    name: 'Dr. Cruz',
    constraints: characterConstraints('IAF')
  },
  {
    name: 'Lieutenant Danbridge',
    constraints: characterConstraints('GBE')
  },
  {
    name: 'Director Sullivan',
    constraints: characterConstraints('GEF')
  },
  {
    name: 'Assistant Zuckerman',
    constraints: characterConstraints('IAE')
  }
];

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
	return (selections.job && selections.traits.length == 3);
}

function characterMatches(character, selections) {
	var constraints = character.constraints;
	
	if (constraints.job != selections.job) {
		return false;
	}
	
	for (characterTraitIndex in constraints.traits) {
		var characterTrait = constraints.traits[characterTraitIndex];
		
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

function matchingCharacters(selections) {
	var matches = [];
	
	for (characterIndex in characters) {
		var character = characters[characterIndex];
		if (characterMatches(character, selections)) {
			matches.push(character);
		}
	}
	
	return matches;
}

function choiceSelected(event) {
	var playerNumber = event.data;
	var player = players[playerNumber];
	var selections = playerSelections(player);
	
	var optionsCell = player.castingOptionsCell;
	optionsCell.html('');
	if (selectionsComplete(selections)) {
		var matches = matchingCharacters(selections);
		
		for (matchIndex in matches) {
			var match = matches[matchIndex];
			var button = $('<button>'+match.name+'</button>');
			button.appendTo(optionsCell);
		}
	}
}

$(function() {
	var tbody = $('table tbody');
	for (var playerNumber=0; playerNumber<15; playerNumber++) {
		var choices = [];
		var row = $('<tr></tr>');
		var playerName = $('<input type="text"></input>');
		playerName.appendTo(row);
		
		for (var choiceNumber=0; choiceNumber<3; choiceNumber++) {
			var choice = $('<select><option selected></option></select>');
			for (var traitLetter in traits) {
				var option = $('<option value="'+traitLetter+'">'+traitLetter+': '+traits[traitLetter]+'</option>');
				option.appendTo(choice);
			}
			choice.on('change', null, playerNumber, choiceSelected);
			
			var cell = $('<td></td>');
			choice.appendTo(cell);
			choices.push(choice);
			
			cell.appendTo(row);
		}
		
		var jobSelect = $('<select><option selected></option></select>');
		for (var jobLetter in jobs) {
			var option = $('<option value="'+jobLetter+'">'+jobLetter+': '+jobs[jobLetter]+'</option>');
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
			row: row
		};
		
		players[playerNumber] = player;
		row.appendTo(tbody);
	}
});