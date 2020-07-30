

var WS;
$(document).ready (function () {
	// socket이 없으면, socket.io 서버에 접속
	if (!WS) WS = io.connect("http://localhost:3001/io");
	// 서버로부터 'connect' 메시지가 수신되면
	WS.on("connect", init_page);
	
	// WS.emit("MC_0001");					// 초기정보(기초자산목록, fator 리스트, market 위젯) 요청
	WS.emit("MC_0100");						// 기초자산목록
	WS.emit("MC_0200");						// factor 리스트
	WS.emit("MC_0300");						// market 위젯

	WS.emit("join_room","MC_1001");			// asset 현황 실시간 요청
	WS.emit("join_room","MC_2001");			// bnc 실시간 요청
	WS.emit("join_room","MC_3001");			// bmx 실시간 요청
	WS.emit("join_room","MC_4001");			// bbt 실시간 요청

});


function init_page() {
	console.log("socket connected!");
	
	WS.on("MC_0100", ui_set_asset);							// 기초 자산 목록
	WS.on("MC_0200", ui_set_factor);						// factor 위젯 전체 데이터
	WS.on("MC_0300", ui_set_market);						// market 위젯 전체 데이터
	// WS.on("mc402", swchart_manager.add_data);			// 데이터 조회
	// WS.on("mc1001", ui_update_asset_status);				// 자산 현황 정보(push)
}



// 기초 자산 목록
function ui_set_asset (data) {
	console.log("asset list: "+data);
	
	if (data == undefined || data == null || data == "" || data.result == "0") return;

	$("#asset_list_selbox").empty();
	var d = JSON.parse(data);
	var asset_list = d.message.asset;
	var str = "";
	for (var i in asset_list) {
		str += '<option value="'+ i +'" data-image="./images/'+ asset_list[i].name.toLowerCase() +'.png">'+ asset_list[i].symbol +'</option>';
	}
	$("#asset_list_selbox").append(str);
	
	// ui 세팅 후, 자산 현황 실시간 수신
	WS.on("MC_1001", ui_update_asset_status);

	// 차후 asset 추가되면 코드 추가 고려

}

// factor 위젯
function ui_set_factor (data) {
	console.log("factor list: "+data);

	if (data == undefined || data == null || data == "" || data.result == "0") return;

	$(".left_gnb li ul").empty();
	var d = JSON.parse(data);
	var factor_list = d.message.factorList;
	var str = "";
	for (var i in factor_list) {
		str += '<li><a href="#" class="depth2_menu">'+ factor_list[i].name +'</a></li>';
	}
	$(".left_gnb li ul").append(str);
}

// market 위젯
function ui_set_market (data) {
	console.log("market widget: "+data);
	
	if (data == undefined || data == null || data == "") return;

	$("section.top_coinbox .coin_mid").empty();
	var d = JSON.parse(data);
	var market_list = d.message.marketwidget;
	var str = "";
	for (var i in market_list) {
		str += '<div class="coinbox" id="'+"market_info_"+ market_list[i].market_name +'">'
          	+		'<ul class="coin_top">'
            +			'<li><img src="./images/'+ market_list[i].name.toLowerCase()+'.png"></li>'
            +			'<li class="coin_selbox">'
			+				'<select name="market_selbox" class="coin_select">';
			
			for (var j in market_list[i].codebook) {
				str += 			'<option value="'+ market_list[i].codebook[j].value +'">'+ market_list[i].codebook[j].name +'</option>';
			}
            
            str += 			'</select>'
            	+		'</li>'
            	+			'<li>'
            	+  				'<p class="L_text">Long</p>'
            	+			'</li>'
            	+		'<li>'
            	+			'<p class="S_text">Short</p>'
            	+		'</li>'
				+	'</ul>'
				+	'<ul class="coin_bottom">'
            	+		'<li>'
            	+			'<p class="long_price green_text" name="long_open_interest"></p>'
            	+			'<p class="long_percent green_text" name="long_change_rate"></p>'
            	+		'</li>'
            	+		'<li>'
            	+			'<p class="low_price red_text" name="short_open_interest"></p>'
            	+			'<p class="low_percent red_text" name="short_change_rate"></p>'
            	+		'</li>'
				+	'</ul>'
				+	'<div class="LS_piebox">'
            	+		'<div class="pie-chart1" style="background: conic-gradient(rgb(247, 107, 115) 0%, rgb(247, 107, 115) 80%, rgb(4, 194, 136) 80%, rgb(4, 194, 136) 15%, rgb(4, 194, 136) 15%, rgb(4, 194, 136) 109%, rgb(255, 255, 255) 109%, rgb(255, 255, 255) 100%);"></div>'
            	+		'<div class="pie_text short_bg">'
            	+			'<img name="position_img" src="./images/'+ market_list[i].position+'.png">'  // TODO: 실시간쪽 데이터 받아서 업데이트 되어야 함. position 필드 요청.
            	+			'<p class="red_text LS_text" name="position"></p>'
            	+			'<p class="red_text LS_val" name="volume"></p>'
            	+		'</div>'
				+	'</div>'
				+'</div>';
	}
	$("section.top_coinbox .coin_mid").append(str);

	// 2001: BNC MARKET, 3001: BMX MARKET, 4001: BBT MARKET
	// ui 세팅 후, 마켓 실시간 수신
	WS.on("MC_2001", ui_update_bnc_market_status);			// BNC 마켓 현황 정보(push)
	WS.on("MC_3001", ui_update_bmx_market_status);			// BMX 마켓 현황 정보(push)
	WS.on("MC_4001", ui_update_bbt_market_status);			// BBT 마켓 현황 정보(push)
	// WS.on("MC_4001", ui_update_market_status);				
}

// 자산 현황 정보(push)
function ui_update_asset_status (data) {
	console.log("asset push: "+data);

	var d = JSON.parse(data);
	if (data == undefined || data == null) return;

	var close_price = [];			// 현재가
	var change_rate = [];			// 24h 변동률 (계산?). 전일 종가 대비인지, 24h 전 데이터를 계속 비교하는지 기획쪽 확인.
	var high_price = [];			// 24h 고가
	var low_price = [];				// 24h 저가
	var market_cap = [];			// 시가총액 (계산?). (수식 = 현재가 * 공급수량)

	for (var i = 0; i < d.length; i++) {
		close_price = d[i].close_price ? d[i].close_price : "-";			
		change_rate = d[i].change_rate ? d[i].change_rate : "-";			
		high_price = d[i].high_price ? d[i].high_price : "-";				
		low_price = d[i].low_price ? d[i].low_price : "-";				
		market_cap = d[i].market_cap ? d[i].market_cap : "-";
	}

	$("#current_price").text("$" + numberWithCommas(close_price.toFixed(2)));
	$("#change_rate").text(change_rate + "%");
	$("#high_price").text(numberWithCommas(high_price.toFixed(2)));
	$("#low_price").text(numberWithCommas(low_price.toFixed(2)));
	$("#market_cap").text("$" + numberWithCommas(market_cap));
}


var market_info = {};		// BNC, BMX, BTT 거래소별 데이터 저장

// 마켓별 데이터 저장 및 화면 업데이트
function ui_update_market_status (market_name) {
	console.log("market push: " + market_name);

	var m = market_info[market_name];
	
	for (var i =0; i < m.length; i++) {
		// term 값에 따라 데이터 업데이트
		if ( m[i].term == parseInt($("#market_info_"+ market_name +" select[name=market_selbox]").val()) ) {
			$('#market_info_BNC p[name=long_open_interest]').text(numberWithCommas(Math.floor(m[i].longSize)));
			$('#market_info_BNC p[name=long_change_rate]').text(m[i].longRate.toFixed(2) + "%");
			$('#market_info_BNC p[name="short_open_interest"]').text(numberWithCommas(Math.floor(m[i].shortSize)));
			$('#market_info_BNC p[name="short_change_rate"]').text(m[i].shortRate.toFixed(2) + "%");
			$('#market_info_BNC p[name="position"]').text(m[i].position);		// 계산?
			$('#market_info_BNC p[name="volume"]').text(m[i].volume);			// 계산?

			// 이미지 position 경로 업데이트 코드 추가
			// $('#market_info_BNC [name="position_img"]').attr("src", imgUrl);

			break;
		}	
	}
}

// BNC 마켓 현황 정보(push)
function ui_update_bnc_market_status (data) {
	if (data == undefined || data == null) return;

	market_info["BNC"] = JSON.parse(data);
	ui_update_market_status("BNC");
}

// BMX 마켓 현황 정보(push)
function ui_update_bmx_market_status (data) {
	if (data == undefined || data == null) return;
	
	market_info["BMX"] = JSON.parse(data);
	ui_update_market_status("BMX");
}

// BBT 마켓 현황 정보(push)
function ui_update_bbt_market_status (data) {
	if (data == undefined || data == null) return;
	
	market_info["BBT"] = JSON.parse(data);
	ui_update_market_status("BBT");
}


// 숫자 3자리 콤마(util)
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
