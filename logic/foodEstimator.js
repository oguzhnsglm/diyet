// Yemek adına göre kalori ve şeker tahmini yapan basit AI sistemi

// Türk mutfağı yemek veritabanı - 150+ yemek
const FOOD_DATABASE = {
  // Kahvaltılıklar
  'yumurta': { calories: 80, sugar: 0.5, perUnit: '1 adet' },
  'haşlanmış yumurta': { calories: 78, sugar: 0.6, perUnit: '1 adet' },
  'sahanda yumurta': { calories: 95, sugar: 0.5, perUnit: '1 adet' },
  'omlet': { calories: 154, sugar: 1.2, perUnit: '2 yumurta' },
  'menemen': { calories: 150, sugar: 3, perUnit: '1 porsiyon' },
  'peynir': { calories: 100, sugar: 0.3, perUnit: '30g' },
  'beyaz peynir': { calories: 75, sugar: 0.5, perUnit: '30g' },
  'kaşar peyniri': { calories: 113, sugar: 0.3, perUnit: '30g' },
  'tulum peyniri': { calories: 95, sugar: 0.4, perUnit: '30g' },
  'lor peyniri': { calories: 40, sugar: 1, perUnit: '30g' },
  'zeytin': { calories: 45, sugar: 0, perUnit: '10 adet' },
  'yeşil zeytin': { calories: 41, sugar: 0.2, perUnit: '10 adet' },
  'siyah zeytin': { calories: 49, sugar: 0.1, perUnit: '10 adet' },
  'ekmek': { calories: 70, sugar: 1, perUnit: '1 dilim' },
  'beyaz ekmek': { calories: 75, sugar: 1.5, perUnit: '1 dilim' },
  'kepekli ekmek': { calories: 65, sugar: 0.8, perUnit: '1 dilim' },
  'tam buğday ekmeği': { calories: 69, sugar: 1, perUnit: '1 dilim' },
  'simit': { calories: 280, sugar: 2, perUnit: '1 adet' },
  'börek': { calories: 250, sugar: 3, perUnit: '1 dilim' },
  'su böreği': { calories: 230, sugar: 2, perUnit: '1 dilim' },
  'kol böreği': { calories: 270, sugar: 3, perUnit: '1 dilim' },
  'açma': { calories: 300, sugar: 5, perUnit: '1 adet' },
  'poğaça': { calories: 290, sugar: 4, perUnit: '1 adet' },
  'gözleme': { calories: 320, sugar: 2, perUnit: '1 adet' },
  'sigara böreği': { calories: 180, sugar: 1.5, perUnit: '3 adet' },
  'çiğ börek': { calories: 240, sugar: 2, perUnit: '1 dilim' },
  'pide': { calories: 350, sugar: 3, perUnit: '1 dilim' },
  'lahmacun': { calories: 280, sugar: 4, perUnit: '1 adet' },
  'reçel': { calories: 50, sugar: 13, perUnit: '1 yemek kaşığı' },
  'bal': { calories: 64, sugar: 17, perUnit: '1 yemek kaşığı' },
  'tahin': { calories: 89, sugar: 0.5, perUnit: '1 yemek kaşığı' },
  'pekmez': { calories: 60, sugar: 15, perUnit: '1 yemek kaşığı' },
  'tereyağı': { calories: 102, sugar: 0, perUnit: '1 yemek kaşığı' },
  'margarin': { calories: 100, sugar: 0, perUnit: '1 yemek kaşığı' },
  
  // Ana Yemekler - Pilavlar
  'pilav': { calories: 200, sugar: 0.5, perUnit: '1 porsiyon' },
  'bulgur pilavı': { calories: 180, sugar: 0.8, perUnit: '1 porsiyon' },
  'şehriyeli pilav': { calories: 220, sugar: 1, perUnit: '1 porsiyon' },
  'nohutlu pilav': { calories: 240, sugar: 2, perUnit: '1 porsiyon' },
  'ic pilav': { calories: 280, sugar: 2, perUnit: '1 porsiyon' },
  'arpa şehriye': { calories: 210, sugar: 1, perUnit: '1 porsiyon' },
  
  // Yöresel Ana Yemekler
  'maklube': { calories: 420, sugar: 3, perUnit: '1 porsiyon' },
  'makloube': { calories: 420, sugar: 3, perUnit: '1 porsiyon' },
  'hünkar beğendi': { calories: 380, sugar: 5, perUnit: '1 porsiyon' },
  'ali nazik': { calories: 350, sugar: 4, perUnit: '1 porsiyon' },
  'testi kebabı': { calories: 450, sugar: 3, perUnit: '1 porsiyon' },
  'beğendi': { calories: 300, sugar: 4, perUnit: '1 porsiyon' },
  'tas kebabı': { calories: 380, sugar: 2, perUnit: '1 porsiyon' },
  'kuyu kebabı': { calories: 480, sugar: 2, perUnit: '1 porsiyon' },
  'tandır kebabı': { calories: 420, sugar: 2, perUnit: '1 porsiyon' },
  'cağ kebabı': { calories: 400, sugar: 1, perUnit: '1 porsiyon' },
  'beyti': { calories: 460, sugar: 3, perUnit: '1 porsiyon' },
  'yoğurtlu kebap': { calories: 480, sugar: 4, perUnit: '1 porsiyon' },
  'patlıcan kebabı': { calories: 360, sugar: 6, perUnit: '1 porsiyon' },
  'orman kebabı': { calories: 390, sugar: 4, perUnit: '1 porsiyon' },
  'kuşbaşı': { calories: 320, sugar: 1, perUnit: '1 porsiyon' },
  'etli yaprak sarma': { calories: 220, sugar: 3, perUnit: '1 porsiyon' },
  'kağıt kebabı': { calories: 370, sugar: 2, perUnit: '1 porsiyon' },
  'patlıcanlı kebap': { calories: 380, sugar: 5, perUnit: '1 porsiyon' },
  
  // Karadeniz Mutfağı
  'hamsi tava': { calories: 280, sugar: 1, perUnit: '1 porsiyon' },
  'hamsi buğulama': { calories: 220, sugar: 0.5, perUnit: '1 porsiyon' },
  'mıhlama': { calories: 340, sugar: 2, perUnit: '1 porsiyon' },
  'muhlama': { calories: 340, sugar: 2, perUnit: '1 porsiyon' },
  'kuymak': { calories: 340, sugar: 2, perUnit: '1 porsiyon' },
  'lahana sarması': { calories: 180, sugar: 4, perUnit: '1 porsiyon' },
  'karalahana sarması': { calories: 190, sugar: 4, perUnit: '1 porsiyon' },
  
  // Ege Mutfağı
  'zeytinyağlı enginar': { calories: 120, sugar: 5, perUnit: '1 porsiyon' },
  'zeytinyağlı taze fasulye': { calories: 110, sugar: 4, perUnit: '1 porsiyon' },
  'zeytinyağlı yaprak sarma': { calories: 140, sugar: 6, perUnit: '3 adet' },
  'kabak çiçeği dolması': { calories: 150, sugar: 5, perUnit: '4 adet' },
  'kabak mücveri': { calories: 180, sugar: 3, perUnit: '3 adet' },
  'patlıcan kızartması': { calories: 220, sugar: 4, perUnit: '1 porsiyon' },
  'kabak kızartması': { calories: 180, sugar: 3, perUnit: '1 porsiyon' },
  
  // Güneydoğu Mutfağı
  'çiğ köfte': { calories: 240, sugar: 1, perUnit: '1 porsiyon' },
  'içli köfte': { calories: 310, sugar: 2, perUnit: '3 adet' },
  'analı kızlı': { calories: 360, sugar: 3, perUnit: '1 porsiyon' },
  'tepsi kebabı': { calories: 420, sugar: 3, perUnit: '1 porsiyon' },
  'Ali Paşa kebabı': { calories: 390, sugar: 2, perUnit: '1 porsiyon' },
  'patlıcan kebap': { calories: 370, sugar: 6, perUnit: '1 porsiyon' },
  'yuvalama': { calories: 280, sugar: 2, perUnit: '1 porsiyon' },
  'siveydiz': { calories: 200, sugar: 3, perUnit: '1 porsiyon' },
  'mumbar': { calories: 320, sugar: 2, perUnit: '1 porsiyon' },
  
  // Sokak Lezzetleri
  'kumru': { calories: 420, sugar: 4, perUnit: '1 adet' },
  'ıslak hamburger': { calories: 380, sugar: 6, perUnit: '1 adet' },
  'kokoreç ekmek arası': { calories: 480, sugar: 3, perUnit: '1 porsiyon' },
  'midye dolma': { calories: 30, sugar: 2, perUnit: '1 adet' },
  'midye tava': { calories: 180, sugar: 1, perUnit: '1 porsiyon' },
  'balık ekmek': { calories: 350, sugar: 3, perUnit: '1 adet' },
  'kumpir': { calories: 480, sugar: 5, perUnit: '1 porsiyon' },
  'döner dürüm': { calories: 450, sugar: 4, perUnit: '1 adet' },
  'tantuni dürüm': { calories: 420, sugar: 3, perUnit: '1 adet' },
  'çiğ köfte dürüm': { calories: 320, sugar: 2, perUnit: '1 adet' },
  'hamburger': { calories: 540, sugar: 6, perUnit: '1 adet' },
  'tost': { calories: 280, sugar: 3, perUnit: '1 adet' },
  'karışık tost': { calories: 320, sugar: 3, perUnit: '1 adet' },
  'ayvalık tostu': { calories: 380, sugar: 4, perUnit: '1 adet' },
  
  // Hamur İşleri & Börekler
  'su böreği': { calories: 230, sugar: 2, perUnit: '1 dilim' },
  'kol böreği': { calories: 270, sugar: 3, perUnit: '1 dilim' },
  'peynirli gözleme': { calories: 300, sugar: 2, perUnit: '1 adet' },
  'kıymalı gözleme': { calories: 350, sugar: 2, perUnit: '1 adet' },
  'patatesli gözleme': { calories: 320, sugar: 3, perUnit: '1 adet' },
  'ıspanaklı börek': { calories: 240, sugar: 2, perUnit: '1 dilim' },
  'kıymalı börek': { calories: 280, sugar: 2, perUnit: '1 dilim' },
  'peynirli börek': { calories: 250, sugar: 2, perUnit: '1 dilim' },
  'patatesli börek': { calories: 260, sugar: 3, perUnit: '1 dilim' },
  'paçanga böreği': { calories: 310, sugar: 3, perUnit: '1 dilim' },
  'tahinli pide': { calories: 380, sugar: 12, perUnit: '1 dilim' },
  'kaşarlı pide': { calories: 360, sugar: 3, perUnit: '1 dilim' },
  'kıymalı pide': { calories: 400, sugar: 3, perUnit: '1 dilim' },
  'karışık pide': { calories: 420, sugar: 4, perUnit: '1 dilim' },
  'kuşbaşılı pide': { calories: 410, sugar: 3, perUnit: '1 dilim' },
  'kapalı pide': { calories: 450, sugar: 4, perUnit: '1 adet' },
  
  // Mantı Çeşitleri
  'mantı': { calories: 380, sugar: 4, perUnit: '1 porsiyon' },
  'kayseri mantısı': { calories: 380, sugar: 4, perUnit: '1 porsiyon' },
  'yoğurtlu mantı': { calories: 420, sugar: 5, perUnit: '1 porsiyon' },
  'su böreği': { calories: 230, sugar: 2, perUnit: '1 dilim' },
  'hingel': { calories: 360, sugar: 3, perUnit: '1 porsiyon' },
  
  // Et Yemekleri
  'tavuk': { calories: 165, sugar: 0, perUnit: '100g' },
  'tavuk göğsü': { calories: 165, sugar: 0, perUnit: '100g' },
  'tavuk but': { calories: 209, sugar: 0, perUnit: '100g' },
  'fırında tavuk': { calories: 190, sugar: 0.5, perUnit: '1 porsiyon' },
  'tavuk şiş': { calories: 200, sugar: 1, perUnit: '1 porsiyon' },
  'tavuk döner': { calories: 250, sugar: 2, perUnit: '1 porsiyon' },
  'et': { calories: 250, sugar: 0, perUnit: '100g' },
  'dana eti': { calories: 250, sugar: 0, perUnit: '100g' },
  'kuzu eti': { calories: 294, sugar: 0, perUnit: '100g' },
  'kıyma': { calories: 220, sugar: 0, perUnit: '100g' },
  'köfte': { calories: 280, sugar: 1, perUnit: '1 porsiyon' },
  'içli köfte': { calories: 310, sugar: 2, perUnit: '3 adet' },
  'çiğ köfte': { calories: 240, sugar: 1, perUnit: '1 porsiyon' },
  'kebap': { calories: 350, sugar: 2, perUnit: '1 porsiyon' },
  'adana kebap': { calories: 380, sugar: 1, perUnit: '1 porsiyon' },
  'urfa kebap': { calories: 370, sugar: 1, perUnit: '1 porsiyon' },
  'şiş kebap': { calories: 340, sugar: 2, perUnit: '1 porsiyon' },
  'döner': { calories: 400, sugar: 3, perUnit: '1 porsiyon' },
  'et döner': { calories: 420, sugar: 2, perUnit: '1 porsiyon' },
  'iskender': { calories: 550, sugar: 5, perUnit: '1 porsiyon' },
  'tantuni': { calories: 380, sugar: 3, perUnit: '1 porsiyon' },
  'kokoreç': { calories: 450, sugar: 2, perUnit: '1 porsiyon' },
  
  // Balık
  'balık': { calories: 180, sugar: 0, perUnit: '100g' },
  'levrek': { calories: 175, sugar: 0, perUnit: '100g' },
  'çipura': { calories: 170, sugar: 0, perUnit: '100g' },
  'hamsi': { calories: 188, sugar: 0, perUnit: '100g' },
  'palamut': { calories: 158, sugar: 0, perUnit: '100g' },
  'ton balığı': { calories: 184, sugar: 0, perUnit: '100g' },
  
  // Sebze Yemekleri
  'makarna': { calories: 220, sugar: 2, perUnit: '1 porsiyon' },
  'patates': { calories: 130, sugar: 1, perUnit: '1 orta boy' },
  'patates kızartması': { calories: 312, sugar: 0.5, perUnit: '1 porsiyon' },
  'patates püresi': { calories: 180, sugar: 3, perUnit: '1 porsiyon' },
  'fırın patates': { calories: 160, sugar: 1, perUnit: '1 porsiyon' },
  'patlıcan': { calories: 25, sugar: 3, perUnit: '1 orta boy' },
  'karnıyarık': { calories: 350, sugar: 8, perUnit: '1 porsiyon' },
  'imam bayıldı': { calories: 280, sugar: 10, perUnit: '1 porsiyon' },
  'patlıcan musakka': { calories: 320, sugar: 6, perUnit: '1 porsiyon' },
  'şakşuka': { calories: 140, sugar: 6, perUnit: '1 porsiyon' },
  'biber': { calories: 20, sugar: 4, perUnit: '1 adet' },
  'biber dolması': { calories: 160, sugar: 5, perUnit: '3 adet' },
  'domates': { calories: 22, sugar: 3.5, perUnit: '1 orta boy' },
  'salata': { calories: 50, sugar: 4, perUnit: '1 kase' },
  'çoban salatası': { calories: 70, sugar: 5, perUnit: '1 kase' },
  'mevsim salatası': { calories: 60, sugar: 4, perUnit: '1 kase' },
  'çingene salatası': { calories: 90, sugar: 6, perUnit: '1 kase' },
  'atom salatası': { calories: 110, sugar: 7, perUnit: '1 kase' },
  'piyaz': { calories: 180, sugar: 5, perUnit: '1 porsiyon' },
  'gavurdağı salatası': { calories: 100, sugar: 5, perUnit: '1 kase' },
  'dolma': { calories: 180, sugar: 5, perUnit: '1 porsiyon' },
  'sarma': { calories: 160, sugar: 4, perUnit: '1 porsiyon' },
  'zeytinyağlı dolma': { calories: 140, sugar: 6, perUnit: '3 adet' },
  'türlü': { calories: 120, sugar: 8, perUnit: '1 porsiyon' },
  'fasulye': { calories: 200, sugar: 3, perUnit: '1 porsiyon' },
  'kuru fasulye': { calories: 200, sugar: 3, perUnit: '1 porsiyon' },
  'barbunya': { calories: 180, sugar: 4, perUnit: '1 porsiyon' },
  'nohut': { calories: 210, sugar: 6, perUnit: '1 porsiyon' },
  'nohut yemeği': { calories: 210, sugar: 6, perUnit: '1 porsiyon' },
  'mercimek': { calories: 170, sugar: 2, perUnit: '1 porsiyon' },
  'mercimek yemeği': { calories: 170, sugar: 2, perUnit: '1 porsiyon' },
  'ispanak': { calories: 90, sugar: 2, perUnit: '1 porsiyon' },
  'ispanak yemeği': { calories: 90, sugar: 2, perUnit: '1 porsiyon' },
  'pırasa': { calories: 110, sugar: 3, perUnit: '1 porsiyon' },
  'pırasa yemeği': { calories: 110, sugar: 3, perUnit: '1 porsiyon' },
  'kabak': { calories: 80, sugar: 4, perUnit: '1 porsiyon' },
  'kabak yemeği': { calories: 80, sugar: 4, perUnit: '1 porsiyon' },
  'bamya': { calories: 140, sugar: 5, perUnit: '1 porsiyon' },
  'bamya yemeği': { calories: 140, sugar: 5, perUnit: '1 porsiyon' },
  'karnabahar': { calories: 100, sugar: 3, perUnit: '1 porsiyon' },
  'karnabahar yemeği': { calories: 100, sugar: 3, perUnit: '1 porsiyon' },
  'ıspanak kavurma': { calories: 120, sugar: 2, perUnit: '1 porsiyon' },
  'etli kuru fasulye': { calories: 280, sugar: 4, perUnit: '1 porsiyon' },
  'etli nohut': { calories: 290, sugar: 7, perUnit: '1 porsiyon' },
  
  // Çorbalar
  'çorba': { calories: 120, sugar: 2, perUnit: '1 kase' },
  'mercimek çorbası': { calories: 130, sugar: 2, perUnit: '1 kase' },
  'ezogelin çorbası': { calories: 140, sugar: 3, perUnit: '1 kase' },
  'yayla çorbası': { calories: 110, sugar: 1, perUnit: '1 kase' },
  'tarhana çorbası': { calories: 100, sugar: 4, perUnit: '1 kase' },
  'tavuk çorbası': { calories: 90, sugar: 1, perUnit: '1 kase' },
  'işkembe çorbası': { calories: 150, sugar: 1, perUnit: '1 kase' },
  'düğün çorbası': { calories: 160, sugar: 2, perUnit: '1 kase' },
  'kellepaça çorbası': { calories: 180, sugar: 1, perUnit: '1 kase' },
  'domates çorbası': { calories: 110, sugar: 5, perUnit: '1 kase' },
  'sebze çorbası': { calories: 80, sugar: 3, perUnit: '1 kase' },
  'et suyu çorbası': { calories: 70, sugar: 1, perUnit: '1 kase' },
  'tutmaç': { calories: 140, sugar: 3, perUnit: '1 kase' },
  'şehriye çorbası': { calories: 100, sugar: 2, perUnit: '1 kase' },
  'toyga çorbası': { calories: 90, sugar: 1, perUnit: '1 kase' },
  'yüksük çorbası': { calories: 120, sugar: 2, perUnit: '1 kase' },
  'paça çorbası': { calories: 180, sugar: 1, perUnit: '1 kase' },
  
  // Meyveler
  'meyve': { calories: 60, sugar: 12, perUnit: '1 orta boy' },
  'elma': { calories: 52, sugar: 10, perUnit: '1 orta boy' },
  'armut': { calories: 57, sugar: 10, perUnit: '1 orta boy' },
  'muz': { calories: 105, sugar: 14, perUnit: '1 orta boy' },
  'portakal': { calories: 62, sugar: 12, perUnit: '1 orta boy' },
  'mandalina': { calories: 53, sugar: 10.5, perUnit: '1 orta boy' },
  'üzüm': { calories: 69, sugar: 16, perUnit: '100g' },
  'karpuz': { calories: 46, sugar: 9, perUnit: '1 dilim' },
  'kavun': { calories: 54, sugar: 13, perUnit: '1 dilim' },
  'çilek': { calories: 32, sugar: 4.9, perUnit: '100g' },
  'kiraz': { calories: 63, sugar: 13, perUnit: '100g' },
  'şeftali': { calories: 39, sugar: 8.4, perUnit: '1 orta boy' },
  'kayısı': { calories: 48, sugar: 9, perUnit: '100g' },
  
  // Kuruyemişler & Atıştırmalıklar
  'cips': { calories: 150, sugar: 0.5, perUnit: '30g paket' },
  'kraker': { calories: 120, sugar: 2, perUnit: '6 adet' },
  'fındık': { calories: 180, sugar: 1.5, perUnit: '30g' },
  'fıstık': { calories: 170, sugar: 1, perUnit: '30g' },
  'ceviz': { calories: 196, sugar: 0.8, perUnit: '30g' },
  'badem': { calories: 174, sugar: 1.2, perUnit: '30g' },
  'leblebi': { calories: 140, sugar: 2, perUnit: '30g' },
  'ayçekirdek çekirdeği': { calories: 165, sugar: 0.8, perUnit: '30g' },
  'kabak çekirdeği': { calories: 158, sugar: 0.4, perUnit: '30g' },
  
  // Tatlılar
  'baklava': { calories: 330, sugar: 25, perUnit: '1 dilim' },
  'fıstıklı baklava': { calories: 350, sugar: 26, perUnit: '1 dilim' },
  'cevizli baklava': { calories: 340, sugar: 25, perUnit: '1 dilim' },
  'sütlaç': { calories: 180, sugar: 18, perUnit: '1 kase' },
  'kadayıf': { calories: 310, sugar: 24, perUnit: '1 dilim' },
  'künefe': { calories: 400, sugar: 30, perUnit: '1 porsiyon' },
  'revani': { calories: 280, sugar: 22, perUnit: '1 dilim' },
  'şambali': { calories: 290, sugar: 23, perUnit: '1 dilim' },
  'tulumba': { calories: 250, sugar: 20, perUnit: '3 adet' },
  'lokum': { calories: 100, sugar: 20, perUnit: '3 adet' },
  'helva': { calories: 300, sugar: 22, perUnit: '1 dilim' },
  'un helvası': { calories: 280, sugar: 20, perUnit: '1 porsiyon' },
  'irmik helvası': { calories: 290, sugar: 21, perUnit: '1 porsiyon' },
  'tahin helvası': { calories: 320, sugar: 24, perUnit: '1 dilim' },
  'aşure': { calories: 220, sugar: 28, perUnit: '1 kase' },
  'güllaç': { calories: 180, sugar: 20, perUnit: '1 porsiyon' },
  'keşkül': { calories: 210, sugar: 24, perUnit: '1 kase' },
  'kazandibi': { calories: 240, sugar: 22, perUnit: '1 dilim' },
  'tavuk göğsü': { calories: 230, sugar: 21, perUnit: '1 dilim' },
  'fırın sütlaç': { calories: 200, sugar: 19, perUnit: '1 kase' },
  'kabak tatlısı': { calories: 180, sugar: 28, perUnit: '1 porsiyon' },
  'ayva tatlısı': { calories: 170, sugar: 26, perUnit: '1 porsiyon' },
  'irmik tatlısı': { calories: 260, sugar: 22, perUnit: '1 dilim' },
  'şekerpare': { calories: 220, sugar: 18, perUnit: '2 adet' },
  'kalburabastı': { calories: 230, sugar: 19, perUnit: '2 adet' },
  'bülbül yuvası': { calories: 300, sugar: 24, perUnit: '2 adet' },
  'dilber dudağı': { calories: 250, sugar: 20, perUnit: '2 adet' },
  'tel kadayıf': { calories: 320, sugar: 25, perUnit: '1 dilim' },
  'burma kadayıf': { calories: 310, sugar: 24, perUnit: '1 dilim' },
  'sütlü nuriye': { calories: 290, sugar: 23, perUnit: '1 dilim' },
  'vezir parmağı': { calories: 280, sugar: 22, perUnit: '2 adet' },
  'hanım göbeği': { calories: 260, sugar: 21, perUnit: '2 adet' },
  'pişmaniye': { calories: 150, sugar: 18, perUnit: '30g' },
  'akide şekeri': { calories: 110, sugar: 27, perUnit: '30g' },
  'cezerye': { calories: 140, sugar: 20, perUnit: '2 dilim' },
  'dondurma': { calories: 140, sugar: 16, perUnit: '1 top' },
  'maraş dondurması': { calories: 160, sugar: 18, perUnit: '1 top' },
  'profiterol': { calories: 320, sugar: 26, perUnit: '1 porsiyon' },
  'magnolia': { calories: 280, sugar: 24, perUnit: '1 kase' },
  'sufle': { calories: 300, sugar: 22, perUnit: '1 porsiyon' },
  'tiramisu': { calories: 340, sugar: 20, perUnit: '1 dilim' },
  'trileçe': { calories: 310, sugar: 25, perUnit: '1 dilim' },
  
  // Pastane & Fırın Ürünleri
  'çikolata': { calories: 150, sugar: 17, perUnit: '30g' },
  'kurabiye': { calories: 120, sugar: 10, perUnit: '3 adet' },
  'pasta': { calories: 350, sugar: 28, perUnit: '1 dilim' },
  'kek': { calories: 280, sugar: 20, perUnit: '1 dilim' },
  'brownie': { calories: 310, sugar: 24, perUnit: '1 dilim' },
  'muffin': { calories: 260, sugar: 18, perUnit: '1 adet' },
  'donut': { calories: 290, sugar: 22, perUnit: '1 adet' },
  'kroasan': { calories: 240, sugar: 5, perUnit: '1 adet' },
  
  // İçecekler
  'çay': { calories: 2, sugar: 0, perUnit: '1 bardak' },
  'şekerli çay': { calories: 22, sugar: 5, perUnit: '1 bardak' },
  'kahve': { calories: 5, sugar: 0, perUnit: '1 fincan' },
  'türk kahvesi': { calories: 7, sugar: 0, perUnit: '1 fincan' },
  'latte': { calories: 120, sugar: 9, perUnit: '1 bardak' },
  'cappuccino': { calories: 80, sugar: 6, perUnit: '1 bardak' },
  'ayran': { calories: 40, sugar: 4, perUnit: '1 bardak' },
  'şalgam suyu': { calories: 15, sugar: 3, perUnit: '1 bardak' },
  'meyve suyu': { calories: 110, sugar: 24, perUnit: '200ml' },
  'portakal suyu': { calories: 112, sugar: 21, perUnit: '200ml' },
  'vişne suyu': { calories: 120, sugar: 26, perUnit: '200ml' },
  'kola': { calories: 140, sugar: 39, perUnit: '330ml' },
  'gazoz': { calories: 130, sugar: 35, perUnit: '330ml' },
  'fanta': { calories: 138, sugar: 37, perUnit: '330ml' },
  'sprite': { calories: 135, sugar: 36, perUnit: '330ml' },
  'ice tea': { calories: 80, sugar: 20, perUnit: '330ml' },
  'süt': { calories: 60, sugar: 5, perUnit: '200ml' },
  'tam yağlı süt': { calories: 122, sugar: 10, perUnit: '200ml' },
  'yoğurt': { calories: 61, sugar: 5, perUnit: '100g' },
  'kefir': { calories: 52, sugar: 5, perUnit: '100ml' },
};

// Kelime benzerliği hesaplama (Levenshtein distance)
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const costs = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  
  return (longer.length - costs[shorter.length]) / longer.length;
}

// Tabak sayısını metinden çıkar (2 tabak, yarım tabak, 1.5 tabak vb.)
function extractPlateCount(text) {
  const lowerText = text.toLowerCase();
  
  // Sayısal ifadeler (2 tabak, 1.5 tabak, 0.5 tabak)
  const numMatch = lowerText.match(/(\d+\.?\d*)\s*(tabak|porsiyon)/);
  if (numMatch) {
    return { count: parseFloat(numMatch[1]), cleanText: text.replace(numMatch[0], '').trim() };
  }
  
  // Yarım, çeyrek gibi ifadeler
  if (lowerText.includes('yarım') || lowerText.includes('yarim')) {
    return { count: 0.5, cleanText: text.replace(/yarım|yarim/gi, '').trim() };
  }
  if (lowerText.includes('çeyrek')) {
    return { count: 0.25, cleanText: text.replace(/çeyrek/gi, '').trim() };
  }
  if (lowerText.includes('bir buçuk')) {
    return { count: 1.5, cleanText: text.replace(/bir buçuk/gi, '').trim() };
  }
  
  // Varsayılan 1 tabak
  return { count: 1, cleanText: text };
}

// Yemek adından kalori ve şeker tahmini
export function estimateFoodNutrition(foodName) {
  if (!foodName || foodName.trim().length === 0) {
    return { calories: '', sugar: '', plateCount: '', confidence: 0, source: 'none' };
  }
  
  // Tabak sayısını çıkar
  const { count: plateCount, cleanText } = extractPlateCount(foodName);

  const searchText = cleanText.toLowerCase().trim();
  
  // Tam eşleşme ara
  if (FOOD_DATABASE[searchText]) {
    const food = FOOD_DATABASE[searchText];
    return {
      calories: Math.round(food.calories * plateCount),
      sugar: Math.round(food.sugar * plateCount * 10) / 10,
      plateCount: plateCount,
      confidence: 100,
      source: 'exact',
      message: `✅ ${searchText} tespit edildi`
    };
  }

  // Karışık yemek analizi (tavuklu pilav, patatesli köfte vb.)
  const words = searchText.split(/[\s,]+/).filter(w => w.length > 2);
  const foundIngredients = [];
  
  for (const word of words) {
    // Eklerden arındır (lu, lı, li, lü)
    const cleanWord = word.replace(/l[ıiuü]$/, '').replace(/s[ıiuü]z$/, '');
    
    // Kelimenin kendisini veya temizlenmiş halini ara
    if (FOOD_DATABASE[word]) {
      foundIngredients.push({ name: word, data: FOOD_DATABASE[word] });
    } else if (FOOD_DATABASE[cleanWord]) {
      foundIngredients.push({ name: cleanWord, data: FOOD_DATABASE[cleanWord] });
    } else {
      // Kısmi eşleşme ara
      for (const [key, value] of Object.entries(FOOD_DATABASE)) {
        if (key.includes(cleanWord) || cleanWord.includes(key)) {
          const score = similarity(cleanWord, key);
          if (score > 0.7) {
            foundIngredients.push({ name: key, data: value, score });
            break;
          }
        }
      }
    }
  }

  // Birden fazla malzeme bulundu mu?
  if (foundIngredients.length > 1) {
    const totalCalories = foundIngredients.reduce((sum, ing) => sum + ing.data.calories, 0);
    const totalSugar = foundIngredients.reduce((sum, ing) => sum + ing.data.sugar, 0);
    const ingredientNames = foundIngredients.map(ing => ing.name).join(' + ');
    
    return {
      calories: Math.round(totalCalories * plateCount),
      sugar: Math.round(totalSugar * plateCount * 10) / 10,
      plateCount: plateCount,
      confidence: 90,
      source: 'combined',
      message: `✅ ${ingredientNames} tespit edildi`
    };
  }

  // Tek malzeme bulundu mu?
  if (foundIngredients.length === 1) {
    return {
      calories: Math.round(foundIngredients[0].data.calories * plateCount),
      sugar: Math.round(foundIngredients[0].data.sugar * plateCount * 10) / 10,
      plateCount: plateCount,
      confidence: 85,
      source: 'partial',
      message: `🔍 ${foundIngredients[0].name} tespit edildi`
    };
  }

  // Kısmi eşleşme ara (eski sistem)
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, value] of Object.entries(FOOD_DATABASE)) {
    if (searchText.includes(key) || key.includes(searchText)) {
      const score = similarity(searchText, key);
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestMatch = { key, value };
      }
    }
  }

  if (bestMatch) {
    return {
      calories: Math.round(bestMatch.value.calories * plateCount),
      sugar: Math.round(bestMatch.value.sugar * plateCount * 10) / 10,
      plateCount: plateCount,
      confidence: Math.round(bestScore * 100),
      source: 'partial',
      message: `🔍 ${bestMatch.key} ile eşleşti`
    };
  }

  // Hiç eşleşme yoksa genel tahmin
  return {
    calories: Math.round(300 * plateCount),
    sugar: Math.round(5 * plateCount * 10) / 10,
    plateCount: plateCount,
    confidence: 30,
    source: 'default',
    message: '⚠️ Genel tahmin - manuel düzenleyin'
  };
}

// Yemek adını analiz et ve önerilerde bulun
export function analyzeFoodInput(foodName) {
  const estimate = estimateFoodNutrition(foodName);
  
  return {
    ...estimate,
    suggestions: Object.keys(FOOD_DATABASE)
      .filter(key => key.includes(foodName.toLowerCase().trim()))
      .slice(0, 3)
  };
}
