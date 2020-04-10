// Abbreviations starting with '|' don't receive a delimeter (eg. '.') after them
const nonAbbreviator = '|';
const abbreviations = {
  'and': nonAbbreviator + '&',
  'i': nonAbbreviator + '1',
  'ii': nonAbbreviator + '2',
  'iii': nonAbbreviator + '3',
  'iv': nonAbbreviator + '4',
  'v': nonAbbreviator + '5',
  'vi': nonAbbreviator + '6',
  'undergraduate': 'undergrad',
  'materials': 'mat',
  'computer': 'comp',
  'special': 'spec',
  'engineering': 'eng',
  'subject': 'subj',
  'science': 'sci',
  'introduction': 'intro',
  'advanced': 'adv',
  'research': 'res',
  'technology': 'tech',
  'management': 'mgmt',
  'studies': 'stud',
  'biology': 'bio',
  'development': 'dev',
  'history': 'hist',
  'economics': 'econ',
  'laboratory': 'lab',
  'principles': 'princ',
  'methods': 'meth',
  'sciences': 'sci',
  'architecture': 'archit',
  'writing': 'writ',
  'practice': 'pract',
  'chemistry': 'chem',
  'chemical': 'chem',
  'electrical': 'elec',
  'society': 'soc',
  'fundamentals': 'fund',
  'mechanics': 'mech',
  'biological': 'bio',
  'modern': 'mod',
  'literature': 'lit',
  'music': 'mus',
  'communication': 'communic',
  'political': 'poli',
  'politics': 'poli',
  'nuclear': 'nuc',
  'american': 'amer',
  'mechanical': 'mech',
  'public': 'pub',
  'applications': 'applic',
  'applied': 'appl',
  'system': 'syst',
  'oceanography': 'oceanogr',
  'international': 'internat',
  'philosophy': 'phil',
  'language': 'lang',
  'medical': 'med',
  'comparative': 'compar',
  'from': 'fr',
  'economic': 'econ',
  'mathematics': 'math',
  'building': 'build',
  'structural': 'struct',
  'medicine': 'med',
  'structure': 'struct',
  'geology': 'geol',
  'statistical': 'statist',
  'french': 'fr',
  'probability': 'prob',
  'spanish': 'span',
  'evolution': 'evol',
  'foundations': 'found',
  'experimental': 'exper',
  'selected': 'sel',
  'practical': 'pract',
  'manufacturing': 'manuf',
  'machine': 'mach',
  'america': 'amer',
  'architectural': 'archit',
  'contemporary': 'contemp',
  'ancient': 'anc',
  'introductory': 'intro',
  'anthropology': 'anthropol',
  'industrial': 'industr',
  'present': 'pres',
  'east': 'e',
  'mathematical': 'math',
  'latin': 'lat',
  'japanese': 'jp',
  'calculus': 'calc',
  'ecology': 'ecol',
  'regular': 'reg',
  'geometry': 'geom',
  'organic': 'org',
  'product': 'prod',
  'naval': 'nav',
  'german': 'ger',
  'composition': 'compos',
  'photography': 'photogr',
  'intelligence': 'intell',
  'microbiology': 'microbiol',
  'disease': 'dis',
  'theoretical': 'theoret',
  'future': 'fut',
  'education': 'educ',
  'work': 'wrk',
  'africa': 'afr',
  'physiology': 'physiol',
  'portuguese': 'pt',
  'linguistics': 'ling',
  'properties': 'prop',
  'clinical': 'clin',
  'popular': 'pop',
  'century': 'cent',
  'criticism': 'crit',
  'machines': 'mach',
  'russian': 'russ',
  'revolution': 'revol',
  'languages': 'langs',
  'conflict': 'confl',
  'classical': 'class',
  'natural': 'nat',
  'medieval': 'med',
  'aeronautics': 'aeronaut',
  'astronautics': 'astronaut',
  'algebra': 'alg',
  'narrative': 'narrat',
  'hydrology': 'hydrol',
  'general': 'gen',
  'artificial': 'artific',
  'measurement': 'measurem',
  'linguistic': 'ling',
  'critical': 'crit',
  'south': 's',
  'rhetoric': 'rhet',
  'magnetic': 'mag',
  'related': 'rel',
  'diseases': 'dis',
  'school': 'sch',
  'spectroscopy': 'spectrosc',
  'educational': 'educ',
  'investment': 'investm',
  'military': 'milit',
  'western': 'west',
  'advances': 'adv',
  'biochemical': 'biochem',
  'technical': 'techn',
  'immunology': 'immunol',
  'inquiry': 'inq',
  'electric': 'electr',
  'knowledge': 'knowl',
  'geometric': 'geom',
  'objects': 'obj',
  'phonology': 'phonol',
  'exploration': 'explor',
  'problem': 'probl',
  'elements': 'elem',
  'astronomy': 'astro',
  'psychology': 'psych',
  'method': 'meth',
  'communications': 'communic',
  'optics': 'opt',
  'ecological': 'ecol',
  'industry': 'ind',
  'construction': 'constr',
  'college': 'coll',
  'discovery': 'discov',
  'india': 'ind',
  'aerodynamics': 'aerodynam',
  'african': 'afr',
  'animals': 'anim',
  'literary': 'lit',
  'musical': 'mus',
  'memoir': 'mem',
  'metallurgy': 'metall',
  'inorganic': 'inorg',
  'biochemistry': 'biochem',
  'pathology': 'pathol',
  'philosophical': 'phil',
  'products': 'prod',
  'archaeological': 'archaeol',
  'geomorphology': 'geomorphol',
  'series': 'ser',
  'congress': 'congr',
  'number': 'no',
  'element': 'elem',
  'family': 'fam',
  'academic': 'acad',
  'english': 'eng',
  'conversation': 'conversat',
  'north': 'n',
  'anatomy': 'anat',
  'ceramics': 'ceram',
  'selection': 'select',
  'archaeology': 'archaeol',
  'oceanographic': 'oceanogr',
  'sociology': 'sociol',
  'geographic': 'geogr',
  'petrology': 'petrol',
  'record': 'rec',
  'seismology': 'seismol',
  'technological': 'techn',
  'essential': 'essent',
  'analytical': 'analyt',
  'navigation': 'navig',
  'historical': 'hist',
  'between': 'btw',
  'russia': 'ru',
  'year': 'yr',
  'analytic': 'analyt',
  'cryptography': 'cryptogr',
  'religion': 'relig',
  'translation': 'transl',
  'intellectual': 'intellect',
  'authors': 'auth',
  'museum': 'mus',
  'metaphysics': 'metaph',
  'evolutionary': 'evol',
  'affairs': 'aff',
  'reproductive': 'reprod',
  'concrete': 'concr',
  'limnology': 'limnol',
  'pharmaceutical': 'pharma',
  'metropolis': 'metrop',
  'representing': 'repr',
  'against': 'agst',
  'property': 'prop',
  'scientific': 'sci',
  'terrestrial': 'terrestr',
  'lectures': 'lect',
  'magnetism': 'mag',
  'geological': 'geol',
  'influence': 'infl',
  'junior': 'jun',
  'constitutional': 'constit',
  'traditional': 'trad',
  'works': 'wrks',
  'indian': 'ind',
  'invention': 'invent',
  'pronunciation': 'pronunc',
  'italian': 'ital',
  'roman': 'rom',
  'british': 'brit',
  'interpretation': 'interpr',
  'chamber': 'chamb',
  'autobiography': 'autobiogr',
  'essay': 'ess',
  'biography': 'biogr',
  'apocalyptic': 'apoc',
  'dissertation': 'diss',
  'morphology': 'morphol',
  'furniture': 'furnit',
  'application': 'applic',
  'psychological': 'psych',
  'imagination': 'imag',
  'archives': 'arch',
  'agriculture': 'agric',
  'pharmacology': 'pharma',
  'inventions': 'invent',
  'evaluation': 'eval',
  'assembly': 'assemb',
  'geography': 'geogr',
  'transactions': 'trans',
  'southern': 's',
  'geologic': 'geol',
  'origin': 'orig',
  'observations': 'observ',
  'hydraulic': 'hydraul',
  'tropical': 'trop',
  'meteorology': 'meteorol',
  'commerce': 'comm',
  'collective': 'collect',
  'prediction': 'predict',
  'central': 'cent',
  'fundamental': 'fund',
  'journal': 'jrnl',
  'article': 'art',
  'reflection': 'refl',
  'review': 'rev',
  'lecture': 'lect',
  'several': 'sev',
  'measure': 'meas',
  'arithmetic': 'arith',
  'instruction': 'instr',
  'england': 'eng',
  'calligraphy': 'calligr',
  'expository': 'expos',
  'brazilian': 'br',
  'west': 'w',
  'survey': 'surv',
  'tradition': 'trad',
  'publication': 'publ',
  'republic': 'repub',
  'original': 'orig',
  'accounts': 'accts',
  'antiquity': 'antiq',
  'london': 'lond',
  'grammar': 'gram',
  'familiar': 'famil',
  'palaeontology': 'palaeontol',
  'meeting': 'mtg',
  'assemblies': 'assemb',
  'march': 'mar',
  'vegetable': 'veg',
  'intelligent': 'intell',
  'experiment': 'exper',
  'orders': 'ord',
  'animal': 'anim',
  'nervous': 'nerv',
  'electricity': 'electr',
  'certificate': 'cert',
  'exercise': 'exerc',
  'physiological': 'physiol',
  'company': 'comp'
};

export { abbreviations, nonAbbreviator };
