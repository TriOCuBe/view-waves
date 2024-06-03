// Events.on(DepositEvent, event => {
// 	var spawns = Vars.spawner.countSpawns();
// 	const myDialog = new BaseDialog("Title");
// 	Vars.state.rules.spawns.forEach(function(group) {
// 		if (group.type == null) return;

// 		let spawned = group.getSpawned(Vars.state.wave - 1) * spawns;
// 		if (spawned == 0) return;
// 		myDialog.cont.add(group.type.toString() + " " + spawned.toString() + " (flying: " + group.type.flying + ")");
// 		myDialog.cont.add("\n");
// 	});
// 	myDialog.addCloseButton();
// 	myDialog.show();
// })

const { ImageButtonStyle } = ImageButton;
const { TextButtonStyle } = TextButton;

Events.on(ClientLoadEvent, () => {
	const wavesTable = Vars.ui.hudGroup.find("waves");

	const [ statustable, infoTable ] = wavesTable.getChildren().items;
	const [ statustableCell, infoTableCell ] = wavesTable.getCells().items;

	// To remove the edge style. Change the style of skip button.
	const style = Object.assign(new ImageButtonStyle(Styles.squarei), {
		down: Styles.flatDown,
		disabled: Tex.pane2,
		imageUp: Icon.play,
		imageDisabledColor: Color.clear,
		imageUpColor: Color.white,
	});
	const skipButton = statustable.find("skip");
	skipButton.setStyle(style);

	wavesTable.clearChildren();
	wavesTable.add(statustable).set(statustableCell).growX();
	wavesTable.row();

	const myStyle = Object.assign(new TextButtonStyle(), {
		over: Tex.buttonRightOver,
		down: Tex.buttonRightDown,
		up: Tex.buttonRight,
		disabled: Tex.buttonRightDisabled,
		font: Fonts.def,
		fontColor: Color.white,
		disabledFontColor: Color.gray,
	});

	wavesTable.button("View next Wave", myStyle, () => {
		displayNextWave();
	}).grow();

	wavesTable.row();
	wavesTable.add(infoTable).set(infoTableCell).growX();
});

function displayNextWave() {
	const currentWave = Vars.state.wave;
	const winWave = Vars.state.rules.winWave;
	const spawners = Vars.spawner.countSpawns();
	const wavesDialog = new BaseDialog("Next Wave: " + currentWave);

	if (spawners == 0) {
		wavesDialog.cont.add("This sector has no waves.");
		wavesDialog.addCloseButton();
		wavesDialog.show();
		return;
	};
	
	// displayedWaves only matters for endless sectors
	const displayedWaves = 100;
	const displayedColumns = 4;

	var minWave = currentWave;
	// we have a winWave
	if (winWave > 0) {
		var maxWave = winWave + 1;
	// no winWave, just show a range of displayedWaves waves
	} else {
		var maxWave = minWave + displayedWaves;
		if (maxWave - minWave < displayedWaves) minWave = maxWave - displayedWaves;
		if (minWave < 0) minWave = 1;
	}
	// this enables i = -1, so that we can display the endless message
	if (winWave <= 0) minWave -= 1;

	wavesDialog.cont.pane(p => {
		// offset -1 for waves, winWave 40 means 39 is the last wave
		for (let i = minWave - 1; i < maxWave - 1; ++i) {
			if (i == -1) {
				p.table(null, table => {
					table.add("You are playing in endless mode. Since there is no final wave,").color(Color.valueOf("a6fcaf")).row();
					table.add("you can simply see the next 100 waves here. Have fun.").color(Color.valueOf("a6fcaf")).row();
					return;
				}).colspan(4).grow().padBottom(10);
				p.row();
				continue;
			};

			// set text color
			if (i < currentWave - 1) {
				var color = Color.gray;
			} else if (i == currentWave - 1) {
				var color = Color.valueOf("ffd37f");
			} else {
				var color = Color.white;
			}

			p.table(null, table => {
				table.top();
				table.defaults().pad(7);
				if (i >= 0) table.add("Wave " + (i+1)).color(color);
				table.row();

				// displays this message instead of wave units on winWave
				if (winWave && (i + 1) == winWave) {
					table.add("Captured Sector! :)").color(Color.valueOf("a6fcaf"));
					return;
				};

				Vars.state.rules.spawns.forEach(function(group) {
					if (group.type == null) return;

					let spawned = group.getSpawned(i) * spawners;
					if (spawned == 0) return;

					let info = "type: ";
					if (group.type.flying) info = info.concat("flying");
					if (group.type.hovering) info = info.concat("hovering");
					if (group.type.naval) info = info.concat("naval");
					if (info.length == 6) info = info.concat("ground");

					// mark bosses
					if (group.effect == StatusEffects.boss) color = Color.valueOf("fc585b");

					table.add(group.type + " " + spawned).left().color(color);
					table.add(info).right().color(color);
					table.row();
				});
			}).grow().padBottom(25);
			
			if (minWave < 1) minWave = 1;
			if ((i + 1 - minWave + 1) % displayedColumns == 0 && (i + 1 - minWave + 1) != 0) {
				p.row();
			};
		};
	}).grow();
	wavesDialog.addCloseButton();
	wavesDialog.show();
};