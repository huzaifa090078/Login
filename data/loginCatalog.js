/**
 * LOGIN WHOLESALE PRODUCT CATALOG
 * PRICE LIST: W.E.F AUGUST 2026
 * Total Products: 113
 * Currency: PKR
 */

export const LOGIN_CATEGORIES = [
  { id: 'chargers', name: 'Chargers', icon: '⚡' },
  { id: 'data-cables', name: 'Data Cables', icon: '🔌' },
  { id: 'handsfree', name: 'Handsfree', icon: '🎧' },
  { id: 'power-banks', name: 'Power Banks', icon: '🔋' },
  { id: 'smart-watches', name: 'Smart Watches', icon: '⌚' },
  { id: 'tws', name: 'TWS', icon: '🎵' },
  { id: 'neckband-headphones', name: 'Neckband & Headphones', icon: '🎧' },
  { id: 'speakers', name: 'Speakers', icon: '🔊' },
  { id: 'batteries', name: 'Batteries', icon: '🔋' },
];

export const LOGIN_PRODUCTS = [
  // ==================================================
  // CATEGORY 1 — CHARGERS (1 - 26)
  // ==================================================
  {
    id: 'charger-l400-micro',
    category: 'chargers',
    modelNumber: 'L-400',
    productName: 'ELVO Charger',
    variant: 'Micro',
    rate: 389,
    active: true
  },
  {
    id: 'charger-l400-typec',
    category: 'chargers',
    modelNumber: 'L-400',
    productName: 'ELVO Charger',
    variant: 'Type-C',
    rate: 399,
    active: true
  },
  {
    id: 'charger-l401-micro',
    category: 'chargers',
    modelNumber: 'L-401',
    productName: 'Charger',
    variant: 'Micro',
    rate: 469,
    active: true
  },
  {
    id: 'charger-l401-typec',
    category: 'chargers',
    modelNumber: 'L-401',
    productName: 'Charger',
    variant: 'Type-C',
    rate: 479,
    active: true
  },
  {
    id: 'charger-l402-micro',
    category: 'chargers',
    modelNumber: 'L-402',
    productName: 'AXION Charger',
    variant: 'Micro',
    rate: 489,
    active: true
  },
  {
    id: 'charger-l402-typec',
    category: 'chargers',
    modelNumber: 'L-402',
    productName: 'AXION Charger',
    variant: 'Type-C',
    rate: 499,
    active: true
  },
  {
    id: 'charger-l410-micro',
    category: 'chargers',
    modelNumber: 'L-410',
    productName: 'REVOLTO Charger',
    variant: 'Micro',
    rate: 569,
    active: true
  },
  {
    id: 'charger-l410-typec',
    category: 'chargers',
    modelNumber: 'L-410',
    productName: 'REVOLTO Charger',
    variant: 'Type-C',
    rate: 589,
    active: true
  },
  {
    id: 'charger-l411-pdpd',
    category: 'chargers',
    modelNumber: 'L-411',
    productName: 'NUG Charger',
    variant: 'PD to PD',
    rate: 1099,
    active: true
  },
  {
    id: 'charger-l411-pdios',
    category: 'chargers',
    modelNumber: 'L-411',
    productName: 'NUG Charger',
    variant: 'PD to iOS / Lightning',
    rate: 1199,
    active: true
  },
  {
    id: 'charger-l403',
    category: 'chargers',
    modelNumber: 'L-403',
    productName: 'AL-ROUND Charger',
    variant: 'Type-C',
    rate: 869,
    active: true
  },
  {
    id: 'charger-l412-pdpd',
    category: 'chargers',
    modelNumber: 'L-412',
    productName: 'EDGE Charger',
    variant: 'PD to PD',
    rate: 799,
    active: true
  },
  {
    id: 'charger-l412-pdios',
    category: 'chargers',
    modelNumber: 'L-412',
    productName: 'EDGE Charger',
    variant: 'PD to iOS / Lightning',
    rate: 849,
    active: true
  },
  {
    id: 'charger-l413-pdpd',
    category: 'chargers',
    modelNumber: 'L-413',
    productName: 'GAN GO Charger',
    variant: 'PD to PD',
    rate: 1599,
    active: true
  },
  {
    id: 'charger-l413-pdios',
    category: 'chargers',
    modelNumber: 'L-413',
    productName: 'GAN GO Charger',
    variant: 'PD to iOS / Lightning',
    rate: 1649,
    active: true
  },
  {
    id: 'charger-l414',
    category: 'chargers',
    modelNumber: 'L-414',
    productName: 'THUNDER BOLT Charger',
    variant: 'PD to PD / PD to iOS / Lightning',
    rate: 1649,
    active: true
  },
  {
    id: 'charger-l415',
    category: 'chargers',
    modelNumber: 'L-415',
    productName: 'Charger',
    variant: '65W, Laptop Support',
    rate: 2799,
    active: true
  },
  {
    id: 'charger-l500-micro',
    category: 'chargers',
    modelNumber: 'L-500',
    productName: 'Clip Charger',
    variant: 'Micro',
    rate: 369,
    active: true
  },
  {
    id: 'charger-l500-typec',
    category: 'chargers',
    modelNumber: 'L-500',
    productName: 'Clip Charger',
    variant: 'Type-C',
    rate: 379,
    active: true
  },
  {
    id: 'charger-l501',
    category: 'chargers',
    modelNumber: 'L-501',
    productName: 'CHARGEMATE DUAL Clip Charger',
    variant: 'Micro + Type-C',
    rate: 429,
    active: true
  },
  {
    id: 'charger-l510',
    category: 'chargers',
    modelNumber: 'L-510',
    productName: 'CLIPLEX Clip Charger',
    variant: 'Type-C',
    rate: 579,
    active: true
  },
  {
    id: 'charger-l600-micro',
    category: 'chargers',
    modelNumber: 'L-600',
    productName: 'DRIVEON Car Charger',
    variant: 'Micro',
    rate: 649,
    active: true
  },
  {
    id: 'charger-l600-typec',
    category: 'chargers',
    modelNumber: 'L-600',
    productName: 'DRIVEON Car Charger',
    variant: 'Type-C',
    rate: 679,
    active: true
  },
  {
    id: 'charger-l603',
    category: 'chargers',
    modelNumber: 'L-603',
    productName: 'MOVON Car Charger',
    variant: 'PD to PD',
    rate: 1149,
    active: true
  },
  {
    id: 'charger-l602-pdpd',
    category: 'chargers',
    modelNumber: 'L-602',
    productName: 'VYNOX Car Charger',
    variant: 'PD to PD',
    rate: 719,
    active: true
  },
  {
    id: 'charger-l602-pdios',
    category: 'chargers',
    modelNumber: 'L-602',
    productName: 'VYNOX Car Charger',
    variant: 'PD to iOS / Lightning',
    rate: 799,
    active: true
  },

  // ==================================================
  // CATEGORY 2 — DATA CABLES (27 - 50)
  // ==================================================
  {
    id: 'cable-l1947-micro',
    category: 'data-cables',
    modelNumber: 'L-1947',
    productName: 'Cable',
    variant: 'Micro',
    rate: 119,
    active: true
  },
  {
    id: 'cable-l1947-typec',
    category: 'data-cables',
    modelNumber: 'L-1947',
    productName: 'Cable',
    variant: 'Type-C',
    rate: 129,
    active: true
  },
  {
    id: 'cable-l121plus',
    category: 'data-cables',
    modelNumber: 'L-121+',
    productName: 'Cable',
    variant: 'Micro + Type-C',
    rate: 140,
    active: true
  },
  {
    id: 'cable-l900-micro',
    category: 'data-cables',
    modelNumber: 'L-900',
    productName: 'Cable',
    variant: 'Micro',
    rate: 170,
    active: true
  },
  {
    id: 'cable-l900-typec',
    category: 'data-cables',
    modelNumber: 'L-900',
    productName: 'Cable',
    variant: 'Type-C',
    rate: 180,
    active: true
  },
  {
    id: 'cable-l901-micro',
    category: 'data-cables',
    modelNumber: 'L-901',
    productName: 'ORIV TPE Wire',
    variant: 'Micro',
    rate: 199,
    active: true
  },
  {
    id: 'cable-l901-typec',
    category: 'data-cables',
    modelNumber: 'L-901',
    productName: 'ORIV TPE Wire',
    variant: 'Type-C',
    rate: 209,
    active: true
  },
  {
    id: 'cable-l901-ios',
    category: 'data-cables',
    modelNumber: 'L-901',
    productName: 'ORIV TPE Wire',
    variant: 'iOS',
    rate: 249,
    active: true
  },
  {
    id: 'cable-l901-65w-pdpd',
    category: 'data-cables',
    modelNumber: 'L-901',
    productName: 'TPE Wire',
    variant: '65W PD to PD',
    rate: 259,
    active: true
  },
  {
    id: 'cable-l901-65w-pdios',
    category: 'data-cables',
    modelNumber: 'L-901',
    productName: 'TPE Wire',
    variant: '65W PD to iOS / Lightning',
    rate: 329,
    active: true
  },
  {
    id: 'cable-l902-typec',
    category: 'data-cables',
    modelNumber: 'L-902',
    productName: 'Silicone Wire',
    variant: 'Type-C',
    rate: 289,
    active: true
  },
  {
    id: 'cable-l902-ios',
    category: 'data-cables',
    modelNumber: 'L-902',
    productName: 'Silicone Wire',
    variant: 'iOS',
    rate: 299,
    active: true
  },
  {
    id: 'cable-l904-35w-micro',
    category: 'data-cables',
    modelNumber: 'L-904',
    productName: 'CHARGE POP Data Cable',
    variant: '35W Micro',
    rate: 299,
    active: true
  },
  {
    id: 'cable-l904-35w-typec',
    category: 'data-cables',
    modelNumber: 'L-904',
    productName: 'CHARGE POP Data Cable',
    variant: '35W Type-C',
    rate: 309,
    active: true
  },
  {
    id: 'cable-l904-65w-pdpd',
    category: 'data-cables',
    modelNumber: 'L-904',
    productName: 'CHARGEPOP Data Cable',
    variant: '65W PD to PD',
    rate: 329,
    active: true
  },
  {
    id: 'cable-l904-65w-pdios',
    category: 'data-cables',
    modelNumber: 'L-904',
    productName: 'CHARGEPOP Data Cable',
    variant: '65W PD to iOS / Lightning',
    rate: 379,
    active: true
  },
  {
    id: 'cable-l905-typec',
    category: 'data-cables',
    modelNumber: 'L-905',
    productName: 'RIVOR Data Cable',
    variant: 'Type-C',
    rate: 349,
    active: true
  },
  {
    id: 'cable-l905-ios',
    category: 'data-cables',
    modelNumber: 'L-905',
    productName: 'RIVOR Data Cable',
    variant: 'iOS',
    rate: 369,
    active: true
  },
  {
    id: 'cable-l905-pdpd',
    category: 'data-cables',
    modelNumber: 'L-905',
    productName: 'RIVOR Data Cable',
    variant: 'PD to PD',
    rate: 389,
    active: true
  },
  {
    id: 'cable-l905-pdios',
    category: 'data-cables',
    modelNumber: 'L-905',
    productName: 'RIVOR Data Cable',
    variant: 'PD to iOS / Lightning',
    rate: 469,
    active: true
  },
  {
    id: 'cable-ltd124-ios',
    category: 'data-cables',
    modelNumber: 'LT-D124',
    productName: 'Silicone Wire',
    variant: 'iOS',
    rate: 360,
    active: true
  },
  {
    id: 'cable-ltd124-pdpd',
    category: 'data-cables',
    modelNumber: 'LT-D124',
    productName: 'Silicone Wire',
    variant: 'PD to PD',
    rate: 375,
    active: true
  },
  {
    id: 'cable-l909',
    category: 'data-cables',
    modelNumber: 'L-909',
    productName: '3 in 1 Cable',
    variant: '3 in 1',
    rate: 479,
    active: true
  },
  {
    id: 'cable-l910',
    category: 'data-cables',
    modelNumber: 'L-910',
    productName: '4 in 1 Cable',
    variant: '4 in 1',
    rate: 719,
    active: true
  },

  // ==================================================
  // CATEGORY 3 — HANDSFREE (51 - 60)
  // ==================================================
  {
    id: 'handsfree-l302-35mm-black',
    category: 'handsfree',
    modelNumber: 'L-302',
    productName: 'HANDSFREE',
    variant: 'Clear Sound, TPE Wire, Full Ear, 3.5mm, Black',
    rate: 329,
    active: true
  },
  {
    id: 'handsfree-l302-35mm-white',
    category: 'handsfree',
    modelNumber: 'L-302',
    productName: 'HANDSFREE',
    variant: 'Clear Sound, TPE Wire, Full Ear, 3.5mm, White',
    rate: 329,
    active: true
  },
  {
    id: 'handsfree-l303',
    category: 'handsfree',
    modelNumber: 'L-303',
    productName: 'HANDSFREE',
    variant: 'Full Ear, TPE Wire, 3.5mm',
    rate: 249,
    active: true
  },
  {
    id: 'handsfree-l310-35mm',
    category: 'handsfree',
    modelNumber: 'L-310',
    productName: 'HANDSFREE',
    variant: 'Heavy Bass, TPE Wire, Full Ear, 3.5mm',
    rate: 370,
    active: true
  },
  {
    id: 'handsfree-l310-typec',
    category: 'handsfree',
    modelNumber: 'L-310',
    productName: 'HANDSFREE',
    variant: 'Heavy Bass, TPE Wire, Full Ear, Type-C',
    rate: 469,
    active: true
  },
  {
    id: 'handsfree-l301-35mm-1',
    category: 'handsfree',
    modelNumber: 'L-301',
    productName: 'CLEON HANDSFREE',
    variant: 'Comfort Ear, TPE Wire, Half Ear, 3.5mm',
    rate: 389,
    active: true
  },
  {
    id: 'handsfree-l301-typec',
    category: 'handsfree',
    modelNumber: 'L-301',
    productName: 'CLEON HANDSFREE',
    variant: 'Comfort Ear, TPE Wire, Half Ear, Type-C',
    rate: 519,
    active: true
  },
  {
    id: 'handsfree-l301-35mm-2',
    category: 'handsfree',
    modelNumber: 'L-301',
    productName: 'CLEON HANDSFREE',
    variant: 'Comfort Ear, TPE Wire, Half Ear, 3.5mm',
    rate: 389,
    active: true
  },
  {
    id: 'handsfree-l301-typec-2',
    category: 'handsfree',
    modelNumber: 'L-301',
    productName: 'CLEON HANDSFREE',
    variant: 'Comfort Ear, TPE Wire, Half Ear, Type-C',
    rate: 519,
    active: true
  },
  {
    id: 'handsfree-l301pro',
    category: 'handsfree',
    modelNumber: 'L-301 PRO',
    productName: 'CLEON HANDSFREE',
    variant: 'Plug & Play, Heavy Bass, TPE Wire, Half Ear, iOS',
    rate: 1129,
    active: true
  },

  // ==================================================
  // CATEGORY 4 — POWER BANKS (61 - 68)
  // ==================================================
  {
    id: 'powerbank-l709',
    category: 'power-banks',
    modelNumber: 'L-709',
    productName: 'VOLTRA POWERBANK',
    variant: '22.5W, Pocket Size, Built-in Cable, iOS & Type-C, 10,000mAh',
    rate: 2799,
    active: true
  },
  {
    id: 'powerbank-l712',
    category: 'power-banks',
    modelNumber: 'L-712',
    productName: 'MAGNA POWERBANK',
    variant: '22.5W, Pocket Size, MagSafe Charging, Type-C, 10,000mAh',
    rate: 3799,
    active: true
  },
  {
    id: 'powerbank-l711',
    category: 'power-banks',
    modelNumber: 'L-711',
    productName: 'MAG CORE POWERBANK',
    variant: '22.5W, Pocket Size, MagSafe Charging, Mobile & Watch, Type-C, 10,000mAh',
    rate: 4349,
    active: true
  },
  {
    id: 'powerbank-l706',
    category: 'power-banks',
    modelNumber: 'L-706',
    productName: 'NOMAD POWERBANK',
    variant: '45W, Digital Display, 19,000mAh, 2 PD Ports Input & Output, 1 USB Port',
    rate: 6199,
    active: true
  },
  {
    id: 'powerbank-l707',
    category: 'power-banks',
    modelNumber: 'L-707',
    productName: 'OBLIVOR POWERBANK',
    variant: '65W, Digital Display, Pocket Size, 20,000mAh, Built-in Cable Type-C',
    rate: 6499,
    active: true
  },
  {
    id: 'powerbank-l708',
    category: 'power-banks',
    modelNumber: 'L-708',
    productName: 'VOLTRA PRO POWERBANK',
    variant: '22.5W, Pocket Size, Built-in Cable, iOS & Type-C, 20,000mAh',
    rate: 4299,
    active: true
  },
  {
    id: 'powerbank-l713',
    category: 'power-banks',
    modelNumber: 'L-713',
    productName: 'AERA POWERBANK',
    variant: '35W, Pocket Size, LED Display, 20,000mAh, USB & PD Port',
    rate: 5999,
    active: true
  },
  {
    id: 'powerbank-l710',
    category: 'power-banks',
    modelNumber: 'L-710',
    productName: 'VOLTRA MAX POWERBANK',
    variant: '22.5W, Digital Display, Pocket Size, 30,000mAh, Built-in Cable Type-C & iOS',
    rate: 5399,
    active: true
  },

  // ==================================================
  // CATEGORY 5 — SMART WATCHES (73 - 78)
  // (Ordered according to Rule 6: Chargers, Data Cables, Handsfree, Power Banks, Smart Watches, TWS, Neckband & Headphones, Speakers, Batteries)
  // ==================================================
  {
    id: 'smartwatch-l109',
    category: 'smart-watches',
    modelNumber: 'L-109',
    productName: 'BLAZE',
    variant: 'AMOLED Smartwatch, BT Calling, Multiple Sports Modes, 2" Silicone Strap, 2 Charging Cables',
    rate: 6699,
    active: true
  },
  {
    id: 'smartwatch-l106',
    category: 'smart-watches',
    modelNumber: 'L-106',
    productName: 'Rover',
    variant: 'AMOLED Smartwatch, BT Calling, Multiple Sports Modes, 2" Silicone Strap, 2 Charging Cables',
    rate: 7499,
    active: true
  },
  {
    id: 'smartwatch-l104',
    category: 'smart-watches',
    modelNumber: 'L-104',
    productName: 'Elite',
    variant: 'AMOLED Smartwatch, BT Calling, 100+ Sports Modes, 4" Silicone + 1" Metal Strap, 2 Charging Cables',
    rate: 7999,
    active: true
  },
  {
    id: 'smartwatch-l107',
    category: 'smart-watches',
    modelNumber: 'L-107',
    productName: 'Prism',
    variant: 'AMOLED Smartwatch 2.1", BT Calling, iOS/Android 5.0+, Health Features, 1" Silicone Strap, 2 Charging Cables',
    rate: 8499,
    active: true
  },
  {
    id: 'smartwatch-l108',
    category: 'smart-watches',
    modelNumber: 'L-108',
    productName: 'Royal',
    variant: 'AMOLED Smartwatch, BT Calling, iOS 9.0+ Android 5.0+, 1" Silicone Strap, 2 Charging Cables',
    rate: 9499,
    active: true
  },
  {
    id: 'smartwatch-l115',
    category: 'smart-watches',
    modelNumber: 'L-115',
    productName: 'Glory',
    variant: 'AMOLED Smartwatch + GPS Health Tracking, BT Calling, iOS 9.0+ Android 5.0+, 1" Metal + Silicone Strap, 2 Charging Cables',
    rate: 13499,
    active: true
  },

  // ==================================================
  // CATEGORY 6 — TWS (79 - 90)
  // ==================================================
  {
    id: 'tws-l204',
    category: 'tws',
    modelNumber: 'L-204',
    productName: 'KYROS TWS',
    variant: 'TWS',
    rate: 2249,
    active: true
  },
  {
    id: 'tws-l210',
    category: 'tws',
    modelNumber: 'L-210',
    productName: 'TWS',
    variant: 'Active & Environmental Noise Cancellation',
    rate: 3249,
    active: true
  },
  {
    id: 'tws-l211',
    category: 'tws',
    modelNumber: 'L-211',
    productName: 'TWS',
    variant: 'Gaming',
    rate: 3299,
    active: true
  },
  {
    id: 'tws-l214',
    category: 'tws',
    modelNumber: 'L-214',
    productName: 'TWS',
    variant: 'ENC',
    rate: 3349,
    active: true
  },
  {
    id: 'tws-l220',
    category: 'tws',
    modelNumber: 'L-220',
    productName: 'TWS',
    variant: 'ANC + ENC + Gaming',
    rate: 3549,
    active: true
  },
  {
    id: 'tws-l200',
    category: 'tws',
    modelNumber: 'L-200',
    productName: 'TWS',
    variant: 'ANC + ENC',
    rate: 3799,
    active: true
  },
  {
    id: 'tws-l205',
    category: 'tws',
    modelNumber: 'L-205',
    productName: 'TWS',
    variant: 'ANC + ENC + AI + EQ',
    rate: 4049,
    active: true
  },
  {
    id: 'tws-l216',
    category: 'tws',
    modelNumber: 'L-216',
    productName: 'DRAKE TWS',
    variant: 'ENC',
    rate: 3699,
    active: true
  },
  {
    id: 'tws-l218',
    category: 'tws',
    modelNumber: 'L-218',
    productName: 'ELAN TWS',
    variant: 'ANC + ENC',
    rate: 3999,
    active: true
  },
  {
    id: 'tws-l217',
    category: 'tws',
    modelNumber: 'L-217',
    productName: 'MYRO TWS',
    variant: 'Hybrid ANC + ENC',
    rate: 4499,
    active: true
  },
  {
    id: 'tws-l221',
    category: 'tws',
    modelNumber: 'L-221',
    productName: 'AMBEO TWS',
    variant: 'ANC + ENC',
    rate: 4499,
    active: true
  },
  {
    id: 'tws-l222',
    category: 'tws',
    modelNumber: 'L-222',
    productName: 'CERUS TWS',
    variant: 'Hybrid ANC + ENC',
    rate: 5499,
    active: true
  },

  // ==================================================
  // CATEGORY 7 — NECKBAND & HEADPHONES (91 - 98)
  // ==================================================
  {
    id: 'mic-l250',
    category: 'neckband-headphones',
    modelNumber: 'L-250',
    productName: 'MICRON MICROPHONE',
    variant: 'AI Active Noise Cancellation, Bluetooth 5.4, 30m Range, iPhone & Type-C Jack',
    rate: 3099,
    active: true
  },
  {
    id: 'mic-l251',
    category: 'neckband-headphones',
    modelNumber: 'L-251',
    productName: 'NOISELESS MICROPHONE',
    variant: 'AI Enhanced 68dB Noise Cancellation, 20m Wireless Range, iPhone & Type-C',
    rate: 7999,
    active: true
  },
  {
    id: 'neckband-l261',
    category: 'neckband-headphones',
    modelNumber: 'L-261',
    productName: 'DRAVE NECKBAND',
    variant: 'ENC, Environmental Noise Cancellation, Bluetooth 5.4, 20 Hours Playback, 180mAh',
    rate: 2249,
    active: true
  },
  {
    id: 'neckband-l261-blue',
    category: 'neckband-headphones',
    modelNumber: 'L-261',
    productName: 'DRAVE NECKBAND',
    variant: 'ENC, Environmental Noise Cancellation, Bluetooth 5.4, 20 Hours Playback, 180mAh, Blue',
    rate: 2249,
    active: true
  },
  {
    id: 'headphone-l285',
    category: 'neckband-headphones',
    modelNumber: 'L-285',
    productName: 'RAGNAR HEADPHONE',
    variant: 'RGB Light, AUX 3.5mm + USB, Built-in Mic, 2.1m Cable',
    rate: 3849,
    active: true
  },
  {
    id: 'headphone-l292',
    category: 'neckband-headphones',
    modelNumber: 'L-292',
    productName: 'VELORA PRO HEADPHONE',
    variant: '10 Meter, Dual Device Connectivity, Built-in Mic, 400mAh, TF Card & AUX',
    rate: 2569,
    active: true
  },
  {
    id: 'headphone-l295',
    category: 'neckband-headphones',
    modelNumber: 'L-295',
    productName: 'TUNE EDGE',
    variant: 'ENC, Dual AUX/BT, 10m Distance, Up to 45 Hours, Foldable',
    rate: 3899,
    active: true
  },
  {
    id: 'headphone-l299',
    category: 'neckband-headphones',
    modelNumber: 'L-299',
    productName: 'CALEN',
    variant: 'Hybrid ANC, Dual AUX/BT, 10m Distance, Up to 45 Hours, Foldable',
    rate: 5599,
    active: true
  },

  // ==================================================
  // CATEGORY 8 — SPEAKERS (99 - 113)
  // ==================================================
  {
    id: 'speaker-l273',
    category: 'speakers',
    modelNumber: 'L-273',
    productName: 'REVOK SPEAKER',
    variant: '10W, 6 Hours Playback, Mobile Stand, RGB Lights, USB, TF Card',
    rate: 2249,
    active: true
  },
  {
    id: 'speaker-ltx',
    category: 'speakers',
    modelNumber: 'LT-X SERIES',
    productName: 'CLASSICO SPEAKER',
    variant: 'Wireless Speaker, Rechargeable, Twins Function, Bluetooth',
    rate: 3220,
    active: true
  },
  {
    id: 'speaker-l272',
    category: 'speakers',
    modelNumber: 'L-272',
    productName: 'SOLAR SPEAKER',
    variant: '12W RMS, 2500mAh Battery, Bluetooth, RGB Lights, FM Radio, MMC/USB/AUX',
    rate: 3299,
    active: true
  },
  {
    id: 'speaker-l270',
    category: 'speakers',
    modelNumber: 'L-270',
    productName: 'PREDOX SOUNDBAR',
    variant: '20W Wireless Speaker, Rechargeable, 3600mAh Battery, TF Card/USB/AUX',
    rate: 4349,
    active: true
  },
  {
    id: 'speaker-l274',
    category: 'speakers',
    modelNumber: 'L-274',
    productName: 'VYBEON PARTY SPEAKER',
    variant: '80W RMS, 8000mAh Battery, Bluetooth, RGB Lights, TF Card/USB/AUX',
    rate: 13499,
    active: true
  },
  {
    id: 'speaker-l276',
    category: 'speakers',
    modelNumber: 'L-276',
    productName: 'VIBE OG PARTY SPEAKER',
    variant: '250W RMS, Lithium-Ion Battery, 5.5" Woofer, Bluetooth, USB, AUX, TF Card',
    rate: 19999,
    active: true
  },
  {
    id: 'speaker-l278',
    category: 'speakers',
    modelNumber: 'L-278',
    productName: 'AVANTIS HOME THEATER',
    variant: '2:1 Channel, Dolby Soundbar with Subwoofer, 220W RMS, 3 EQ Modes, LED Display, USB/AUX/Optical/HDMI ARC',
    rate: 25499,
    active: true
  },
  {
    id: 'speaker-l275',
    category: 'speakers',
    modelNumber: 'L-275',
    productName: 'INCEPTION HOME THEATER',
    variant: '2:1 Channel, Soundbar with Subwoofer, 160W RMS, 2.1 16W Bar Speaker, USB/AUX/HDMI ARC',
    rate: 16799,
    active: true
  },
  {
    id: 'speaker-l280',
    category: 'speakers',
    modelNumber: 'L-280',
    productName: 'AVANTIS PRO HOME THEATER',
    variant: '5.1 Channel, Digital Soundbar + Subwoofer + Satellite Speakers, 320W RMS, 3 EQ Modes, LED Display, USB/AUX/HDMI ARC',
    rate: 47099,
    active: true
  },
  {
    id: 'speaker-l264',
    category: 'speakers',
    modelNumber: 'L-264',
    productName: 'RONAQ SPEAKER',
    variant: '8" Woofer, 10W Power, 3.7V/2400mAh Lithium Battery, RGB Lights, Echo Mode, TF Card/USB/AUX',
    rate: 6599,
    active: true
  },
  {
    id: 'speaker-l265',
    category: 'speakers',
    modelNumber: 'L-265',
    productName: 'RONAQ SPEAKER',
    variant: '12" Woofer, 40W Power, 3.7V/2400mAh Lithium Battery, RGB Lights, Echo & Delay, Support TF Card/USB/AUX/Wireless',
    rate: 17499,
    active: true
  },
  {
    id: 'speaker-l266',
    category: 'speakers',
    modelNumber: 'L-266',
    productName: 'RONAQ SPEAKER',
    variant: '15" Woofer, 40W Power, 3.7V/2400mAh Lithium Battery, RGB Lights, Echo & Delay, Support TF Card/USB/AUX/Wireless',
    rate: 23499,
    active: true
  },
  {
    id: 'speaker-l267',
    category: 'speakers',
    modelNumber: 'L-267',
    productName: 'JAMSTER PARTY SPEAKER',
    variant: '6.5" x 2 Woofer, 30W Power, Lithium Battery, RGB Lights, Built-in Echo Control, TF Card/USB/AUX/Wireless',
    rate: null,
    rateDisplay: 'COMING SOON',
    isComingSoon: true,
    active: false
  },
  {
    id: 'speaker-l268',
    category: 'speakers',
    modelNumber: 'L-268',
    productName: 'JAMSTER PRO PARTY SPEAKER',
    variant: '8" x 2 Woofer, 50W Power, Lithium Battery, RGB Lights, Built-in Echo Control, TF Card/USB/AUX/Wireless',
    rate: null,
    rateDisplay: 'COMING SOON',
    isComingSoon: true,
    active: false
  },
  {
    id: 'speaker-l269',
    category: 'speakers',
    modelNumber: 'L-269',
    productName: 'JAMSTER PRIME PARTY SPEAKER',
    variant: '10" x 2 Woofer, 60W Power, Lithium Battery, RGB Lights, Built-in Echo Control, TF Card/USB/AUX/Wireless',
    rate: null,
    rateDisplay: 'COMING SOON',
    isComingSoon: true,
    active: false
  },

  // ==================================================
  // CATEGORY 9 — BATTERIES (69 - 72)
  // (Ordered according to Rule 6: 9. Batteries)
  // ==================================================
  {
    id: 'battery-bl5c',
    category: 'batteries',
    modelNumber: 'BL-5C',
    productName: 'BL-5C BATTERY',
    variant: 'Battery Voltage 3.7V, Charge Voltage 4.2V',
    rate: 319,
    active: true
  },
  {
    id: 'battery-it5c',
    category: 'batteries',
    modelNumber: 'IT-5C',
    productName: 'IT-5C BATTERY',
    variant: 'Battery Voltage 3.7V, Charge Voltage 4.2V',
    rate: 315,
    active: true
  },
  {
    id: 'battery-l851otg-micro',
    category: 'batteries',
    modelNumber: 'L-851 OTG',
    productName: 'OTG',
    variant: 'Plug & Play, Keychain Style, Metallic Design, Micro',
    rate: 295,
    active: true
  },
  {
    id: 'battery-l851otg-ios',
    category: 'batteries',
    modelNumber: 'L-851 OTG',
    productName: 'OTG',
    variant: 'Plug & Play, Keychain Style, Metallic Design, iOS',
    rate: 699,
    active: true
  }
];
