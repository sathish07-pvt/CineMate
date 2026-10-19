// TMDB Service Layer with live API integration, regional language discover, rankings, and curated catalog
import prisma from '../config/prisma.js';

export interface MovieItem {
  id: number;
  title: string;
  name?: string; // For TV shows
  original_title?: string;
  original_language?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  director?: string;
  cast?: { id: number; name: string; character: string; profile_path: string | null }[];
  trailerKey?: string;
  rank?: number;
  ott_release_date?: string;
  ott_provider_name?: string;
  providers?: {
    link?: string;
    flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
    rent?: { provider_id: number; provider_name: string; logo_path: string }[];
    buy?: { provider_id: number; provider_name: string; logo_path: string }[];
  };
}

export const SUPPORTED_LANGUAGES = [
  { code: 'all', name: 'All Languages', nativeName: 'Global', flag: '🌐', industry: 'International' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', industry: 'Kollywood' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', industry: 'Tollywood' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', industry: 'Mollywood' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', industry: 'Sandalwood' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', industry: 'Bollywood' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', industry: 'Hollywood' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', industry: 'Tollywood (Bengali)' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', industry: 'Marathi Cinema' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', industry: 'Pollywood' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', industry: 'Anime & Cinema' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', industry: 'K-Cinema & K-Drama' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', industry: 'Hispanic Cinema' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', industry: 'French Cinema' },
];

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Curated high-fidelity catalog across global and regional film industries
export const CURATED_CATALOG: MovieItem[] = [
  // --- TAMIL CINEMA (KOLLYWOOD) ---
  {
    id: 1072790,
    title: 'Leo',
    original_title: 'Leo',
    original_language: 'ta',
    overview: 'Parthiban is a mild-mannered cafe owner in Theog, Himachal Pradesh, who fends off a gang of armed robbers to protect his family. His sudden bravery thrusts him into the media spotlight, drawing the attention of ruthless drug lords Antony and Harold Das who believe he is their estranged son, Leo Das.',
    poster_path: '/bcl5T2n8fBshV47tJ8w1k16kR27.jpg',
    backdrop_path: '/yOMgh9xM5zPZk1xYVqK7Y4vYd3K.jpg',
    release_date: '2023-10-19',
    vote_average: 7.4,
    vote_count: 520,
    media_type: 'movie',
    genre_ids: [28, 80, 53],
    genres: [{ id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }],
    runtime: 164,
    tagline: 'Bloody Sweet',
    director: 'Lokesh Kanagaraj',
    cast: [
      { id: 88478, name: 'Thalapathy Vijay', character: 'Parthiban / Leo Das', profile_path: '/hK0s6n8FfLh9P.jpg' },
      { id: 110996, name: 'Trisha Krishnan', character: 'Sathya Parthiban', profile_path: '/1R7jE3G6u5T.jpg' },
      { id: 58853, name: 'Sanjay Dutt', character: 'Antony Das', profile_path: '/8lE8G7s9V.jpg' },
      { id: 107293, name: 'Arjun Sarja', character: 'Harold Das', profile_path: '/arjun.jpg' },
      { id: 1253810, name: 'Anirudh Ravichander', character: 'Music Composer', profile_path: '/anirudh.jpg' }
    ],
    trailerKey: 'Po3jStA673E',
    ott_release_date: '2023-11-24',
    ott_provider_name: 'Netflix',
    providers: {
      link: 'https://www.netflix.com/title/81639886',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },
  {
    id: 864692,
    title: 'Vikram',
    original_title: 'Vikram',
    original_language: 'ta',
    overview: 'Members of a black-ops squad led by Amar track down a masked vigilante group responsible for a string of political assassinations, leading to an undercover kingpin named Santhanam and the legendary commander Vikram.',
    poster_path: '/4u0vA5T8Z9L4X7kVikram.jpg',
    backdrop_path: '/7IiTTgloJzvGI1VikramBack.jpg',
    release_date: '2022-06-03',
    vote_average: 8.1,
    vote_count: 680,
    media_type: 'movie',
    genre_ids: [28, 53, 80],
    genres: [{ id: 28, name: 'Action' }, { id: 53, name: 'Thriller' }, { id: 80, name: 'Crime' }],
    runtime: 175,
    tagline: 'Eagle is Coming',
    director: 'Lokesh Kanagaraj',
    cast: [
      { id: 54407, name: 'Kamal Haasan', character: 'Agent Vikram / Karnan', profile_path: '/kamal.jpg' },
      { id: 118471, name: 'Fahadh Faasil', character: 'Amar', profile_path: '/fahadh.jpg' },
      { id: 137452, name: 'Vijay Sethupathi', character: 'Santhanam', profile_path: '/vjs.jpg' },
      { id: 118151, name: 'Suriya', character: 'Rolex (Cameo)', profile_path: '/suriya.jpg' }
    ],
    trailerKey: 'OKBMCLzuvck',
    ott_release_date: '2022-07-08',
    ott_provider_name: 'Disney+ Hotstar',
    providers: {
      link: 'https://www.hotstar.com/movies/vikram',
      flatrate: [
        { provider_id: 122, provider_name: 'Disney+ Hotstar', logo_path: '/hotstar.jpg' }
      ]
    }
  },
  {
    id: 994108,
    title: 'Jailer',
    original_title: 'Jailer',
    original_language: 'ta',
    overview: 'Muthuvel Pandian, a retired prison jailer living a quiet life with his grandson, is forced to reawaken his ruthless tiger persona when his ACP son goes missing while investigating an antique idol smuggling syndicate.',
    poster_path: '/jaile7R8XgU9y.jpg',
    backdrop_path: '/jailerBackdrop.jpg',
    release_date: '2023-08-10',
    vote_average: 7.3,
    vote_count: 420,
    media_type: 'movie',
    genre_ids: [28, 35, 80],
    genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }],
    runtime: 168,
    tagline: 'Hukum - Tiger Ka Hukum',
    director: 'Nelson Dilipkumar',
    cast: [
      { id: 75231, name: 'Rajinikanth', character: 'Muthuvel Pandian', profile_path: '/rajini.jpg' },
      { id: 104278, name: 'Mohanlal', character: 'Mathew (Cameo)', profile_path: '/mohanlal.jpg' },
      { id: 114512, name: 'Shiva Rajkumar', character: 'Narasimha (Cameo)', profile_path: '/shivaraj.jpg' },
      { id: 1253810, name: 'Anirudh Ravichander', character: 'Music Composer', profile_path: '/anirudh.jpg' }
    ],
    trailerKey: 'Y5BeWdODPqo',
    ott_release_date: '2023-09-07',
    ott_provider_name: 'Amazon Prime Video',
    providers: {
      link: 'https://www.primevideo.com/detail/Jailer',
      flatrate: [
        { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2zhzgTvILbg2v3zAwl.jpg' }
      ]
    }
  },
  {
    id: 833417,
    title: 'Jai Bhim',
    original_title: 'Jai Bhim',
    original_language: 'ta',
    overview: 'When a poor tribal man is falsely accused of robbery and disappears from police custody, his pregnant wife seeks the help of an unyielding human-rights lawyer, Advocate Chandru, who wages a legendary habeas corpus battle.',
    poster_path: '/jaiBhimPoster.jpg',
    backdrop_path: '/jaiBhimBackdrop.jpg',
    release_date: '2021-11-02',
    vote_average: 8.7,
    vote_count: 1400,
    media_type: 'movie',
    genre_ids: [18, 80],
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    runtime: 164,
    tagline: 'No matter how deep the injustice, truth prevails.',
    director: 'T. J. Gnanavel',
    cast: [
      { id: 118151, name: 'Suriya', character: 'Advocate K. Chandru', profile_path: '/suriya.jpg' },
      { id: 247182, name: 'Lijomol Jose', character: 'Sengeni', profile_path: '/lijomol.jpg' },
      { id: 247183, name: 'Manikandan', character: 'Rajakannu', profile_path: '/mani.jpg' }
    ],
    trailerKey: 'Gc6dEDnL8JA',
    ott_release_date: '2021-11-02',
    ott_provider_name: 'Amazon Prime Video',
    providers: {
      link: 'https://www.primevideo.com/detail/Jai-Bhim',
      flatrate: [
        { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2zhzgTvILbg2v3zAwl.jpg' }
      ]
    }
  },
  {
    id: 618588,
    title: 'Ponniyin Selvan: Part I',
    original_title: 'பொன்னியின் செல்வன்: 1',
    original_language: 'ta',
    overview: 'Vandiyathevan sets out to cross the Chola land to deliver a secret message from Crown Prince Aditha Karikalan, unraveling a deadly conspiracy against Emperor Sundara Chola orchestrated by the vengeful Nandini.',
    poster_path: '/ps1Poster.jpg',
    backdrop_path: '/ps1Backdrop.jpg',
    release_date: '2022-09-30',
    vote_average: 7.8,
    vote_count: 510,
    media_type: 'movie',
    genre_ids: [18, 28, 12, 36],
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 36, name: 'History' }],
    runtime: 167,
    tagline: 'The Cholas are coming.',
    director: 'Mani Ratnam',
    cast: [
      { id: 54406, name: 'Chiyaan Vikram', character: 'Aditha Karikalan', profile_path: '/vikram.jpg' },
      { id: 62290, name: 'Aishwarya Rai Bachchan', character: 'Nandini / Mandakini', profile_path: '/aish.jpg' },
      { id: 118150, name: 'Karthi', character: 'Vallavaraiyan Vandiyathevan', profile_path: '/karthi.jpg' },
      { id: 110996, name: 'Trisha Krishnan', character: 'Kundavai', profile_path: '/trisha.jpg' }
    ],
    trailerKey: 'D4qAQYlgZVM',
    ott_release_date: '2022-11-04',
    ott_provider_name: 'Amazon Prime Video',
    providers: {
      link: 'https://www.primevideo.com/detail/Ponniyin-Selvan',
      flatrate: [
        { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2zhzgTvILbg2v3zAwl.jpg' }
      ]
    }
  },

  // --- TELUGU CINEMA (TOLLYWOOD) ---
  {
    id: 579974,
    title: 'RRR',
    original_title: 'రౌద్రం రణం రుధిరం',
    original_language: 'te',
    overview: 'A fictional story about two legendary Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, and their epic fight against the British Raj in 1920s India.',
    poster_path: '/wE0noFU9ETqBM9mB0k2Wk0a9.jpg',
    backdrop_path: '/7py8k4sa0LzYsPzE.jpg',
    release_date: '2022-03-24',
    vote_average: 8.0,
    vote_count: 1600,
    media_type: 'movie',
    genre_ids: [28, 18, 12],
    genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }, { id: 12, name: 'Adventure' }],
    runtime: 187,
    tagline: 'Rise. Roar. Revolt.',
    director: 'S. S. Rajamouli',
    cast: [
      { id: 117765, name: 'N. T. Rama Rao Jr.', character: 'Komaram Bheem', profile_path: '/ntr.jpg' },
      { id: 117766, name: 'Ram Charan', character: 'Alluri Sitarama Raju', profile_path: '/rc.jpg' },
      { id: 11088, name: 'Alia Bhatt', character: 'Sita', profile_path: '/alia.jpg' },
      { id: 350310, name: 'Ajay Devgn', character: 'Venkata Rama Raju', profile_path: '/ajay.jpg' }
    ],
    trailerKey: 'NgBoMJx3800',
    ott_release_date: '2022-05-20',
    ott_provider_name: 'Netflix / Zee5',
    providers: {
      link: 'https://www.netflix.com/title/81476453',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },
  {
    id: 350312,
    title: 'Baahubali 2: The Conclusion',
    original_title: 'బాహుబలి 2: ది కన్‌క్లూజన్',
    original_language: 'te',
    overview: 'When Shiva, the son of Bahubali, learns about his heritage, he begins to look for answers. His story is juxtaposed with past events that unfolded in the Mahishmati Kingdom.',
    poster_path: '/21sC2ass5gU4.jpg',
    backdrop_path: '/baahubaliBackdrop.jpg',
    release_date: '2017-04-28',
    vote_average: 8.2,
    vote_count: 1100,
    media_type: 'movie',
    genre_ids: [28, 12, 14, 18],
    genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }, { id: 18, name: 'Drama' }],
    runtime: 167,
    tagline: 'The boy who became King.',
    director: 'S. S. Rajamouli',
    cast: [
      { id: 117764, name: 'Prabhas', character: 'Amarendra Baahubali / Mahendra Baahubali', profile_path: '/prabhas.jpg' },
      { id: 117767, name: 'Rana Daggubati', character: 'Bhallaladeva', profile_path: '/rana.jpg' },
      { id: 117768, name: 'Anushka Shetty', character: 'Devasena', profile_path: '/anushka.jpg' }
    ],
    trailerKey: 'G62HrubdD6o',
    ott_release_date: '2017-06-15',
    ott_provider_name: 'Disney+ Hotstar',
    providers: {
      link: 'https://www.hotstar.com/movies/baahubali-2',
      flatrate: [
        { provider_id: 122, provider_name: 'Disney+ Hotstar', logo_path: '/hotstar.jpg' }
      ]
    }
  },
  {
    id: 1022789,
    title: 'Kalki 2898 AD',
    original_title: 'కల్కి 2898 AD',
    original_language: 'te',
    overview: 'In a post-apocalyptic world ruled by the immortal Supreme Yaskin in the year 2898 AD, a modern-day avatar of Vishnu descends to protect the pregnant SUM80 and save the universe from darkness.',
    poster_path: '/kalkiPoster.jpg',
    backdrop_path: '/kalkiBackdrop.jpg',
    release_date: '2024-06-27',
    vote_average: 7.5,
    vote_count: 750,
    media_type: 'movie',
    genre_ids: [878, 28, 14],
    genres: [{ id: 878, name: 'Science Fiction' }, { id: 28, name: 'Action' }, { id: 14, name: 'Fantasy' }],
    runtime: 180,
    tagline: 'The Future has Arrived.',
    director: 'Nag Ashwin',
    cast: [
      { id: 117764, name: 'Prabhas', character: 'Bhairava', profile_path: '/prabhas.jpg' },
      { id: 350311, name: 'Amitabh Bachchan', character: 'Ashwatthama', profile_path: '/amitabh.jpg' },
      { id: 54407, name: 'Kamal Haasan', character: 'Supreme Yaskin', profile_path: '/kamal.jpg' },
      { id: 117769, name: 'Deepika Padukone', character: 'SUM-80', profile_path: '/deepika.jpg' }
    ],
    trailerKey: 'kQDd1AhGIHk',
    ott_release_date: '2024-08-22',
    ott_provider_name: 'Netflix / Prime Video',
    providers: {
      link: 'https://www.netflix.com/title/81775798',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },

  // --- MALAYALAM CINEMA (MOLLYWOOD) ---
  {
    id: 1214484,
    title: 'Manjummel Boys',
    original_title: 'മഞ്ഞുമ്മൽ ബോയ്സ്',
    original_language: 'ml',
    overview: 'A group of friends from a small town in Kerala embark on a vacation to Kodaikanal. When one of them falls into the notoriously treacherous Devil\'s Kitchen cave, the ordinary young men mount an extraordinary, selfless rescue mission.',
    poster_path: '/manjummelPoster.jpg',
    backdrop_path: '/manjummelBackdrop.jpg',
    release_date: '2024-02-22',
    vote_average: 8.3,
    vote_count: 580,
    media_type: 'movie',
    genre_ids: [12, 18, 53],
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }],
    runtime: 135,
    tagline: 'Kanmani Anbodu Kaadhalan',
    director: 'Chidambaram',
    cast: [
      { id: 1214485, name: 'Soubin Shahir', character: 'Kuttan', profile_path: '/soubin.jpg' },
      { id: 1214486, name: 'Sreenath Bhasi', character: 'Subhash', profile_path: '/bhasi.jpg' },
      { id: 1214487, name: 'Balu Varghese', character: 'Sixen', profile_path: '/balu.jpg' }
    ],
    trailerKey: 'id8qWJ2r9bY',
    ott_release_date: '2024-05-05',
    ott_provider_name: 'Disney+ Hotstar',
    providers: {
      link: 'https://www.hotstar.com/movies/manjummel-boys',
      flatrate: [
        { provider_id: 122, provider_name: 'Disney+ Hotstar', logo_path: '/hotstar.jpg' }
      ]
    }
  },
  {
    id: 1226578,
    title: 'Aavesham',
    original_title: 'ആവേശം',
    original_language: 'ml',
    overview: 'Three college students in Bangalore looking for protection against college bullies inadvertently strike up a friendship with Ranga, an eccentric, white-clad Malayali gangster with an absurdly loyal crew and a heart of gold.',
    poster_path: '/aaveshamPoster.jpg',
    backdrop_path: '/aaveshamBackdrop.jpg',
    release_date: '2024-04-11',
    vote_average: 8.1,
    vote_count: 490,
    media_type: 'movie',
    genre_ids: [28, 35],
    genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }],
    runtime: 158,
    tagline: 'Eda Mone! Full On Energy',
    director: 'Jithu Madhavan',
    cast: [
      { id: 118471, name: 'Fahadh Faasil', character: 'Ranga', profile_path: '/fahadh.jpg' },
      { id: 1226579, name: 'Hipzster', character: 'Aju', profile_path: '/hipz.jpg' },
      { id: 1226580, name: 'Sajin Gopu', character: 'Amban', profile_path: '/sajin.jpg' }
    ],
    trailerKey: 'L0yEMl8PXnw',
    ott_release_date: '2024-05-09',
    ott_provider_name: 'Amazon Prime Video',
    providers: {
      link: 'https://www.primevideo.com/detail/Aavesham',
      flatrate: [
        { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2zhzgTvILbg2v3zAwl.jpg' }
      ]
    }
  },
  {
    id: 252178,
    title: 'Drishyam',
    original_title: 'ദൃശ്യം',
    original_language: 'ml',
    overview: 'Georgekutty, a humble cable TV operator and movie fanatic, goes to unimaginable lengths to fabricate a seamless alibi and protect his family after an accidental crime threatens to destroy them.',
    poster_path: '/drishyamPoster.jpg',
    backdrop_path: '/drishyamBackdrop.jpg',
    release_date: '2013-12-19',
    vote_average: 8.4,
    vote_count: 980,
    media_type: 'movie',
    genre_ids: [80, 18, 53, 9648],
    genres: [{ id: 80, name: 'Crime' }, { id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }, { id: 9648, name: 'Mystery' }],
    runtime: 160,
    tagline: 'Visuals can be deceptive.',
    director: 'Jeethu Joseph',
    cast: [
      { id: 104278, name: 'Mohanlal', character: 'Georgekutty', profile_path: '/mohanlal.jpg' },
      { id: 104279, name: 'Meena', character: 'Rani George', profile_path: '/meena.jpg' },
      { id: 104280, name: 'Asha Sharath', character: 'Geetha Prabhakar IPS', profile_path: '/asha.jpg' }
    ],
    trailerKey: 'A6Hj2l0vDjg',
    ott_release_date: '2014-04-10',
    ott_provider_name: 'Disney+ Hotstar',
    providers: {
      link: 'https://www.hotstar.com/movies/drishyam',
      flatrate: [
        { provider_id: 122, provider_name: 'Disney+ Hotstar', logo_path: '/hotstar.jpg' }
      ]
    }
  },

  // --- KANNADA CINEMA (SANDALWOOD) ---
  {
    id: 507086,
    title: 'K.G.F: Chapter 2',
    original_title: 'ಕೆ.ಜಿ.ಎಫ್: ಚಾಪ್ಟರ್ 2',
    original_language: 'kn',
    overview: 'The blood-soaked land of Kolar Gold Fields has a new overlord: Rocky, whose name strikes fear into his foes. However, as Rocky asserts his dominance, Adheera and Prime Minister Ramika Sen launch a two-pronged war against him.',
    poster_path: '/kgf2Poster.jpg',
    backdrop_path: '/kgf2Backdrop.jpg',
    release_date: '2022-04-14',
    vote_average: 8.2,
    vote_count: 1200,
    media_type: 'movie',
    genre_ids: [28, 80, 18],
    genres: [{ id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 18, name: 'Drama' }],
    runtime: 168,
    tagline: 'Violence Violence Violence! I Don\'t Like It, I Avoid. But Violence Likes Me!',
    director: 'Prashanth Neel',
    cast: [
      { id: 114513, name: 'Yash', character: 'Raja Krishnappa Bairya / Rocky', profile_path: '/yash.jpg' },
      { id: 58853, name: 'Sanjay Dutt', character: 'Adheera', profile_path: '/sanjay.jpg' },
      { id: 114514, name: 'Raveena Tandon', character: 'Ramika Sen', profile_path: '/raveena.jpg' }
    ],
    trailerKey: 'JKa05nyUmuQ',
    ott_release_date: '2022-05-27',
    ott_provider_name: 'Amazon Prime Video',
    providers: {
      link: 'https://www.primevideo.com/detail/KGF-Chapter-2',
      flatrate: [
        { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2zhzgTvILbg2v3zAwl.jpg' }
      ]
    }
  },
  {
    id: 1024535,
    title: 'Kantara',
    original_title: 'ಕಾಂತಾರ',
    original_language: 'kn',
    overview: 'In a coastal Karnataka village bordering lush forests, a hot-headed rebel named Shiva clashes with a strict forest officer. When greed threatens the sacred forest and its folklore deities, the spirit of Panjurli Daiva awakens.',
    poster_path: '/kantaraPoster.jpg',
    backdrop_path: '/kantaraBackdrop.jpg',
    release_date: '2022-09-30',
    vote_average: 8.1,
    vote_count: 850,
    media_type: 'movie',
    genre_ids: [28, 18, 53, 14],
    genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }, { id: 14, name: 'Fantasy' }],
    runtime: 148,
    tagline: 'A Legend Born of Nature and Myth.',
    director: 'Rishab Shetty',
    cast: [
      { id: 1024536, name: 'Rishab Shetty', character: 'Shiva / Daiva', profile_path: '/rishab.jpg' },
      { id: 1024537, name: 'Sapthami Gowda', character: 'Leela', profile_path: '/sapthami.jpg' },
      { id: 1024538, name: 'Kishore', character: 'Muralidhar (Forest Officer)', profile_path: '/kishore.jpg' }
    ],
    trailerKey: '8mrVmf239GU',
    ott_release_date: '2022-11-24',
    ott_provider_name: 'Netflix / Prime Video',
    providers: {
      link: 'https://www.netflix.com/title/81656709',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },

  // --- HINDI CINEMA (BOLLYWOOD) ---
  {
    id: 1181548,
    title: '12th Fail',
    original_title: '12th Fail',
    original_language: 'hi',
    overview: 'Inspired by the true journey of IPS officer Manoj Kumar Sharma, who overcomes poverty, dishonest academic environments, and personal tribulations to restart his education and conquer the grueling UPSC examination.',
    poster_path: '/12thFailPoster.jpg',
    backdrop_path: '/12thFailBackdrop.jpg',
    release_date: '2023-10-27',
    vote_average: 8.7,
    vote_count: 920,
    media_type: 'movie',
    genre_ids: [18, 36],
    genres: [{ id: 18, name: 'Drama' }, { id: 36, name: 'History' }],
    runtime: 147,
    tagline: 'Restart!',
    director: 'Vidhu Vinod Chopra',
    cast: [
      { id: 1181549, name: 'Vikrant Massey', character: 'Manoj Kumar Sharma', profile_path: '/vikrant.jpg' },
      { id: 1181550, name: 'Medha Shankar', character: 'Shraddha Joshi', profile_path: '/medha.jpg' },
      { id: 1181551, name: 'Anant V Joshi', character: 'Pritam Pandey', profile_path: '/anant.jpg' }
    ],
    trailerKey: 'weSRNM1y61w',
    ott_release_date: '2023-12-29',
    ott_provider_name: 'Disney+ Hotstar',
    providers: {
      link: 'https://www.hotstar.com/movies/12th-fail',
      flatrate: [
        { provider_id: 122, provider_name: 'Disney+ Hotstar', logo_path: '/hotstar.jpg' }
      ]
    }
  },
  {
    id: 872906,
    title: 'Jawan',
    original_title: 'Jawan',
    original_language: 'hi',
    overview: 'A man driven by a personal vendetta to rectify the wrongs in society, while keeping a promise made years ago. He comes up against a monstrous outlaw with no fear, who has caused extreme suffering to many.',
    poster_path: '/jawanPoster.jpg',
    backdrop_path: '/jawanBackdrop.jpg',
    release_date: '2023-09-07',
    vote_average: 7.3,
    vote_count: 510,
    media_type: 'movie',
    genre_ids: [28, 53],
    genres: [{ id: 28, name: 'Action' }, { id: 53, name: 'Thriller' }],
    runtime: 169,
    tagline: 'Ready Chief!',
    director: 'Atlee',
    cast: [
      { id: 350313, name: 'Shah Rukh Khan', character: 'Vikram Rathore / Azad', profile_path: '/srk.jpg' },
      { id: 110997, name: 'Nayanthara', character: 'Narmada Rai', profile_path: '/nayanthara.jpg' },
      { id: 137452, name: 'Vijay Sethupathi', character: 'Kaleeswaran', profile_path: '/vjs.jpg' }
    ],
    trailerKey: 'MWOlnZSnXWE',
    ott_release_date: '2023-11-02',
    ott_provider_name: 'Netflix',
    providers: {
      link: 'https://www.netflix.com/title/81696545',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },
  {
    id: 360814,
    title: 'Dangal',
    original_title: 'दंगल',
    original_language: 'hi',
    overview: 'Former wrestler Mahavir Singh Phogat trains his young daughters Geeta and Babita to become world-class wrestlers, overcoming patriarchy and social prejudices to win India\'s first Commonwealth Games gold.',
    poster_path: '/dangalPoster.jpg',
    backdrop_path: '/dangalBackdrop.jpg',
    release_date: '2016-12-23',
    vote_average: 8.3,
    vote_count: 1400,
    media_type: 'movie',
    genre_ids: [18, 36],
    genres: [{ id: 18, name: 'Drama' }, { id: 36, name: 'History' }],
    runtime: 161,
    tagline: 'Mhaari chhoriyan chhoron se kam hain ke?',
    director: 'Nitesh Tiwari',
    cast: [
      { id: 52583, name: 'Aamir Khan', character: 'Mahavir Singh Phogat', profile_path: '/aamir.jpg' },
      { id: 52584, name: 'Fatima Sana Shaikh', character: 'Geeta Phogat', profile_path: '/fatima.jpg' },
      { id: 52585, name: 'Sanya Malhotra', character: 'Babita Kumari', profile_path: '/sanya.jpg' }
    ],
    trailerKey: 'x_7YlGv9u1g',
    ott_release_date: '2017-03-24',
    ott_provider_name: 'Netflix',
    providers: {
      link: 'https://www.netflix.com/title/80166185',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },

  // --- INTERNATIONAL (HOLLYWOOD / EAST ASIAN) ---
  {
    id: 157336,
    title: 'Interstellar',
    original_title: 'Interstellar',
    original_language: 'en',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 35000,
    media_type: 'movie',
    genre_ids: [12, 18, 878],
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    director: 'Christopher Nolan',
    cast: [
      { id: 10297, name: 'Matthew McConaughey', character: 'Cooper', profile_path: '/e9MaSVqq97svoLn0ENkW7R1b7e2.jpg' },
      { id: 1813, name: 'Anne Hathaway', character: 'Brand', profile_path: '/tLpq59NVun2rV4z6k2q7FfN1ZfJ.jpg' },
      { id: 83002, name: 'Jessica Chastain', character: 'Murph', profile_path: '/vXv4UqHnQeD7M6C5Y6I9J0F7P8.jpg' },
      { id: 3895, name: 'Michael Caine', character: 'Professor Brand', profile_path: '/hZruclwEPCKw3e83bcLmJsbgAlY.jpg' }
    ],
    trailerKey: 'zSWdZVtXT7E',
    ott_release_date: '2015-04-01',
    ott_provider_name: 'Amazon Prime Video',
    providers: {
      link: 'https://www.paramountplus.com',
      flatrate: [
        { provider_id: 8, provider_name: 'Paramount Plus', logo_path: '/fi83B1oztoS47xxcemFdPMvIzK.jpg' },
        { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2zhzgTvILbg2v3zAwl.jpg' }
      ]
    }
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    original_title: 'Dune: Part Two',
    original_language: 'en',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 5500,
    media_type: 'movie',
    genre_ids: [878, 12],
    genres: [{ id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    runtime: 166,
    tagline: 'Long live the fighters.',
    director: 'Denis Villeneuve',
    cast: [
      { id: 1190668, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: '/BE2sdjpgsa2rNTFa66f7ikNVX.jpg' },
      { id: 505710, name: 'Zendaya', character: 'Chani', profile_path: '/r2QfVomC52kE43M0tWj9tQ3G5X.jpg' },
      { id: 934, name: 'Rebecca Ferguson', character: 'Lady Jessica', profile_path: '/4z1Fj1uJ2WwK8n2Q0o8oGzV8L2.jpg' }
    ],
    trailerKey: 'Way9Dexny3w',
    ott_release_date: '2024-05-21',
    ott_provider_name: 'Max / Prime Video',
    providers: {
      link: 'https://www.max.com',
      flatrate: [
        { provider_id: 1899, provider_name: 'Max', logo_path: '/f5F4cRhQp1v12kE4r8XgU9y.jpg' }
      ]
    }
  },
  {
    id: 496243,
    title: 'Parasite',
    original_title: '기생충',
    original_language: 'ko',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 17800,
    media_type: 'movie',
    genre_ids: [35, 53, 18],
    genres: [{ id: 35, name: 'Comedy' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
    runtime: 132,
    tagline: 'Act like you own the place.',
    director: 'Bong Joon-ho',
    cast: [
      { id: 20738, name: 'Song Kang-ho', character: 'Kim Ki-taek', profile_path: '/7.jpg' },
      { id: 1022452, name: 'Lee Sun-kyun', character: 'Park Dong-ik', profile_path: '/2.jpg' }
    ],
    trailerKey: '5xH0R_uxnM8',
    ott_release_date: '2020-04-08',
    ott_provider_name: 'SonyLIV / Prime Video',
    providers: {
      link: 'https://www.hulu.com',
      flatrate: [
        { provider_id: 15, provider_name: 'Hulu', logo_path: '/zxrVSpRL4n5.jpg' }
      ]
    }
  },
  {
    id: 129,
    title: 'Spirited Away',
    original_title: '千と千尋の神隠し',
    original_language: 'ja',
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdrop_path: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 16000,
    media_type: 'movie',
    genre_ids: [16, 10751, 14],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }],
    runtime: 125,
    tagline: 'The tunnel led Chihiro to a mysterious world.',
    director: 'Hayao Miyazaki',
    cast: [
      { id: 19586, name: 'Rumi Hiiragi', character: 'Chihiro Ogino (voice)', profile_path: '/rumi.jpg' },
      { id: 19587, name: 'Miyu Irino', character: 'Haku (voice)', profile_path: '/haku.jpg' }
    ],
    trailerKey: 'ByXuk9QqQkk',
    ott_release_date: '2020-03-01',
    ott_provider_name: 'Netflix',
    providers: {
      link: 'https://www.netflix.com/title/60023642',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },
  {
    id: 155,
    title: 'The Dark Knight',
    original_title: 'The Dark Knight',
    original_language: 'en',
    overview: 'Batman raises the stakes in his war on crime. With the help of allies Lt. Jim Gordon and DA Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 32000,
    media_type: 'movie',
    genre_ids: [18, 28, 80, 53],
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }],
    runtime: 152,
    tagline: 'Why So Serious?',
    director: 'Christopher Nolan',
    cast: [
      { id: 3894, name: 'Christian Bale', character: 'Bruce Wayne / Batman', profile_path: '/b7fTC9WFkgq6o1sbmgcu.jpg' },
      { id: 1810, name: 'Heath Ledger', character: 'Joker', profile_path: '/5Y9HnYYa9jF4Dy5Vp.jpg' }
    ],
    trailerKey: 'EXeTwQWrcwY',
    ott_provider_name: 'JioCinema / Netflix',
    providers: {
      link: 'https://www.netflix.com',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },
  {
    id: 66732,
    title: 'Stranger Things',
    name: 'Stranger Things',
    original_title: 'Stranger Things',
    original_language: 'en',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    first_air_date: '2016-07-15',
    vote_average: 8.6,
    vote_count: 17000,
    media_type: 'tv',
    genre_ids: [18, 9648, 10765],
    genres: [{ id: 18, name: 'Drama' }, { id: 9648, name: 'Mystery' }, { id: 10765, name: 'Sci-Fi & Fantasy' }],
    runtime: 50,
    tagline: 'Every ending has a beginning.',
    director: 'The Duffer Brothers',
    trailerKey: 'b9EkMc79ZSU',
    ott_provider_name: 'Netflix',
    providers: {
      link: 'https://www.netflix.com/title/80057281',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  },
  {
    id: 93405,
    title: 'Squid Game',
    name: 'Squid Game',
    original_title: '오징어 게임',
    original_language: 'ko',
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits — with deadly high stakes.',
    poster_path: '/dDlGkZf5zT111161jXm7nS52d.jpg',
    backdrop_path: '/qw3J9cNeLioOL0Ukb6ds7OyqY.jpg',
    first_air_date: '2021-09-17',
    vote_average: 7.8,
    vote_count: 14000,
    media_type: 'tv',
    genre_ids: [10759, 9648, 18],
    genres: [{ id: 10759, name: 'Action & Adventure' }, { id: 9648, name: 'Mystery' }, { id: 18, name: 'Drama' }],
    runtime: 55,
    tagline: '45.6 Billion is child\'s play.',
    director: 'Hwang Dong-hyuk',
    trailerKey: 'oqxAJKy0ii4',
    ott_provider_name: 'Netflix',
    providers: {
      link: 'https://www.netflix.com/title/81040344',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/9A1JSVmSxsya9Wi1ilDuxR9iyWE.jpg' }
      ]
    }
  }
];

class TmdbService {
  private apiKey: string;
  private cache = new Map<string, { data: any; expiry: number }>();
  private CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  public getLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  private async fetchFromTmdb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.hasApiKey()) {
      return null;
    }

    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
    // 1. Fast in-memory cache check
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // 2. Persistent SQLite database cache check
    try {
      const dbCached = await prisma.movieMetadataCache.findUnique({
        where: { cacheKey },
      });
      if (dbCached && dbCached.expiresAt > new Date()) {
        const parsed = JSON.parse(dbCached.data);
        this.cache.set(cacheKey, { data: parsed, expiry: dbCached.expiresAt.getTime() });
        return parsed;
      }
    } catch {
      // Continue to network fetch if DB cache lookup encounters an issue
    }

    const query = new URLSearchParams({
      api_key: this.apiKey,
      ...params,
    });
    try {
      const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query.toString()}`);
      if (!res.ok) {
        console.warn(`TMDB API call failed: ${endpoint} Status: ${res.status}`);
        return null;
      }
      const data = await res.json();
      const expiryDate = new Date(Date.now() + this.CACHE_TTL_MS);

      // Store in memory
      this.cache.set(cacheKey, { data, expiry: expiryDate.getTime() });

      // Store persistently in SQLite database
      prisma.movieMetadataCache.upsert({
        where: { cacheKey },
        create: {
          cacheKey,
          data: JSON.stringify(data),
          expiresAt: expiryDate,
        },
        update: {
          data: JSON.stringify(data),
          expiresAt: expiryDate,
        },
      }).catch(err => {
        console.error('Failed to persist TMDB cache to DB:', err);
      });

      return data;
    } catch (err) {
      console.error(`TMDB fetch error on ${endpoint}:`, err);
      return null;
    }
  }

  // Get Featured / Spotlight Title (supports language filter)
  public async getFeatured(language?: string): Promise<MovieItem> {
    if (language && language !== 'all') {
      const langMatches = CURATED_CATALOG.filter(c => c.original_language === language);
      if (langMatches.length > 0) return langMatches[0];
    }
    const list = await this.getTrending('day', 'all');
    return list[0] || CURATED_CATALOG[0];
  }

  // Discover movies with rich language, sorting, genre, year, rating filters & pagination
  public async discoverMovies(options: {
    language?: string;
    sortBy?: string;
    page?: number;
    genreId?: number;
    year?: string;
    minRating?: number;
    region?: string;
  }): Promise<{ results: MovieItem[]; page: number; totalPages: number; totalResults: number }> {
    const page = options.page || 1;
    const lang = options.language && options.language !== 'all' ? options.language : undefined;
    const sortBy = options.sortBy || 'popularity.desc';

    if (this.hasApiKey()) {
      const params: Record<string, string> = {
        page: String(page),
        sort_by: sortBy,
        include_adult: 'false',
      };

      if (lang) {
        params.with_original_language = lang;
      }
      if (options.genreId) {
        params.with_genres = String(options.genreId);
      }
      if (options.year) {
        params.primary_release_year = options.year;
      }
      if (options.minRating) {
        params['vote_average.gte'] = String(options.minRating);
      }
      // If sorting by rating, require minimum 50 votes to prevent single-vote titles
      if (sortBy.includes('vote_average')) {
        params['vote_count.gte'] = '50';
      }

      const data = await this.fetchFromTmdb('/discover/movie', params);
      if (data && data.results) {
        const results = data.results
          .filter((item: any) => item.poster_path || item.backdrop_path)
          .map((item: any) => this.formatTmdbItem(item, 'movie'));

        return {
          results,
          page: data.page || page,
          totalPages: data.total_pages || 1,
          totalResults: data.total_results || results.length,
        };
      }
    }

    // Curated catalog fallback
    let filtered = CURATED_CATALOG.filter(item => {
      const langMatch = !lang || item.original_language === lang;
      const genreMatch = !options.genreId || item.genre_ids.includes(options.genreId);
      const yearMatch = !options.year || (item.release_date || '').startsWith(options.year);
      const ratingMatch = !options.minRating || item.vote_average >= options.minRating;
      return langMatch && genreMatch && yearMatch && ratingMatch;
    });

    // Sorting
    if (sortBy.includes('vote_average')) {
      filtered.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy.includes('primary_release_date')) {
      filtered.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
    } else {
      filtered.sort((a, b) => b.vote_count - a.vote_count);
    }

    const pageSize = 12;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      results: paginated,
      page,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      totalResults: filtered.length,
    };
  }

  // Language-based Rankings (Top 10 / Top 50) with rank field
  public async getRankings(options: {
    language?: string;
    type?: 'top10' | 'top50';
    sortBy?: 'vote_average.desc' | 'popularity.desc' | 'primary_release_date.desc';
    page?: number;
  }): Promise<{ results: MovieItem[]; totalCount: number; language: string; rankType: string }> {
    const lang = options.language || 'ta';
    const limit = options.type === 'top50' ? 50 : 10;
    const sortBy = options.sortBy || 'vote_average.desc';
    const page = options.page || 1;

    let items: MovieItem[] = [];

    if (this.hasApiKey()) {
      const params: Record<string, string> = {
        sort_by: sortBy,
        page: String(page),
        'vote_count.gte': '25',
      };
      if (lang !== 'all') {
        params.with_original_language = lang;
      }
      const data = await this.fetchFromTmdb('/discover/movie', params);
      if (data && data.results) {
        items = data.results.map((item: any) => this.formatTmdbItem(item, 'movie'));
      }
    }

    if (items.length === 0) {
      items = CURATED_CATALOG.filter(c => lang === 'all' || c.original_language === lang);
      if (sortBy.includes('vote_average')) {
        items.sort((a, b) => b.vote_average - a.vote_average);
      } else if (sortBy.includes('primary_release_date')) {
        items.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
      } else {
        items.sort((a, b) => b.vote_count - a.vote_count);
      }
    }

    // Attach 1-based ranks
    const startRank = (page - 1) * 20 + 1;
    const ranked = items.slice(0, limit).map((m, idx) => ({
      ...m,
      rank: startRank + idx,
    }));

    return {
      results: ranked,
      totalCount: ranked.length,
      language: lang,
      rankType: options.type || 'top10',
    };
  }

  // New Theatrical Releases
  public async getTheatricalReleases(language?: string, region = 'IN', page = 1): Promise<{ results: MovieItem[]; page: number; totalPages: number }> {
    const lang = language && language !== 'all' ? language : undefined;

    if (this.hasApiKey()) {
      const params: Record<string, string> = {
        region,
        page: String(page),
      };
      if (lang) params.with_original_language = lang;

      const data = await this.fetchFromTmdb('/movie/now_playing', params);
      if (data && data.results) {
        const results = data.results.map((item: any) => this.formatTmdbItem(item, 'movie'));
        return {
          results,
          page: data.page || page,
          totalPages: data.total_pages || 1,
        };
      }
    }

    // Fallback: recent releases
    const recent = CURATED_CATALOG.filter(c => {
      const isMovie = c.media_type === 'movie';
      const langMatch = !lang || c.original_language === lang;
      return isMovie && langMatch;
    }).sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));

    return {
      results: recent.slice(0, 12),
      page: 1,
      totalPages: 1,
    };
  }

  // New OTT Releases
  public async getNewOttReleases(language?: string, region = 'IN', page = 1): Promise<{ results: MovieItem[]; page: number; totalPages: number }> {
    const lang = language && language !== 'all' ? language : undefined;

    if (this.hasApiKey()) {
      const params: Record<string, string> = {
        page: String(page),
        sort_by: 'primary_release_date.desc',
        watch_region: region,
        with_watch_monetization_types: 'flatrate',
      };
      if (lang) params.with_original_language = lang;

      const data = await this.fetchFromTmdb('/discover/movie', params);
      if (data && data.results) {
        const results = data.results.map((item: any) => this.formatTmdbItem(item, 'movie'));
        return {
          results,
          page: data.page || page,
          totalPages: data.total_pages || 1,
        };
      }
    }

    // Fallback: items with OTT providers
    const ottItems = CURATED_CATALOG.filter(c => {
      const hasProvider = Boolean(c.ott_provider_name || c.providers?.flatrate?.length);
      const langMatch = !lang || c.original_language === lang;
      return hasProvider && langMatch;
    }).sort((a, b) => (b.ott_release_date || b.release_date || '').localeCompare(a.ott_release_date || a.release_date || ''));

    return {
      results: ottItems.slice(0, 12),
      page: 1,
      totalPages: 1,
    };
  }

  // Trending content (all, movie, tv, language filter)
  public async getTrending(timeWindow: 'day' | 'week' = 'day', type: 'all' | 'movie' | 'tv' = 'all', language?: string): Promise<MovieItem[]> {
    const lang = language && language !== 'all' ? language : undefined;

    if (this.hasApiKey()) {
      const data = await this.fetchFromTmdb(`/trending/${type}/${timeWindow}`);
      if (data && data.results && data.results.length > 0) {
        let results = data.results.map((item: any) => this.formatTmdbItem(item));
        if (lang) {
          results = results.filter((item: MovieItem) => item.original_language === lang);
        }
        if (results.length > 0) return results;
      }
    }

    return CURATED_CATALOG.filter(c => {
      const typeMatch = type === 'all' || c.media_type === type;
      const langMatch = !lang || c.original_language === lang;
      return typeMatch && langMatch;
    });
  }

  // Get Popular Movies
  public async getPopularMovies(page = 1, language?: string): Promise<MovieItem[]> {
    const lang = language && language !== 'all' ? language : undefined;

    if (this.hasApiKey()) {
      const params: Record<string, string> = { page: String(page) };
      if (lang) params.with_original_language = lang;
      const endpoint = lang ? '/discover/movie' : '/movie/popular';
      const data = await this.fetchFromTmdb(endpoint, params);
      if (data && data.results) {
        return data.results.map((item: any) => this.formatTmdbItem(item, 'movie'));
      }
    }
    return CURATED_CATALOG.filter(c => c.media_type === 'movie' && (!lang || c.original_language === lang));
  }

  // Get Popular TV Shows
  public async getPopularTv(page = 1, language?: string): Promise<MovieItem[]> {
    const lang = language && language !== 'all' ? language : undefined;

    if (this.hasApiKey()) {
      const params: Record<string, string> = { page: String(page) };
      if (lang) params.with_original_language = lang;
      const endpoint = lang ? '/discover/tv' : '/tv/popular';
      const data = await this.fetchFromTmdb(endpoint, params);
      if (data && data.results) {
        return data.results.map((item: any) => this.formatTmdbItem(item, 'tv'));
      }
    }
    return CURATED_CATALOG.filter(c => c.media_type === 'tv' && (!lang || c.original_language === lang));
  }

  // Get Top Rated
  public async getTopRated(type: 'movie' | 'tv' = 'movie', page = 1, language?: string): Promise<MovieItem[]> {
    const lang = language && language !== 'all' ? language : undefined;

    if (this.hasApiKey()) {
      const params: Record<string, string> = { page: String(page) };
      if (lang) {
        params.with_original_language = lang;
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = '50';
        const data = await this.fetchFromTmdb(`/discover/${type}`, params);
        if (data && data.results) {
          return data.results.map((item: any) => this.formatTmdbItem(item, type));
        }
      } else {
        const data = await this.fetchFromTmdb(`/${type}/top_rated`, params);
        if (data && data.results) {
          return data.results.map((item: any) => this.formatTmdbItem(item, type));
        }
      }
    }
    return CURATED_CATALOG
      .filter(c => c.media_type === type && (!lang || c.original_language === lang))
      .sort((a, b) => b.vote_average - a.vote_average);
  }

  // Universal Search with Language Priority Ranking (e.g. Leo in Tamil prioritizes Leo 2023)
  public async search(
    query: string,
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    page = 1,
    genreId?: number,
    year?: string,
    language?: string
  ): Promise<{ results: MovieItem[]; totalPages: number; totalResults: number; searchedLanguage?: string }> {
    const cleanQuery = query.trim();
    const lang = language && language !== 'all' ? language : undefined;

    if (this.hasApiKey() && cleanQuery) {
      const endpoint = mediaType === 'all' ? '/search/multi' : `/search/${mediaType}`;
      const params: Record<string, string> = { query: cleanQuery, page: String(page) };
      if (year) {
        if (mediaType === 'movie') params.primary_release_year = year;
        if (mediaType === 'tv') params.first_air_date_year = year;
      }
      const data = await this.fetchFromTmdb(endpoint, params);
      if (data && data.results) {
        let results = data.results
          .filter((item: any) => item.media_type !== 'person' && (item.poster_path || item.backdrop_path))
          .map((item: any) => this.formatTmdbItem(item, mediaType === 'all' ? undefined : mediaType));

        if (genreId) {
          results = results.filter((item: MovieItem) => item.genre_ids.includes(genreId));
        }

        // Rank by requested language preference
        if (lang) {
          results.sort((a: MovieItem, b: MovieItem) => {
            const aLangMatch = a.original_language === lang ? 1 : 0;
            const bLangMatch = b.original_language === lang ? 1 : 0;
            if (aLangMatch !== bLangMatch) return bLangMatch - aLangMatch;

            // Prioritize exact title match
            const aTitleExact = (a.title || a.name || '').toLowerCase() === cleanQuery.toLowerCase() ? 1 : 0;
            const bTitleExact = (b.title || b.name || '').toLowerCase() === cleanQuery.toLowerCase() ? 1 : 0;
            if (aTitleExact !== bTitleExact) return bTitleExact - aTitleExact;

            return b.vote_count - a.vote_count;
          });
        }

        return {
          results,
          totalPages: data.total_pages || 1,
          totalResults: data.total_results || results.length,
          searchedLanguage: lang,
        };
      }
    }

    // Curated catalog fallback search with language ranking
    const lowerQuery = cleanQuery.toLowerCase();
    let matches = CURATED_CATALOG.filter(item => {
      const title = (item.title || item.name || '').toLowerCase();
      const origTitle = (item.original_title || '').toLowerCase();
      const overview = (item.overview || '').toLowerCase();
      const director = (item.director || '').toLowerCase();
      const castMatch = (item.cast || []).some(c => c.name.toLowerCase().includes(lowerQuery));

      const titleMatch = title.includes(lowerQuery) || origTitle.includes(lowerQuery) || overview.includes(lowerQuery) || director.includes(lowerQuery) || castMatch;
      const typeMatch = mediaType === 'all' || item.media_type === mediaType;
      const genreMatch = !genreId || item.genre_ids.includes(genreId);
      const yearMatch = !year || (item.release_date || item.first_air_date || '').startsWith(year);

      return (titleMatch || !lowerQuery) && typeMatch && genreMatch && yearMatch;
    });

    // Score and rank matches
    matches.sort((a, b) => {
      if (lang) {
        const aLang = a.original_language === lang ? 1 : 0;
        const bLang = b.original_language === lang ? 1 : 0;
        if (aLang !== bLang) return bLang - aLang;
      }
      const aExact = (a.title || '').toLowerCase() === lowerQuery ? 1 : 0;
      const bExact = (b.title || '').toLowerCase() === lowerQuery ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      return b.vote_average - a.vote_average;
    });

    const pageSize = 12;
    const startIndex = (page - 1) * pageSize;
    const paginated = matches.slice(startIndex, startIndex + pageSize);

    return {
      results: paginated,
      totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
      totalResults: matches.length,
      searchedLanguage: lang,
    };
  }

  // Get Detailed Info with Trailer, Cast & Regional OTT Providers
  public async getDetails(id: number, mediaType: 'movie' | 'tv' = 'movie', region = 'IN'): Promise<MovieItem | null> {
    if (this.hasApiKey()) {
      const endpoint = `/${mediaType}/${id}`;
      const data = await this.fetchFromTmdb(endpoint, {
        append_to_response: 'videos,credits,watch/providers,similar',
      });

      if (data) {
        let trailerKey = '';
        if (data.videos && data.videos.results) {
          const trailer = data.videos.results.find(
            (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          ) || data.videos.results.find((v: any) => v.site === 'YouTube');
          if (trailer) trailerKey = trailer.key;
        }

        let director = '';
        if (data.credits && data.credits.crew) {
          const dir = data.credits.crew.find((c: any) => c.job === 'Director');
          if (dir) director = dir.name;
        }

        const cast = (data.credits?.cast || []).slice(0, 12).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile_path: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : null,
        }));

        const regUpper = region.toUpperCase();
        const providerData = data['watch/providers']?.results?.[regUpper] || data['watch/providers']?.results?.['IN'] || data['watch/providers']?.results?.['US'];
        const providers = providerData ? {
          link: providerData.link,
          flatrate: (providerData.flatrate || []).map((p: any) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: `${TMDB_IMAGE_BASE}/w92${p.logo_path}`,
          })),
          rent: (providerData.rent || []).map((p: any) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: `${TMDB_IMAGE_BASE}/w92${p.logo_path}`,
          })),
          buy: (providerData.buy || []).map((p: any) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: `${TMDB_IMAGE_BASE}/w92${p.logo_path}`,
          })),
        } : undefined;

        return {
          id: data.id,
          title: data.title || data.name,
          name: data.name,
          original_title: data.original_title || data.original_name,
          original_language: data.original_language,
          overview: data.overview,
          poster_path: data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null,
          backdrop_path: data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null,
          release_date: data.release_date,
          first_air_date: data.first_air_date,
          vote_average: Math.round((data.vote_average || 0) * 10) / 10,
          vote_count: data.vote_count,
          media_type: mediaType,
          genre_ids: (data.genres || []).map((g: any) => g.id),
          genres: data.genres,
          runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : 0),
          tagline: data.tagline,
          director,
          cast,
          trailerKey,
          providers,
        };
      }
    }

    const found = CURATED_CATALOG.find(c => c.id === Number(id));
    if (found) {
      return {
        ...found,
        poster_path: found.poster_path ? (found.poster_path.startsWith('http') ? found.poster_path : `${TMDB_IMAGE_BASE}/w500${found.poster_path}`) : null,
        backdrop_path: found.backdrop_path ? (found.backdrop_path.startsWith('http') ? found.backdrop_path : `${TMDB_IMAGE_BASE}/original${found.backdrop_path}`) : null,
      };
    }

    return null;
  }

  // Get Watch Providers for a title and region
  public async getWatchProviders(id: number, mediaType: 'movie' | 'tv' = 'movie', region = 'IN') {
    if (this.hasApiKey()) {
      const data = await this.fetchFromTmdb(`/${mediaType}/${id}/watch/providers`);
      if (data && data.results) {
        const reg = region.toUpperCase();
        return data.results[reg] || data.results['IN'] || data.results['US'] || null;
      }
    }
    const item = CURATED_CATALOG.find(c => c.id === Number(id));
    return item?.providers || null;
  }

  private formatTmdbItem(item: any, fallbackType?: 'movie' | 'tv'): MovieItem {
    const media_type = item.media_type || fallbackType || (item.title ? 'movie' : 'tv');
    return {
      id: item.id,
      title: item.title || item.name,
      name: item.name,
      original_title: item.original_title || item.original_name,
      original_language: item.original_language,
      overview: item.overview,
      poster_path: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
      backdrop_path: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: Math.round((item.vote_average || 0) * 10) / 10,
      vote_count: item.vote_count || 0,
      media_type,
      genre_ids: item.genre_ids || [],
    };
  }
}

export const tmdbService = new TmdbService();
