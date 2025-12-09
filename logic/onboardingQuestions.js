export const QUESTION_CATEGORIES = {
  TIP1: 'tip1',
  TIP2: 'tip2',
  DIABETES_INSP: 'diabetes_insipidus',
  WEIGHT_LOSS: 'weight_loss',
  WEIGHT_GAIN: 'weight_gain',
  WEIGHT_MAINTAIN: 'weight_maintain',
};

export const tip1Questions = [
  { id: 't1_q1', text: 'Gün içinde normalden daha fazla idrara çıkma sorununuz var mı?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q2', text: 'Gece uykudan uyanıp sık sık tuvalete gitme ihtiyacı hissediyor musunuz?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q3', text: 'Son günlerde sürekli aşırı susama hissediyor musunuz?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q4', text: 'Çok su içmenize rağmen susuzluk hissiniz geçmiyor mu?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q5', text: 'Sürekli açlık, özellikle yemek yedikten kısa süre sonra tekrar acıkma yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q6', text: 'Son haftalarda hızlı ve açıklanamayan kilo kaybı fark ettiniz mi?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q7', text: 'Gün içinde yorgunluk, halsizlik veya enerji düşüklüğü hissediyor musunuz?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q8', text: 'Görüşünüzde bulanıklık veya ani değişiklikler oluyor mu?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q9', text: 'Ağız kuruluğu veya cilt kuruluğu sık sık oluyor mu?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q10', text: 'Son zamanlarda mide bulantısı, karın ağrısı veya kusma yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q11', text: 'Nefesinizde aseton/meyvemsi koku fark ettiniz mi?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q12', text: 'Nefes alış verişiniz normalden daha hızlı veya derin hale geldi mi?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q13', text: 'Kendinizi son günlerde bilinç bulanıklığı veya kafa karışıklığı içinde hissettiniz mi?', category: QUESTION_CATEGORIES.TIP1 },
  { id: 't1_q14', text: 'Günlük aktiviteleri yaparken bile çabuk yorulma yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP1 },
];

export const tip2Questions = [
  { id: 't2_q1', text: 'Gün içinde normalden daha fazla idrara çıkma sorunu yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q2', text: 'Son zamanlarda sürekli aşırı susama hissediyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q3', text: 'Çok su içmenize rağmen ağzınız sürekli kuru mu kalıyor?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q4', text: 'Aç olmamanıza rağmen sık sık acıkma hissi yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q5', text: 'Son haftalarda veya aylarda isteğiniz dışında kilo kaybı oldu mu?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q6', text: 'Tam tersi, son zamanlarda kilo artışı veya göbek çevresinde yağlanma fark ettiniz mi?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q7', text: 'Yemeklerden sonra aşırı uyku hâli veya enerji düşüşü yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q8', text: 'Gün içinde sık sık yorgunluk veya halsizlik hissediyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q9', text: 'Görüşünüzde bulanıklık, odaklanma zorluğu veya zaman zaman görme değişiklikleri oluyor mu?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q10', text: 'Yaralarınız veya kesikleriniz normalden daha geç mi iyileşiyor?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q11', text: 'Sık sık mantar enfeksiyonu, idrar yolu enfeksiyonu veya cilt enfeksiyonu yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q12', text: 'Ellerde veya ayaklarda uyuşma, karıncalanma veya yanma hissi oluyor mu?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q13', text: 'Aile bireylerinde Tip 2 diyabet varsa, sizde de benzer belirtiler görüyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q14', text: 'Son zamanlarda açıklaması zor konsantrasyon bozukluğu veya zihinsel bulanıklık yaşıyor musunuz?', category: QUESTION_CATEGORIES.TIP2 },
  { id: 't2_q15', text: 'Yemeklerden sonra kan şekerinizin ani yükselip sonra düşüyormuş gibi hissettirdiği anlar oluyor mu?', category: QUESTION_CATEGORIES.TIP2 },
];

export const diabetesInsipidusQuestions = [
  { id: 'di_q1', text: 'Gün içinde aşırı miktarda idrara çıkma problemi yaşıyor musunuz?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q2', text: 'Geceleri sık sık tuvalete gitme ihtiyacı oluyor mu?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q3', text: 'İdrarınızın çok açık renkli (neredeyse su gibi) olduğunu fark ettiniz mi?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q4', text: 'Aşırı susama hissi yaşıyor musunuz, özellikle de su içmeyi bıraktığınız anda tekrar susuyor musunuz?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q5', text: 'Gün boyunca litrelerce su içme ihtiyacı hissediyor musunuz?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q6', text: 'Çok su içmenize rağmen yine de susuzluk hissiniz geçmiyor mu?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q7', text: 'Susuz kaldığınızda baş dönmesi, halsizlik veya yorgunluk yaşıyor musunuz?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q8', text: 'Uzun süre su içemediğinizde kendinizi çok hızlı kötüleşmiş hissediyor musunuz?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q9', text: 'Cildinizde veya dudaklarınızda belirgin kuruluk oluyor mu?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q10', text: 'Gün içerisinde idrara çıkma miktarınızın çok yüksek olduğunu düşünüyor musunuz (örneğin 3–4 litre ve üzeri)?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q11', text: 'Uzun yolculuklar, toplantılar gibi tuvaletin zor bulunduğu ortamlarda ciddi zorlanma yaşıyor musunuz?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q12', text: 'Çocuklarda: gece alt ıslatma, büyük çocuklarda bile yeniden ortaya çıkıyor mu?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q13', text: 'Son dönemlerde baş ağrısı, odaklanma zorluğu veya halsizlik gibi belirtiler yaşadınız mı?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q14', text: 'Su içme ihtiyacınız arttığında bununla birlikte sinirlilik veya huzursuzluk hissediyor musunuz?', category: QUESTION_CATEGORIES.DIABETES_INSP },
  { id: 'di_q15', text: 'Yakın dönemde kafa travması, beyin ameliyatı veya bazı ilaçlar sonrasında idrara çıkışta belirgin değişiklik oldu mu?', category: QUESTION_CATEGORIES.DIABETES_INSP },
];

export const weightLossQuestions = [
  { id: 'wl_q1', text: 'Son zamanlarda kilonuzdan memnun olmadığınızı düşünüyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q2', text: 'Günlük beslenmenizde yüksek kalori / yüksek şeker tükettiğinizi hissediyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q3', text: 'Öğün atlama veya ani açlık krizleri yaşıyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q4', text: 'Gün içinde hareketsiz kaldığınız zamanlar fazla oluyor mu?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q5', text: 'Kilo verirken düzenli takip ve yönlendirmeye ihtiyaç duyuyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q6', text: 'Daha önce kilo vermeye çalıştığınız halde istediğiniz sonucu alamadınız mı?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q7', text: 'Hedefiniz sağlıklı bir şekilde yağ oranını azaltmak mı?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q8', text: 'Su tüketiminizin yeterli olmadığını düşünüyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q9', text: 'Öğün boyutlarını kontrol etmekte zorlanıyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
  { id: 'wl_q10', text: 'Kilo verirken motivasyon kaybı yaşamamak için takip sistemi ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_LOSS },
];

export const weightMaintainQuestions = [
  { id: 'wm_q1', text: 'Şu anki kilonuzdan ve görünümünüzden genel olarak memnunsunuz?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q2', text: 'Mevcut formunuzu korumak için düzenli beslenme takibi yapmak ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q3', text: 'Günlük aktivitelerinizi ve egzersizlerinizi takip etmek sizi motive eder mi?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q4', text: 'Öğün düzeniniz genellikle dengeli midir?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q5', text: 'Zaman zaman fazla yeme veya atıştırma kontrolünde zorlanıyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q6', text: 'Su tüketim alışkanlığınızı iyileştirmek ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q7', text: 'Haftalık form takibi (kilo, yağ oranı, bel–kalça ölçümleri) yapmak ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q8', text: 'Sağlıklı tarif önerileri almak sizi destekler mi?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q9', text: 'Formunuzu korumak için düzenli hatırlatmalar faydalı olur mu?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
  { id: 'wm_q10', text: 'Enerji seviyenizin gün içinde stabil kalmasını ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_MAINTAIN },
];

export const weightGainQuestions = [
  { id: 'wg_q1', text: 'Şu anki kilonuzun ideal kilonuzun altında olduğunu düşünüyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q2', text: 'Gün içinde yeterince kalori tüketmekte zorlanıyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q3', text: 'İştahta azalma veya düzensizlik sık yaşar mısınız?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q4', text: 'Kilo alırken kas kütlesi kazanmak ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q5', text: 'Öğünlerinizi düzenli şekilde tüketmekte zorlanıyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q6', text: 'Fiziksel yapınızın zayıf olması günlük aktivitelerde enerji düşüklüğüne yol açıyor mu?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q7', text: 'Kilo almak için düzenli yönlendirme ve takip ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q8', text: 'Ara öğün yapma alışkanlığınız zayıf mı?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q9', text: 'Su tüketiminizin düşük olduğunu düşünüyor musunuz?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
  { id: 'wg_q10', text: 'Kilo alırken sağlıklı bir şekilde ilerlemek için kişiye özel öneriler ister misiniz?', category: QUESTION_CATEGORIES.WEIGHT_GAIN },
];

export function buildActiveQuestions(goals) {
  if (!Array.isArray(goals) || goals.length === 0) return [];

  const result = [];

  const addAll = (source) => {
    for (const q of source) {
      result.push(q);
    }
  };

  for (const goal of goals) {
    switch (goal) {
      case 'Tip 1 şeker hastalığı takibi':
        addAll(tip1Questions);
        break;
      case 'Tip 2 şeker hastalığı takibi':
        addAll(tip2Questions);
        break;
      case 'Şekersiz şeker hastalığı takibi':
      case 'Şekersiz şeker hastalığı takibi (Diabetes Insipidus)':
        addAll(diabetesInsipidusQuestions);
        break;
      case 'Kilo verme':
        addAll(weightLossQuestions);
        break;
      case 'Kilo alma':
        addAll(weightGainQuestions);
        break;
      case 'Formu koruma':
        addAll(weightMaintainQuestions);
        break;
      default:
        break;
    }
  }

  return result;
}
