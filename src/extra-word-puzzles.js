const puzzleSource = `
AĞAÇ|Gövdesi ve dalları olan uzun ömürlü bitki
ADA|Her yanı suyla çevrili kara parçası
AY|Geceleri gökyüzünde gördüğümüz Dünya uydusu
AKŞAM|Güneş battıktan sonraki gün bölümü
BATI|Güneşin battığı ana yön
BUZUL|Dağlarda ağır ağır ilerleyen büyük buz kütlesi
ÇAKIL|Kıyılarda bulunan küçük yuvarlak taş
ÇAMUR|Toprakla suyun karışımından oluşan yumuşak madde
ÇEŞME|Musluğundan su akan taş ya da beton yapı
ÇİSENTİ|Çok ince tanelerle yağan hafif yağmur
DAĞ|Çevresine göre çok yüksek olan yeryüzü şekli
DAL|Ağacın gövdeden ayrılan kollarından biri
DALGA|Rüzgârla su yüzeyinde oluşan kıvrım
DORUK|Bir dağın en yüksek noktası
ESİNTİ|Hafifçe hissedilen yumuşak rüzgâr
FIRTINA|Çok güçlü esen ve çevreyi etkileyen rüzgâr
GÖK|Başımızın üzerinde uzanan sonsuz mavilik
GÖKKUŞAĞI|Yağmurdan sonra gökte beliren renkli yay
GÖLET|Gölden daha küçük durgun su birikintisi
HAVA|Soluduğumuz ve dünyayı saran gaz karışımı
İLKBAHAR|Doğanın yeniden canlandığı mevsim
KIŞ|Yılın en soğuk mevsimi
KUM|Kıyılarda biriken çok küçük taş taneleri
KUZEY|Pusulada yukarıyı gösteren ana yön
MAĞARA|Kayaların içinde oluşmuş doğal boşluk
OVA|Çevresine göre düz ve geniş toprak parçası
SONBAHAR|Yaprakların sararıp döküldüğü mevsim
TOPRAK|Bitkilerin kök saldığı yeryüzü katmanı
YAĞMUR|Bulutlardan su damlaları halinde düşen yağış
YAZ|Yılın en sıcak mevsimi
ARI|Çiçeklerden bal özü toplayan çalışkan böcek
AT|İnsanların yüzyıllardır bindiği güçlü hayvan
BALIK|Solungaçlarıyla suda yaşayan hayvan
BAYKUŞ|Geceleri etkin olan iri gözlü kuş
BILDIRCIN|Kısa kanatlı küçük bir tarla kuşu
BÖCEK|Altı bacaklı küçük hayvanların genel adı
CEYLAN|İnce bacaklı ve çok hızlı koşan zarif hayvan
CİVCİV|Tavuktan yeni çıkmış küçük yavru
ÇAYLAK|Uzun kanatlı yırtıcı bir kuş
DELİCE|Tarlalarda süzülerek avlanan yırtıcı kuş
DENİZATI|Başı ata benzeyen küçük deniz canlısı
DOĞAN|Çok hızlı uçabilen güçlü yırtıcı kuş
GÜVERCİN|Meydanlarda sık görülen uysal kuş
HOROZ|Sabah ötüşüyle bilinen erkek tavuk
İBİBİK|Başındaki yelpaze biçimli ibiğiyle tanınan kuş
KELEBEK|Renkli kanatları olan narin böcek
KIRLANGIÇ|Çatallı kuyruğuyla hızlı uçan göçmen kuş
KİRPİ|Sırtı dikenlerle kaplı küçük hayvan
KÖSTEBEK|Toprağın altında tüneller açan hayvan
KURBAĞA|Hem karada hem suda yaşayabilen sıçrayıcı hayvan
LEYLEK|Uzun bacaklı ve uzun gagalı göçmen kuş
PELİKAN|Gagasının altında geniş kesesi bulunan su kuşu
PENGUEN|Uçamayan ama çok iyi yüzen kutup kuşu
SAKA|Yüzündeki kırmızı renklerle tanınan ötücü kuş
SANSAR|Uzun gövdeli ve çevik küçük memeli
SİNCAP|Ağaçlarda yaşayan kabarık kuyruklu hayvan
TAVŞAN|Uzun kulaklı ve hızlı koşan sevimli hayvan
TAVUS|Erkeği gösterişli kuyruğunu yelpaze gibi açan kuş
TURNA|Uzun boyunlu ve zarif göçmen kuş
YUNUS|Zeki ve oyuncu bir deniz memelisi
BADEM|İnce kabuklu ve besleyici bir yemiş
BAMYA|Pişince yumuşayan yeşil ve uzun sebze
BEZELYE|Yeşil kabuğun içinde sıralanan yuvarlak taneler
BİBER|Tatlı ya da acı çeşitleri bulunan sebze
BUĞDAY|Un ve ekmek yapılan sarı başaklı tahıl
ÇAM|İğne yapraklarını kışın dökmeyen kokulu ağaç
ÇİLEK|Üzeri küçük çekirdeklerle kaplı kırmızı meyve
DEFNE|Yaprağı yemeklere koku veren yeşil ağaç
DUT|Beyaz ya da kara renkli taneli yaz meyvesi
EKİN|Tarlaya ekilen tahıl ürünlerinin genel adı
ELMA|Kırmızı ya da yeşil olabilen gevrek meyve
ERİK|Yeşili ekşi, olgunu tatlı olan çekirdekli meyve
FESLEĞEN|Yaprakları güzel kokan mutfak otu
GÜL|Dikenli dalda açan güzel kokulu çiçek
HAVUÇ|Toprak altında büyüyen turuncu kök sebze
IHLAMUR|Çiçekleri sıcak içecek yapılan güzel kokulu ağaç
KABAK|Sarı çiçek açan iri ve etli sebze
KAKTÜS|Kurak yerlerde yetişen dikenli bitki
KARANFİL|Kat kat taç yapraklı hoş kokulu çiçek
KARPUZ|İçi kırmızı, kabuğu yeşil iri yaz meyvesi
KESTANE|Dikenli kabuğun içinden çıkan kahverengi yemiş
KİRAZ|Sapı uzun, kırmızı ve sulu yaz meyvesi
LAHANA|Üst üste sarılı geniş yapraklı sebze
MARUL|Salatalarda kullanılan gevrek yeşil yaprak
MENEKŞE|Çoğunlukla mor açan küçük ve narin çiçek
MISIR|Koçanında sıra sıra sarı taneler bulunan bitki
NANE|Yaprakları ferahlatıcı kokan yeşil ot
PAPATYA|Beyaz yapraklı ve sarı göbekli kır çiçeği
PATATES|Toprak altında yetişen nişastalı yumru
PORTAKAL|Turuncu kabuklu, dilimli ve sulu meyve
SALATALIK|Sulu ve gevrek uzun yeşil sebze
SARMAŞIK|Tutunarak duvarlara ve ağaçlara tırmanan bitki
SOĞAN|Kat kat kabuklu ve keskin kokulu sebze
ÜZÜM|Salkımlar halinde yetişen küçük taneli meyve
VİŞNE|Kiraza benzeyen ekşi kırmızı meyve
YASEMİN|Küçük beyaz çiçekleri yoğun kokan sarmaşık
YONCA|Üç yapraklı haliyle tanınan çayır bitkisi
ZENCEFİL|Kökü baharat ve sıcak içeceklerde kullanılan bitki
ZERDEÇAL|Yemeklere sarı renk veren kök baharat
AYRAN|Yoğurt ve suyla hazırlanan serin içecek
BAL|Arıların çiçeklerden yaptığı tatlı yiyecek
BÖREK|İnce hamur katları arasına iç konarak pişirilen yemek
BULGUR|Buğdayın kaynatılıp kırılmasıyla elde edilen tahıl
ÇORBA|Kaşıkla içilen sıcak ve sulu yemek
DOMATES|Salata ve yemeklerde kullanılan kırmızı sebze
EKMEK|Un, su ve mayayla pişirilen temel yiyecek
HELVA|Un ya da irmikle yapılan geleneksel tatlı
KAHVE|Kavrulmuş çekirdeklerden hazırlanan sıcak içecek
KAYMAK|Sütün üstünde biriken yoğun ve yağlı tabaka
KEBAP|Etin ateşte ya da fırında pişirildiği yemek
KURABİYE|Fırında pişen küçük ve tatlı hamur işi
LOKUM|Nişasta ve şekerle yapılan yumuşak geleneksel tatlı
MANTI|Küçük hamur bohçalarında kıyma bulunan yemek
MERCİMEK|Çorbası sık yapılan küçük ve yassı bakliyat
MUHALLEBİ|Sütle hazırlanan yumuşak kıvamlı tatlı
PEYNİR|Sütten yapılan tuzlu ya da tuzsuz yiyecek
PİLAV|Pirinç ya da bulgurun tane tane pişirildiği yemek
REÇEL|Meyvenin şekerle kaynatılmasıyla yapılan kahvaltılık
SALATA|Çiğ sebzelerin doğranıp karıştırıldığı yiyecek
SİMİT|Üzeri susamlı halka biçiminde hamur işi
SÜT|Yavruları besleyen beyaz ve besleyici içecek
TARHANA|Yoğurtlu karışımdan kurutulan geleneksel çorbalık
TATLI|Şekerli yiyeceklerin genel adı
TEREYAĞI|Süt yağından elde edilen sarı renkli yiyecek
TURŞU|Sebzelerin tuzlu ve ekşili suda bekletilmiş hali
YOĞURT|Sütün mayalanmasıyla oluşan koyu kıvamlı yiyecek
ZEYTİNYAĞI|Zeytin meyvesinin sıkılmasıyla elde edilen yağ
AŞURE|Tahıl, bakliyat ve kuru meyveli geleneksel tatlı
BAKLAVA|İnce yufka, yemiş ve şerbetle yapılan tatlı
DOLMA|Sebze ya da yaprağın içi doldurularak yapılan yemek
GÖZLEME|İnce hamurun iç konup sacda pişirildiği yiyecek
KADAYIF|İnce hamur telleri ve şerbetle yapılan tatlı
KÖFTE|Baharatlı kıymanın yuvarlanıp pişirildiği yemek
NOHUT|Yuvarlak taneli sarı renkli bakliyat
OMLET|Çırpılmış yumurtanın tavada pişirilmiş hali
PEKMEZ|Meyve suyunun kaynatılmasıyla yapılan koyu şurup
SARMA|Yaprağa iç konup sarılarak yapılan yemek
TOST|İki ekmek arasında peynirle kızartılan yiyecek
YUFKA|Çok ince açılmış yuvarlak hamur
ANAHTAR|Bir kilidi açıp kapatmaya yarayan küçük araç
AYNA|Karşısındakinin görüntüsünü yansıtan parlak yüzey
BARDAK|Su ve başka içeceklerin konduğu küçük kap
BATTANİYE|Uyurken sıcak tutması için örtülen kalın örtü
BIÇAK|Keskin ağzıyla kesme işinde kullanılan araç
BİBLO|Raf ve masa üstüne konan küçük süs eşyası
BULAŞIK|Yemekten sonra yıkanması gereken kap kacak
ÇATAL|Yiyeceği tutmaya yarayan dişli sofra aracı
ÇEKMECE|Dolap ya da masadan dışarı çekilen göz
ÇERÇEVE|Bir resmi ya da fotoğrafı çevreleyen kenarlık
ÇİVİ|Çekiçle çakılan ince metal parçası
DOLAP|Eşya ve giysi saklamak için kullanılan mobilya
DÜĞME|Giysinin iki yanını birbirine tutturmaya yarayan parça
FIRÇA|Kıllı yüzeyiyle temizleme ya da boyama aracı
HALI|Zemini örten desenli ve dokuma ev eşyası
HAVLU|Yıkandıktan sonra kurulanmaya yarayan kumaş
İĞNE|Dikişte iplik geçirilen ince ve sivri araç
KAVANOZ|Yiyecek saklanan kapaklı cam kap
KİLİT|Kapı ya da çekmeceyi kapalı tutan düzenek
KOLTUK|Arkalığı ve kolları olan rahat oturma eşyası
LAMBA|Bir ortamı aydınlatan araç
MAKAS|İki kesici ağzı bulunan el aracı
MASA|Üzerinde yemek yenilen ya da çalışılan mobilya
MİNDER|Otururken ya da yaslanırken kullanılan yumuşak yastık
PERDE|Pencereyi örten kumaş ya da ince örtü
PENCERE|Bir yapıya ışık ve hava girmesini sağlayan açıklık
RAF|Eşyaların dizildiği yatay dolap bölmesi
SABUN|Su ile köpürerek temizleyen madde
SANDALYE|Tek kişinin oturması için yapılmış arkalıklı eşya
SÜPÜRGE|Yerdeki toz ve çöpleri toplamaya yarayan araç
TABAK|Yemeğin içine konduğu yayvan kap
TENCERE|Yemek pişirmeye yarayan derin ve kapaklı kap
TERLİK|Ev içinde ayağa giyilen rahat ayakkabı
TEPSİ|Bardak ve tabak taşımaya yarayan geniş kap
ÜTÜ|Kumaştaki kırışıklıkları ısıyla düzelten araç
VAZO|Çiçeklerin su içinde tutulduğu süslü kap
YASTIK|Uyurken başın altına konan yumuşak eşya
YORGAN|Uyurken üstümüze örttüğümüz kalın yatak örtüsü
ZİL|Çalınca ses çıkararak haber veren düzenek
ŞEMSİYE|Yağmurdan ya da güneşten korunmak için açılan araç
CADDE|Şehir içindeki geniş ve işlek yol
DURAK|Toplu taşıma aracının yolcu alıp bıraktığı yer
GARAJ|Aracın kapalı biçimde korunduğu yapı
İSKELE|Teknelerin yanaştığı kıyı yapısı
İSTASYON|Trenlerin durduğu ve yolcu aldığı yer
KALDIRIM|Yolun yayalara ayrılmış yüksekçe kenarı
KASABA|Köyden büyük, şehirden küçük yerleşim
KAVŞAK|Birden çok yolun birleştiği ya da ayrıldığı yer
KENT|Nüfusu ve yapıları çok olan büyük yerleşim
KULE|Yüksek ve dar biçimde yapılmış yapı
LİMAN|Gemilerin güvenle yanaşıp beklediği kıyı alanı
MAHALLE|Bir şehir ya da kasabanın bölümlerinden biri
MEYDAN|Yerleşim içinde yolların açıldığı geniş alan
OKUL|Öğrencilerin eğitim gördüğü kurum
OTEL|Yolcuların ücret karşılığı konakladığı yer
PARK|Dinlenmek ve gezmek için düzenlenmiş yeşil alan
PATİKA|İnsan ya da hayvanların açtığı dar yol
RIHTIM|Gemi ve teknelerin yanaştığı sağlam kıyı bölümü
SOKAK|Evlerin arasında uzanan şehir yolu
TREN|Raylar üzerinde vagonlarıyla ilerleyen taşıt
VAPUR|Kısa deniz yolculuklarında kullanılan yolcu gemisi
VAGON|Treni oluşturan yolcu ya da yük bölümlerinden biri
YELKEN|Rüzgârı yakalayıp tekneyi ilerleten geniş bez
YOL|Bir yerden başka yere gitmek için kullanılan geçit
YOLCU|Bir taşıtla ya da yürüyerek yolculuk eden kişi
YOKUŞ|Aşağıdan yukarıya doğru eğimli yol
KAMP|Doğada çadır kurarak yapılan geçici konaklama
ÇADIR|Direk ve bezle kurulan taşınabilir barınak
HARİTA|Bir bölgenin kuşbakışı küçültülmüş çizimi
PUSULA|Yönleri gösteren mıknatıslı araç
ANNE|Bir çocuğu dünyaya getiren kadın
BABA|Bir çocuğun erkek ebeveyni
AİLE|Birbirine yakınlık bağıyla bağlı kişiler
ARKADAŞ|Birlikte vakit geçirmekten hoşlandığımız kişi
BEBEK|Henüz çok küçük yaştaki çocuk
ÇOCUK|Bebeklik ile gençlik arasındaki insan
DEDE|Anne ya da babanın babası
EBE|Doğum sırasında anneye yardımcı olan sağlık çalışanı
KARDEŞ|Aynı anne ya da babayı paylaşan çocuklardan biri
KOMŞU|Yakınımızdaki evde yaşayan kişi
MİSAFİR|Bir eve ya da yere kısa süreli gelen kişi
ÖĞRENCİ|Bir okulda ya da öğretmenden ders alan kişi
ÖĞRETMEN|Bilgi ve beceri öğreten kişi
USTA|Bir işi büyük beceriyle yapan deneyimli kişi
YOLDAŞ|Aynı yolda ya da amaçta birlikte olan kişi
DOKTOR|Hastalıkları tanıyıp tedavi eden sağlık çalışanı
HEMŞİRE|Hastaların bakımını üstlenen sağlık çalışanı
AŞÇI|Yemek hazırlamayı meslek edinmiş kişi
BAHÇIVAN|Bahçe ve bitkilerin bakımını yapan kişi
BALIKÇI|Balık tutmayı ya da satmayı meslek edinmiş kişi
ÇİFTÇİ|Toprağı ekip ürün yetiştiren kişi
DEMİRCİ|Demiri dövüp biçimlendiren zanaatkâr
ECZACI|İlaçların hazırlanması ve verilmesiyle ilgilenen kişi
FIRINCI|Ekmek ve hamur işi pişirip satan kişi
MARANGOZ|Ahşaptan eşya yapan usta
MÜZİSYEN|Bir müzik aleti çalan ya da müzik üreten kişi
RESSAM|Boyalarla resim yapan sanatçı
ŞAİR|Duygu ve düşüncelerini şiirle anlatan kişi
TERZİ|Giysi diken ve onaran kişi
VETERİNER|Hayvanların sağlığıyla ilgilenen doktor
ADALET|Herkese hakkını gözeterek davranma ilkesi
CESARET|Korkuya rağmen doğru olanı yapabilme gücü
CÖMERTLİK|Sahip olduklarını isteyerek paylaşma özelliği
DAYANIŞMA|İnsanların birbirine destek olarak güç birliği yapması
DENGE|İki tarafın uyum içinde ve ölçülü olması
DİKKAT|Zihni bir konu üzerinde toplama durumu
DÜRÜSTLÜK|Doğruyu söyleme ve güvenilir davranma özelliği
GÜVEN|Birine ya da bir şeye inanıp dayanma duygusu
HEYECAN|Yeni ya da önemli bir olayın oluşturduğu güçlü duygu
HOŞGÖRÜ|Farklı düşünce ve davranışlara anlayış gösterme
İYİLİK|Başkasına yarar sağlayan güzel davranış
MERAK|Bir şeyi öğrenme ve anlama isteği
MUTLULUK|İnsanın kendini iyi ve sevinçli hissetmesi
ÖZGÜVEN|Kişinin kendi yeteneklerine inanması
ÖZGÜRLÜK|Baskı altında olmadan seçim yapabilme durumu
SAYGI|Birinin değerini kabul ederek özenli davranma
SEVGİ|Birine ya da bir şeye karşı duyulan sıcak bağlılık
SEVİNÇ|Güzel bir olayın doğurduğu canlı mutluluk
ŞEFKAT|Koruma ve iyilik etme isteği taşıyan sevgi
TEŞEKKÜR|Yapılan bir iyiliğe karşı duyulan minnetin sözü
UYUM|Parçaların birbirine yakışarak birlikte işlemesi
VİCDAN|İnsana doğruyla yanlışı içten hissettiren duygu
YARDIM|Birinin işini kolaylaştırmak için verilen destek
ZARAFET|Davranış ve görünüşteki ince güzellik
BAŞARI|Bir işi istenen sonuca ulaştırma
BİLGELİK|Bilgiyi deneyim ve doğru yargıyla kullanma
COŞKU|İçten gelen güçlü sevinç ve canlılık
GÜLÜMSEME|Yüzde beliren sessiz ve sıcak sevinç ifadesi
SADAKAT|Birine ya da bir değere içten bağlı kalma
SAKİNLİK|Telaş ve gerginlikten uzak olma durumu
ALBÜM|Fotoğraf ya da anıların düzenli tutulduğu kitap
BAĞLAMA|Tezeneyle çalınan telli Türk müziği çalgısı
BALE|Müzik eşliğinde özel hareketlerle yapılan sahne dansı
BİLMECE|Cevabı düşünerek bulunan kısa ve eğlenceli soru
ÇİZGİ|Bir kalemin yüzeyde bıraktığı ince iz
DAVUL|Tokmakla vurularak çalınan büyük vurmalı çalgı
DEFTER|Yazı yazmak için bir araya getirilmiş kâğıtlar
DESTAN|Bir milletin kahramanlıklarını anlatan uzun eser
FIKRA|Sonunda gülümseten kısa ve nükteli anlatı
FLÜT|Üflenerek çalınan ince sesli çalgı
FOTOĞRAF|Bir anın ışık yardımıyla kaydedilmiş görüntüsü
GİTAR|Parmakla ya da pena ile çalınan telli çalgı
HEYKEL|Taş, metal ya da başka maddeden yapılan üç boyutlu eser
HİKÂYE|Yaşanmış ya da tasarlanmış olayları anlatan kısa yazı
KEMAN|Yayla çalınan dört telli çalgı
KİTAP|Sayfalardan oluşan yazılı ya da basılı eser
KUKLA|İp ya da elle hareket ettirilen oyuncak karakter
MEKTUP|Uzak birine duygu ve haber ileten yazı
MÜZE|Değerli eserlerin korunup sergilendiği yer
OYUN|Eğlenmek ya da öğrenmek için kurallarla yapılan etkinlik
ÖYKÜ|Kısa bir olay çevresinde gelişen edebî anlatı
RESİM|Çizgi ve renklerle oluşturulan görsel eser
ROMAN|Kişi ve olayları geniş biçimde anlatan uzun eser
SAHNE|Gösterinin izleyici önünde sunulduğu bölüm
ŞARKI|Sözlerin bir ezgiyle birlikte söylendiği müzik eseri
ŞİİR|Duygu ve düşünceleri ölçülü ve etkili anlatan edebî tür
TİYATRO|Bir olayın oyuncularla sahnede canlandırıldığı sanat
TÜRKÜ|Halkın duygularını ezgiyle anlatan geleneksel şarkı
ZURNA|Güçlü sesli ve nefesle çalınan geleneksel çalgı
BULMACA|Soruları çözerek sözcük ya da sonuç bulma oyunu
DAKİKA|Altmış saniyeden oluşan zaman ölçüsü
GÜN|Yirmi dört saatlik zaman dilimi
HAFTA|Yedi günden oluşan zaman dilimi
SAAT|Altmış dakikalık süreyi ve zamanı gösteren araç
SANİYE|Bir dakikanın altmışta biri olan kısa süre
YARIN|Bugünden sonraki gün
DÜN|Bugünden önceki gün
BUGÜN|Şu anda içinde bulunduğumuz gün
GECE|Güneş battıktan doğana kadar süren karanlık zaman
ÖĞLE|Günün sabahla akşam arasındaki orta bölümü
İKİNDİ|Öğle ile akşam arasındaki gün bölümü
MEVSİM|Yılın hava koşullarıyla ayrılan dört bölümünden biri
TAKVİM|Günleri, ayları ve yılı düzenli gösteren çizelge
TARİH|Bir olayın gerçekleştiği gün, ay ve yıl bilgisi
ZAMAN|Olayların geçmişten geleceğe aktığı süre
KAR|Bulutlardan beyaz kristaller halinde düşen yağış
AYAZ|Özellikle geceleri hissedilen kuru ve keskin soğuk
PUS|Uzağı görmeyi zorlaştıran hafif sis
SİS|Yeryüzüne yakın oluşan yoğun su buharı tabakası
ŞİMŞEK|Fırtınada bulutlar arasında görülen ani ışık
KIRAĞI|Soğukta yüzeyler üzerinde oluşan ince buz tabakası
MELTEM|Kıyılarda gündüz ve gece yön değiştiren hafif rüzgâr
LODOS|Güneybatıdan esen ılık rüzgâr
POYRAZ|Kuzeydoğudan esen serin rüzgâr
NEM|Havanın içinde bulunan su buharı
SICAK|Yüksek ısıyı anlatan hava durumu
SERİN|Ne sıcak ne de çok soğuk olan ferah hava
GÜNDÜZ|Güneşin doğuşuyla batışı arasındaki aydınlık süre
EYLÜL|Sonbaharın başladığı dokuzuncu ay
KASIM|Sonbaharın son ayı
BAŞ|İnsan bedeninin gözleri ve beyni taşıyan üst bölümü
EL|Tutmaya ve dokunmaya yarayan organ
AYAK|Yürürken yere basmamızı sağlayan organ
GÖZ|Görmemizi sağlayan duyu organı
KULAK|Sesleri duymamızı sağlayan organ
BURUN|Koku almamızı ve nefes almamızı sağlayan organ
AĞIZ|Konuşmaya ve yemek yemeye yarayan açıklık
OMUZ|Kolun gövdeye bağlandığı üst bölüm
DİZ|Bacağın ortasında bükülmesini sağlayan eklem
PARMAK|El ve ayak uçlarındaki hareketli bölümlerden biri
SAÇ|Başın üzerinde uzayan ince teller
YÜZ|Başın göz, burun ve ağzı taşıyan ön kısmı
KALP|Kanı bütün bedene pompalayan yaşamsal organ
NEFES|Akciğerlere alınıp verilen hava
GÖMLEK|Üst bedene giyilen yakalı ve düğmeli giysi
ETEK|Belden aşağıya giyilen açık uçlu giysi
CEKET|Gömlek ya da kazak üzerine giyilen kısa üstlük
ÇORAP|Ayağa giyilen ince örgü giysi
ELDİVEN|Elleri soğuktan ya da kirden koruyan giysi
ŞAPKA|Başı güneşten ya da soğuktan koruyan giysi
KEMER|Giysiyi belde tutmaya yarayan uzun şerit
AYAKKABI|Yürürken ayağı koruyan tabanlı giysi
BOT|Bileği örten dayanıklı ayakkabı
PANTOLON|Belden ayaklara uzanan iki paçalı giysi
KIYAFET|Üzerimize giydiğimiz eşyaların genel adı
ATKI|Soğukta boyna sarılan uzun örgü
HIRKA|Önden açılan, kollu ve yumuşak üst giysisi
YELEK|Kolsuz olarak gövdeye giyilen üstlük
ÇANTA|Eşyaları taşımak için kullanılan saplı kap
TOKA|Saçı ya da giysiyi tutturmaya yarayan küçük araç
AKIL|Düşünme, anlama ve doğru karar verme yetisi
BİLGİ|Öğrenme ve deneyim yoluyla edinilen gerçekler
CEVAP|Bir soru ya da isteğe karşı verilen karşılık
ÇÖZÜM|Bir sorunu ortadan kaldıran yol ya da sonuç
DÜŞÜNCE|Zihinde oluşan fikir ve değerlendirme
FİKİR|Bir konu hakkında zihinde oluşan görüş
GÖREV|Yapılması bir kişiye bırakılan iş
HAFIZA|Yaşanan ve öğrenilenleri saklama yetisi
HAYAL|Zihinde canlandırılan görüntü ya da istek
HEDEF|Ulaşılmak istenen sonuç
İPUCU|Bir sonuca yaklaşmayı kolaylaştıran küçük bilgi
KARAR|Düşünüp seçeneklerden birini seçme sonucu
KURAL|Bir işin nasıl yapılacağını belirleyen ilke
ODAK|Dikkatin toplandığı merkez ya da konu
NEDEN|Bir olayın ortaya çıkmasını sağlayan sebep
ÖRNEK|Bir düşünceyi açıklamak için gösterilen benzer durum
PLAN|Bir işi gerçekleştirmek için önceden kurulan düzen
SORU|Bilgi edinmek amacıyla söylenen söz
SONUÇ|Bir olay ya da işlemin sonunda ortaya çıkan durum
SÜRPRİZ|Beklenmeden karşılaşılan sevindirici olay
YÖNTEM|Bir amaca ulaşmak için izlenen düzenli yol
ZEKÂ|Anlama, öğrenme ve sorun çözme yeteneği
BAŞLANGIÇ|Bir işin ya da sürecin ilk noktası
BECERİ|Bir işi iyi yapabilme yeteneği
DENEYİM|Yaşayarak ve uygulayarak edinilen bilgi
DÜZEN|Parçaların belirli ve uyumlu biçimde yerleşmesi
SEÇİM|Birden çok seçenek arasından birini ayırma işi
SIR|Herkesle paylaşılmayan gizli bilgi
YANIT|Bir soruya verilen karşılık
YOLCULUK|Bir yerden başka bir yere gitme süreci
ZAFER|Bir yarış ya da mücadele sonunda kazanılan başarı
`;

export const extraWordPuzzles = puzzleSource.trim().split("\n").map((row) => {
  const [word, clue] = row.split("|");
  return { word, clue };
});
