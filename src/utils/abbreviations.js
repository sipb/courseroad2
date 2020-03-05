const abbreviations = {
	'and': '&',
	'i': '1',
	'ii': '2',
	'iii': '3',
	'iv': '4',
	'v': '5',
    'vi': '6',
    'undergraduate': 'undergrad',
    'materials': 'mat',
    'computer': 'comp',

	'special': 'spec',
	'engineering': 'engin',
	'subject': 'subj',
	'science': 'sci',
	'introduction': 'intro',
	'advanced': 'adv',
	'research': 'res',
	'technology': 'tech',
	'management': 'managem',
	'studies': 'stud',
	'biology': 'bio',
	'analysis': 'anal',
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
	'philosophy': 'philos',
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
	'introductory': 'introd',
	'anthropology': 'anthropol',
	'industrial': 'industr',
	'present': 'pres',
	'east': 'e',
	'mathematical': 'math',
	'latin': 'lat',
	'japanese': 'jap',
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
	'work': 'wk',
	'africa': 'afr',
	'physiology': 'physiol',
	'portuguese': 'port',
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
	'good': 'gd',
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
	'magnetic': 'magn',
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
	'astronomy': 'astron',
	'psychology': 'psychol',
	'method': 'meth',
	'communications': 'communic',
	'shakespeare': 'shaks',
	'optics': 'opt',
	'ecological': 'ecol',
	'industry': 'ind',
	'construction': 'constr',
	'college': 'coll',
	'discovery': 'discov',
	'india': 'ind',
	'aerodynamics': 'aerodynam',
	'past': 'pa',
	'african': 'afr',
	'animals': 'anim',
	'literary': 'lit',
	'musical': 'mus',
	'memoir': 'mem',
	'metallurgy': 'metall',
	'inorganic': 'inorg',
	'biochemistry': 'biochem',
	'pathology': 'pathol',
	'philosophical': 'philos',
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
	'word': 'wd',
	'ceramics': 'ceram',
	'selection': 'select',
	'archaeology': 'archaeol',
	'oceanographic': 'oceanogr',
	'sociology': 'sociol',
	'geographic': 'geogr',
	'petrology': 'petrol',
	'record': 'rec',
	'seismology': 'seismol',
	'technological': 'technol',
	'essential': 'essent',
	'analytical': 'analyt',
	'navigation': 'navig',
	'historical': 'hist',
	'between': 'betw',
	'russia': 'russ',
	'year': 'yr',
	'analytic': 'analyt',
	'cryptography': 'cryptogr',
	'religion': 'relig',
	'translation': 'transl',
	'intellectual': 'intellect',
	'books': 'bks',
	'authors': 'auth',
	'museum': 'mus',
	'metaphysics': 'metaph',
	'evolutionary': 'evol',
	'affairs': 'aff',
	'reproductive': 'reprod',
	'concrete': 'concr',
	'limnology': 'limnol',
	'pharmaceutical': 'pharmaceut',
	'metropolis': 'metrop',
	'representing': 'repr',
	'against': 'agst',
	'property': 'prop',
	'scientific': 'sci',
	'great': 'gt',
	'terrestrial': 'terrestr',
	'lectures': 'lect',
	'magnetism': 'magn',
	'geological': 'geol',
	'influence': 'infl',
	'junior': 'jun',
	'constitutional': 'constit',
	'doctrine': 'doctr',
	'king': 'k',
	'traditional': 'trad',
	'works': 'wks',
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
	'book': 'bk',
	'apocalyptic': 'apoc',
	'dissertation': 'diss',
	'morphology': 'morphol',
	'furniture': 'furnit',
	'application': 'applic',
	'psychological': 'psychol',
	'imagination': 'imag',
	'archives': 'arch',
	'agriculture': 'agric',
	'pharmacology': 'pharmacol',
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
	'arithmetic': 'arithm',
	'instruction': 'instr',
	'england': 'eng',
	'calligraphy': 'calligr',
	'expository': 'expos',
	'brazilian': 'braz',
	'lines': 'll',
	'west': 'w',
	'survey': 'surv',
	'tradition': 'trad',
	'saints': 'ss',
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
	'certificate': 'certif',
	'exercise': 'exerc',
	'physiological': 'physiol',
	'company': 'comp'
};

export {abbreviations};