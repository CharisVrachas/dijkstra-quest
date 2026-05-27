/**
 * Dijkstra Quest – internationalisation module
 * Supports: el (Greek), en (English)
 * Usage:
 *   i18n.setLang('en');
 *   i18n.t('nav.login');          // → 'Login'
 *   i18n.apply();                 // update all [data-i18n] elements
 */
const i18n = (() => {
  const T = {
    el: {
      // Navigation
      'nav.title':        'Dijkstra Quest',
      'nav.login':        'Σύνδεση',
      'nav.register':     'Εγγραφή',
      'nav.logout':       'Αποσύνδεση',
      'nav.dashboard':    'Αρχική',
      'nav.play':         'Αγώνας',
      'nav.training':     'Εκπαίδευση',
      'nav.leaderboard':  'Βαθμολογία',
      'nav.lang':         'EN',

      // Landing
      'home.hero.title':      'Dijkstra Quest',
      'home.hero.sub':        'Βρες τη συντομότερη διαδρομή στην πόλη!',
      'home.hero.desc':       'Επίλεξε δρόμους σε τυχαία οδικά δίκτυα, πλοηγήσου στον προορισμό σου και ανέβα στη βαθμολογία.',
      'home.cta.play':        'Ξεκίνα πλοήγηση',
      'home.cta.learn':       'Μάθε περισσότερα',
      'home.feat.graph.t':    'Τυχαία Οδικά Δίκτυα',
      'home.feat.graph.d':    'Κάθε γύρος χρησιμοποιεί νέο τυχαίο χάρτη πόλης — άπειρες διαδρομές!',
      'home.feat.dijk.t':     'Αλγόριθμος Dijkstra',
      'home.feat.dijk.d':     'Παρακολούθησε βήμα-βήμα πώς ο αλγόριθμος βρίσκει τη συντομότερη διαδρομή.',
      'home.feat.rank.t':     'Βαθμολογία',
      'home.feat.rank.d':     'Συγκρίνεσαι με τους top-10 παίκτες — ο χρόνος μετράει!',

      // About section (index.html)
      'home.demo.title':   'Δες ένα παράδειγμα',
      'home.demo.desc':    'Η μωβ διαδρομή Σύνταγμα → Μοναστηράκι → Θησείο → Ακρόπολη είναι η συντομότερη (3.1 km). Αυτό ακριβώς πρέπει να βρεις σε κάθε γύρο!',
      'home.demo.sp':      'Συντομότερη διαδρομή',

      'home.about.title':  'Πώς λειτουργεί το παιχνίδι;',
      'home.about.p1':     'Σου δίνεται ένα τυχαίο οδικό δίκτυο με κόμβους (γειτονιές) και αποστάσεις σε km. Στόχος σου είναι να επιλέξεις τους δρόμους που σχηματίζουν τη συντομότερη διαδρομή από την αφετηρία στον προορισμό.',
      'home.about.p2':     'Μετά την υποβολή μπορείς να δεις πώς ο αλγόριθμος Dijkstra βρίσκει αυτόματα τη βέλτιστη διαδρομή, βήμα-βήμα.',
      'home.about.cta':    'Ξεκίνα τώρα',
      'home.step1.t':      'Δημιούργησε οδικό δίκτυο',
      'home.step1.d':      'Επίλεξε δυσκολία και δημιούργησε τυχαίο δίκτυο γειτονιών.',
      'home.step2.t':      'Επέλεξε δρόμους',
      'home.step2.d':      'Κλίκαρε στις ακμές για να χτίσεις τη διαδρομή σου.',
      'home.step3.t':      'Δες τη λύση Dijkstra',
      'home.step3.d':      'Παρακολούθησε τον αλγόριθμο να βρίσκει τη βέλτιστη διαδρομή βήμα-βήμα.',

      // Auth
      'auth.username':        'Όνομα χρήστη',
      'auth.email':           'Email',
      'auth.password':        'Κωδικός',
      'auth.login.title':     'Σύνδεση',
      'auth.login.btn':       'Σύνδεση',
      'auth.login.link':      'Δεν έχεις λογαριασμό; Εγγραφή',
      'auth.register.title':  'Εγγραφή',
      'auth.register.btn':    'Εγγραφή',
      'auth.register.link':   'Έχεις λογαριασμό; Σύνδεση',

      // Dashboard
      'dash.welcome':         'Καλωσήρθες,',
      'dash.subtitle':        'Τι θέλεις να κάνεις σήμερα;',
      'dash.card.play.t':     'Αγώνας',
      'dash.card.play.d':     'Βρες τη συντομότερη διαδρομή στο οδικό δίκτυο. Ο χρόνος μετράει!',
      'dash.card.play.btn':   'Παίξε',
      'dash.card.train.t':    'Εκπαίδευση',
      'dash.card.train.d':    'Εξερεύνησε χάρτες και τον αλγόριθμο GPS χωρίς χρονόμετρο και πόντους.',
      'dash.card.train.btn':  'Εκπαίδευση',
      'dash.card.rank.t':     'Βαθμολογία',
      'dash.card.rank.d':     'Δες τους top-10 παίκτες και τους προσωπικούς σου πόντους.',
      'dash.card.rank.btn':   'Βαθμολογία',
      'dash.stats.total':     'Σύνολο πόντων',
      'dash.stats.best':      'Καλύτερος γύρος',
      'dash.stats.games':     'Παιχνίδια',
      'dash.stats.time':      'Καλύτερος χρόνος',
      'dash.history':         'Ιστορικό γύρων',
      'dash.no.history':      'Δεν έχεις παίξει ακόμα.',
      'dash.date':            'Ημερομηνία',

      // Game setup
      'game.setup.title':     'Νέος Αγώνας',
      'game.diff.title':      'Δυσκολία',
      'game.diff.beginner':   'Αρχάριος',
      'game.diff.normal':     'Κανονικό',
      'game.diff.advanced':   'Προχωρημένο',
      'game.diff.custom':     'Προσαρμοσμένο',
      'game.param.n':         'Τοποθεσίες (n)',
      'game.param.p':         'Πυκνότητα δρόμων (p)',
      'game.param.wmin':      'Ελάχ. απόσταση',
      'game.param.wmax':      'Μέγ. απόσταση',
      'game.generate.btn':    'Δημιουργία οδικού δικτύου',
      'game.saved.title':     'Αποθηκευμένοι χάρτες',
      'game.saved.load':      'Φόρτωση',

      // Game HUD
      'game.timer.start':     'Ξεκίνα χρονόμετρο',
      'game.already.submitted': 'Έχεις ήδη υποβάλει!',
      'game.select.edge':     'Επίλεξε τουλάχιστον έναν δρόμο.',
      'game.saved.ok':        'Αποθηκεύτηκε!',
      'game.correct.toast':   'πόντοι! Μπράβο!',
      'game.source':          'Αφετηρία',
      'game.dest':            'Προορισμός',
      'game.weight':          'Απόσταση διαδρομής (km)',
      'game.timer':           'Χρόνος',
      'game.edges.sel':       'Επιλεγμένοι δρόμοι',
      'game.hint':            'Κάνε κλικ στους δρόμους για να χτίσεις τη διαδρομή σου.',
      'game.submit.btn':      'Υποβολή',
      'game.reset.btn':       'Επαναφορά',
      'game.save.btn':        'Αποθήκευση χάρτη',
      'game.save.name':       'Όνομα χάρτη',
      'game.dijkstra.btn':    'Δες λύση GPS (Dijkstra)',

      // Result
      'res.correct':          '✓ Βρήκες τη συντομότερη διαδρομή!',
      'res.wrong':            '✗ Δεν είναι η συντομότερη. Δες τη σωστή παρακάτω.',
      'res.points':           'Πόντοι που κερδίσατε',
      'res.sp.weight':        'Συνολική απόσταση',
      'res.sp.path':          'Συντομότερη διαδρομή',
      'res.new.btn':          'Νέα διαδρομή',
      'res.replay.btn':       'Ξανά αυτόν τον χάρτη',

      // Dijkstra steps modal
      'dijk.modal.title':     'GPS Βήμα-βήμα — Αλγόριθμος Dijkstra',
      'dijk.step':            'Βήμα',
      'dijk.of':              'από',
      'dijk.next.btn':        'Επόμενο βήμα',
      'dijk.prev.btn':        'Προηγούμενο',
      'dijk.auto.btn':        'Αυτόματο',
      'dijk.stop.btn':        'Παύση',
      'dijk.done':            'Η πλοήγηση ολοκληρώθηκε.',
      'dijk.dist.table':      'Πίνακας αποστάσεων (km)',
      'dijk.desc':            'Περιγραφή',
      'dijk.col.node':        'Τοποθεσία',
      'dijk.col.prev':        'Προηγ.',

      // Leaderboard
      'lb.title':             'Βαθμολογία — Top 10',
      'lb.rank':              '#',
      'lb.player':            'Παίκτης',
      'lb.total':             'Σύνολο πόντων',
      'lb.best':              'Καλύτερος γύρος',
      'lb.games':             'Παιχνίδια',
      'lb.empty':             'Δεν υπάρχουν ακόμα πόντοι.',

      // Training
      'train.title':          'Λειτουργία Εκπαίδευσης',
      'train.sub':            'Εξερεύνησε χάρτες χωρίς πίεση χρόνου ή βαθμολόγησης.',
      'train.hint':           '💡 Συμβουλή: μετά την υποβολή μπορείς να δεις βήμα-βήμα πώς ο αλγόριθμος βρίσκει τη διαδρομή.',
      'train.no.timer':       '— χωρίς χρονόμετρο',

      // Common
      'footer.uni':           'CEID, Πανεπιστήμιο Πατρών',

      'loading':              'Φόρτωση…',
      'error.generic':        'Κάτι πήγε λάθος. Δοκίμασε ξανά.',
      'sec':                  'δευτ.',
    },

    en: {
      'nav.title':        'Dijkstra Quest',
      'nav.login':        'Login',
      'nav.register':     'Register',
      'nav.logout':       'Logout',
      'nav.dashboard':    'Home',
      'nav.play':         'Race',
      'nav.training':     'Training',
      'nav.leaderboard':  'Scores',
      'nav.lang':         'ΕΛ',

      'home.hero.title':      'Dijkstra Quest',
      'home.hero.sub':        'Find the shortest route through the city!',
      'home.hero.desc':       'Select roads on random city maps, navigate to your destination, and climb the leaderboard.',
      'home.cta.play':        'Start navigating',
      'home.cta.learn':       'Learn more',
      'home.feat.graph.t':    'Random Road Networks',
      'home.feat.graph.d':    'Every round uses a fresh random city map — endless routes to discover!',
      'home.feat.dijk.t':     "Dijkstra's Algorithm",
      'home.feat.dijk.d':     'Watch step by step how the algorithm finds the shortest route.',
      'home.feat.rank.t':     'Scores',
      'home.feat.rank.d':     'Compete with the top-10 players — time matters!',

      // About section (index.html)
      'home.demo.title':   'See an example',
      'home.demo.desc':    'The purple route Syntagma → Monastiraki → Thisio → Acropolis is the shortest (3.1 km). That\'s exactly what you need to find each round!',
      'home.demo.sp':      'Shortest route',

      'home.about.title':  'How does the game work?',
      'home.about.p1':     'You are given a random road network with nodes (neighbourhoods) and distances in km. Your goal is to select the roads that form the shortest route from the start to the destination.',
      'home.about.p2':     "After submitting, you can watch Dijkstra's algorithm automatically find the optimal route, step by step.",
      'home.about.cta':    'Start now',
      'home.step1.t':      'Create road network',
      'home.step1.d':      'Select difficulty and generate a random neighbourhood network.',
      'home.step2.t':      'Select roads',
      'home.step2.d':      'Click on edges to build your route.',
      'home.step3.t':      'See Dijkstra solution',
      'home.step3.d':      'Watch the algorithm find the optimal route step by step.',

      'auth.username':        'Username',
      'auth.email':           'Email',
      'auth.password':        'Password',
      'auth.login.title':     'Login',
      'auth.login.btn':       'Login',
      'auth.login.link':      'No account? Register',
      'auth.register.title':  'Register',
      'auth.register.btn':    'Register',
      'auth.register.link':   'Have an account? Login',

      'dash.welcome':         'Welcome,',
      'dash.subtitle':        'What would you like to do today?',
      'dash.card.play.t':     'Race',
      'dash.card.play.d':     'Find the shortest route in the road network. The clock is ticking!',
      'dash.card.play.btn':   'Play',
      'dash.card.train.t':    'Training',
      'dash.card.train.d':    'Explore city maps and the GPS algorithm — no timer, no scoring.',
      'dash.card.train.btn':  'Train',
      'dash.card.rank.t':     'Scores',
      'dash.card.rank.d':     'See the top-10 players and your personal stats.',
      'dash.card.rank.btn':   'Scores',
      'dash.stats.total':     'Total points',
      'dash.stats.best':      'Best round',
      'dash.stats.games':     'Games played',
      'dash.stats.time':      'Best time',
      'dash.history':         'Round history',
      'dash.no.history':      "You haven't played yet.",
      'dash.date':            'Date',

      'game.setup.title':     'New Race',
      'game.diff.title':      'Difficulty',
      'game.diff.beginner':   'Beginner',
      'game.diff.normal':     'Normal',
      'game.diff.advanced':   'Advanced',
      'game.diff.custom':     'Custom',
      'game.param.n':         'Locations (n)',
      'game.param.p':         'Road density (p)',
      'game.param.wmin':      'Min distance',
      'game.param.wmax':      'Max distance',
      'game.generate.btn':    'Generate road network',
      'game.saved.title':     'Saved maps',
      'game.saved.load':      'Load',

      'game.timer.start':     'Start timer',
      'game.already.submitted': "You've already submitted!",
      'game.select.edge':     'Select at least one road.',
      'game.saved.ok':        'Saved!',
      'game.correct.toast':   'points! Well done!',
      'game.source':          'Start',
      'game.dest':            'Destination',
      'game.weight':          'Route distance (km)',
      'game.timer':           'Time',
      'game.edges.sel':       'Selected roads',
      'game.hint':            'Click roads to build your route.',
      'game.submit.btn':      'Submit',
      'game.reset.btn':       'Reset',
      'game.save.btn':        'Save map',
      'game.save.name':       'Map name',
      'game.dijkstra.btn':    'Show GPS solution (Dijkstra)',

      'res.correct':          '✓ You found the shortest route!',
      'res.wrong':            '✗ Not the shortest route. See below.',
      'res.points':           'Points earned',
      'res.sp.weight':        'Shortest distance',
      'res.sp.path':          'Shortest route',
      'res.new.btn':          'New route',
      'res.replay.btn':       'Replay this map',

      'dijk.modal.title':     'GPS Step-by-Step — Dijkstra',
      'dijk.step':            'Step',
      'dijk.of':              'of',
      'dijk.next.btn':        'Next step',
      'dijk.prev.btn':        'Previous',
      'dijk.auto.btn':        'Auto-play',
      'dijk.stop.btn':        'Pause',
      'dijk.done':            'Navigation complete.',
      'dijk.dist.table':      'Distance table (km)',
      'dijk.desc':            'Description',
      'dijk.col.node':        'Location',
      'dijk.col.prev':        'Prev.',

      'lb.title':             'Scores — Top 10',
      'lb.rank':              '#',
      'lb.player':            'Player',
      'lb.total':             'Total points',
      'lb.best':              'Best round',
      'lb.games':             'Games',
      'lb.empty':             'No scores yet.',

      'train.title':          'Training Mode',
      'train.sub':            'Explore city maps without time pressure or scoring.',
      'train.hint':           '💡 Tip: after submitting you can watch Dijkstra find the shortest route step by step.',
      'train.no.timer':       '— no timer',

      'footer.uni':           'CEID, University of Patras',

      'loading':              'Loading…',
      'error.generic':        'Something went wrong. Please try again.',
      'sec':                  's',
    }
  };

  let lang = localStorage.getItem('dq_lang') || 'el';

  return {
    t(key) {
      return (T[lang] && T[lang][key]) || (T['en'][key]) || key;
    },
    setLang(l) {
      if (!T[l]) return;
      lang = l;
      localStorage.setItem('dq_lang', l);
      this.apply();
    },
    getLang() { return lang; },
    toggle() { this.setLang(lang === 'el' ? 'en' : 'el'); },
    apply() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = this.t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      });
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = this.t(el.dataset.i18nTitle);
      });
      // Update <html lang>
      document.documentElement.lang = lang;
    }
  };
})();
