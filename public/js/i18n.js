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
      'home.hero.desc':       'Επέλεξε δρόμους σε τυχαία οδικά δίκτυα, πλοηγήσου στον προορισμό σου και ανέβα στην κατάταξη.',
      'home.cta.play':        'Ξεκίνα πλοήγηση',
      'home.cta.learn':       'Μάθε περισσότερα',
      'home.feat.graph.t':    'Τυχαία Οδικά Δίκτυα',
      'home.feat.graph.d':    'Κάθε γύρος χρησιμοποιεί νέο τυχαίο χάρτη πόλης — άπειρες διαδρομές!',
      'home.feat.dijk.t':     'GPS — Αλγόριθμος Dijkstra',
      'home.feat.dijk.d':     'Βήμα-βήμα οπτικοποίηση του τρόπου που η GPS βρίσκει τη συντομότερη διαδρομή.',
      'home.feat.rank.t':     'Παγκόσμια Κατάταξη',
      'home.feat.rank.d':     'Συγκρίνεσαι με τους top-10 πλοηγητές — ο χρόνος μετράει!',
      'home.feat.bi.t':       'Δίγλωσσο',
      'home.feat.bi.d':       'Διαθέσιμο σε Ελληνικά και Αγγλικά.',

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
      'game.select.edge':     'Επέλεξε τουλάχιστον έναν δρόμο.',
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
      'train.hint':           '💡 Συμβουλή: μετά την υποβολή μπορείς να δεις βήμα-βήμα πώς η GPS βρίσκει τη διαδρομή.',

      // Common
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
      'home.feat.dijk.t':     'GPS — Dijkstra\'s Algorithm',
      'home.feat.dijk.d':     'Step-by-step visualisation showing how GPS finds the shortest route.',
      'home.feat.rank.t':     'Global Leaderboard',
      'home.feat.rank.d':     'Compete with the top-10 navigators — time matters!',
      'home.feat.bi.t':       'Bilingual',
      'home.feat.bi.d':       'Available in Greek and English.',

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

      'lb.title':             'Scores — Top 10',
      'lb.rank':              '#',
      'lb.player':            'Player',
      'lb.total':             'Total points',
      'lb.best':              'Best round',
      'lb.games':             'Games',
      'lb.empty':             'No scores yet.',

      'train.title':          'Training Mode',
      'train.sub':            'Explore city maps without time pressure or scoring.',
      'train.hint':           '💡 Tip: after submitting you can watch GPS (Dijkstra) find the shortest route step by step.',

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
