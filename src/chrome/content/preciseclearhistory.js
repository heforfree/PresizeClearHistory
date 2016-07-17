//backup original functions because we'll override them with new code (or there is a better method to acomplish this?)
gSanitizePromptDialog.___selectByTimespan = gSanitizePromptDialog.selectByTimespan;
gSanitizePromptDialog.___updatePrefs = gSanitizePromptDialog.updatePrefs;
gSanitizePromptDialog.___sanitize = gSanitizePromptDialog.sanitize;
Sanitizer.___getClearRange = Sanitizer.getClearRange;
Sanitizer.___getClearRange = Sanitizer.getClearRange;

gSanitizePromptDialog.preciseBox = null;
gSanitizePromptDialog._prefs = null;
Sanitizer.TIMESPAN_PRECISE_BEFORE = 105;
Sanitizer.TIMESPAN_PRECISE_AFTER= 106;
Sanitizer.TIMESPAN_PRECISE_BETWEEN = 107;

gSanitizePromptDialog.__defineGetter__("prefs", function()
{
	return gSanitizePromptDialog._prefs ? gSanitizePromptDialog._prefs
		: gSanitizePromptDialog._prefs = Components.classes["@mozilla.org/preferences-service;1"]
																		 .getService(Components.interfaces.nsIPrefService)
																		 .getBranch("extensions.preciseclearhistory.");
});

gSanitizePromptDialog.isPrecise = function(ts)
{
	var ts = ts || this.selectedTimespan;
	return ts === Sanitizer.TIMESPAN_PRECISE_BEFORE
					|| this.selectedTimespan === Sanitizer.TIMESPAN_PRECISE_AFTER
					|| this.selectedTimespan === Sanitizer.TIMESPAN_PRECISE_BETWEEN;
};

gSanitizePromptDialog.preciseLoad = function()
{
	gSanitizePromptDialog.___init();
}

gSanitizePromptDialog.___init = function()
{
	this.preciseBox = document.getElementById("sanitizePreciseBox");
	this._preciseLastSelected = null;
	this._preciseDate1 = parseInt(this.prefs.getCharPref("date1")) *1000;
	if (this._preciseDate1)
	{
		this._preciseDate1 = new Date(this._preciseDate1);
		if (isNaN(this._preciseDate1))
			this._preciseDate1 = null;
	}
	if (!this._preciseDate1)
			this._preciseDate1 = new Date();

	this._preciseDate2 = parseInt(this.prefs.getCharPref("date2")) *1000;
	if (this._preciseDate2)
	{
		this._preciseDate2 = new Date(this._preciseDate2);
		if (isNaN(this._preciseDate2))
			this._preciseDate2 = new Date();
	}
	else
		this._preciseDate2 = new Date();

	this._preciseDate3 = parseInt(this.prefs.getCharPref("date3")) *1000;
	if (this._preciseDate3)
	{
		this._preciseDate3 = new Date(this._preciseDate3);
		if (isNaN(this._preciseDate3))
			this._preciseDate3 = null;
	}
	if (!this._preciseDate3)
			this._preciseDate3 = new Date(2000, 0, 1, 0, 0, 0);

	this._preciseDate4 = parseInt(this.prefs.getCharPref("date4")) *1000;
	if (this._preciseDate4)
	{
		this._preciseDate4 = new Date(this._preciseDate4);
		if (isNaN(this._preciseDate4))
			this._preciseDate4 = null;
	}
	if (!this._preciseDate4)
			this._preciseDate4 = new Date();

	this.preciseShowDate(1, this._preciseDate1);
	this.preciseShowDate(2, this._preciseDate2);
	this.preciseShowDate(3, this._preciseDate3);
	this.preciseShowDate(4, this._preciseDate4);
	this.preciseBoxShow(false);

	if (!this.isPrecise())
		this.preciseBox.hidden = true;

	this._precisePreset = 1;
	let sanitizeItemList = document.querySelectorAll("#itemList > [preference]");
	for (let i = 0; i < sanitizeItemList.length; i++)
	{
		let prefItem = sanitizeItemList[i];
		if (prefItem.getAttribute("preference") == "privacy.cpd.history")
		{
			prefItem.parentNode.insertBefore(document.getElementById("itemSession"), prefItem.nextSibling);
			break;
		}
	}
	document.getElementById("itemList").setAttribute("rows", parseInt(document.getElementById("itemList").getAttribute("rows")) + 1);
	this.preciseXHours()
}

gSanitizePromptDialog.precisePreset = function(obj)
{
	if (!this._inited)
		return;

	var ts = parseInt(obj.value);
	var endDate = Date.now();
	var startDate, s;
	switch (ts) {
		case 0 : //now
				startDate = new Date().valueOf();
			break;
		case Sanitizer.TIMESPAN_TODAY :
				var d = new Date();	// Start with today
				d.setHours(0);			// zero us back to midnight...
				d.setMinutes(0);
				d.setSeconds(0);
				startDate = d.valueOf();
			break;
		case 105: //this month
				var d = new Date();	// Start with today
				d.setDate(1);				// zero us back to first of the month...
				d.setHours(0);			// zero us back to midnight...
				d.setMinutes(0);
				d.setSeconds(0);
				startDate = d.valueOf();
			break;
		default:
				startDate = endDate - ts;
			break;
	}
	switch(this.selectedTimespan)
	{
		case Sanitizer.TIMESPAN_PRECISE_BEFORE:
				s = 1;
			break;
		case Sanitizer.TIMESPAN_PRECISE_AFTER:
				s = 2;
			break;
		case Sanitizer.TIMESPAN_PRECISE_BETWEEN:
				s = this._precisePreset ? 3 : 4;
			break;
	}
	this.preciseShowDate(s, new Date(startDate));
}

gSanitizePromptDialog.preciseBoxShow = function(r)
{
	var type = this.selectedTimespan;
	var sel = 0;
	switch(type)
	{
		case Sanitizer.TIMESPAN_PRECISE_BEFORE:
				document.getElementById("sanitizePreciseDateBox1").hidden = false;
				document.getElementById("sanitizePreciseDateBox2").hidden = true;
				document.getElementById("sanitizePreciseDateBox3").hidden = true;
				document.getElementById("sanitizePreciseDateBox4").hidden = true;
				sel = 1;
			break;
		case Sanitizer.TIMESPAN_PRECISE_AFTER:
				document.getElementById("sanitizePreciseDateBox1").hidden = true;
				document.getElementById("sanitizePreciseDateBox2").hidden = false;
				document.getElementById("sanitizePreciseDateBox3").hidden = true;
				document.getElementById("sanitizePreciseDateBox4").hidden = true;
				sel = 1;
			break;
		case Sanitizer.TIMESPAN_PRECISE_BETWEEN:
		default:
				document.getElementById("sanitizePreciseDateBox1").hidden = true;
				document.getElementById("sanitizePreciseDateBox2").hidden = true;
				document.getElementById("sanitizePreciseDateBox3").hidden = false;
				document.getElementById("sanitizePreciseDateBox4").hidden = false;
				sel = 2;
			break;
	}
	if (this.preciseBox.hidden)
		this.preciseBox.hidden = false;

	if (r && this._preciseLastSelected != sel)
	{
		window.sizeToContent();
	}
	this._preciseLastSelected = this.isPrecise() ? sel : 0;

	window.document.title =
		document.getElementById("SanitizeDialogPane").getAttribute("precisetitle");
}

gSanitizePromptDialog.preciseShowDate = function(id, date)
{
	document.getElementById("sanitizePreciseDate"+id).dateValue = date;
	document.getElementById("sanitizePreciseTime"+id).dateValue = date;
}

gSanitizePromptDialog.preciseXHours = function()
{
	let textbox = document.getElementById("sanitizePreciseXHoursValue"),
			menuitem = document.getElementById("sanitizePreciseXHours");

	menuitem.value = textbox.value * 3600000;
	textbox.setAttribute("value", textbox.value)
}

gSanitizePromptDialog.selectByTimespan = function()
{
	if (!this._inited)
		return;

	var warningBox = this.warningBox;

	if (this.isPrecise())
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
	this._preciseLastSelected = 0;
	if (!this.preciseBox.hidden)
	{
		this.preciseBox.hidden = true;
		window.sizeToContent();
	}
	this.___selectByTimespan();
}

gSanitizePromptDialog.updatePrefs = function()
{
	this.prefs.setCharPref("date1", Sanitizer.getDate(1).getTime()/1000);
	this.prefs.setCharPref("date2", Sanitizer.getDate(2).getTime()/1000);
	this.prefs.setCharPref("date3", Sanitizer.getDate(3).getTime()/1000);
	this.prefs.setCharPref("date4", Sanitizer.getDate(4).getTime()/1000);
	gSanitizePromptDialog.___updatePrefs();
}

gSanitizePromptDialog.sanitize = function()
{
	try
	{
		document.documentElement.getButton("accept").disabled = true;
		document.documentElement.getButton("accept").label = document.getElementById("SanitizeDialogPane").getAttribute("precisewait");
	}
	catch (e) {}

	return this.___sanitize();
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
		ts = this.prefs.getIntPref("timeSpan");

	if (gSanitizePromptDialog.isPrecise(ts))
	{
		var d1 = new Date();
		var d2 = d1;
		switch(ts)
		{
			case this.TIMESPAN_PRECISE_BEFORE:
					d1 = 0;
					d2 = this.getDate(1);
				break;
			case this.TIMESPAN_PRECISE_AFTER:
					d2 = d1;
					d1 = this.getDate(2);
				break;
			case this.TIMESPAN_PRECISE_BETWEEN:
					d1 = this.getDate(3);
					d2 = this.getDate(4);
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
	return this.___getClearRange(ts);
}

Sanitizer.prototype.items.history.clear = function ()
{
	var globalHistory = Components.classes["@mozilla.org/browser/nav-history-service;1"]
											.getService(Ci.nsINavHistoryService)
											.QueryInterface(Ci.nsIBrowserHistory)
											.QueryInterface(Ci.nsPIPlacesDatabase);
	if (this.range)
		globalHistory.removeVisitsByTimeframe(this.range[0], this.range[1]);
	else
		globalHistory.removeAllPages();

/*
	try {
		var os = Components.classes["@mozilla.org/observer-service;1"]
											 .getService(Components.interfaces.nsIObserverService);
		os.notifyObservers(null, "browser:purge-session-history", "");
	}
	catch (e) { }
*/

	// Clear last URL of the Open Web Location dialog
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
												.getService(Components.interfaces.nsIPrefBranch);
	try {
		prefs.clearUserPref("general.open_location.last_url");
	}
	catch (e) { }
}
Sanitizer.prototype.items.historysession = {
	clear: function ()
	{
		try {
			var os = Components.classes["@mozilla.org/observer-service;1"]
												 .getService(Components.interfaces.nsIObserverService);
			os.notifyObservers(null, "browser:purge-session-history", "");
		}
		catch (e) { }
	},
	get canClear()
	{
		return true;
	}
};

window.addEventListener("load", gSanitizePromptDialog.preciseLoad, false);