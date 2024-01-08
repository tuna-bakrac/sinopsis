/*
 * sinopsis.js
 * Version: 1.1.0
 * Author: Tuna BAKRAÇ
 * Author URL: http://github.com/tuna-bakrac
 * Github: https://github.com/tuna-bakrac/sinopsis
 *
 * Copyright 2018 Tuna BAKRAÇ
 * Released under the MIT license
 * https://github.com/tuna-bakrac/sinopsis/blob/master/LICENSE
 *
 * Date: 2018-07-23T21:10Z
 */
 
( function ( window ) {
	function clsSinopsis()
	{
		this.versiyon = '1.2.0';
		this.zamanAsimi = 60; //Bu süre dolduktan sonra işlem sonlandırılır. Fakat server tarafında işlem halen devam ediyor olabilir.
		this.icerik = 'snIcerikAlani'; //Ana içeriğin bulunduğu div 
		this.baslik = 'snBaslikAlani'; //Başlık kısmının bulunduğu. Sayfa yüklendikten gelen veride belirtilmişse burdan başlık çağırılır <--BASLIK:Kediler--> gibi
		this.kilavuz = 'snKilavuzAlani'; //Bu alan yükleme öncesi ... konulur sonrasında tekrar aynı içerik yazdırılır. istenirse noktalı virgül ile gelen veriden gönderilebilir <--BASLIK:Kediler;Evcil Hayvanlar-->
		this.gecmisYontem = 1; //0=>Dinamik HTML kaydedilmez url kaydedilir, 1=>Statik HTML sessionStorage ürününe kaydet
		this.browserOnbellekKullanma = 1; //Explorerda cacheden veri çekmemesi için gerekli. Eğer burası true olursa Pragma headerlarını xhr objesine ekleyecektir.
		this.htmOrtu = '<div class="spinner"><div class="spinner-dot1"></div><div class="spinner-dot2"></div></div>';
		this.tipOrtuYadaNormal = 'ortu';
		this.tekIcinAdresIcerigi = '/scr_';
		this.ajaxDestekleniyor = false;
		this.adresEki = null;

		this.tumIslemlerOncesi = null; //Tum islemler başlamadan önce yapılacak fonksiyon
		this.tumIslemlerSonrasi = null; //Tum islemler sonrasında yapılacak fonksiyon
		this.bildirim = function(aciklama, baslik) {} //varsayılan olarak bildirimler gösterilmez
		this.hata = function(aciklama, baslik) { alert(baslik ? baslik + "\n" + aciklama : aciklama); }
		this.yazilar = {};

		var ben = this;
		var ieDegisimYakalama = false;
		var MSXMLActiveXSurumu = null;

		this.dil_ayarla = function (dil)
		{
			if (dil == 'tr-TR')
				this.yazilar = {
					Eminmisiniz: "Emin misiniz?",

					//YÜKLEME SIRASINDA ÇIKAN YAZILAR
					//Yükleme sırasında başlıkta gözüken yazı
					Yukleniyor: "Yükleniyor",
					//uzun sürdüğünde eğer örtü kullanılıyorsa aşağıdakiler gözükmekederi
					BirazUzunSurdu: "Biraz Uzun Sürdü...",
					BirazUzunSurduDetay: "Beklettiğimiz için özür dileriz fakat sayfanın yüklenmesi devam ediyor. Lütfen sabırlı olun!",
					Sonlandirilacak: "Halen Cevap Bekleniyor",
					Sonlandirilacak2: 'Cevap bekleniyor :(',
					SonlandirilacakDetay: 'Eğer cevap gelmez ise <b>[saniye]</b> sn. sonra işlemi sonlandıracağım...',

					//Sistemsel hatalar
					AJAXKapali:'Kullandığınız Internet Gezgininden AJAX ozelligi kapatıldığı için işleme devam edilemiyor. Güvenlik ayarlarınızı kontrol ediniz.',
					JSONHatali: 'Ana makineden dönen veri geçerli bir JSON datası değil. Bir yazılım hatası sonucu bu işlem gerçekleşmiş olabilir. Lütfen yetkili birimlere haber veriniz.',
					TekrarPostEdilsinmi: 'Bu sayfada bazı bilgiler sunucuya iletilmiş (POST edilmiş). Aynı bilgiler tekrar iletilirse çift kayıt işlemleri olabilir. Aynı bilgilerin tekrar iletilmesini istermisiniz?',

					//OLUMSUZ İŞLEMLER
					//Eğer uyarı yada hata verilecekse
					BasariliBosIcerik: 'Ağ haberleşmesi başarılı olmasına rağmen işlem sonucunda herhangi bir yanıt alınamadı.',
					BaskaBirLinkTiklandi: 'Durduruldu[:]Bir önceki işlem iptal edilerek tıkladığınız yeni linke ulaşılmaya çalışılacak',
					Engellendi: 'İşlem Engellendi[:]Güvenlik ayarlarınızdaki bir engelleme yada internet bağlantınızdaki bir aksaklık bu duruma sebebiyet vermiş olabilir.',
					Durduruldu: 'İşlem Durduruldu[:]İşlem kullanıcı taradınfan durduruldu.',
					ZamanAsimi: 'Zaman Aşımı[:][saniye] saniye boyunca istenilen cevap gelmediği için işlem durduruldu. Eğer bir form işlemini onayladıysanız işleminiz server tarafında devam ediyor olabilir.',
					//Eğer örtü var ise
					htmBaslikOlmayanBasariliIcerik: '<div class="alert alert-danger col-md-12" role="alert">Gelen icerik baslik bilgilerini icermiyor. Lutfen HTML kaynagina <b>&lt;!--BASLIK:</b>xyz<b>--&gt;</b> kodunu ekleyiniz.</div>',
					htmBasariliBosIcerik: '<div class="sinopsis-sonuc-objesi">' +
										'<h3>Boş bir içerik döndü.</h3>' +
										'<p>Ağ haberleşmesi başarılı olmasına rağmen işlem sonucunda herhangi bir yanıt alınamadı.</p>' +
										'<p>Web sitesinin kurgusunda bir hata var. Yazılımcı müdahalesi gerekli.</p>' +
										'</div>',
					htmEngellendi:'<div class="sinopsis-sonuc-objesi">' +
									'<h3>Maalesef istediğiniz sayfa yüklenemedi.</h3>' +
									'<p>Güvenlik ayarlarınızdaki bir kısıtlama yada internet bağlantısındaki bir aksaklık bu duruma sebep olmuş olabilir.</p>' +
									'<p>Lütfen işleminizi bir süre sonra tekrar deneyiniz.</p>' +
									'</div>',
					htmDurduruldu:'<div class="sinopsis-sonuc-objesi">' +
									'<h3>Maalesef istediğiniz sayfa yüklenemedi.</h3>' +
									'<p>Kullanıcı tarafından işlem yarıda kesildi.</p>' +
									'<p><em><b>Not:</b> Eğer bir form onaylama işlemi yaptıysanız yada herhangi bir değeri kaydettiyseniz işleminiz tamamlanmış olabilir.</em></p>' +
									'</div>',
					htmZamanAsimiDetay:'<div class="sinopsis-sonuc-objesi">' +
										'<h3>Maalesef istediğiniz sayfa yüklenemedi.</h3>' +
										'<p>Bu durum, internet bağlantınızın yavaş olmasından yada ana makinanın şu an yoğun olmasından kaynaklanıyor olabilir.</p>' +
										'<p>Lütfen işleminizi bir süre sonra tekrar deneyiniz.</p>' +
										'<p><em><b>Not:</b> Eğer bir form onaylama işlemi yaptıysanız yada herhangi bir değeri kaydettiyseniz işleminiz tamamlanmış olabilir.</em></p>' +
										'</div>',
					htmTekrarPostEdilsinmi:'<div class="sinopsis-sonuc-objesi">' +
										'<h3>Tekrar post edilsin mi?</h3>' +
										'<p>Geçmişte ziyaret etmiş olduğunuz bu sayfa sunucuya bazı bilgiler kaydetmiş.</p>' +
										'<p>Bu sayfayı tekrar görüntülemek isterseniz aşağıdaki tekrar gönder tuşuna basınız.</p>' +
										'<p><em><b>Not:</b> Eğer sayfayı tekrar görüntülerseniz sunucu tarafında çift işleme sebep olabilir.</em></p>' +
										'<p><a href="javascript:void(0);" onclick="if (confirm(sinopsis.yazilar.TekrarPostEdilsinmi)) sinopsis.git(null, {post: history.state.post, tip: \'ortu\', gecmiseekle: false});"><i class="fa fa-save"></i> Tekrar Gönder</a></p>' +
										'</div>'
				}
			else
				this.yazilar = {
					Eminmisiniz: "Are you sure?",

					//YÜKLEME SIRASINDA ÇIKAN YAZILAR
					//Yükleme sırasında başlıkta gözüken yazı
					Yukleniyor: "Loading",
					//uzun sürdüğünde eğer örtü kullanılıyorsa aşağıdakiler gözükmekederi
					BirazUzunSurdu: "Please wait...",
					BirazUzunSurduDetay: "Sorry for the wait, but the page is still loading. Please be patient!",
					Sonlandirilacak: "Still Awaiting Response",
					Sonlandirilacak2: 'Waiting for response :(',
					SonlandirilacakDetay: 'If there is no answer, <b>[saniye]</b> seconds. then i will end the process...',

					//Sistemsel hatalar
					AJAXKapali:'The process cannot continue because the AJAX feature has been turned off from the Internet Explorer you are using. Check your security settings.',
					JSONHatali: 'The data returned from the host is not valid JSON data. This operation may have occurred as a result of a software error. Please inform the authorized units.',
					TekrarPostEdilsinmi: 'Some information on this page has been transmitted (POSTed) to the server. Duplicate registrations may occur if the same information is transmitted again. Would you like to have the same information transmitted again?',

					//OLUMSUZ İŞLEMLER
					//Eğer bildirim yada hata verilecekse
					BasariliBosIcerik: 'Although the network communication was successful, no response was received as a result of the transaction.',
					BaskaBirLinkTiklandi: 'Aborted[:]The previous operation will be canceled and the new link you clicked on will be tried to be reached.',
					Engellendi: 'İşlem Engellendi[:]Güvenlik ayarlarınızdaki bir engelleme yada internet bağlantınızdaki bir aksaklık bu duruma sebebiyet vermiş olabilir.',
					Durduruldu: 'Aborted[:]The operation was stopped by the user.',
					ZamanAsimi: 'Time out[:]The process was stopped because the desired response was not received for [saniye] seconds. If you have approved a form operation, your transaction may be in progress on the server side.',
					//Eğer örtü var ise
					htmBaslikOlmayanBasariliIcerik: '<div class="alert alert-danger col-md-12" role="alert">Incoming content does not contain header information. Please add the code <b>&lt;!--BASLIK:</b>xyz<b>--&gt;</b> to the HTML source.</div>',
					htmBasariliBosIcerik: '<div class="sinopsis-sonuc-objesi">' +
										'<h3>An empty content is returned.</h3>' +
										'<p>Although the network communication was successful, no response was received as a result of the transaction.</p>' +
										'<p>There is an error in the layout of the website. The developer should be informed.</p>' +
										'</div>',
					htmEngellendi:'<div class="sinopsis-sonuc-objesi">' +
									'<h3>Sorry, the page you requested could not be loaded.</h3>' +
									'<p>A restriction in your security settings or a glitch in the internet connection may have caused this situation.</p>' +
									'<p>Please try again after a while.</p>' +
									'</div>',
					htmDurduruldu:'<div class="sinopsis-sonuc-objesi">' +
									'<h3>Sorry, the page you requested could not be loaded.</h3>' +
									'<p>The operation was interrupted by the user.</p>' +
									'<p><em><b>PS:</b> If you have made a form validation or saved any value, your transaction may be complete.</em></p>' +
									'</div>',
					htmZamanAsimiDetay:'<div class="sinopsis-sonuc-objesi">' +
										'<h3>Sorry, the page you requested could not be loaded.</h3>' +
										'<p>This may be due to your slow internet connection or the host being busy at the moment.</p>' +
										'<p>Please try again after a while.</p>' +
										'<p><em><b>PS:</b> If you have made a form validation or saved any value, your transaction may be complete.</em></p>' +
										'</div>',
					htmTekrarPostEdilsinmi:'<div class="sinopsis-sonuc-objesi">' +
										'<h3>Post it again?</h3>' +
										'<p>This page you have visited in the past has saved some information on the server.</p>' +
										'<p>If you want to view this page again, press the resend button below.</p>' +
										'<p><em><b>PS:</b> If you view the page again, it may cause double processing on the server side.</em></p>' +
										'<p><a href="javascript:void(0);" onclick="if (confirm(sinopsis.yazilar.TekrarPostEdilsinmi)) sinopsis.git(null, {post: history.state.post, tip: \'ortu\', gecmiseekle: false});"><i class="fa fa-save"></i> Resend</a></p>' +
										'</div>'
				}
		};

		var __construct = function()
		{
			
			var surumler = ["MSXML2.XmlHttp.6.0","MSXML2.XmlHttp.5.0","MSXML2.XmlHttp.4.0","MSXML2.XmlHttp.3.0","MSXML2.XmlHttp.2.0","Microsoft.XmlHttp"];
			if (window.XMLHttpRequest)
				ben.ajaxDestekleniyor = true;
			else if (window.ActiveXObject)
				for (var i = 0; i < surumler.length; i++)
					try {
						var xmlHttp = new ActiveXObject(surumler[i]);
						ben.ajaxDestekleniyor = true;
						MSXMLActiveXSurumu = surumler[i];
						break;
					} catch (e) {
					}

			document.onclick = olay_tikla;

			if (!document.addEventListener && document.attachEvent)
				ieDegisimYakalama = true;
			else
				document.onchange = olay_degistir;

			window.onstop = olay_durduruldu;
			window.onpopstate = olay_gecmiste_gezinildi;

			if (!Array.prototype.indexOf) //ie
				Array.prototype.indexOf = function(obj, start) {
					for (var i = (start || 0), j = this.length; i < j; i++)
						if (this[i] === obj) return i;
					return -1;
				}

			if (!String.prototype.trim) {
				String.prototype.trim = function() {
					return this.replace(/^\s+|\s+$/g, '');
				};
			};

			ben.dil_ayarla(navigator.language || navigator.userLanguage);
			//alert('ben.ajax surum = ' + MSXMLActiveXSurumu);
		}();

		function olay_degistir(e)
		{
			e = e||event;
			var durduruldu = typeof e.defaultPrevented != 'undefined' ? e.defaultPrevented : (e.returnValue === false);
			if (durduruldu) return;
			
			var o = e.target||e.srcElement;
			if (!o) return;

			var objType = (o.type+'').toLowerCase();
			if (o.nodeName == 'SELECT' || (o.nodeName == 'INPUT' && (objType == 'checkbox' || objType == 'radio')))
			{
				if (!mevcut(o, 'sn')) return;
				if (!mevcut(o, 'action') && !mevcut(o, 'href')) return;
				if (o.nodeName == 'INPUT' && objType == 'radio' && !o.checked) return;
				if (!ben.ajaxDestekleniyor) {
					ben.hata(ben.yazilar.AJAXKapali);
					return;
				}
				if (!mevcut(o, 'name')) {
					alert('name=x parametresi olmadan sinopsis kullanılamaz');
					return;
				}
				istek_yap(o);
			}
		}

		function olay_tikla(e)
		{
			e = e||event;
			var durduruldu = typeof e.defaultPrevented != 'undefined' ? e.defaultPrevented : (e.returnValue === false);
			if (durduruldu) return;

			var o = e.target||e.srcElement;
			do {
				if (!o) return;
				if (!o.nodeName) return;
				if (o.nodeName == 'A' || o.nodeName == 'BUTTON' || o.nodeName == 'INPUT') break;
				if (ieDegisimYakalama && o.nodeName == 'SELECT') break;
			} while(o = o.parentNode);
			if (!o) return;
			if ((o.nodeName == 'BUTTON' || o.nodeName == 'INPUT') && o.form && (o.type+'').toLowerCase() == 'submit' && !mevcut(o, 'sn') && !mevcut(o, 'sn-tek') && !mevcut(o, 'sn-normal') && !mevcut(o, 'sn-ortu'))
			{
				if (!mevcut(o.form, 'sn') && !mevcut(o.form, 'sn-tek') && !mevcut(o.form, 'sn-normal') && !mevcut(o.form, 'sn-ortu')) return;
				if (!mevcut(o.form, 'action')) return;
				if (typeof window.FormData != 'function' && (o.form.getAttribute('method')+'').toLowerCase() == 'post') {
					for (var i = 0; i < o.form.elements.length; i++) {
						if (o.form.elements[i].name && !o.form.elements[i].disabled && o.form.elements[i].type == 'file' && o.form.elements[i].value) return; //Form data objesi olmadan dosya uploadları çalışmaz bu yüzden bu işlem browser tarafından yürütülmeli.
					}
				}

				if (!ben.ajaxDestekleniyor && o.getAttribute('sn') != 'tek' && !mevcut(o.form, 'sn-tek')) return;

				if (e.preventDefault) e.preventDefault(); else e.returnValue=false;

				if (!ben.ajaxDestekleniyor)
					ben.hata(ben.yazilar.AJAXKapali);
				else
					istek_yap(o.form, o);
			}
			else if (o.nodeName == 'INPUT' && (o.type+'').toLowerCase() != 'button')
			{
				if (ieDegisimYakalama)
					olay_degistir(e);
			}
			else 
			{
				if (!mevcut(o, 'sn') && !mevcut(o, 'sn-tek') && !mevcut(o, 'sn-normal') && !mevcut(o, 'sn-ortu')) return;
				if (!mevcut(o, 'href') && !mevcut(o, 'action')) return;
				if (o.nodeName == 'SELECT') {
					var defaultIndex = 0;
					for (var i = 0; i < o.options.length; i++)
						if (o.options[i].defaultSelected)
							defaultIndex = i;

					if (o.selectedIndex == -1 || o.selectedIndex == defaultIndex) return;
					o.options[defaultIndex].defaultSelected = true;
				} else if (!ben.ajaxDestekleniyor && o.getAttribute('sn') != 'tek') 
					return;
				if (e.preventDefault) e.preventDefault(); else e.returnValue=false;
				//setTimeout(istek_yap, 0, o);
				if (!ben.ajaxDestekleniyor)
					ben.hata(ben.yazilar.AJAXKapali);
				else
					istek_yap(o);
			}
		}

		function olay_durduruldu(event)
		{
			for (var r in CalisanIstekler)
			{
				if (CalisanIstekler[r].baglanti.yukleniyor)
				{
					CalisanIstekler[r].baglanti.durduruldu = true;
					CalisanIstekler[r].baglanti.xhr.abort();
				}
			}
		}

		function olay_gecmiste_gezinildi(event)
		{
			if (!event || !event.state) {
				window.location.reload();
				return;
			}
			
			acik_kese_no = event.state.keseNo;
			if (typeof window.sessionStorage !== 'undefined' && ben.icerik && document.getElementById(ben.icerik))
			{
				var htm = window.sessionStorage.getItem('keseNo' + acik_kese_no);
				if (htm !== null)
				{
					if (event.state.baslik) 
					{
						if (ben.baslik && document.getElementById(ben.baslik)) document.getElementById(ben.baslik).innerHTML = event.state.baslik;
						document.title = event.state.baslik;
					}
					
					if (event.state.kilavuz && ben.kilavuz && document.getElementById(ben.kilavuz))
						document.getElementById(ben.kilavuz).innerHTML = event.state.kilavuz;
					
					ben.yaz(document.getElementById(ben.icerik), htm);

					if (event.state.scrollTop)
						setTimeout(kaydirma_cubugunu_ayarla, 100, event.state.scrollTop);
					if (typeof window.obje_yazdir == 'function' && history.state)
						obje_yazdir(history.state, 1);
					return;
				}
			}

			var postvar = false;
			if (typeof window.FormData == 'function' && event.state.post instanceof FormData) //formdata
				postvar = true;
			else if (event.state.post)
				for (var t in event.state.post)
					postvar = true;

			if (postvar)
			{
				ben.yaz(document.getElementById(ben.icerik), ben.yazilar.htmTekrarPostEdilsinmi);
				kaydirma_cubugunu_ayarla(0);
			}
			else
				ben.git(null, {gecmiseekle: false, ortu: 1, sonra: kaydirma_cubugunu_ayarla});

			if (typeof window.obje_yazdir == 'function' && history.state)
				obje_yazdir(history.state, 1);
		};

		function kaydirma_cubugunu_ayarla(h)
		{
			if (!h) h = 0;

			if (typeof window.scrollY === "number")
				window.scrollY = h;
			else if (typeof window.pageYOffset === "number")
				window.pageYOffset = h;
			else if (document.documentElement && typeof document.documentElement.scrollTop === 'number')
				document.documentElement.scrollTop = h;
			else if (document.body && typeof document.body.scrollTop === 'number')
				document.body.scrollTop = h;
		}


		var acik_kese_no = 1;
		var acik_olan_adres = window.location.href;
		function gecmis_duzenle(ev)
		{
			if (!window.history || !window.history.replaceState) return;


			if (ev && ev.gecmiseekle)
				acik_kese_no++;
			else if (ben.gecmisYontem == 1 && typeof sessionStorage !== 'undefined' && ben.icerik && document.getElementById(ben.icerik))
			{
				//Geçmişteki input ve select objelerinin değerleri innerHTML ye yazılır.
				var objList;
				objList = document.getElementById(ben.icerik).getElementsByTagName('INPUT');
				for (var i = 0; i < objList.length; i++)
				{
					if (mevcut(objList[i], 'type'))
					{
						if (objList[i].getAttribute('type').toLowerCase() == 'checkbox' || objList[i].getAttribute('type').toLowerCase() == 'radio')
						{ 
							if (objList[i].checked)
								objList[i].setAttribute('checked', true);
							else
								objList[i].removeAttribute('checked');
						}
						else if (typeof objList[i].value !== 'undefined' && objList[i].type.toLowerCase() != 'button' && objList[i].type.toLowerCase() != 'password')
							objList[i].setAttribute('value', objList[i].value);
					}
				}
				objList = document.getElementById(ben.icerik).getElementsByTagName('TEXTAREA');
				for (var i = 0; i < objList.length; i++)
				{
					objList[i].innerHTML = objList[i].value.length > 5120 ? '' : objList[i].value;
				}
				// selectlerde defaultSelected özelliğini bozduğu için aşağıdaki düzeltme kaldırıldı.
				// objList = document.getElementById(ben.icerik).getElementsByTagName('SELECT');
				// for (var i = 0; i < objList.length; i++)
				// {
				// 	for (var x = 0; x < objList[i].options.length; x++)
				// 	{
				// 		if (!objList[i].multiple && x == objList[i].selectedIndex) 
				// 			objList[i].options[x].setAttribute('selected', true);
				// 		else if (objList[i].multiple && objList[i].options[x].selected)
				// 			objList[i].options[x].setAttribute('selected', true);
				// 		else
				// 			objList[i].options[x].removeAttribute('selected');
				// 	}
				// }
			}

			var sessionStorageyeKaydedildi = false;
			if (ben.gecmisYontem == 1 && typeof sessionStorage !== 'undefined' && ben.icerik && document.getElementById(ben.icerik))
				try { 
					sessionStorage.setItem("keseNo" + acik_kese_no, document.getElementById(ben.icerik).innerHTML); 
					sessionStorageyeKaydedildi = true;
				} catch(e) { 
					if (typeof console !== 'undefined') 
						console.log(e);
				}

			var h = 0;
			if (typeof window.scrollY == 'number')
				h = window.scrollY;
			else if (typeof window.pageYOffset == 'number')
				h = window.pageYOffset;
			else if (document.documentElement && typeof document.documentElement.scrollTop == 'number')
				h = document.documentElement.scrollTop;
			else if (document.body && typeof document.body.scrollTop == 'number')
				h = document.body.scrollTop;

			var sta = {
				scrollTop: h,
				keseNo: acik_kese_no,
				baslik: ben.baslik && document.getElementById(ben.baslik) ? document.getElementById(ben.baslik).innerHTML : null,
				kilavuz: ben.kilavuz && document.getElementById(ben.kilavuz) ? document.getElementById(ben.kilavuz).innerHTML : null,
				post: ev ? ev.post : (history && history.state && history.state.post ? history.state.post : null)
			};

			if (typeof window.FormData == 'function' && sta.post instanceof FormData) //formdata objesi geçmişe eklenemez
				sta.post = {};
			else if (sessionStorageyeKaydedildi)
				sta.post = {};

			var mbaslik = document.title+'';
			if (!ev)
				window.history.replaceState(sta, mbaslik, acik_olan_adres);
			else if (ev.gecmiseekle)
			{
				acik_olan_adres = ev.cevap.adres ? ev.cevap.adres : ev.adres;
				window.history.pushState(sta, mbaslik, acik_olan_adres);
				var i = acik_kese_no;
				while (sessionStorageyeKaydedildi && i++ && sessionStorage.getItem("keseNo" + i))
					sessionStorage.removeItem("keseNo" + i);
			}
			else
				window.history.replaceState(sta, document.title, acik_olan_adres);
		}
		this.adres_bari_guncelle = function(adres, yeni) {
			var a = document.createElement('a');
			a.href = adres;
			acik_olan_adres = a.href;
			var ev = {
				adres: a.href,
				gecmiseekle: yeni,
				cevap: {adres: a.href},
			};
			gecmis_duzenle(ev);
			if (ben.tumIslemlerSonrasi)
				ben.tumIslemlerSonrasi.call(ben, ev);
		}

		var varsayilan_degerler = [];
		function istek_yap(kaynak, tiklanan, ekler)
		{

			if (kaynak && mevcut(kaynak, 'sn-calisiyor'))
				return false;

			if (!ekler) ekler = {};
			var ev = {
				tip: null,
				basarili: null,
				kaynak: kaynak,
				tiklanan: tiklanan ? tiklanan : kaynak,
				adres: null,
				adreseki: null,
				method: 'GET',
				post: {},
				asim: ben.zamanAsimi,
				hedef: null,
				hedefsonrasi: false,
				gecmiseekle: false,
				once: null,
				sonra: null,
				yuklenirken: null,
				yuzde: 0,
				baglanti: {
					xhr: window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject(MSXMLActiveXSurumu),
					fa_ikon: null,
					pasiflestirilen_objeler: [],
					sayac: null,
					eski_baslik: null,
					yukleniyor: null,
					durduruldu: null,
					baska_link_tiklandi: null,
					zaman_asimi_olustu: null,
					yuklenen: 0,
					toplamboyut: 0,
				},
				cevap: {
					adres: null,
					kod: 0,
					veri: null,
					htm: null,
					json: null,
					bildirim: null,
					hata: null
				},
				kaynak_turu: null,
				sinopsis: ben,
				tag: null
			};


			//kaynak türü belirleniyor
			if (!ev.kaynak && ekler.manuel_tek_istegi)
				ev.kaynak_turu = 'js';
			else if (!ev.kaynak)
				ev.kaynak_turu = 'git';
			else if (ev.tiklanan && ev.tiklanan != ev.kaynak)
				ev.kaynak_turu = 'form';
			else if (ev.kaynak.nodeName == 'A')
				ev.kaynak_turu = 'link';
			else if (ev.kaynak.nodeName == 'SELECT')
				ev.kaynak_turu = 'select';
			else if (ev.kaynak.nodeName == 'INPUT' && ev.kaynak.type == 'checkbox')
				ev.kaynak_turu = 'checkbox';
			else if (ev.kaynak.nodeName == 'INPUT' && ev.kaynak.type == 'radio')
				ev.kaynak_turu = 'radio';
			else
				ev.kaynak_turu = 'button';

			//Adres belirleniyor
			if (ev.kaynak_turu == 'form' && ev.kaynak.action)
				ev.adres = ev.kaynak.action;
			else if (ev.kaynak_turu == 'link' && ev.kaynak.href && !mevcut(ev.kaynak, 'action'))
				ev.adres = ev.kaynak.href;
			else 
			{
				var u = document.createElement('a');
				u.href = typeof ekler.href !== 'undefined' ? ekler.href : (mevcut(ev.kaynak, 'action') ? ev.kaynak.getAttribute('action') : ev.kaynak.getAttribute('href'));
				ev.adres = u.href;
				u = null;
			}
			if (ev.adres.indexOf('#') > -1) {
				ev.adreseki = ev.adres.split('#')[1];
				ev.adres = ev.adres.split('#')[0];
			}

			//Tipin belirlenmesi
			if ((mevcut(ev.kaynak, 'sn') && ev.kaynak.getAttribute('sn') == 'tek') || mevcut(ev.kaynak, 'sn-tek') || ekler.sn == 'tek' || ekler.tip == 'tek' || ev.kaynak_turu == 'js')
				ev.tip = 'tek';
			else if ((mevcut(ev.kaynak, 'sn') && ev.kaynak.getAttribute('sn') == 'normal') || mevcut(ev.kaynak, 'sn-normal') || ekler.sn == 'normal' || ekler.tip == 'normal')
				ev.tip = 'normal';
			else if ((mevcut(ev.kaynak, 'sn') && ev.kaynak.getAttribute('sn') == 'ortu') || mevcut(ev.kaynak, 'sn-ortu') || ekler.sn == 'ortu' || ekler.tip == 'ortu')
				ev.tip = 'ortu';
			else if (ben.tekIcinAdresIcerigi && ev.adres.indexOf(ben.tekIcinAdresIcerigi)>-1)
				ev.tip = 'tek';
			else
				ev.tip = 'normal';


			//divin belilenmesi
			var h = typeof ekler.hedef !== 'undefined' ? ekler.hedef : (mevcut(ev.kaynak, 'sn-hedef') ? ev.kaynak.getAttribute('sn-hedef') : null);

			if (ev.kaynak_turu == 'js')
				ev.hedef = null;
			else if (ev.kaynak && ev.tip == 'tek' && (h === null || h == 'tr' || h == 'div' || h == 'span' || h == 'td' || h == 'li' || h == 'dd'))
			{
				var pNode = ev.kaynak;
				do { pNode = pNode.parentNode; } 
				while (pNode && ((!h && pNode.nodeName != 'TD' && pNode.nodeName != 'SPAN' && pNode.nodeName != 'DIV') || (h && pNode.nodeName != h.toUpperCase())));
				if (!pNode) {
					alert("Tiklanan linkin bir ustteki TR, TD, DIV yada SPAN elementi bulunamadi. sinopsis tek isteklerinde sonuç bir ustteki div yada td elementinin içine yazdirir eğer üstünde span/tr ise span/tr kaldırırak ondan sonraya yazdırır.");
					return;
				}
				ev.hedef = pNode;
			}
			else if (h == 'yok')
				ev.hedef = null;
			else if (ev.kaynak && (h == 'ben' || h == 'this' || h == 'me'))
				ev.hedef = ev.kaynak;
			else if (ev.kaynak && (h == 'ust' || h == 'parent'))
				ev.hedef = ev.kaynak.parentNode;
			else if (typeof h == 'object' && h)
				ev.hedef = h;
			else if (typeof h =='string' && h && document.getElementById(h))
			{
				ev.hedef = document.getElementById(h);
				if (ev.hedef.nodeName == 'SELECT' && ev.tip == 'normal')
					ev.tip = 'tek';
			}
			else if (h)
			{
				alert("Belirtilen sn-hedef nesnesi HTML DOM yapisinda bulunamadi.\nBelirttiginiz nesne Idsi: " + ev.kaynak.getAttribute('sn-hedef') + "\nLutfen yazilisin dogrulugunu kontrol ediniz.");
				return;
			}
			else if (ben.icerik && document.getElementById(ben.icerik))
			{
				ev.hedef = document.getElementById(ben.icerik);
				var ozel_olarak_normal_tanimlanmis = (mevcut(ev.kaynak, 'sn') && ev.kaynak.getAttribute('sn') == 'normal') || mevcut(ev.kaynak, 'sn-normal') || ekler.sn == 'normal' || ekler.tip == 'normal';
				if ((ev.kaynak_turu == 'link' || ev.kaynak_turu == 'git' || ev.kaynak_turu == 'button') && ev.tip == 'normal' && ben.tipOrtuYadaNormal == 'ortu' && !ozel_olarak_normal_tanimlanmis)
					ev.tip = 'ortu';
			}
			else
			{
				ev.hedef = null;
				// if (ev.tip == 'ortu') {
				// 	alert("Genel içerik elemanı bulunamadı. sinopsis.icerik kısmında belirtilen obje idsinin html dökümünında yer aldığına emin olunuz.");
				// 	return;
				// }
			}

			if ((mevcut(ev.kaynak, 'sn-bossa') || typeof ekler.bossa !== 'undefined') && ev.hedef && ev.hedef.innerHTML.trim())
				return;

			//hedefsonrasi
			if (mevcut(ev.kaynak, 'sn-hedefsonrasi'))
				ev.hedefsonrasi = ev.kaynak.getAttribute('sn-hedefsonrasi') != 'false' && ev.kaynak.getAttribute('sn-hedefsonrasi') !== "0" && ev.kaynak.getAttribute('sn-hedefsonrasi') != "hayir" && ev.kaynak.getAttribute('sn-hedefsonrasi') != "hayır";
			else if (typeof ekler.hedefsonrasi !== 'undefined')
				ev.hedefsonrasi = ekler.hedefsonrasi !== false && ekler.hedefsonrasi !== "0" && ekler.hedefsonrasi != "hayir" && ekler.hedefsonrasi != "hayır";


			if (mevcut(ev.kaynak, 'sn-gecmiseekle'))
				ev.gecmiseekle = ev.kaynak.getAttribute('sn-gecmiseekle') != 'false' && ev.kaynak.getAttribute('sn-gecmiseekle') !== "0" && ev.kaynak.getAttribute('sn-gecmiseekle') != "hayir" && ev.kaynak.getAttribute('sn-gecmiseekle') != "hayır";
			else if (typeof ekler.gecmiseekle !== 'undefined')
				ev.gecmiseekle = ekler.gecmiseekle !== false && ekler.gecmiseekle !== "0" && ekler.gecmiseekle != "hayir" && ekler.gecmiseekle != "hayır";
			else
				ev.gecmiseekle = ben.icerik && ev.hedef && document.getElementById(ben.icerik) == ev.hedef;


			//Onay var mı
			if (mevcut(ev.kaynak, 'sn-onay') || typeof ekler.onay !== 'undefined')
			{
				var soru = ben.yazilar.Eminmisiniz;
				if ((typeof ekler.onay == 'string' && ekler.onay) || (ev.kaynak && ev.kaynak.getAttribute('sn-onay')))
					soru = (typeof ekler.onay == 'string' ? ekler.onay : ev.kaynak.getAttribute('sn-onay')).replace(/\\n/g, "\n")
				if (!confirm(soru))
				{
					if (ev.kaynak && ev.kaynak.nodeName == 'SELECT')
					{
						for (var i = 0; i < ev.kaynak.options.length; i++)
							if (ev.kaynak.options[i].defaultSelected)
								ev.kaynak.selectedIndex = i;
					}
					return;
				}
			}

			//zaman aşımı kontrolü
			if (mevcut(ev.kaynak, 'sn-asim') || typeof ekler.asim !== 'undefined')
				ev.asim = (typeof ekler.asim !== 'undefined' ? ekler.asim : ev.kaynak.getAttribute('sn-asim')) * 1;
			else if (mevcut(ev.kaynak, 'sn-timeout') || typeof ekler.timeout !== 'undefined')
				ev.asim = (typeof ekler.timeout !== 'undefined' ? ekler.timeout : ev.kaynak.getAttribute('sn-timeout')) * 1;
			if (ev.asim > 0 && (ev.asim < 3 || ev.asim > 600)) {
				alert("sn-asim degeri 3 ile 600 arasinda olmalidir."); return;
			}

			//Önce fonksiyonu
			ev.once = ekler.once ? ekler.once : (mevcut(ev.kaynak, 'sn-once') && ev.kaynak.getAttribute('sn-once') ? ev.kaynak.getAttribute('sn-once') : null);
			if (ev.once)
			{
				if (typeof ev.once == 'function')
					ev.once = ev.once
				else if (/[^A-Za-z0-9\.\_]/.test(ev.once)) 
					ev.once = new Function('ev', ev.once);
				else if (typeof window[ev.once] === 'function')
					ev.once = window[ev.once];
				else 
				{
					alert("sn-once ogesi belli bir fonksiyona denk gelmiyor. Fonksiyon ismini dogru yazdigizdan emin olun.");
					return;	
				}
			}

			//Sonra fonksiyonu
			ev.sonra = ekler.sonra ? ekler.sonra : (mevcut(ev.kaynak, 'sn-sonra') && ev.kaynak.getAttribute('sn-sonra') ? ev.kaynak.getAttribute('sn-sonra') : null);
			if (ev.sonra)
			{
				if (typeof ev.sonra == 'function')
					ev.sonra = ev.sonra
				else if (/[^A-Za-z0-9\.\_]/.test(ev.sonra)) 
					ev.sonra = new Function('ev', ev.sonra);
				else if (typeof window[ev.sonra] === 'function')
					ev.sonra = window[ev.sonra];
				else 
				{
					alert("sn-sonra ogesi belli bir fonksiyona denk gelmiyor. Fonksiyon ismini dogru yazdigizdan emin olun.");
					return;	
				}
			}

			//Sonra fonksiyonu
			ev.yuklenirken = ekler.yuklenirken ? ekler.yuklenirken : (mevcut(ev.kaynak, 'sn-yuklenirken') && ev.kaynak.getAttribute('sn-yuklenirken') ? ev.kaynak.getAttribute('sn-yuklenirken') : null);
			if (ev.yuklenirken)
			{
				if (typeof ev.yuklenirken == 'function')
					ev.yuklenirken = ev.yuklenirken
				else if (/[^A-Za-z0-9\.\_]/.test(ev.yuklenirken)) 
					ev.yuklenirken = new Function('ev', ev.yuklenirken);
				else if (typeof window[ev.yuklenirken] === 'function')
					ev.yuklenirken = window[ev.yuklenirken];
				else 
				{
					alert("sn-yuklenirken ogesi belli bir fonksiyona denk gelmiyor. Fonksiyon ismini dogru yazdigizdan emin olun.");
					return;	
				}
			}

			//post verisi ekleniyor.
			if (mevcut(ev.kaynak, 'sn-post') || typeof ekler.post == 'string')
			{
				ev.method = 'POST';
				var temp = typeof ekler.post == 'string' ? ekler.post : ev.kaynak.getAttribute('sn-post');
				if (temp.substring(0,4) == 'raw=' || temp.substring(0,4) == 'ham=')
					ev.post['ham'] = temp.substring(4);
				else 
				{
					temp = temp.replace(/\&amp;/g, '%26');
					temp = temp.replace(/\&amp/g, '%26');
					temp = temp.split('&');
					for (var i = 0; i < temp.length; i++) {
						if (!temp[i].trim()) continue;
						var li = temp[i].indexOf('=');
						if (li<1) continue;
						ev.post[temp[i].substring(0,li)] = decodeURIComponent(temp[i].substring(li+1));
					}
				}
			} else if (ekler.post)
				ev.post = ekler.post;

			for (var degisken = null in ev.post) {
				if (typeof ev.post[degisken] == 'string' && ev.post[degisken].substring(0,1) == '?') {
					var soru, v, ind;
					if (ev.post[degisken].length > 1) soru = ev.post[degisken].substring(1);
					if (soru.indexOf('~') > -1) v = soru.substring(soru.indexOf('~') + 1).trim();
					soru = soru.split('~')[0];
					if (!soru) soru = degisken + ' ?';
					for (var i = 0; i < varsayilan_degerler.length; i++)
						if (varsayilan_degerler[i].kaynak == ev.kaynak && varsayilan_degerler[i].degisken == degisken)
						{
							ind = i;
							v = varsayilan_degerler[i].deger; break;
						}
					v = prompt(soru.replace(/\\n/g, '\n'), v);
					if (v === null) return;
					ev.post[degisken] = v;
					varsayilan_degerler[typeof ind !== "undefined" ? ind : varsayilan_degerler.length] = {kaynak:ev.kaynak, degisken:degisken, deger:v};
				}
			}

			//Post verisi
			if (ev.kaynak_turu == 'select') 
				ev.post[ev.kaynak.getAttribute('name')] = ev.kaynak.value;
			else if ((ev.kaynak_turu == 'checkbox' || ev.kaynak_turu == 'radio') && ev.kaynak.checked)
				ev.post[ev.kaynak.getAttribute('name')] = mevcut(ev.kaynak, 'value') ? ev.kaynak.value : "on";
			else if (ev.kaynak_turu == 'form')
			{
				if ((ev.kaynak.getAttribute('method')+'').toLowerCase() == 'post') ev.method = 'POST'; else ev.method = 'GET';

				var dosyauploadvar = false;
				for (var i = 0; i < ev.kaynak.elements.length; i++)
					if (ev.kaynak.elements[i].name && !ev.kaynak.elements[i].disabled && ev.kaynak.elements[i].type == 'file' && ev.kaynak.elements[i].value) 
						dosyauploadvar = true;

				if (dosyauploadvar && ev.method == 'POST') // && mevcut(ev.kaynak, 'enctype'))
				{
					if (!mevcut(ev.kaynak, 'enctype'))
					{
						alert("bu formda dosya upload isteniyor fakat form özelliklerinde enctype='multipart/form-data' değişkeni tanımlı değil. Bu özelliği eklemezseniz eski tip browserlarda dosya yükleme çalışmaz. Lütfen ekleyiniz.");
						return;
					}
					var temp = new FormData(ev.kaynak);
					for (var degisken = null in ev.post)
						temp.append(degisken, ev.post[degisken]);
					if (mevcut(tiklanan, 'name') && mevcut(tiklanan, 'value')) 
						temp.append(tiklanan.getAttribute('name'), tiklanan.getAttribute('value'));
					ev.post = temp;
				}
				else
				{
					var giris; var giris_dize; var gname;
					for (var i=0; i<ev.kaynak.elements.length; i++) {
						giris = ev.kaynak.elements[i];
						gname = giris.name;
						giris_dize = gname.indexOf('[]') > -1;
						if (giris_dize) { gname = gname.replace('[]', ''); }

						if (giris.name && !giris.disabled && giris.type != 'file' && giris.type != 'reset' && giris.type != 'submit' && giris.type != 'button') {
							if (giris.type == 'select-multiple') {
								if (ev.method == 'POST')
									ev.post[gname] = [];
								for (var j=0; j<giris.options.length; j++) {
									if (giris.options[j].selected && ev.method == 'GET') 
										ev.adres += (ev.adres.indexOf('?') > -1 ? '&' : '?') + encodeURIComponent(gname) + '[]=' + encodeURIComponent(giris.options[j].value);
									else if (giris.options[j].selected)
										ev.post[gname][ev.post[gname].length] = giris.options[j].value;
								}
							} else if ((giris.type != 'checkbox' && giris.type != 'radio') || giris.checked) {
								if (ev.method == 'GET')
									ev.adres += (ev.adres.indexOf('?') > -1 ? '&' : '?') + encodeURIComponent(giris.name) + '=' + encodeURIComponent(giris.value !== null ? giris.value : 'on');
								else if (giris_dize) {
									if (typeof ev.post[gname] == 'undefined') ev.post[gname]=[];
									ev.post[gname][ev.post[gname].length] = giris.value !== null ? giris.value : 'on';
								}
								else
									ev.post[giris.name] = giris.value !== null ? giris.value : 'on';
							}
						}
					}
					if (mevcut(tiklanan, 'name') && mevcut(tiklanan, 'value') && ev.method == 'GET') 
						ev.adres += (ev.adres.indexOf('?') > -1 ? '&' : '?') + encodeURIComponent(tiklanan.getAttribute('name')) + '=' + encodeURIComponent(tiklanan.getAttribute('value'));
					else if (mevcut(tiklanan, 'name') && mevcut(tiklanan, 'value'))
						ev.post[tiklanan.getAttribute('name')] = tiklanan.getAttribute('value');
				}
			}

			//fa ikon
			if ((ev.kaynak_turu == 'button' || ev.kaynak_turu == 'link') && ev.kaynak.getElementsByTagName('i').length > 0 && (ev.kaynak.getElementsByTagName('i')[0].className + '').indexOf(' fa-') > -1)
				ev.baglanti.fa_ikon = ev.kaynak.getElementsByTagName('i')[0];  //fa-ikon
			else if (ev.kaynak_turu == 'form' && ev.tiklanan && ev.tiklanan.getElementsByTagName('i').length > 0 && (ev.tiklanan.getElementsByTagName('i')[0].className + '').indexOf(' fa-') > -1)
				ev.baglanti.fa_ikon = ev.tiklanan.getElementsByTagName('i')[0];  //fa-ikon


			//başlık kontrol edilecek mi?
			ev.baglanti.eski_baslik = ben.baslik && document.getElementById(ben.baslik) ? document.getElementById(ben.baslik).innerHTML : null;
			for (var r in CalisanIstekler)
				if (CalisanIstekler[r].baglanti.eski_baslik !== null)
					ev.baglanti.eski_baslik = null;

			if (mevcut(ev.kaynak, 'sn-tag') || typeof ekler.tag !== 'undefined')
				ev.tag = ekler.tag ? ekler.tag : ev.kaynak.getAttribute('sn-tag');


			//Son kontroller
			if (ev.tip == 'ortu' && !ev.hedef)
			{
				alert("Örtünü serileceği divi belirtmediniz. sn-ortu ve sn-hedef ozellikleri birleşik çalışmaktadır.");
				return;
			}

			//İŞLEMLER BAŞLATILIYOR BURDAN SONRA ÖZELLİKLER DEĞİŞTİRİLEBİLİR
			if (ev.once && ev.once.call(ev.kaynak ? ev.kaynak : ben, ev) === false)
				return;
			
			if (typeof ben.tumIslemlerOncesi == 'function' && ben.tumIslemlerOncesi.call(ev.kaynak ? ev.kaynak : ben, ev) === false)
				return;

			//Eski işlemlerden kapatılması gerekenler kapatılıyor
			if (ev.hedef)
			{
				for (var r in CalisanIstekler) 
				{
					if (CalisanIstekler[r].hedef == ev.hedef || document.getElementById('ben.icerik') == ev.hedef)
					{
						CalisanIstekler[r].baglanti.baska_link_tiklandi = true;
						CalisanIstekler[r].baglanti.xhr.abort();
					}
				}
			}



			//Mevcut içeriği kaydet
			//Amaç: Bir adrese gidilmeden önce mevcut html kaydediliyor. Daha sonra kullanıcı geri tuşuna basarsa text kutuları vs son girdiği haliyle kalıyor.
			var calisan_istek_sayisi = 0;
			for (var r in CalisanIstekler)
				if (CalisanIstekler[r].baglanti.yukleniyor)
					calisan_istek_sayisi += 1;

			if (!calisan_istek_sayisi)
				gecmis_duzenle(null); //function gecmis_duzenle(ev)


			if (ev.kaynak)
				ev.kaynak.setAttribute('sn-calisiyor', true);

			if (ev.baglanti.fa_ikon)
			{
				var eski_klas = ev.baglanti.fa_ikon.className+'';
				if (eski_klas.indexOf(' fa-') > -1)
				{
					var yuvarlak_ikonlar = ['fa-refresh', 'fa-times', 'fa-times-circle', 'fa-exclamation-circle', 'fa-info-circle', 'fa-plus', 'fa-plus-circle', 'fa-question', 'fa-question-circle', 'fa-star', 'fa-sun', 'fa-support', 
											'fa-asterisk', 'fa-badge', 'fa-certificate', 'fa-circle-notch', 'fa-cog', 'fa-compass', 'fa-crosshairs', 'fa-life-ring', 'fa-snowflake', 'fa-sync', 'fa-sync-alt','fa-adjust',
											'fa-affiliatetheme','fa-atom', 'fa-ban', 'fa-bowling-ball', 'fa-first-order-alt', 'fa-globe', 'fa-globe-africa', 'fa-globe-americas', 'fa-globe-asia', 'fa-grav', 'fa-minus-circle', 
											'fa-react', 'fa-safari', 'fa-spinner', 'fa-stop-circle', 'fa-clock'];
					var onemlfa_ikonlar = ["fa-lg", "fa-2x", "fa-3x", "fa-4x", "fa-5x", "fa-li", "fa-fw", 'fa-border', 'fa-pull-right', 'fa-pull-left', 'fa-stack', 'fa-stack-1x', 'fa-stack-2x', 'fa-inverse'];
					var parcalar = eski_klas.split(" ");
					var yuvarlak_ikon_var = false;
					for (var i = 0; i < parcalar.length; i++)
						if (yuvarlak_ikonlar.indexOf(parcalar[i]) > -1) 
							yuvarlak_ikon_var = true
					
					var yeniKlas;
					if (yuvarlak_ikon_var)
						yeniKlas = eski_klas + ' fa-spin';
					else
					{
						yeniKlas='fa fa-spin fa-cog';
						for (var i = 0; i < parcalar.length; i++) 
							if (parcalar[i].substring(0, 2) != 'fa' || onemlfa_ikonlar.indexOf(parcalar[i]) > -1)
								yeniKlas += ' ' + parcalar[i];
					}
					ev.baglanti.fa_ikon.setAttribute('sinopsis-class', eski_klas);
					ev.baglanti.fa_ikon.className = yeniKlas;
				}
			} 
			else if (ev.tiklanan)
			{
				ev.baglanti.pasiflestirilen_objeler[ev.baglanti.pasiflestirilen_objeler.length] = ev.tiklanan;
				ev.tiklanan.disabled = true;
			}

			
			//Pasifleştirmeler
			if (ev.kaynak_turu == 'radio' || ev.kaynak_turu == 'checkbox') //radio yada checkbox
			{
				var temp = document.querySelectorAll ? document.querySelectorAll('input[type='+ev.kaynak.type+'][name='+ev.kaynak.name+']') : document.getElementsByTagName('INPUT');
				for (var t = 0; t<temp.length;t++)
					if (!temp[t].disabled && temp[t].getAttribute('type').toLowerCase() == ev.kaynak.getAttribute('type').toLowerCase() && temp[t].getAttribute('name') == ev.kaynak.getAttribute('name'))
					{
						ev.baglanti.pasiflestirilen_objeler[ev.baglanti.pasiflestirilen_objeler.length] = temp[t];
						temp[t].disabled = true;
					}
			} 
			else if (ev.kaynak_turu == 'select')
			{
				ev.baglanti.pasiflestirilen_objeler[ev.baglanti.pasiflestirilen_objeler.length] = ev.kaynak;
				ev.kaynak.disabled = true;
			}
			if (ev.hedef && ev.hedef.nodeName == 'SELECT') 
			{
				ev.baglanti.pasiflestirilen_objeler[ev.baglanti.pasiflestirilen_objeler.length] = ev.hedef;
				ev.hedef.disabled = true;
			}

			if (ev.tip == 'ortu')
				ben.yaz(ev.hedef, 
					'<div class="sinopsis-ortu">' +
						'<div>' + ben.htmOrtu + '</div>' +
						'<h3></h3><p></p>' +
					'</div>');

			//Tum calisan ogeler bir diziye kaydedilir boylece gerektiginde durdurma işlemi uygulanabilir.
			var r;
			do {
		 		r = 'r' + (Math.floor(Math.random() * 999999) + 100000);
			} while (CalisanIstekler[r]);
			CalisanIstekler[r] = ev;


			if (ev.baglanti.eski_baslik)
				document.getElementById(ben.baslik).innerHTML = '<nobr><i class="far fa-arrow-alt-circle-right"></i> ' + ben.yazilar.Yukleniyor + '</nobr>';

			var post_verisi = '';
			var upload_yapiliyor = false;

			//typeof ev.post.entries == 'function'
			if (typeof window.FormData == 'function' && ev.post instanceof FormData) //formdata
			{
				post_verisi = ev.post;
				var vals = ev.post.values();
				var itm = vals.next();
				while (!itm.done) 
				{
					if (itm.value instanceof Blob) 
					{
						upload_yapiliyor = true;
						ev.asim = 0; //upload yapılırken zaman aşımı kapatılır
					}
					itm = vals.next();
				}
				ev.method = 'POST';
			}
			else
			{
				for (var t in ev.post)
					if ((t=='ham' || t=='raw') && !post_verisi)
						post_verisi = ev.post[t];
					else if (typeof ev.post[t] !== 'object')
						post_verisi += (post_verisi ? '&' : '') + encodeURIComponent(t) + '=' + encodeURIComponent(ev.post[t]);
					else
						for (var i = 0; i < ev.post[t].length; i++)
							post_verisi += (post_verisi ? '&' : '') + encodeURIComponent(t) + '[]=' + encodeURIComponent(ev.post[t][i]);

				if (post_verisi)
					ev.method = 'POST';
				else
					post_verisi = null;
			}

			try
			{
				ev.baglanti.sayac = 0;
				ev.baglanti.yukleniyor = true;
				ev.baglanti.durduruldu = false;
				ev.baglanti.baska_link_tiklandi = false;
				ev.baglanti.zaman_asimi_olustu = false;
				ev.baglanti.xhr.open(ev.method, ev.adres + (ev.adres.indexOf('?') > -1 ? '&' : '?') + 'sinopsis=' + ev.tip + (ben.adresEki ? '&' + ben.adresEki : ''), true);
			}
			catch (e)
			{
				//ienin eski versiyonlarında geçersiz adreslerde hata oluşur
				istek_yap_cevabi.call(ev.baglanti.xhr, null, e);
				return;
			}

			if (ev.method == 'POST' && post_verisi && typeof post_verisi == 'string') ev.baglanti.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

			if (ben.browserOnbellekKullanma)
			{
				// via Cache-Control header:
				ev.baglanti.xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
				// fallbacks for IE and older browsers:
				ev.baglanti.xhr.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
				ev.baglanti.xhr.setRequestHeader("Pragma", "no-cache");
			}

			if (window.XMLHttpRequest)
			{
				ev.baglanti.xhr.onreadystatechange = istek_yap_cevabi;
				if (upload_yapiliyor && ev.baglanti.xhr.upload)
					ev.baglanti.xhr.upload.onprogress = istek_yap_yuklenirken;
				else
					ev.baglanti.xhr.onprogress = istek_yap_yuklenirken;
			}
			else 
			{
				ev.baglanti.xhr.onreadystatechange = function() { istek_yap_cevabi.call(ev.baglanti.xhr); };
				if (upload_yapiliyor && ev.baglanti.xhr.upload)
					ev.baglanti.xhr.upload.onprogress = function() { istek_yap_yuklenirken.call(ev.baglanti.xhr); };
				else
					ev.baglanti.xhr.onprogress = function() { istek_yap_yuklenirken.call(ev.baglanti.xhr); };
			}



			ev.baglanti.xhr.send(post_verisi);
		}

		function istek_yap_yuklenirken(event)
		{
			var ev = null;
			for (var r in CalisanIstekler)
				if (CalisanIstekler[r].baglanti.xhr === this || CalisanIstekler[r].baglanti.xhr.upload === this)
				{
					ev = CalisanIstekler[r];
					break;
				}

			if (!ev) return;
			
			ev.baglanti.yuklenen = event.loaded;
			if (event.lengthComputable) {
				ev.baglanti.toplamboyut = event.total;
				ev.yuzde = (event.loaded / event.total) * 100;
				if (ev.yuklenirken)
					ev.yuklenirken.call(ev.kaynak ? ev.kaynak : ben, ev)
			} 

		}

		function istek_yap_cevabi(event, iehata)
		{
			var ev = null;
			for (var r in CalisanIstekler)
				if (CalisanIstekler[r].baglanti.xhr === this)
				{
					ev = CalisanIstekler[r];
					break;
				}

			if (!ev) return;

			if (this.readyState == 1)
			{ //OPENED	open() has been called.
				if (ev.baglanti.eski_baslik)
					document.getElementById(ben.baslik).innerHTML = '<nobr><i class="far fa-arrow-alt-circle-right"></i> ' + ben.yazilar.Yukleniyor + '</nobr>';
			}
			else if (this.readyState == 2)
			{ //HEADERS_RECEIVED	send() has been called, and headers and status are available.
				if (ev.baglanti.eski_baslik)
					document.getElementById(ben.baslik).innerHTML = '<nobr><i class="fa fa-arrow-alt-circle-right"></i> ' + ben.yazilar.Yukleniyor + '</nobr>';
			}
			else if (this.readyState == 3)
			{ //LOADING	Downloading; responseText holds partial data.
				if (ev.baglanti.eski_baslik)
					document.getElementById(ben.baslik).innerHTML = '<nobr><i class="fa fa-arrow-alt-circle-down"></i>  ' + ben.yazilar.Yukleniyor + '</nobr>';
			}
			else if (this.readyState == 4 || iehata)
			{ //DONE	The operation is complete.
				//ADIM 1 Geri Al: İşlemlere başlamadan önceki html eski haline geri döndürülüyor
				ev.baglanti.yukleniyor = false;
				ev.baglanti.toplamboyut = ev.baglanti.yuklenen;
				ev.yuzde = 100;

				delete CalisanIstekler[r];
				if (ev.kaynak)
					ev.kaynak.removeAttribute('sn-calisiyor');

				if (ev.baglanti.fa_ikon) 
					ev.baglanti.fa_ikon.className = ev.baglanti.fa_ikon.getAttribute('sinopsis-class');
				if (ev.baglanti.fa_ikon) 
					ev.baglanti.fa_ikon.removeAttribute('sinopsis-class');

				if (ev.baglanti.eski_baslik !== null)
					document.getElementById(ben.baslik).innerHTML = ev.baglanti.eski_baslik;
				for (var t = 0; t < ev.baglanti.pasiflestirilen_objeler.length; t++)
					if (ev.baglanti.pasiflestirilen_objeler[t])
						ev.baglanti.pasiflestirilen_objeler[t].disabled = false;


				//ADIM 2: Sonucu yorumla: Gelen cevap yorumlanıyor basarılı yada basarısız durumu çözülüyor
				var yeni_sayfa_basligi = null;
				ev.cevap = {
					adres: null,
					kod: iehata ? 0 : ev.baglanti.xhr.status,
					veri: null,
					htm: null,
					json: null,
					bildirim: null,
					hata: null
				};

				if (typeof ev.baglanti.xhr.responseURL != 'undefined' && ev.baglanti.xhr.responseURL)
				{
					ev.cevap.adres = ev.baglanti.xhr.responseURL;
					if (ben.adresEki)
						ev.cevap.adres = ev.cevap.adres.replace('&' + ben.adresEki, "");
					ev.cevap.adres = ev.cevap.adres.replace("sinopsis=" + ev.tip, "");
					if (ev.cevap.adres.substring(ev.cevap.adres.length-1) == '?') ev.cevap.adres = ev.cevap.adres.substring(0, ev.cevap.adres.length-1);
					if (ev.cevap.adres.substring(ev.cevap.adres.length-1) == '&') ev.cevap.adres = ev.cevap.adres.substring(0, ev.cevap.adres.length-1);
					ev.cevap.adres = ev.cevap.adres.replace('&&', '&');
				}


				ev.basarili = true;
				var gelen = (ev.baglanti.xhr.responseText+'').trim();
				if (gelen.indexOf('<!--BASLIK:') > -1)
				{
					var li = gelen.indexOf('<!--BASLIK:');
					var m = [''];
					if (li > -1) {
						var temp = gelen.substring(li + 11);
						li = temp.indexOf('-->');
						if (li > 2 && li < 500) { 
							m[1] = temp.substring(0, li); m[2] = '';
							li = m[1].indexOf(';');
							if (li > -1) { m[2] = m[1].substring(li + 1); m[1] = m[1].substring(0, li); }
						}
					}
					if (ev.baglanti.eski_baslik && m[1]) 
					{
						document.getElementById(ben.baslik).innerHTML = m[1];
						yeni_sayfa_basligi = m[1];
					}
					if (ev.baglanti.eski_baslik && m[2] && ben.kilavuz && document.getElementById(ben.kilavuz)) 
						document.getElementById(ben.kilavuz).innerHTML = m[2];
					
					ev.cevap.htm = gelen;
				} 
				else if ((gelen.substring(0, 1) == '{' && gelen.slice(-1) == '}') || (gelen.substring(0, 1) == '[' && gelen.slice(-1) == ']'))
					try
					{
						if (typeof JSON === 'object' && typeof JSON.parse === 'function')
							ev.cevap.json = JSON.parse(gelen);
						else if (typeof window.jQuery != 'undefined' && typeof jQuery.parseJSON !== 'undefined')
							ev.cevap.json = jQuery.parseJSON(gelen);
						else
							eval('ev.cevap.json = ' + gelen);

						ev.basarili = typeof ev.cevap.json.basarili !== 'undefined' && !ev.cevap.json.basarili ? false : true;
						ev.cevap.hata = typeof ev.cevap.json.hata == 'string' && ev.cevap.json.hata ? ev.cevap.json.hata : null; 
						ev.cevap.bildirim = typeof ev.cevap.json.bildirim == 'string' && ev.cevap.json.bildirim ? ev.cevap.json.bildirim : null; 
						ev.cevap.veri = typeof ev.cevap.json.veri !== 'undefined' ? ev.cevap.json.veri : null; 
					}
					catch (e) 
					{
						ev.basarili = false;
						ev.cevap.htm = gelen;
						ev.cevap.hata = ben.yazilar.JSONHatali;
					}
				else if (gelen.indexOf('<!--SN BASARILI SONUC-->')>-1)
				{
					ev.cevap.htm = gelen;
				}
				else if (gelen == 'OK')
				{
				}
				else if (gelen.substring(0,3) == 'OK|' || gelen.substring(0,3) == 'OK*' || gelen.substring(0,3) == 'OK/' || gelen.substring(0,3) == 'OK=')
				{
					gelen += 'OK|';
					var li = 0; 
					var li2 = gelen.indexOf('OK', 3);
					while (li2>-1) {
						if (gelen.substring(li2, li2+3) == 'OK|' || gelen.substring(li2, li2+3) == 'OK*' || gelen.substring(li2, li2+3) == 'OK/' || gelen.substring(li2, li2+3) == 'OK=') {
							var temp = gelen.substring(li+3, li2);
							switch (gelen.substring(li, li+3)) {
							case 'OK|':
								if (ev.cevap.veri === null) ev.cevap.veri = temp.split('|');
								else if (typeof ev.cevap.veri[0] === 'string') ev.cevap.veri = [ev.cevap.veri, temp.split('|')];
								else ev.cevap.veri[ev.cevap.veri.length] = temp.split('|');
								break;
							case 'OK*':
								if (ev.cevap.bildirim === null) ev.cevap.bildirim = temp;
								else if (typeof ev.cevap.bildirim === 'string') ev.cevap.bildirim = [ev.cevap.bildirim, temp];
								else ev.cevap.bildirim[ev.cevap.bildirim.length] = temp;
								break;
							case 'OK/':
								if (ev.cevap.htm === null) ev.cevap.htm = temp;
								else if (typeof ev.cevap.htm === 'string') ev.cevap.htm = [ev.cevap.htm, temp];
								else ev.cevap.htm[ev.cevap.htm.length] = temp;
								break;
							case 'OK=':
								if (ev.cevap.veri === null) ev.cevap.veri = temp;
								else if (typeof ev.cevap.veri === 'string') ev.cevap.veri = [ev.cevap.veri, temp];
								else ev.cevap.veri[ev.cevap.veri.length] = temp;
								break;
							}
							li = li2;
						}
						li2 = gelen.indexOf('OK', li2 + 1);
					}
				}
				else if (ev.cevap.kod<=100 || ev.baglanti.zaman_asimi_olustu || ev.baglanti.durduruldu)
				{
					ev.basarili = false;
					if (ev.baglanti.baska_link_tiklandi) {
						ev.cevap.bildirim = ben.yazilar.BaskaBirLinkTiklandi;
					} else if (ev.tip == 'ortu') {
						if (ev.baglanti.durduruldu)
							ev.cevap.htm = ben.yazilar.htmDurduruldu;
						else if (!ev.baglanti.zaman_asimi_olustu && ev.baglanti.sayac <= 10)
							ev.cevap.htm = ben.yazilar.htmEngellendi;
						else 
							ev.cevap.htm = ben.yazilar.htmZamanAsimiDetay;
					} else {
						if (ev.baglanti.durduruldu)
							ev.cevap.hata = ben.yazilar.Durduruldu;
						else if (!ev.baglanti.zaman_asimi_olustu && ev.baglanti.sayac <= 10)
							ev.cevap.hata = ben.yazilar.Engellendi;
						else 
							ev.cevap.hata = ben.yazilar.ZamanAsimi.replace('[saniye]', ev.baglanti.sayac);
					}
				}
				else if ((ev.cevap.kod < 200 || ev.cevap.kod >= 400) && ev.cevap.kod != 1223)
				{
					ev.basarili = false;
					ev.cevap.hata = ev.baglanti.xhr.responseText+'';
					if (!ev.cevap.hata) ev.cevap.hata = 'Error #' + ev.cevap.kod + ' (http status)';
				}
				else if (!gelen)
				{
					if (ev.tip == 'ortu')
						ev.cevap.htm = ben.yazilar.htmBasariliBosIcerik;
					else
						ev.cevap.hata = ben.yazilar.BasariliBosIcerik
					ev.basarili = false;
				}
				else 
				{
					ev.cevap.hata = gelen;
					ev.basarili = false;
				}

				//ADIM 3: Seçmelilerin Güncellenmesi: Select ve input isteklerinde sonuc durumuna göre seçimler ayarlanır
				if (ev.kaynak && ev.kaynak_turu == 'select')
					for (var i = 0; i < ev.kaynak.options.length; i++)
					{
						if (ev.basarili) 
							ev.kaynak.options[i].defaultSelected = i == ev.kaynak.selectedIndex;
						else if (ev.kaynak.options[i].defaultSelected)
							ev.kaynak.selectedIndex = i;
					}
				else if (ev.kaynak && ev.kaynak_turu == 'radio')
					for (var i = 0; i < ev.baglanti.pasiflestirilen_objeler.length; i++)
					{
						if (ev.basarili) 
							ev.baglanti.pasiflestirilen_objeler[i].defaultChecked = ev.baglanti.pasiflestirilen_objeler[i].checked;
						else if (ev.baglanti.pasiflestirilen_objeler[i].defaultChecked)
							ev.baglanti.pasiflestirilen_objeler[i].checked = true;
					}
				else if (ev.kaynak && ev.kaynak_turu == 'checkbox') 
				{
					if (ev.basarili) 
						ev.kaynak.defaultChecked = ev.kaynak.checked;
					else
						ev.kaynak.checked = !ev.kaynak.checked;
				}

				//ADIM 4: Yeni gelen sonuca göre hedefin güncellenmesi
				if (ev.kaynak_turu == 'js')
					var temp = 1; //tek isteği var ise hiç bir şey yapılmadan sonuç sonra fonksiyonuna gönderilir.
				else if (ev.hedef && ev.hedef.nodeName == 'SELECT')
				{
					if (ev.basarili && (ev.cevap.json || ev.cevap.veri))
					{
						ev.hedef.options.length = 0;
						var secenekler = !ev.cevap.json ? null : (ev.cevap.json.options ? ev.cevap.json.options : ev.cevap.json);
						if (!secenekler && ev.cevap.veri)
						{
							for (var t in ev.cevap.veri) 
							{
								var option = document.createElement("option");
								option.text = typeof ev.cevap.veri[t] == 'string' ? ev.cevap.veri[t] : ev.cevap.veri[t][1];
								option.value = typeof ev.cevap.veri[t] == 'string' ? ev.cevap.veri[t] : ev.cevap.veri[t][0];
								ev.hedef.add(option);
							}
						}
						else
						{
							for (var i in secenekler)
							{
								var option = document.createElement("option");
								if (typeof secenekler[i] == 'string' || typeof secenekler[i] == 'number') {
									option.value = i;
									option.text = secenekler[i];
								} else { //if (typeof secenekler[i] == 'object' || typeof secenekler[i] == 'array') {
								 	option.text = typeof secenekler[i].text !== 'undefined' ? secenekler[i].text : (typeof secenekler[i].innerHTML !== 'undefined' ? secenekler[i].innerHTML : secenekler[i].label + '');
									for (var v in secenekler[i])
										if (v != 'text' && v != 'label' && v != 'innerHTML')
											option.setAttribute(v, secenekler[i][v]);
								}
								ev.hedef.add(option);
							}
						}
					}
				} 
				else if (ev.hedef && ev.cevap.htm !== null)
					ben.yaz(ev.hedef, typeof ev.cevap.htm == 'string' ? ev.cevap.htm : ev.cevap.htm[0], ev.hedefsonrasi);
				else if (ev.hedef && ev.tip == 'ortu' && !ev.cevap.hata && ev.cevap.json)
					ben.yaz(ev.hedef, 'Örtü kullanımından sonra json içerik geldi.<br>Hatalı kullanım lütfen kontrol ediniz.<br><pre>' + (typeof JSON === 'object' && typeof JSON.parse === 'function' ? JSON.stringify(ev.cevap.json, undefined, 2) : gelen) + '</pre>');
				else if (ev.hedef && ev.tip == 'ortu')
					ben.yaz(ev.hedef, ben.yazilar.htmBaslikOlmayanBasariliIcerik + (ev.cevap.hata ? ev.cevap.hata : gelen));


				//ADIM 5: geçmişe ekle
				if (ev.cevap.htm !== null && ev.hedef)
				{
					//var gecmis_push_state = ev.tip != 'tek' && (typeof gelen == 'undefined' || gelen.indexOf('<!--BASLIK:') > -1 || gelen.indexOf('<!--SN BASARILI SONUC-->') > -1) && window.location.href.split('#')[0] != ev.adres && window.location.href.split('#')[0] != ev.cevap.adres;
					gecmis_duzenle(ev);
				}

				if (yeni_sayfa_basligi) //sayfa başlığı geçmiş düzenlendikten sonra değiştirilmeli yoksa açıklamalar ters olur.
					document.title = yeni_sayfa_basligi ; 

				//ADIM 6: işlem sonrası fonksiyonlar
				if (typeof ben.tumIslemlerSonrasi == 'function' && ben.tumIslemlerSonrasi.call(ev.kaynak ? ev.kaynak : ben, ev) === false)
					return;

				if (ev.sonra && ev.sonra.call(ev.kaynak ? ev.kaynak : ben, ev) === false)
					return;

				//ADIM 7: Bildirimlerin verilmesi
				var li;
				if (ev.cevap.bildirim && typeof ev.cevap.bildirim === 'string')
					ev.cevap.bildirim = [ev.cevap.bildirim];

				if (ev.cevap.bildirim)
					for (var i = 0; i < ev.cevap.bildirim.length; i++)
					{
						li = ev.cevap.bildirim[i].indexOf('[:]');
						if (li > -1)
							ben.bildirim(ev.cevap.bildirim[i].substring(li+3), ev.cevap.bildirim[i].substring(0, li));
						else
							ben.bildirim(ev.cevap.bildirim[i]);
					}

				//ADIM 8: Hatanın verilmesi
				if (ev.cevap.hata && ev.tip != 'ortu') //ortu kullanımında hata varsa htmlye yazdırılır.
				{
					li = ev.cevap.hata.indexOf('[:]');
					if (li > -1)
						ben.hata(ev.cevap.hata.substring(li+3), ev.cevap.hata.substring(0, li));
					else
						ben.hata(ev.cevap.hata);
				}
			}
		}


		var tid = setInterval(tick, 1000);
		var CalisanIstekler = {};
		function tick()
		{
			for (var x in CalisanIstekler) {
				var ev = CalisanIstekler[x];
				if (ev.baglanti.yukleniyor) 
				{
					ev.baglanti.sayac++;
					if (ev.baglanti.sayac==5) {
						if (ev.baglanti.eski_baslik)
							document.getElementById(ben.baslik).innerHTML = document.getElementById(ben.baslik).innerHTML.replace(ben.yazilar.Yukleniyor, ben.yazilar.BirazUzunSurdu);
						if (ev.tip == 'ortu') {
							ev.hedef.firstChild.firstChild.nextSibling.innerHTML = ben.yazilar.BirazUzunSurdu;
							ev.hedef.firstChild.firstChild.nextSibling.nextSibling.innerHTML = ben.yazilar.BirazUzunSurduDetay;
						}
					} else if (ev.asim > 0 && ev.baglanti.sayac >= ev.asim) {
						ev.baglanti.zaman_asimi_olustu = true;
						ev.baglanti.xhr.abort();
						break; //Calisanevler objesi değiştiği için döngüden çıkılması gerekiyor.
					} else if (ev.asim > 0 && ev.asim - ev.baglanti.sayac <= 9) {
						if (ev.baglanti.eski_baslik)
							document.getElementById(ben.baslik).innerHTML = document.getElementById(ben.baslik).innerHTML.replace(ben.yazilar.BirazUzunSurdu, ben.yazilar.Sonlandirilacak);
						if (ev.tip == 'ortu') {
							ev.hedef.firstChild.firstChild.nextSibling.innerHTML = ben.yazilar.Sonlandirilacak2;
							ev.hedef.firstChild.firstChild.nextSibling.nextSibling.innerHTML = ben.yazilar.SonlandirilacakDetay.replace('[saniye]', ev.asim-ev.baglanti.sayac);
						} else if (ev.asim-ev.baglanti.sayac == 9)
							ben.bildirim(ben.yazilar.SonlandirilacakDetay.replace('[saniye]', ev.asim-ev.baglanti.sayac), ben.yazilar.Sonlandirilacak2);
					}
				}
			}
		}

		function mevcut(o, d)
		{
			return !o || !d ? false : (o.hasAttribute ? o.hasAttribute(d) : typeof o[d] !== 'undefined');
		}

		this.yaz = function(div, icerik, hedefsonrasi)
		{
			//Java script objelerini bu yöntemle yüklüyoruz. innerHTML kullanımı bazı sorunlara sebep olabilir.
			//innerHTML ile yazdıktan sonra scriptleri tektek çalıştırmak gerekiyor. 
			//script src=x kullanıldığında ve sonraki scriptler bu çağırılan kütüphaneye bağlı ise kütüphaneler yüklenmeden script çalıştığı için hata oluşuyor
			//Jquery bu gibi durumlarda senkronik olarak src scripti yükler ve sonrasında diğer scriptleri çalıştırır
			//Bunun dışında jquery geçmiş datalarıda uygun bir şekilde kaldırdığı için yüklü ise jquery.html() fonksiyonunu kullanmak daha iyi
			var scripts = [];
			if (hedefsonrasi)
			{
				var enSonObj = div;
				while (enSonObj = enSonObj.nextSibling)
					if (enSonObj.nodeType == 1) break;

				//var myNav = navigator.userAgent.toLowerCase();
				//var ver = myNav.indexOf('msie') != -1 ? parseInt(myNav.split('msie')[1]) : false;

				if (div.nodeName == 'TR' && icerik.toLowerCase().indexOf('</tr>') > -1 && (/*@cc_on!@*/false || !!document.documentMode) && (document.documentMode < 10 || !document.documentMode))
				{
					var temp = document.createElement('div');
					temp.innerHTML = '<table>'+icerik+'</table>';
					temp = temp.firstChild;
					while (temp.firstChild)
						if (temp.firstChild.nodeName == 'TBODY' && icerik.toLowerCase().indexOf('</tbody>') == -1)
						{
							while (temp.firstChild.firstChild)
								if (enSonObj)
									div.parentNode.insertBefore(temp.firstChild.firstChild, enSonObj);
								else
									div.parentNode.appendChild(temp.firstChild.firstChild);
							temp.removeChild(temp.firstChild);
						}
						else if (enSonObj)
							div.parentNode.insertBefore(temp.firstChild, enSonObj);
						else
							div.parentNode.appendChild(temp.firstChild);
				}
				else
					div.insertAdjacentHTML('afterEnd', icerik);
				
				var tumu = div.parentNode.getElementsByTagName('*');
				var ekle = false;
				for (var i = 0; i < tumu.length; i++)
				{
					if (tumu[i] === div)
						ekle = true;
					else if (tumu[i] === enSonObj)
						break;
					else if (ekle && tumu[i].nodeName == 'SCRIPT')
						scripts[scripts.length] = tumu[i];
				}
			}
			// else if (typeof window.jQuery === 'function')
			// {
			// 	$(div).html(icerik);
			// }
			else
			{
				//div.getElementsByTagName( "*" ) ile öğeler alınıp eventsler kaldırılmalı
				while (div.firstChild)
					div.removeChild(div.firstChild);

				div.innerHTML = icerik;
				scripts = div.getElementsByTagName('script');
			}
			js_uygula(scripts, 0);
			if (hedefsonrasi)
				div.parentNode.removeChild(div);

		}

		function js_uygula(scripts, n)
		{
			if (scripts.length <= n || n > 100) return;

			var java_script_objesi = document.createElement('script');
			for (var x = 0; x < scripts[n].attributes.length; x++) {
				java_script_objesi.setAttribute(scripts[n].attributes[x].name, scripts[n].attributes[x].value);
			}
			java_script_objesi.text = scripts[n].innerHTML;

			if (java_script_objesi.src) {
				var indirildi = false;
				java_script_objesi.type = 'text/javascript';
				java_script_objesi.onload = java_script_objesi.onreadystatechange = function() {
					//console.log(this.readyState + ' = ' + java_script_objesi.src );
					if ( !indirildi && (!this.readyState || this.readyState == 'complete') )
					{
						indirildi = true;
						js_uygula(scripts, n + 1);
					}
				}
				scripts[n].parentNode.replaceChild(java_script_objesi, scripts[n]);
			}
			else 
			{
				try
				{
					scripts[n].parentNode.replaceChild(java_script_objesi, scripts[n]);
				}
				catch(err) {};
				js_uygula(scripts, n + 1);
			}
		}

		this.tek = function(adres, post, sonra, yuklenirken) {
			if (!ben.ajaxDestekleniyor) {
				ben.hata(ben.yazilar.AJAXKapali);
				return;
			}
			istek_yap(null, null, {href: adres, post: post, sonra: sonra, yuklenirken: yuklenirken, manuel_tek_istegi: true});
		}

		this.git = function(link, prop) 
		{
			if (!ben.ajaxDestekleniyor) 
			{
				ben.hata(ben.yazilar.AJAXKapali);
				return;
			}
			if (!prop || typeof prop != 'object')
				prop = {};

			prop.sn = prop.sn || '';
			prop.href = link || window.location.href;
			if (prop.manuel_tek_istegi) delete prop.manuel_tek_istegi;
			istek_yap(null, null, prop);
		}
	}

	if (!sinopsis) 
	{
		var sinopsis = new clsSinopsis();
		if (typeof module === 'object' && typeof module.exports === 'object') // CommonJS
			module.exports = sinopsis;
		else if ( typeof define === 'function' && define.amd) // AMD
			define( [], function () {
				return sinopsis;
			} );
		else if ( !window.sinopsis ) // window
			window.sinopsis = sinopsis;
	}
	else if (typeof console !== 'undefined')
		console.log('Sinopsis daha once yuklenmis. Bu sayfada tekrar yuklenmeye calisiliyor. Cagirilan icerikte tekrar sinopsis js dosyasini eklemeye gerek yok.');



} ( typeof window !== 'undefined' ? window : this ) );
