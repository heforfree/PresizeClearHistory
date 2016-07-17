gSanitizePromptDialog._selectByTimespan = gSanitizePromptDialog.selectByTimespan;
gSanitizePromptDialog._updatePrefs = gSanitizePromptDialog.updatePrefs;
gSanitizePromptDialog.preciseBox = null;
gSanitizePromptDialog._prefs = null;
Sanitizer._getClearRange = Sanitizer.getClearRange;
Sanitizer.TIMESPAN_PRECISE = 105;

gSanitizePromptDialog.__defineGetter__("prefs", function()
{
	return gSanitizePromptDialog._prefs ? gSanitizePromptDialog._prefs
		: gSanitizePromptDialog._prefs = Components.classes["@mozilla.org/preferences-service;1"]
																		 .getService(Components.interfaces.nsIPrefService)
																		 .getBranch("extensions.preciseclearhistory.");
});

gSanitizePromptDialog.load = function()
{
	gSanitizePromptDialog._init();
}
window.addEventListener("load", gSanitizePromptDialog.load, false);

gSanitizePromptDialog._init = function()
{
	this.preciseBox = document.importNode(document.getElementById("sanitizePreciseBox"), true);
	document.getElementById("sanitizePreciseBox").parentNode.removeChild(document.getElementById("sanitizePreciseBox"));
	this.warningBox.parentNode.insertBefore(this.preciseBox, this.warningBox);
	this._lastSelected = null;
	this.typeBox = document.getElementById("sanitizePreciseType");
	var type = parseInt(this.typeBox.value);
	this._date1 = parseInt(this.prefs.getCharPref("date1")) *1000;
	if (this._date1)
	{
		this._date1 = new Date(this._date1);
		if (isNaN(this._date1))
			this._date1 = null;
	}
	if (!this._date1)
		if (type == 3)
			this._date1 = new Date(2000, 0, 1, 0, 0,0);
		else
			this._date1 = new Date();

	this._date2 = parseInt(this.prefs.getCharPref("date2")) *1000;
	if (this._date2)
	{
		this._date2 = new Date(this._date2);
		if (isNaN(this._date2))
			this._date2 = new Date();
	}
	else
		this._date2 = new Date();

	this.showDate(1, this._date1);
	this.showDate(2, this._date2);
	this.preciseBoxShow(false, type);

	if (this.selectedTimespan !== Sanitizer.TIMESPAN_PRECISE)
		this.preciseBox.hidden = true;
	this.typeBox.addEventListener("command", this.selectByType, false);
}

gSanitizePromptDialog.selectByType = function(e)
{
	// This method is the onselect handler for the duration dropdown.  As a
	// result it's called a couple of times before onload calls init().
	if (!gSanitizePromptDialog._inited || gSanitizePromptDialog.selectedTimespan !== Sanitizer.TIMESPAN_PRECISE)
		return;

	gSanitizePromptDialog.preciseBoxShow(true);
}

gSanitizePromptDialog.preciseBoxShow = function(r)
{
	var type = parseInt(this.typeBox.value);
	var sel = 0;
	switch(type)
	{
		case 1:
				document.getElementById("sanitizePreciseDateBox1").hidden = true;
				document.getElementById("sanitizePreciseDateBox2").hidden = false;
				sel = 1;
			break;
		case 2:
				document.getElementById("sanitizePreciseDateBox1").hidden = false;
				document.getElementById("sanitizePreciseDateBox2").hidden = true;
				sel = 1;
			break;
		case 3:
		default:
				document.getElementById("sanitizePreciseDateBox1").hidden = false;
				document.getElementById("sanitizePreciseDateBox2").hidden = false;
				sel = 2;
			break;
	}
	document.getElementById("sep").hidden = type != 3;
	if (this.preciseBox.hidden)
		this.preciseBox.hidden = false;

	if (r && this._lastSelected != sel)
	{
		window.sizeToContent();
	}
	this._lastSelected = this.selectedTimespan === Sanitizer.TIMESPAN_PRECISE ? sel : 0;

	window.document.title =
		window.document.documentElement.getAttribute("precisetitle");
}

gSanitizePromptDialog.showDate = function(id, date)
{
	document.getElementById("sanitizePreciseDate"+id).dateValue = date;
	document.getElementById("sanitizePreciseTime"+id).dateValue = date;
}

gSanitizePromptDialog.selectByTimespan = function()
{
	// This method is the onselect handler for the duration dropdown.  As a
	// result it's called a couple of times before onload calls init().
	if (!this._inited)
		return;

	var warningBox = this.warningBox;

	if (this.selectedTimespan === Sanitizer.TIMESPAN_PRECISE)
	{

		// If clearing a specific time range
		if (!warningBox.hidden)
		{
			window.resizeBy(0, -warningBox.boxObject.height);
			warningBox.hidden = true;
		}
		this.preciseBoxShow(true);

		return;
	}
	this._lastSelected = 0;		
	if (!this.preciseBox.hidden)
	{
		this.preciseBox.hidden = true;
		window.sizeToContent();
	}
	this._selectByTimespan();
}

gSanitizePromptDialog.updatePrefs = function ()
{
	this.prefs.setIntPref("type", parseInt(this.typeBox.value));
	this.prefs.setCharPref("date1", Sanitizer.getDate(1).getTime()/1000);
	this.prefs.setCharPref("date2", Sanitizer.getDate(2).getTime()/1000);
	gSanitizePromptDialog._updatePrefs();
}

Sanitizer.getDate = function(type)
{
	var date = document.getElementById("sanitizePreciseDate"+type).dateValue;
	var time = document.getElementById("sanitizePreciseTime"+type).dateValue;
	var newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
	return newDate;
}

Sanitizer.getClearRange = function (ts)
{
	if (ts === undefined)
		ts = Sanitizer.prefs.getIntPref("timeSpan");
	if (ts === Sanitizer.TIMESPAN_PRECISE)
	{
		var d1 = new Date();
		var d2 = d1;
		var type = parseInt(gSanitizePromptDialog.typeBox.value);
		switch(type)
		{
			case 1:
					var d1 = 0;
					var d2 = this.getDate(type);
				break;
			case 2:
					d1 = this.getDate(type);
					d2 = 0;
				break;
			case 3:
					d1 = this.getDate(1);
					d2 = this.getDate(2);
					if (d2 < d1)
					{
						var d = d2;
						d2 = d1;
						d1 = d;
					}
				break;
		}
		return [(d1.valueOf() * 1000), (d2.valueOf() * 1000)];
	}
	Sanitizer._getClearRange(ts);
}
