Events.on(DepositEvent, event => {
	var spawns = Vars.spawner.countSpawns();
	const myDialog = new BaseDialog("Title");
	Vars.state.rules.spawns.forEach(function(group) {
		if (group.type == null) return;

		let spawned = group.getSpawned(Vars.state.wave - 1) * spawns;
		if (spawned == 0) return;
		myDialog.cont.add(group.type.toString() + " " + spawned.toString() + " (flying: " + group.type.flying + ")");
		myDialog.cont.add("\n");
	});
	myDialog.addCloseButton();
	myDialog.show();
})

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
	var spawners = Vars.spawner.countSpawns();
	var wavesDialog = new BaseDialog("Next Wave: " + Vars.state.wave);
	// we have a winWave
	var minWave = Vars.state.wave;
	if (Vars.state.rules.winWave > 0) {
		var maxWave = Vars.state.rules.winWave;
	} else { // no winWave, just show a range of 25 waves
		var maxWave = minWave + 25;
	}
	if (maxWave - minWave < 25) minWave = maxWave - 25;
	if (minWave < 0) minWave = 1;
	for (let i = minWave; i < maxWave; ++i) {
		if (i < Vars.state.wave) {
			var color = Color.gray;
		} else if (i == Vars.state.wave) {
			var color = Color.valueOf("ffd37f");
		} else {
			var color = Color.white;
		}
		wavesDialog.cont.table(null, table => {
			table.defaults().pad(10)
			table.add("Wave " + i).color(color);
			table.row();
			
			Vars.state.rules.spawns.forEach(function(group) {
				if (group.type == null) return;

				let spawned = group.getSpawned(i) * spawners;
				if (spawned == 0) return;

				let info = "type: ";
				if (group.type.flying) info = info.concat("flying");
				if (group.type.hovering) info = info.concat("hovering");
				if (group.type.naval) info = info.concat("naval");
				if (info.length == 6) info = info.concat("ground");

				table.add(group.type + " " + spawned + "         " + info).color(color);
				table.row();
			});
		}).grow();
		if ((i - minWave + 1) % 5 == 0) {
			wavesDialog.cont.row();
		};
	};
	wavesDialog.addCloseButton();
	wavesDialog.show();
}