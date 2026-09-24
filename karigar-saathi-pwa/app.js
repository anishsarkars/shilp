(() => {
  'use strict';
  const svgProduct = (emoji, background, accent) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450"><rect width="600" height="450" fill="${background}"/><circle cx="505" cy="70" r="115" fill="${accent}" opacity=".18"/><circle cx="70" cy="390" r="135" fill="${accent}" opacity=".12"/><text x="300" y="275" text-anchor="middle" font-size="180">${emoji}</text><path d="M100 355 Q300 290 500 355" fill="none" stroke="${accent}" stroke-width="8" opacity=".28"/></svg>`)}`;
  const seedProducts = [
    {id: 1, name: 'मधुबनी मछली पेंटिंग', category: 'पेंटिंग', price: 1299, stock: 8, status: 'live', views: 142, image: svgProduct('🖼️','#f7e7d7','#c7634d'), description: 'हाथ से बनी पारंपरिक मधुबनी पेंटिंग, प्राकृतिक रंगों के साथ।'},
    {id: 2, name: 'बांस की सजावटी टोकरी', category: 'घर सजावट', price: 849, stock: 3, status: 'live', views: 98, image: svgProduct('🧺','#efe5ca','#a4762c'), description: 'स्थानीय बांस से बुनी हुई मजबूत और सुंदर टोकरी।'},
    {id: 3, name: 'हाथ बुना सूती दुपट्टा', category: 'वस्त्र', price: 1099, stock: 14, status: 'live', views: 76, image: svgProduct('🧣','#e7d8e9','#8d4e91'), description: 'नरम सूती धागे से हाथ करघे पर बुना दुपट्टा।'},
    {id: 4, name: 'टेराकोटा दीया सेट', category: 'हस्तकला', price: 399, stock: 20, status: 'draft', views: 35, image: svgProduct('🪔','#f2dfcf','#bd6d39'), description: 'कारीगरों द्वारा हाथ से आकार और रंग दिया गया दीया सेट।'}
  ];
  const seedOrders = [
    {id: 'KS-1048', customer: 'अंजलि शर्मा', city: 'जयपुर, राजस्थान', item: 'मधुबनी मछली पेंटिंग', amount: 1299, status: 'new', icon: '🖼️'},
    {id: 'KS-1047', customer: 'राहुल वर्मा', city: 'पुणे, महाराष्ट्र', item: 'बांस की सजावटी टोकरी · 2', amount: 1698, status: 'new', icon: '🧺'},
    {id: 'KS-1046', customer: 'स्मिता नायर', city: 'कोच्चि, केरल', item: 'हाथ बुना सूती दुपट्टा', amount: 1099, status: 'packed', icon: '🧣'},
    {id: 'KS-1042', customer: 'नवीन सिंह', city: 'दिल्ली', item: 'टेराकोटा दीया सेट · 2', amount: 798, status: 'sent', icon: '🪔'}
  ];
  const state = {
    products: JSON.parse(localStorage.getItem('ks_products') || 'null') || seedProducts,
    orders: JSON.parse(localStorage.getItem('ks_orders') || 'null') || seedOrders,
    currentView: 'home', currentStep: 1, imageData: '', toastTimer: null, language: localStorage.getItem('ks_language') || 'hi', apiOnline: false
  };
  const englishText = {
    'कारीगर साथी':'Karigar Saathi','आपका AI व्यापार सहायक':'Your AI business assistant','मुख्य भाग पर जाएँ':'Skip to main content',
    'आप ऑफलाइन हैं — आपका काम सुरक्षित रहेगा':'You are offline — your work will stay safe','आज आपका व्यापार':'Your business today',
    'नमस्ते, मीरा जी 👋':'Hello, Meera ji 👋','आपकी दुकान अच्छी चल रही है। आज 3 नए ऑर्डर मिले हैं।':'Your shop is doing well. You received 3 new orders today.',
    'सक्रिय उत्पाद':'Active products','आज के ऑर्डर':'Today’s orders','इस महीने बिक्री':'Sales this month','● AI तैयार है':'● AI is ready',
    'क्या मदद चाहिए?':'How can I help?','बोलकर बताइए — “नया उत्पाद जोड़ो”':'Speak a command — “Add a new product”',
    'जल्दी शुरू करें':'Quick start','आप क्या करना चाहते हैं?':'What would you like to do?','नया उत्पाद':'New product','फोटो लेकर जोड़ें':'Add using a photo',
    'मेरी सूची':'My catalogue','उत्पाद देखें':'View products','ऑर्डर':'Orders','ऑर्डर संभालें':'Manage orders','सही कीमत':'Right price','AI सुझाव पाएँ':'Get an AI suggestion',
    'आपके उत्पाद':'Your products','अच्छा प्रदर्शन':'Top performers','सभी देखें →':'View all →','आज का सुझाव':'Today’s tip',
    '“हाथ से बना” शब्द वाले उत्पादों को इस सप्ताह 18% अधिक लोग देख रहे हैं।':'Products using the words “handmade” are getting 18% more views this week.',
    'डिजिटल दुकान':'Digital shop','मेरी उत्पाद सूची':'My product catalogue','अपने सभी उत्पाद एक जगह से संभालें':'Manage all your products in one place',
    '＋ जोड़ें':'＋ Add','☷ फ़िल्टर':'☷ Filter','सभी':'All','ऑनलाइन':'Live','ड्राफ्ट':'Draft','कम स्टॉक':'Low stock',
    'कोई उत्पाद नहीं मिला':'No products found','दूसरा नाम खोजकर देखें':'Try searching with another name','बिक्री प्रबंधन':'Sales management',
    'नए ऑर्डर तैयार करके भेजें':'Prepare and dispatch new orders','3 नए':'3 new','नए':'New','पैक':'Packed','भेजे गए':'Sent',
    'आसान जानकारी':'Simple insights','व्यापार की प्रगति':'Business progress','इस महीने का सरल हिसाब':'A simple view of this month',
    'सितंबर की बिक्री':'September sales','पिछले महीने से 12% अधिक':'12% higher than last month','सोम':'Mon','मंगल':'Tue','बुध':'Wed','गुरु':'Thu','शुक्र':'Fri','शनि':'Sat','आज':'Today',
    'उत्पाद देखे गए':'Product views','पसंद किए गए':'Favourites','AI की सलाह':'AI advice','बिक्री बढ़ाने के तरीके':'Ways to increase sales',
    '2 तस्वीरें और जोड़ें':'Add 2 more photos','नीली मधुबनी पेंटिंग पर अधिक तस्वीरों से बिक्री बढ़ सकती है।':'More photos could increase sales for the blue Madhubani painting.',
    'करें':'Do it','कीमत में छोटा बदलाव':'A small price change','बांस की टोकरी की सुझाई कीमत ₹899 है।':'The suggested price for the bamboo basket is ₹899.','देखें':'View',
    'मीरा देवी':'Meera Devi','मधुबनी कलाकार · बिहार':'Madhubani artist · Bihar','✓ पहचान सत्यापित':'✓ Identity verified',
    'दुकान की जानकारी':'Shop information','नाम, पता और कहानी':'Name, address and story','भाषा':'Language','बिक्री चैनल':'Sales channels',
    '2 चैनल जुड़े हैं':'2 channels connected','मदद और प्रशिक्षण':'Help and training','वीडियो और सहायता':'Videos and support','डेमो रीसेट करें':'Reset demo',
    'मूल नमूना डेटा वापस लाएँ':'Restore original sample data','होम':'Home','उत्पाद':'Products','प्रगति':'Insights','प्रोफ़ाइल':'Profile',
    'AI उत्पाद सहायक':'AI product assistant','नया उत्पाद जोड़ें':'Add a new product','उत्पाद की फोटो लें':'Take a product photo','या गैलरी से चुनें':'or choose from gallery',
    'फोटो चुनें':'Choose photo','उत्पाद का नाम':'Product name','श्रेणी':'Category','स्टॉक':'Stock','हस्तकला':'Handicraft','पेंटिंग':'Painting','वस्त्र':'Textiles',
    'घर सजावट':'Home décor','आभूषण':'Jewellery','इसके बारे में थोड़ा बताएं':'Tell us a little about it','लिखना मुश्किल है?':'Prefer speaking?',
    'बोलकर जानकारी दें':'Describe it by voice','पीछे':'Back','आगे बढ़ें':'Continue','AI आपका उत्पाद तैयार कर रहा है':'AI is preparing your product',
    'तस्वीर साफ की जा रही है…':'Enhancing the photo…','✓ उत्पाद की जानकारी तैयार है':'✓ Product information is ready','साफ की गई तस्वीर':'Enhanced photo',
    'AI बेहतर':'AI enhanced','पहले':'Before','AI के बाद':'After AI','उत्पाद विवरण':'Product description','बदलें':'Edit','हिंदी':'Hindi',
    'कीमत का सुझाव':'Price suggestion','बाजार के अनुसार':'Based on the market','सुझाई कीमत':'Suggested price','आपकी कीमत ₹':'Your price ₹',
    'समान हस्तनिर्मित उत्पाद ₹799 से ₹1,099 में बिक रहे हैं।':'Similar handmade products sell between ₹799 and ₹1,099.',
    'आपका उत्पाद':'Your product','बिक्री के लिए तैयार':'Ready to sell','कहाँ बेचना है?':'Where would you like to sell?',
    'पूरे भारत के खरीदार':'Buyers across India','सरकारी ई-मार्केट':'Government e-Marketplace','B2B और सरकारी खरीदार':'B2B and government buyers',
    'मेरी डिजिटल सूची':'My digital catalogue','WhatsApp पर साझा करें':'Share on WhatsApp','तस्वीर साफ और आकर्षक है':'The photo is clear and attractive',
    'हिंदी और अंग्रेज़ी विवरण तैयार है':'Hindi and English descriptions are ready','बाजार के अनुसार कीमत रखी गई है':'The price matches the market',
    'उत्पाद प्रकाशित करें':'Publish product','AI कीमत सहायक':'AI pricing assistant','सही कीमत पाएँ':'Find the right price','बाजार, सामग्री और मेहनत के आधार पर':'Based on market, material and effort',
    'यह कीमत रखें':'Use this price','कारीगर साथी · संस्करण 1.0':'Karigar Saathi · Version 1.0'
  };
  const englishProducts = {
    'मधुबनी मछली पेंटिंग':'Madhubani Fish Painting','बांस की सजावटी टोकरी':'Decorative Bamboo Basket',
    'हाथ बुना सूती दुपट्टा':'Handwoven Cotton Dupatta','टेराकोटा दीया सेट':'Terracotta Diya Set',
    'बांस की सजावटी टोकरी · 2':'Decorative Bamboo Basket · 2','टेराकोटा दीया सेट · 2':'Terracotta Diya Set · 2'
  };
  const originalNodes = new WeakMap();
  const originalAttributes = new WeakMap();
  const el = id => document.getElementById(id);
  const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
  const persist = () => { localStorage.setItem('ks_products', JSON.stringify(state.products)); localStorage.setItem('ks_orders', JSON.stringify(state.orders)); };
  const showToast = message => { const toast = el('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2500); };
  async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
      headers: {'Content-Type':'application/json', ...(options.headers || {})},
      ...options
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || `Request failed with ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }
  async function syncFromApi() {
    try {
      const bootstrap = await apiRequest('/api/bootstrap');
      state.apiOnline = true;
      state.products = bootstrap.products;
      state.orders = bootstrap.orders;
      persist();
      renderProducts();
      renderOrders();
      el('salesTotal').textContent = money(bootstrap.stats.monthly_sales);
      el('orderCount').textContent = bootstrap.stats.new_orders;
      translatePage();
    } catch {
      state.apiOnline = false;
    }
  }
  const ui = (hindi, english) => state.language === 'hi' ? hindi : english;
  const productText = value => state.language === 'hi' ? value : (englishProducts[value] || value);
  const statusLabel = status => status === 'live' ? ui('ऑनलाइन','Live') : ui('ड्राफ्ट','Draft');
  const orderStatusLabel = status => ({new:ui('नया ऑर्डर','New order'),packed:ui('पैक हो गया','Packed'),sent:ui('भेज दिया','Dispatched')})[status];

  function translatePage() {
    document.documentElement.lang = state.language;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      if (!originalNodes.has(textNode)) originalNodes.set(textNode, textNode.nodeValue);
      const original = originalNodes.get(textNode);
      const trimmed = original.trim();
      if (!trimmed) continue;
      const replacement = state.language === 'en' ? (englishText[trimmed] || englishProducts[trimmed]) : trimmed;
      textNode.nodeValue = original.replace(trimmed, replacement || trimmed);
    }
    document.querySelectorAll('[placeholder],[aria-label]').forEach(node => {
      if (!originalAttributes.has(node)) originalAttributes.set(node, {placeholder:node.getAttribute('placeholder'), aria:node.getAttribute('aria-label')});
      const values = originalAttributes.get(node);
      if (values.placeholder) node.setAttribute('placeholder', state.language === 'en' ? ({
        'उत्पाद खोजें':'Search products','जैसे — मधुबनी पेंटिंग':'For example — Madhubani painting',
        'सामग्री, आकार या बनाने का तरीका':'Material, size or how it is made'
      }[values.placeholder] || values.placeholder) : values.placeholder);
      if (values.aria) node.setAttribute('aria-label', state.language === 'en' ? ({
        'होम':'Home','भाषा बदलें':'Change language','सूचनाएँ':'Notifications','बोलकर निर्देश दें':'Give a voice command',
        'सुझाव बंद करें':'Dismiss tip','रिपोर्ट डाउनलोड करें':'Download report','बंद करें':'Close','उत्पाद की तस्वीर चुनें':'Choose a product photo'
      }[values.aria] || values.aria) : values.aria);
    });
    el('languageButton').textContent = state.language === 'hi' ? 'English' : 'हिंदी';
    const locale = state.language === 'hi' ? 'hi-IN' : 'en-IN';
    const currentDate = new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    el('todayLabel').textContent = `${ui('आज','Today')} · ${currentDate}`;
  }

  function renderProducts() {
    const topProducts = el('topProducts');
    topProducts.innerHTML = state.products.filter(product => product.status === 'live').slice(0,5).map(product => `
      <article class="mini-product"><div class="image-wrap"><img src="${product.image}" alt="${productText(product.name)}"><span class="status-pill">● ${statusLabel(product.status)}</span></div><div class="product-copy"><strong>${productText(product.name)}</strong><small>${product.views || 0} ${ui('लोगों ने देखा','views')}</small><div class="product-price-row"><b>${money(product.price)}</b><span>${product.stock} ${ui('उपलब्ध','available')}</span></div></div></article>`).join('');
    applyCatalogueFilters();
    el('productCount').textContent = state.products.filter(product => product.status === 'live').length;
    const pricingSelect = el('pricingProduct');
    pricingSelect.innerHTML = state.products.map(product => `<option value="${product.id}">${productText(product.name)}</option>`).join('');
  }

  function applyCatalogueFilters() {
    const query = (el('productSearch')?.value || '').trim().toLowerCase();
    const activeFilter = document.querySelector('#filterChips .chip.active')?.dataset.filter || 'all';
    const matches = state.products.filter(product => {
      const textMatch = `${product.name} ${product.category}`.toLowerCase().includes(query);
      const filterMatch = activeFilter === 'all' || product.status === activeFilter || (activeFilter === 'low' && product.stock <= 3);
      return textMatch && filterMatch;
    });
    el('catalogueList').innerHTML = matches.map(product => `
      <article class="catalogue-card"><div class="catalogue-image"><img src="${product.image}" alt="${productText(product.name)}"><span class="status-pill">${statusLabel(product.status)}</span></div><div class="catalogue-copy"><h3>${productText(product.name)}</h3><p>${state.language === 'hi' ? product.category : (englishText[product.category] || product.category)} · <span class="${product.stock <= 3 ? 'stock-low' : ''}">${product.stock} ${ui('स्टॉक','in stock')}</span></p><strong>${money(product.price)}</strong></div><button class="more-button" data-product-menu="${product.id}" aria-label="${productText(product.name)} ${ui('के विकल्प','options')}">⋮</button></article>`).join('');
    el('catalogueEmpty').classList.toggle('hidden', matches.length > 0);
  }

  function renderOrders(filter = 'all') {
    const visibleOrders = state.orders.filter(order => filter === 'all' || order.status === filter);
    el('orderList').innerHTML = visibleOrders.map(order => `<article class="order-card"><div class="order-top"><small>${ui('ऑर्डर','Order')} #${order.id}</small><span>${orderStatusLabel(order.status)}</span></div><div class="order-customer"><div class="order-thumb">${order.icon}</div><div><strong>${productText(order.item)}</strong><small>${order.customer} · ${order.city}</small></div></div><div class="order-bottom"><strong>${money(order.amount)}</strong>${order.status === 'new' ? `<button data-pack-order="${order.id}">${ui('पैक करना शुरू करें','Start packing')}</button>` : order.status === 'packed' ? `<button data-send-order="${order.id}">${ui('भेज दिया','Mark dispatched')}</button>` : `<small>✓ ${ui('रास्ते में','In transit')}</small>`}</div></article>`).join('');
  }

  function navigate(route) {
    state.currentView = route;
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.dataset.view === route));
    document.querySelectorAll('.bottom-nav button').forEach(button => button.classList.toggle('active', button.dataset.route === route));
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function openProductModal() {
    resetProductForm(); el('productModal').hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => el('productName').focus(), 250);
  }
  function closeProductModal() { el('productModal').hidden = true; document.body.style.overflow = ''; }
  function resetProductForm() {
    state.currentStep = 1; state.imageData = ''; el('productForm').reset(); el('productStock').value = 10; el('imagePreview').hidden = true; el('uploadPrompt').classList.remove('hidden'); el('aiProgress').classList.remove('hidden'); el('aiResults').classList.add('hidden'); el('progressBar').style.width = '0'; updateStepUI();
  }
  function updateStepUI() {
    document.querySelectorAll('.form-step').forEach(step => step.classList.toggle('active', Number(step.dataset.step) === state.currentStep));
    document.querySelectorAll('.stepper span').forEach((step, index) => step.classList.toggle('active', index < state.currentStep));
    el('backStep').hidden = state.currentStep === 1; el('nextStep').textContent = state.currentStep === 3 ? ui('उत्पाद प्रकाशित करें','Publish product') : ui('आगे बढ़ें','Continue');
  }
  function suggestedPrice() {
    const category = el('productCategory').value;
    const detailsLength = el('productDetails').value.length;
    const base = ({'पेंटिंग':1199,'वस्त्र':999,'घर सजावट':799,'आभूषण':699,'हस्तकला':599})[category] || 699;
    return Math.round((base + Math.min(detailsLength * 3, 180)) / 50) * 50 - 1;
  }
  async function startAI() {
    el('aiProgress').classList.remove('hidden'); el('aiResults').classList.add('hidden');
    const stages = [{p:28,t:ui('तस्वीर साफ की जा रही है…','Enhancing the photo…')},{p:55,t:ui('उत्पाद को पहचाना जा रहा है…','Identifying the product…')},{p:78,t:ui('हिंदी और अंग्रेज़ी विवरण बन रहा है…','Creating Hindi and English descriptions…')},{p:100,t:ui('सही कीमत खोजी जा रही है…','Finding the right market price…')}];
    let aiResult = null;
    const aiRequest = state.apiOnline ? apiRequest('/api/ai/process', {
      method:'POST',
      body:JSON.stringify({name:el('productName').value.trim(), category:el('productCategory').value, details:el('productDetails').value.trim(), image:state.imageData || null})
    }).catch(() => null) : Promise.resolve(null);
    for (const stage of stages) {
      el('progressBar').style.width = `${stage.p}%`;
      el('aiProgressText').textContent = stage.t;
      await new Promise(resolve => setTimeout(resolve, 420));
    }
    aiResult = await aiRequest;
    showAIResults(aiResult);
  }
  function showAIResults(aiResult = null) {
    const name = el('productName').value.trim(); const category = el('productCategory').value; const details = el('productDetails').value.trim(); const price = suggestedPrice();
    const image = aiResult?.enhanced_image || state.imageData || svgProduct(category === 'पेंटिंग' ? '🖼️' : category === 'वस्त्र' ? '🧣' : category === 'आभूषण' ? '📿' : '🎨','#e7eee9','#317f73');
    state.imageData = image; el('enhancedImage').src = image;
    el('hindiDescription').value = aiResult?.hindi_description || `${name} एक सुंदर, हाथ से बनाया गया ${category} उत्पाद है। ${details || 'इसे पारंपरिक कौशल और ध्यान से तैयार किया गया है।'} हर वस्तु अपने आप में अनोखी है और स्थानीय कारीगरी की कहानी बताती है।`;
    el('englishDescription').value = aiResult?.english_description || `${name} is a beautiful handcrafted ${category.toLowerCase()} product. ${details ? 'It is carefully made using traditional techniques and quality materials.' : 'It is created with traditional skills and close attention to detail.'} Every piece is unique and supports local craftsmanship.`;
    const finalSuggestion = aiResult?.recommended_price || price;
    el('recommendedPrice').textContent = money(finalSuggestion); el('finalPrice').value = finalSuggestion; el('aiProgress').classList.add('hidden'); el('aiResults').classList.remove('hidden');
  }
  function preparePublish() {
    el('publishImage').src = state.imageData; el('publishName').textContent = el('productName').value.trim(); el('publishDescription').textContent = el('hindiDescription').value; el('publishPrice').textContent = money(el('finalPrice').value);
  }
  async function publishProduct() {
    const channels = [...document.querySelectorAll('input[name="channel"]:checked')].map(input => input.value);
    const newProduct = {id: Date.now(), name: el('productName').value.trim(), category: el('productCategory').value, stock: Number(el('productStock').value), price: Number(el('finalPrice').value), status: 'live', views: 0, image: state.imageData, description: el('hindiDescription').value};
    if (state.apiOnline) {
      try {
        const createdProduct = await apiRequest('/api/products', {
          method:'POST',
          body:JSON.stringify({...newProduct, english_description:el('englishDescription').value, channels})
        });
        Object.assign(newProduct, createdProduct);
      } catch (error) {
        showToast(error.message);
        return;
      }
    }
    state.products.unshift(newProduct); persist(); renderProducts(); closeProductModal(); navigate('catalogue'); showToast(ui('✓ उत्पाद सफलतापूर्वक ऑनलाइन हो गया','✓ Product published successfully'));
  }

  document.addEventListener('click', async event => {
    const routeButton = event.target.closest('[data-route]'); if (routeButton) navigate(routeButton.dataset.route);
    if (event.target.closest('#addProductButton') || event.target.closest('#catalogueAddButton')) openProductModal();
    if (event.target.closest('#pricingButton') || event.target.closest('#insightPricingButton')) { el('pricingModal').hidden = false; document.body.style.overflow = 'hidden'; updatePricingTool(); }
    const closeTarget = event.target.closest('[data-close]'); if (closeTarget) { el(closeTarget.dataset.close).hidden = true; document.body.style.overflow = ''; }
    const menuButton = event.target.closest('[data-product-menu]'); if (menuButton) showToast(ui('उत्पाद संपादन अगले संस्करण में उपलब्ध होगा','Product editing will be available in the next version'));
    const packButton = event.target.closest('[data-pack-order]'); if (packButton) { const order = state.orders.find(item => item.id === packButton.dataset.packOrder); order.status = 'packed'; if (state.apiOnline) await apiRequest(`/api/orders/${order.id}`, {method:'PATCH',body:JSON.stringify({status:'packed'})}).catch(() => null); persist(); renderOrders(document.querySelector('.order-tabs .active').dataset.orderFilter); showToast(ui('✓ ऑर्डर पैकिंग में भेज दिया','✓ Order moved to packing')); }
    const sendButton = event.target.closest('[data-send-order]'); if (sendButton) { const order = state.orders.find(item => item.id === sendButton.dataset.sendOrder); order.status = 'sent'; if (state.apiOnline) await apiRequest(`/api/orders/${order.id}`, {method:'PATCH',body:JSON.stringify({status:'sent'})}).catch(() => null); persist(); renderOrders(document.querySelector('.order-tabs .active').dataset.orderFilter); showToast(ui('✓ ग्राहक को भेजने की सूचना मिल गई','✓ Customer has been notified of dispatch')); }
  });
  el('closeModal').addEventListener('click', closeProductModal);
  el('productModal').addEventListener('click', event => { if (event.target === el('productModal')) closeProductModal(); });
  el('pricingModal').addEventListener('click', event => { if (event.target === el('pricingModal')) { el('pricingModal').hidden = true; document.body.style.overflow = ''; } });
  el('uploadZone').addEventListener('click', () => el('productImage').click());
  el('uploadZone').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); el('productImage').click(); } });
  el('productImage').addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; if (file.size > 6 * 1024 * 1024) return showToast('तस्वीर 6 MB से छोटी रखें'); const reader = new FileReader(); reader.onload = () => { state.imageData = reader.result; el('imagePreview').src = reader.result; el('imagePreview').hidden = false; el('uploadPrompt').classList.add('hidden'); }; reader.readAsDataURL(file); });
  el('productForm').addEventListener('submit', event => { event.preventDefault(); if (state.currentStep === 1) { if (!el('productForm').reportValidity()) return; state.currentStep = 2; updateStepUI(); startAI(); } else if (state.currentStep === 2) { if (el('aiResults').classList.contains('hidden')) return showToast(ui('AI अभी काम कर रहा है','AI is still working')); preparePublish(); state.currentStep = 3; updateStepUI(); } else publishProduct(); });
  el('backStep').addEventListener('click', () => { if (state.currentStep > 1) { state.currentStep -= 1; updateStepUI(); } });
  el('productSearch').addEventListener('input', applyCatalogueFilters);
  el('filterChips').addEventListener('click', event => { const chip = event.target.closest('.chip'); if (!chip) return; document.querySelectorAll('#filterChips .chip').forEach(item => item.classList.toggle('active', item === chip)); applyCatalogueFilters(); });
  document.querySelector('.order-tabs').addEventListener('click', event => { const tab = event.target.closest('button'); if (!tab) return; document.querySelectorAll('.order-tabs button').forEach(item => item.classList.toggle('active', item === tab)); renderOrders(tab.dataset.orderFilter); });
  el('micButton').addEventListener('click', () => { const button = el('micButton'); button.classList.add('listening'); el('assistantPrompt').textContent = ui('सुन रहा हूँ…','Listening…'); setTimeout(() => { button.classList.remove('listening'); el('assistantPrompt').textContent = ui('“नया उत्पाद जोड़ो” समझा गया','“Add a new product” understood'); setTimeout(openProductModal, 500); }, 1500); });
  el('voiceDetails').addEventListener('click', () => { el('voiceDetails').innerHTML = '<span>⏺</span><div><strong>सुन रहा हूँ…</strong><small>अपने उत्पाद के बारे में बोलें</small></div>'; setTimeout(() => { el('productDetails').value = 'यह उत्पाद प्राकृतिक सामग्री से हाथ से बनाया गया है और इसे तैयार करने में तीन दिन लगते हैं।'; el('voiceDetails').innerHTML = '<span>✓</span><div><strong>जानकारी जोड़ दी गई</strong><small>आप इसे बदल भी सकते हैं</small></div>'; }, 1500); });
  el('languageButton').addEventListener('click', () => {
    state.language = state.language === 'hi' ? 'en' : 'hi';
    localStorage.setItem('ks_language', state.language);
    renderProducts(); renderOrders(document.querySelector('.order-tabs .active').dataset.orderFilter); updateStepUI(); translatePage();
    showToast(ui('भाषा हिंदी कर दी गई','Language changed to English'));
  });
  el('notificationButton').addEventListener('click', () => { showToast(ui('3 नए ऑर्डर और 1 कीमत सुझाव','3 new orders and 1 pricing suggestion')); document.querySelector('.notification-dot').style.display = 'none'; });
  el('dismissTip').addEventListener('click', () => el('dismissTip').closest('.tip-card').remove());
  el('filterButton').addEventListener('click', () => el('filterChips').scrollIntoView({behavior:'smooth',block:'center'}));
  el('pricingProduct').addEventListener('change', updatePricingTool);
  function updatePricingTool() { const product = state.products.find(item => String(item.id) === el('pricingProduct').value) || state.products[0]; const suggestion = Math.round(product.price * 1.06 / 50) * 50 - 1; el('pricingSuggestion').textContent = money(suggestion); el('pricingSuggestion').dataset.value = suggestion; }
  el('applyPrice').addEventListener('click', async () => { const product = state.products.find(item => String(item.id) === el('pricingProduct').value) || state.products[0]; product.price = Number(el('pricingSuggestion').dataset.value); if (state.apiOnline) await apiRequest(`/api/products/${product.id}/price`, {method:'PATCH',body:JSON.stringify({price:product.price})}).catch(() => null); persist(); renderProducts(); el('pricingModal').hidden = true; document.body.style.overflow = ''; showToast(ui('✓ नई कीमत लागू हो गई','✓ New price applied')); });
  el('downloadReport').addEventListener('click', () => { if (state.apiOnline) { window.location.href = '/api/report.csv'; } else { const rows = ['Month,Sales,Orders','September,18450,23','August,16470,20']; const blob = new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'}); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'karigar-saathi-report.csv'; anchor.click(); URL.revokeObjectURL(url); } showToast(ui('रिपोर्ट डाउनलोड हो गई','Report downloaded')); });
  el('resetDemo').addEventListener('click', async () => { if (state.apiOnline) { await apiRequest('/api/reset',{method:'POST',body:'{}'}); await syncFromApi(); } else { state.products = structuredClone(seedProducts); state.orders = structuredClone(seedOrders); persist(); renderProducts(); renderOrders(); } showToast(ui('✓ डेमो डेटा रीसेट हो गया','✓ Demo data reset')); });
  window.addEventListener('online', () => { document.body.classList.remove('offline'); showToast('आप फिर से ऑनलाइन हैं'); });
  window.addEventListener('offline', () => document.body.classList.add('offline'));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (!el('productModal').hidden) closeProductModal(); if (!el('pricingModal').hidden) { el('pricingModal').hidden = true; document.body.style.overflow = ''; } } });
  renderProducts(); renderOrders(); updatePricingTool(); updateStepUI(); translatePage(); syncFromApi();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
