/* ====================================
   HEXSTORE - MODERN MARKETPLACE
   Comprehensive Frontend Logic
   ==================================== */

// Import Authentication Module
import './auth.js';

// PRODUCT DATABASE (100+ ITEMS)
const PRODUCTS = [
  // ELECTRONICS (15)
  {id:1,title:'Wireless Noise-Cancelling Headphones',price:79.99,category:'electronics',brand:'Aurora',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',rating:4.8,reviews:324,prime:true,stock:12,deal:false},
  {id:2,title:'Mechanical Gaming Keyboard RGB',price:129.00,category:'electronics',brand:'KeyHex',img:'https://images.unsplash.com/photo-1587829191301-ad8f47e4b295?w=400&h=400&fit=crop',rating:4.7,reviews:512,prime:true,stock:5,deal:true},
  {id:3,title:'4K Smartwatch Pro',price:199.99,category:'electronics',brand:'TickPro',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',rating:4.6,reviews:289,prime:false,stock:0,deal:false},
  {id:4,title:'Portable SSD 1TB USB-C',price:89.50,category:'electronics',brand:'DataVault',img:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop',rating:4.9,reviews:456,prime:true,stock:18,deal:true},
  {id:5,title:'Bluetooth Speaker Waterproof',price:59.99,category:'electronics',brand:'SoundWave',img:'https://images.unsplash.com/photo-1589003077984-894e133da89d?w=400&h=400&fit=crop',rating:4.5,reviews:678,prime:true,stock:20,deal:false},
  {id:6,title:'Webcam 1080p HD Auto-Focus',price:49.99,category:'electronics',brand:'ViewPro',img:'https://images.unsplash.com/photo-1598133957585-1f996c83b59c?w=400&h=400&fit=crop',rating:4.4,reviews:234,prime:false,stock:8,deal:true},
  {id:7,title:'USB-C Multiport Hub 7-in-1',price:39.99,category:'electronics',brand:'ConnectHub',img:'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',rating:4.3,reviews:412,prime:true,stock:25,deal:false},
  {id:8,title:'Wireless Mouse Ultra Slim',price:24.99,category:'electronics',brand:'Pointer',img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',rating:4.6,reviews:589,prime:false,stock:40,deal:true},
  {id:9,title:'LED Monitor 27 inch 4K IPS',price:349.00,category:'electronics',brand:'Display+',img:'https://images.unsplash.com/photo-1587370560050-e6dc60a2e1bb?w=400&h=400&fit=crop',rating:4.7,reviews:301,prime:true,stock:6,deal:false},
  {id:10,title:'Laptop Stand Adjustable Aluminum',price:34.99,category:'electronics',brand:'ErgoPro',img:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',rating:4.5,reviews:467,prime:false,stock:32,deal:true},
  {id:11,title:'Mechanical Switch Tester Kit',price:15.99,category:'electronics',brand:'KeyHex',img:'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&h=400&fit=crop',rating:4.4,reviews:156,prime:false,stock:50,deal:false},
  {id:12,title:'Phone Mount Car Dashboard',price:12.99,category:'electronics',brand:'Holder',img:'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&h=400&fit=crop',rating:4.3,reviews:823,prime:true,stock:100,deal:true},
  {id:13,title:'USB Type-C Fast Charging Cable',price:8.99,category:'electronics',brand:'CableMax',img:'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',rating:4.6,reviews:945,prime:true,stock:150,deal:false},
  {id:14,title:'Wireless Charging Pad 15W',price:29.99,category:'electronics',brand:'ChargeAir',img:'https://images.unsplash.com/photo-1606933248051-5ce98f1e1cf4?w=400&h=400&fit=crop',rating:4.5,reviews:521,prime:false,stock:35,deal:true},
  {id:15,title:'Power Bank 20000mAh USB-C',price:44.99,category:'electronics',brand:'PowerPack',img:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',rating:4.7,reviews:687,prime:true,stock:28,deal:false},

  // ACCESSORIES (15)
  {id:16,title:'Designer Sunglasses UV Protection',price:49.99,category:'accessories',brand:'SunGlow',img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',rating:4.5,reviews:234,prime:false,stock:22,deal:true},
  {id:17,title:'Leather Crossbody Bag Premium',price:89.99,category:'accessories',brand:'LeatherLux',img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',rating:4.7,reviews:456,prime:true,stock:14,deal:false},
  {id:18,title:'Smartwatch Band Replacement Pack',price:19.99,category:'accessories',brand:'TickPro',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',rating:4.4,reviews:312,prime:false,stock:67,deal:true},
  {id:19,title:'Phone Case Crystal Clear TPU',price:14.99,category:'accessories',brand:'ShellGuard',img:'https://images.unsplash.com/photo-1510812431401-41d2cab2707d?w=400&h=400&fit=crop',rating:4.6,reviews:589,prime:true,stock:89,deal:false},
  {id:20,title:'Laptop Sleeve 15.6 inch Neoprene',price:24.99,category:'accessories',brand:'CarryOn',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',rating:4.5,reviews:401,prime:false,stock:43,deal:true},
  {id:21,title:'Stainless Steel Water Bottle',price:29.99,category:'accessories',brand:'HydroFlow',img:'https://images.unsplash.com/photo-1602143407151-7e36dd6f7d1b?w=400&h=400&fit=crop',rating:4.8,reviews:723,prime:true,stock:55,deal:false},
  {id:22,title:'Headphone Stand Premium Wood',price:34.99,category:'accessories',brand:'DisplayArt',img:'https://images.unsplash.com/photo-1586253408166-edeb126bbd50?w=400&h=400&fit=crop',rating:4.6,reviews:267,prime:false,stock:28,deal:true},
  {id:23,title:'Portable Phone Tripod Adjustable',price:22.99,category:'accessories',brand:'StandPro',img:'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&h=400&fit=crop',rating:4.4,reviews:534,prime:true,stock:41,deal:false},
  {id:24,title:'Wireless Earbud Case Protective',price:18.99,category:'accessories',brand:'PodSafe',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',rating:4.5,reviews:456,prime:false,stock:72,deal:true},
  {id:25,title:'Camera Lens Protective Filter',price:32.99,category:'accessories',brand:'OpticsMax',img:'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=400&h=400&fit=crop',rating:4.7,reviews:312,prime:true,stock:19,deal:false},
  {id:26,title:'Screen Protector Tempered Glass',price:9.99,category:'accessories',brand:'GlassShield',img:'https://images.unsplash.com/photo-1591290621162-4ecb86adad3e?w=400&h=400&fit=crop',rating:4.6,reviews:912,prime:true,stock:128,deal:true},
  {id:27,title:'Desktop Webcam Light Ring',price:44.99,category:'accessories',brand:'LightStudio',img:'https://images.unsplash.com/photo-1598133957585-1f996c83b59c?w=400&h=400&fit=crop',rating:4.5,reviews:478,prime:false,stock:24,deal:false},
  {id:28,title:'Cable Organizer Management Kit',price:16.99,category:'accessories',brand:'OrganizeHub',img:'https://images.unsplash.com/photo-1619983081563-430f63602a1d?w=400&h=400&fit=crop',rating:4.4,reviews:623,prime:true,stock:85,deal:true},
  {id:29,title:'Phone Ring Holder Pop Socket',price:7.99,category:'accessories',brand:'GripPop',img:'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=400&h=400&fit=crop',rating:4.3,reviews:754,prime:false,stock:156,deal:false},
  {id:30,title:'Desk Lamp LED Adjustable Touch',price:52.99,category:'accessories',brand:'BrightAir',img:'https://images.unsplash.com/photo-1565636192335-14e71c4e3df6?w=400&h=400&fit=crop',rating:4.7,reviews:435,prime:true,stock:33,deal:true},

  // HOME & GARDEN (15)
  {id:31,title:'Robot Vacuum Smart Navigation',price:299.99,category:'home',brand:'CleanBot',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',rating:4.6,reviews:567,prime:true,stock:8,deal:true},
  {id:32,title:'Air Purifier HEPA Filter',price:179.99,category:'home',brand:'AirFresh',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',rating:4.7,reviews:412,prime:true,stock:12,deal:false},
  {id:33,title:'Coffee Maker Automatic Grind',price:89.99,category:'home',brand:'BrewMaster',img:'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400&h=400&fit=crop',rating:4.5,reviews:523,prime:false,stock:18,deal:true},
  {id:34,title:'Electric Kettle 1.7L Stainless',price:34.99,category:'home',brand:'HotWater',img:'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop',rating:4.4,reviews:678,prime:true,stock:42,deal:false},
  {id:35,title:'Humidifier Ultrasonic Quiet',price:44.99,category:'home',brand:'MistAir',img:'https://images.unsplash.com/photo-1619983081563-430f63602a1d?w=400&h=400&fit=crop',rating:4.6,reviews:345,prime:false,stock:31,deal:true},
  {id:36,title:'Smart Thermostat Learning WiFi',price:249.99,category:'home',brand:'TempControl',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',rating:4.8,reviews:289,prime:true,stock:9,deal:false},
  {id:37,title:'Bed Pillow Memory Foam',price:59.99,category:'home',brand:'SleepLux',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',rating:4.7,reviews:456,prime:false,stock:24,deal:true},
  {id:38,title:'Shower Head Rain Rainfall',price:29.99,category:'home',brand:'WaterFlow',img:'https://images.unsplash.com/photo-1584589180426-96b47ef9f5cc?w=400&h=400&fit=crop',rating:4.5,reviews:523,prime:true,stock:51,deal:false},
  {id:39,title:'Smart LED Light Bulb RGB',price:19.99,category:'home',brand:'LightSmart',img:'https://images.unsplash.com/photo-1582519539573-d01097c6e1d0?w=400&h=400&fit=crop',rating:4.6,reviews:734,prime:true,stock:78,deal:true},
  {id:40,title:'Plant Pot with Saucer Ceramic',price:24.99,category:'home',brand:'PlantHome',img:'https://images.unsplash.com/photo-1611462985358-edf3763326e8?w=400&h=400&fit=crop',rating:4.4,reviews:389,prime:false,stock:67,deal:false},
  {id:41,title:'Bath Mat Non-Slip Memory Foam',price:22.99,category:'home',brand:'ComfortBath',img:'https://images.unsplash.com/photo-1584589180426-96b47ef9f5cc?w=400&h=400&fit=crop',rating:4.5,reviews:612,prime:true,stock:43,deal:true},
  {id:42,title:'Kitchen Scale Digital Precision',price:18.99,category:'home',brand:'MeasurePro',img:'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop',rating:4.3,reviews:467,prime:false,stock:56,deal:false},
  {id:43,title:'Door Lock Smart Digital',price:139.99,category:'home',brand:'SecureLock',img:'https://images.unsplash.com/photo-1560697529-d534a5ec0f0e?w=400&h=400&fit=crop',rating:4.7,reviews:234,prime:true,stock:11,deal:true},
  {id:44,title:'Storage Organizer Drawer Set',price:39.99,category:'home',brand:'OrganizeHome',img:'https://images.unsplash.com/photo-1584589180426-96b47ef9f5cc?w=400&h=400&fit=crop',rating:4.4,reviews:523,prime:false,stock:38,deal:false},
  {id:45,title:'Wall-Mounted Shelf Floating',price:44.99,category:'home',brand:'ShelfPro',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',rating:4.6,reviews:401,prime:true,stock:29,deal:true},

  // FASHION (15)
  {id:46,title:'Casual Cotton T-Shirt Unisex',price:19.99,category:'fashion',brand:'ThreadWear',img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',rating:4.5,reviews:892,prime:false,stock:156,deal:true},
  {id:47,title:'Skinny Jeans Stretch Denim',price:49.99,category:'fashion',brand:'DenimCo',img:'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=400&fit=crop',rating:4.6,reviews:567,prime:true,stock:67,deal:false},
  {id:48,title:'Sports Training Hoodie Breathable',price:59.99,category:'fashion',brand:'SportFit',img:'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop',rating:4.7,reviews:678,prime:true,stock:45,deal:true},
  {id:49,title:'Casual Sneakers White Leather',price:79.99,category:'fashion',brand:'StepPro',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',rating:4.8,reviews:723,prime:false,stock:38,deal:false},
  {id:50,title:'Winter Jacket Insulated Puffer',price:129.99,category:'fashion',brand:'WarmCoat',img:'https://images.unsplash.com/photo-1539533057440-7a601feb64b4?w=400&h=400&fit=crop',rating:4.6,reviews:434,prime:true,stock:22,deal:true},
  {id:51,title:'Yoga Pants High-Waist Stretchy',price:54.99,category:'fashion',brand:'YogaFlex',img:'https://images.unsplash.com/photo-1506629082632-08fbc93e1d8d?w=400&h=400&fit=crop',rating:4.7,reviews:567,prime:false,stock:51,deal:false},
  {id:52,title:'Summer Shorts Cotton Linen',price:34.99,category:'fashion',brand:'SummerWear',img:'https://images.unsplash.com/photo-1517799627540-681864805188?w=400&h=400&fit=crop',rating:4.4,reviews:412,prime:true,stock:73,deal:true},
  {id:53,title:'Polo Shirt Classic Golf',price:39.99,category:'fashion',brand:'ClassicWear',img:'https://images.unsplash.com/photo-1535418749846-146d61c56e49?w=400&h=400&fit=crop',rating:4.5,reviews:523,prime:false,stock:88,deal:false},
  {id:54,title:'Beanie Winter Hat Knitted',price:16.99,category:'fashion',brand:'WinterGear',img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',rating:4.3,reviews:645,prime:true,stock:124,deal:true},
  {id:55,title:'Scarf Wool Checkered Pattern',price:29.99,category:'fashion',brand:'ScarfStyle',img:'https://images.unsplash.com/photo-1572535967840-ded4a9ef309a?w=400&h=400&fit=crop',rating:4.4,reviews:378,prime:false,stock:42,deal:false},
  {id:56,title:'Dress Cocktail Black Elegant',price:89.99,category:'fashion',brand:'ElegantWear',img:'https://images.unsplash.com/photo-1595777707802-221b37b3e459?w=400&h=400&fit=crop',rating:4.7,reviews:289,prime:true,stock:19,deal:true},
  {id:57,title:'Blazer Formal Professional Fit',price:99.99,category:'fashion',brand:'FormalWear',img:'https://images.unsplash.com/photo-1591047990052-dd4a9ec8ab5b?w=400&h=400&fit=crop',rating:4.6,reviews:456,prime:false,stock:26,deal:false},
  {id:58,title:'Belt Leather Premium Quality',price:34.99,category:'fashion',brand:'LeatherPro',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',rating:4.5,reviews:534,prime:true,stock:61,deal:true},
  {id:59,title:'Socks Cotton Athletic Pack',price:12.99,category:'fashion',brand:'SockCo',img:'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop',rating:4.4,reviews:812,prime:false,stock:201,deal:false},
  {id:60,title:'Gloves Leather Winter Driving',price:44.99,category:'fashion',brand:'GlovePro',img:'https://images.unsplash.com/photo-1582093236149-48b87b1dddd3?w=400&h=400&fit=crop',rating:4.6,reviews:367,prime:true,stock:35,deal:true},

  // TOYS & GAMES (15)
  {id:61,title:'Building Blocks Set 1000 Pieces',price:34.99,category:'toys',brand:'BlockFun',img:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',rating:4.7,reviews:567,prime:true,stock:28,deal:true},
  {id:62,title:'Remote Control Car 4WD Racing',price:49.99,category:'toys',brand:'RacePro',img:'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=400&fit=crop',rating:4.6,reviews:445,prime:false,stock:19,deal:false},
  {id:63,title:'Puzzle 3D Wooden Mechanical',price:24.99,category:'toys',brand:'PuzzleArt',img:'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400&h=400&fit=crop',rating:4.5,reviews:312,prime:true,stock:42,deal:true},
  {id:64,title:'Board Game Strategy Family Pack',price:29.99,category:'toys',brand:'GameHub',img:'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop',rating:4.4,reviews:278,prime:false,stock:33,deal:false},
  {id:65,title:'Action Figures Marvel Heroes',price:14.99,category:'toys',brand:'HeroFigures',img:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',rating:4.3,reviews:523,prime:true,stock:67,deal:true},
  {id:66,title:'Drone Mini 4K Camera Flight',price:199.99,category:'toys',brand:'DroneFly',img:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',rating:4.8,reviews:234,prime:true,stock:12,deal:false},
  {id:67,title:'Telescope Refractor Beginner',price:79.99,category:'toys',brand:'SkyWatch',img:'https://images.unsplash.com/photo-1617638924537-cf2a38c49f77?w=400&h=400&fit=crop',rating:4.6,reviews:189,prime:false,stock:15,deal:true},
  {id:68,title:'Skateboard Complete Setup',price:59.99,category:'toys',brand:'SkateLife',img:'https://images.unsplash.com/photo-1579346579812-07a9d9fe0855?w=400&h=400&fit=crop',rating:4.5,reviews:367,prime:true,stock:24,deal:false},
  {id:69,title:'Yo-Yo Professional Spinning',price:16.99,category:'toys',brand:'SpinMaster',img:'https://images.unsplash.com/photo-1615735684344-e58944350da1?w=400&h=400&fit=crop',rating:4.2,reviews:245,prime:false,stock:89,deal:true},
  {id:70,title:'Playing Cards Magic Illusion',price:9.99,category:'toys',brand:'MagicDeck',img:'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop',rating:4.1,reviews:134,prime:true,stock:156,deal:false},
  {id:71,title:'Slime Kit DIY Colorful Pack',price:19.99,category:'toys',brand:'SlimeFun',img:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',rating:4.4,reviews:712,prime:false,stock:103,deal:true},
  {id:72,title:'Bubble Machine Automatic Fun',price:22.99,category:'toys',brand:'BubbleJoy',img:'https://images.unsplash.com/photo-1575926511687-a9df6f02c0d7?w=400&h=400&fit=crop',rating:4.3,reviews:478,prime:true,stock:45,deal:false},
  {id:73,title:'Kite Flying Sports Outdoor',price:17.99,category:'toys',brand:'SkyFloat',img:'https://images.unsplash.com/photo-1524951162554-4b4e3b64ea28?w=400&h=400&fit=crop',rating:4.2,reviews:256,prime:false,stock:38,deal:true},
  {id:74,title:'Frisbee Disc Sports Game',price:11.99,category:'toys',brand:'DiscFly',img:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',rating:4.0,reviews:189,prime:true,stock:72,deal:false},
  {id:75,title:'Card Game Collection Deck',price:14.99,category:'toys',brand:'GameCards',img:'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop',rating:4.3,reviews:401,prime:false,stock:85,deal:true},

  // BOOKS (15)
  {id:76,title:'Psychology Best Sellers Fiction',price:16.99,category:'books',brand:'PublishCo',img:'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=400&fit=crop',rating:4.7,reviews:523,prime:true,stock:45,deal:true},
  {id:77,title:'Self-Help Development Hardcover',price:24.99,category:'books',brand:'GrowthPress',img:'https://images.unsplash.com/photo-1503882047612-1355b88f1f1c?w=400&h=400&fit=crop',rating:4.6,reviews:367,prime:false,stock:32,deal:false},
  {id:78,title:'Fantasy Adventure Novel Series',price:18.99,category:'books',brand:'AdventureBooks',img:'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=400&fit=crop',rating:4.8,reviews:612,prime:true,stock:38,deal:true},
  {id:79,title:'Cookbook Recipes Quick Easy',price:22.99,category:'books',brand:'ChefPress',img:'https://images.unsplash.com/photo-1544597223-b1903a4a3f87?w=400&h=400&fit=crop',rating:4.5,reviews:478,prime:false,stock:28,deal:false},
  {id:80,title:'Business Strategy Marketing Guide',price:32.99,category:'books',brand:'BusinessMind',img:'https://images.unsplash.com/photo-1520126301-95f2ccf9e7c9?w=400&h=400&fit=crop',rating:4.6,reviews:234,prime:true,stock:19,deal:true},
  {id:81,title:'Science Education Textbook',price:44.99,category:'books',brand:'EduPress',img:'https://images.unsplash.com/photo-1560998089-fbf93cb64e76?w=400&h=400&fit=crop',rating:4.4,reviews:178,prime:false,stock:25,deal:false},
  {id:82,title:'History Biography Documented',price:28.99,category:'books',brand:'HistoryPress',img:'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=400&fit=crop',rating:4.5,reviews:289,prime:true,stock:31,deal:true},
  {id:83,title:'Poetry Collection Verses Art',price:19.99,category:'books',brand:'ArtPress',img:'https://images.unsplash.com/photo-1507842047612-1355b88f1f1c?w=400&h=400&fit=crop',rating:4.3,reviews:156,prime:false,stock:42,deal:false},
  {id:84,title:'Children Picture Stories Learning',price:12.99,category:'books',brand:'KidsPress',img:'https://images.unsplash.com/photo-1527892220146-c8b8b4a55cc0?w=400&h=400&fit=crop',rating:4.6,reviews:734,prime:true,stock:89,deal:true},
  {id:85,title:'Mystery Thriller Suspense Novel',price:15.99,category:'books',brand:'ThrillerPress',img:'https://images.unsplash.com/photo-1522869635100-ce33e55acbb2?w=400&h=400&fit=crop',rating:4.7,reviews:445,prime:false,stock:36,deal:false},
  {id:86,title:'Romance Love Story Paperback',price:14.99,category:'books',brand:'RomancePress',img:'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=400&fit=crop',rating:4.5,reviews:612,prime:true,stock:48,deal:true},
  {id:87,title:'Art Drawing Techniques Guide',price:29.99,category:'books',brand:'ArtPress',img:'https://images.unsplash.com/photo-1519903981149-8d4e4adc8e53?w=400&h=400&fit=crop',rating:4.4,reviews:234,prime:false,stock:22,deal:false},
  {id:88,title:'Technology Programming Manual',price:39.99,category:'books',brand:'TechPress',img:'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=400&fit=crop',rating:4.6,reviews:378,prime:true,stock:27,deal:true},
  {id:89,title:'Adventure Travel Guide Explore',price:23.99,category:'books',brand:'TravelPress',img:'https://images.unsplash.com/photo-1521995698917-ea96ac9c3176?w=400&h=400&fit=crop',rating:4.5,reviews:301,prime:false,stock:33,deal:false},
  {id:90,title:'Journal Notebook Diary Writing',price:11.99,category:'books',brand:'WritePress',img:'https://images.unsplash.com/photo-1507842047612-1355b88f1f1c?w=400&h=400&fit=crop',rating:4.3,reviews:567,prime:true,stock:126,deal:true},

  // SPORTS (15)
  {id:91,title:'Yoga Mat Exercise Non-Slip',price:29.99,category:'sports',brand:'YogaPro',img:'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=400&fit=crop',rating:4.6,reviews:523,prime:true,stock:34,deal:true},
  {id:92,title:'Dumbbell Set Adjustable Weight',price:89.99,category:'sports',brand:'FitGear',img:'https://images.unsplash.com/photo-1583113479897-c0327b72ee94?w=400&h=400&fit=crop',rating:4.7,reviews:445,prime:false,stock:16,deal:false},
  {id:93,title:'Resistance Band Loop Set',price:19.99,category:'sports',brand:'FitBand',img:'https://images.unsplash.com/photo-1606126613408-eca07e8b319f?w=400&h=400&fit=crop',rating:4.5,reviews:612,prime:true,stock:67,deal:true},
  {id:94,title:'Fitness Tracker Heart Rate',price:99.99,category:'sports',brand:'HealthFit',img:'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=400&h=400&fit=crop',rating:4.6,reviews:378,prime:true,stock:22,deal:false},
  {id:95,title:'Jump Rope Speed Training',price:16.99,category:'sports',brand:'RopeFit',img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',rating:4.4,reviews:534,prime:false,stock:54,deal:true},
  {id:96,title:'Basketball Official Size',price:34.99,category:'sports',brand:'SportBall',img:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',rating:4.5,reviews:289,prime:true,stock:28,deal:false},
  {id:97,title:'Soccer Ball Premium Quality',price:39.99,category:'sports',brand:'GoalPro',img:'https://images.unsplash.com/photo-1516342152079-7db751c000e4?w=400&h=400&fit=crop',rating:4.6,reviews:234,prime:false,stock:19,deal:true},
  {id:98,title:'Tennis Racket Grip Handle',price:59.99,category:'sports',brand:'TennisMax',img:'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400&h=400&fit=crop',rating:4.4,reviews:167,prime:true,stock:25,deal:false},
  {id:99,title:'Swimming Goggles Anti-Fog',price:22.99,category:'sports',brand:'SwimGear',img:'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop',rating:4.3,reviews:401,prime:false,stock:43,deal:true},
  {id:100,title:'Cycling Helmet Safety Protected',price:64.99,category:'sports',brand:'CycleSafe',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',rating:4.7,reviews:312,prime:true,stock:31,deal:false},
  {id:101,title:'Golf Clubs Starter Set',price:149.99,category:'sports',brand:'GolfPro',img:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',rating:4.5,reviews:178,prime:false,stock:12,deal:true},
  {id:102,title:'Running Shoes Comfort Cushion',price:94.99,category:'sports',brand:'RunFast',img:'https://images.unsplash.com/photo-1524707267537-b5cf006fbb48?w=400&h=400&fit=crop',rating:4.8,reviews:623,prime:true,stock:38,deal:false},
  {id:103,title:'Baseball Glove Leather',price:79.99,category:'sports',brand:'PlayBall',img:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',rating:4.4,reviews:245,prime:false,stock:20,deal:true},
  {id:104,title:'Boxing Gloves Training Pair',price:54.99,category:'sports',brand:'FightGear',img:'https://images.unsplash.com/photo-1549719386-74dfb77c988e?w=400&h=400&fit=crop',rating:4.6,reviews:456,prime:true,stock:33,deal:false},
  {id:105,title:'Skateboard Wheels Bearings Set',price:32.99,category:'sports',brand:'SkateWheels',img:'https://images.unsplash.com/photo-1579346579812-07a9d9fe0855?w=400&h=400&fit=crop',rating:4.3,reviews:389,prime:false,stock:51,deal:true},
];

// STATE MANAGEMENT
let state = {
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'relevance',
  priceMax: 1000,
  filterPrime: false,
  filterInStock: false,
  filterDeals: false,
  filterRating: 0,
  cart: JSON.parse(localStorage.getItem('hs_cart') || '{}'),
  favorites: JSON.parse(localStorage.getItem('hs_favorites') || '[]'),
  currentCarouselSlide: 0,
};

// UTILITY FUNCTIONS
function $(id) { return document.getElementById(id); }
function $$(...selectors) { return selectors.map(s => $(s)); }
function showToast(msg, type = 'success') {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatPrice(v) { return '$' + parseFloat(v).toFixed(2); }
function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

// CAROUSEL FUNCTIONALITY
function initCarousel() {
  const slides = $('carousel-slides');
  const indicators = $('carousel-indicators');
  const slideCount = slides.children.length;
  
  // Create indicators
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('div');
    dot.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(i);
    indicators.appendChild(dot);
  }
  
  window.goToSlide = (index) => {
    state.currentCarouselSlide = index;
    slides.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.carousel-indicator').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  };
  
  window.nextSlide = () => {
    state.currentCarouselSlide = (state.currentCarouselSlide + 1) % slideCount;
    goToSlide(state.currentCarouselSlide);
  };
  
  window.prevSlide = () => {
    state.currentCarouselSlide = (state.currentCarouselSlide - 1 + slideCount) % slideCount;
    goToSlide(state.currentCarouselSlide);
  };
  
  $('carousel-next').onclick = nextSlide;
  $('carousel-prev').onclick = prevSlide;
  
  // Auto-play carousel
  setInterval(nextSlide, 5000);
}

// PRODUCT FILTERING & SORTING
function getFilteredProducts() {
  let filtered = PRODUCTS.filter(p => {
    if (state.selectedCategory !== 'all' && p.category !== state.selectedCategory) return false;
    if (state.filterPrime && !p.prime) return false;
    if (state.filterInStock && p.stock <= 0) return false;
    if (state.filterDeals && !p.deal) return false;
    if (state.priceMax && p.price > state.priceMax) return false;
    if (state.filterRating && p.rating < state.filterRating) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });
  
  // SORTING
  switch (state.sortBy) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    case 'newest': filtered.sort((a, b) => b.id - a.id); break;
    case 'popular': filtered.sort((a, b) => b.reviews - a.reviews); break;
  }
  
  return filtered;
}

// RENDER PRODUCTS GRID
function renderProducts(products = getFilteredProducts()) {
  const grid = $('products-grid');
  grid.innerHTML = '';
  $('results-count').textContent = products.length;
  
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const isFavorited = state.favorites.includes(p.id);
    const discount = p.deal ? Math.round((p.price * 0.1) / 5) * 5 : 0;
    
    card.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${p.img}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x400?text=${p.title}'">
        ${p.prime ? '<span class="product-badge prime"><i class="fas fa-flash"></i> PRIME</span>' : ''}
        ${p.deal ? '<span class="product-badge deal">-' + discount + '%</span>' : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-title">${p.title}</div>
        <div class="product-rating">${getStars(p.rating)} ${p.rating} (${p.reviews} reviews)</div>
        <div class="product-price">
          ${formatPrice(p.price)}
          ${p.deal ? '<span class="product-original-price">' + formatPrice(p.price * 1.15) + '</span>' : ''}
          ${p.deal ? '<span class="product-savings">Save ' + discount + '%</span>' : ''}
        </div>
        <div class="product-meta">
          <span><i class="fas fa-${p.stock > 0 ? 'check' : 'times'}-circle"></i> ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
          ${p.prime ? '<span><i class="fas fa-bolt"></i> Free Shipping</span>' : ''}
        </div>
        <div class="product-actions">
          <button class="btn btn-primary" onclick="addToCart(${p.id})">
            <i class="fas fa-shopping-cart"></i> Add
          </button>
          <button class="btn btn-favorite ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite(${p.id})" title="Add to Favorites">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// FEATURED PRODUCTS CAROUSEL
function renderFeatured() {
  const featured = $('featured-carousel');
  featured.innerHTML = '';
  const bestSellers = getFilteredProducts().sort((a, b) => b.reviews - a.reviews).slice(0, 10);
  
  bestSellers.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${p.img}" alt="${p.title}">
        ${p.prime ? '<span class="product-badge prime"><i class="fas fa-flash"></i> PRIME</span>' : ''}
      </div>
      <div class="product-info">
        <div class="product-title">${p.title}</div>
        <div class="product-rating">${getStars(p.rating)}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <div class="product-actions">
          <button class="btn btn-primary" onclick="addToCart(${p.id})" style="width: 100%;">
            <i class="fas fa-shopping-cart"></i> Add
          </button>
        </div>
      </div>
    `;
    featured.appendChild(card);
  });
}

// CART MANAGEMENT
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  if (!state.cart[productId]) {
    state.cart[productId] = { ...product, quantity: 0 };
  }
  state.cart[productId].quantity++;
  localStorage.setItem('hs_cart', JSON.stringify(state.cart));
  updateCartUI();
  showToast(`${product.title} added to cart!`, 'success');
}

function removeFromCart(productId) {
  delete state.cart[productId];
  localStorage.setItem('hs_cart', JSON.stringify(state.cart));
  updateCartUI();
}

function updateQuantity(productId, change) {
  if (state.cart[productId]) {
    state.cart[productId].quantity += change;
    if (state.cart[productId].quantity <= 0) {
      removeFromCart(productId);
    } else {
      localStorage.setItem('hs_cart', JSON.stringify(state.cart));
      updateCartUI();
    }
  }
}

function updateCartUI() {
  const items = Object.values(state.cart);
  const cartItems = $('cart-items');
  const cartEmpty = document.querySelector('.cart-empty');
  const cartBadge = $('cart-badge');
  
  cartBadge.textContent = items.length;
  
  if (items.length === 0) {
    cartItems.style.display = 'none';
    cartEmpty.classList.add('show');
  } else {
    cartItems.style.display = 'flex';
    cartEmpty.classList.remove('show');
    cartItems.innerHTML = items.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
            <div class="quantity-display">${item.quantity}</div>
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;
  
  $('cart-subtotal').textContent = formatPrice(subtotal);
  $('cart-shipping').textContent = formatPrice(shipping);
  $('cart-total').textContent = formatPrice(total);
}

// FAVORITES
function toggleFavorite(productId) {
  const idx = state.favorites.indexOf(productId);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    showToast('Removed from favorites', 'success');
  } else {
    state.favorites.push(productId);
    showToast('Added to favorites!', 'success');
  }
  localStorage.setItem('hs_favorites', JSON.stringify(state.favorites));
  renderProducts();
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  renderProducts();
  renderFeatured();
  updateCartUI();
  
  // Category navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedCategory = btn.dataset.category;
      renderProducts();
      renderFeatured();
    };
  });
  
  // Search
  $('search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderProducts();
  });
  
  // Sort
  $('sort-select').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderProducts();
  });
  
  // Price filter
  $('filter-price').addEventListener('input', (e) => {
    state.priceMax = parseFloat(e.target.value);
    $('price-value').textContent = formatPrice(state.priceMax);
    renderProducts();
  });
  
  // Checkbox filters
  $('filter-prime').addEventListener('change', (e) => {
    state.filterPrime = e.target.checked;
    renderProducts();
  });
  
  $('filter-instock').addEventListener('change', (e) => {
    state.filterInStock = e.target.checked;
    renderProducts();
  });
  
  $('filter-deals').addEventListener('change', (e) => {
    state.filterDeals = e.target.checked;
    renderProducts();
  });
  
  // Category filters
  document.querySelectorAll('.category-filter').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checked = Array.from(document.querySelectorAll('.category-filter:checked')).map(c => c.value);
      if (checked.includes('all')) {
        state.selectedCategory = 'all';
      } else if (checked.length > 0) {
        state.selectedCategory = checked[0];
      }
      renderProducts();
    });
  });
  
  // Rating filter
  document.querySelectorAll('input[name="rating"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.filterRating = parseFloat(e.target.value);
      renderProducts();
    });
  });
  
  // Clear filters
  $('clear-filters').onclick = () => {
    state.priceMax = 1000;
    state.filterPrime = false;
    state.filterInStock = false;
    state.filterDeals = false;
    state.filterRating = 0;
    state.searchQuery = '';
    state.selectedCategory = 'all';
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => i.checked = false);
    $('filter-price').value = 1000;
    $('search-input').value = '';
    $('price-value').textContent = '$1000';
    renderProducts();
    renderFeatured();
  };
  
  // Cart drawer
  const cartDrawer = $('cart-drawer');
  const cartOverlay = $('cart-overlay');
  
  $('cart-btn').addEventListener('click', () => {
    cartDrawer.classList.remove('hidden');
    cartOverlay.classList.remove('hidden');
  });
  
  $('close-cart').addEventListener('click', () => {
    cartDrawer.classList.add('hidden');
    cartOverlay.classList.add('hidden');
  });
  
  cartOverlay.addEventListener('click', () => {
    cartDrawer.classList.add('hidden');
    cartOverlay.classList.add('hidden');
  });
  
  // Checkout
  $('checkout-btn').addEventListener('click', () => {
    const items = Object.values(state.cart).length;
    if (items === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }
    showToast(`Order placed with ${items} item(s)! Thank you for shopping!`, 'success');
    state.cart = {};
    localStorage.setItem('hs_cart', JSON.stringify(state.cart));
    updateCartUI();
    setTimeout(() => {
      cartDrawer.classList.add('hidden');
      cartOverlay.classList.add('hidden');
    }, 1500);
  });
  
  // Account button
  $('account-btn').addEventListener('click', () => {
    showToast('Please sign in to your HexStore account', 'success');
  });
  
  // Favorites button
  $('favorites-btn').addEventListener('click', () => {
    const favorited = PRODUCTS.filter(p => state.favorites.includes(p.id));
    if (favorited.length === 0) {
      showToast('No favorites yet. Start adding!', 'warning');
    } else {
      showToast(`${favorited.length} favorite(s) in your list`, 'success');
    }
  });
});

