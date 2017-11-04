import { remote } from 'electron'
const mainProcess = remote.require(__dirname + '\\main.js')

var settings = require('electron-settings')

var $ = require('jquery');

var moment = require('moment');

var Highcharts = require('highcharts/highstock');

function loadSettings() {
	var value = settings.get('Valuta.valuta');
	$('#valuta').val(value);
	$("#valuta").addClass('is-dirty');
	var value = settings.get('API');
	$('#apiid').val(value.apiid);
	$("#apiid-label").addClass('is-dirty');
	$('#apikey').val(value.apikey);
	$("#apikey-label").addClass('is-dirty');
	var value = settings.get('Autostart.yes');
	var value = settings.get('BTCAddr');
	$('#btcaddr').val(value.btc);
	$("#btcaddr").addClass('is-dirty');
	if (value == true) {
		$("#autostart-switch").attr('checked', true);
		$("#autostart-switch-label").addClass('is-checked');
	}
	var value = settings.get('Autoupdate');
	if (value.yes == true) {
		$("#autoupdate-switch").attr('checked', true);
		$("#autoupdate-switch-label").addClass('is-checked');
	}
	$('#autoupdate-slider').val(value.value);
	$("#autoupdate-slider-label").addClass('is-dirty')
}
if (settings.get('FirstStart') == undefined) {
	location.href = "start.html"
} else {
	loadSettings();
}

if (settings.get('Autoupdate').yes == true) {
	var timer = new Timer();
	var value = settings.get('Autoupdate');
	timer.start({countdown: true, startValues: {seconds: parseInt(value.value)}});
	$('#timer .valuestimer').html(timer.getTimeValues().toString());
	timer.addEventListener('secondsUpdated', function (e) {
		$('#timer .valuestimer').html(timer.getTimeValues().toString());
	});
	timer.addEventListener('targetAchieved', function (e) {
		$("#p2").css("display", "block");
		mainStart();
		setTimeout(function() { timer.reset() }, 500);
	});
} else {
	$('#timer').html('Автообновление отключено');
}

function saveSettings() {
	settings.set('API', {
		apiid: $('#apiid').val(),
		apikey: $('#apikey').val()
	});
	settings.set('Valuta', {
		valuta: $('#valuta').val()
	});
	settings.set('Autostart', {
		yes: $("#autostart-switch").is(':checked')
	});
	if ($('#autoupdate-slider').val() >= 30) {
		settings.set('Autoupdate', {
			yes: $("#autoupdate-switch").is(':checked'),
			value: $('#autoupdate-slider').val()
		});
		showToast('Настройки сохранены.');
		setTimeout(function(){ location.reload() }, 1000);
	} else {
		showToast('Ошибка. Значение должно быть больше или равно 30');
	}
};

function deleteAll() {
	settings.deleteAll();
	setTimeout(function() { location.reload() }, 500);
};

//Лучше не пытаться понять что дальше. Это черетовато перегрузкой разума
function mainStart() {
	$("#p2").css("display", "block");
	$("#workerslist").empty();
	$("#workerslist").append('<div class="mdl-cell mdl-cell--3-col"><h5 style="margin-top: 0">Колличество воркеров</h5><h3 style="margin-bottom: 0"><strong id="workersam">0</strong></h3></div>');
	$.ajax({
	  url: 'https://api.nicehash.com/api?method=balance&my&id=' + settings.get('API').apiid + '&key=' + settings.get('API').apikey,
	  success: function(data) {
		var data = JSON.parse(data);
		$( "#paid" ).html('<strong>' + data.result.balance_confirmed + ' BTC </strong>');
		if (data.result.balance_confirmed == undefined) {
			setBTCpaid(0);
		} else {
			setBTCpaid(data.result.balance_confirmed);
		}
	  }
	});
	$.ajax({
	  url: 'https://api.nicehash.com/api?method=stats.provider.workers&addr=' + settings.get('BTCAddr').btc,
	  success: function(data) {
		  var data = JSON.parse(data);
		  var datlength = Object.keys(data.result.workers).length;
		  for (var i = 0; i < datlength; i++) {
			$("#workersam").html(i + 1);
			if (data.result.workers[i][1].a == undefined) {
				var speed = "0";
			} else {
				var speed = data.result.workers[i][1].a
			}
			if (data.result.workers[i][4] == undefined) {
				var difficulty = "0";
			} else {
				var difficulty = data.result.workers[i][4]
			}
			$("#workerslist").append("<div class='mdl-cell mdl-cell--3-col'><h5 style='margin-top: 0'>" + data.result.workers[i][0] + "</h5><p style='margin-bottom: 0'>Скорость: <strong>" + speed + "</strong></p><p style='margin-bottom: 0'>Сложность: <strong>" + difficulty + "</strong></p></div>");
		  }
	  }
	});
	var from = parseInt(new Date().getTime()/1000) - 43200;
	console.log(from);
	$.ajax({
	  url: 'https://api.nicehash.com/api?method=stats.provider.ex&addr=' + settings.get('BTCAddr').btc,
	  success: function(dat) {
		var dat = JSON.parse(dat);
		console.log(dat);
		console.log(dat.result.current[0]);
		var speed = 0;
		var datlength = Object.keys(dat.result.current).length;
		var pastlength = Object.keys(dat.result.past).length;
		$('#btc-addr').html(dat.result.addr);
		for (var i = 0; i < datlength; i++) {
			var prdat = dat.result.current[i];
			var hashes = parseFloat(prdat.data[0].a);
			if (hashes > 0) {
				var hashes = tohash(hashes, prdat.suffix);
				var speed = speed + hashes;
			}
		}
		var values = [];
		for (var i = 0; i < pastlength; i++) {
			var pastdatalength = Object.keys(dat.result.past[i].data).length;
			for (var k = 0; k < pastdatalength; k++) {
				if (dat.result.past[i].data[k][1].a != undefined) {
					//var values = values + "[" + dat.result.past[i].data[k][0] * 300000 + "," + dat.result.past[i].data[k][1].a + "],";
					values.push([dat.result.past[i].data[k][0] * 300000, parseFloat(dat.result.past[i].data[k][1].a)]);
				} else {
					values.push([dat.result.past[i].data[k][0] * 300000, 0]);
				}
			}
		}
			
		$( "#speed" ).html('<strong>' + hashopt(speed).hash + ' ' + hashopt(speed).hashunit + '</strong>');
		function sortFunction(a, b) {
			if (a[0] === b[0]) {
				return 0;
			}
			else {
				return (a[0] < b[0]) ? -1 : 1;
			}
		}
		values.sort(sortFunction);
		console.log(values);
		var chart1;
		$(function() {
			chart1 = Highcharts.stockChart('chart', {
		
				rangeSelector: {
					selected: 1
				},
		
				title: {
					text: 'График скорости майнинга'
				},
		
				series: [{
					name: 'Скорость',
					data: values,
					tooltip: {
						valueDecimals: 2
					}
				}]
			});
		});
		
		$("#p2").css("display", "none");
	}
	});
}

mainStart();

function setBTCunpaid(currencyvalueunpaid) {
	var currency = settings.get('Valuta.valuta');;
	var currencyvalue = currencyvalue;
	$.ajax({
		url: 'https://api.cryptonator.com/api/ticker/btc-' + currency,
		success: function(data) {
			var value = currencyvalueunpaid * data.ticker.price;
			$('#unpaid-cur').html(value.toFixed(3) + ' ' + currency.toUpperCase());
	  }
	});
}

function setBTCpaid(currencyvaluepaid) {
	var currency = settings.get('Valuta.valuta');
	var currencyvalue = currencyvalue;
	$.ajax({
		url: 'https://api.cryptonator.com/api/ticker/btc-' + currency,
		success: function(data) {
			var value = currencyvaluepaid * data.ticker.price;
			$('#paid-cur').html(value.toFixed(3) + ' ' + currency.toUpperCase());
	  }
	});
}

function tohash(hash, hashunit) {
	if (hashunit == 'kH') {
		var hash = hash * 1000;
	}
	if (hashunit == 'MH') {
		var hash = hash * 1000000;
	}
	if (hashunit == 'GH') {
		var hash = hash * 1000000000;
	}
	if (hashunit == 'TH') {
		var hash = hash * 1000000000000;
	}
	if (hashunit == 'PH') {
		var hash = hash * 1000000000000000;
	}
	return hash;
}
/*function hashopt(hash) {
	if (hash <= 1000) {
		var hash = hash;
		var hashunit = 'H';
	}
	if (hash > 1000) {
		var hash = hash / 1000;
		var hashunit = 'kH';
	}
	if (hash > 1000000) {
		var hash = hash / 1000000;
		var hashunit = 'MH';
	}
	if (hash > 1000000000) {
		var hash = hash / 1000000000;
		var hashunit = 'GH';
	}
	if (hash > 1000000000000) {
		var hash = hash / 1000000000000;
		var hashunit = 'TH';
	}
	if (hash > 1000000000000000) {
		var hash = hash / 1000000000000000;
		var hashunit = 'PH';
	}
	var obj = {
		hash: hash,
		hashunit: hashunit
	}
	return obj;
}*/

function hashopt(hash) {
	if (hash <= 1000) {
		var hash = hash;
		var hashunit = 'H';
	}
	if (hash > 1000) {
		var hash = hash / 1000000;
		var hashunit = 'MH';
	}
	if (hash > 1000000) {
		var hash = hash / 1000000000;
		var hashunit = 'GH';
	}
	if (hash > 1000000000) {
		var hash = hash / 1000000000000;
		var hashunit = 'TH';
	}
	if (hash > 1000000000000) {
		var hash = hash / 1000000000000000;
		var hashunit = 'PH';
	}
	var obj = {
		hash: hash,
		hashunit: hashunit
	}
	return obj;
}

function changetab(tab) {
	$(".mdl-navigation__link").removeClass("active");
	$("#" + tab + "tab").addClass("active");
	$(".pagetab").css( "display", "none" );
	$("#" + tab).css( "display", "block" );
}

console.log("%cСтоп!\n%cЕсли вам сказали ввести сюда что-нибудь, не делайте этого! Ваш API ключ может быть украден.", "color: red; font-size:72px; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;", "color: black; font-size:14px;");
