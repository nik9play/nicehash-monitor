var settings = require('electron-settings')
var { shell } = require('electron')
var $ = require('jquery')

function saveSettings() {
	settings.set('FirstStart', {
		yes: true
	});
	settings.set('API', {
		apiid: $('#apiid').val(),
		apikey: $('#apikey').val()
	});
	settings.set('BTCAddr', {
		btc: $('#btcaddr').val()
	});
	settings.set('FirstStart', {
		yes: true
	});
	settings.set('Autostart', {
		yes: true
	});
	settings.set('Autoupdate', {
		yes: true,
		value: '40'
	});
	settings.set('Valuta', {
		valuta: 'rub'
	});
	location.href = 'index.html'
}